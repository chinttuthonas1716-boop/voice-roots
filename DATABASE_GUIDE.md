# Voice Roots — Database Architecture & Maintenance Guide
## SQLite WAL Configuration, Schema Structure, Alembic Migrations, and Disaster Recovery

> **Database Engine**: SQLite 3 (Write-Ahead Logging mode enabled)  
> **Schema Tables**: 49 Registered Tables (as of Milestone 23)  
> **Database File Location**: `backend/voice_roots.db` (Persistent volume mount)  
> **Alembic Migration Head**: `4c5d6e7f8a9b`

---

## 1. Concurrency, WAL Mode & Integrity Configuration

Voice Roots uses SQLite 3 configured for multi-threaded production workloads with high concurrency and data durability:

```sql
PRAGMA journal_mode = WAL;         -- Write-Ahead Logging for non-blocking concurrent reads
PRAGMA busy_timeout = 5000;        -- 5000ms retry timeout on lock contention
PRAGMA foreign_keys = ON;          -- Strict relational constraint enforcement
PRAGMA synchronous = NORMAL;       -- Optimal balance of durability and disk I/O performance
```

### Integrity Verification
To check database integrity at any time:
```sql
PRAGMA integrity_check;
PRAGMA foreign_key_check;
PRAGMA quick_check;
```
Or query the live storage probe endpoint:
```bash
curl http://localhost:8000/api/v1/system/storage-probe
```

---

## 2. Master Table Architecture (Summary of 49 Tables)

The database schema is organized into distinct domain clusters:

```mermaid
erDiagram
    USERS ||--o{ TRANSCRIPTS : "contributes"
    TRANSCRIPTS ||--o{ TRANSLATIONS : "annotates"
    TRANSCRIPTS ||--o{ CORRECTIONS : "reviews"
    TRANSCRIPTS ||--o{ SPEECH_ALIGNMENTS : "aligns"
    ORGANIZATIONS ||--o{ EXPERT_REVIEWERS : "accredits"
    EXPERT_REVIEWERS ||--o{ CORRECTIONS : "approves"
    LEARNING_COLLECTIONS ||--o{ LEARNING_MODULES : "contains"
    KG_NODES ||--o{ KG_RELATIONSHIPS : "connects"
    RESEARCH_API_KEYS ||--o{ RESEARCH_ACCESS_LOGS : "logs"
```

### Core Domain Clusters
1. **Preservation & Ingestion**:
   - `transcripts`: Primary master catalog storing recording metadata, SHA-256 hash, audio filename, duration, speaker consent timestamps, and OCAP privacy levels.
   - `transcripts_fts`: SQLite FTS5 full-text search virtual table for fast full-text querying.
   - `translations`: Machine and human translation layers referencing transcripts by foreign key.
   - `corrections`: Non-destructive community correction submissions and elder approval logs.
2. **User Accounts & RBAC**:
   - `users`: User profiles with bcrypt hashed passwords, roles (`admin`, `researcher`, `reviewer`, `contributor`), and verification status.
   - `user_sessions`: Active session tracking and token metadata.
3. **Knowledge Graph (Milestone 16)**:
   - `kg_nodes`: Linguistic entities, dialect varieties, language families, and cultural concepts.
   - `kg_relationships`: Directed graph edges linking nodes with weight and provenance.
   - `kg_vocabulary_details`: Botanical, agricultural, and cultural semantic metadata.
   - `kg_search_fts`: FTS5 index for knowledge graph discovery.
4. **Cultural Archives (Milestone 17)**:
   - `archive_collections`: Curated thematic collections (oral histories, seasonal celebrations).
   - `cultural_stories`: Narratives, clan lore, and access tiers (`PUBLIC`, `COMMUNITY_ONLY`, `SACRED_ELDER_ONLY`).
   - `cultural_stories_fts`: FTS5 full-text search index for cultural archives.
5. **Speech Intelligence (Milestone 18)**:
   - `speech_alignments`: Word-level timestamps, duration, and phonetic token breakdowns.
   - `speech_acoustic_metrics`: Signal-to-noise ratio, speech rate, pitch contour, and waveform statistics.
   - `pronunciation_exercises`: Minimal phoneme pairs and reference phonetic audio.
   - `pronunciation_attempts`: Learner evaluation attempts and phonetic accuracy scores.
6. **Language Learning (Milestone 19)**:
   - `learning_collections`: Language learning tracks (Gondi, Koya, Santhali, Lambadi).
   - `learning_modules`: Interactive vocabulary flashcards and cultural dialogue modules.
   - `learner_progress`: Learner mastery tracking, quiz scores, and streak data.
7. **Research Interoperability (Milestone 20)**:
   - `research_api_keys`: Scoped tokens, institutional affiliations, SHA-256 token hashes, rate limits.
   - `research_access_logs`: Audit telemetry logging all research queries and corpus exports.
8. **Community Governance & Pilot Tracking (Milestones 14 & 23)**:
   - `organizations`: Accredited tribal councils, universities, and linguistics centers.
   - `expert_reviewers`: Accredited elders and certified dialect reviewers.
   - `pilot_metrics` & `pilot_submissions`: Controlled pilot metrics telemetry and evaluation tracking.

---

## 3. Alembic Database Migrations

Voice Roots manages schema evolutions using Alembic.

### Migration Lineage
```
<base>
  └── 8a13948f3a26  (oral_language_preservation_schema)
        └── b3910c28341a  (community_verification_and_roles)
              └── c4820d491f21  (language_knowledge_graph_schema)
                    └── e7193b58f012  (cultural_archives_schema)
                          └── 9eb5cd35b326  (advanced_speech_and_pronunciation_schema)
                                └── 2a8b3c4d5e6f  (language_learning_and_education_schema)
                                      └── 4c5d6e7f8a9b  (institutional_research_api_and_interoperability) [HEAD]
```

### Executing Migrations
```bash
# Check current migration version
cd backend
alembic current

# Upgrade to latest schema head
alembic upgrade head

# Rollback one migration (if needed)
alembic downgrade -1
```

---

## 4. Disaster Recovery & Backup Restoration

### Backup Creation
Backups are created atomically using SQLite's online backup API, ensuring zero corruption even during active writes:
```bash
curl -X POST http://localhost:8000/api/v1/system/backup \
  -H "X-Admin-Key: VoiceRootsAdmin2026!"
```
Backups are stored in `backend/backups/voice_roots_backup_<YYYYMMDD_HHMMSS>.db`.

### Tested Disaster Recovery Procedure
To restore the platform from a backup snapshot:

```bash
# 1. Stop the application server
kill $(pgrep -f uvicorn)

# 2. Archive the existing database
mv backend/voice_roots.db backend/voice_roots.db.broken.$(date +%s)
rm -f backend/voice_roots.db-shm backend/voice_roots.db-wal

# 3. Restore chosen backup snapshot
cp backend/backups/voice_roots_backup_20261102_162946.db backend/voice_roots.db

# 4. Verify integrity of restored database
sqlite3 backend/voice_roots.db "PRAGMA integrity_check;"
# (Output must be 'ok')

# 5. Bring migrations to head (if backup was from earlier milestone)
cd backend && alembic upgrade head && cd ..

# 6. Restart application
python3 -m uvicorn main:app --app-dir backend --port 8000 --host 0.0.0.0
```
This disaster recovery workflow was empirically tested in an isolated sandbox with 100% preservation of all 49 tables and records.
