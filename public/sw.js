/* Only the app shell and its static assets are cached. Network results are never cached. */
const CACHE='network-toolbox-app-v1';
const BASE=['/offline-assets.json','/manifest.webmanifest','/favicon.svg','/icons/app-192.png','/icons/app-512.png','/icons/app-maskable-512.png','/icons/apple-touch-icon.png'];
const isAsset=url=>url.origin===self.location.origin&&(url.pathname.startsWith('/_next/static/')||BASE.includes(url.pathname));
async function cacheAsset(cache,path){try{const response=await fetch(path,{credentials:'same-origin',cache:'reload'});if(response.ok&&!response.redirected){await cache.put(path,response);return true}return false}catch{return false;}}
async function cacheBundle(cache){try{const r=await fetch('/offline-assets.json',{credentials:'same-origin',cache:'reload'});if(!r.ok||r.redirected)return false;const data=await r.json();if(!Array.isArray(data.assets)||!data.assets.length)return false;const paths=data.assets.filter(path=>typeof path==='string'&&path.startsWith('/_next/static/')&&!path.includes('..')).slice(0,120);return (await Promise.all(paths.map(path=>cacheAsset(cache,path)))).every(Boolean)}catch{return false}}
async function saveShell(cache,response){if(!response.ok||response.redirected||!response.headers.get('content-type')?.includes('text/html'))return;const url=new URL(response.url);if(url.origin!==self.location.origin||url.pathname!=='/')return;
 const html=await response.clone().text();if(!html.includes('Network Toolbox')||!html.includes('application-name'))return;
 if(!(await cacheBundle(cache)))return;
 await cache.put('/',response.clone());
 const paths=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>new URL(m[1].replace(/&amp;/g,'&'),self.location.origin)).filter(isAsset).map(u=>u.href);
 await Promise.all([...new Set(paths)].slice(0,80).map(path=>cacheAsset(cache,path)));
}
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await Promise.all(BASE.map(path=>cacheAsset(cache,path)));try{const shell=await fetch('/',{credentials:'same-origin',cache:'reload'});await saveShell(cache,shell)}catch{}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(key=>key.startsWith('network-toolbox-app-')&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 const {request}=event;const url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/signin')||url.pathname.startsWith('/signout')||url.pathname.startsWith('/callback'))return;
 if(request.mode==='navigate'&&url.pathname==='/'){event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request);event.waitUntil(saveShell(cache,response.clone()));return response}catch{const saved=await cache.match('/');if(saved)return saved;return new Response('<!doctype html><html lang="fr"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Network Toolbox</title><body style="font:16px system-ui;padding:24px;line-height:1.6"><h1>Connexion nécessaire</h1><p>Ouvre Network Toolbox une première fois avec Internet pour préparer son accès hors ligne.</p><button onclick="location.reload()">Réessayer</button></body></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}})}})());return;}
 if(isAsset(url)){event.respondWith((async()=>{const cache=await caches.open(CACHE);const saved=await cache.match(request);if(saved)return saved;const response=await fetch(request);if(response.ok&&!response.redirected){await cache.put(request,response.clone());const keys=await cache.keys();if(keys.length>160){for(const key of keys.filter(k=>new URL(k.url).pathname.startsWith('/_next/static/')).slice(0,keys.length-160))await cache.delete(key)}}return response})());}
});
