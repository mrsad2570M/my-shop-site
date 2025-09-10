const CACHE_NAME = 'preowned-sayeban-cache-v2';
// List all critical assets for the app shell to be cached.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/metadata.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/components/Header.tsx',
  '/components/Hero.tsx',
  '/components/Register.tsx',
  '/components/Services.tsx',
  '/components/Features.tsx',
  '/components/Stats.tsx',
  '/components/Testimonials.tsx',
  '/components/Contact.tsx',
  '/components/Footer.tsx',
  '/components/QuickActions.tsx',
  '/components/Notification.tsx',
  '/components/Terms.tsx',
  '/components/Icons.tsx'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET' || event.request.url.includes('formsubmit.co')) {
    // For non-GET requests, just fetch from the network.
    return;
  }

  // Cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network, then cache it
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200) {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});


self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});
