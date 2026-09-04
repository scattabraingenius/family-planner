const CACHE_NAME = "family-planner-shell-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/favicon-32.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if(request.method !== "GET") return;

  const url = new URL(request.url);

  /* Firebase, Google Sign-In, Maps and every other cross-origin request always go straight to
     the network. Authentication and changing/private data never enter this cache. */
  if(url.origin !== self.location.origin) return;

  if(request.mode === "navigate"){
    /* Network-first keeps normal deployments fresh. The cached shell is used only when offline. */
    event.respondWith(
      fetch(request).then(response => {
        if(response && response.ok){
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
        }
        return response;
      }).catch(() => caches.match("./index.html").then(response => response || caches.match("./")))
    );
    return;
  }

  /* Cache only same-origin static resources. Unrecognized requests retain normal browser
     behavior, while guide images and PWA assets become available after their first successful use. */
  if(["style", "script", "image", "font", "manifest"].includes(request.destination)){
    event.respondWith(
      caches.match(request).then(cached => {
        const refreshed = fetch(request).then(response => {
          if(response && response.ok){
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached);
        return cached || refreshed;
      })
    );
  }
});
