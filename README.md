# Language Teacher

## Status
- Phase 1 — Foundation ✅
- Phase 2 — Language Profiles ✅
- Phase 3 — Learning Data ✅
- Phase 4 — Review / SRS ✅
- Phase 5 — Session Engine ✅
- Phase 6 — Speech ✅
- Phase 7 — AI Teacher ✅
- Next: Phase 8 — Conversation

## Current version
**0.7.0** — Phase 7 · AI Teacher

## Hotfix included
Phase 7 fixes the Phase 6 update-notice lockup:
- `ServiceWorkerRegistration` is no longer stored in serializable application state;
- “Понятно” closes the notice immediately, before persistence;
- update notices are hidden while onboarding is open;
- update notices remain informational rather than modal.

## Phase 7
Adds:
- replaceable `AIProvider` abstraction;
- Context Builder;
- Teacher Engine;
- strict structured response contract;
- validation and safe response parser;
- local deterministic demo provider;
- secure proxy-provider interface for future cloud AI;
- AI Teacher screen.

No API keys or provider secrets are stored in the frontend.

## Important
The local demo provider validates the architecture but is **not** an LLM. A real remote AI should only be connected through a secured backend/proxy endpoint.

## Run
```bash
python3 -m http.server 8080
```
