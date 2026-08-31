export function renderSettings(state) {
  return `
    <section class="stack-lg">
      <div class="page-intro">
        <p class="eyebrow">LOCAL FIRST</p>
        <h2>Настройки устройства</h2>
        <p class="muted">Эти параметры уже сохраняются локально в IndexedDB.</p>
      </div>

      <div class="settings-list">
        <label class="setting-row">
          <span>
            <strong>Язык интерфейса</strong>
            <small>В Phase 1 сохраняется как пользовательская настройка.</small>
          </span>
          <select id="interface-language" class="select-control">
            <option value="ru" ${state.settings.interfaceLanguage === "ru" ? "selected" : ""}>Русский</option>
            <option value="en" ${state.settings.interfaceLanguage === "en" ? "selected" : ""}>English</option>
            <option value="uk" ${state.settings.interfaceLanguage === "uk" ? "selected" : ""}>Українська</option>
          </select>
        </label>

        <label class="setting-row">
          <span>
            <strong>Уменьшить анимацию</strong>
            <small>Настройка доступности.</small>
          </span>
          <input id="reduce-motion" type="checkbox" ${state.settings.reduceMotion ? "checked" : ""} />
        </label>
      </div>

      <article class="info-card">
        <p class="eyebrow">STORAGE</p>
        <h3>${state.storageReady ? "IndexedDB подключён" : "IndexedDB недоступен"}</h3>
        <p class="muted">Схема базы данных имеет явную версию 1 и готова к будущим миграциям.</p>
      </article>
    </section>
  `;
}
