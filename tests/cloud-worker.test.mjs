import test from "node:test";
import assert from "node:assert/strict";
import {createCloudWorker} from "../server/cloud-worker.mjs";

const origin="https://teacher.example";
const env={OPENAI_API_KEY:"server-only-test-key",OPENAI_MODEL:"test-model"};
const answer={schemaVersion:1,provider:"openai-proxy",kind:"teacher-response",message:"Dobrý den!",
  blocks:[],corrections:[],learningSignals:{suggestedItems:[],mistakePatterns:[]}};
const post=(body={context:{languageId:"cs",mode:"conversation",userInput:"Ahoj"}},headers={})=>
  new Request(`${origin}/api/teacher`,{method:"POST",headers:{"content-type":"application/json",origin,...headers},
    body:typeof body==="string"?body:JSON.stringify(body)});

test("cloud health and startup configuration reflect server readiness without exposing secrets",async()=>{
  const worker=createCloudWorker();
  for(const [config,ready] of [[{},false],[env,true]]){
    const health=await worker.fetch(new Request(`${origin}/api/health`),config);
    assert.equal((await health.json()).configured,ready);
    const startup=await (await worker.fetch(new Request(`${origin}/deployment-config.js`),config)).text();
    assert.ok(startup.includes(ready?'"defaultAIProvider":"proxy"':'"defaultAIProvider":"local-demo"'));
    assert.equal(startup.includes(env.OPENAI_API_KEY),false);
    assert.equal(startup.includes("OPENAI_API_KEY"),false);
  }
  assert.equal((await worker.fetch(post(),{})).status,503);
});

test("cloud sends sanitized learning context to OpenAI and returns validated structured output",async()=>{
  let called=0;
  const worker=createCloudWorker({fetchImpl:async(url,options)=>{
    called++;
    assert.equal(url,"https://api.openai.com/v1/responses");
    assert.equal(options.headers.Authorization,`Bearer ${env.OPENAI_API_KEY}`);
    const payload=JSON.parse(options.body);
    assert.equal(payload.store,false);
    assert.equal(payload.text.format.strict,true);
    assert.equal(payload.input.includes("local-private-id"),false);
    return Response.json({output_text:JSON.stringify(answer)});
  }});
  for(const mode of ["practice","conversation","real-life"]){
    const response=await worker.fetch(post({context:{userId:"local-private-id",languageId:"cs",mode}}),env);
    assert.equal(response.status,200);
    assert.deepEqual(await response.json(),answer);
    assert.equal(response.headers.get("cache-control"),"no-store");
  }
  assert.equal(called,3);
});

test("cloud rejects foreign origins, invalid bodies and oversized input before calling OpenAI",async()=>{
  const worker=createCloudWorker({fetchImpl:()=>assert.fail("must not call paid API")});
  assert.equal((await worker.fetch(post({}, {origin:"https://foreign.example"}),env)).status,403);
  assert.equal((await worker.fetch(post({}, {"sec-fetch-site":"cross-site"}),env)).status,403);
  assert.equal((await worker.fetch(post({}, {"content-type":"text/plain"}),env)).status,415);
  assert.equal((await worker.fetch(post("{invalid"),env)).status,400);
  assert.equal((await worker.fetch(post({context:[]}),env)).status,400);
  assert.equal((await worker.fetch(post("x".repeat(128*1024+1)),env)).status,413);
});

test("cloud caps bursts and does not leak provider errors or keys",async()=>{
  let time=1_000_000,called=0;
  const worker=createCloudWorker({now:()=>time,fetchImpl:async()=>{
    called++;
    throw new Error(`private ${env.OPENAI_API_KEY}`);
  }});
  for(let i=0;i<30;i++){
    const response=await worker.fetch(post(),env);
    assert.equal(response.status,502);
    assert.equal((await response.text()).includes(env.OPENAI_API_KEY),false);
  }
  assert.equal((await worker.fetch(post(),env)).status,429);
  assert.equal(called,30);
  time+=60_000;
  assert.equal((await worker.fetch(post(),env)).status,502);
});

test("cloud serves only explicit public assets and supports HEAD",async()=>{
  const worker=createCloudWorker({assets:{"/index.html":{base64:btoa("<html>Teacher</html>"),contentType:"text/html"}}});
  assert.equal(await (await worker.fetch(new Request(origin),env)).text(),"<html>Teacher</html>");
  assert.equal(await (await worker.fetch(new Request(origin,{method:"HEAD"}),env)).text(),"");
  for(const file of ["/.env","/server/openai-teacher.mjs","/package.json","/api/unknown"]){
    assert.equal((await worker.fetch(new Request(`${origin}${file}`),env)).status,404);
  }
});
