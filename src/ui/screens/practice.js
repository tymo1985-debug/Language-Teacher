export function renderPractice(state){
  const due=state.learningSummary?.dueReviews??0;
  const session=state.todaySession;
  const recording=state.speech?.capabilities?.recording;

  return `<section class="stack-lg">
    <div class="page-intro">
      <p class="eyebrow">PRACTICE</p>
      <h2>Выберите короткую практику</h2>
      <p class="muted">Real Life превращает сегодняшнюю реальную потребность в будущий учебный материал.</p>
    </div>

    <div class="card-grid">
      <button class="feature-card real-life-feature" type="button" data-route="real-life">
        <span class="feature-card-title">Real Life</span>
        <span class="feature-card-text">Мне нужно это сейчас — получить фразу, произнести и сохранить.</span>
        <span class="pill">Практика сейчас</span>
        <span class="feature-card-arrow">→</span>
      </button>

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
    </div>
  </section>`;
}
