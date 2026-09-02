import test from "node:test";
import assert from "node:assert/strict";
import {validatePortableBackup} from "../src/storage/backup-validation.js";

const options={format:"language-teacher-backup",version:1,stores:["users","settings"]};

test("valid portable backup passes before restore",()=>{
  const result=validatePortableBackup({
    format:"language-teacher-backup",
    backupVersion:1,
    data:{users:[{id:"local-user"}],settings:[{id:"ui"}]}
  },options);
  assert.equal(result.valid,true);
});

test("malformed record is rejected before destructive restore begins",()=>{
  const result=validatePortableBackup({
    format:"language-teacher-backup",
    backupVersion:1,
    data:{users:[{id:"local-user"}],settings:[{value:"missing id"}]}
  },options);
  assert.equal(result.valid,false);
  assert.ok(result.errors.some(error=>error.includes("settings")));
});
