const CACHE_NAME="language-teacher-shell-v5";
const APP_SHELL=[
  "./","./index.html","./manifest.webmanifest","./update.json",
  "./src/app/app.js","./src/app/router.js","./src/app/state.js","./src/app/version.js","./src/app/update-manager.js",
  "./src/language/language-catalog.js","./src/language/profile-engine.js",
  "./src/learning/models.js","./src/learning/learning-repository.js",
  "./src/learning/srs-engine.js","./src/learning/review-engine.js","./src/learning/session-engine.js",
  "./src/ui/components/app-header.js","./src/ui/components/bottom-nav.js",
  "./src/ui/components/language-onboarding.js","./src/ui/components/update-notice.js",
  "./src/ui/screens/today.js","./src/ui/screens/practice.js","./src/ui/screens/session.js",
  "./src/ui/screens/review.js","./src/ui/screens/words.js","./src/ui/screens/progress.js","./src/ui/screens/settings.js",
  "./src/ui/styles/tokens.css","./src/ui/styles/base.css","./src/ui/styles/layout.css",
  "./src/ui/styles/components.css","./src/ui/styles/responsive.css","./src/ui/styles/review.css","./src/ui/styles/session-update.css",
  "./src/storage/db.js","./src/storage/schema.js","./src/storage/migrations.js",
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
  if(event.data?.type==="SKIP_WAITING"){
    self.skipWaiting();
  }
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

  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
      if(!response||response.status!==200||response.type==="opaque")return response;
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match("./index.html")))
  );
});
