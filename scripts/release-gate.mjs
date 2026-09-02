import {readFile,readdir,stat} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";

const THIS_DIR=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(THIS_DIR,"..");

function fail(message){
  throw new Error(message);
}

export function parseVersionModule(source){
  const read=name=>{
    const match=source.match(new RegExp(`export const ${name}\\s*=\\s*"([^"]+)"`));
    return match?.[1]??null;
  };
  return {
    version:read("APP_VERSION"),
    phase:read("APP_PHASE"),
    buildDate:read("APP_BUILD_DATE")
  };
}

export function parseServiceWorkerCache(source){
  return source.match(/const CACHE_NAME\s*=\s*"([^"]+)"/)?.[1]??null;
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
    if(entry.name==="node_modules"||entry.name===".git")continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

function run(command,args,options={}){
  const result=spawnSync(command,args,{cwd:ROOT,encoding:"utf8",stdio:"pipe",...options});
  if(result.status!==0){
    const detail=[result.stdout,result.stderr].filter(Boolean).join("\n").trim();
    fail(`${command} ${args.join(" ")} failed${detail?`:\n${detail}`:"."}`);
  }
}

async function checkSyntax(){
  const files=(await walk(ROOT)).filter(file=>/\.(?:js|mjs)$/.test(file));
  for(const file of files){
    run(process.execPath,["--check",file]);
  }
  return files.length;
}

async function checkReleaseMetadata(){
  const [versionModule,packageJson,updateJson,serviceWorker]=await Promise.all([
    readFile(path.join(ROOT,"src/app/version.js"),"utf8"),
    readFile(path.join(ROOT,"package.json"),"utf8"),
    readFile(path.join(ROOT,"update.json"),"utf8"),
    readFile(path.join(ROOT,"sw.js"),"utf8")
  ]);
  const result=validateReleaseMetadata({versionModule,packageJson,updateJson,serviceWorker});
  if(!result.ok)fail(result.errors.join("\n"));
  return result;
}

async function checkRequiredFiles(){
  const required=[
    "index.html","manifest.webmanifest","sw.js","update.json","package.json",
    "src/app/app.js","src/app/state.js","src/app/version.js",
    "src/storage/db.js","src/learning/session-engine.js",
    "src/ui/screens/today.js","src/ui/screens/practice.js","src/ui/screens/settings.js"
  ];
  const missing=[];
  for(const relative of required){
    try{
      const info=await stat(path.join(ROOT,relative));
      if(!info.isFile())missing.push(relative);
    }catch{
      missing.push(relative);
    }
  }
  if(missing.length)fail(`Required release files missing:\n${missing.join("\n")}`);
  return required.length;
}

export async function runReleaseGate(){
  const metadata=await checkReleaseMetadata();
  const requiredCount=await checkRequiredFiles();
  const syntaxCount=await checkSyntax();

  run(process.execPath,["--test"]);

  return {
    version:metadata.app.version,
    phase:metadata.app.phase,
    cache:metadata.cache,
    requiredCount,
    syntaxCount
  };
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  runReleaseGate()
    .then(result=>{
      console.log(`Release gate passed for ${result.version}`);
      console.log(`Phase: ${result.phase}`);
      console.log(`Service Worker: ${result.cache}`);
      console.log(`Required files: ${result.requiredCount}`);
      console.log(`Syntax checked: ${result.syntaxCount} JS/MJS files`);
      console.log("Tests: passed");
    })
    .catch(error=>{
      console.error("Release gate failed:");
      console.error(error?.message??error);
      process.exitCode=1;
    });
}
