import {createReadStream} from "node:fs";
import {stat} from "node:fs/promises";
import {createServer} from "node:http";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {requestOpenAITeacherResponse} from "./openai-teacher.mjs";

const SERVER_DIR=path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR=path.resolve(SERVER_DIR,"..");
const PORT=Number(process.env.PORT)||8787;
const BODY_LIMIT=128*1024;
const WINDOW_MS=60_000;
const REQUEST_LIMIT=30;
const requestsByClient=new Map();

const MIME_TYPES=new Map([
  [".html","text/html; charset=utf-8"],[".js","text/javascript; charset=utf-8"],
  [".mjs","text/javascript; charset=utf-8"],[".css","text/css; charset=utf-8"],
  [".json","application/json; charset=utf-8"],[".webmanifest","application/manifest+json"],
  [".png","image/png"],[".svg","image/svg+xml"]
]);

function json(response,status,payload){
  response.writeHead(status,{
    "Content-Type":"application/json; charset=utf-8",
    "Cache-Control":"no-store",
    "X-Content-Type-Options":"nosniff"
  });
  response.end(JSON.stringify(payload));
}

function rateLimited(request){
  const key=request.socket.remoteAddress??"local";
  const now=Date.now();
  const current=requestsByClient.get(key);
  if(!current||now-current.startedAt>=WINDOW_MS){
    requestsByClient.set(key,{startedAt:now,count:1});
    return false;
  }
  current.count+=1;
  return current.count>REQUEST_LIMIT;
}

async function readJsonBody(request){
  let size=0;
  const chunks=[];
  for await(const chunk of request){
    size+=chunk.length;
    if(size>BODY_LIMIT)throw new Error("REQUEST_TOO_LARGE");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function handleTeacher(request,response){
  if(rateLimited(request))return json(response,429,{error:"Слишком много запросов. Попробуйте через минуту."});

  try{
    const body=await readJsonBody(request);
    if(!body?.context)return json(response,400,{error:"Отсутствует учебный контекст."});

    const teacherResponse=await requestOpenAITeacherResponse({
      context:body.context,
      apiKey:process.env.OPENAI_API_KEY,
      model:process.env.OPENAI_MODEL,
      apiUrl:process.env.OPENAI_API_URL,
      timeoutMs:Number(process.env.AI_REQUEST_TIMEOUT_MS)||30000
    });
    return json(response,200,teacherResponse);
  }catch(error){
    if(error?.name==="AbortError")return json(response,504,{error:"AI не ответил вовремя. Попробуйте ещё раз."});
    if(error?.message==="REQUEST_TOO_LARGE")return json(response,413,{error:"Учебный контекст слишком большой."});
    if(error instanceof SyntaxError)return json(response,400,{error:"Некорректный JSON-запрос."});
    if(error?.message?.includes("is not configured"))return json(response,503,{error:"Cloud AI ещё не настроен на сервере."});
    console.error("Teacher proxy error:",error?.message??error);
    return json(response,502,{error:"AI provider временно недоступен. Local practice продолжает работать."});
  }
}

async function handleStatic(request,response,url){
  const pathname=decodeURIComponent(url.pathname);
  if(pathname.startsWith("/.")||pathname.startsWith("/server/")||pathname.startsWith("/tests/")){
    response.writeHead(404);response.end("Not found");return;
  }

  const relative=pathname==="/"?"index.html":pathname.replace(/^\/+/,"");
  const filePath=path.resolve(ROOT_DIR,relative);
  if(filePath!==ROOT_DIR&&!filePath.startsWith(`${ROOT_DIR}${path.sep}`)){
    response.writeHead(403);response.end("Forbidden");return;
  }

  try{
    const info=await stat(filePath);
    if(!info.isFile())throw new Error("Not a file");
    response.writeHead(200,{
      "Content-Type":MIME_TYPES.get(path.extname(filePath))??"application/octet-stream",
      "X-Content-Type-Options":"nosniff",
      "Referrer-Policy":"same-origin"
    });
    createReadStream(filePath).pipe(response);
  }catch{
    response.writeHead(404);response.end("Not found");
  }
}

export function createLanguageTeacherServer(){
  return createServer(async(request,response)=>{
    const url=new URL(request.url??"/","http://localhost");
    if(url.pathname==="/api/teacher"&&request.method==="POST")return handleTeacher(request,response);
    if(url.pathname==="/api/teacher"&&request.method==="OPTIONS"){
      response.writeHead(204,{"Allow":"POST, OPTIONS"});response.end();return;
    }
    if(request.method==="GET"||request.method==="HEAD")return handleStatic(request,response,url);
    response.writeHead(405,{"Allow":"GET, HEAD, POST, OPTIONS"});response.end("Method not allowed");
  });
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  createLanguageTeacherServer().listen(PORT,"127.0.0.1",()=>{
    console.log(`Language Teacher is running at http://127.0.0.1:${PORT}`);
  });
}
