import test from "node:test";
import assert from "node:assert/strict";
import {setLocale,t,translateGoal,translateAssessment} from "../src/i18n/i18n.js";

test("switches core UI strings between supported locales",()=>{
  setLocale("en");
  assert.equal(t("nav_today"),"Today");
  assert.equal(t("practice_title"),"What would you like to do now?");
  setLocale("uk");
  assert.equal(t("nav_settings"),"Налаштування");
  assert.equal(translateGoal("travel"),"Подорожі");
});

test("falls back to Russian for unsupported locale",()=>{
  setLocale("xx");
  assert.equal(t("nav_today"),"Сегодня");
  assert.equal(translateAssessment("starter"),"Я почти ничего не знаю");
});
