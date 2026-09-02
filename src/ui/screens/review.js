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
        <p class="muted">Когда Learning Items станут готовы к повторению, они автоматически появятся здесь.</p>
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
  const listening=exercise.dimension==="listening";

  return `<section class="review-shell">
    <div class="review-topline">
      <button class="text-button" type="button" data-route="practice">← Практика</button>
      <span class="pill">${remaining} в очереди</span>
    </div>

    <article class="review-card ${listening?"is-listening":""}">
      <p class="eyebrow">${listening?"LISTENING":exercise.dimension.toUpperCase()}</p>
      <p class="review-instruction">${escapeHtml(exercise.instruction)}</p>

      ${listening?`
        <div class="review-listening-prompt">
          <div class="review-listening-icon" aria-hidden="true">◖</div>
          <strong>${escapeHtml(exercise.prompt)}</strong>
          ${state.speech?.capabilities?.synthesis?`
            <button type="button" class="primary-button" data-speak-text="${escapeAttr(exercise.audioText??exercise.answer)}">
              ▶ Прослушать фразу
            </button>
          `:`<small class="muted">Text-to-Speech недоступен на этом устройстве. Используйте обычные Review.</small>`}
        </div>
      `:`<div class="review-prompt">${escapeHtml(exercise.prompt)}</div>`}

      ${state.reviewAnswerVisible?`
        <div class="review-answer">
          <p class="eyebrow">${listening?"ЧТО БЫЛО СКАЗАНО":"ОТВЕТ"}</p>
          <strong>${escapeHtml(exercise.answer)}</strong>
          ${listening&&exercise.meaning?`<p>${escapeHtml(exercise.meaning)}</p>`:""}
          ${listening&&state.speech?.capabilities?.synthesis?`
            <button type="button" class="text-button" data-speak-text="${escapeAttr(exercise.audioText??exercise.answer)}">▶ Прослушать ещё раз</button>
          `:""}
        </div>
        <div class="review-rating-grid">
          ${ratingButton("again",listening?"Не понял":"Again","10 мин")}
          ${ratingButton("hard",listening?"Частично":"Hard","трудно")}
          ${ratingButton("good",listening?"Услышал":"Good","нормально")}
          ${ratingButton("easy",listening?"Легко":"Easy","легко")}
        </div>
      `:`
        <button class="primary-button review-reveal" type="button" id="review-reveal">
          ${listening?"Показать текст и смысл":"Показать ответ"}
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
function escapeAttr(value=""){return escapeHtml(value);}
