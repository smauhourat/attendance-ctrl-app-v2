const CACHE_NAME = 'attendance-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/js/main.chunk.js',
  '/static/js/1.chunk.js',
  '/static/js/0.chunk.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => {
//         console.log('Opened cache');
//         return cache.addAll(ASSETS_TO_CACHE);
//       })
//   );
// });

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        // Manejo individual de cada recurso
        return Promise.all(
          ASSETS_TO_CACHE.map((asset) => {
            return cache.add(asset).catch((err) => {
              console.warn(`No se pudo cachear ${asset}:`, err);
            });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {

  // Excluye las conexiones WebSocket y otras solicitudes no-GET
  if (event.request.url.startsWith('ws:') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Siempre intenta actualizar la caché en segundo plano
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Clona la respuesta porque solo se puede consumir una vez
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseToCache));
            return networkResponse;
          })
          .catch(() => {
            // Si falla la red y no hay respuesta en caché, muestra un fallback
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html'); // Crea esta página
            }
          });

        // Devuelve la respuesta en caché inmediatamente si existe
        return cachedResponse || fetchPromise;
      })
  );  

  // if (!navigator.onLine) {
  //   event.respondWith(
  //     caches.match(event.request)
  //       .then((response) => {
  //         if (response) {
  //           return response;
  //         }
  //         return fetch(event.request);
  //       })
  //   );
  // }

});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
      .then(() => self.clients.claim())
  );
});

// self.addEventListener('activate', (event) => {
//   const cacheWhitelist = [CACHE_NAME];
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheWhitelist.indexOf(cacheName) === -1) {
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
// });