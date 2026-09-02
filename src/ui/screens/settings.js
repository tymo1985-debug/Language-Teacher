import {APP_VERSION,APP_PHASE,APP_BUILD_DATE,DB_SCHEMA_VERSION} from "../../app/version.js";

export function renderSettings(state){
  const caps=state.speech?.capabilities??{};

  return `<section class="stack-lg">
    <div class="page-intro">
      <p class="eyebrow">LOCAL FIRST</p>
      <h2>Настройки устройства</h2>
      <p class="muted">Профили языков и параметры сохраняются локально в IndexedDB.</p>
    </div>

    <div class="settings-list">
      <label class="setting-row">
        <span>
          <strong>Язык интерфейса</strong>
          <small>Полная локализация UI появится позже.</small>
        </span>
        <select id="interface-language" class="select-control">
          <option value="ru" ${state.settings.interfaceLanguage==="ru"?"selected":""}>Русский</option>
          <option value="en" ${state.settings.interfaceLanguage==="en"?"selected":""}>English</option>
          <option value="uk" ${state.settings.interfaceLanguage==="uk"?"selected":""}>Українська</option>
        </select>
      </label>
      <label class="setting-row">
        <span>
          <strong>Уменьшить анимацию</strong>
          <small>Настройка доступности.</small>
        </span>
        <input id="reduce-motion" type="checkbox" ${state.settings.reduceMotion?"checked":""}>
      </label>
    </div>

    <article class="info-card">
      <div class="section-heading">
        <div><p class="eyebrow">LANGUAGES</p><h3>Языковые профили</h3></div>
        <button type="button" class="secondary-button compact" id="add-language-settings">+ Добавить</button>
      </div>
      ${state.languageProfiles.length?`
        <div class="settings-language-list">
          ${state.languageProfiles.map(p=>`
            <div class="settings-language-row">
              <span>${p.flag}</span>
              <span><strong>${p.name}</strong><small>${p.goals.length} целей</small></span>
              <button type="button" class="text-button danger-text" data-language-remove="${p.languageId}">Удалить</button>
            </div>
          `).join("")}
        </div>
      `:'<p class="muted">Пока нет добавленных языков.</p>'}
    </article>

    <article class="info-card">
      <p class="eyebrow">SPEECH</p>
      <h3>Возможности этого устройства</h3>
      <div class="speech-settings-grid">
        ${speechStatus("Запись голоса",caps.recording)}
        ${speechStatus("Воспроизведение",caps.playback)}
        ${speechStatus("Text-to-Speech",caps.synthesis)}
        ${speechStatus("Распознавание речи",caps.recognition)}
      </div>
      <p class="muted version-help">
        Распознавание речи необязательно: при его отсутствии MediaRecorder и локальное прослушивание продолжают работать.
      </p>
    </article>

    <article class="info-card version-card">
      <p class="eyebrow">APPLICATION</p>
      <div class="version-line">
        <div><h3>Language Teacher ${APP_VERSION}</h3><p class="muted">${APP_PHASE}</p></div>
        <span class="pill">v${APP_VERSION}</span>
      </div>
      <div class="version-meta">
        <span>Build: ${APP_BUILD_DATE}</span>
        <span>Database schema: v${DB_SCHEMA_VERSION}</span>
        <span>Update check: ${state.online?"online":"offline"}</span>
      </div>
    </article>

    <article class="info-card">
      <p class="eyebrow">STORAGE</p>
      <h3>${state.storageReady?`IndexedDB подключён · schema v${DB_SCHEMA_VERSION}`:"IndexedDB недоступен"}</h3>
      <p class="muted">Данные остаются local-first и разделены по языковым профилям.</p>
    </article>
  </section>`;
}

function speechStatus(label,available){
  return `<div class="speech-setting-row"><span>${available?"✓":"—"}</span><strong>${label}</strong><small>${available?"Доступно":"Недоступно"}</small></div>`;
}
