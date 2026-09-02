import test from "node:test";import assert from "node:assert/strict";import {setLocale,t} from "../src/i18n/i18n.js";
const keys=["first_language","conversation_pick","real_title","review_done","session_complete","pron_title","teacher_title","library_title","progress_title","backup_title","recording_unavailable"];
for(const locale of ["ru","en","uk"])test(`core screen strings exist for ${locale}`,()=>{setLocale(locale);for(const key of keys){const value=t(key);assert.ok(value&&value!==key,`${locale}:${key}`);}});
