export const APP_VERSION = "1.10.0";
export const APP_PHASE = "Phase 17 · Release Gates";
export const APP_BUILD_DATE = "2026-09-02";
export const DB_SCHEMA_VERSION = 3;
export const RELEASE_NOTES = [
  "Добавлен единый automated Release Gate для проверки версии, phase, update.json и Service Worker cache.",
  "Перед релизом автоматически проверяется синтаксис всех JS/MJS файлов и наличие обязательных runtime-файлов.",
  "Полный набор node:test запускается одной командой npm run gate.",
  "GitHub Actions запускает тот же gate на main и pull request, чтобы release drift обнаруживался автоматически.",
  "Release Gate не меняет local-first архитектуру и не требует внешних сервисов."
];
