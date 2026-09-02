import test from "node:test";
import assert from "node:assert/strict";
import {completeCurrentSessionBlock} from "../src/learning/session-engine.js";

test("completes one block without mutating the source session",()=>{
  const source={
    id:"session-1",status:"planned",completedAt:null,
    blocks:[{id:"a",status:"pending"},{id:"b",status:"pending"}]
  };
  const result=completeCurrentSessionBlock(source,"2026-09-02T12:00:00.000Z");

  assert.deepEqual(source.blocks.map(block=>block.status),["pending","pending"]);
  assert.deepEqual(result.blocks.map(block=>block.status),["completed","pending"]);
  assert.equal(result.status,"in-progress");
  assert.equal(result.completedAt,null);
});

test("marks the session completed after its final block",()=>{
  const source={
    id:"session-1",status:"in-progress",completedAt:null,
    blocks:[{id:"a",status:"completed"},{id:"b",status:"pending"}]
  };
  const result=completeCurrentSessionBlock(source,"2026-09-02T12:05:00.000Z");

  assert.equal(result.status,"completed");
  assert.equal(result.completedAt,"2026-09-02T12:05:00.000Z");
});
