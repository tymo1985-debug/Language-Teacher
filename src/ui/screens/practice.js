export function renderPractice(state){
  const due=state.learningSummary?.dueReviews??0;
  const session=state.todaySession;

  return `<section class="stack-lg">
    <div class="page-intro">
      <p class="eyebrow">PRACTICE</p>
      <h2>Выберите короткую практику</h2>
      <p class="muted">Session Engine и Review уже работают локально. Остальные режимы подключаются по следующим фазам.</p>
    </div>

    <div class="card-grid">
      <button class="feature-card" type="button" data-route="session" ${session?"":"disabled"}>
        <span class="feature-card-title">Today Session</span>
        <span class="feature-card-text">Рекомендованное занятие из ваших текущих данных.</span>
        <span class="pill">${session?`${session.blocks.length} блоков`:"Подготовка"}</span>
        <span class="feature-card-arrow" aria-hidden="true">→</span>
      </button>

      <button class="feature-card" type="button" data-route="review">
        <span class="feature-card-title">Review</span>
        <span class="feature-card-text">Интервальное повторение по слабейшему навыку памяти.</span>
        <span class="pill">${due} к повторению</span>
        <span class="feature-card-arrow" aria-hidden="true">→</span>
      </button>

      ${placeholder("Speaking","Разговорная практика")}
      ${placeholder("Listening","Понимание живой речи")}
      ${placeholder("Pronunciation","Произношение и интонация")}
      ${placeholder("Real Life","Мне нужно это сейчас")}
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
