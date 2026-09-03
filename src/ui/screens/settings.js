import {APP_VERSION,APP_PHASE,APP_BUILD_DATE,DB_SCHEMA_VERSION} from "../../app/version.js";
import {t} from "../../i18n/i18n.js";

export function renderSettings(state){
  const c=state.speech?.capabilities??{};
  const ai=state.ai??{};

  return `<section class="stack-lg">
    <div class="page-intro">
      <p class="eyebrow">LOCAL FIRST</p>
      <h2>${t("settings_title")}</h2>
      <p class="muted">${t("local_hint")}</p>
    </div>

    <div class="settings-list">
      <label class="setting-row">
        <span><strong>${t("ui_language")}</strong><small>${t("ui_language_hint_full")}</small></span>
        <select id="interface-language" class="select-control">
          <option value="ru" ${state.settings.interfaceLanguage==="ru"?"selected":""}>Русский</option>
          <option value="en" ${state.settings.interfaceLanguage==="en"?"selected":""}>English</option>
          <option value="uk" ${state.settings.interfaceLanguage==="uk"?"selected":""}>Українська</option>
        </select>
      </label>
      <label class="setting-row">
        <span><strong>${t("reduce_motion")}</strong><small>${t("accessibility")}</small></span>
        <input id="reduce-motion" type="checkbox" ${state.settings.reduceMotion?"checked":""}>
      </label>
    </div>

    <article class="info-card">
      <div class="section-heading">
        <div><p class="eyebrow">BACKUP</p><h3>${t("backup_title")}</h3></div>
      </div>
      <p class="muted">${t("backup_note")}</p>
      <div class="backup-actions">
        <button type="button" class="secondary-button" id="backup-export">${t("backup_export")}</button>
        <label class="secondary-button backup-file-label">${t("backup_restore")}
          <input id="backup-import" type="file" accept="application/json,.json" hidden>
        </label>
      </div>
    </article>

    <article class="info-card">
      <div class="section-heading">
        <div><p class="eyebrow">RELEASE CHECK</p><h3>${t("release_ready")}</h3></div>
        <button type="button" class="secondary-button compact" id="release-check-run">${t("check")}</button>
      </div>
      ${state.releaseCheck?renderReleaseCheck(state.releaseCheck):`
        <p class="muted">${t("release_note")}</p>
      `}
    </article>

    <article class="info-card">
      <div class="section-heading">
        <div><p class="eyebrow">LANGUAGES</p><h3>${t("language_profiles")}</h3></div>
        <button type="button" class="secondary-button compact" id="add-language-settings">${t("add_language")}</button>
      </div>
      ${state.languageProfiles.length
        ?state.languageProfiles.map(p=>`<div class="settings-language-row"><span>${esc(p.flag)}</span><span><strong>${esc(p.name)}</strong><small>${t("goals_count",{n:p.goals?.length??0})}</small></span><button type="button" class="text-button danger-text" data-language-remove="${esc(p.languageId)}">${t("remove")}</button></div>`).join("")
        :'<p class="muted">—</p>'}
    </article>

    <article class="info-card">
      <p class="eyebrow">AI TEACHER</p>
      <h3>${esc(ai.providerLabel??"Local architecture demo")}</h3>
      <label class="field-label" for="ai-provider">${t("ai_mode")}</label>
      <select id="ai-provider" class="select-control">
        ${(ai.providers??[]).map(p=>`<option value="${esc(p.id)}" ${p.id===ai.providerId?"selected":""} ${p.capabilities?.available===false?"disabled":""}>${esc(p.label)}${p.capabilities?.available===false?` · ${t("unavailable")}`:""}</option>`).join("")}
      </select>
      <p class="muted">${ai.remote?t("cloud_note"):t("local_note")}</p>
    </article>

    <article class="info-card">
      <p class="eyebrow">SPEECH</p>
      <h3>${t("device_capabilities")}</h3>
      <div class="speech-settings-grid">
        ${status("Recording",c.recording)}
        ${status("Playback",c.playback)}
        ${status("Text-to-Speech",c.synthesis)}
        ${status("SpeechRecognition",c.recognition)}
      </div>
    </article>

    <article class="info-card version-card">
      <p class="eyebrow">RELEASE CANDIDATE</p>
      <div class="version-line">
        <div><h3>Language Teacher ${APP_VERSION}</h3><p class="muted">${APP_PHASE}</p></div>
        <span class="pill">v${APP_VERSION}</span>
      </div>
      <div class="version-meta">
        <span>Build: ${APP_BUILD_DATE}</span>
        <span>Database schema: v${DB_SCHEMA_VERSION}</span>
        <span>${state.online?"Online":"Offline"}</span>
      </div>
    </article>
  </section>`;
}

function renderReleaseCheck(result){
  const optional=result.optionalUnavailableCount??result.checks.filter(x=>!x.ok&&x.optional).length;
  return `<div class="release-check ${result.passed?"is-passed":"is-failed"}">
    <strong>${result.passed?t("check_pass"):t("check_fail")}</strong>
    <p class="muted">${result.passed
      ? t("optional_count",{n:optional})
      :t("blocking_count",{n:result.blockingCount??0})}</p>
    <div class="release-check-list">
      ${result.checks.map(check=>`
        <div class="release-check-row">
          <span>${check.ok?"✓":check.optional?"○":"!"}</span>
          <strong>${esc(check.label)}</strong>
          <small>${esc(check.detail)}</small>
        </div>
      `).join("")}
    </div>
  </div>`;
}

function status(label,available){
  return `<div class="speech-setting-row"><span>${available?"✓":"—"}</span><strong>${label}</strong><small>${available?t("available"):t("unavailable")}</small></div>`;
}
function esc(value=""){
  return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
