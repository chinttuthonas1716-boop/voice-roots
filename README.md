# Voice Roots

Voice Roots is a prototype for preserving oral stories and regional languages. It keeps the speaker's original audio at the center and separates source transcript, translation, and cultural notes.

## Current prototype

- The Next.js web app records from a browser microphone or accepts an audio file, with contributor consent.
- Recordings and story details are stored in the current browser using IndexedDB and local storage. They are not backed up or shared across devices.
- The archive, story details, search, and translation editor use the records saved in that browser.
- The language selector lists English, Telugu, Hindi, Tamil, Kannada, and Malayalam; full interface localization is still incomplete.
- Speech transcription, automatic translation, authentication, cloud synchronization, and AI answers are not connected to live providers. The UI reports those limits instead of inventing results.
- The FastAPI and mobile folders are project scaffolding; this web prototype does not currently use them as a shared production service.

## Run the web app

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Microphone recording requires browser permission and a secure context (localhost is supported by browsers).

Create a production build with:

```bash
cd web
npm run build
```

## Progress report

[`PROGRESS.md`](PROGRESS.md) reports observed local service status, public URL configuration, route count, and Git state. Run `python3 scripts/progress_daemon.py` from the repository root to refresh it immediately and every five minutes while the process remains running.

## Public URL and presentation QR

There is no public deployment URL configured in this repository. After deploying to an HTTPS host, set `VOICE_ROOTS_PUBLIC_URL` to that URL. The QR generator refuses to run without a valid HTTPS URL:

```bash
VOICE_ROOTS_PUBLIC_URL=https://your-deployed-domain.example python3 scripts/generate_qr_sync.py
```

It generates a QR code for the public site in `web/public/qr_website.png`. Do not use a localhost or local-network address for a presentation QR.

## Data handling

Recordings remain in the browser where they were created. Clearing site data or changing browsers/devices can make them unavailable. Obtain informed consent before recording, and export or back up any material that must be retained.
