import {t} from "../../i18n/i18n.js";

const items=[
  ["today","nav_today","⌂"],
  ["practice","nav_practice","◎"],
  ["words","nav_words","Aa"],
  ["progress","nav_progress","↗"],
  ["settings","nav_settings","⚙"]
];

export function renderBottomNav(activeRoute){
  return `<nav class="bottom-nav" aria-label="${t("nav_label")}">
    ${items.map(([route,key,icon])=>`
      <button type="button" class="nav-item ${activeRoute===route?"is-active":""}"
        data-route="${route}" aria-current="${activeRoute===route?"page":"false"}">
        <span class="nav-icon" aria-hidden="true">${icon}</span><span>${t(key)}</span>
      </button>`).join("")}
  </nav>`;
}
