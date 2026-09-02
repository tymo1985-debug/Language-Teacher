# Phase 10 — Polish / Release

Version: `1.0.0`

## Included
- JSON backup export
- validated restore
- portable backup contract
- global operation/error notice
- unhandled error/rejection surfacing
- keyboard focus visibility
- skip-to-content navigation
- reduced-motion support
- Release Check in Settings
- stronger navigation offline fallback
- final Service Worker cache version
- MVP release documentation

## Backup contract
File name:

```text
language-teacher-backup.json
```

Included:
- users
- settings
- languageProfiles
- learningItems
- mistakes
- sessions
- reviews
- progress
- situations
- sources

Audio is intentionally excluded from the MVP backup.

Restore validates:
- backup format
- backup version
- data object
- known stores
- array shape
- record IDs
- file size limit

Import replaces the portable local data set only after explicit confirmation.

## Accessibility
- visible keyboard focus
- skip link
- minimum existing touch target rules preserved
- native semantic controls retained
- reduced-motion support through OS preference and app setting
- status/error notices use appropriate live-region roles

## Offline / updates
- app shell remains cached
- navigations fall back to cached `index.html`
- update metadata remains network-first
- update application still uses waiting service-worker flow

## Release Check
The Settings screen can check runtime readiness without pretending optional browser features are hard requirements.

Required:
- secure context for deployed PWA capabilities
- Service Worker support
- IndexedDB support
- database opens successfully

Optional/fallback:
- voice recording
- network connection

## MVP release status
The architectural roadmap in `TECHNICAL_SPEC.md` Phases 1–10 is now implemented.

Known deliberate limitations:
- local demo AI is not a real LLM
- cloud backend/proxy is not deployed
- advanced pronunciation scoring is deferred
- cloud sync/accounts are deferred
- audio blobs are not included in backup

These are explicit post-MVP items, not hidden release blockers.
