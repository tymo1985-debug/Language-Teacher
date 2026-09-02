export const APP_VERSION = "1.13.1";
export const APP_PHASE = "Phase 19.1 · Release Blockers Fix";
export const APP_BUILD_DATE = "2026-09-02";
export const DB_SCHEMA_VERSION = 3;
export const RELEASE_NOTES = [
  "Восстановлен отсутствовавший на main GitHub Actions Release Gate workflow.",
  "Node AI backend теперь по умолчанию слушает 0.0.0.0 и готов к обычному cloud web-service deployment.",
  "HOST и PORT остаются настраиваемыми через environment variables.",
  "Release Gate теперь считает workflow обязательным release-файлом.",
  "Добавлены тесты server bind configuration."
];
