import {APP_VERSION,RELEASE_NOTES} from "./version.js";
import {getSetting,setSetting} from "../storage/db.js";

function parts(version){
  return String(version).split(".").map(value=>Number(value)||0);
}

export function isNewerVersion(candidate,current=APP_VERSION){
  const a=parts(candidate);
  const b=parts(current);
  for(let i=0;i<Math.max(a.length,b.length);i+=1){
    if((a[i]??0)>(b[i]??0))return true;
    if((a[i]??0)<(b[i]??0))return false;
  }
  return false;
}

export async function getReleaseNotice(){
  const seen=await getSetting("lastSeenAppVersion");
  if(seen===APP_VERSION)return null;

  return {
    kind:"installed",
    version:APP_VERSION,
    title:`Language Teacher обновлён до ${APP_VERSION}`,
    changes:RELEASE_NOTES
  };
}

export async function markCurrentVersionSeen(){
  await setSetting("lastSeenAppVersion",APP_VERSION);
}

export async function checkRemoteUpdate(){
  if(!navigator.onLine)return null;

  try{
    const response=await fetch(`./update.json?ts=${Date.now()}`,{
      cache:"no-store",
      headers:{"Accept":"application/json"}
    });
    if(!response.ok)return null;
    const data=await response.json();

    if(!data?.latestVersion||!isNewerVersion(data.latestVersion)){
      return null;
    }

    return {
      kind:"available",
      version:data.latestVersion,
      title:`Доступно обновление ${data.latestVersion}`,
      phase:data.phase??"",
      changes:Array.isArray(data.changes)?data.changes:[]
    };
  }catch(error){
    console.debug("Update check unavailable:",error);
    return null;
  }
}

export async function watchServiceWorker(onReady){
  if(!("serviceWorker" in navigator))return null;

  const registration=await navigator.serviceWorker.register("./sw.js");
  await registration.update().catch(()=>{});

  if(registration.waiting){
    onReady(registration);
  }

  registration.addEventListener("updatefound",()=>{
    const worker=registration.installing;
    if(!worker)return;

    worker.addEventListener("statechange",()=>{
      if(worker.state==="installed"&&navigator.serviceWorker.controller){
        onReady(registration);
      }
    });
  });

  return registration;
}

export function applyWaitingUpdate(registration){
  registration?.waiting?.postMessage({type:"SKIP_WAITING"});
}
