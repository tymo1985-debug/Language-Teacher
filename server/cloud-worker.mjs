import {isTeacherConfigured,requestCloudTeacherResponse,teacherQuotaError} from "./teacher-service.mjs";

const BODY_LIMIT=128*1024;
const json=(status,payload)=>new Response(JSON.stringify(payload),{status,headers:{
  "Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",
  "X-Content-Type-Options":"nosniff"
}});

async function readBody(request){
  if(Number(request.headers.get("content-length"))>BODY_LIMIT)throw new Error("BODY_LIMIT");
  if(!request.body)throw new SyntaxError("Empty body");
  const reader=request.body.getReader();
  const chunks=[];
  let size=0;
  try{
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      size+=value.byteLength;
      if(size>BODY_LIMIT){await reader.cancel();throw new Error("BODY_LIMIT");}
      chunks.push(value);
    }
  }finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);
  let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return JSON.parse(new TextDecoder().decode(bytes));
}

// The Sites owner-only access gateway authenticates every online request.
// Keep this deployment private; CORS and the burst limit are not authentication.
export function createCloudWorker({assets={},fetchImpl=fetch,now=Date.now}={}){
  let windowStarted=0;
  let requestCount=0;
  return {async fetch(request,env={}){
    const url=new URL(request.url);
    const configured=isTeacherConfigured(env);
    if(url.pathname==="/api/health"&&request.method==="GET"){
      return json(200,{ok:true,service:"language-teacher-ai",configured});
    }
    if(url.pathname.startsWith("/api/")){
      if(url.pathname!=="/api/teacher")return json(404,{error:"Not found"});
      if(request.method!=="POST")return json(405,{error:"Use POST"});
      const origin=request.headers.get("origin");
      if((origin&&origin!==url.origin)||request.headers.get("sec-fetch-site")==="cross-site"){
        return json(403,{error:"Origin not allowed"});
      }
      if(!/^application\/json(?:;|$)/i.test(request.headers.get("content-type")??"")){
        return json(415,{error:"Нужен запрос в формате JSON."});
      }
      if(!configured)return json(503,{error:"Облачный AI ожидает подключения ключа на сервере."});
      const time=now();
      if(time-windowStarted>=60_000){windowStarted=time;requestCount=0;}
      if(++requestCount>30)return json(429,{error:"Слишком много запросов. Попробуйте через минуту."});
      let body;
      try{body=await readBody(request);}catch(error){
        return json(error.message==="BODY_LIMIT"?413:400,{error:"Некорректный или слишком большой запрос."});
      }
      if(!body?.context||typeof body.context!=="object"||Array.isArray(body.context)){
        return json(400,{error:"Отсутствует учебный контекст."});
      }
      try{
        return json(200,await requestCloudTeacherResponse({
          context:body.context,env,
          timeoutMs:25_000,fetchImpl
        }));
      }catch(error){
        if(error?.code==="AI_QUOTA_EXCEEDED")return json(429,teacherQuotaError());
        if(error?.name==="AbortError")return json(504,{error:"AI не ответил вовремя. Попробуйте ещё раз."});
        return json(502,{error:"Облачный AI временно недоступен. Попробуйте позже или выберите локальный режим."});
      }
    }
    if(!["GET","HEAD"].includes(request.method))return new Response("Method not allowed",{status:405});
    if(url.pathname==="/deployment-config.js"){
      const config={aiProxyBaseUrl:url.origin,defaultAIProvider:configured?"proxy":"local-demo"};
      return new Response(request.method==="HEAD"?null:`globalThis.LANGUAGE_TEACHER_CONFIG=${JSON.stringify(config)};`,{
        headers:{"Content-Type":"text/javascript; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}
      });
    }
    const asset=assets[url.pathname==="/"?"/index.html":url.pathname];
    if(!asset)return new Response("Not found",{status:404});
    const body=request.method==="HEAD"?null:Uint8Array.from(atob(asset.base64),char=>char.charCodeAt(0));
    return new Response(body,{headers:{
      "Content-Type":asset.contentType,"Cache-Control":"no-cache",
      "X-Content-Type-Options":"nosniff","Referrer-Policy":"same-origin"
    }});
  }};
}
