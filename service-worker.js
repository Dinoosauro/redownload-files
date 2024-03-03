const cacheName = 'redownloadfiles-cache';
const filestoCache = [
    './',
    './index.html',
    'https://dinoosauro.github.io/StreamSaver.js/mitm.html?version=2.0.0',
    'https://dinoosauro.github.io/StreamSaver.js/mitm.html',
    'https://dinoosauro.github.io/StreamSaver.js/sw.js'
];
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(filestoCache))
    );
});
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.url.indexOf("updatecode") !== -1) return fetch(req); else event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
    try {
        const networkResponse = await fetch(req);
        const cache = await caches.open('redownloadfiles-cache');
        await cache.delete(req);
        await cache.put(req, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(req);
        return cachedResponse;
    }
}