export function renderPractice(state){
  const due=state.learningSummary?.dueReviews??0;
  const session=state.todaySession;
  const recording=state.speech?.capabilities?.recording;

  return `<section class="stack-lg">
    <div class="page-intro">
      <p class="eyebrow">PRACTICE</p>
      <h2>Выберите короткую практику</h2>
      <p class="muted">Conversation теперь связывает AI Teacher, Speech и Mistake Memory в один поток.</p>
    </div>

    <div class="card-grid">
      <button class="feature-card" type="button" data-route="session" ${session?"":"disabled"}>
        <span class="feature-card-title">Today Session</span>
        <span class="feature-card-text">Рекомендованное занятие из ваших текущих данных.</span>
        <span class="pill">${session?`${session.blocks.length} блоков`:"Подготовка"}</span>
        <span class="feature-card-arrow">→</span>
      </button>

      <button class="feature-card" type="button" data-route="conversation">
        <span class="feature-card-title">Conversation</span>
        <span class="feature-card-text">Многоходовый диалог с исправлениями после вашего ответа.</span>
        <span class="pill">Multi-turn</span>
        <span class="feature-card-arrow">→</span>
      </button>

      <button class="feature-card" type="button" data-route="teacher">
        <span class="feature-card-title">AI Teacher</span>
        <span class="feature-card-text">Структурированные упражнения через безопасный provider layer.</span>
        <span class="pill">Provider layer</span>
        <span class="feature-card-arrow">→</span>
      </button>

      <button class="feature-card" type="button" data-route="review">
        <span class="feature-card-title">Review</span>
        <span class="feature-card-text">Интервальное повторение по слабейшему навыку памяти.</span>
        <span class="pill">${due} к повторению</span>
        <span class="feature-card-arrow">→</span>
      </button>

      <button class="feature-card" type="button" data-route="speech">
        <span class="feature-card-title">Speech Lab</span>
        <span class="feature-card-text">Запишите голос, прослушайте себя и используйте системный эталонный голос.</span>
        <span class="pill">${recording?"Микрофон поддерживается":"Проверьте устройство"}</span>
        <span class="feature-card-arrow">→</span>
      </button>

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
