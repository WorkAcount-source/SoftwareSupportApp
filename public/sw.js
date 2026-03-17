const CACHE_NAME = "support-app-v3";
const urlsToCache = ["/", "/manifest.json"];

// Paths that must NEVER be cached (auth tokens, dynamic data)
const NO_CACHE_PATTERNS = ["/auth/", "/rest/", "/realtime/", "supabase"];

function shouldCache(url) {
  return !NO_CACHE_PATTERNS.some((p) => url.includes(p));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle http/https requests — skip chrome-extension://, etc.
  if (!event.request.url.startsWith("http")) return;

  // Never cache non-GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache safe, same-origin responses that aren't API calls
        if (
          response &&
          response.status === 200 &&
          response.type === "basic" &&
          shouldCache(event.request.url)
        ) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request);
      })
  );
});
