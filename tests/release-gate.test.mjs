import test from "node:test";
import assert from "node:assert/strict";
import {parseVersionModule,parseServiceWorkerCache,validateReleaseMetadata} from "../scripts/release-gate.mjs";

const versionModule=`
export const APP_VERSION = "1.10.0";
export const APP_PHASE = "Phase 17 · Release Gates";
export const APP_BUILD_DATE = "2026-09-02";
`;

test("parses centralized release metadata",()=>{
  assert.deepEqual(parseVersionModule(versionModule),{
    version:"1.10.0",
    phase:"Phase 17 · Release Gates",
    buildDate:"2026-09-02"
  });
  assert.equal(parseServiceWorkerCache('const CACHE_NAME="language-teacher-shell-v22";'),"language-teacher-shell-v22");
});

test("accepts consistent release metadata",()=>{
  const result=validateReleaseMetadata({
    versionModule,
    packageJson:{version:"1.10.0"},
    updateJson:{
      latestVersion:"1.10.0",
      phase:"Phase 17 · Release Gates",
      changes:["Automated release gate"]
    },
    serviceWorker:'const CACHE_NAME="language-teacher-shell-v22";'
  });
  assert.equal(result.ok,true);
  assert.deepEqual(result.errors,[]);
});

test("rejects version drift before release",()=>{
  const result=validateReleaseMetadata({
    versionModule,
    packageJson:{version:"1.9.0"},
    updateJson:{
      latestVersion:"1.10.0",
      phase:"Phase 17 · Release Gates",
      changes:["x"]
    },
    serviceWorker:'const CACHE_NAME="language-teacher-shell-v22";'
  });
  assert.equal(result.ok,false);
  assert.ok(result.errors.some(error=>error.includes("package")));
});
