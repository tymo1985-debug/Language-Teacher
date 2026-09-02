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

## Current version
**1.0.0** — MVP Release

Language Teacher now has a complete local-first MVP architecture covering language profiles, learning data, SRS, sessions, speech, AI provider abstraction, conversation, Real Life practice, updates, backup/restore and offline operation.

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

## Important AI status
The frontend contains a local deterministic demo provider and a secure proxy-provider contract. A real cloud LLM backend is **not** bundled in this MVP, and no API keys are stored in the PWA.

## Run
```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.
