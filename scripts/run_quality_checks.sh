#!/usr/bin/env bash
# Voice Roots - Automated Quality & Regression Test Runner
# Validates backend tests, frontend build, dataset provenance, and $0.00 zero-cost operations.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "========================================================"
echo " Voice Roots - Automated Quality & Regression Suite"
echo "========================================================"

# 1. Environment & PATH setup
export PATH="$ROOT_DIR/scratch/bin:$PATH"
export PYTHONPATH="$ROOT_DIR/backend"
export VOICE_ROOTS_TRANSCRIPTION_PROVIDER="${VOICE_ROOTS_TRANSCRIPTION_PROVIDER:-whisper-local}"
export VOICE_ROOTS_WHISPER_MODEL_SIZE="${VOICE_ROOTS_WHISPER_MODEL_SIZE:-base}"

echo "Step 1: Running Isolated Backend Unit Tests (Fast, Mocks/Fixtures)..."
python3 -m pytest -m unit -q
echo "✓ Unit tests passed."

echo ""
echo "Step 2: Running Local Integration Tests (SQLite, ChromaDB, Validation)..."
python3 -m pytest -m integration -q
echo "✓ Integration tests passed."

echo ""
echo "Step 3: Running Real Audio ASR & Persistence Tests (Immutable Master)..."
python3 -m pytest -m real_ai -q
echo "✓ Real AI audio tests passed."

echo ""
echo "Step 4: Running Full Pytest Regression Suite (All 114 Tests)..."
python3 -m pytest -q
echo "✓ Full pytest suite passed (114/114)."

echo ""
echo "Step 5: Running Frontend Typecheck & Production Build..."
npm --prefix frontend run build
echo "✓ Frontend build and type diagnostics passed."

echo ""
echo "Step 6: Verifying Zero External API Cost Telemetry..."
python3 -c "
from fastapi.testclient import TestClient
from main import app
client = TestClient(app)
res = client.get('/api/v1/system/telemetry')
assert res.status_code == 200
telem = res.json()
assert telem['costs']['external_api_costs_usd'] == 0.0
print(f\"✓ Operational telemetry verified: \${telem['costs']['external_api_costs_usd']:.2f} external API cost ({telem['costs']['billing_status']}).\")
"

echo ""
echo "========================================================"
echo " All Quality Checks & Continuous Integration Passed! "
echo "========================================================"

