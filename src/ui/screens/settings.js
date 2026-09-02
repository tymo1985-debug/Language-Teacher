import {APP_VERSION,APP_PHASE,APP_BUILD_DATE,DB_SCHEMA_VERSION} from "../../app/version.js";

export function renderSettings(state){
  const caps=state.speech?.capabilities??{};
  const ai=state.ai??{};
  const cloud=ai.providers?.find(provider=>provider.id==="proxy");
  const cloudAvailable=Boolean(cloud?.capabilities?.available);

  return `<section class="stack-lg">
    <div class="page-intro">
      <p class="eyebrow">LOCAL FIRST</p>
      <h2>Настройки устройства</h2>
      <p class="muted">Профили языков и параметры сохраняются локально в IndexedDB.</p>
    </div>

    <div class="settings-list">
      <label class="setting-row">
        <span><strong>Язык интерфейса</strong><small>Полная локализация UI появится позже.</small></span>
        <select id="interface-language" class="select-control">
          <option value="ru" ${state.settings.interfaceLanguage==="ru"?"selected":""}>Русский</option>
          <option value="en" ${state.settings.interfaceLanguage==="en"?"selected":""}>English</option>
          <option value="uk" ${state.settings.interfaceLanguage==="uk"?"selected":""}>Українська</option>
        </select>
      </label>
      <label class="setting-row">
        <span><strong>Уменьшить анимацию</strong><small>Настройка доступности.</small></span>
        <input id="reduce-motion" type="checkbox" ${state.settings.reduceMotion?"checked":""}>
      </label>
    </div>

    <article class="info-card">
      <div class="section-heading">
        <div><p class="eyebrow">BACKUP</p><h3>Экспорт и восстановление</h3></div>
      </div>
      <p class="muted">Backup содержит основные локальные учебные данные. Аудиозаписи в MVP backup не включаются.</p>
      <div class="backup-actions">
        <button type="button" class="secondary-button" id="backup-export">Экспортировать JSON</button>
        <label class="secondary-button backup-file-label">
          Восстановить JSON
          <input id="backup-import" type="file" accept="application/json,.json" hidden>
        </label>
      </div>
      <small class="muted">Импорт заменяет текущие локальные данные после подтверждения.</small>
    </article>

    <article class="info-card">
      <div class="section-heading">
        <div><p class="eyebrow">RELEASE CHECK</p><h3>Готовность устройства</h3></div>
        <button type="button" class="secondary-button compact" id="release-check-run">Проверить</button>
      </div>
      ${state.releaseCheck?renderReleaseCheck(state.releaseCheck):`<p class="muted">Проверяет IndexedDB, Service Worker, secure context и доступные fallback-механизмы.</p>`}
    </article>

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
      <p class="eyebrow">AI TEACHER</p>
      <h3>${escapeHtml(ai.providerLabel??"Local architecture demo")}</h3>
      <label class="field-label" for="ai-provider">Режим AI</label>
      <select id="ai-provider" class="select-control">
        ${(ai.providers??[]).map(provider=>`
          <option value="${escapeHtml(provider.id)}"
            ${provider.id===ai.providerId?"selected":""}
            ${provider.capabilities?.available===false?"disabled":""}>
            ${escapeHtml(provider.label)}${provider.capabilities?.available===false?" · backend не подключён":""}
          </option>
        `).join("")}
      </select>
      <p class="muted">
        ${ai.remote
          ?"Запросы отправляются вашему backend proxy. Он удаляет локальные идентификаторы перед обращением к модели."
          :"Данные остаются на устройстве. Demo проверяет механику, но не является языковой моделью."}
      </p>
      ${!cloudAvailable?`
        <div class="ai-deployment-note">
          <strong>Cloud AI сейчас недоступен в этой публикации</strong>
          <small>Статический GitHub Pages не выполняет Node backend. Local mode продолжает работать; Secure cloud AI станет доступен после подключения отдельного proxy.</small>
        </div>
      `:""}
      <small class="muted">API-ключ хранится только на сервере и никогда не попадает в PWA.</small>
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
  </section>`;
}

function renderReleaseCheck(result){
  return `<div class="release-check ${result.passed?"is-passed":"is-failed"}">
    <strong>${result.passed?"✓ Основные проверки пройдены":"Требуется внимание"}</strong>
    <div class="release-check-list">
      ${result.checks.map(check=>`
        <div class="release-check-row">
          <span>${check.ok?"✓":check.optional?"○":"!"}</span>
          <strong>${escapeHtml(check.label)}</strong>
          <small>${escapeHtml(check.detail)}</small>
        </div>
      `).join("")}
    </div>
  </div>`;
}
function speechStatus(label,available){
  return `<div class="speech-setting-row"><span>${available?"✓":"—"}</span><strong>${label}</strong><small>${available?"Доступно":"Недоступно"}</small></div>`;
}
function escapeHtml(value=""){
  return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
