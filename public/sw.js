const CACHE_NAME = 'traumcode-v9';
const STATIC_CACHE = 'traumcode-static-v9';
const DYNAMIC_CACHE = 'traumcode-dynamic-v9';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg'
];

const STATIC_EXTENSIONS = [
  '.woff', '.woff2', '.ttf', '.otf',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !currentCaches.includes(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // API calls & external requests: network-first
  if (url.origin !== location.origin || url.pathname.startsWith('/api')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (fonts, images): cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // JS bundles (hashed): network-first to avoid stale chunk errors after deploys
  if (url.pathname.match(/\/assets\/.*\.(js|css)$/)) {
    event.respondWith(networkFirstJS(request));
    return;
  }

  // Navigation & other requests: network-first
  event.respondWith(networkFirst(request));
});

function isStaticAsset(pathname) {
  return STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

// Network-first for JS/CSS: prevents stale chunk errors after deploys
async function networkFirstJS(request) {
  try {
    const response = await fetch(request);
    const contentType = response.headers.get('content-type') || '';
    // Only cache if response is actually JS/CSS, not HTML fallback
    if (response.ok && (contentType.includes('javascript') || contentType.includes('css'))) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    // Server returned HTML instead of JS → chunk doesn't exist anymore → reload
    if (contentType.includes('text/html')) {
      // Clear all caches and reload for the client
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      return response;
    }
    return response;
  } catch (error) {
    // Offline: try cache
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}

// Cache-first: return from cache, fallback to network (and cache it)
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return offlineFallback(request);
  }
}

// Network-first: try network, fallback to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return offlineFallback(request);
  }
}

// Offline fallback
function offlineFallback(request) {
  if (request.destination === 'document') {
    return caches.match('/index.html') || new Response(
      '<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Traumcode - Offline</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0f0b1a;color:#e2e8f0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}.offline{max-width:400px}.moon{font-size:4rem;margin-bottom:1.5rem}h1{font-size:1.5rem;color:#c084fc;margin-bottom:1rem}p{color:#94a3b8;line-height:1.6}button{margin-top:1.5rem;padding:.75rem 2rem;background:#7c3aed;color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer}button:hover{background:#6d28d9}</style></head><body><div class="offline"><div class="moon">&#127769;</div><h1>Du bist offline</h1><p>Traumcode benoetigt eine Internetverbindung fuer KI-Traumdeutungen. Bitte pruefe deine Verbindung.</p><button onclick="location.reload()">Erneut versuchen</button></div></body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
}
