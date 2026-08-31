export function renderPractice() {
  return `
    <section class="stack-lg">
      <div class="page-intro">
        <p class="eyebrow">PHASE 1</p>
        <h2>Практические режимы</h2>
        <p class="muted">
          Здесь позже появятся Speaking, Listening, Pronunciation, Review и Real Life.
          Сейчас экран проверяет навигацию и responsive shell без преждевременной учебной логики.
        </p>
      </div>

      <div class="card-grid">
        ${placeholder("Speaking", "Разговорная практика")}
        ${placeholder("Listening", "Понимание живой речи")}
        ${placeholder("Pronunciation", "Произношение и интонация")}
        ${placeholder("Review", "Интервальное повторение")}
        ${placeholder("Real Life", "Мне нужно это сейчас")}
        ${placeholder("Grammar Focus", "Короткая практическая грамматика")}
      </div>
    </section>
  `;
}

function placeholder(title, text) {
  return `
    <article class="feature-card is-static">
      <span class="feature-card-title">${title}</span>
      <span class="feature-card-text">${text}</span>
      <span class="pill">Следующая фаза</span>
    </article>
  `;
}
