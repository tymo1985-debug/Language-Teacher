import {readFile,readdir,stat} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";

const THIS_DIR=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(THIS_DIR,"..");

function fail(message){throw new Error(message);}

export function parseVersionModule(source){
  const read=name=>source.match(new RegExp(`export const ${name}\\s*=\\s*"([^"]+)"`))?.[1]??null;
  return {version:read("APP_VERSION"),phase:read("APP_PHASE"),buildDate:read("APP_BUILD_DATE")};
}

export function parseServiceWorkerCache(source){
  return source.match(/const CACHE_NAME\s*=\s*"([^"]+)"/)?.[1]??null;
}

export function parseAppShell(source){
  const block=source.match(/const APP_SHELL\s*=\s*\[([\s\S]*?)\];/)?.[1]??"";
  return [...block.matchAll(/"(\.\/[^"]*)"/g)].map(match=>match[1]);
}

export function validateManifest(manifest){
  const data=typeof manifest==="string"?JSON.parse(manifest):manifest;
  const errors=[];
  if(!data?.name)errors.push("manifest.name is missing.");
  if(!data?.start_url)errors.push("manifest.start_url is missing.");
  if(!data?.scope)errors.push("manifest.scope is missing.");
  if(data?.display!=="standalone")errors.push("manifest.display must be standalone.");
  if(!Array.isArray(data?.icons)||!data.icons.some(icon=>icon.sizes==="192x192"))errors.push("192x192 manifest icon is missing.");
  if(!Array.isArray(data?.icons)||!data.icons.some(icon=>icon.sizes==="512x512"))errors.push("512x512 manifest icon is missing.");
  return {ok:errors.length===0,errors};
}

export function validateDeploymentConfig(source){
  const errors=[];
  if(/OPENAI_API_KEY\s*=|sk-[A-Za-z0-9_-]{20,}/.test(source))errors.push("deployment-config.js appears to contain a secret.");
  if(!/aiProxyBaseUrl/.test(source))errors.push("deployment-config.js must expose aiProxyBaseUrl.");
  return {ok:errors.length===0,errors};
}

export function validateReleaseMetadata({versionModule,packageJson,updateJson,serviceWorker}){
  const errors=[];
  const app=parseVersionModule(versionModule);
  const pkg=typeof packageJson==="string"?JSON.parse(packageJson):packageJson;
  const update=typeof updateJson==="string"?JSON.parse(updateJson):updateJson;
  const cache=parseServiceWorkerCache(serviceWorker);
  if(!app.version)errors.push("APP_VERSION is missing.");
  if(app.version!==pkg.version)errors.push(`Version mismatch: app ${app.version} != package ${pkg.version}.`);
  if(app.version!==update.latestVersion)errors.push(`Version mismatch: app ${app.version} != update ${update.latestVersion}.`);
  if(app.phase!==update.phase)errors.push(`Phase mismatch: app "${app.phase}" != update "${update.phase}".`);
  if(!/language-teacher-shell-v\d+/.test(cache??""))errors.push("Service Worker CACHE_NAME is missing or invalid.");
  if(!Array.isArray(update.changes)||update.changes.length===0)errors.push("update.json must contain release changes.");
  if(!app.buildDate)errors.push("APP_BUILD_DATE is missing.");
  return {ok:errors.length===0,errors,app,cache};
}

async function walk(dir){
  const out=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    if(["node_modules",".git","dist"].includes(entry.name))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...await walk(full));else out.push(full);
  }
  return out;
}

function run(command,args){
  const result=spawnSync(command,args,{cwd:ROOT,encoding:"utf8",stdio:"pipe"});
  if(result.status!==0){
    const detail=[result.stdout,result.stderr].filter(Boolean).join("\n").trim();
    fail(`${command} ${args.join(" ")} failed${detail?`:\n${detail}`:"."}`);
  }
}

async function exists(relative){
  try{return (await stat(path.join(ROOT,relative))).isFile();}catch{return false;}
}

async function checkSyntax(){
  const files=(await walk(ROOT)).filter(file=>/\.(?:js|mjs)$/.test(file));
  for(const file of files)run(process.execPath,["--check",file]);
  return files.length;
}

async function checkReleaseMetadata(){
  const [versionModule,packageJson,updateJson,serviceWorker,manifest,deploymentConfig]=await Promise.all([
    readFile(path.join(ROOT,"src/app/version.js"),"utf8"),
    readFile(path.join(ROOT,"package.json"),"utf8"),
    readFile(path.join(ROOT,"update.json"),"utf8"),
    readFile(path.join(ROOT,"sw.js"),"utf8"),
    readFile(path.join(ROOT,"manifest.webmanifest"),"utf8"),
    readFile(path.join(ROOT,"deployment-config.js"),"utf8")
  ]);
  const metadata=validateReleaseMetadata({versionModule,packageJson,updateJson,serviceWorker});
  const errors=[...metadata.errors,...validateManifest(manifest).errors,...validateDeploymentConfig(deploymentConfig).errors];
  if(errors.length)fail(errors.join("\n"));
  return metadata;
}

async function checkRequiredFiles(){
  const required=[
    ".github/workflows/release-gate.yml",
    "index.html","manifest.webmanifest","sw.js","update.json","package.json","deployment-config.js",
    "src/app/app.js","src/app/state.js","src/app/version.js","src/app/update-manager.js","src/app/release-check.js",
    "src/storage/db.js","src/storage/backup.js","src/storage/restore.js",
    "src/learning/session-engine.js","src/learning/srs-engine.js","src/i18n/i18n.js",
    "src/ui/screens/today.js","src/ui/screens/practice.js","src/ui/screens/settings.js"
  ];
  const missing=[];
  for(const relative of required)if(!(await exists(relative)))missing.push(relative);
  if(missing.length)fail(`Required release files missing:\n${missing.join("\n")}`);
  return required.length;
}

async function checkAppShell(){
  const sw=await readFile(path.join(ROOT,"sw.js"),"utf8");
  const entries=parseAppShell(sw);
  const missing=[];
  const duplicates=entries.filter((value,index)=>entries.indexOf(value)!==index);
  for(const entry of entries){
    if(entry==="./")continue;
    const relative=entry.replace(/^\.\//,"");
    if(!(await exists(relative)))missing.push(entry);
  }
  if(missing.length)fail(`Service Worker APP_SHELL contains missing files:\n${missing.join("\n")}`);
  if(duplicates.length)fail(`Service Worker APP_SHELL contains duplicate entries:\n${[...new Set(duplicates)].join("\n")}`);
  return entries.length;
}

export async function runReleaseGate(){
  const metadata=await checkReleaseMetadata();
  const requiredCount=await checkRequiredFiles();
  const shellCount=await checkAppShell();
  const syntaxCount=await checkSyntax();
  run(process.execPath,["scripts/build-cloud.mjs"]);
  run(process.execPath,["scripts/check-cloud-build.mjs"]);
  run(process.execPath,["--test"]);
  return {version:metadata.app.version,phase:metadata.app.phase,cache:metadata.cache,requiredCount,shellCount,syntaxCount};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  runReleaseGate().then(result=>{
    console.log(`Release gate passed for ${result.version}`);
    console.log(`Phase: ${result.phase}`);
    console.log(`Service Worker: ${result.cache}`);
    console.log(`Required files: ${result.requiredCount}`);
    console.log(`Offline shell entries: ${result.shellCount}`);
    console.log(`Syntax checked: ${result.syntaxCount} JS/MJS files`);
    console.log("Tests: passed");
  }).catch(error=>{
    console.error("Release gate failed:");
    console.error(error?.message??error);
    process.exitCode=1;
  });
}
