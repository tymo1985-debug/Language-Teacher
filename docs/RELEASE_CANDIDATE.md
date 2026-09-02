# Language Teacher — Release Candidate 1.13.0

## Release status

Phase 19 is the release-candidate pass before the final deep functional audit.

The automated repository gate must pass on `main` before the candidate is treated as ready for manual audit:

```bash
npm run gate
```

The gate checks:

- centralized release version / phase consistency;
- `update.json`;
- Service Worker cache naming;
- required runtime files;
- every Service Worker `APP_SHELL` file;
- PWA manifest basics and required icon declarations;
- accidental API secrets in `deployment-config.js`;
- JavaScript / MJS syntax;
- the complete `node:test` suite.

## Manual device checks

On the real phone/browser, open **Settings → Release Check** and verify that no blocking checks fail.

Optional capabilities are allowed to be unavailable:

- SpeechRecognition;
- voice recording on unsupported browsers;
- Secure cloud AI when no backend proxy is deployed;
- network while using offline mode.

## Known intentional limitations

These are not release blockers for the local-first candidate:

1. Secure cloud AI requires a separately deployed backend proxy. GitHub Pages alone cannot run it.
2. Browser SpeechRecognition is not phoneme-level pronunciation scoring.
3. Pronunciation uses Listen → Record → Self-listen → optional recognized-text comparison.
4. Audio recordings are not included in JSON backup.
5. Local demo AI is a deterministic fallback, not a real language model.
6. Learning content itself is not forcibly translated when the interface locale changes.

## Final audit scope

The deep audit should exercise:

- fresh install and onboarding;
- adding/switching/removing language profiles;
- Today → Session completion;
- Conversation;
- Real Life save flow;
- Review/SRS including Listening;
- Pronunciation recording and fallback behavior;
- Grammar Focus;
- Library and Progress;
- backup export/restore;
- offline restart;
- update notice close/update behavior;
- ru/en/uk UI switching;
- Cloud AI disabled state without backend;
- Cloud AI real requests only after backend deployment.
