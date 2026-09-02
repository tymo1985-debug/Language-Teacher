export class AIProvider {
  constructor({id="base",label="AI Provider"}={}){
    this.id=id;
    this.label=label;
  }

  getCapabilities(){
    return {
      available:false,
      remote:false,
      structuredOutput:true
    };
  }

  async generateTeacherResponse(){
    throw new Error("AI provider is not configured.");
  }
}
