import {getLanguageMeta} from "../../language/language-catalog.js";
import {setLocale,t} from "../../i18n/i18n.js";

export function renderHeader(state){
  setLocale(state.settings?.interfaceLanguage??"ru");
  const active=state.activeLanguageId?getLanguageMeta(state.activeLanguageId):null;
  return `<header class="app-header"><div><p class="eyebrow">LANGUAGE TEACHER</p><h1>${title(state.route)}</h1></div>
  <div class="header-actions">${active?`<button class="language-chip" id="language-switcher"><span>${active.flag}</span><span>${active.name}</span><span>⌄</span></button>`:`<button class="language-chip" id="add-language-top">${t("add_language")}</button>`}
  <div class="status-group"><span class="status-dot ${state.online?"is-online":"is-offline"}"></span><span class="status-text">${state.online?t("online"):t("offline")}</span></div></div></header>`;
}
function title(route){
  return ({
    today:t("nav_today"),practice:t("nav_practice"),words:t("nav_words"),
    progress:t("nav_progress"),settings:t("nav_settings")
  })[route]??t("nav_today");
}
