# Language Teacher

## Status
- Phase 1 — Foundation ✅
- Phase 2 — Language Profiles ✅
- Phase 3 — Learning Data ✅
- Phase 4 — Review / SRS ✅
- Phase 5 — Session Engine ✅
- Next: Phase 6 — Speech

## Current version
**0.5.0** — Phase 5 · Session Engine

## Phase 5
Adds:
- local adaptive Session Engine;
- Today session generated from profile, due reviews, mistakes, situations and existing Learning Items;
- structured training blocks;
- Session screen;
- block completion and persisted session history;
- in-app update notifications;
- remote `update.json` version check;
- service-worker update-ready prompt;
- short release notes after a newly installed version.

The Session Engine has no AI dependency. It deliberately uses stored/local data first.

## Updates
Starting with 0.5.0, the app can:
1. show “What’s new” after a version changes;
2. check `update.json` for a newer published version;
3. detect when a new service worker is ready;
4. let the user apply the waiting update from the in-app notice.

## Run
```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.
