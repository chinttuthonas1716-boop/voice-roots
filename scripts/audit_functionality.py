#!/usr/bin/env python3
"""
Voice Roots End-to-End Functionality Audit Script
Executes comprehensive HTTP, API, Audio, and Responsive verification.
"""

import sys
import json
import urllib.request
import urllib.error

LOCAL_BASE = "http://localhost:3000"
PUBLIC_BASE = "https://learned-fairly-qualifying-notifications.trycloudflare.com"

ROUTES = [
    ("/", "Landing Page"),
    ("/archive", "Oral Heritage Archive"),
    ("/recordings/vr-106", "Story Details Dossier (VR-106)"),
    ("/passport/vr-106", "Liquid Glass Heritage Passport (VR-106)"),
    ("/record", "Recording Studio (Mic / Upload)"),
    ("/upload", "Audio File Ingestion Studio"),
    ("/translate", "Day-to-Day Conversational Translator"),
    ("/explore", "Heritage Dialect Exploration & Map"),
    ("/search", "Semantic Search Interface"),
    ("/dashboard", "Custodianship Dashboard"),
    ("/app", "Mobile App Simulator"),
    ("/links", "Unified Master Links Portal"),
    ("/portal", "Portal Gateway Alias"),
    ("/login", "Cinematic Liquid Glass Login"),
    ("/register", "Custodian Stewardship Registration"),
]

AUDIO_FILES = [
    "/audio/koya_remedy.wav",
    "/audio/gondi_legend.wav",
    "/audio/harvest_song.wav",
    "/audio/general_folk.wav",
]

def check_url(url: str, method: str = "GET", data: bytes = None, headers: dict = None):
    req = urllib.request.Request(url, data=data, headers=headers or {"User-Agent": "VoiceRootsAudit/1.0"}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read()
            return {
                "status": resp.status,
                "headers": dict(resp.getheaders()),
                "body_len": len(content),
                "error": None
            }
    except urllib.error.HTTPError as e:
        return {"status": e.code, "headers": {}, "body_len": 0, "error": str(e)}
    except Exception as e:
        return {"status": 0, "headers": {}, "body_len": 0, "error": str(e)}

def run_audit():
    results = {"routes": [], "audio": [], "api": [], "public_tunnel": []}

    print("=" * 60)
    print("🌿 RUNNING VOICE ROOTS COMPREHENSIVE FUNCTIONALITY AUDIT")
    print("=" * 60)

    # 1. Routes
    print("\n--- 1. WEB ROUTES AUDIT (Local Port 3000) ---")
    for path, name in ROUTES:
        url = f"{LOCAL_BASE}{path}"
        res = check_url(url)
        passed = res["status"] == 200 and res["body_len"] > 500
        status_sym = "✅ PASS" if passed else "❌ FAIL"
        print(f"[{status_sym}] {name:40} {path:22} HTTP {res['status']} ({res['body_len']} bytes)")
        results["routes"].append({"path": path, "name": name, "status": res["status"], "passed": passed})

    # 2. Audio Masters
    print("\n--- 2. ACOUSTIC AUDIO MASTERS STREAMING AUDIT ---")
    for audio_path in AUDIO_FILES:
        url = f"{LOCAL_BASE}{audio_path}"
        res = check_url(url)
        content_type = res["headers"].get("Content-Type", "")
        passed = res["status"] == 200 and ("audio" in content_type or res["body_len"] > 10000)
        status_sym = "✅ PASS" if passed else "❌ FAIL"
        print(f"[{status_sym}] Audio Stream: {audio_path:25} HTTP {res['status']} | Type: {content_type} | Size: {res['body_len']} bytes")
        results["audio"].append({"path": audio_path, "status": res["status"], "passed": passed, "size": res["body_len"]})

    # 3. Translation API
    print("\n--- 3. TRANSLATION & AI API AUDIT ---")
    trans_url = f"{LOCAL_BASE}/api/translate"
    payload = json.dumps({"text": "నమస్కారం, మా ఊరి సంస్కృతిని కాపాడండి.", "sourceLang": "te", "targetLang": "en"}).encode("utf-8")
    res_api = check_url(trans_url, method="POST", data=payload, headers={"Content-Type": "application/json"})
    passed_api = res_api["status"] == 200
    status_sym = "✅ PASS" if passed_api else "❌ FAIL"
    print(f"[{status_sym}] IndicTrans2 POST /api/translate       HTTP {res_api['status']} ({res_api['body_len']} bytes)")
    results["api"].append({"endpoint": "/api/translate", "status": res_api["status"], "passed": passed_api})

    # 4. Public Tunnel
    print("\n--- 4. CLOUDFLARE PUBLIC TUNNEL LIVE AUDIT ---")
    for path in ["/", "/links", "/passport/vr-106", "/upload", "/translate", "/app"]:
        url = f"{PUBLIC_BASE}{path}"
        res_pub = check_url(url)
        passed_pub = res_pub["status"] == 200
        status_sym = "✅ PASS" if passed_pub else "❌ FAIL"
        print(f"[{status_sym}] Public URL: {path:22} HTTP {res_pub['status']}")
        results["public_tunnel"].append({"path": path, "status": res_pub["status"], "passed": passed_pub})

    print("\n" + "=" * 60)
    total_passed = sum(1 for r in results["routes"] if r["passed"]) + \
                   sum(1 for a in results["audio"] if a["passed"]) + \
                   sum(1 for p in results["api"] if p["passed"]) + \
                   sum(1 for t in results["public_tunnel"] if t["passed"])
    total_tests = len(results["routes"]) + len(results["audio"]) + len(results["api"]) + len(results["public_tunnel"])
    print(f"AUDIT SUMMARY: {total_passed}/{total_tests} TESTS PASSED ({(total_passed/total_tests)*100:.1f}%)")
    print("=" * 60)

if __name__ == "__main__":
    run_audit()
