import {currentSessionBlock,sessionProgress} from "../../learning/session-engine.js";
import {renderVoiceRecorder} from "../components/voice-recorder.js";

const VOICE_TYPES=new Set(["SPEAK","RESPOND","CORRECTION","RECALL"]);

export function renderSession(state){
  const active=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);
  const session=state.todaySession;

  if(!active||!session){
    return `<section class="stack-lg">
      <div class="page-intro">
        <p class="eyebrow">SESSION</p>
        <h2>Занятие пока не готово</h2>
        <button class="secondary-button" type="button" data-route="today">Вернуться на Today</button>
      </div>
    </section>`;
  }

  const progress=sessionProgress(session);
  const block=currentSessionBlock(session);

  if(!block){
    return `<section class="session-shell">
      <article class="session-complete-card">
        <div class="empty-icon" aria-hidden="true">✓</div>
        <p class="eyebrow">${active.flag} SESSION COMPLETE</p>
        <h2>Занятие завершено</h2>
        <p class="muted">Все ${progress.total} блоков выполнены. Результат сохранён локально.</p>
        <button class="primary-button" type="button" data-route="today">Вернуться на Today</button>
      </article>
    </section>`;
  }

  const voiceBlock=VOICE_TYPES.has(block.type);

  return `<section class="session-shell">
    <div class="session-topline">
      <button class="text-button" type="button" data-route="today">← Today</button>
      <span class="pill">${progress.completed+1} / ${progress.total}</span>
    </div>

    <div class="session-progress-track" aria-label="Прогресс занятия ${progress.percent}%">
      <span style="width:${progress.percent}%"></span>
    </div>

    <article class="session-block-card">
      <p class="eyebrow">${escapeHtml(block.type)}</p>
      <h2>${escapeHtml(block.title)}</h2>
      <p class="session-prompt">${escapeHtml(block.prompt)}</p>

      ${block.cue?`<div class="session-cue">${escapeHtml(block.cue)}</div>`:""}

      ${block.expectedAnswer?`
        <details class="session-answer">
          <summary>Показать ориентир</summary>
          <p>${escapeHtml(block.expectedAnswer)}</p>
          ${state.speech?.capabilities?.synthesis?`
            <button type="button" class="text-button speech-reference-button" data-speak-text="${escapeAttr(block.expectedAnswer)}">
              ▶ Прослушать ориентир
            </button>
          `:""}
        </details>
      `:""}

      ${voiceBlock?renderVoiceRecorder(state,{compact:true}):""}

      <button class="primary-button session-next" type="button" id="session-next"
        ${state.sessionAdvancing?'disabled aria-busy="true"':""}>
        ${state.sessionAdvancing
          ?"Сохраняю…"
          :progress.completed+1===progress.total?"Завершить занятие":"Готово · дальше"}
      </button>
    </article>

    <p class="muted session-note">
      Запись остаётся локальной в текущей сессии интерфейса. Автоматическая оценка произношения ещё не выполняется.
    </p>
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
function escapeAttr(value=""){return escapeHtml(value);}
