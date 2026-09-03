import {AIProvider} from "./provider.js";
import {getConfiguredAIProxyEndpoint} from "./proxy-config.js";

export class ProxyAIProvider extends AIProvider {
  constructor({endpoint=getConfiguredAIProxyEndpoint(),timeoutMs=30000}={}){
    super({id:"proxy",label:"Secure cloud AI"});
    this.endpoint=endpoint;
    this.timeoutMs=timeoutMs;
  }

  getCapabilities(){
    return {
      available:Boolean(this.endpoint),
      remote:true,
      structuredOutput:true,
      requiresNetwork:true,
      endpointConfigured:Boolean(this.endpoint)
    };
  }

  async generateTeacherResponse(context){
    if(!this.endpoint){
      throw new Error("Secure cloud AI не подключён к backend. Используйте Local mode или настройте AI proxy.");
    }
    if(!navigator.onLine)throw new Error("AI proxy requires a network connection.");

    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),this.timeoutMs);
    try{
      let response;
      try{
        response=await fetch(this.endpoint,{
          method:"POST",
          headers:{"Content-Type":"application/json","Accept":"application/json"},
          body:JSON.stringify({context}),
          signal:controller.signal
        });
      }catch(error){
        if(error?.name==="AbortError")throw error;
        throw new Error("AI proxy is unavailable. Local practice still works.");
      }

      if(!response.ok){
        const errorBody=await response.json().catch(error=>{
          if(error?.name==="AbortError")throw error;
          return null;
        });
        if(response.status===404||response.status===405){
          throw new Error("Secure cloud AI backend не найден для этой публикации. Переключитесь на Local mode.");
        }
        throw new Error(errorBody?.error??`AI proxy returned ${response.status}.`);
      }

      const contentType=response.headers.get("content-type")??"";
      if(!contentType.includes("application/json")){
        throw new Error("AI proxy returned an unsupported response.");
      }
      return await response.json();
    }catch(error){
      if(error?.name==="AbortError")throw new Error("AI proxy timed out. Try again.");
      throw error;
    }finally{
      clearTimeout(timeout);
    }
  }
}
