import {AIProvider} from "./provider.js";

export class ProxyAIProvider extends AIProvider {
  constructor({endpoint="/api/teacher",timeoutMs=30000}={}){
    super({id:"proxy",label:"Secure cloud AI"});
    this.endpoint=endpoint;
    this.timeoutMs=timeoutMs;
  }

  getCapabilities(){
    return {
      available:Boolean(this.endpoint),
      remote:true,
      structuredOutput:true,
      requiresNetwork:true
    };
  }

  async generateTeacherResponse(context){
    if(!navigator.onLine){
      throw new Error("AI proxy requires a network connection.");
    }

    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),this.timeoutMs);
    let response;

    try{
      response=await fetch(this.endpoint,{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify({context}),
        signal:controller.signal
      });
    }catch(error){
      if(error?.name==="AbortError")throw new Error("AI proxy timed out. Try again.");
      throw new Error("AI proxy is unavailable. Local practice still works.");
    }finally{
      clearTimeout(timeout);
    }

    if(!response.ok){
      const errorBody=await response.json().catch(()=>null);
      throw new Error(errorBody?.error??`AI proxy returned ${response.status}.`);
    }

    const contentType=response.headers.get("content-type")??"";
    if(!contentType.includes("application/json")){
      throw new Error("AI proxy returned an unsupported response.");
    }
    return response.json();
  }
}
