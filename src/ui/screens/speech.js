import {renderVoiceRecorder} from "../components/voice-recorder.js";

export function renderSpeech(state){
  const active=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);
  const speech=state.speech??{};
  const caps=speech.capabilities??{};

  if(!active){
    return `<section class="stack-lg">
      <div class="page-intro">
        <p class="eyebrow">SPEECH</p>
        <h2>Сначала добавьте язык</h2>
      </div>
    </section>`;
  }

  return `<section class="speech-shell stack-lg">
    <div class="page-intro">
      <p class="eyebrow">${active.flag} SPEECH LAB</p>
      <h2>Говорите, слушайте себя, повторяйте</h2>
      <p class="muted">
        Запись работает локально через MediaRecorder. Распознавание речи — дополнительная возможность,
        а не обязательная часть приложения.
      </p>
    </div>

    <div class="speech-capability-grid">
      ${capability("Запись",caps.recording)}
      ${capability("Воспроизведение",caps.playback)}
      ${capability("Text-to-Speech",caps.synthesis)}
      ${capability("Распознавание",caps.recognition)}
    </div>

    ${renderVoiceRecorder(state)}

    <article class="info-card">
      <p class="eyebrow">REFERENCE VOICE</p>
      <h3>Проверка синтеза речи</h3>
      <p class="muted">
        Введите или вставьте фразу на изучаемом языке и прослушайте её системным голосом устройства.
      </p>
      <div class="speech-reference-row">
        <input
          id="speech-reference-text"
          class="speech-input"
          type="text"
          value="${escapeAttr(speech.referenceText??"")}"
          placeholder="Введите фразу"
        />
        <button
          type="button"
          class="secondary-button"
          id="speech-speak"
          ${caps.synthesis?"":"disabled"}
        >▶ Прослушать</button>
      </div>
    </article>

    <article class="info-card">
      <p class="eyebrow">OPTIONAL RECOGNITION</p>
      <h3>${caps.recognition?"Распознавание доступно":"Распознавание недоступно — это нормально"}</h3>
      <p class="muted">
        ${caps.recognition
          ?"Можно сделать одно пробное распознавание. Оно не используется как оценка произношения."
          :"Запись и прослушивание продолжают работать независимо от SpeechRecognition."}
      </p>

      ${caps.recognition?`
        <button type="button" class="secondary-button" id="speech-recognize">
          Распознать одну фразу
        </button>
      `:""}

      ${speech.transcript?`
        <div class="speech-transcript">
          <span class="eyebrow">РАСПОЗНАНО</span>
          <strong>${escapeHtml(speech.transcript)}</strong>
        </div>
      `:""}
    </article>
  </section>`;
}

function capability(label,available){
  return `<div class="speech-capability ${available?"is-available":"is-unavailable"}">
    <span>${available?"✓":"—"}</span>
    <strong>${label}</strong>
  </div>`;
}

function escapeHtml(value=""){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function escapeAttr(value=""){return escapeHtml(value);}
