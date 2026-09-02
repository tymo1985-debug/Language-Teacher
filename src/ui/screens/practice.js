export function renderPractice(state){
  const due=state.learningSummary?.dueReviews??0;

  return `<section class="stack-lg">
    <div class="page-intro">
      <p class="eyebrow">PRACTICE</p>
      <h2>Выберите короткую практику</h2>
      <p class="muted">
        Review уже работает локально. Остальные режимы будут подключаться по следующим фазам.
      </p>
    </div>

    <div class="card-grid">
      ${placeholder("Speaking","Разговорная практика")}
      ${placeholder("Listening","Понимание живой речи")}
      ${placeholder("Pronunciation","Произношение и интонация")}
      <button class="feature-card" type="button" data-route="review">
        <span class="feature-card-title">Review</span>
        <span class="feature-card-text">Интервальное повторение по слабейшему навыку памяти.</span>
        <span class="pill">${due} к повторению</span>
        <span class="feature-card-arrow" aria-hidden="true">→</span>
      </button>
      ${placeholder("Real Life","Мне нужно это сейчас")}
      ${placeholder("Grammar Focus","Короткая практическая грамматика")}
    </div>
  </section>`;
}

function placeholder(title,text){
  return `<article class="feature-card is-static">
    <span class="feature-card-title">${title}</span>
    <span class="feature-card-text">${text}</span>
    <span class="pill">Следующая фаза</span>
  </article>`;
}
