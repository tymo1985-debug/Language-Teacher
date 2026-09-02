export class BrowserSpeechSynthesis {
  get supported(){
    return "speechSynthesis" in globalThis && "SpeechSynthesisUtterance" in globalThis;
  }

  speak(text,{lang="",rate=1,pitch=1}={}){
    if(!this.supported){
      throw new Error("Speech synthesis is not supported in this browser.");
    }
    if(!text)return;

    globalThis.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(String(text));
    if(lang)utterance.lang=lang;
    utterance.rate=rate;
    utterance.pitch=pitch;
    globalThis.speechSynthesis.speak(utterance);
  }

  stop(){
    globalThis.speechSynthesis?.cancel?.();
  }
}
