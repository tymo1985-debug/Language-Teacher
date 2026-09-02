export const APP_VERSION = "1.11.0";
export const APP_PHASE = "Phase 18 · UI Localization Foundation";
export const APP_BUILD_DATE = "2026-09-02";
export const DB_SCHEMA_VERSION = 3;
export const RELEASE_NOTES = [
  "Добавлен единый i18n-слой для русского, английского и украинского интерфейса.",
  "Переключатель языка интерфейса теперь реально меняет header, bottom navigation, onboarding и главный экран Practice.",
  "Цели обучения и self-assessment в onboarding локализуются по стабильным ID, а не дублируются в данных профиля.",
  "HTML lang обновляется вместе с выбранным языком интерфейса.",
  "Нелокализованные экраны пока честно используют русский fallback; архитектура готова для следующего localization pass."
];
