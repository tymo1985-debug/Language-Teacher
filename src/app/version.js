export const APP_VERSION = "1.13.0";
export const APP_PHASE = "Phase 19 · Final Polish / Release Candidate";
export const APP_BUILD_DATE = "2026-09-02";
export const DB_SCHEMA_VERSION = 3;
export const RELEASE_NOTES = [
  "Release Check теперь проверяет реальную регистрацию Service Worker, offline cache, manifest, IndexedDB, storage и fallbacks.",
  "Release Gate проверяет каждый файл APP_SHELL, PWA manifest и отсутствие API-секретов в публичном deployment-config.",
  "Settings снова показывает подробный результат каждой release-проверки и отделяет блокирующие проблемы от optional capabilities.",
  "Добавлен документ Release Candidate с известными ограничениями и финальным manual audit scope.",
  "Версия 1.13.0 предназначена для глубокого функционального аудита перед финальным выпуском."
];
