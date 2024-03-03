const cacheName = 'redownloadfiles-cache';
const filestoCache = [
    './',
    './index.html',
    './assets/index.css',
    './assets/index.js',
    './icon.png',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/streamsaver@2.0.6/examples/zip-stream.js',
];
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(filestoCache))
    );
});
let msgSend = new BroadcastChannel("URL");
let requestRef = [];
let stream = {};
self.addEventListener("message", (msg) => {
    console.log(msg);
    let file = msg.data;
    if (file.action === "StreamConversion") {
        stream = file;
        msgSend.postMessage({ status: "DownloadReady", newUrl: stream.url });
        return;
    }
    console.log(file);
    let url = `${file.url}/${(file.id ?? "") !== "" ? `${file.id}/` : ""}${encodeURIComponent(file.file.name)}`;
    requestRef.findIndex(e => e.url === url) !== -1 ? requestRef[requestRef.findIndex(e => e.url === url)].file = file.file : requestRef.push({ url: url, file: msg.data.file });
    msgSend.postMessage({ newUrl: url, for: msg.data.file })
})
self.addEventListener('activate', e => self.clients.claim());

self.addEventListener('fetch', async (event) => {
    const req = event.request;
    console.log(requestRef.findIndex(e => e.url === req.url), requestRef, req.url);
    if (requestRef.findIndex(e => e.url === req.url) !== -1 || req.url === stream.url) {
        let current = req.url === stream.url ? { file: { stream: () => { return stream.stream }, size: stream.size, name: stream.name } } : requestRef.find(e => e.url === req.url);
        const responseHeaders = new Headers({
            'Content-Type': 'application/octet-stream; charset=utf-8',
            'Content-Security-Policy': "default-src 'none'",
            'X-Content-Security-Policy': "default-src 'none'",
            'X-WebKit-CSP': "default-src 'none'",
            'X-XSS-Protection': '1; mode=block',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Content-Disposition': `attachment; filename*=UTF-8'${encodeURIComponent(current.file.name).replace(/['()]/g, escape).replace(/\*/g, '%2A')}'`,
            'Content-Length': current.file.size
        })
        let res = new Response(current.file.stream(), { headers: responseHeaders });
        event.respondWith(res);
        return res;
    } else if (req.url.indexOf("updatecode") !== -1) return fetch(req); else event.respondWith(networkFirst(req));
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