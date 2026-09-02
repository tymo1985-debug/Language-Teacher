import test from "node:test";
import assert from "node:assert/strict";
import {hasTranslation,setLocale,t} from "../src/i18n/i18n.js";

const REQUIRED=[
  "nav_today","nav_practice","nav_words","nav_progress","nav_settings","nav_label",
  "add_language","online","offline","add_language_title","language","choose_language",
  "language_reason","multiple_goals","confidence","cancel","add",
  "practice_title","practice_intro","talk","talk_text","pronunciation","pronunciation_text",
  "review","review_text","real_life","real_life_text","grammar","grammar_text","grammar_empty",
  "recommended","start_today","continue_today","view_today","completed_today","blocks","remaining",
  "due","no_due","tools","tools_title","custom_exercise","custom_exercise_hint","session_preparing",
  "ui_language","settings_title","local_hint","reduce_motion","accessibility",
  "first_language","conversation_pick","real_title","review_done","session_complete","pron_title",
  "teacher_title","library_title","progress_title","backup_title","recording_unavailable"
];

for(const locale of ["ru","en","uk"]){
  test(`final UI translation contract is complete for ${locale}`,()=>{
    setLocale(locale);
    for(const key of REQUIRED){
      assert.equal(hasTranslation(key,locale),true,`${locale}:${key}`);
      assert.equal(typeof t(key),"string",`${locale}:${key} must resolve to text`);
      assert.ok(t(key).length>0,`${locale}:${key} must not be empty`);
    }
  });
}

test("representative foundation keys resolve instead of leaking identifiers",()=>{
  setLocale("en");
  assert.equal(t("nav_today"),"Today");
  assert.equal(t("practice_title"),"What would you like to do now?");
  setLocale("uk");
  assert.equal(t("nav_settings"),"Налаштування");
  setLocale("ru");
  assert.equal(t("add_language_title"),"Какой язык будем учить?");
});
