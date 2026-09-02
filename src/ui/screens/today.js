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
  const plan=buildTodayPlan(state);

  return `<section class="stack-lg today-intelligence">
    <article class="today-focus-card ${plan.completed?"is-complete":""}">
      <div class="today-focus-copy">
        <p class="eyebrow">${active.flag} СЕГОДНЯ</p>
        <h2>${escapeHtml(plan.title)}</h2>
        <p class="today-focus-summary">${escapeHtml(plan.summary)}</p>
        ${plan.meta?`<p class="muted today-focus-meta">${escapeHtml(plan.meta)}</p>`:""}
      </div>
      ${plan.primary?`
        <button class="primary-button today-primary-action" type="button" data-route="${plan.primary.route}">
          ${escapeHtml(plan.primary.label)}
        </button>
      `:""}
    </article>

    ${plan.reasons.length?`
      <section class="today-reason-section" aria-labelledby="today-reason-title">
        <div class="section-heading today-section-heading">
          <div>
            <p class="eyebrow">ПОЧЕМУ ИМЕННО ЭТО</p>
            <h3 id="today-reason-title">Фокус выбран по вашим данным</h3>
          </div>
        </div>
        <div class="today-reason-list">
          ${plan.reasons.map(reason=>`
            <article class="today-reason">
              <span class="today-reason-icon" aria-hidden="true">${reason.icon}</span>
              <div><strong>${escapeHtml(reason.title)}</strong><span>${escapeHtml(reason.text)}</span></div>
            </article>
          `).join("")}
        </div>
      </section>
    `:""}

    ${plan.secondary.length?`
      <section aria-labelledby="today-extra-title">
        <div class="section-heading today-section-heading">
          <div>
            <p class="eyebrow">МОЖНО СДЕЛАТЬ ЕЩЁ</p>
            <h3 id="today-extra-title">Короткая дополнительная практика</h3>
          </div>
        </div>
        <div class="today-extra-grid">
          ${plan.secondary.map(item=>`
            <button class="today-extra-card" type="button" data-route="${item.route}">
              <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.text)}</small></span>
              <span class="today-extra-arrow" aria-hidden="true">→</span>
            </button>
          `).join("")}
        </div>
      </section>
    `:""}

    <section class="today-status" aria-labelledby="today-status-title">
      <div>
        <p class="eyebrow">СЕГОДНЯШНЕЕ СОСТОЯНИЕ</p>
        <h3 id="today-status-title">${escapeHtml(plan.statusTitle)}</h3>
      </div>
      <div class="today-status-items">
        ${statusItem(plan.progressText,"занятие")}
        ${statusItem(plan.reviewText,"повторение")}
        ${statusItem(plan.mistakeText,"ошибки")}
      </div>
    </section>

    <div class="today-language-footer">
      <div>
        <span class="language-flag" aria-hidden="true">${active.flag}</span>
        <span><strong>${escapeHtml(active.name)}</strong><small>${escapeHtml(active.label??"Активный язык")}</small></span>
      </div>
      <button class="secondary-button compact" id="add-language-inline">+ Язык</button>
    </div>
  </section>`;
}

export function buildTodayPlan(state){
  const session=state.todaySession;
  const summary=state.learningSummary??{};
  const due=summary.dueReviews??0;
  const mistakes=summary.mistakes??0;
  const situations=summary.situations??0;
  const progress=sessionProgress(session);
  const completed=session?.status==="completed";
  const blocks=session?.blocks??[];

  const counts={
    recall:blocks.filter(block=>block.type==="RECALL").length,
    correction:blocks.filter(block=>block.type==="CORRECTION").length,
    situation:blocks.filter(block=>block.type==="RESPOND"&&block.situationId).length,
    speak:blocks.filter(block=>block.type==="SPEAK").length
  };

  const reasons=[];
  if(counts.correction)reasons.push({
    icon:"↺",title:"Вернёмся к известной ошибке",
    text:`В занятии ${plural(counts.correction,"есть 1 точечное исправление","есть {n} точечных исправления","есть {n} точечных исправлений")}.`
  });
  if(counts.recall)reasons.push({
    icon:"◷",title:"Пора вспомнить знакомое",
    text:`${plural(counts.recall,"1 выражение подошло","{n} выражения подошли","{n} выражений подошли")} к активному воспроизведению.`
  });
  if(counts.situation)reasons.push({
    icon:"◎",title:"Практика из реальной жизни",
    text:"В занятие включена сохранённая вами жизненная ситуация."
  });
  if(reasons.length<2&&counts.speak)reasons.push({
    icon:"→",title:"Нужно использовать язык активно",
    text:`${plural(counts.speak,"1 блок просит","{n} блока просят","{n} блоков просят")} сформулировать ответ самостоятельно.`
  });
  if(!reasons.length)reasons.push({
    icon:"→",title:"Короткая активная практика",
    text:"Session Engine подготовил локальное занятие из текущего языкового профиля."
  });

  let title,summaryText,meta="",primary=null;

  if(!session){
    title="Подготавливаем сегодняшнее занятие";
    summaryText="Как только локальный Session Engine закончит подготовку, здесь появится одно главное действие.";
  }else if(!completed){
    title=progress.completed?"Продолжите с того места, где остановились":"Сегодня достаточно одного короткого занятия";
    summaryText="Language Teacher уже выбрал материал. Не нужно решать, что именно учить сейчас.";
    meta=`${progress.total} коротких блоков · около ${session.targetDuration??10} минут · ${progress.percent}% выполнено`;
    primary={route:"session",label:progress.completed?`Продолжить · осталось ${Math.max(0,progress.total-progress.completed)}`:"Начать занятие"};
  }else if(due>0){
    title="Основное занятие завершено";
    summaryText="Если есть ещё несколько минут, лучше закрепить то, что уже подошло к повторению.";
    meta=`Сегодняшнее занятие: ${progress.total} из ${progress.total} блоков завершено`;
    primary={route:"review",label:`Повторить · ${due}`};
  }else{
    title="Основное занятие на сегодня завершено";
    summaryText="Дополнительная практика не обязательна. При желании можно закончить день коротким разговором.";
    meta=`Сегодняшнее занятие: ${progress.total} из ${progress.total} блоков завершено`;
    primary={route:"conversation",label:"Короткий разговор"};
  }

  const secondary=[];
  if(primary?.route!=="review"&&due>0)secondary.push({
    route:"review",title:`Повторить ${due}`,text:"Активно вспомнить то, что подошло к повторению."
  });
  if(primary?.route!=="conversation")secondary.push({
    route:"conversation",title:"Поговорить 5 минут",
    text:mistakes>0?"Использовать язык и проверить известные слабые места.":"Короткий диалог без заранее готового ответа."
  });
  if(primary?.route!=="real-life")secondary.push({
    route:"real-life",title:"Мне нужно это сейчас",
    text:situations>0?"Подготовить новую жизненную фразу или ситуацию.":"Превратить текущую жизненную потребность в практику."
  });

  return {
    completed,title,summary:summaryText,meta,primary,reasons:reasons.slice(0,2),secondary:secondary.slice(0,2),
    statusTitle:completed?"Основная цель выполнена":"Фокус без лишнего выбора",
    progressText:session?`${progress.completed}/${progress.total} блоков`:"подготовка",
    reviewText:due?`${due} к повторению`:"ничего срочного",
    mistakeText:mistakes?`${mistakes} активных`:"нет активных"
  };
}

function statusItem(value,label){
  return `<div class="today-status-item"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;
}

function plural(n,one,few,many){
  const mod10=n%10,mod100=n%100;
  const template=mod10===1&&mod100!==11?one:(mod10>=2&&mod10<=4&&(mod100<12||mod100>14)?few:many);
  return template.replace("{n}",String(n));
}

function escapeHtml(value=""){
  return String(value??"")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
