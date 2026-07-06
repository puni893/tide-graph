const CACHE='ika-kaiyo-v2';
const SHELL=[
  'home_map.html','takozaki_tide.html','manifest.json','icon.svg',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>
    fetch(u,{mode:u.startsWith('http')?'no-cors':'same-origin'}).then(r=>c.put(u,r)).catch(()=>{})
  ))));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const url=e.request.url;
  // 予報・警報・地図タイルは常にネット直行（キャッシュしない）
  if(/open-meteo|jma\.go\.jp|tile\.openstreetmap/.test(url)) return;
  // アプリ本体・CDN：ネット優先（最新を取得）→ 成功したらキャッシュ更新 → 圏外ならキャッシュ
  e.respondWith(
    fetch(e.request).then(resp=>{
      const cp=resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});
      return resp;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('home_map.html')))
  );
});
