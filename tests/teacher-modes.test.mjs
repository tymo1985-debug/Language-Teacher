import test from "node:test";
import assert from "node:assert/strict";
import {buildTeacherInstructions} from "../server/teacher-contract.mjs";
import {buildOpenAIRequest} from "../server/openai-teacher.mjs";

const baseContext=mode=>({
  contextVersion:2,
  languageId:"cs",
  languageProfile:{name:"Čeština",goals:["everyday-life"],skills:{}},
  mode,
  userInput:"Potřebuji pomoc.",
  conversationTurns:[],
  weakItems:[],
  mistakes:[],
  situations:[],
  recentSessions:[],
  recentItems:[]
});

test("conversation instructions keep the model in partner role",()=>{
  const instructions=buildTeacherInstructions("conversation");
  assert.match(instructions,/conversation partner/i);
  assert.match(instructions,/Do not pre-answer/i);
  assert.match(instructions,/target language dominant/i);
});

test("real-life instructions require one primary natural phrase",()=>{
  const instructions=buildTeacherInstructions("real-life");
  assert.match(instructions,/one primary natural phrase/i);
  assert.match(instructions,/PHRASE block/i);
  assert.match(instructions,/real-world need first/i);
});

test("OpenAI request selects mode-specific instructions",()=>{
  const conversation=buildOpenAIRequest({context:baseContext("conversation"),model:"test-model"});
  const realLife=buildOpenAIRequest({context:baseContext("real-life"),model:"test-model"});
  assert.notEqual(conversation.instructions,realLife.instructions);
  assert.match(conversation.instructions,/Conversation mode/);
  assert.match(realLife.instructions,/Real Life mode/);
});
