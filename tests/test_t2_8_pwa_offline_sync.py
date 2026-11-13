import json
import os
import uuid

import pytest
from fastapi.testclient import TestClient

from backend.main import app, init_db


@pytest.fixture(autouse=True)
def setup_test_db():
    init_db()


def test_idempotent_sync_endpoint_success():
    client = TestClient(app)
    op_id = f"op_test_{uuid.uuid4().hex[:10]}"
    payload = {
        "clientOperationId": op_id,
        "actionType": "SYNC_RECORDING",
        "payload": {
            "title": "Folktale of the Mahua Tree",
            "language": "Gondi",
            "durationSeconds": 42.5,
        },
    }

    # First request
    res1 = client.post("/api/v1/sync/idempotent", json=payload)
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["success"] is True
    assert data1["idempotentReplay"] is False
    assert data1["result"]["clientOperationId"] == op_id
    assert data1["result"]["status"] == "SYNCED_TO_CLOUD"

    # Replay request (Idempotency guarantee)
    res2 = client.post("/api/v1/sync/idempotent", json=payload)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["success"] is True
    assert data2["idempotentReplay"] is True
    assert data2["result"]["clientOperationId"] == op_id
    assert data2["result"]["storyId"] == data1["result"]["storyId"]


def test_idempotent_sync_validation_failure():
    client = TestClient(app)
    res = client.post(
        "/api/v1/sync/idempotent",
        json={"actionType": "SYNC_RECORDING", "payload": {}},
    )
    assert res.status_code == 400
    assert "mandatory" in res.json()["detail"].lower()


def test_pwa_manifest_file_structure():
    manifest_path = os.path.join(
        os.path.dirname(__file__), "..", "web", "public", "manifest.json"
    )
    assert os.path.exists(manifest_path), "manifest.json should exist in web/public/"

    with open(manifest_path, encoding="utf-8") as f:
        data = json.load(f)

    assert "Voice Roots" in data.get("name", "")
    assert data.get("display") == "standalone"
    assert data.get("start_url") == "/"
    assert len(data.get("icons", [])) >= 2


def test_pwa_service_worker_asset():
    sw_path = os.path.join(
        os.path.dirname(__file__), "..", "web", "public", "sw.js"
    )
    assert os.path.exists(sw_path), "sw.js should exist in web/public/"

    with open(sw_path, encoding="utf-8") as f:
        content = f.read()

    assert "voice-roots-cache" in content
    assert "addEventListener" in content
    assert "caches.open" in content
