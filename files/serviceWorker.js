const staticCache = "dev-minesweeper-site-v1"
const assets = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/script.js",
  "/js/easy.json",
  "/js/hard.json"
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticCache).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})