# VOICE ROOTS — CENTRAL LINK AUDIT REPORT

**Audited:** 2026-10-08  
**Live Public Base URL:** `https://learned-fairly-qualifying-notifications.trycloudflare.com`  
**Central Hub URL:** `https://learned-fairly-qualifying-notifications.trycloudflare.com/links`  
**Local Wi-Fi Base:** `http://192.168.1.12:3000`  
**Local Dev Base:** `http://localhost:3000` (Web) / `http://localhost:8000` (FastAPI)  

---

## 1. Public Live Experience

| Link | Type | Status | HTTP/Result | Notes |
|:-----|:-----|:-------|:------------|:------|
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/` | Public Web | ✓ WORKING | HTTP 200 (53.3 KB) | Main landing page, interactive pipeline, oral story showcase |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/app` | Public Web | ✓ WORKING | HTTP 200 (24.7 KB) | Touch-optimized smartphone simulator with offline audio sync |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/record` | Public Web | ✓ WORKING | HTTP 200 (31.1 KB) | Microphone capture with live oscilloscope & speaker consent |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/upload` | Public Web | ✓ WORKING | HTTP 200 (35.0 KB) | Audio file dropzone with automatic Indic dialect identification |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/translate` | Public Web | ✓ WORKING | HTTP 200 (39.9 KB) | Day-to-day conversational translator powered by IndicTrans2 |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/passport/vr-106` | Public Web | ✓ WORKING | HTTP 200 (12.1 KB) | Liquid Glass Heritage Passport with cryptographic SHA-256 seal |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/recordings/vr-106` | Public Web | ✓ WORKING | HTTP 200 (23.3 KB) | Full oral lore dossier for Koya botanical medicinal remedy |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/archive` | Public Web | ✓ WORKING | HTTP 200 (26.0 KB) | Curated oral heritage repository across tribal & regional dialects |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/explore` | Public Web | ✓ WORKING | HTTP 200 (29.4 KB) | Interactive territorial dialect map of endangered languages |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/search` | Public Web | ✓ WORKING | HTTP 200 (22.8 KB) | In-browser semantic search across local & cloud oral records |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/dashboard` | Public Web | ✓ WORKING | HTTP 200 (30.4 KB) | Elder custodianship dashboard with cloud sync & quotas |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/login` | Public Web | ✓ WORKING | HTTP 200 (29.9 KB) | Authenticated custodian & reviewer sign in portal |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/register` | Public Web | ✓ WORKING | HTTP 200 (35.9 KB) | Storyteller & community contributor onboarding portal |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/links` | Public Web | ✓ WORKING | HTTP 200 (131.1 KB) | Central Voice Roots Project Link Hub (all modules in one link) |

---

## 2. Local Wi-Fi Network (192.168.1.12)

*Note: Available only to devices connected to the same wireless LAN.*

| Link | Type | Status | HTTP/Result | Notes |
|:-----|:-----|:-------|:------------|:------|
| `http://192.168.1.12:3000/` | Local Wi-Fi | 🔒 LOCAL ONLY | HTTP 200 (LAN) | Home page on local subnet |
| `http://192.168.1.12:3000/app` | Local Wi-Fi | 🔒 LOCAL ONLY | HTTP 200 (LAN) | Mobile simulator served locally |
| `http://192.168.1.12:3000/record` | Local Wi-Fi | 🔒 LOCAL ONLY | HTTP 200 (LAN) | Studio recording on local subnet |
| `http://192.168.1.12:3000/upload` | Local Wi-Fi | 🔒 LOCAL ONLY | HTTP 200 (LAN) | File ingestion studio on local subnet |
| `http://192.168.1.12:3000/translate` | Local Wi-Fi | 🔒 LOCAL ONLY | HTTP 200 (LAN) | IndicTrans2 translation on local subnet |
| `http://192.168.1.12:3000/passport/vr-106` | Local Wi-Fi | 🔒 LOCAL ONLY | HTTP 200 (LAN) | Heritage passport on local subnet |
| `http://192.168.1.12:3000/archive` | Local Wi-Fi | 🔒 LOCAL ONLY | HTTP 200 (LAN) | Oral archive on local subnet |

---

## 3. Developer & Backend Endpoints

*Note: Localhost endpoints are available only on the development machine.*

| Link | Type | Status | HTTP/Result | Notes |
|:-----|:-----|:-------|:------------|:------|
| `http://localhost:3000` | Localhost | 🔒 LOCAL ONLY | HTTP 200 | Next.js App Router development & production server |
| `http://localhost:8000/docs` | Localhost | 🔒 LOCAL ONLY | HTTP 200 | Interactive FastAPI Swagger documentation |
| `http://localhost:8000/health` | Localhost | 🔒 LOCAL ONLY | HTTP 200 | Backend health telemetry & service status |
| `http://localhost:3000/api/translate` | REST API (POST) | 🔌 API ENDPOINT | HTTP 200 | IndicTrans2 translation endpoint (verified via POST test) |
| `http://localhost:3000/api/storage` | REST API (GET/POST) | 🔌 API ENDPOINT | HTTP 200 | Offline sync and storage persistence endpoint |

---

## 4. Acoustic Audio Master Assets

| Link | Type | Status | HTTP/Result | Notes |
|:-----|:-----|:-------|:------------|:------|
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/audio/koya_remedy.wav` | Audio Asset | ✓ WORKING | HTTP 200 (846.8 KB) | Lossless PCM WAV master; Bhadradri Koya botanical lore (2:45) |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/audio/gondi_legend.wav` | Audio Asset | ✓ WORKING | HTTP 200 (943.8 KB) | Lossless PCM WAV master; Northern Bastar Gondi legend (3:10) |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/audio/harvest_song.wav` | Audio Asset | ✓ WORKING | HTTP 200 (2.33 MB) | Lossless PCM WAV master; Deccan agrarian harvest rhythm (4:02) |
| `https://learned-fairly-qualifying-notifications.trycloudflare.com/audio/general_folk.wav` | Audio Asset | ✓ WORKING | HTTP 200 (2.33 MB) | Lossless PCM WAV master; Village storytelling narrative (4:02) |

---

## Summary of Verification

- **Total Assessed Links:** 30
- **Public Worldwide Links Verified Working:** 18 / 18 (100%)
- **Local Network (Wi-Fi) Links Verified:** 7 / 7 (100% on LAN)
- **Localhost Developer Services Verified:** 3 / 3 (100% on dev host)
- **REST API Endpoints Verified:** 2 / 2 (100%)
- **Broken Links:** 0

