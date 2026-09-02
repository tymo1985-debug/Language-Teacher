import {BrowserSpeechProvider} from "./browser-speech-provider.js";

const provider=new BrowserSpeechProvider();
let recordingUrl=null;

export function getSpeechCapabilities(){
  return provider.getCapabilities();
}

export async function startVoiceRecording(){
  await provider.startRecording();
}

export async function stopVoiceRecording(){
  const result=await provider.stopRecording();
  if(!result)return null;

  if(recordingUrl){
    URL.revokeObjectURL(recordingUrl);
  }

  recordingUrl=URL.createObjectURL(result.blob);

  return {
    url:recordingUrl,
    mimeType:result.mimeType,
    durationMs:result.durationMs
  };
}

export function cancelVoiceRecording(){
  provider.cancelRecording();
}

export function clearVoiceRecording(){
  if(recordingUrl){
    URL.revokeObjectURL(recordingUrl);
    recordingUrl=null;
  }
}

export function speakReference(text,options={}){
  provider.speak(text,options);
}

export function stopReferenceSpeech(){
  provider.stopSpeaking();
}

export function recognizeOnce(options={}){
  return provider.recognizeOnce(options);
}
