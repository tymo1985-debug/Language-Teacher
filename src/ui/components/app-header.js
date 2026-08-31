export function renderHeader(state) {
  return `
    <header class="app-header">
      <div>
        <p class="eyebrow">LANGUAGE TEACHER</p>
        <h1>${titleForRoute(state.route)}</h1>
      </div>
      <div class="status-group" aria-label="Application status">
        <span class="status-dot ${state.online ? "is-online" : "is-offline"}"></span>
        <span class="status-text">${state.online ? "Online" : "Offline"}</span>
      </div>
    </header>
  `;
}

function titleForRoute(route) {
  const titles = {
    today: "Сегодня",
    practice: "Практика",
    words: "Слова",
    progress: "Прогресс",
    settings: "Настройки"
  };
  return titles[route] ?? "Сегодня";
}
