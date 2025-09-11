const CACHE_NAME = 'preowned-sayeban-cache-v2';
// List all critical assets for the app shell to be cached.
const urlsToCache = [
  '/my-shop-site/',
  '/my-shop-site/index.html',
  '/my-shop-site/manifest.json',
  '/my-shop-site/metadata.json',
  '/my-shop-site/index.tsx',
  '/my-shop-site/App.tsx',
  '/my-shop-site/types.ts',
  '/my-shop-site/components/Header.tsx',
  '/my-shop-site/components/Hero.tsx',
  '/my-shop-site/components/Register.tsx',
  '/my-shop-site/components/Services.tsx',
  '/my-shop-site/components/Features.tsx',
  '/my-shop-site/components/Stats.tsx',
  '/my-shop-site/components/Testimonials.tsx',
  '/my-shop-site/components/Contact.tsx',
  '/my-shop-site/components/Footer.tsx',
  '/my-shop-site/components/QuickActions.tsx',
  '/my-shop-site/components/Notification.tsx',
  '/my-shop-site/components/Terms.tsx',
  '/my-shop-site/components/Icons.tsx'
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
