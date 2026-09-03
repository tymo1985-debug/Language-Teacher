# Functional audit: 1.14.0 → 1.14.1

Date: 2026-09-02. Baseline: main `e875bc86b9626e131c51ffcb13fb135f48974e49`.
Live site: https://tymo1985-debug.github.io/Language-Teacher/

## Result and scope

1.14.0 passed its existing release gate but had reproducible user-facing storage
failures. 1.14.1 fixes those failures and expands the gate from 44 to 59 tests.
The final local gate passes: 85 JS/MJS files, 82 offline shell entries, 59 tests.

This is **not an unconditional all-device certification**. Browser interaction
was available for the initial audit and core corrected dialogue flow, then the
browser tool denied further access because its administrative policy check was
unavailable. No alternate browser or indirect control was used to bypass that
restriction. Final on-device installation, mobile layout, microphone capture,
physical offline reload and the complete post-deployment UI pass remain unverified.

## Confirmed defects fixed

| Problem in 1.14.0 | Correction and evidence |
| --- | --- |
| Clicking a conversation scenario silently does nothing | A timestamp was mistaken for proof that a session already had an ID. Session creation now always assigns ID/user ID and preserves conversation metadata. Actual IndexedDB integration test and corrected browser dialogue both pass. |
| Reloading a session resets progress and creates duplicate sessions | The session constructor discarded `dayKey`. It now preserves metadata; the local calendar date is used, concurrent creation is coalesced, and older records without day keys are recovered by creation date. Reopen/advance/complete and concurrent-request tests pass. |
| A failed restore can erase all learning data | All store clears and writes now share one transaction. Invalid IDs, duplicates, missing stores and malformed core structures are rejected. A forced write failure verifies rollback of every affected store. |
| Writes report success before transaction commit | Storage promises now resolve on transaction completion. |
| Repeated clicks can submit duplicate work; delayed responses can appear under another language | Busy guards and active-language checks cover key async flows. Reference speech/recording is cleared when switching languages; an active recording is cancelled when leaving its screen. |
| Errors when choosing a conversation are hidden | The scenario picker now renders errors. |
| Several controls remain in another UI language | Added ru/en/uk strings for settings, scenario names, skills, review ratings and instructions, session goals, notices and screen headings. Stored exercise content is intentionally retained. |
| Teacher exercises omit their expected answer | A revealable guide now displays the expected answer when provided. |
| Demo replies appear to be unrestricted AI | Conversation, phrase and teacher screens explicitly identify the local template mode. |
| Initial service-worker activation can reload a user's first form | Controller-change reload is limited to already-controlled pages. |
| Service worker deletes unrelated caches and may mix installed and network code | Cleanup is limited to this app's cache prefix; navigation/assets use the installed shell. API/cross-origin requests are excluded; offline update queries fall back to cached metadata. |
| Malformed URL crashes the Node request handler | Invalid URL escapes return 400; static serving allows only app assets; disallowed cross-origin AI POSTs return 403. HTTP regression tests pass. |
| Microphone tracks can survive cancellation or recorder failure | Pending permission responses and recorder-construction failures release tracks. Recognition ending without a result now resolves. Mocked lifecycle tests pass; hardware recording is unverified. |
| README advertises obsolete 1.1.0 | Replaced with current use, deployment, backup and verification instructions. |

## Verification actually performed

### Live 1.14.0 in the browser

- First launch, release notice and onboarding.
- Created a Czech language profile with an everyday-life goal.
- Started a daily session, completed its first block, reloaded and observed lost progress.
- Opened conversation scenarios and observed that starting the café dialogue failed silently.
- Generated a Czech coffee phrase from a Russian request, saved it, and verified it in Words.
- Opened Practice and Review; revealed the expected answer.

### Corrected local copy in the browser

- Created a separate Czech test profile on an isolated localhost origin.
- Started the café conversation successfully.
- Entered and sent a Czech reply; both user and partner turns appeared.
- Confirmed the local-template notice and localized screen/scenario titles.
- Further browser operations were blocked by the administrative-policy verification failure.

### Automated checks

- Daily session persistence, completion, concurrent creation and conversation lifecycle.
- Backup round trip, invalid backup rejection and all-store rollback on failed writes.
- All nine learning languages: create profile → generate phrase → save → review → hide/re-add profile; learning history is retained.
- All eleven screens render with populated data in all three UI languages.
- Existing translation, SRS, progress, pronunciation, teacher-contract and mocked AI tests.
- Service-worker cache isolation, offline navigation/update matching and API exclusion.
- Microphone cancellation/failure and recognition-end handling with simulated devices.
- Real loopback HTTP tests for malformed URLs, protected files, origin rejection and missing AI configuration.

## Remaining external requirements and limits

- `deployment-config.js` has an empty AI backend URL. GitHub Pages currently runs local templates. No real cloud model request was possible; a deployed HTTPS backend and server-side model credentials are required.
- Local templates are finite demonstrations, not adaptive conversation or new-error detection.
- Browser/OS installation, microphone permission and audio quality need a real-device pass once browser access is restored.
- Existing release-check descriptions and stored teaching prompts are not all translated; core controls have been improved and translation tests pass.
- No user learning records were deleted during the live audit. Test material was added through the UI.

## Publication — confirmed 2026-09-03

Write access was restored and release 1.14.1 was published to main in commit
[`71847dc04a8cd79f8083cec32924290379f42691`](https://github.com/tymo1985-debug/Language-Teacher/commit/71847dc04a8cd79f8083cec32924290379f42691).

- [Release Gate](https://github.com/tymo1985-debug/Language-Teacher/actions/runs/33728640064): completed successfully.
- [GitHub Pages build and deployment](https://github.com/tymo1985-debug/Language-Teacher/actions/runs/33728639306): completed successfully.
- [Public application](https://tymo1985-debug.github.io/Language-Teacher/).

The previous publication attempt was rejected with HTTP 403. This access problem
is resolved. A new browser attempt after deployment still failed because the
browser could not verify its administrative policy. Therefore publication is
confirmed by GitHub Actions, while the full post-deployment interactive and
physical-device checks listed above remain unverified. Cloud AI still requires
a separately configured backend.
