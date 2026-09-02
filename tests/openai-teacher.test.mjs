import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOpenAIRequest,extractOutputText,requestOpenAITeacherResponse,
  sanitizeTeacherContext
} from "../server/openai-teacher.mjs";

const context={
  contextVersion:2,userId:"local-user",languageId:"cs",
  languageProfile:{id:"profile-secret",name:"Čeština",goals:["everyday-life"],skills:{}},
  mode:"conversation",userInput:"Dobrý den",
  conversationTurns:[{id:"turn-secret",role:"user",text:"Dobrý den"}],
  weakItems:[{id:"item-secret",type:"phrase",text:"Dobrý den",meaning:"Hello"}],
  mistakes:[],situations:[],recentSessions:[],recentItems:[]
};

const teacherResponse={
  schemaVersion:1,provider:"openai-proxy",kind:"teacher-response",
  message:"Dobrý den! Jak se máte?",
  blocks:[{
    type:"RESPOND",title:"Krátká odpověď",prompt:"Odpovězte jednou větou.",
    hints:[],expectedAnswer:null
  }],
  corrections:[],
  learningSignals:{suggestedItems:[],mistakePatterns:[]}
};

test("removes local identifiers before a context leaves the proxy",()=>{
  const sanitized=sanitizeTeacherContext(context);
  const serialized=JSON.stringify(sanitized);
  assert.equal(serialized.includes("local-user"),false);
  assert.equal(serialized.includes("secret"),false);
  assert.equal(sanitized.languageId,"cs");
});

test("builds a non-stored structured Responses API request",()=>{
  const request=buildOpenAIRequest({context,model:"test-model"});
  assert.equal(request.store,false);
  assert.equal(request.model,"test-model");
  assert.equal(request.text.format.type,"json_schema");
  assert.equal(request.text.format.strict,true);
});

test("extracts output text from REST response content",()=>{
  assert.equal(extractOutputText({output:[{content:[{type:"output_text",text:"ok"}]}]}),"ok");
});

test("returns a validated teacher response from a mocked provider",async()=>{
  const fetchImpl=async(_url,options)=>{
    assert.equal(options.headers.Authorization,"Bearer test-key");
    return new Response(JSON.stringify({output_text:JSON.stringify(teacherResponse)}),{
      status:200,headers:{"Content-Type":"application/json"}
    });
  };

  const result=await requestOpenAITeacherResponse({
    context,apiKey:"test-key",model:"test-model",fetchImpl
  });
  assert.equal(result.kind,"teacher-response");
  assert.equal(result.provider,"openai-proxy");
});
