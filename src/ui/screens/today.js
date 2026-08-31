export function renderToday(state) {
  return `
    <section class="stack-lg">
      <article class="hero-card">
        <div>
          <p class="eyebrow">FOUNDATION PREVIEW</p>
          <h2>Начнём говорить, а не набирать очки.</h2>
          <p class="muted">
            Это базовый экран Language Teacher. Учебная логика появится в следующих фазах,
            а фундамент PWA уже отделён от неё.
          </p>
        </div>
        <button class="primary-button" type="button" data-route="practice">
          Открыть практику
        </button>
      </article>

      <section>
        <div class="section-heading">
          <div>
            <p class="eyebrow">БЫСТРЫЙ ДОСТУП</p>
            <h2>Основа интерфейса</h2>
          </div>
        </div>

        <div class="card-grid">
          ${quickCard("Практика", "Будущие speaking, listening и review.", "practice")}
          ${quickCard("Слова", "Learning Items и полезные языковые chunks.", "words")}
          ${quickCard("Прогресс", "Реальные навыки вместо XP.", "progress")}
          ${quickCard("Настройки", "Локальные параметры сохраняются в IndexedDB.", "settings")}
        </div>
      </section>

      <aside class="info-strip">
        <strong>${state.storageReady ? "Локальное хранилище готово" : "Локальное хранилище инициализируется"}</strong>
        <span>${state.online ? "Сеть доступна." : "Приложение работает без сети."}</span>
      </aside>
    </section>
  `;
}

function quickCard(title, text, route) {
  return `
    <button class="feature-card" type="button" data-route="${route}">
      <span class="feature-card-title">${title}</span>
      <span class="feature-card-text">${text}</span>
      <span class="feature-card-arrow" aria-hidden="true">→</span>
    </button>
  `;
}
