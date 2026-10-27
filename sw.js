// Offline cache: the whole app is a handful of static files.
const CACHE = 'powan-v6';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'js/core.js', 'js/app.js', 'sounds/animals.js', 'sounds/sfx.js', 'sounds/bgm.js', 'voices/zundamon.js', 'voices/tsumugi.js', 'fonts/zen-maru-medium.woff2', 'fonts/zen-maru-bold.woff2', 'fonts/zen-maru-black.woff2',
  ...['peek', 'light', 'band', 'farm', 'bath', 'teeth', 'color', 'face', 'cars', 'blocks', 'feed', 'balloon', 'shadow', 'sea', 'handwash', 'dressup', 'cooking', 'doctor', 'night'].map(t => `js/toys/${t}.js`)];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
