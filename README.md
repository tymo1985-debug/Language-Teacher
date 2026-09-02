# Language Teacher

## Status
- Phase 1 — Foundation ✅
- Phase 2 — Language Profiles ✅
- Phase 3 — Learning Data ✅
- Phase 4 — Review / SRS ✅
- Phase 5 — Session Engine ✅
- Phase 6 — Speech ✅
- Next: Phase 7 — AI Teacher

## Current version
**0.6.0** — Phase 6 · Speech

## Phase 6
Adds:
- replaceable `SpeechProvider` abstraction;
- browser provider implementation;
- microphone recording through `MediaRecorder`;
- immediate local playback of the user's recording;
- browser `speechSynthesis` reference audio;
- optional one-shot browser speech recognition;
- feature detection and graceful fallbacks;
- Speech Lab;
- voice recording embedded into speech-oriented Session blocks;
- device Speech capabilities in Settings.

Browser SpeechRecognition is deliberately optional and is not used as a pronunciation score.

## Privacy
Microphone access is requested only when the user presses Record. Phase 6 recordings are kept only in the current browser session as local Blob URLs and are not uploaded.

## Run
```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.
