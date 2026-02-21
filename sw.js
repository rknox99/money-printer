// Service Worker for Money Printer PWA
var CACHE='mp-v1';

self.addEventListener('install',function(e){
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',function(e){
  e.waitUntil(self.clients.claim());
});

// Network-first strategy: always try network, fall back to cache
self.addEventListener('fetch',function(e){
  // Don't cache Google Drive data requests
  if(e.request.url.includes('drive.google.com')){
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    fetch(e.request).then(function(r){
      // Cache successful responses for offline fallback
      if(r.ok){
        var c=r.clone();
        caches.open(CACHE).then(function(cache){cache.put(e.request,c);});
      }
      return r;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
