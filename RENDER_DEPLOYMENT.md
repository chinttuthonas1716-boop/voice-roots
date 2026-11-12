# Deploying Voice Roots to Render.com 🌿

This step-by-step guide explains how to deploy **Voice Roots: Rooting Oral Languages in Text with AI** to **[Render.com](https://render.com)** cloud hosting.

Voice Roots uses a **Unified Web Application** architecture: a single Docker container bundles the React 18 / Vite frontend, FastAPI backend, SQLite database, ChromaDB vector store, and offline Whisper speech recognition engine into one seamless service with zero CORS friction.

---

## Prerequisites
1. **GitHub Repository**: [https://github.com/chinttuthonas1716-boop/voice-roots](https://github.com/chinttuthonas1716-boop/voice-roots) (pushed on branch `agent/antigravity`).
2. **Render Account**: Sign up or log in at [dashboard.render.com](https://dashboard.render.com).

---

## Method 1: 1-Click Blueprint Deployment (Recommended)

Render reads the pre-configured [`render.yaml`](./render.yaml) file in the root of the repository to automatically set up the service, environment variables, health checks, and persistent disk.

1. Open your **[Render Dashboard](https://dashboard.render.com)**.
2. Click the **"New +"** button in the top right and select **"Blueprint"**.
3. Select your GitHub repository: `chinttuthonas1716-boop/voice-roots`.
4. Choose the branch: `agent/antigravity` (or `main` if merged).
5. Render will detect `render.yaml` and display the blueprint resources:
   - **Service Name**: `voice-roots`
   - **Runtime**: `Docker` (Multi-stage build from `Dockerfile`)
   - **Persistent Disk**: 10 GB SSD mounted at `/data`
6. Click **"Apply"**.
7. Render will build the container, install system `ffmpeg`, compile the Vite production bundle, and launch the unified web app.
8. Once finished, your live website will be available at:
   `https://voice-roots.onrender.com/` (or your assigned `.onrender.com` URL).

---

## Method 2: Manual Web Service Deployment (100% Free Tier Option)

If you prefer to deploy on Render's **Free Tier** without adding a credit card for persistent disk storage:

1. In the **Render Dashboard**, click **"New +"** and select **"Web Service"**.
2. Connect your repository: `chinttuthonas1716-boop/voice-roots`.
3. Configure the following fields:
   - **Name**: `voice-roots`
   - **Region**: `Oregon (US West)` (or closest to you)
   - **Branch**: `agent/antigravity`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Instance Type**: `Free`
4. Expand **"Advanced"** and add these **Environment Variables**:
   | Key | Value | Purpose |
   |---|---|---|
   | `VOICE_ROOTS_ENV` | `production` | Enables production security checks |
   | `VOICE_ROOTS_TRANSCRIPTION_PROVIDER` | `whisper-local` | Offline CPU Whisper ASR |
   | `VOICE_ROOTS_WHISPER_MODEL_SIZE` | `base` | Whisper model size |
   | `VOICE_ROOTS_TRANSLATION_PROVIDER` | `offline-rule` | Rule-based guardrails |
   | `VOICE_ROOTS_ALLOWED_ORIGINS` | `https://voice-roots.onrender.com` | Allowed CORS origins |
5. Set **Health Check Path** to `/ready`.
6. Click **"Create Web Service"**.
7. Wait 3–5 minutes for the Docker image to build. When the deployment turns green ("Live"), click the URL.

> **Note on Free Tier Storage**:  
> Render Free tier spins down after 15 minutes of inactivity and uses ephemeral storage. For long-term permanent archiving across restarts, attach a persistent disk (Method 1: Starter plan, ~$9.50/mo total).

---

## Post-Deployment Verification Checklist

Once your Render service is **Live**:

1. **Homepage Check**: Open `https://<your-service-name>.onrender.com/`. Verify that the forest-green landing page, cinematic misty hero, and feature cards appear.
2. **Health Probe**: Open `https://<your-service-name>.onrender.com/health`. Verify it returns:
   ```json
   {
     "status": "healthy",
     "app": "Voice Roots",
     "database": "sqlite",
     "database_status": "ok",
     "storage_status": "ok"
   }
   ```
3. **API Documentation**: Open `https://<your-service-name>.onrender.com/docs` to inspect interactive FastAPI Swagger documentation.
4. **End-to-End Workflow**:
   - Go to `#record` and upload an audio sample with affirmative consent.
   - Verify speech recognition output.
   - Go to `#search` and test semantic vector search across the 44-language matrix.
   - Go to `#translate` to confirm elder review protections for oral tongues.

---

## Troubleshooting

- **Build Timeout / Memory**: Render builds Docker images with 2+ GB RAM. If building the node frontend in Docker times out, you can run `npm --prefix frontend run build` locally and commit `frontend/dist/`.
- **Port Binding**: The Dockerfile automatically binds to Render's injected `$PORT` environment variable via `0.0.0.0:${PORT:-8000}`.
- **Custom Domain**: In the Render service dashboard under "Settings" -> "Custom Domains", you can add a custom domain (e.g. `voiceroots.org`) with free automated Let's Encrypt SSL.

