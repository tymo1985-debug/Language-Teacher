# Cloud AI preparation — 1.14.2

Status: implementation prepared; real OpenAI inference is **not yet activated**.
An OpenAI project API key is still required. GitHub access does not provide that
key. The OpenAI Developers plugin / `openai-platform-api-key` skill is unavailable
in the current session. Sites hosting instructions require that plugin for safe
key provisioning and storing `OPENAI_API_KEY` as a server secret.

The owner-only Sites project has been provisioned and its exact ID is recorded
in `.openai/hosting.json`. The server model is set to `gpt-4.1-mini`, which supports
Responses and structured outputs ([model documentation](https://developers.openai.com/api/docs/models/gpt-4.1-mini)).
The cloud build is prepared for version saving. Deployment waits for the API key;
there is no verified working cloud URL yet.

## Deployment design

- The existing GitHub Pages address retains local practice and learning data.
- The same application and its API can run on a separate, owner-only Sites origin.
  Sites authenticates online requests before the Worker. Keep access private;
  the Worker itself does not implement public user authentication or billing.
- A single Worker includes an explicit allowlist of public app assets. Source
  server modules, `.env`, package metadata and hosting metadata are not routes.
- The browser calls `/api/teacher` on its own origin; keys stay in server runtime
  secrets. Foreign origins and cross-site requests are rejected.
- New profiles default to cloud AI only when both server key and model exist.
  Existing saved AI preferences are preserved. Configuration does not prove
  that the API project has quota or model access.
- Learning data remains in the browser. Moving to a new origin requires exporting
  Settings → backup from the old app and restoring it in the new app. Then select
  Secure cloud AI if the restored preferences selected local practice.

## Verification

`npm run gate` builds the Worker and checks all 83 app-shell/service-worker routes
against source bytes, along with the existing release checks and test suite.
The local gate passed: 66 tests, 90 JS/MJS syntax checks and 82 offline-shell entries.
New tests cover structured responses for practice, conversation and real-life
modes using a fake provider; missing configuration, CORS, JSON validation, body
limits, burst limits, private-file exclusion, and error redaction.
Server and browser request timeouts now cover body reading as well as headers.

The burst limit is 30 requests per minute per Worker instance; it is not a global
quota or spending cap. The upstream output is bounded to 2,400 tokens per request.
No live API request, key provisioning or API purchase has been performed.

## Required activation steps

1. Enable OpenAI Developers and use its key skill to create/reuse a project key.
2. Store the key as the Sites secret `OPENAI_API_KEY`; set `OPENAI_MODEL` to an
   available model that supports Responses API structured output.
3. Deploy the saved build with verified owner-only access.
4. Verify a real practice response, a conversation follow-up, and a real-life
   phrase. Confirm login protection and health, then provide the working URL.

Browser testing of the new deployment remains pending; the earlier audit records
the administrative browser-tool restriction and remaining device-level checks.
