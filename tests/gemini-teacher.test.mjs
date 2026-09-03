import test from "node:test";
import assert from "node:assert/strict";
import 'fake-indexeddb/auto';
import {requestGeminiTeacherResponse,buildGeminiRequest} from "../server/gemini-teacher.mjs";
import {createCloudWorker} from "../server/cloud-worker.mjs";
import {isTeacherConfigured} from "../server/teacher-service.mjs";
import {buildTeacherContext} from "../src/ai/context-builder.js";
import {setLocale} from "../src/i18n/i18n.js";

const env={AI_PROVIDER:"gemini",GEMINI_API_KEY:"test-server-key",GEMINI_MODEL:"gemini-3.5-flash-lite",
  OPENAI_API_KEY:"must-never-be-used",OPENAI_MODEL:"test-model"};
const answer={schemaVersion:1,provider:"gemini-proxy",kind:"teacher-response",message:"Dobrý den! Co si dáte?",
  blocks:[],corrections:[],learningSignals:{suggestedItems:[],mistakePatterns:[]}};
const post=context=>new Request("https://teacher.example/api/teacher",{method:"POST",
  headers:{"Content-Type":"application/json",Origin:"https://teacher.example"},body:JSON.stringify({context})});
const providerResponse=(value=answer,finishReason="STOP")=>Response.json({candidates:[{
  finishReason,content:{parts:[{text:JSON.stringify(value)}]}
}]});

test("the selected interface language reaches Gemini without changing the language being learned",async t=>{
  t.after(()=>setLocale("ru"));
  for(const locale of ["ru","uk","en"]){
    setLocale(locale);
    const context=await buildTeacherContext({languageProfile:{languageId:"cs",name:"Čeština"}});
    const sent=JSON.parse(buildGeminiRequest(context).contents[0].parts[0].text);
    assert.equal(sent.interfaceLanguage,locale);
    assert.equal(sent.languageId,"cs");
  }
});

test("Gemini serves each teaching mode, sends context and history only to Google and keeps keys server-side",async()=>{
  const worker=createCloudWorker({fetchImpl:async(url,options)=>{
    assert.equal(url,`https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`);
    assert.equal(options.headers["x-goog-api-key"],env.GEMINI_API_KEY);
    assert.equal(options.headers.Authorization,undefined);
    assert.ok(!options.body.includes(env.GEMINI_API_KEY));
    const payload=JSON.parse(options.body);
    assert.equal(payload.generationConfig.responseMimeType,"application/json");
    assert.equal(payload.generationConfig.candidateCount,1);
    assert.equal(payload.generationConfig.maxOutputTokens,2400);
    const context=JSON.parse(payload.contents[0].parts[0].text);
    assert.equal(context.userId,undefined);
    assert.equal(context.conversationTurns[0].text,"Dobrý den!");
    assert.match(payload.systemInstruction.parts[0].text,/mode:/i);
    return providerResponse();
  }});
  for(const mode of ["practice","conversation","real-life"]){
    const result=await worker.fetch(post({mode,userId:"private-id",languageId:"cs",
      conversationTurns:[{role:"partner",text:"Dobrý den!"}],userInput:"Kávu, prosím."}),env);
    assert.equal(result.status,200);
    assert.deepEqual(await result.json(),answer);
  }
  for(const route of ["/api/health","/deployment-config.js"]){
    const text=await (await worker.fetch(new Request(`https://teacher.example${route}`),env)).text();
    assert.ok(!text.includes(env.GEMINI_API_KEY));
    assert.ok(!text.includes(env.OPENAI_API_KEY));
  }
});

test("Gemini quota errors make exactly one Google request and never fall back to OpenAI",async()=>{
  let calls=0;
  const worker=createCloudWorker({fetchImpl:async url=>{
    calls++;assert.ok(url.startsWith("https://generativelanguage.googleapis.com/"));
    return Response.json({error:{message:`private ${env.GEMINI_API_KEY}`}}, {status:429});
  }});
  const response=await worker.fetch(post({mode:"practice"}),env);
  assert.equal(response.status,429);
  const body=await response.json();
  assert.equal(body.code,"AI_QUOTA_EXCEEDED");
  assert.ok(!JSON.stringify(body).includes(env.GEMINI_API_KEY));
  assert.equal(calls,1);
  assert.equal(isTeacherConfigured({OPENAI_API_KEY:"unused",OPENAI_MODEL:"unused"}),false);
  assert.equal(isTeacherConfigured({...env,GEMINI_API_KEY:""}),false);
});

test("Gemini rejects incomplete, blocked and malformed structured answers",async()=>{
  for(const reply of [providerResponse(answer,"MAX_TOKENS"),providerResponse(answer,"SAFETY"),
    providerResponse({message:"wrong format"}),Response.json({promptFeedback:{blockReason:"SAFETY"}})]){
    await assert.rejects(requestGeminiTeacherResponse({context:{},apiKey:"test",model:env.GEMINI_MODEL,fetchImpl:async()=>reply}));
  }
});

test("Gemini timeout also covers response-body reading",{timeout:2000},async()=>{
  await assert.rejects(requestGeminiTeacherResponse({context:{},apiKey:"test",model:env.GEMINI_MODEL,timeoutMs:20,
    fetchImpl:async(_url,{signal})=>({ok:true,json:()=>new Promise((_resolve,reject)=>{
      const abort=()=>reject(new DOMException("Aborted","AbortError"));
      if(signal.aborted)abort();else signal.addEventListener("abort",abort,{once:true});
    })})}),{name:"AbortError"});
});
