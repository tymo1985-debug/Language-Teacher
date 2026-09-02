export function renderTeacher(state){
  const active=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);
  const ai=state.ai??{};

  if(!active){
    return `<section class="stack-lg">
      <div class="page-intro">
        <p class="eyebrow">AI TEACHER</p>
        <h2>Сначала добавьте язык</h2>
      </div>
    </section>`;
  }

  return `<section class="teacher-shell stack-lg">
    <div class="page-intro">
      <p class="eyebrow">${active.flag} AI TEACHER</p>
      <h2>Структурированный учитель, а не чат-окно</h2>
      <p class="muted">
        ${ai.remote
          ?"Активен защищённый backend proxy. Структурированный ответ проверяется перед показом и записью в learning loop."
          :"Активен безопасный local demo provider: он не отправляет данные в интернет и не является настоящей языковой моделью."}
      </p>
    </div>

    <article class="info-card">
      <div class="teacher-provider-line">
        <div>
          <p class="eyebrow">PROVIDER</p>
          <h3>${escapeHtml(ai.providerLabel??"Local architecture demo")}</h3>
        </div>
        <span class="pill">${ai.remote?"Remote":"Local"}</span>
      </div>
      <p class="muted">
        ${ai.remote
          ?"Учебный контекст отправляется вашему proxy; локальные идентификаторы не передаются модели."
          :"Выбрать настоящий AI можно в Settings после запуска backend proxy."}
      </p>
    </article>

    <article class="teacher-request-card">
      <label class="field-label" for="teacher-input">Что вы хотите потренировать?</label>
      <textarea
        id="teacher-input"
        class="teacher-input"
        rows="4"
        placeholder="Например: хочу потренироваться объяснять проблему в магазине"
      >${escapeHtml(ai.input??"")}</textarea>
      <button type="button" class="primary-button teacher-generate" id="teacher-generate">
        Подготовить упражнение
      </button>
    </article>

    ${ai.loading?`<article class="info-card"><strong>Готовлю структурированный ответ…</strong></article>`:""}

    ${ai.error?`
      <article class="teacher-error">
        <strong>AI Teacher не смог подготовить ответ</strong>
        <p>${escapeHtml(ai.error)}</p>
      </article>
    `:""}

    ${ai.response?renderResponse(ai.response):""}
  </section>`;
}

function renderResponse(response){
  return `<section class="stack-lg">
    <article class="info-card">
      <p class="eyebrow">TEACHER RESPONSE</p>
      <h3>${escapeHtml(response.message)}</h3>
    </article>

    ${response.blocks.map(block=>`
      <article class="teacher-block">
        <p class="eyebrow">${escapeHtml(block.type)}</p>
        <h3>${escapeHtml(block.title)}</h3>
        <p>${escapeHtml(block.prompt)}</p>
      </article>
    `).join("")}

    ${response.corrections?.length?`
      <section>
        <p class="eyebrow">CORRECTIONS</p>
        ${response.corrections.map(correction=>`
          <article class="teacher-correction">
            <div><span>Было</span><strong>${escapeHtml(correction.original)}</strong></div>
            <div><span>Правильно</span><strong>${escapeHtml(correction.corrected)}</strong></div>
            <div><span>Естественно</span><strong>${escapeHtml(correction.natural)}</strong></div>
            <p>${escapeHtml(correction.note)}</p>
          </article>
        `).join("")}
      </section>
    `:""}
  </section>`;
}

function escapeHtml(value=""){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
