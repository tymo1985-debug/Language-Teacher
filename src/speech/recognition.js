export class BrowserSpeechRecognition {
  constructor(){
    this.Recognition=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition||null;
  }

  get supported(){
    return Boolean(this.Recognition);
  }

  recognizeOnce({lang=""}={}){
    if(!this.supported){
      return Promise.reject(new Error("Speech recognition is not available in this browser."));
    }

    return new Promise((resolve,reject)=>{
      const recognition=new this.Recognition();
      recognition.continuous=false;
      recognition.interimResults=false;
      recognition.maxAlternatives=1;
      if(lang)recognition.lang=lang;

      recognition.addEventListener("result",event=>{
        const result=event.results?.[0]?.[0];
        resolve({
          transcript:result?.transcript??"",
          confidence:Number(result?.confidence)||0
        });
      },{once:true});

      recognition.addEventListener("error",event=>{
        reject(new Error(event.error||"Speech recognition failed."));
      },{once:true});

      recognition.addEventListener("nomatch",()=>{
        resolve({transcript:"",confidence:0});
      },{once:true});

      recognition.addEventListener("end",()=>resolve({transcript:"",confidence:0}),{once:true});
      recognition.start();
    });
  }
}
