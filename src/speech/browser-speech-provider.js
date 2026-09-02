import {SpeechProvider} from "./speech-provider.js";
import {BrowserRecorder} from "./recorder.js";
import {BrowserSpeechSynthesis} from "./synthesis.js";
import {BrowserSpeechRecognition} from "./recognition.js";

export class BrowserSpeechProvider extends SpeechProvider {
  constructor(){
    super();
    this.recorder=new BrowserRecorder();
    this.synthesis=new BrowserSpeechSynthesis();
    this.recognition=new BrowserSpeechRecognition();
  }

  getCapabilities(){
    return {
      recording:this.recorder.supported,
      playback:Boolean(globalThis.URL?.createObjectURL && globalThis.Audio),
      synthesis:this.synthesis.supported,
      recognition:this.recognition.supported
    };
  }

  startRecording(){
    return this.recorder.start();
  }

  stopRecording(){
    return this.recorder.stop();
  }

  cancelRecording(){
    this.recorder.cancel();
  }

  speak(text,options={}){
    return this.synthesis.speak(text,options);
  }

  stopSpeaking(){
    this.synthesis.stop();
  }

  recognizeOnce(options={}){
    return this.recognition.recognizeOnce(options);
  }
}
