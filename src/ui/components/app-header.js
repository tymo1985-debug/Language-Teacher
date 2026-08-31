import {getLanguageMeta} from "../../language/language-catalog.js";
export function renderHeader(state){
 const active=state.activeLanguageId?getLanguageMeta(state.activeLanguageId):null;
 return `<header class="app-header"><div><p class="eyebrow">LANGUAGE TEACHER</p><h1>${title(state.route)}</h1></div>
 <div class="header-actions">${active?`<button class="language-chip" id="language-switcher"><span>${active.flag}</span><span>${active.name}</span><span>⌄</span></button>`:`<button class="language-chip" id="add-language-top">+ Язык</button>`}
 <div class="status-group"><span class="status-dot ${state.online?"is-online":"is-offline"}"></span><span class="status-text">${state.online?"Online":"Offline"}</span></div></div></header>`;
}
function title(r){return({today:"Сегодня",practice:"Практика",words:"Слова",progress:"Прогресс",settings:"Настройки"})[r]??"Сегодня";}
