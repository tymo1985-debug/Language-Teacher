export function renderReview(state){
  const active=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);

  if(!active){
    return `<section class="stack-lg">
      <div class="page-intro">
        <p class="eyebrow">REVIEW</p>
        <h2>Сначала добавьте язык</h2>
      </div>
    </section>`;
  }

  const current=state.reviewQueue?.[0];

  if(!current){
    return `<section class="stack-lg">
      <div class="page-intro">
        <p class="eyebrow">${active.flag} REVIEW</p>
        <h2>На сегодня всё повторено</h2>
        <p class="muted">
          Когда Learning Items станут готовы к повторению, они автоматически появятся здесь.
        </p>
      </div>
      <article class="empty-state">
        <div class="empty-icon" aria-hidden="true">✓</div>
        <h3>Очередь пуста</h3>
        <p>SRS не создаёт искусственные карточки — он работает только с вашим реальным учебным материалом.</p>
      </article>
      <button class="secondary-button" type="button" data-route="practice">Назад к практике</button>
    </section>`;
  }

  const {item,exercise}=current;
  const remaining=state.reviewQueue.length;

  return `<section class="review-shell">
    <div class="review-topline">
      <button class="text-button" type="button" data-route="practice">← Практика</button>
      <span class="pill">${remaining} в очереди</span>
    </div>

    <article class="review-card">
      <p class="eyebrow">${exercise.dimension.toUpperCase()}</p>
      <p class="review-instruction">${exercise.instruction}</p>
      <div class="review-prompt">${escapeHtml(exercise.prompt)}</div>

      ${state.reviewAnswerVisible?`
        <div class="review-answer">
          <p class="eyebrow">ОТВЕТ</p>
          <strong>${escapeHtml(exercise.answer)}</strong>
        </div>
        <div class="review-rating-grid">
          ${ratingButton("again","Again","10 мин")}
          ${ratingButton("hard","Hard","трудно")}
          ${ratingButton("good","Good","нормально")}
          ${ratingButton("easy","Easy","легко")}
        </div>
      `:`
        <button class="primary-button review-reveal" type="button" id="review-reveal">
          Показать ответ
        </button>
      `}
    </article>

    <p class="review-context muted">
      ${escapeHtml(item.type)}${item.contexts?.length?` · ${item.contexts.map(escapeHtml).join(", ")}`:""}
    </p>
  </section>`;
}

function ratingButton(value,label,hint){
  return `<button class="review-rating" type="button" data-review-rating="${value}">
    <strong>${label}</strong><small>${hint}</small>
  </button>`;
}

function escapeHtml(value=""){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
