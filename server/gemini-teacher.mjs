import {validateTeacherResponse} from "../src/ai/response-contract.js";
import {sanitizeTeacherContext} from "./teacher-context.mjs";
import {buildTeacherInstructions,TEACHER_RESPONSE_SCHEMA} from "./teacher-contract.mjs";

// Gemini supports a subset of JSON Schema. Keep application validation too.
function geminiSchema(schema){
  const result={};
  for(const [key,value] of Object.entries(schema)){
    if(key==="minLength"||key==="maxLength")continue;
    if(key==="const"){result.enum=[value];continue;}
    if(key==="properties")result.properties=Object.fromEntries(
      Object.entries(value).map(([name,child])=>[name,geminiSchema(child)])
    );
    else if(key==="items")result.items=geminiSchema(value);
    else result[key]=value;
  }
  return result;
}
const schema=geminiSchema(TEACHER_RESPONSE_SCHEMA);
schema.properties.provider={type:"string",enum:["gemini-proxy"]};

export function buildGeminiRequest(context){
  return {
    systemInstruction:{parts:[{text:buildTeacherInstructions(context?.mode)}]},
    contents:[{role:"user",parts:[{text:JSON.stringify(sanitizeTeacherContext(context))}]}],
    generationConfig:{
      candidateCount:1,maxOutputTokens:2400,
      responseMimeType:"application/json",responseJsonSchema:schema
    }
  };
}

export async function requestGeminiTeacherResponse({context,apiKey,model,timeoutMs=25000,fetchImpl=fetch}){
  if(!apiKey)throw new Error("GEMINI_API_KEY is not configured.");
  if(!model||!/^gemini-[a-z0-9.-]+$/.test(model))throw new Error("GEMINI_MODEL is not configured.");
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
      method:"POST",headers:{"x-goog-api-key":apiKey,"Content-Type":"application/json","Accept":"application/json"},
      body:JSON.stringify(buildGeminiRequest(context)),signal:controller.signal
    });
    if(!response.ok){
      const error=new Error(`Gemini request failed with status ${response.status}.`);
      if(response.status===429)error.code="AI_QUOTA_EXCEEDED";
      throw error;
    }
    const payload=await response.json();
    const candidate=payload?.candidates?.[0];
    if(candidate?.finishReason!=="STOP")throw new Error("Gemini returned an incomplete or blocked response.");
    const output=candidate.content?.parts?.filter(part=>!part.thought&&typeof part.text==="string")
      .map(part=>part.text).join("");
    if(!output)throw new Error("Gemini returned no structured output.");
    const parsed=JSON.parse(output);
    if(!validateTeacherResponse(parsed).valid)throw new Error("Gemini response failed validation.");
    parsed.provider="gemini-proxy";
    return parsed;
  }finally{clearTimeout(timeout);}
}
