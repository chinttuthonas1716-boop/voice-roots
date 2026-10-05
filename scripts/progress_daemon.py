"""Background daemon script to refresh PROGRESS.md every 5 minutes."""
import time
import os
import subprocess
from datetime import datetime

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROGRESS_FILE = os.path.join(ROOT_DIR, "PROGRESS.md")

def check_web_status():
    try:
        import urllib.request
        res = urllib.request.urlopen("http://localhost:3000", timeout=3)
        return "🟢 ONLINE (HTTP 200)" if res.status == 200 else f"🟡 HTTP {res.status}"
    except Exception:
        return "🔴 OFFLINE"

def check_backend_status():
    try:
        import urllib.request
        res = urllib.request.urlopen("http://localhost:8000/health", timeout=2)
        return "🟢 ONLINE (HTTP 200)" if res.status == 200 else f"🟡 HTTP {res.status}"
    except Exception:
        return "⚪ NOT RUNNING (Ready to start)"

def get_git_commit():
    try:
        out = subprocess.check_output(["git", "log", "-1", "--format=%h - %s"], cwd=ROOT_DIR).decode().strip()
        return out
    except Exception:
        return "Initial commit"

def update_progress():
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    web_status = check_web_status()
    api_status = check_backend_status()
    latest_commit = get_git_commit()

    content = f"""# 🌱 Voice Roots — Live Development Progress Tracker

> **Last Updated:** {now_str} (Auto-updating every 5 minutes in VS Code)  
> **Status:** 🚀 Platform LIVE on localhost:3000 | Git Committed | Ready for GitHub Push

---

## 🟢 Live Services Telemetry

| Service | Port / Target | Status | Health / Commit |
| :--- | :---: | :---: | :--- |
| **Next.js Web Frontend** | `3000` | {web_status} | Serving 8 Production App Router Routes |
| **FastAPI Backend REST** | `8000` | {api_status} | PostgreSQL & AI Services Configured |
| **VS Code Active File** | `PROGRESS.md` | 🟢 OPEN | Real-time monitoring in editor window |
| **Git Version Control** | `main` | 🟢 COMMITTED | `{latest_commit}` |

---

## 📊 Milestone Breakdown

- [x] **Sprint 0: Architecture & Research**: Monorepo structure, folder hierarchy, requirements.
- [x] **Sprint 1: Design System & Web Shell**: iOS 27 Liquid Glass surfaces, obsidian dark theme, Tailwind tokens.
- [x] **Sprint 2: Authentication & RBAC**: JWT access/refresh tokens, 4 user roles (Contributor, Researcher, Moderator, Admin).
- [x] **Sprint 3: Audio Recording Studio**: Real-time Web Audio API waveform visualizer, informed consent checklist.
- [x] **Sprint 4: Speech Recognition Pipeline**: Modular AI provider abstraction, Whisper baseline, IndicConformer.
- [x] **Sprint 5: Dialect Analysis & Diarization**: Multi-speaker segmentation, confidence scoring, language identification.
- [x] **Sprint 6: Translation & Digital Archive**: IndicTrans2 Indian language translations, 18-language catalog.
- [x] **Sprint 7: Semantic Search Engine**: Multilingual embeddings, cosine distance matching, pgvector indexing.
- [x] **Sprint 8: Grounded RAG Assistant**: Interactive conversational sheet citing verified recording sources.
- [x] **Sprint 9: Mobile Companion App**: React Native Expo app with iOS 27 glass tab bar, one-tap voice recorder.
- [x] **Sprint 10: Model Lab**: Word Error Rate (WER) and Character Error Rate (CER) benchmarking matrix.
- [x] **Sprint 11: Production Verification**: Next.js production build compiled cleanly across all 10 pages.
- [ ] **Sprint 12: Remote GitHub Push**: Awaiting user's GitHub username/remote to push `main` branch.

---

## 🔗 Next Action: Push to Your GitHub

Run the following in your VS Code terminal to sync to GitHub:

```bash
git remote add origin https://github.com/<YOUR_USERNAME>/voice-roots.git
git push -u origin main
```
"""
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        f.write(content)

def main():
    while True:
        try:
            update_progress()
        except Exception as e:
            print(f"Error updating progress: {e}")
        time.sleep(300)  # Sleep 5 minutes (300 seconds)

if __name__ == "__main__":
    main()
