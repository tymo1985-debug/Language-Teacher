export const APP_VERSION = "1.7.0";
export const APP_PHASE = "Phase 14 · Speech / Pronunciation";
export const APP_BUILD_DATE = "2026-09-02";
export const DB_SCHEMA_VERSION = 3;
export const RELEASE_NOTES = [
  "Speech Lab превращён в понятный цикл произношения: слушать → говорить → слушать себя → при желании проверить распознанные слова.",
  "Браузерное SpeechRecognition больше не выглядит как pronunciation score и явно используется только как проверка понятности текста.",
  "Добавлена нейтральная оценка совпадения распознанных слов с эталонной фразой без псевдо-фонемного scoring.",
  "MediaRecorder и самопрослушивание остаются основным local-first методом тренировки.",
  "SpeechRecognition по-прежнему необязателен: весь основной pronunciation flow работает без него."
];
