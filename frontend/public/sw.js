/**
 * Voice Roots: Offline-First Service Worker
 * =========================================
 * Precaches application shell, assets, and icons for offline access.
 * PRIVACY & SECURITY RULE:
 * Dynamic API endpoints (/api/*) and user audio files (/storage/*) are strictly
 * network-only and are NEVER stored in the public service worker cache.
 */

const CACHE_NAME = 'voice-roots-shell-v1.0.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/demo_sample_verified.wav',
];

// Install Event: Precache Application Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache partial error (non-fatal):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Purge Old Cache Versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Purging old cache version:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate for Shell, Network-Only for API & Storage
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Strict Security Boundary: Never cache API calls or private storage
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/storage/') ||
    event.request.method !== 'GET'
  ) {
    // Network-only for API and mutations
    return;
  }

  // 2. Application Shell & Static Assets (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to update cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {
          // offline; silent fallback to cached response
        });
        return cachedResponse;
      }

      // If not cached, fetch from network and cache successful response
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Offline Fallback for HTML Navigation
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});

