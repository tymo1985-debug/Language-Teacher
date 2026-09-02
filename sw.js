const CACHE_NAME="language-teacher-shell-v10";
const APP_SHELL=[
  "./","./index.html","./manifest.webmanifest","./update.json",
  "./src/app/app.js","./src/app/router.js","./src/app/state.js","./src/app/version.js",
  "./src/app/update-manager.js","./src/app/release-check.js",
  "./src/language/language-catalog.js","./src/language/profile-engine.js",
  "./src/learning/models.js","./src/learning/learning-repository.js","./src/learning/mistake-engine.js",
  "./src/learning/srs-engine.js","./src/learning/review-engine.js","./src/learning/session-engine.js",
  "./src/learning/conversation-engine.js","./src/learning/real-life-engine.js",
  "./src/ai/provider.js","./src/ai/local-demo-provider.js","./src/ai/proxy-provider.js",
  "./src/ai/context-builder.js","./src/ai/response-contract.js","./src/ai/response-parser.js","./src/ai/teacher-engine.js",
  "./src/speech/speech-provider.js","./src/speech/browser-speech-provider.js","./src/speech/recorder.js",
  "./src/speech/synthesis.js","./src/speech/recognition.js","./src/speech/pronunciation.js","./src/speech/speech-manager.js",
  "./src/storage/db.js","./src/storage/schema.js","./src/storage/migrations.js","./src/storage/backup.js","./src/storage/restore.js",
  "./src/ui/components/app-header.js","./src/ui/components/bottom-nav.js","./src/ui/components/language-onboarding.js",
  "./src/ui/components/update-notice.js","./src/ui/components/operation-notice.js","./src/ui/components/voice-recorder.js",
  "./src/ui/screens/today.js","./src/ui/screens/practice.js","./src/ui/screens/session.js","./src/ui/screens/speech.js",
  "./src/ui/screens/teacher.js","./src/ui/screens/conversation.js","./src/ui/screens/real-life.js",
  "./src/ui/screens/review.js","./src/ui/screens/words.js","./src/ui/screens/progress.js","./src/ui/screens/settings.js",
  "./src/ui/styles/tokens.css","./src/ui/styles/base.css","./src/ui/styles/layout.css","./src/ui/styles/components.css",
  "./src/ui/styles/responsive.css","./src/ui/styles/review.css","./src/ui/styles/session-update.css",
  "./src/ui/styles/speech.css","./src/ui/styles/teacher.css","./src/ui/styles/conversation.css",
  "./src/ui/styles/real-life.css","./src/ui/styles/release.css",
  "./assets/icons/icon-192.png","./assets/icons/icon-512.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("message",event=>{
  if(event.data?.type==="SKIP_WAITING")self.skipWaiting();
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;

  const url=new URL(event.request.url);

  if(url.pathname.endsWith("/update.json")){
    event.respondWith(
      fetch(event.request,{cache:"no-store"})
        .catch(()=>caches.match("./update.json"))
    );
    return;
  }

  if(event.request.mode==="navigate"){
    event.respondWith(
      fetch(event.request)
        .then(response=>response)
        .catch(()=>caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>
      cached||fetch(event.request).then(response=>{
        if(!response||response.status!==200||response.type==="opaque")return response;
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        return response;
      })
    )
  );
});
