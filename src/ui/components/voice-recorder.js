export function renderVoiceRecorder(state,{compact=false}={}){
  const speech=state.speech??{};
  const caps=speech.capabilities??{};

  if(!caps.recording){
    return `<div class="voice-panel voice-unavailable">
      <strong>Запись голоса недоступна</strong>
      <span>Этот браузер не поддерживает MediaRecorder или доступ к микрофону.</span>
    </div>`;
  }

  return `<div class="voice-panel ${compact?"is-compact":""}">
    <div class="voice-status">
      <span class="voice-dot ${speech.recording?"is-recording":""}"></span>
      <span>${speech.recording?"Запись идёт…":"Голосовая практика"}</span>
    </div>

    <div class="voice-actions">
      ${speech.recording?`
        <button type="button" class="primary-button compact-action" id="voice-stop">■ Остановить</button>
      `:`
        <button type="button" class="primary-button compact-action" id="voice-start">● Записать</button>
      `}

      ${speech.recordingUrl?`
        <button type="button" class="secondary-button compact" id="voice-clear">Удалить запись</button>
      `:""}
    </div>

    ${speech.recordingUrl?`
      <audio class="voice-audio" controls src="${escapeAttr(speech.recordingUrl)}"></audio>
      <small class="muted">${formatDuration(speech.recordingDurationMs)}</small>
    `:""}

    ${speech.error?`<p class="voice-error">${escapeHtml(speech.error)}</p>`:""}
  </div>`;
}

function formatDuration(ms=0){
  const seconds=Math.max(0,Math.round(ms/1000));
  return `${seconds} сек.`;
}

function escapeHtml(value=""){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function escapeAttr(value=""){
  return escapeHtml(value);
}
