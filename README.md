# Language Teacher

Phase 1 — Foundation

A local-first, multi-language, single-user-first Progressive Web App foundation for a practical personal language trainer.

## What is included

- installable PWA shell;
- responsive mobile/desktop UI;
- hash-based routing;
- centralized app state;
- IndexedDB schema v1;
- persistent basic settings;
- service worker and offline application shell;
- Today / Practice / Words / Progress / Settings navigation;
- no AI dependency;
- no speech dependency;
- no hard-coded language-learning course.

## Run locally

PWA/service-worker features require HTTP(S); do not open `index.html` directly from the filesystem.

Example:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## GitHub Pages

The project uses relative paths, so it can be hosted from a GitHub Pages project subdirectory.

## Development status

This archive implements **Phase 1 — Foundation** only.

Next planned phase: **Phase 2 — Language Profiles**.

See `docs/PROJECT_ROLE.md` and `docs/TECHNICAL_SPEC.md`.
