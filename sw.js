const CACHE='ika-kaiyo-v1';
const SHELL=[
  'home_map.html','takozaki_tide.html','manifest.json','icon.svg',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{mode:'no-cors'})).map(r=>r)).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const url=e.request.url;
  // 予報・警報・地図タイルは常にネット優先（最新を取る）→ 失敗時はアプリ側localStorageが対応
  if(/open-meteo|jma\.go\.jp|tile\.openstreetmap/.test(url)) return;
  // アプリ本体・CDNはキャッシュ優先（オフライン起動）
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    const cp=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{}); return resp;
  }).catch(()=>caches.match('home_map.html'))));
});
