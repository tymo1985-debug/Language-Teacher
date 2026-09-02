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
- Next: Phase 9 — Real Life

## Current version
**0.8.0** — Phase 8 · Conversation

## Phase 8
Adds:
- multi-turn Conversation Mode;
- scenario selection;
- persisted conversation turns;
- text responses;
- optional voice dictation through the existing Speech layer;
- AI Teacher context with recent conversation turns;
- corrections shown only after the user's response;
- Mistake Memory integration;
- repeated-mistake counting;
- automatic reuse of conversation mistakes by future Today Sessions.

The current local AI provider is still a deterministic architecture demo. A real conversational model can later replace it through the existing secure provider/proxy interface.

## Learning loop
```text
Conversation response
→ structured correction
→ Mistake Memory
→ repeated count / pattern
→ Session Engine
→ future focused practice
```

## Run
```bash
python3 -m http.server 8080
```
