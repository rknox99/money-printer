// T23 Printer service worker -- v5 (cache name change from mp-v4
// forces every installed phone/desktop app to drop the old Penny
// shell and pick up the new T23 index.html on next open).
// Network-first for everything; cache only as offline fallback.
var CACHE = 't23-v5';

self.addEventListener('install', function (e) {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) {
          return k !== CACHE;
        }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); }));
});

// Handle notification click - open/focus the app (kept verbatim
// from the penny service worker)
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true})
      .then(function (cl) {
        for (var i = 0; i < cl.length; i++) {
          if (cl[i].url.includes('index.html') &&
              'focus' in cl[i]) return cl[i].focus();
        }
        if (clients.openWindow)
          return clients.openWindow('./index.html');
      })
  );
});

// Network-first strategy: always try network, fall back to cache
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      if (r.ok) {
        var c = r.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(e.request, c);
        }).catch(function () {});
      }
      return r;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});