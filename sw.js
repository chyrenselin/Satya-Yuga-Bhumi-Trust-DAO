// This is the service worker file. It runs in the background, separate from the web page,
// and enables features like offline access and background synchronization.
// The name and version are used to identify the service worker and its cache.
// IMPORTANT: To trigger a service worker update and clear all old caches automatically,
// you must increment the version number in the CACHE_NAME constant.
const CACHE_NAME = 'nexus-protocol-cache-v0.1';

// ============================================================================
// Core App Shell Assets (to be pre-cached during installation)
// These are the files essential for the basic functionality of the app.
// They are downloaded and stored in the cache when the service worker is installed.
// Paths are relative to the site root (where sw.js is located).
// ============================================================================
const CORE_ASSETS_TO_CACHE = [
  // --- Root & Core HTML ---
  './', // Represents the root directory, often resolves to index.html
  'index.html',
  'bhumi-trust/bhumi-trust.html',
  'vishwadharma/vishwadharma.html',
  'vishwasamvidhan/vishwasamvidhan.html',
  'faq/faq.html',
  'how-dao-works/how-it-works.html',
  'participate/participate.html',
  
  // --- Core Manifest & Worker ---
  'manifest.json', // The web app manifest file.
  'sw.js', // The service worker file itself.

  // --- Global Image & Audio Assets ---
  'assets/images/favicon/apple-touch-icon.png',
  'assets/images/favicon/favicon-16x16.png',
  'assets/images/favicon/favicon-32x32.png',
  'assets/images/favicon/favicon.ico',
  'assets/images/favicon/android-chrome-192x192.png',
  'assets/images/favicon/android-chrome-512x512.png',
  'assets/images/glogo.png',
  'assets/images/unity.jpg',
  'assets/audio/homepage-slow-trumpet.mp3',
  'assets/audio/participate-fast-trumpet.mp3',
  'assets/audio/bhumi-piano-melody.mp3',
  'assets/audio/eternal-harmony.mp3',
  'assets/audio/vishwa-samvidhan-anthem.mp3',

  // --- Common CSS (shared across pages) ---
  'assets/css/common/google_translate_common.css',
  'assets/css/common/animations.css',

  // --- Root Page Assets (for pages in root and subdirs sharing root's assets) ---
  'assets/css/root/root.css',
  'assets/css/root/responsive.css',
  'assets/css/root/buttons.css',
  'assets/css/root/google_translate.css',
  'assets/css/root/faq.css',
  'assets/js/root/main.js',
  'assets/js/root/google-translate.js',
  'assets/js/root/faq.js',

  // --- Bhumi Trust Page Assets ---
  'assets/css/bhumi-trust/base.css',
  'assets/css/bhumi-trust/layout.css',
  'assets/css/bhumi-trust/typography.css',
  'assets/css/bhumi-trust/sections.css',
  'assets/css/bhumi-trust/buttons.css',
  'assets/css/bhumi-trust/cards.css',
  'assets/css/bhumi-trust/pledge.css',
  'assets/css/bhumi-trust/responsive.css',
  'assets/css/bhumi-trust/google_translate.css',
  'assets/js/bhumi-trust/main.js',
  'assets/js/bhumi-trust/google-translate.js',

  // --- Vishwa Dharma Page Assets ---
  'assets/css/vishwadharma/base.css',
  'assets/css/vishwadharma/typography.css',
  'assets/css/vishwadharma/header.css',
  'assets/css/vishwadharma/hero.css',
  'assets/css/vishwadharma/buttons.css',
  'assets/css/vishwadharma/chapters.css',
  'assets/css/vishwadharma/tables.css',
  'assets/css/vishwadharma/footer.css',
  'assets/css/vishwadharma/responsive.css',
  'assets/css/vishwadharma/google_translate.css',
  'assets/css/vishwadharma/about.css',
  'assets/css/vishwadharma/helpers.css',
  'assets/js/vishwadharma/google-translate.js',
  'assets/js/vishwadharma/chapters.js',
  'assets/js/vishwadharma/main.js',

  // --- Vishwa Samvidhan Page Assets ---
  'assets/css/vishwasamvidhan/base.css',
  'assets/css/vishwasamvidhan/typography.css',
  'assets/css/vishwasamvidhan/header.css',
  'assets/css/vishwasamvidhan/navigation.css',
  'assets/css/vishwasamvidhan/buttons.css',
  'assets/css/vishwasamvidhan/sections.css',
  'assets/css/vishwasamvidhan/pillars.css',
  'assets/css/vishwasamvidhan/articles.css',
  'assets/css/vishwasamvidhan/footer.css',
  'assets/css/vishwasamvidhan/responsive.css',
  'assets/css/vishwasamvidhan/google_translate.css',
  'assets/css/vishwasamvidhan/print.css',
  'assets/css/vishwasamvidhan/logo.css',
  'assets/css/vishwasamvidhan/helpers.css',
  'assets/js/vishwasamvidhan/main.js',
  'assets/js/vishwasamvidhan/navigation.js',
  'assets/js/vishwasamvidhan/google-translate.js',
  'assets/js/vishwasamvidhan/archive.js',
  'assets/js/vishwasamvidhan/print.js',
  'assets/js/vishwasamvidhan/accessibility.js',
  
  // --- External Google Fonts (caching these can improve performance) ---
  'https://fonts.googleapis.com/css2?family=Philosopher:wght@400;700&family=Noto+Serif+Devanagari:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap',
  'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,700;1,400&family=Inter:wght@300;400;500;600&family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap'
];

// --- Critical Assets for "Network-First" Strategy ---
// These are assets that are crucial to keep up-to-date. The service worker will always
// try to fetch them from the network first before falling back to the cache.
const CRITICAL_ASSETS_FOR_NETWORK_FIRST = [
  './',
  'index.html',
  'bhumi-trust/bhumi-trust.html',
  'vishwadharma/vishwadharma.html',
  'vishwasamvidhan/vishwasamvidhan.html',
  'faq/faq.html',
  'how-dao-works/how-it-works.html',
  'participate/participate.html'
];

// Domains that should be explicitly bypassed by the Service Worker.
// Requests to these domains will go directly to the network, ignoring the service worker's fetch listener.
// This is useful for third-party services that have their own complex caching or CORS requirements.
const BYPASS_DOMAINS = [
    'translate.google.com',
    'www.gstatic.com', // Often associated with Google services like translate, analytics, reCAPTCHA etc.
    'www.google-analytics.com',
    'www.googletagmanager.com',
    'fonts.gstatic.com' // Google Fonts files themselves (the font files, not the CSS).
];

// ============================================================================
// Service Worker Lifecycle Events
// ============================================================================

/**
 * 'install' event handler.
 * This event fires when the service worker is first installed.
 * It's used here to pre-cache all the core application shell assets.
 */
self.addEventListener('install', (event) => {
  console.log(`[Nexus SW ${CACHE_NAME}] Installing. Caching app shell assets.`);
  // event.waitUntil() ensures that the service worker will not be considered installed
  // until the code inside it has successfully completed.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[Nexus SW ${CACHE_NAME}] Caching core assets:`, CORE_ASSETS_TO_CACHE);
        // We use Promise.all to handle multiple caching promises.
        // A .catch is added to each individual cache.add() promise. This allows non-critical
        // assets to fail caching without preventing the entire service worker from installing.
        return Promise.all(
          CORE_ASSETS_TO_CACHE.map(url =>
            cache.add(url).catch(err => console.warn(`[SW ${CACHE_NAME}] Failed to pre-cache '${url}':`, err))
          )
        );
      })
      .then(() => {
        console.log(`[Nexus SW ${CACHE_NAME}] Core app shell caching completed.`);
        // self.skipWaiting() forces the new service worker to become active
        // immediately, replacing any older service worker that might be waiting.
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error(`[Nexus SW ${CACHE_NAME}] App shell caching failed during install:`, error);
        // If a critical caching error occurs, throwing the error prevents the SW from installing.
        throw error;
      })
  );
});

/**
 * 'activate' event handler.
 * This event fires when the new service worker is activated (after 'install').
 * It's the perfect place to clean up old, unused caches.
 */
self.addEventListener('activate', (event) => {
  console.log(`[Nexus SW ${CACHE_NAME}] Activating new service worker.`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Promise.all ensures all old caches are deleted before the activation is complete.
      return Promise.all(
        cacheNames.map((cacheName) => {
          // It checks for any cache that has the project's prefix but doesn't match the current CACHE_NAME.
          if (cacheName !== CACHE_NAME && cacheName.startsWith('nexus-protocol-cache-')) {
            console.log(`[Nexus SW ${CACHE_NAME}] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
          // Caches that match or don't belong to this SW are kept.
          return Promise.resolve();
        })
      );
    })
    .then(() => {
        console.log(`[Nexus SW ${CACHE_NAME}] Old caches cleared. Claiming clients.`);
        // self.clients.claim() allows the newly activated service worker to take control
        // of all open pages (clients) within its scope immediately.
        return self.clients.claim();
    })
    .catch(error => {
        console.error(`[Nexus SW ${CACHE_NAME}] Error during activation (cache cleanup or clients claim):`, error);
    })
  );
});

// ============================================================================
// Fetch Event Handler - This is the core of the service worker's functionality.
// It intercepts every network request made by the application.
// ============================================================================

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // --- Strategy 1: Bypass certain requests ---
  // We ignore non-GET requests (like POST) and requests for browser extensions (e.g., chrome-extension://).
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
      return; // Let the browser handle it normally.
  }

  // We also bypass requests to third-party domains that we don't want to cache.
  if (BYPASS_DOMAINS.includes(url.hostname)) {
    event.respondWith(
        fetch(request).catch(error => {
            console.warn(`[Nexus SW ${CACHE_NAME}] Network-only fetch failed for external resource (${request.url}):`, error);
            throw error; // Propagate the error.
        })
    );
    return; // Request is handled, so we exit the listener.
  }

  // Convert the relative paths of critical assets to full URLs for accurate matching.
  const criticalAssetFullURLs = CRITICAL_ASSETS_FOR_NETWORK_FIRST.map(path => {
    return new URL(path, self.location.href).href;
  });

  // Check if the current request is for a critical asset or a navigation request (i.e., for an HTML page).
  const isCriticalAsset = criticalAssetFullURLs.includes(url.href);
  const isNavigationRequest = request.destination === 'document';

  // --- Strategy 2: Network-First, with Cache Fallback ---
  // This is used for critical assets and HTML pages to ensure the user gets the latest version if online.
  if (isCriticalAsset || isNavigationRequest) {
    console.log(`[Nexus SW ${CACHE_NAME}] Applying Network-First strategy for: ${request.url}`);
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // If the network request is successful, we update the cache with the new version.
          const shouldCacheResponse = networkResponse && networkResponse.status === 200;
          if (shouldCacheResponse) {
             const responseToCache = networkResponse.clone(); // Clone the response because it can only be read once.
             caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
             });
          }
          return networkResponse; // Return the fresh response from the network.
        })
        .catch(error => {
          // If the network fails (e.g., the user is offline), we fall back to the cache.
          console.warn(`[Nexus SW ${CACHE_NAME}] Network failed for ${request.url}. Falling back to cache.`, error);
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              console.log(`[Nexus SW ${CACHE_NAME}] Serving from cache fallback: ${request.url}`);
              return cachedResponse; // Serve the cached version.
            }
            // If the asset is not in the cache either, the request will fail.
            console.error(`[Nexus SW ${CACHE_NAME}] No cache or network for ${request.url}`);
            throw error;
          });
        })
    );
  } else {
    // --- Strategy 3: Cache-First, with Stale-While-Revalidate ---
    // This is used for all other assets (e.g., images, fonts, less critical scripts/styles).
    // It prioritizes speed and offline availability.
    console.log(`[Nexus SW ${CACHE_NAME}] Applying Cache-First strategy for: ${request.url}`);
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // If the asset is in the cache, return it immediately for a fast response.
        if (cachedResponse) {
          // In the background (without delaying the response), we fetch a fresh version from the network.
          // This is the "Stale-While-Revalidate" pattern. The user gets the old version now,
          // but the cache is updated for the next time they request it.
          fetch(request.clone()).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
               caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, networkResponse); // Overwrites the old cached entry.
               });
            }
          }).catch(err => {
            // A failed background update isn't a critical error.
            console.warn(`[Nexus SW ${CACHE_NAME}] Background network update failed for ${request.url}:`, err);
          });
          return cachedResponse; // Return the cached response immediately.
        }

        // If the asset is not in the cache, fetch it from the network.
        console.log(`[Nexus SW ${CACHE_NAME}] Not in cache. Fetching from network (Cache-First branch): ${request.url}`);
        return fetch(request.clone()).then(networkResponse => {
          // If the network fetch is successful, cache the new response for future requests.
          if (networkResponse && networkResponse.status === 200) {
             const responseToCache = networkResponse.clone();
             caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
             });
          }
          return networkResponse; // Return the network response.
        });
      })
    );
  }
});

// ============================================================================
// Communication (Optional: For messaging between the page and the service worker)
// ============================================================================
self.addEventListener('message', (event) => {
  // Handles a "SKIP_WAITING" message from the page, allowing a user to force an update.
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log(`[Nexus SW ${CACHE_NAME}:Message] Received SKIP_WAITING message. Calling self.skipWaiting().`);
    self.skipWaiting();
  } 
  // Handles a "CLEAR_ALL_CACHES" message, useful for debugging.
  else if (event.data && event.data.type === 'CLEAR_ALL_CACHES') {
    console.log(`[Nexus SW ${CACHE_NAME}:Message] Received CLEAR_ALL_CACHES message. Initiating cache clear.`);
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Only clear caches owned by this Service Worker to avoid deleting unrelated data.
            if (cacheName.startsWith('nexus-protocol-cache-')) {
              console.log(`[Nexus SW ${CACHE_NAME}:Message] Clearing cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      }).then(() => {
        console.log(`[Nexus SW ${CACHE_NAME}:Message] All relevant caches cleared.`);
        // Optionally, notify the client that the operation was successful.
        if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ type: 'CACHES_CLEARED_SUCCESS', version: CACHE_NAME });
        }
      }).catch(error => {
        console.error(`[Nexus SW ${CACHE_NAME}:Message] Error clearing caches via message:`, error);
        if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ type: 'CACHES_CLEARED_ERROR', error: error.message });
        }
      })
    );
  }
});

console.log(`[Nexus SW ${CACHE_NAME}] Service Worker script loaded and evaluated.`);
