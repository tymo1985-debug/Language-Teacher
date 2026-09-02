import {listConversationScenarios} from "../../learning/conversation-engine.js";

export function renderConversation(state){
  const active=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);
  const conversation=state.conversation?.session;
  const convoState=state.conversation??{};

  if(!active){
    return `<section class="stack-lg">
      <div class="page-intro"><p class="eyebrow">CONVERSATION</p><h2>Сначала добавьте язык</h2></div>
    </section>`;
  }

  if(!conversation){
    return scenarioPicker(active,convoState);
  }

  return `<section class="conversation-shell">
    <header class="conversation-header">
      <div>
        <p class="eyebrow">${active.flag} CONVERSATION</p>
        <h2>${escapeHtml(conversation.topic)}</h2>
        <p class="muted">Собеседник: ${escapeHtml(conversation.partner??"Partner")}</p>
      </div>
      <button type="button" class="text-button" id="conversation-finish">Завершить</button>
    </header>

    <div class="conversation-stream" id="conversation-stream">
      ${(conversation.turns??[]).map(turn=>renderTurn(turn)).join("")}
      ${convoState.loading?`
        <div class="conversation-turn is-partner is-thinking">
          <span class="turn-role">Собеседник</span>
          <p>Формулирую ответ…</p>
        </div>
      `:""}
    </div>

    ${convoState.error?`
      <div class="conversation-error">${escapeHtml(convoState.error)}</div>
    `:""}

    <div class="conversation-composer">
      <textarea
        id="conversation-input"
        class="conversation-input"
        rows="3"
        placeholder="Ответьте самостоятельно…"
        ${convoState.loading?"disabled":""}
      >${escapeHtml(convoState.input??"")}</textarea>

      <div class="conversation-actions">
        ${state.speech?.capabilities?.recognition?`
          <button type="button" class="secondary-button compact" id="conversation-dictate" ${convoState.loading?"disabled":""}>
            🎙 Продиктовать
          </button>
        `:""}

        <button type="button" class="primary-button compact-action" id="conversation-send" ${convoState.loading?"disabled":""}>
          Отправить
        </button>
      </div>

      <small class="muted">
        Сначала отвечаете вы. Исправления показываются только после ответа и только если они значимы.
      </small>
    </div>
  </section>`;
}

function scenarioPicker(active,state){
  return `<section class="stack-lg">
    <div class="page-intro">
      <p class="eyebrow">${active.flag} CONVERSATION</p>
      <h2>Выберите ситуацию</h2>
      <p class="muted">
        Диалог сохраняется локально. Local demo provider проверяет механику multi-turn;
        настоящий облачный собеседник подключается через тот же AI Provider layer.
      </p>
    </div>

    <div class="conversation-scenario-grid">
      ${listConversationScenarios().map(scenario=>`
        <button type="button" class="feature-card" data-conversation-scenario="${scenario.id}">
          <span class="feature-card-title">${escapeHtml(scenario.title)}</span>
          <span class="feature-card-text">${escapeHtml(scenario.partner)}</span>
          <span class="feature-card-arrow">→</span>
        </button>
      `).join("")}
    </div>

    ${state.lastCompleted?`
      <article class="info-card">
        <p class="eyebrow">LAST CONVERSATION</p>
        <h3>Последний разговор сохранён</h3>
        <p class="muted">Его ошибки уже доступны Mistake Memory и будущим занятиям.</p>
      </article>
    `:""}
  </section>`;
}

function renderTurn(turn){
  const user=turn.role==="user";

  return `<div class="conversation-turn ${user?"is-user":"is-partner"}">
    <span class="turn-role">${user?"Вы":"Собеседник"}</span>
    <p>${escapeHtml(turn.text)}</p>

    ${!user&&turn.corrections?.length?`
      <div class="turn-corrections">
        ${turn.corrections.map(correction=>`
          <details>
            <summary>Исправление</summary>
            <div class="correction-detail">
              <span>Было: <strong>${escapeHtml(correction.original)}</strong></span>
              <span>Правильно: <strong>${escapeHtml(correction.corrected)}</strong></span>
              ${correction.natural!==correction.corrected
                ?`<span>Естественнее: <strong>${escapeHtml(correction.natural)}</strong></span>`:""}
              <small>${escapeHtml(correction.note)}</small>
            </div>
          </details>
        `).join("")}
      </div>
    `:""}
  </div>`;
}

function escapeHtml(value=""){
  return String(value??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
