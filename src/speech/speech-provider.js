export class SpeechProvider {
  getCapabilities(){
    return {
      recording:false,
      playback:false,
      synthesis:false,
      recognition:false
    };
  }

  async startRecording(){
    throw new Error("Recording is not implemented by this provider.");
  }

  async stopRecording(){
    throw new Error("Recording is not implemented by this provider.");
  }

  speak(){
    throw new Error("Speech synthesis is not implemented by this provider.");
  }

  stopSpeaking(){}

  async recognizeOnce(){
    throw new Error("Speech recognition is not implemented by this provider.");
  }
}
