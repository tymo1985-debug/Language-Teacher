import {openDatabase} from "../storage/db.js";
import {getSpeechCapabilities} from "../speech/speech-manager.js";

export async function runReleaseCheck(){
  const checks=[];

  checks.push({
    id:"secure-context",
    label:"Secure context",
    ok:globalThis.isSecureContext||location.hostname==="localhost",
    detail:globalThis.isSecureContext?"HTTPS/secure":"Для PWA/mic нужен HTTPS"
  });

  checks.push({
    id:"service-worker",
    label:"Service Worker",
    ok:"serviceWorker" in navigator,
    detail:"serviceWorker" in navigator?"Поддерживается":"Не поддерживается"
  });

  checks.push({
    id:"indexeddb",
    label:"IndexedDB",
    ok:"indexedDB" in globalThis,
    detail:"indexedDB" in globalThis?"Поддерживается":"Не поддерживается"
  });

  try{
    await openDatabase();
    checks.push({id:"database-open",label:"Local database",ok:true,detail:"Открывается"});
  }catch{
    checks.push({id:"database-open",label:"Local database",ok:false,detail:"Ошибка открытия"});
  }

  const speech=getSpeechCapabilities();
  checks.push({
    id:"recording",
    label:"Voice recording",
    ok:Boolean(speech.recording),
    optional:true,
    detail:speech.recording?"Доступно":"Fallback: текст"
  });

  checks.push({
    id:"online",
    label:"Network state",
    ok:true,
    optional:true,
    detail:navigator.onLine?"Online":"Offline mode"
  });

  const blocking=checks.filter(check=>!check.ok&&!check.optional);

  return {
    passed:blocking.length===0,
    checks,
    checkedAt:new Date().toISOString()
  };
}
