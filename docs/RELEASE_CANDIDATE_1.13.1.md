# Release Candidate corrective note — 1.13.1

Two release blockers found during the first repository-level finish audit were corrected:

1. The `Release Gate` GitHub Actions workflow was not present on `main`, so automated CI was not actually running even though `npm run gate` existed.
2. The Node AI backend listened only on `127.0.0.1`, which is suitable for local development but prevents normal cloud web-service deployment.

The server now binds to `0.0.0.0` by default and still supports explicit `HOST` / `PORT` overrides.

For a hosted backend, configure:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `AI_ALLOWED_ORIGINS`
- optional `HOST`
- platform-provided `PORT`

The public PWA still contains no API secret.
