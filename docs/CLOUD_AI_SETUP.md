# Cloud AI — Gemini support, 1.14.3

Google Gemini is now the default server provider. The release gate passes, and
real requests succeeded on 2026-09-03 in practice, conversation continuation and
real-life phrase modes. The Google AI Studio project was verified as **Free Tier
with billing disabled** before these requests. Russian interface explanations
and Czech learning phrases were checked against real responses.

Configure `AI_PROVIDER=gemini`, `GEMINI_MODEL=gemini-3.5-flash-lite`, and the server
secret `GEMINI_API_KEY`. Verify the actual project's Free Tier before using its
key. The application cannot determine the billing tier from the key itself.
Do not enable billing or link a paid Cloud Billing account.

An existing OpenAI key is ignored unless `AI_PROVIDER=openai` is explicitly
selected. Missing Gemini configuration and Gemini errors never trigger another
provider or paid fallback. Each action makes at most one Google request.
Google HTTP 429 produces a quota message and links to exercises without AI.

Current validation: 71 tests, 94 JS/MJS syntax checks, 82 offline-shell entries,
and 83 cloud routes. New tests cover all three Gemini teaching modes, context
and history transfer, private keys, quota exhaustion without fallback, incomplete
or blocked responses, response-body timeouts, and interface-language propagation.

Deployed browser checks, physical microphone and mobile installation are pending.
Reuse the existing Sites project and keep it owner-only as described below.

Official references:
- [Google billing and Free Tier](https://ai.google.dev/gemini-api/docs/billing)
- [Model prices](https://ai.google.dev/gemini-api/docs/pricing)
- [Structured output](https://ai.google.dev/gemini-api/docs/generate-content/structured-output)

## Historical OpenAI preparation (1.14.2)

The following records the previous OpenAI setup. For the current Gemini setup,
use the settings above. OpenAI key creation has since succeeded, but a real
OpenAI request returned exhausted prepaid credits. No funds were added.

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
