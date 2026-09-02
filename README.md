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
- Next: Phase 10 — Polish / Release

## Current version
**0.9.0** — Phase 9 · Real Life

## Phase 9
Adds the key “I need this now” workflow:

```text
real situation
→ useful phrase
→ listen / speak
→ mini-dialog
→ save PersonalSituation
→ save situation-expression
→ future Session + Review
```

The local demo provider contains a small set of offline practical templates for supported languages. Arbitrary high-quality language generation remains the job of a real cloud AI connected through the existing secure proxy/provider architecture.

## Privacy
A Real Life description stays local unless a future remote AI provider is explicitly used.

## Run
```bash
python3 -m http.server 8080
```
