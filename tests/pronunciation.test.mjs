import test from "node:test";
import assert from "node:assert/strict";
import {compareTranscript,normalizeSpeechText,buildPronunciationGuidance} from "../src/speech/pronunciation.js";

test("normalizes punctuation and case for transcript comparison",()=>{
  assert.equal(normalizeSpeechText("Dobrý den!"),"dobrý den");
});

test("reports exact transcript match without calling it pronunciation scoring",()=>{
  const result=compareTranscript("Dobrý den","dobrý den.");
  assert.equal(result.comparable,true);
  assert.equal(result.exact,true);
  assert.equal(result.overlap,1);
  assert.match(result.feedback,/совпал/i);
});

test("reports partial word overlap as text recognition only",()=>{
  const result=compareTranscript("mohl byste mi pomoci","mohl mi pomoci");
  assert.equal(result.exact,false);
  assert.ok(result.overlap>0.5);
  assert.ok(result.overlap<1);
});

test("guidance explicitly keeps SpeechRecognition optional",()=>{
  const guidance=buildPronunciationGuidance("Dobrý den",null);
  assert.ok(guidance.steps.some(step=>/pronunciation score/i.test(step)));
});
