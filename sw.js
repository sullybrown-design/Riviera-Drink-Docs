'use strict';
var VERSION = '20261024-rp1';
var SHELL = 'riviera-shell-' + VERSION;
var PHOTOS = 'riviera-photos-' + VERSION;
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.addAll(['./', './index.html']); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) {
      if (k.indexOf('riviera-') === 0 && k !== SHELL && k !== PHOTOS) return caches.delete(k);
    }));
  }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
    e.respondWith(caches.open(SHELL).then(function (c) {
      return c.match('./index.html').then(function (hit) {
        return hit || fetch(req).then(function (res) { c.put('./index.html', res.clone()); return res; });
      });
    }));
    return;
  }
  if (url.pathname.indexOf('/assets/images/') !== -1) {
    e.respondWith(caches.open(PHOTOS).then(function (c) {
      return c.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) { c.put(req, res.clone()); return res; });
      });
    }));
  }
});
