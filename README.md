# Language Teacher

## Status
- Phase 1 — Foundation ✅
- Phase 2 — Language Profiles ✅
- Phase 3 — Learning Data ✅
- Phase 4 — Review / SRS ✅
- Phase 5 — Session Engine ✅
- Phase 6 — Speech ✅
- Phase 7 — AI Teacher ✅
- Phase 8 — Conversation ✅
- Phase 9 — Real Life ✅
- Phase 10 — Polish / Release ✅
- Phase 11 — Secure Cloud AI ✅

## Current version
**1.1.0** — Secure Cloud AI

Language Teacher is a local-first PWA with an optional server-side AI proxy. The local demo remains available offline; cloud AI is opt-in and never places an API key in the browser.

## Backup
Settings → Backup:
- export `language-teacher-backup.json`;
- validate and restore a backup;
- audio blobs are intentionally excluded from the MVP backup.

## Release Check
Settings → Release Check verifies the most important runtime capabilities:
- secure context;
- Service Worker;
- IndexedDB;
- database opening;
- voice-recording availability/fallback;
- network/offline state.

## AI modes
- **Local architecture demo** — deterministic, offline, and not a real LLM.
- **Secure cloud AI** — calls the included backend proxy and validates structured responses before the learning engine uses them.

The proxy removes local record and user identifiers before sending context to the model. Learning text, goals, recent dialogue, mistakes and situations may still be included because they are needed for personalized teaching.

## Run

### Local demo only

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

### Secure cloud AI

Requires Node.js 18 or newer. Set the server-only environment values and start the included proxy:

```bash
OPENAI_API_KEY="..." OPENAI_MODEL="..." npm start
```

Open `http://127.0.0.1:8787`, then select **Secure cloud AI** in Settings. Choose a supported model available to your OpenAI project; the repository intentionally does not hard-code a model or secret.

## Tests

```bash
npm test
```
