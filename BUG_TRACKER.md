# VOICE ROOTS — BUG TRACKER & DEFECT REGISTER

**Release:** `v2.0-RC-1`  
**Tracking Standard:** Continuous QA & Remediation  
**Last Updated:** November 15, 2026

| Bug ID | Title & Location | Severity | Status | Assigned Owner |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Test fixture pagination ceiling in `test_milestone17_cultural_archives.py:344` | `LOW` | `OPEN` | **CODEX** (Backend) |
| **BUG-002** | `useSearchParams()` missing `<Suspense>` boundary on `/verify-email` | `MEDIUM` | `RESOLVED` | **ANTIGRAVITY** (Frontend) |
| **BUG-003** | Playwright strict mode ambiguous text locator in `auth_production_flows.spec.ts` | `LOW` | `RESOLVED` | **ANTIGRAVITY** (Frontend) |
| **BUG-004** | Desktop clientWidth false positive in `screenshots_and_responsive.spec.ts` | `LOW` | `RESOLVED` | **ANTIGRAVITY** (Frontend) |
| **BUG-005** | Demo user credentials mismatch in E2E login test | `LOW` | `RESOLVED` | **ANTIGRAVITY** (Frontend) |

---

## Detailed Bug Reports

### BUG-001 (OPEN): Test Fixture Pagination Ceiling
- **Affected File:** `tests/test_milestone17_cultural_archives.py`, Line 344
- **Severity:** Low (Test suite fixture artifact, not a user-facing production bug)
- **Symptom:** During full test suite run (`pytest`), test 398 fails with assertion error because expected sacred collection index 51 is not in the first 50 results.
- **Root Cause:** `GET /api/v1/cultural-archives/collections` defaults to `limit=50`. Accumulated test fixtures across previous milestone tests reach 51.
- **Remediation Plan:** Update test request URL to `client.get("/api/v1/cultural-archives/collections?limit=100")`.

---

### BUG-002 (RESOLVED): `useSearchParams()` Suspense Boundary
- **Affected File:** `web/src/app/verify-email/page.tsx`
- **Root Cause:** Next.js static page generation requires `useSearchParams()` to be wrapped in a `<Suspense>` boundary to allow client-side hydration.
- **Resolution:** Encapsulated verification parameters inside `<Suspense fallback={<Loader2 className="animate-spin" />}>`. Verified in `next build` (56/56 routes compiled).

---

### BUG-003 (RESOLVED): Playwright Strict Mode on Heading Locators
- **Affected File:** `web/e2e/auth_production_flows.spec.ts`
- **Root Cause:** `page.getByText('Test User')` resolved to both a toast message and the active session profile card heading.
- **Resolution:** Replaced with unambiguous `page.getByRole('heading', { name: 'Priya Sharma' })`.

---

### BUG-004 (RESOLVED): Desktop clientWidth Horizontal Scroll False Positive
- **Affected File:** `web/e2e/screenshots_and_responsive.spec.ts`
- **Root Cause:** `window.innerWidth` includes browser vertical scrollbar width, triggering false positive overflow on `/about`.
- **Resolution:** Switched assertion to `document.documentElement.clientWidth` and added `overflow-x-hidden`. Verified 0px overflow across all routes.
