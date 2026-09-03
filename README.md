# Language Teacher 1.14.1

[Open the PWA](https://tymo1985-debug.github.io/Language-Teacher/)

A personal language practice PWA with local learning data, daily sessions,
conversation practice, phrase saving, spaced repetition, and optional cloud AI.
The interface supports Russian, English and Ukrainian; nine learning languages
are available. See [the audit](docs/AUDIT_1.14.1.md) for verified scenarios and limits.

## Start practising

1. Add a learning language and choose your goals.
2. Complete today's short session, or choose a practice mode.
3. In **I need this right now**, describe a situation and save the phrase.
4. Open **Words** to see your material and **Practice → Review** to recall it.
5. Export your backup periodically from **Settings**.

The public GitHub Pages deployment currently uses **local templates**. These are
limited preset examples, not a general AI teacher. Open-ended dialogue and new
error correction require a separately configured AI backend. The interface
identifies this mode explicitly.

## Run locally

Requires Node.js 18 or newer (CI uses Node.js 22).

```sh
npm ci
npm start
```

Open `http://127.0.0.1:8787`. For a loopback-only server:

```sh
HOST=127.0.0.1 npm start
```

The runtime has no third-party production dependencies. The test suite uses
`fake-indexeddb` to exercise actual storage transactions.

## Optional cloud AI

Set these environment values **on the server**:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` — a model available to your OpenAI project
- `AI_ALLOWED_ORIGINS=https://tymo1985-debug.github.io`
- `PORT` / `HOST` if required by your hosting provider

Start the Node server with `npm start`. Its `/api/health` reports whether the
key and model are configured. It does not prove upstream model availability.
Set `aiProxyBaseUrl` in `deployment-config.js` to the backend's public HTTPS
origin, then choose **Secure cloud AI** in Settings. No key belongs in that file,
the PWA, a backup or the repository. Cloud requests send learning text and recent
conversation through the configured backend.

## Offline and updates

Open the app online once to install its offline resources. Sessions, saved phrases
and reviews are stored on this device in IndexedDB. Install from the browser menu
when your browser supports it. Updates activate through the update notice.
Cloud AI needs a network connection. Speech voices and recognition depend on the
browser/device; recognition is not a pronunciation score.

## Backup and restore

**Settings → Export JSON** includes learning records and settings, excluding audio.
Restore requires a complete backup, validates record keys and core structures, and
replaces stores in one transaction. Any failed write rolls the entire restore back.
Removing a language profile hides it; adding that language again restores access
to its learning history.

## Verification

```sh
npm run gate
```

The gate checks release metadata, manifest, offline assets, syntax and tests.
Tests cover session persistence, dialogue lifecycle, backup rollback, SRS,
localization, voice cleanup and HTTP endpoints. HTTP tests bind an ephemeral
loopback port. CI installs locked test dependencies before running the gate.
