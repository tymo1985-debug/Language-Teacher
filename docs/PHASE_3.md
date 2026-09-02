# Phase 3 — Learning Data

## Included
- IndexedDB schema v3
- explicit migration pipeline
- `LearningItem` model
- `Mistake` model
- `Session` model
- `PersonalSituation` model
- `Progress` model
- language/user-scoped learning repository
- persistent initial Progress record per language
- Learning Data summary on Words screen
- stored skill baseline on Progress screen

## Data isolation
Every learning record contains `userId` and `languageId`.

## Exit criteria
- all primary learning entities have stable constructors
- all primary entities can be persisted through one repository layer
- reads are scoped by `userId` and `languageId`
- existing Phase 2 IndexedDB data migrates to schema v3 without destructive changes
- progress survives application restart
- no SRS, Speech, AI Teacher, or Session Engine logic is introduced prematurely
