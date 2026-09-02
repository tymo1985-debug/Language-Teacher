import test from "node:test";
import assert from "node:assert/strict";
import {setLocale,t,translateGoal,translateAssessment} from "../src/i18n/i18n.js";

test("switches current core UI strings between supported locales",()=>{
  setLocale("en");
  assert.equal(t("first_language"),"Add a language first");
  assert.equal(t("conversation_pick"),"Choose a situation");
  assert.equal(t("progress_title"),"What you can already do in practice");

  setLocale("uk");
  assert.equal(t("first_language"),"Спочатку додайте мову");
  assert.equal(t("real_title"),"Мені це потрібно зараз");
  assert.equal(translateGoal("travel"),"Подорожі");
});

test("falls back to Russian for unsupported locale",()=>{
  setLocale("xx");
  assert.equal(t("first_language"),"Сначала добавьте язык");
  assert.equal(t("review_done"),"На сегодня всё повторено");
  assert.equal(translateAssessment("starter"),"Я почти ничего не знаю");
});
