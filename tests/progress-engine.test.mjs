import test from "node:test";
import assert from "node:assert/strict";
import {buildProgressSnapshot} from "../src/learning/progress-engine.js";

test("uses observed memory when practice evidence exists",()=>{
  const snapshot=buildProgressSnapshot({
    baselineSkills:{speaking:.2,listening:.2,pronunciation:.2,vocabulary:.2,grammar:.2},
    learningItems:[
      {memory:{recognition:.8,production:.6,listening:.7,pronunciation:.5}},
      {memory:{recognition:.6,production:.4,listening:.5,pronunciation:.7}}
    ]
  });
  assert.equal(snapshot.skills.speaking.source,"practice");
  assert.equal(snapshot.skills.speaking.value,.5);
  assert.equal(snapshot.skills.listening.value,.6);
  assert.equal(snapshot.skills.vocabulary.value,.6);
});

test("keeps baseline for skills without observed evidence",()=>{
  const snapshot=buildProgressSnapshot({
    baselineSkills:{grammar:.42,speaking:.3},
    learningItems:[]
  });
  assert.equal(snapshot.skills.grammar.source,"baseline");
  assert.equal(snapshot.skills.grammar.value,.42);
  assert.equal(snapshot.skills.speaking.value,.3);
});

test("derives real-life capability evidence from completed conversation and reviews",()=>{
  const snapshot=buildProgressSnapshot({
    sessions:[{status:"completed",mode:"conversation",scenarioId:"problem"}],
    reviews:[{dimension:"production",before:.3,after:.5}],
    learningItems:[{memory:{recognition:.5,production:.5,listening:.5,pronunciation:.5}}]
  });
  assert.equal(snapshot.activity.conversations,1);
  assert.equal(snapshot.capabilities[1].status,"good");
  assert.equal(snapshot.capabilities[2].status,"developing");
});
