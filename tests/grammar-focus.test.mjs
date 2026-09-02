import test from "node:test";
import assert from "node:assert/strict";
import {buildGrammarFocus} from "../src/learning/grammar-focus.js";

test("prioritizes repeated high-severity mistakes",()=>{
  const focus=buildGrammarFocus({library:{mistakes:[
    {original:"a",correct:"b",category:"case",severity:"low",count:5},
    {original:"x",correct:"y",pattern:"word order",severity:"high",count:2}
  ]}});
  assert.equal(focus.available,true);
  assert.equal(focus.mistake.original,"x");
  assert.match(focus.title,/word order/);
  assert.match(focus.prompt,/Моя ошибка: x/);
});

test("does not invent grammar material when no mistake exists",()=>{
  const focus=buildGrammarFocus({library:{mistakes:[]}});
  assert.equal(focus.available,false);
  assert.equal(focus.mistake,null);
  assert.match(focus.summary,/не создаёт случайный учебник/);
});
