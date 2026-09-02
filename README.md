# Language Teacher

## Status
- Phase 1 — Foundation ✅
- Phase 2 — Language Profiles ✅
- Phase 3 — Learning Data ✅
- Next: Phase 4 — Review / SRS

## Phase 3
Adds persistent domain models and repository access for:
- `LearningItem`
- `Mistake`
- `Session`
- `PersonalSituation`
- `Progress`

Also adds an explicit IndexedDB migration pipeline (`schema v3`) and language-scoped data summaries.

No demo learning records are seeded: future learning content must come from real practice and Session Engine.

## Run
```bash
python3 -m http.server 8080
```
Open `http://localhost:8080`.
