import {requestGeminiTeacherResponse} from "./gemini-teacher.mjs";
import {requestOpenAITeacherResponse} from "./openai-teacher.mjs";

export function getTeacherConfig(env={}){
  // OpenAI is opt-in. A Gemini error or missing key never switches providers.
  const provider=env.AI_PROVIDER||"gemini";
  if(provider==="gemini")return {provider,apiKey:env.GEMINI_API_KEY,model:env.GEMINI_MODEL};
  if(provider==="openai")return {provider,apiKey:env.OPENAI_API_KEY,model:env.OPENAI_MODEL,apiUrl:env.OPENAI_API_URL};
  return {provider,apiKey:null,model:null};
}

export function isTeacherConfigured(env){
  const config=getTeacherConfig(env);
  return Boolean(config.apiKey&&config.model);
}

export function requestCloudTeacherResponse({context,env,fetchImpl=fetch,timeoutMs=25000}){
  const config=getTeacherConfig(env);
  if(!config.apiKey||!config.model)throw new Error("Cloud AI is not configured.");
  const request=config.provider==="gemini"?requestGeminiTeacherResponse:requestOpenAITeacherResponse;
  return request({...config,context,fetchImpl,timeoutMs});
}

export function teacherQuotaError(){
  return {error:"Лимит запросов Gemini исчерпан. Попробуйте позже или продолжите локальные упражнения. Платный AI автоматически не подключается.",code:"AI_QUOTA_EXCEEDED"};
}
