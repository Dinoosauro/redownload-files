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
let requestRef = new Map([]);
let stream = {};
self.addEventListener("message", (msg) => {
    console.log(msg);
    let file = msg.data;
    if (file.action === "StreamConversion") { // A stream has been sent instead of a file. 
        stream = file; // Save it in the stream object.
        msgSend.postMessage({ status: "DownloadReady", newUrl: stream.url }); // Trigger the event for the download of the stream on the main thread
        return;
    }
    let newName = msg.data.file.name.replaceAll((msg.data.replace ?? ""), ""); // If the user wants to replace a part of the file name, do it now.
    let url = `${file.url}/${(file.id ?? "") !== "" ? `${file.id}/` : ""}${encodeURIComponent(newName)}`; // Create a fake URL that'll be used to download the file.
    requestRef.set(url, { file: file.file, name: newName }); // Update the requestRef map with the file and the name
    msgSend.postMessage({ newUrl: url, for: msg.data.file }) // Send to the main thread information about the new link
})
self.addEventListener('activate', e => self.clients.claim());

self.addEventListener('fetch', async (event) => {
    const req = event.request;
    if (requestRef.get(req.url) || req.url === stream.url) { // Create a fake response since a file needs to be downloaded
        let current = req.url === stream.url ? { file: { stream: () => { return stream.stream }, size: stream.size }, name: stream.name } : requestRef.get(req.url); // Create a FileLike object if a stream must be downloaded (only with the essential properties used), otherwise just find the file.
        console.log(current);
        const responseHeaders = new Headers({ // Borrowed from StreamSaver.js.
            'Content-Type': 'application/octet-stream; charset=utf-8',
            'Content-Security-Policy': "default-src 'none'",
            'X-Content-Security-Policy': "default-src 'none'",
            'X-WebKit-CSP': "default-src 'none'",
            'X-XSS-Protection': '1; mode=block',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Content-Disposition': `attachment; filename*=UTF-8'${encodeURIComponent(current.name).replace(/['()]/g, escape).replace(/\*/g, '%2A')}'`,
            'Content-Length': current.file.size
        });
        console.log(current.name);
        let res = new Response(current.file.stream(), { headers: responseHeaders }); // Create the new response with the stream
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