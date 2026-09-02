export const APP_VERSION = "1.6.1";
export const APP_PHASE = "Phase 13.1 · Cloud AI Deployment Safety";
export const APP_BUILD_DATE = "2026-09-02";
export const DB_SCHEMA_VERSION = 3;
export const RELEASE_NOTES = [
  "Secure cloud AI больше не предлагается как доступный режим, если backend proxy не подключён.",
  "GitHub Pages и другие статические публикации автоматически остаются в Local mode вместо ошибки 405.",
  "Добавлен публичный deployment-config.js для адреса внешнего AI proxy без хранения секретов в PWA.",
  "Backend получил health endpoint и безопасную CORS-настройку для отдельного cloud deployment.",
  "Ошибка 404/405 AI proxy теперь объясняется как отсутствие backend, а не как неизвестная ошибка AI."
];
