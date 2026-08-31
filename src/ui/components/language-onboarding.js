import {LANGUAGE_CATALOG,LEARNING_GOALS,SELF_ASSESSMENT} from "../../language/language-catalog.js";
export function renderLanguageOnboarding(state){
 if(!state.onboardingOpen)return "";
 const existing=new Set(state.languageProfiles.map(x=>x.languageId));
 const available=LANGUAGE_CATALOG.filter(x=>!existing.has(x.id));
 return `<div class="modal-backdrop" id="language-modal" role="dialog" aria-modal="true"><div class="modal-card">
 <div class="modal-header"><div><p class="eyebrow">ADD LANGUAGE</p><h2>Какой язык будем учить?</h2></div><button class="icon-button" id="close-language-modal">×</button></div>
 <form id="language-form" class="stack-lg">
 <div><label class="field-label" for="language-id">Язык</label><select id="language-id" name="languageId" class="select-control select-wide" required><option value="">Выберите язык</option>${available.map(x=>`<option value="${x.id}">${x.flag} ${x.label} — ${x.name}</option>`).join("")}</select></div>
 <fieldset class="choice-fieldset"><legend>Для чего он вам нужен?</legend><p class="field-help">Можно выбрать несколько целей.</p><div class="choice-grid">${LEARNING_GOALS.map(g=>`<label class="choice-card"><input type="checkbox" name="goals" value="${g.id}"><span>${g.label}</span></label>`).join("")}</div></fieldset>
 <fieldset class="choice-fieldset"><legend>Насколько уверенно вы чувствуете себя сейчас?</legend><div class="assessment-list">${SELF_ASSESSMENT.map((x,i)=>`<label class="assessment-row"><input type="radio" name="assessment" value="${x.id}" ${i===0?"checked":""}><span>${x.label}</span></label>`).join("")}</div></fieldset>
 <div class="modal-actions"><button type="button" class="secondary-button" id="cancel-language-modal">Отмена</button><button type="submit" class="primary-button">Добавить язык</button></div>
 </form></div></div>`;
}
