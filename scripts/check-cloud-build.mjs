import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import worker from "../dist/server/index.js";
import {parseAppShell} from "./release-gate.mjs";

const origin="https://teacher.example";
const shell=parseAppShell(await readFile(new URL("../sw.js",import.meta.url),"utf8"));
for(const relative of [...shell,"./sw.js"]){
  const response=await worker.fetch(new Request(new URL(relative,origin)),{});
  assert.equal(response.status,200,`${relative} missing from cloud build`);
  const body=Buffer.from(await response.arrayBuffer());
  assert.ok(body.length>0,`${relative} is empty`);
  if(relative!=="./deployment-config.js"){
    const local=relative==="./"?"./index.html":relative;
    assert.deepEqual(body,await readFile(new URL(`../${local.slice(2)}`,import.meta.url)),`${relative} differs from source`);
  }
}
for(const path of ["/.env","/package.json","/.openai/hosting.json","/server/cloud-worker.mjs"]){
  assert.equal((await worker.fetch(new Request(`${origin}${path}`),{})).status,404);
}
assert.equal((await (await worker.fetch(new Request(`${origin}/api/health`),{})).json()).configured,false);
console.log(`Cloud build check passed: ${shell.length+1} routes match the app, private files are excluded.`);
