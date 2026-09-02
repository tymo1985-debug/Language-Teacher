import {AIProvider} from "./provider.js";

export class ProxyAIProvider extends AIProvider {
  constructor({endpoint="/api/teacher"}={}){
    super({id:"proxy",label:"Secure AI proxy"});
    this.endpoint=endpoint;
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

    const response=await fetch(this.endpoint,{
      method:"POST",
      headers:{"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify({context})
    });

    if(!response.ok){
      throw new Error(`AI proxy returned ${response.status}.`);
    }

    return response.json();
  }
}
