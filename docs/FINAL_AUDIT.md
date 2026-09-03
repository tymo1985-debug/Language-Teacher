> Superseded by [the 1.14.1 user audit](AUDIT_1.14.1.md), which found additional persistence failures in this release.

# Language Teacher — Final Audit / Release 1.14.0

## Result

Repository CI for 1.13.2 was green, but the final functional audit found two issues that automated tests had not protected:

1. **Localization regression:** Phase 18.1 replaced the translation catalog but dropped the earlier foundation keys used by Header, Bottom Navigation, Onboarding, Practice and Settings. The UI could therefore render raw keys such as `nav_today` or `practice_title`.
2. **Restore safety:** backup validation checked store arrays but did not validate every record before clearing local stores. A malformed record could fail after the destructive clear had already started.

Both are fixed in 1.14.0.

## New release protections

- the complete foundation + full-screen ru/en/uk catalogs are merged;
- `hasTranslation()` makes translation-contract tests explicit;
- tests cover every core foundation key in all three interface languages;
- portable backup record validation happens before any store is cleared;
- malformed backup records are rejected before destructive restore;
- the new backup validation module is included in the offline Service Worker shell.

## Release gates already verified before this patch

The 1.13.2 GitHub `Release Gate` completed successfully on `main`, and the matching GitHub Pages deployment also completed successfully.

## Intentional non-blocking limitations

- Secure cloud AI still requires a separately deployed backend and a configured public proxy URL.
- Browser SpeechRecognition remains optional and is not pronunciation scoring.
- Audio recordings are intentionally excluded from JSON backup.
- Learning content is not forcibly translated when UI language changes.
- Local demo AI is a fallback, not a real language model.

## Final manual smoke test after upload

1. Switch UI through Русский → English → Українська and confirm no raw i18n keys are visible.
2. Add a language and complete one Today Session block.
3. Open Conversation, Real Life, Review and Pronunciation.
4. Export backup, then restore that exported JSON.
5. Reload once online and once offline.
6. In Settings run Release Check.
7. Confirm GitHub Actions Release Gate is green.

If those checks are clean, 1.14.0 is the final release candidate intended for normal use.
