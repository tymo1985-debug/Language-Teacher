import {renderVoiceRecorder} from "../components/voice-recorder.js";
import {buildPronunciationGuidance,compareTranscript} from "../../speech/pronunciation.js";

export function renderSpeech(state){
  const active=state.languageProfiles.find(p=>p.languageId===state.activeLanguageId);
  const speech=state.speech??{};
  const caps=speech.capabilities??{};

  if(!active){
    return `<section class="stack-lg">
      <div class="page-intro"><p class="eyebrow">PRONUNCIATION</p><h2>Сначала добавьте язык</h2></div>
    </section>`;
  }

  const comparison=speech.referenceText&&speech.transcript
    ?compareTranscript(speech.referenceText,speech.transcript,active.speechLocale??"")
    :null;
  const guidance=buildPronunciationGuidance(speech.referenceText,comparison);

  return `<section class="speech-shell stack-lg">
    <div class="page-intro">
      <p class="eyebrow">${active.flag} PRONUNCIATION</p>
      <h2>Слушайте → говорите → слушайте себя</h2>
      <p class="muted">
        Здесь нет искусственного pronunciation score. Браузерное распознавание речи может проверить,
        насколько хорошо были распознаны слова, но не умеет надёжно оценивать фонемы, акцент или качество произношения.
      </p>
    </div>

    <article class="pronunciation-focus-card">
      <div>
        <p class="eyebrow">ЭТАЛОННАЯ ФРАЗА</p>
        <h3>${escapeHtml(speech.referenceText?.trim()||"Введите короткую фразу для тренировки")}</h3>
      </div>
      <div class="speech-reference-row">
        <input
          id="speech-reference-text"
          class="speech-input"
          type="text"
          value="${escapeAttr(speech.referenceText??"")}"
          placeholder="Например: Dobrý den, mohl byste mi pomoci?"
        />
        <button type="button" class="primary-button" id="speech-speak" ${caps.synthesis?"":"disabled"}>
          ▶ Сначала послушать
        </button>
      </div>
    </article>

    <section class="pronunciation-loop" aria-label="Цикл тренировки произношения">
      ${loopStep("1","Послушайте","Системный голос даёт эталон темпа и фразы.",caps.synthesis)}
      ${loopStep("2","Скажите и запишите","MediaRecorder сохраняет запись только локально на устройстве.",caps.recording)}
      ${loopStep("3","Прослушайте себя","Сравните ритм, ударение, окончания и плавность.",caps.playback)}
      ${loopStep("4","Проверьте понятность слов","SpeechRecognition — дополнительная проверка, не оценка произношения.",caps.recognition)}
    </section>

    ${renderVoiceRecorder(state)}

    <article class="info-card pronunciation-guidance">
      <p class="eyebrow">КАК ТРЕНИРОВАТЬ</p>
      <h3>${escapeHtml(guidance.title)}</h3>
      <ol>
        ${guidance.steps.map(step=>`<li>${escapeHtml(step)}</li>`).join("")}
      </ol>
    </article>

    <article class="info-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">ПРОВЕРКА ПОНЯТНОСТИ</p>
          <h3>${caps.recognition?"Что услышал браузер":"SpeechRecognition недоступен — это нормально"}</h3>
        </div>
        ${caps.recognition?`<button type="button" class="secondary-button compact" id="speech-recognize">Распознать фразу</button>`:""}
      </div>

      <p class="muted">
        ${caps.recognition
          ?"Результат показывает только распознанные слова. Он не измеряет фонемы и не является pronunciation score."
          :"Основной цикл «эталон → запись → самопрослушивание» продолжает работать без распознавания речи."}
      </p>

      ${speech.transcript?`
        <div class="speech-transcript">
          <span class="eyebrow">РАСПОЗНАНО</span>
          <strong>${escapeHtml(speech.transcript)}</strong>
        </div>
      `:""}

      ${comparison?renderComparison(comparison):""}
    </article>

    <div class="speech-capability-grid">
      ${capability("Запись",caps.recording)}
      ${capability("Воспроизведение",caps.playback)}
      ${capability("Text-to-Speech",caps.synthesis)}
      ${capability("SpeechRecognition",caps.recognition)}
    </div>
  </section>`;
}

function loopStep(number,title,text,available){
  return `<article class="pronunciation-step ${available?"is-available":"is-unavailable"}">
    <span>${number}</span>
    <div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(text)}</small></div>
  </article>`;
}

function renderComparison(comparison){
  const percent=Math.round(comparison.overlap*100);
  return `<div class="pronunciation-recognition-feedback ${comparison.exact?"is-exact":""}">
    <strong>${comparison.exact?"Слова распознаны полностью":"Совпадение распознанных слов: "+percent+"%"}</strong>
    <p>${escapeHtml(comparison.feedback)}</p>
    <small>Это показатель совпадения текста, а не качества произношения.</small>
  </div>`;
}

function capability(label,available){
  return `<div class="speech-capability ${available?"is-available":"is-unavailable"}">
    <span>${available?"✓":"—"}</span><strong>${escapeHtml(label)}</strong>
  </div>`;
}

function escapeHtml(value=""){
  return String(value??"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function escapeAttr(value=""){return escapeHtml(value);}
