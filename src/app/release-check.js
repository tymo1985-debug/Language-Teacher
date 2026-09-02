import {openDatabase} from "../storage/db.js";
import {getSpeechCapabilities} from "../speech/speech-manager.js";
import {getConfiguredAIProxyEndpoint} from "../ai/proxy-config.js";
import {summarizeReleaseChecks} from "./release-check-summary.js";

async function serviceWorkerCheck(){
  if(!("serviceWorker" in navigator)){
    return {id:"service-worker",label:"Service Worker",ok:false,detail:"Не поддерживается"};
  }

  try{
    const registration=await navigator.serviceWorker.getRegistration("./");
    return {
      id:"service-worker",
      label:"Service Worker",
      ok:Boolean(registration),
      detail:registration
        ? navigator.serviceWorker.controller
          ? "Зарегистрирован и управляет приложением"
          : "Зарегистрирован; управление включится после перезапуска"
        : "Регистрация не найдена"
    };
  }catch{
    return {id:"service-worker",label:"Service Worker",ok:false,detail:"Ошибка проверки регистрации"};
  }
}

async function cacheStorageCheck(){
  if(!("caches" in globalThis)){
    return {id:"cache-storage",label:"Offline cache",ok:false,detail:"Cache Storage недоступен"};
  }
  try{
    const keys=await caches.keys();
    const appCache=keys.find(key=>key.startsWith("language-teacher-shell-v"));
    return {
      id:"cache-storage",
      label:"Offline cache",
      ok:Boolean(appCache),
      detail:appCache??"Кэш приложения ещё не создан"
    };
  }catch{
    return {id:"cache-storage",label:"Offline cache",ok:false,detail:"Не удалось проверить кэш"};
  }
}

async function storageCheck(){
  if(!navigator.storage?.estimate){
    return {id:"storage",label:"Local storage",ok:true,optional:true,detail:"Оценка объёма недоступна"};
  }
  try{
    const {usage=0,quota=0}=await navigator.storage.estimate();
    const usedMb=(usage/1024/1024).toFixed(1);
    const quotaMb=(quota/1024/1024).toFixed(0);
    return {
      id:"storage",
      label:"Local storage",
      ok:true,
      optional:true,
      detail:`${usedMb} MB использовано · ${quotaMb} MB доступно`
    };
  }catch{
    return {id:"storage",label:"Local storage",ok:true,optional:true,detail:"Оценка объёма недоступна"};
  }
}

async function manifestCheck(){
  try{
    const response=await fetch("./manifest.webmanifest",{cache:"no-store"});
    if(!response.ok)throw new Error("manifest");
    const manifest=await response.json();
    const ok=Boolean(manifest?.name&&manifest?.start_url&&manifest?.icons?.length);
    return {
      id:"manifest",
      label:"PWA manifest",
      ok,
      detail:ok?"Доступен":"Не хватает обязательных полей"
    };
  }catch{
    return {id:"manifest",label:"PWA manifest",ok:false,detail:"Не удалось загрузить manifest"};
  }
}

async function updateMetadataCheck(){
  if(!navigator.onLine){
    return {id:"update-metadata",label:"Update metadata",ok:true,optional:true,detail:"Offline · проверка пропущена"};
  }
  try{
    const response=await fetch(`./update.json?release-check=${Date.now()}`,{cache:"no-store"});
    const payload=response.ok?await response.json():null;
    return {
      id:"update-metadata",
      label:"Update metadata",
      ok:Boolean(payload?.latestVersion),
      optional:true,
      detail:payload?.latestVersion?`latest ${payload.latestVersion}`:"Недоступно"
    };
  }catch{
    return {id:"update-metadata",label:"Update metadata",ok:false,optional:true,detail:"Сеть/metadata недоступны"};
  }
}

export async function runReleaseCheck(){
  const checks=[];

  checks.push({
    id:"secure-context",
    label:"Secure context",
    ok:Boolean(globalThis.isSecureContext||location.hostname==="localhost"||location.hostname==="127.0.0.1"),
    detail:globalThis.isSecureContext?"HTTPS / secure context":"Для PWA и микрофона нужен HTTPS"
  });

  checks.push({
    id:"indexeddb",
    label:"IndexedDB",
    ok:"indexedDB" in globalThis,
    detail:"indexedDB" in globalThis?"Поддерживается":"Не поддерживается"
  });

  try{
    await openDatabase();
    checks.push({id:"database-open",label:"Local database",ok:true,detail:"Открывается и доступна"});
  }catch{
    checks.push({id:"database-open",label:"Local database",ok:false,detail:"Ошибка открытия"});
  }

  checks.push(await serviceWorkerCheck());
  checks.push(await cacheStorageCheck());
  checks.push(await manifestCheck());
  checks.push(await storageCheck());
  checks.push(await updateMetadataCheck());

  const speech=getSpeechCapabilities();
  checks.push({
    id:"recording",
    label:"Voice recording",
    ok:Boolean(speech.recording),
    optional:true,
    detail:speech.recording?"MediaRecorder доступен":"Fallback: текст"
  });
  checks.push({
    id:"speech-recognition",
    label:"SpeechRecognition",
    ok:Boolean(speech.recognition),
    optional:true,
    detail:speech.recognition?"Доступно":"Необязательно · основной speech flow работает без него"
  });

  const proxyEndpoint=getConfiguredAIProxyEndpoint();
  checks.push({
    id:"cloud-ai",
    label:"Secure cloud AI",
    ok:Boolean(proxyEndpoint),
    optional:true,
    detail:proxyEndpoint?"Backend proxy настроен":"Не подключён · Local mode остаётся рабочим"
  });

  checks.push({
    id:"network",
    label:"Network state",
    ok:true,
    optional:true,
    detail:navigator.onLine?"Online":"Offline mode"
  });

  return {
    ...summarizeReleaseChecks(checks),
    checks,
    checkedAt:new Date().toISOString()
  };
}
