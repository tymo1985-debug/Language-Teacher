import {buildGrammarFocus} from "../../learning/grammar-focus.js";

export function renderTeacher(state){
  const active=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);
  const ai=state.ai??{};

  if(!active){
    return `<section class="stack-lg"><div class="page-intro"><p class="eyebrow">AI TEACHER</p><h2>Сначала добавьте язык</h2></div></section>`;
  }

  const grammar=buildGrammarFocus(state.learningSummary);

  return `<section class="teacher-shell stack-lg">
    <div class="page-intro">
      <p class="eyebrow">${active.flag} FOCUSED PRACTICE</p>
      <h2>Короткое объяснение → практика → обратная связь</h2>
      <p class="muted">
        ${ai.remote
          ?"Secure cloud AI может подготовить упражнение по вашему реальному контексту и Mistake Memory."
          :"Local demo показывает механику. Для полноценного персонального объяснения нужен подключённый Secure cloud backend."}
      </p>
    </div>

    <article class="info-card">
      <div class="teacher-provider-line">
        <div><p class="eyebrow">GRAMMAR FOCUS</p><h3>${escapeHtml(grammar.title)}</h3></div>
        <span class="pill">${grammar.available?"From practice":"Waiting for data"}</span>
      </div>
      <p class="muted">${escapeHtml(grammar.summary)}</p>

      ${grammar.mistake?`
        <div class="teacher-correction">
          <div><span>Было</span><strong>${escapeHtml(grammar.mistake.original)}</strong></div>
          <div><span>Лучше</span><strong>${escapeHtml(grammar.mistake.correct)}</strong></div>
          ${grammar.mistake.pattern?`<p>${escapeHtml(grammar.mistake.pattern)}</p>`:""}
        </div>
      `:""}

      <details class="session-answer">
        <summary>Что попросить у учителя</summary>
        <p>${escapeHtml(grammar.prompt)}</p>
      </details>
    </article>

    <article class="info-card">
      <div class="teacher-provider-line">
        <div><p class="eyebrow">PROVIDER</p><h3>${escapeHtml(ai.providerLabel??"Local architecture demo")}</h3></div>
        <span class="pill">${ai.remote?"Remote":"Local"}</span>
      </div>
      <p class="muted">
        ${ai.remote
          ?"Учебный контекст отправляется вашему proxy; локальные идентификаторы не передаются модели."
          :"Настоящий AI подключается только через безопасный backend proxy."}
      </p>
    </article>

    <article class="teacher-request-card">
      <label class="field-label" for="teacher-input">Что вы хотите потренировать?</label>
      <textarea id="teacher-input" class="teacher-input" rows="4"
        placeholder="Например: хочу коротко потренировать порядок слов в реальном разговоре">${escapeHtml(ai.input??"")}</textarea>
      <p class="muted">Лучше одна конструкция за раз. Language Teacher не превращает этот экран в учебник грамматики.</p>
      <button type="button" class="primary-button teacher-generate" id="teacher-generate">Подготовить короткую практику</button>
    </article>

    ${ai.loading?`<article class="info-card"><strong>Готовлю структурированную практику…</strong></article>`:""}

    ${ai.error?`<article class="teacher-error"><strong>AI Teacher не смог подготовить ответ</strong><p>${escapeHtml(ai.error)}</p></article>`:""}

    ${ai.response?renderResponse(ai.response):""}
  </section>`;
}

function renderResponse(response){
  return `<section class="stack-lg">
    <article class="info-card"><p class="eyebrow">TEACHER RESPONSE</p><h3>${escapeHtml(response.message)}</h3></article>

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
  return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
