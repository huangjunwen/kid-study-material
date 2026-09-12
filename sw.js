/* 猪小嘻的学习资料 - Service Worker
 * 更新内容时：把 VERSION 改成新值（如 v2），部署后客户端会自动换新版并刷新 */
const VERSION = 'v5';
const CACHE = 'kidstudy-' + VERSION;

const PRECACHE = [
  './',
  'index.html',
  'gaosi/',
  'gaosi/index.html',
  'gaosi/3b/',
  'gaosi/3b/index.html',
  'gaosi/3b/ch02/',
  'gaosi/3b/ch02/index.html',
  'gaosi/3b/ch02/lesson.html',
  'gaosi/3b/ch02/ex1.html',
  'gaosi/3b/ch02/ex2.html',
  'gaosi/3b/ch02/ex3.html',
  'gaosi/3b/ch02/ex4.html',
  'gaosi/3b/ch02/ex5.html',
  'gaosi/3b/ch02/ex6.html',
  'gaosi/3b/ch02/practice.html',
  'gaosi/3b/ch02/homework.html',
  'assets/style.css',
  'assets/app.js',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/touch.png',
  'manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const accept = req.headers.get('accept') || '';
  const isNav = req.mode === 'navigate' || accept.includes('text/html');

  if (isNav) {
    // 页面：网络优先，保证有网时永远是最新内容；断网回退缓存
    e.respondWith(
      fetch(req).then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return resp;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true }).then((h) => h || caches.match('./'))
      )
    );
  } else {
    // 静态资源：缓存优先，后台静默更新（stale-while-revalidate）
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req).then((resp) => {
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return resp;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
