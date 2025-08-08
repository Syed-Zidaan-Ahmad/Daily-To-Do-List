// Service Worker for To-Do List
const CACHE_NAME = "daily-todo-list-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/Daily To Do List 192.png",
  "/Daily To Do List 512.png"
];
// Install Event
self.addEventListener("install", event => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Caching app shell...");
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error("Cache install error:", err))
  );
});
// Activate Event
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log("Removing old cache:", key);
          return caches.delete(key);
        }
      }))
    ).then(() => self.clients.claim())
  );
});
// Fetch Event
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        console.log("Fetch failed. Serving from cache if available.");
      });
    })
  );
});
// End of Program