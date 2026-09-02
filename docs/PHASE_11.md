# Phase 11 — Secure Cloud AI

Version: `1.1.0`

## Included

- server-side `/api/teacher` proxy;
- OpenAI Responses API integration with Structured Outputs;
- server-only `OPENAI_API_KEY` and explicit `OPENAI_MODEL` configuration;
- `store: false` for model requests;
- removal of local user, profile, record and turn IDs before upstream requests;
- request size limit, timeout and small in-memory rate limit;
- server-side and frontend response validation;
- persistent provider selection in Settings;
- clear Local demo / Secure cloud AI labeling;
- offline-safe Local demo fallback;
- automated contract and Session Engine tests.

## Today Session hotfix

A completed Today Session was previously excluded when the app refreshed learning data. The engine then created a second session for the same language and day, returning the UI to block `1 / 2`.

Phase 11 keeps one Today Session per language and day, including its completed state. The advance action now has busy/error feedback and updates summaries without regenerating the session.

## Security and privacy

- no API key is accepted or stored by the frontend;
- the bundled server binds to `127.0.0.1` by default;
- hidden files and server/test sources are not served as static assets;
- model output must match the structured teacher contract;
- local identifiers are stripped before the request reaches OpenAI;
- personalized learning text can still leave the device when cloud mode is selected.

## Configuration

```text
OPENAI_API_KEY=required
OPENAI_MODEL=required
PORT=8787
OPENAI_API_URL=https://api.openai.com/v1/responses
AI_REQUEST_TIMEOUT_MS=30000
```

The model is intentionally explicit rather than silently defaulted, so deployment controls cost and availability.
