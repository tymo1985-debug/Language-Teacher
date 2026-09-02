# Phase 7 — AI Teacher

Version: `0.7.0`

## Hotfix: update notice
Phase 6 could become unresponsive after service-worker registration because `ServiceWorkerRegistration` was stored inside application state and `getState()` uses `structuredClone()`.

Phase 7:
- keeps service-worker registration inside `update-manager.js`, outside serializable state;
- dismisses the update notice immediately;
- persists “seen version” asynchronously;
- hides update notices during onboarding.

## Included
- `AIProvider` abstraction
- `LocalDemoAIProvider`
- `ProxyAIProvider`
- Context Builder
- Teacher Engine
- structured response contract
- validation
- response parser
- safe rejection of malformed output
- AI Teacher UI screen

## Architecture

```text
UI
 ↓
Teacher Engine
 ↓
Context Builder
 ↓
AI Provider
 ↓
structured response
 ↓
validator / parser
 ↓
UI / Learning Engine
```

The UI never calls a vendor AI API directly.

## Security
No API secret is stored in the PWA. `ProxyAIProvider` targets a backend endpoint (`/api/teacher`) which can later hold provider credentials securely.

## Local demo provider
The local demo provider exists only so that:
- the response contract can be exercised;
- validation can be tested;
- AI UI can work before a backend exists.

It does not claim to be generative AI.

## Exit criteria
- provider is replaceable
- context can be built from local learning data
- valid structured output is accepted
- malformed output is rejected safely
- UI receives parsed data rather than arbitrary HTML
- no API secret appears in frontend source
- local learning remains functional without AI

## Next
Phase 8 — Conversation.
