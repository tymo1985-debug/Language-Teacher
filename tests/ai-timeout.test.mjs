import test from "node:test";
import assert from "node:assert/strict";
import {requestOpenAITeacherResponse} from "../server/openai-teacher.mjs";
import {ProxyAIProvider} from "../src/ai/proxy-provider.js";

// Headers arrive promptly, but the body never finishes until the request aborts.
const delayedBody=async(_url,{signal})=>({ok:true,headers:new Headers({"content-type":"application/json"}),
  json:()=>new Promise((_resolve,reject)=>{
    const abort=()=>reject(new DOMException("Aborted","AbortError"));
    if(signal.aborted)abort();else signal.addEventListener("abort",abort,{once:true});
  })});

test("server timeout includes reading the OpenAI response body",{timeout:2000},async()=>{
  await assert.rejects(requestOpenAITeacherResponse({context:{},apiKey:"test",model:"test",timeoutMs:20,fetchImpl:delayedBody}),{name:"AbortError"});
});

test("browser timeout includes reading the proxy response body",{timeout:2000},async t=>{
  t.mock.method(globalThis,"fetch",delayedBody);
  const navigatorDescriptor=Object.getOwnPropertyDescriptor(globalThis,"navigator");
  Object.defineProperty(globalThis,"navigator",{configurable:true,value:{onLine:true}});
  t.after(()=>navigatorDescriptor?Object.defineProperty(globalThis,"navigator",navigatorDescriptor):delete globalThis.navigator);
  await assert.rejects(new ProxyAIProvider({endpoint:"/api/teacher",timeoutMs:20}).generateTeacherResponse({}),/timed out/);
});
