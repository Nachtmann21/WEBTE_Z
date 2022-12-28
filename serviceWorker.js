const staticCache = "dev-minesweeper-site-v1"
const assets = [
  "/",
  "index.html",
  "/css/style.css",
  "/js/script.js",
  "/js/easy.json",
  "/js/hard.json",
  "/art/MineEx.png",
  "art/Full.png",
  "art/Empty.png"
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticCache).then(cache => {
      console.log(assets)
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