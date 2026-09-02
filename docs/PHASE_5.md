# Phase 5 — Session Engine

Version: `0.5.0`

## Included
- local Session Engine
- Today session creation
- structured training blocks
- session progression
- session completion
- persisted session history
- Today integration
- Session screen
- Practice entry point
- update metadata (`update.json`)
- in-app update notice
- service-worker waiting-update detection
- release notes after installation

## Session inputs
The local planner can use:
- LanguageProfile
- due SRS reviews
- active mistakes
- PersonalSituations
- existing LearningItems
- user goals

## Training blocks used in Phase 5
- CONTEXT
- RECALL
- CORRECTION
- RESPOND
- SPEAK

The data shape remains compatible with the broader block taxonomy in `TECHNICAL_SPEC.md`.

## Update UX
Starting with Phase 5:
- the current version is centralized in `src/app/version.js`;
- `update.json` advertises the currently published version and short changelog;
- an installed older version can compare its version with `update.json`;
- when a new service worker is waiting, the user can choose “Обновить сейчас”;
- after a new version starts for the first time, a short “What’s new” notice is shown once.

This is an in-app update notification, not Web Push. It therefore needs no push server or notification permission.

## Exit criteria
- a local session can be created without AI
- Today exposes one recommended session
- session blocks can be completed sequentially
- completed session persists across restart
- session history can be read from IndexedDB
- update notification can be shown without external notification permissions
- offline startup remains supported

## Next
Phase 6 — Speech.
