export function renderUpdateNotice(state){
  const notice=state.updateNotice;

  // Update notices are informational and must never compete with first-run onboarding.
  if(!notice||state.onboardingOpen)return "";

  return `<aside class="update-notice" role="status" aria-live="polite">
    <div class="update-notice-head">
      <div>
        <p class="eyebrow">${notice.kind==="available"?"UPDATE AVAILABLE":"WHAT'S NEW"}</p>
        <strong>${escapeHtml(notice.title)}</strong>
      </div>
      <button type="button" class="icon-button update-close" data-update-dismiss aria-label="Закрыть">×</button>
    </div>

    ${notice.phase?`<p class="muted update-phase">${escapeHtml(notice.phase)}</p>`:""}

    ${notice.changes?.length?`
      <ul class="update-changes">
        ${notice.changes.slice(0,4).map(change=>`<li>${escapeHtml(change)}</li>`).join("")}
      </ul>
    `:""}

    <div class="update-actions">
      ${notice.serviceWorkerReady?`
        <button type="button" class="primary-button compact-action" id="update-apply">
          Обновить сейчас
        </button>
      `:""}
      <button type="button" class="secondary-button compact" data-update-dismiss>
        ${notice.kind==="installed"?"Понятно":"Позже"}
      </button>
    </div>
  </aside>`;
}

function escapeHtml(value=""){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
