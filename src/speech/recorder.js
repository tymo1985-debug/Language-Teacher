export class BrowserRecorder {
  constructor(){
    this.stream=null;
    this.recorder=null;
    this.chunks=[];
    this.startedAt=null;
    this.generation=0;
  }

  get supported(){
    return Boolean(
      navigator.mediaDevices?.getUserMedia &&
      globalThis.MediaRecorder
    );
  }

  async start(){
    if(!this.supported){
      throw new Error("Voice recording is not supported in this browser.");
    }

    if(this.recorder?.state==="recording"){
      return;
    }

    const generation=++this.generation;
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    if(generation!==this.generation){stream.getTracks().forEach(track=>track.stop());return;}
    this.stream=stream;
    try{
    this.chunks=[];

    const options=this.pickOptions();
    this.recorder=new MediaRecorder(this.stream,options);
    this.startedAt=Date.now();

    this.recorder.addEventListener("dataavailable",event=>{
      if(event.data?.size){
        this.chunks.push(event.data);
      }
    });

    await new Promise((resolve,reject)=>{
      const onStart=()=>resolve();
      const onError=event=>reject(event.error??new Error("Recorder failed to start."));
      this.recorder.addEventListener("start",onStart,{once:true});
      this.recorder.addEventListener("error",onError,{once:true});
      this.recorder.start();
    });
    }catch(error){this.cancel();throw error;}
  }

  async stop(){
    if(!this.recorder||this.recorder.state!=="recording"){
      return null;
    }

    const mimeType=this.recorder.mimeType||"audio/webm";
    const durationMs=this.startedAt?Date.now()-this.startedAt:0;

    let blob;
    try{blob=await new Promise((resolve,reject)=>{
      this.recorder.addEventListener("stop",()=>{
        resolve(new Blob(this.chunks,{type:mimeType}));
      },{once:true});
      this.recorder.addEventListener("error",event=>{
        reject(event.error??new Error("Recorder failed."));
      },{once:true});
      this.recorder.stop();
    });
    }finally{
      this.releaseStream();
      this.recorder=null;
      this.startedAt=null;
    }

    return {
      blob,
      mimeType:blob.type||mimeType,
      durationMs
    };
  }

  cancel(){
    this.generation+=1;
    try{
      if(this.recorder?.state==="recording"){
        this.recorder.stop();
      }
    }catch{}
    this.chunks=[];
    this.releaseStream();
    this.recorder=null;
    this.startedAt=null;
  }

  releaseStream(){
    this.stream?.getTracks?.().forEach(track=>track.stop());
    this.stream=null;
  }

  pickOptions(){
    const candidates=[
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4"
    ];
    const mimeType=candidates.find(type=>MediaRecorder.isTypeSupported?.(type));
    return mimeType?{mimeType}:{};
  }
}
