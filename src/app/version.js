export const APP_VERSION = "1.14.0";
export const APP_PHASE = "Final Release · Functional Audit";
export const APP_BUILD_DATE = "2026-09-02";
export const DB_SCHEMA_VERSION = 3;
export const RELEASE_NOTES = [
  "Финальный аудит восстановил полный набор ru/en/uk ключей для Header, Navigation, Onboarding, Practice и Settings.",
  "Добавлен translation contract, который не позволяет core UI снова показывать сырые ключи вроде nav_today.",
  "Backup restore теперь валидирует все записи до первого destructive clear, защищая локальные данные от частично повреждённого backup.",
  "Новый backup-validation модуль включён в offline shell.",
  "1.14.0 объединяет финальный corrective cycle и выпуск в один релиз."
];
