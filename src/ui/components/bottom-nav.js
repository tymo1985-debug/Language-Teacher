const items = [
  ["today", "Сегодня", "⌂"],
  ["practice", "Практика", "◎"],
  ["words", "Слова", "Aa"],
  ["progress", "Прогресс", "↗"],
  ["settings", "Настройки", "⚙"]
];

export function renderBottomNav(activeRoute) {
  return `
    <nav class="bottom-nav" aria-label="Основная навигация">
      ${items.map(([route, label, icon]) => `
        <button
          type="button"
          class="nav-item ${activeRoute === route ? "is-active" : ""}"
          data-route="${route}"
          aria-current="${activeRoute === route ? "page" : "false"}"
        >
          <span class="nav-icon" aria-hidden="true">${icon}</span>
          <span>${label}</span>
        </button>
      `).join("")}
    </nav>
  `;
}
