# VOICE ROOTS — NEXT STEPS & IMMEDIATE ACTION QUEUE

**Queue State:** Ready for Autonomous Execution  
**Current Release:** `v2.0.0` (Production Release)  
**Next Milestone:** `v2.1.0` (Institutional Field Pilot Deployment)

---

## 1. Immediate Action Queue for Codex (Backend Owner)

1. **Fix Test Fixture Pagination Ceiling in `tests/test_milestone17_cultural_archives.py`:**
   - **File:** `tests/test_milestone17_cultural_archives.py`, Line 344
   - **Issue:** `client.get("/api/v1/cultural-archives/collections")` uses default `limit=50`. When earlier tests accumulate 51 collections, the test collection is truncated, causing assertion failure.
   - **Fix:** Update to `client.get("/api/v1/cultural-archives/collections?limit=100")`.
   - **Verification:** Run `pytest tests/test_milestone17_cultural_archives.py` to confirm 100% pass across all 420 backend tests.

2. **Implement Assessment Engine Endpoint (`POST /api/v1/languages/assess`):**
   - **File:** `backend/routers/languages.py` (or dedicated router)
   - **Specification:** Calculate multi-dimensional endangerment score:
     - `text_resource_score` (0-100)
     - `speech_data_hours_score` (0-100)
     - `dialect_diversity_weight`
     - `community_consent_flag` (boolean)
   - **Verification:** Add unit test in `tests/test_language_assessment.py`.

3. **Verify Database WAL Checkpoints:**
   - Run Alembic migration check: `alembic current` and ensure SQLite WAL file checkpoints cleanly without orphan locks.

---

## 2. Immediate Action Queue for Antigravity (Frontend Owner)

1. **Maintain Pixel-Perfect Visual Fidelity:**
   - The forest landing page (`/`) and dynamic registry (`/explore`) are now updated to match the latest mobile screenshots.
   - Continue running responsive tests: `cd web && npx playwright test screenshots_and_responsive.spec.ts`.

2. **Distribution ZIP Archive Maintenance:**
   - Whenever repository files change, re-bundle `voice-roots-v2.0-audited-source.zip` so external evaluators have the complete working memory package.

---

## 3. Immediate Action Queue for Human Project Owner

1. **IRB & Institutional Review Board Submission:**
   - Review [`MILESTONE_23_INSTITUTIONAL_PILOT_DOCUMENTATION_PACKAGE.md`](file:///Users/harsha/.gemini/antigravity/scratch/voice-roots/MILESTONE_23_INSTITUTIONAL_PILOT_DOCUMENTATION_PACKAGE.md).
   - Formally submit protocol to regional university ethics board for Gondi & Koya field pilot.

2. **Customary Elder Council Onboarding:**
   - Nominate initial verified elder reviewers for Adilabad, Godavari, and Chhindwara districts.
