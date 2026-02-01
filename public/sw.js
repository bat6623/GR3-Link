const CACHE_NAME = 'gr3-link-v3';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './src/main.js',
    './src/camera.js',
    './src/storage.js',
    './src/ui.js',
    './manifest.json'
];

self.addEventListener('install', (e) => {
    self.skipWaiting(); // Force activation
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    // Don't cache API calls
    if (e.request.url.includes('/v1/')) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        }).then(() => self.clients.claim()) // Take control immediately
    );
});
