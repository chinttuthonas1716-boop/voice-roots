# Voice Roots: Multi-Agent Rules

Two agents work in this repo: CODEX and ANTIGRAVITY. Read this file and
PROGRESS.md before every task.

## Non-negotiables
- The original voice recording is the immutable master. AI output is only an
  annotation layer and must never overwrite audio.
- Consent is mandatory before any voice is archived (OCAP).
- Never claim success without running it. Mark anything unrun as NOT VERIFIED.

## Ownership
- CODEX owns: backend/, scripts/, data/census/, tests/, deployment config.
- ANTIGRAVITY owns: web/, UI verification in the browser.
- PROGRESS.md, MASTER_SPECIFICATION.md, and docs/ are shared; make shared-file
  edits only through a logged handoff.
- flutter_app/ and mobile/ are frozen. Do not modify them.
- Need a change in the other agent's folder? Do NOT edit it. Add a request
  to the Handoff Log in PROGRESS.md.

## Workflow
1. Work only on your own branch (agent/codex or agent/antigravity).
2. Before starting: read the Handoff Log. After finishing: append an entry.
3. Small commits with clear messages. No force-push. No commits to main.
4. Do not change API contracts (routes, request/response shapes) without
   updating MASTER_SPECIFICATION.md and logging it for the other agent.

## Handoff Log entry format (append to PROGRESS.md)
- [date] [agent] DONE: what changed, files touched
- VERIFIED: commands run and results
- NOT VERIFIED: anything untested
- NEEDS FROM OTHER AGENT: specific request, or "none"
