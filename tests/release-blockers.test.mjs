import test from "node:test";
import assert from "node:assert/strict";
import {getServerBindConfig} from "../server/bind-config.mjs";

test("cloud backend binds to all interfaces by default",()=>{
  assert.deepEqual(getServerBindConfig({}),{host:"0.0.0.0",port:8787});
});

test("cloud platform can override HOST and PORT",()=>{
  assert.deepEqual(
    getServerBindConfig({HOST:"127.0.0.1",PORT:"9999"}),
    {host:"127.0.0.1",port:9999}
  );
});
