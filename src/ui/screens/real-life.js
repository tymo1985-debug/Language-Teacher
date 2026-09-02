import {renderVoiceRecorder} from "../components/voice-recorder.js";

export function renderRealLife(state){
  const active=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);
  const realLife=state.realLife??{};

  if(!active){
    return `<section class="stack-lg">
      <div class="page-intro"><p class="eyebrow">REAL LIFE</p><h2>Сначала добавьте язык</h2></div>
    </section>`;
  }

  return `<section class="real-life-shell stack-lg">
    <div class="page-intro">
      <p class="eyebrow">${active.flag} I NEED THIS NOW</p>
      <h2>Мне нужно это сейчас</h2>
      <p class="muted">
        Опишите реальную ситуацию обычными словами. Language Teacher даст короткую фразу,
        поможет произнести её и предложит сохранить ситуацию для будущей практики.
      </p>
    </div>

    <article class="real-life-request">
      <label class="field-label" for="real-life-input">Что вам нужно сказать?</label>
      <textarea
        id="real-life-input"
        class="real-life-input"
        rows="4"
        placeholder="Например: под раковиной течёт вода, мне нужно объяснить это хозяину квартиры"
      >${escapeHtml(realLife.input??"")}</textarea>

      <div class="real-life-actions">
        ${state.speech?.capabilities?.recognition?`
          <button type="button" class="secondary-button compact" id="real-life-dictate">
            🎙 Продиктовать
          </button>
        `:""}
        <button type="button" class="primary-button compact-action" id="real-life-generate" ${realLife.loading?"disabled":""}>
          ${realLife.loading?"Готовлю…":"Получить фразу"}
        </button>
      </div>
    </article>

    ${realLife.error?`
      <div class="real-life-error">
        <strong>Не удалось подготовить фразу</strong>
        <p>${escapeHtml(realLife.error)}</p>
      </div>
    `:""}

    ${realLife.result?renderResult(state,realLife):""}

    ${realLife.saved?`
      <article class="real-life-saved">
        <strong>✓ Сохранено для будущей практики</strong>
        <p>Ситуация уже доступна Session Engine, а фраза — Review/SRS.</p>
      </article>
    `:""}
  </section>`;
}

function renderResult(state,realLife){
  const result=realLife.result;

  return `<section class="stack-lg">
    <article class="real-life-phrase-card">
      <p class="eyebrow">USE THIS NOW</p>
      <h3>${escapeHtml(result.teacherMessage)}</h3>

      ${result.phrase?`
        <div class="real-life-phrase">${escapeHtml(result.phrase)}</div>
        <div class="real-life-phrase-actions">
          ${state.speech?.capabilities?.synthesis?`
            <button type="button" class="secondary-button" data-speak-text="${escapeAttr(result.phrase)}">
              ▶ Прослушать
            </button>
          `:""}
          <button type="button" class="secondary-button" id="real-life-save" ${realLife.saved?"disabled":""}>
            ${realLife.saved?"Сохранено":"Сохранить для практики"}
          </button>
        </div>
      `:`
        <p class="muted">
          Текущий provider не вернул готовую фразу. Ситуацию всё равно можно сохранить;
          настоящий cloud AI позже сможет обработать произвольный запрос.
        </p>
        <button type="button" class="secondary-button" id="real-life-save" ${realLife.saved?"disabled":""}>
          ${realLife.saved?"Сохранено":"Сохранить ситуацию"}
        </button>
      `}
    </article>

    ${result.phrase?renderVoiceRecorder(state,{compact:true}):""}

    ${result.miniDialog?.length?`
      <article class="info-card">
        <p class="eyebrow">MINI DIALOG</p>
        <h3>Попробуйте продолжить</h3>
        ${result.miniDialog.map(item=>`
          <div class="real-life-dialog-row">
            <strong>${escapeHtml(item.prompt)}</strong>
            ${item.answer?`<span>${escapeHtml(item.answer)}</span>`:""}
          </div>
        `).join("")}
      </article>
    `:""}
  </section>`;
}

function escapeHtml(value=""){
  return String(value??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function escapeAttr(value=""){return escapeHtml(value);}
