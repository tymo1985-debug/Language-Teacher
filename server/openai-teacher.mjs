import {validateTeacherResponse} from "../src/ai/response-contract.js";
import {buildTeacherInstructions,TEACHER_RESPONSE_SCHEMA} from "./teacher-contract.mjs";

import {sanitizeTeacherContext} from "./teacher-context.mjs";
export {sanitizeTeacherContext} from "./teacher-context.mjs";

export function buildOpenAIRequest({context,model}){
  return {
    model,
    instructions:buildTeacherInstructions(context?.mode),
    input:JSON.stringify(sanitizeTeacherContext(context)),
    text:{
      format:{
        type:"json_schema",
        name:"language_teacher_response",
        strict:true,
        schema:TEACHER_RESPONSE_SCHEMA
      }
    },
    max_output_tokens:2400,
    store:false
  };
}

export function extractOutputText(response){
  if(typeof response?.output_text==="string"&&response.output_text)return response.output_text;
  for(const item of response?.output??[]){
    for(const content of item?.content??[]){
      if(content?.type==="output_text"&&typeof content.text==="string")return content.text;
    }
  }
  throw new Error("AI provider returned no structured output.");
}

export async function requestOpenAITeacherResponse({
  context,apiKey,model,apiUrl="https://api.openai.com/v1/responses",
  timeoutMs=30000,fetchImpl=fetch
}){
  if(!apiKey)throw new Error("OPENAI_API_KEY is not configured.");
  if(!model)throw new Error("OPENAI_MODEL is not configured.");

  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetchImpl(apiUrl,{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${apiKey}`,
        "Content-Type":"application/json",
        "Accept":"application/json"
      },
      body:JSON.stringify(buildOpenAIRequest({context,model})),
      signal:controller.signal
    });
    if(!response.ok)throw new Error(`OpenAI request failed with status ${response.status}.`);
    const payload=await response.json();
    const parsed=JSON.parse(extractOutputText(payload));
    parsed.provider="openai-proxy";

    const validation=validateTeacherResponse(parsed);
    if(!validation.valid){
      throw new Error(`AI response failed validation: ${validation.errors.join(" ")}`);
    }
    return parsed;
  }finally{
    clearTimeout(timeout);
  }
}
