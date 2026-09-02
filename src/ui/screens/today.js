import {sessionProgress} from "../../learning/session-engine.js";

export function renderToday(state){
  if(!state.languageProfiles.length){
    return `<section class="stack-lg">
      <article class="hero-card">
        <div>
          <p class="eyebrow">WELCOME</p>
          <h2>Выберите первый язык.</h2>
          <p class="muted">Для каждого языка Language Teacher хранит отдельные цели, навыки и будущий прогресс.</p>
        </div>
        <button class="primary-button" id="add-language-hero">+ Добавить язык</button>
      </article>
    </section>`;
  }

  const active=state.languageProfiles.find(x=>x.languageId===state.activeLanguageId)??state.languageProfiles[0];
  const session=state.todaySession;
  const progress=sessionProgress(session);
  const completed=session?.status==="completed";

  return `<section class="stack-lg">
    <article class="hero-card">
      <div>
        <p class="eyebrow">${active.flag} TODAY</p>
        <h2>${completed
          ?"Сегодняшняя практика завершена."
          :session?"Сегодняшняя практика готова.":"Готовим сегодняшнюю практику…"}</h2>
        <p class="muted">
          ${session
            ? `${session.blocks.length} коротких блоков · около ${session.targetDuration} минут · ${progress.percent}% выполнено.`
            : "Session Engine формирует занятие из вашего профиля, повторений, ошибок и сохранённых ситуаций."}
        </p>
      </div>
      ${session?`
        <button class="primary-button" type="button" data-route="session">
          ${completed?"Посмотреть результат":progress.completed?"Продолжить занятие":"Начать занятие"}
        </button>
      `:""}
    </article>

    <div class="today-metrics">
      ${metric("К повторению",state.learningSummary?.dueReviews??0)}
      ${metric("Ошибки",state.learningSummary?.mistakes??0)}
      ${metric("Занятия",state.learningSummary?.sessions??0)}
    </div>

    <section>
      <div class="section-heading">
        <div>
          <p class="eyebrow">ВАШИ ЯЗЫКИ</p>
          <h2>Отдельный прогресс для каждого</h2>
        </div>
        <button class="secondary-button compact" id="add-language-inline">+ Язык</button>
      </div>
      <div class="language-profile-grid">
        ${state.languageProfiles.map(p=>card(p,state.activeLanguageId)).join("")}
      </div>
    </section>
  </section>`;
}

function metric(label,value){
  return `<article class="metric-card"><strong>${value}</strong><span>${label}</span></article>`;
}

function card(p,activeId){
  const vals=Object.values(p.skills);
  const avg=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length*100);
  const active=p.languageId===activeId;
  return `<button class="language-profile-card ${active?"is-active":""}" data-language-select="${p.languageId}">
    <div class="language-profile-top">
      <span class="language-flag">${p.flag}</span>
      ${active?'<span class="pill active-pill">Активный</span>':""}
    </div>
    <strong>${p.name}</strong>
    <span class="muted">${p.label}</span>
    <div class="profile-summary"><span>${p.goals.length} целей</span><span>Старт ${avg}%</span></div>
  </button>`;
}
