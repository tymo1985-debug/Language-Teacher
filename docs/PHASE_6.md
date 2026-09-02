# Phase 6 — Speech

Version: `0.6.0`

## Included
- `SpeechProvider` abstraction
- `BrowserSpeechProvider`
- `MediaRecorder` voice recording
- local playback
- microphone permission on explicit user action
- browser Text-to-Speech
- optional browser SpeechRecognition
- feature detection
- safe fallback behavior
- Speech Lab screen
- Session voice controls for SPEAK / RESPOND / CORRECTION / RECALL
- Speech capability status in Settings

## Privacy
Phase 6 does not upload microphone audio. The current recording is exposed as a local temporary Blob URL and is released when removed or when the application closes.

## Important limitation
Browser SpeechRecognition availability varies by browser and platform. It is therefore an optional provider capability only.

Phase 6 deliberately does **not** assign a pronunciation score from browser transcription. Recognition accuracy is not equivalent to phoneme-level pronunciation quality.

## Exit criteria
- recording works on browsers supporting MediaRecorder + getUserMedia
- user can immediately play back a recording
- microphone access occurs only after explicit user action
- reference Text-to-Speech works where available
- unsupported SpeechRecognition does not break recording or the app
- Session speech blocks can use the recorder
- no AI dependency is introduced

## Next
Phase 7 — AI Teacher.
