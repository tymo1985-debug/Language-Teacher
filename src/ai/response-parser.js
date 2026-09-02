import {validateTeacherResponse} from "./response-contract.js";

export function parseTeacherResponse(raw){
  const value=typeof raw==="string"?safeJsonParse(raw):raw;
  const result=validateTeacherResponse(value);

  if(!result.valid){
    const error=new Error(`Invalid AI Teacher response: ${result.errors.join(" ")}`);
    error.validationErrors=result.errors;
    throw error;
  }

  return {
    schemaVersion:value.schemaVersion,
    provider:value.provider??"unknown",
    kind:value.kind,
    message:value.message,
    blocks:value.blocks.map(block=>({
      type:block.type,
      title:block.title,
      prompt:block.prompt,
      hints:Array.isArray(block.hints)?block.hints:[],
      expectedAnswer:block.expectedAnswer??null
    })),
    corrections:value.corrections,
    learningSignals:{
      suggestedItems:Array.isArray(value.learningSignals?.suggestedItems)
        ?value.learningSignals.suggestedItems:[],
      mistakePatterns:Array.isArray(value.learningSignals?.mistakePatterns)
        ?value.learningSignals.mistakePatterns:[]
    },
    metadata:value.metadata??{}
  };
}

function safeJsonParse(raw){
  try{
    return JSON.parse(raw);
  }catch{
    throw new Error("AI Teacher returned invalid JSON.");
  }
}
