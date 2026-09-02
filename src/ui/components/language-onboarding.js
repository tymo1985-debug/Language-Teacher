import {LANGUAGE_CATALOG,LEARNING_GOALS,SELF_ASSESSMENT} from "../../language/language-catalog.js";
import {t,translateAssessment,translateGoal} from "../../i18n/i18n.js";

export function renderLanguageOnboarding(state){
  if(!state.onboardingOpen)return "";
  const existing=new Set(state.languageProfiles.map(x=>x.languageId));
  const available=LANGUAGE_CATALOG.filter(x=>!existing.has(x.id));
  return `<div class="modal-backdrop" id="language-modal" role="dialog" aria-modal="true"><div class="modal-card">
    <div class="modal-header"><div><p class="eyebrow">ADD LANGUAGE</p><h2>${t("add_language_title")}</h2></div><button class="icon-button" id="close-language-modal">×</button></div>
    <form id="language-form" class="stack-lg">
      <div><label class="field-label" for="language-id">${t("language")}</label><select id="language-id" name="languageId" class="select-control select-wide" required><option value="">${t("choose_language")}</option>${available.map(x=>`<option value="${x.id}">${x.flag} ${x.name}</option>`).join("")}</select></div>
      <fieldset class="choice-fieldset"><legend>${t("language_reason")}</legend><p class="field-help">${t("multiple_goals")}</p><div class="choice-grid">${LEARNING_GOALS.map(g=>`<label class="choice-card"><input type="checkbox" name="goals" value="${g.id}"><span>${translateGoal(g.id)}</span></label>`).join("")}</div></fieldset>
      <fieldset class="choice-fieldset"><legend>${t("confidence")}</legend><div class="assessment-list">${SELF_ASSESSMENT.map((x,i)=>`<label class="assessment-row"><input type="radio" name="assessment" value="${x.id}" ${i===0?"checked":""}><span>${translateAssessment(x.id)}</span></label>`).join("")}</div></fieldset>
      <div class="modal-actions"><button type="button" class="secondary-button" id="cancel-language-modal">${t("cancel")}</button><button type="submit" class="primary-button">${t("add")}</button></div>
    </form></div></div>`;
}
