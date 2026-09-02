export function renderPractice(state){
  const due=state.learningSummary?.dueReviews??0;
  const session=state.todaySession;
  const recording=state.speech?.capabilities?.recording;
  const hasSession=Boolean(session);
  const sessionRemaining=hasSession
    ? Math.max(0,(session.blocks?.length??0)-(session.blocks?.filter(block=>block.status==="completed").length??0))
    : 0;

  return `<section class="stack-lg guided-practice">
    <div class="page-intro">
      <p class="eyebrow">PRACTICE</p>
      <h2>Что вы хотите сделать сейчас?</h2>
      <p class="muted">
        Выберите намерение, а не внутреннюю функцию приложения.
        Language Teacher сам направит вас в подходящий режим.
      </p>
    </div>

    ${hasSession?`
      <button class="practice-recommended" type="button" data-route="session">
        <span class="practice-recommended-label">РЕКОМЕНДОВАНО СЕГОДНЯ</span>
        <span class="practice-recommended-main">
          <span>
            <strong>${session.status==="completed"?"Посмотреть сегодняшнее занятие":sessionRemaining<(session.blocks?.length??0)?"Продолжить сегодняшнее занятие":"Начать сегодняшнее занятие"}</strong>
            <small>${session.status==="completed"
              ?"Основная практика уже завершена."
              :`${session.blocks?.length??0} блоков · около ${session.targetDuration??10} минут${sessionRemaining<(session.blocks?.length??0)?` · осталось ${sessionRemaining}`:""}`}</small>
          </span>
          <span aria-hidden="true">→</span>
        </span>
      </button>
    `:""}

    <div class="practice-intent-grid">
      ${intentCard({
        route:"conversation",
        icon:"◌",
        title:"Поговорить",
        text:"Живой многоходовый диалог. Сначала отвечаете сами, потом получаете только важные исправления.",
        meta:"Разговор"
      })}
      ${intentCard({
        route:"speech",
        icon:"◖",
        title:"Потренировать произношение",
        text:"Прослушать эталон, записать себя и сравнить звучание без искусственного псевдо-скоринга.",
        meta:recording?"Микрофон доступен":"Запись зависит от устройства"
      })}
      ${intentCard({
        route:"review",
        icon:"↺",
        title:"Повторить знакомое",
        text:"Активно вспомнить выражения, которые подошли к повторению, по их слабейшему навыку.",
        meta:due?`${due} к повторению`:"Срочных повторений нет",
        quiet:due===0
      })}
      ${intentCard({
        route:"real-life",
        icon:"◎",
        title:"Мне нужно это сейчас",
        text:"Опишите реальную ситуацию и получите естественную фразу, которую можно сразу потренировать и сохранить.",
        meta:"Real Life",
        accent:true
      })}
    </div>

    <section class="practice-tools" aria-labelledby="practice-tools-title">
      <div class="section-heading guided-practice-heading">
        <div>
          <p class="eyebrow">ДОПОЛНИТЕЛЬНЫЕ ИНСТРУМЕНТЫ</p>
          <h3 id="practice-tools-title">Когда хочется выбрать формат вручную</h3>
        </div>
      </div>

      <div class="practice-tool-list">
        <button class="practice-tool-row" type="button" data-route="teacher">
          <span>
            <strong>Сформировать упражнение</strong>
            <small>AI Teacher · для конкретной темы или конструкции</small>
          </span>
          <span aria-hidden="true">→</span>
        </button>
        ${!hasSession?`
          <div class="practice-tool-row is-disabled" aria-disabled="true">
            <span>
              <strong>Сегодняшнее занятие</strong>
              <small>Session Engine ещё подготавливает локальную сессию</small>
            </span>
            <span aria-hidden="true">…</span>
          </div>
        `:""}
      </div>
    </section>
  </section>`;
}

function intentCard({route,icon,title,text,meta,accent=false,quiet=false}){
  return `<button class="practice-intent-card ${accent?"is-accent":""} ${quiet?"is-quiet":""}" type="button" data-route="${route}">
    <span class="practice-intent-icon" aria-hidden="true">${icon}</span>
    <span class="practice-intent-copy">
      <strong>${escapeHtml(title)}</strong>
      <small>${escapeHtml(text)}</small>
    </span>
    <span class="practice-intent-meta">${escapeHtml(meta)}</span>
    <span class="practice-intent-arrow" aria-hidden="true">→</span>
  </button>`;
}

function escapeHtml(value=""){
  return String(value??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
