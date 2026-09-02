# Language Teacher

## Status
- Phase 1 — Foundation ✅
- Phase 2 — Language Profiles ✅
- Phase 3 — Learning Data ✅
- Phase 4 — Review / SRS ✅
- Next: Phase 5 — Session Engine

## Current version
**0.4.0** — Phase 4 · Review / SRS

The current version, phase, build date and database schema are also visible in **Settings → Application**.

## Phase 4
Adds:
- deterministic local SRS scheduling;
- due-review queue;
- weakest-memory-dimension exercise selection;
- active recall review screen;
- `Again / Hard / Good / Easy` ratings;
- persisted review history;
- per-dimension memory updates;
- centralized application version metadata.

SRS operates only on real `LearningItem` records. No artificial demo cards are seeded.

## Run
```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.
