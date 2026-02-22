// Service Worker for Money Printer PWA
var CACHE='mp-v2';

self.addEventListener('install',function(e){
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',function(e){
  e.waitUntil(self.clients.claim());
});

// Handle notification click - open/focus the app
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cl){
      for(var i=0;i<cl.length;i++){
        if(cl[i].url.includes('index.html')&&'focus' in cl[i])return cl[i].focus();
      }
      if(clients.openWindow)return clients.openWindow('./index.html');
    })
  );
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
