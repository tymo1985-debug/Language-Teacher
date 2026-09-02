import test from "node:test";
import assert from "node:assert/strict";
import {
  parseAppShell,
  validateDeploymentConfig,
  validateManifest,
  validateReleaseMetadata
} from "../scripts/release-gate.mjs";


const versionModule=`
export const APP_VERSION = "1.13.0";
export const APP_PHASE = "Phase 19 · Final Polish / Release Candidate";
export const APP_BUILD_DATE = "2026-09-02";
`;

test("release metadata stays synchronized",()=>{
  const result=validateReleaseMetadata({
    versionModule,
    packageJson:{version:"1.13.0"},
    updateJson:{latestVersion:"1.13.0",phase:"Phase 19 · Final Polish / Release Candidate",changes:["x"]},
    serviceWorker:'const CACHE_NAME="language-teacher-shell-v25";'
  });
  assert.equal(result.ok,true);
});

test("manifest validation protects installability basics",()=>{
  assert.equal(validateManifest({
    name:"Language Teacher",start_url:"./",scope:"./",display:"standalone",
    icons:[{sizes:"192x192"},{sizes:"512x512"}]
  }).ok,true);
  assert.equal(validateManifest({name:"x",display:"browser",icons:[]}).ok,false);
});

test("deployment config rejects embedded API secrets",()=>{
  assert.equal(validateDeploymentConfig('globalThis.LANGUAGE_TEACHER_CONFIG={aiProxyBaseUrl:""};').ok,true);
  assert.equal(validateDeploymentConfig('const OPENAI_API_KEY="secret"; aiProxyBaseUrl="x";').ok,false);
});

test("service worker shell parser finds local assets",()=>{
  assert.deepEqual(
    parseAppShell('const APP_SHELL=["./","./index.html","./src/app/app.js"];'),
    ["./","./index.html","./src/app/app.js"]
  );
});

test("runtime release summary separates blockers from optional capabilities",async()=>{
  const {summarizeReleaseChecks}=await import("../src/app/release-check-summary.js");

  const result=summarizeReleaseChecks([
    {ok:true},
    {ok:false,optional:true},
    {ok:true,optional:true}
  ]);
  assert.equal(result.passed,true);
  assert.equal(result.blockingCount,0);
  assert.equal(result.optionalUnavailableCount,1);
});
