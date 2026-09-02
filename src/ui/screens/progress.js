import {buildProgressSnapshot} from "../../learning/progress-engine.js";

const SKILL_META={
  speaking:{label:"Speaking",detail:"Активная речь"},
  listening:{label:"Listening",detail:"Понимание на слух"},
  pronunciation:{label:"Pronunciation",detail:"Произношение"},
  vocabulary:{label:"Vocabulary",detail:"Используемая лексика"},
  grammar:{label:"Grammar",detail:"Практические конструкции"}
};

export function renderProgress(state){
  const active=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);
  if(!active)return `<section class="stack-lg"><div class="page-intro"><p class="eyebrow">REAL PROGRESS</p><h2>Сначала добавьте язык</h2></div></section>`;

  const evidence=state.learningSummary?.progressEvidence??{};
  const baseline=state.learningSummary?.progress?.skills??active.skills??{};
  const snapshot=buildProgressSnapshot({
    baselineSkills:baseline,
    learningItems:evidence.learningItems??[],
    reviews:evidence.reviews??[],
    sessions:evidence.sessions??[],
    mistakes:evidence.mistakes??[],
    situations:evidence.situations??[]
  });

  const hasPractice=Object.values(snapshot.skills).some(skill=>skill.source==="practice");
  const activity=snapshot.activity;

  return `<section class="stack-lg meaningful-progress">
    <div class="page-intro">
      <p class="eyebrow">${active.flag} REAL PROGRESS</p>
      <h2>Что уже получается на практике</h2>
      <p class="muted">
        ${hasPractice
          ?"Навыки ниже опираются на сохранённые результаты реальной практики. Где данных пока мало, остаётся исходная оценка профиля."
          :"Пока недостаточно результатов практики для обновления всех навыков. Начальные значения остаются ориентиром до появления реальных данных."}
      </p>
    </div>

    <div class="progress-evidence-strip">
      ${evidenceMetric(activity.completedSessions,"занятий","завершено")}
      ${evidenceMetric(activity.conversations,"разговоров","завершено")}
      ${evidenceMetric(activity.reviews,"повторений","записано")}
      ${evidenceMetric(activity.learningItems,"выражений","в библиотеке")}
    </div>

    <section class="progress-panel" aria-labelledby="progress-skills-title">
      <div class="section-heading progress-heading">
        <div><p class="eyebrow">НАВЫКИ</p><h3 id="progress-skills-title">Текущая картина</h3></div>
      </div>
      <div class="meaningful-skill-list">
        ${Object.entries(SKILL_META).map(([key,meta])=>skillRow(meta,snapshot.skills[key])).join("")}
      </div>
      <p class="progress-method-note">
        Значок «по практике» означает, что показатель рассчитан из памяти Learning Items/Review. «Стартовая оценка» сохраняется, пока таких данных нет.
      </p>
    </section>

    <section class="progress-panel" aria-labelledby="progress-capabilities-title">
      <div class="section-heading progress-heading">
        <div><p class="eyebrow">РЕАЛЬНЫЕ ВОЗМОЖНОСТИ</p><h3 id="progress-capabilities-title">Что вы уже тренировались делать</h3></div>
      </div>
      <div class="capability-list">
        ${snapshot.capabilities.map(renderCapability).join("")}
      </div>
    </section>

    ${activity.activeMistakes?`
      <article class="progress-attention-card">
        <span class="progress-attention-icon" aria-hidden="true">↺</span>
        <div>
          <strong>${activity.activeMistakes} ${word(activity.activeMistakes,"активная ошибка","активные ошибки","активных ошибок")}</strong>
          <p>Это не штраф к прогрессу. Mistake Memory использует их как ориентир для следующих занятий.</p>
        </div>
        <button class="secondary-button compact" type="button" data-route="words">Открыть библиотеку</button>
      </article>
    `:""}
  </section>`;
}

function skillRow(meta,skill){
  const percent=Math.round((skill?.value??0)*100);
  return `<article class="meaningful-skill-row">
    <div class="meaningful-skill-meta">
      <span><strong>${meta.label}</strong><small>${meta.detail}</small></span>
      <span><strong>${level(skill?.value??0)}</strong><small>${skill?.source==="practice"?`по практике · ${skill.evidenceCount}`:"стартовая оценка"}</small></span>
    </div>
    <div class="progress-track" aria-label="${meta.label}: ${percent}%"><span style="width:${percent}%"></span></div>
  </article>`;
}

function renderCapability(item){
  const label=({good:"Уже практикуется",developing:"Развивается","not-practiced":"Ещё не практиковалось"})[item.status]??"Развивается";
  return `<article class="capability-row">
    <span class="capability-state ${item.status}" aria-hidden="true"></span>
    <div><strong>${item.title}</strong><small>${item.note}</small></div>
    <span>${label}</span>
  </article>`;
}

function evidenceMetric(value,label,note){
  return `<article><strong>${value}</strong><span>${label}</span><small>${note}</small></article>`;
}

function level(value){
  if(value>=.78)return "Сильная сторона";
  if(value>=.58)return "Уверенно";
  if(value>=.36)return "Развивается";
  if(value>0)return "Начинается";
  return "Нет данных";
}
function word(n,one,few,many){
  const m10=n%10,m100=n%100;
  return m10===1&&m100!==11?one:(m10>=2&&m10<=4&&(m100<12||m100>14)?few:many);
}
