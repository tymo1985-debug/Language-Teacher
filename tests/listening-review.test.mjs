import test from "node:test";
import assert from "node:assert/strict";
import {chooseReviewExercise} from "../src/learning/srs-engine.js";

test("listening review is audio-first and hides target text in the prompt",()=>{
  const exercise=chooseReviewExercise({
    text:"Dobrý den, mohl byste mi pomoci?",
    meaning:"Добрый день, не могли бы вы мне помочь?",
    memory:{recognition:.8,production:.8,listening:.1,pronunciation:.7}
  });

  assert.equal(exercise.dimension,"listening");
  assert.equal(exercise.kind,"listening-recall");
  assert.equal(exercise.audioText,"Dobrý den, mohl byste mi pomoci?");
  assert.equal(exercise.answer,"Dobrý den, mohl byste mi pomoci?");
  assert.equal(exercise.prompt.includes("Dobrý den"),false);
});

test("listening rating still uses the normal SRS memory dimension",()=>{
  const exercise=chooseReviewExercise({
    text:"Danke schön",
    meaning:"Спасибо",
    memory:{recognition:.9,production:.9,listening:.2,pronunciation:.8}
  });
  assert.equal(exercise.dimension,"listening");
});
