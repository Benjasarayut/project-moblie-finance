const CACHE_NAME = 'thaibank-v1';
const urlsToCache = [
  '/public/login.html',
  '/public/index.html',
  '/public/register.html',
  '/public/welcome.html',
  '/public/install.html',
  '/public/manifest.json',
  '/src/css/style.css',
  '/src/js/db.js'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell');
      return cache.addAll(urlsToCache).catch(() => {
        console.log('Cache addAll failed (offline install), proceeding anyway');
      });
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        }
        return response;
      })
      .catch(() => {
        // Return from cache if network fails
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          return new Response('Offline - Content not available', { status: 503 });
        });
      })
  );
});

// PWA installation prompt
self.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  console.log('beforeinstallprompt event fired');
});

console.log('Service Worker loaded');
