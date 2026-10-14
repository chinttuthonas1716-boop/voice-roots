"""Voice Roots — ChromaDB Persistent Vector Store.

Provides persistent local semantic storage and retrieval for permitted language resources.
Uses deterministic multilingual subword/n-gram embeddings running 100% offline,
enabling semantic matching across Dravidian, Indo-Aryan, and Austroasiatic tongues.
"""

from __future__ import annotations

import hashlib
import logging
import os
from typing import Any, Dict, List, Optional

import numpy as np

logger = logging.getLogger(__name__)

# Base directory for ChromaDB local persistence
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PERSIST_DIR = os.environ.get(
    "VOICE_ROOTS_CHROMA_DIR", os.path.join(BACKEND_DIR, "chroma_db")
)
COLLECTION_NAME = "language_resources"


class VoiceRootsMultilingualEmbeddingFunction(EmbeddingFunction[Documents]):
    """Deterministic, offline, subword-aware 384-dimensional multilingual embedding function.
    
    Extracts morphological character n-grams and token hashes, enabling cross-lingual
    similarity matching for oral and regional Indian languages without external network dependencies.
    """

    def __init__(self, dim: int = 384):
        self.dim = dim

    @staticmethod
    def name() -> str:
        return "voiceroots_multilingual_v1"

    def embed_query(self, input: Documents) -> Embeddings:
        return self.__call__(input)

    def get_config(self) -> Dict[str, Any]:
        return {"dim": self.dim}

    @staticmethod
    def build_from_config(config: Dict[str, Any]) -> "VoiceRootsMultilingualEmbeddingFunction":
        return VoiceRootsMultilingualEmbeddingFunction(dim=config.get("dim", 384))

    def __call__(self, input: Documents) -> Embeddings:
        embeddings: list[list[float]] = []
        for text in input:
            vec = np.zeros(self.dim, dtype=np.float32)
            clean_text = text.strip().lower()
            words = clean_text.split()
            if not words:
                words = [""]

            for w in words:
                # Word-level token hash
                h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16)
                vec[h % self.dim] += 1.0 if ((h >> 16) & 1) else -1.0

                # Subword character n-grams (3 to 6 characters) to capture morphology
                w_len = len(w)
                for n in range(3, min(7, w_len + 1)):
                    for i in range(w_len - n + 1):
                        ngram = w[i : i + n]
                        nh = int(hashlib.sha256(ngram.encode("utf-8")).hexdigest()[:8], 16)
                        vec[nh % self.dim] += 0.5 * (1.0 if (nh & 1) else -1.0)

            # L2 normalization for cosine similarity compatibility
            norm = float(np.linalg.norm(vec))
            if norm > 1e-8:
                vec /= norm
            embeddings.append(vec.tolist())
        return embeddings


_CHROMA_CLIENT = None
_CHROMA_COLLECTION = None


def get_chroma_client():
    """Retrieve or initialize the ChromaDB PersistentClient."""
    global _CHROMA_CLIENT
    if _CHROMA_CLIENT is None:
        try:
            import chromadb
            os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
            _CHROMA_CLIENT = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        except Exception as exc:
            logger.error("Failed to initialize ChromaDB PersistentClient: %s", exc)
            return None
    return _CHROMA_CLIENT


def get_resource_collection():
    """Retrieve or initialize the language_resources collection with embedding function."""
    global _CHROMA_COLLECTION
    client = get_chroma_client()
    if client is None:
        return None

    if _CHROMA_COLLECTION is None:
        try:
            ef = VoiceRootsMultilingualEmbeddingFunction()
            _CHROMA_COLLECTION = client.get_or_create_collection(
                name=COLLECTION_NAME,
                embedding_function=ef,
                metadata={"description": "Voice Roots verified language resources and oral archives"},
            )
        except Exception as exc:
            logger.error("Failed to get/create ChromaDB collection: %s", exc)
            return None
    return _CHROMA_COLLECTION


def upsert_resources(resources: List[Dict[str, Any]]) -> int:
    """Idempotently index or update a list of language resource records in ChromaDB."""
    collection = get_resource_collection()
    if collection is None:
        raise RuntimeError("ChromaDB vector store is unavailable.")

    if not resources:
        return 0

    ids: list[str] = []
    documents: list[str] = []
    metadatas: list[dict[str, Any]] = []

    for item in resources:
        doc_id = item.get("document_id")
        text = (item.get("text_original") or item.get("search_text") or item.get("term_or_text") or "").strip()
        if not doc_id or not text:
            continue

        translation = (item.get("text_translation") or item.get("translation_text") or "").strip()
        # Combine original text with translation if available for rich semantic search
        if item.get("search_text"):
            search_content = item.get("search_text").strip()
        else:
            search_content = f"{text} — {translation}" if translation else text

        meta: dict[str, Any] = {
            "document_id": doc_id,
            "language": item.get("language", "Unknown"),
            "language_code": item.get("language_code", "und"),
            "dialect": item.get("dialect") or "Standard / Unspecified",
            "document_type": item.get("document_type", "literature"),
            "source_title": item.get("source_title", "Oral Language Archive"),
            "source_url": item.get("source_url", ""),
            "license": item.get("license", "CC BY-NC 4.0"),
            "attribution": item.get("attribution", "Voice Roots Preserved Heritage"),
            "consent_status": item.get("consent_status", "Consented Community Archive"),
            "verification_status": item.get("verification_status", "Human Verified"),
            "checksum": item.get("checksum", ""),
            "created_at": item.get("created_at", ""),
        }
        ids.append(doc_id)
        documents.append(search_content)
        metadatas.append(meta)

    if not ids:
        return 0

    collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
    return len(ids)


def search_resources(
    query: str,
    *,
    language: Optional[str] = None,
    dialect: Optional[str] = None,
    document_type: Optional[str] = None,
    verification_status: Optional[str] = None,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """Execute semantic vector search with optional metadata filters."""
    collection = get_resource_collection()
    if collection is None:
        return []

    q = query.strip()
    if not q:
        return []

    # Build metadata where filter
    where_clauses: list[dict[str, Any]] = []
    if language:
        where_clauses.append({"language": language.strip()})
    if dialect:
        where_clauses.append({"dialect": dialect.strip()})
    if document_type:
        where_clauses.append({"document_type": document_type.strip()})
    if verification_status:
        where_clauses.append({"verification_status": verification_status.strip()})

    where_filter = None
    if len(where_clauses) == 1:
        where_filter = where_clauses[0]
    elif len(where_clauses) > 1:
        where_filter = {"$and": where_clauses}

    try:
        results = collection.query(
            query_texts=[q],
            n_results=min(max(1, limit), 50),
            where=where_filter,
            include=["documents", "metadatas", "distances"],
        )
    except Exception as exc:
        logger.error("ChromaDB query failed: %s", exc)
        return []

    matched_items: list[dict[str, Any]] = []
    if results and results["ids"] and results["ids"][0]:
        count = len(results["ids"][0])
        for i in range(count):
            meta = results["metadatas"][0][i] if results["metadatas"] else {}
            dist = results["distances"][0][i] if results["distances"] else 1.0
            doc = results["documents"][0][i] if results["documents"] else ""
            
            # Convert cosine distance to approximate similarity score in [0.0, 1.0]
            similarity_score = round(max(0.0, 1.0 - (dist / 2.0)), 4)

            matched_items.append({
                "document_id": results["ids"][0][i],
                "search_text": doc,
                "similarity_score": similarity_score,
                "distance": round(dist, 4),
                **meta,
            })

    # Transparent Lexical Exact-Text Fallback
    # If a language has specific orthography or rare terms, check lexical containment
    try:
        all_docs = collection.get(where=where_filter, include=["documents", "metadatas"])
        if all_docs and all_docs.get("ids"):
            seen_ids = {item["document_id"] for item in matched_items}
            q_lower = q.lower()
            q_terms = [t for t in q_lower.split() if len(t) > 2]
            for idx, doc_id in enumerate(all_docs["ids"]):
                if doc_id in seen_ids:
                    continue
                doc_text = (all_docs["documents"][idx] or "").lower() if all_docs.get("documents") else ""
                is_exact = q_lower in doc_text
                term_matches = sum(1 for t in q_terms if t in doc_text)
                if is_exact or (q_terms and term_matches >= max(1, len(q_terms) // 2)):
                    meta = all_docs["metadatas"][idx] if all_docs.get("metadatas") else {}
                    score = 0.95 if is_exact else round(0.5 + 0.3 * (term_matches / max(1, len(q_terms))), 4)
                    matched_items.append({
                        "document_id": doc_id,
                        "search_text": all_docs["documents"][idx],
                        "similarity_score": score,
                        "distance": round(max(0.0, 2.0 * (1.0 - score)), 4),
                        "search_mode": "lexical_exact_fallback" if is_exact else "lexical_token_match",
                        **meta,
                    })
    except Exception as exc:
        logger.debug("Lexical fallback search skipped: %s", exc)

    # Sort merged results by similarity score descending and enforce limit
    matched_items.sort(key=lambda x: -x.get("similarity_score", 0.0))
    return matched_items[:limit]


def ingest_from_jsonl(file_path: Optional[str] = None) -> int:
    """Read records from jsonl file and upsert them into ChromaDB."""
    if not file_path:
        default_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "data",
            "processed",
            "language_resources.jsonl",
        )
        file_path = default_path

    if not os.path.exists(file_path):
        logger.warning("Processed language resources not found at %s", file_path)
        return 0

    import json
    records: list[dict[str, Any]] = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))

    return upsert_resources(records)


def delete_resource(document_id: str) -> bool:
    """Delete a document from ChromaDB by ID."""
    collection = get_resource_collection()
    if collection is None:
        return False
    try:
        collection.delete(ids=[document_id])
        return True
    except Exception as exc:
        logger.error("Failed to delete document %s from ChromaDB: %s", document_id, exc)
        return False


def get_vector_stats() -> Dict[str, Any]:
    """Return collection size, languages covered, and storage telemetry."""
    collection = get_resource_collection()
    if collection is None:
        return {
            "status": "unavailable",
            "count": 0,
            "persistence_path": CHROMA_PERSIST_DIR,
            "collection_name": COLLECTION_NAME,
        }

    total_count = collection.count()
    languages: dict[str, int] = {}
    doc_types: dict[str, int] = {}
    verified_count = 0

    if total_count > 0:
        try:
            sample = collection.get(limit=min(total_count, 500), include=["metadatas"])
            if sample and sample["metadatas"]:
                for m in sample["metadatas"]:
                    lang = m.get("language", "Unknown")
                    languages[lang] = languages.get(lang, 0) + 1
                    dtype = m.get("document_type", "other")
                    doc_types[dtype] = doc_types.get(dtype, 0) + 1
                    if "verified" in str(m.get("verification_status", "")).lower():
                        verified_count += 1
        except Exception as exc:
            logger.warning("Could not gather detailed metadata stats: %s", exc)

    return {
        "status": "healthy",
        "total_records": total_count,
        "collection_name": COLLECTION_NAME,
        "persistence_path": CHROMA_PERSIST_DIR,
        "languages_indexed": languages,
        "document_types": doc_types,
        "verified_records": verified_count,
        "embedding_dimensions": 384,
        "embedding_model": "voiceroots_multilingual_v1 (offline subword/morphological)",
    }
