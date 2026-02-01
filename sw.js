const CACHE_NAME = 'moje-rostliny-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// Instalace service workeru
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache otevřena');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('Chyba při cachování:', err))
    );
    self.skipWaiting();
});

// Aktivace a vyčištění starých cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch - network first, pak cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Uložit do cache
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Push notifikace
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Některé rostliny potřebují zalít!',
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        vibrate: [100, 50, 100],
        data: {
            url: '/'
        },
        actions: [
            { action: 'open', title: '🌿 Otevřít aplikaci' },
            { action: 'dismiss', title: 'Zavřít' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('🌱 Moje Rostliny', options)
    );
});

// Kliknutí na notifikaci
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'dismiss') return;
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes('index.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
