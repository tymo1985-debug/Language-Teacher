import {t} from "../../i18n/i18n.js";

export function renderPractice(state){
  const due=state.learningSummary?.dueReviews??0;
  const session=state.todaySession;
  const recording=state.speech?.capabilities?.recording;
  const hasSession=Boolean(session);
  const sessionRemaining=hasSession
    ?Math.max(0,(session.blocks?.length??0)-(session.blocks?.filter(block=>block.status==="completed").length??0))
    :0;
  const grammarMistakes=state.learningSummary?.library?.mistakes?.length??0;

  return `<section class="stack-lg guided-practice">
    <div class="page-intro">
      <p class="eyebrow">PRACTICE</p>
      <h2>${t("practice_title")}</h2>
      <p class="muted">${t("practice_intro")}</p>
    </div>

    ${hasSession?`
      <button class="practice-recommended" type="button" data-route="session">
        <span class="practice-recommended-label">${t("recommended")}</span>
        <span class="practice-recommended-main">
          <span>
            <strong>${session.status==="completed"?t("view_today"):sessionRemaining<(session.blocks?.length??0)?t("continue_today"):t("start_today")}</strong>
            <small>${session.status==="completed"
              ?t("completed_today")
              :`${session.blocks?.length??0} ${t("blocks")} · ≈ ${session.targetDuration??10} min${sessionRemaining<(session.blocks?.length??0)?` · ${t("remaining")} ${sessionRemaining}`:""}`}</small>
          </span><span aria-hidden="true">→</span>
        </span>
      </button>`:""}

    <div class="practice-intent-grid">
      ${intentCard({route:"conversation",icon:"◌",title:t("talk"),text:t("talk_text"),meta:"Conversation"})}
      ${intentCard({route:"speech",icon:"◖",title:t("pronunciation"),text:t("pronunciation_text"),meta:recording?"Mic":"Speech"})}
      ${intentCard({route:"review",icon:"↺",title:t("review"),text:t("review_text"),meta:due?`${due} ${t("due")}`:t("no_due"),quiet:due===0})}
      ${intentCard({route:"real-life",icon:"◎",title:t("real_life"),text:t("real_life_text"),meta:"Real Life",accent:true})}
      ${intentCard({route:"teacher",icon:"Aa",title:t("grammar"),text:grammarMistakes?t("grammar_text"):t("grammar_empty"),meta:grammarMistakes?`${grammarMistakes} Mistake Memory`:"Grammar Focus"})}
    </div>

    <section class="practice-tools" aria-labelledby="practice-tools-title">
      <div class="section-heading guided-practice-heading"><div><p class="eyebrow">${t("tools")}</p><h3 id="practice-tools-title">${t("tools_title")}</h3></div></div>
      <div class="practice-tool-list">
        <button class="practice-tool-row" type="button" data-route="teacher">
          <span><strong>${t("custom_exercise")}</strong><small>${t("custom_exercise_hint")}</small></span><span aria-hidden="true">→</span>
        </button>
        ${!hasSession?`<div class="practice-tool-row is-disabled" aria-disabled="true"><span><strong>Today Session</strong><small>${t("session_preparing")}</small></span><span aria-hidden="true">…</span></div>`:""}
      </div>
    </section>
  </section>`;
}

function intentCard({route,icon,title,text,meta,accent=false,quiet=false}){
  return `<button class="practice-intent-card ${accent?"is-accent":""} ${quiet?"is-quiet":""}" type="button" data-route="${route}">
    <span class="practice-intent-icon" aria-hidden="true">${icon}</span>
    <span class="practice-intent-copy"><strong>${escapeHtml(title)}</strong><small>${escapeHtml(text)}</small></span>
    <span class="practice-intent-meta">${escapeHtml(meta)}</span><span class="practice-intent-arrow" aria-hidden="true">→</span>
  </button>`;
}
function escapeHtml(value=""){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
