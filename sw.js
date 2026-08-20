// DecideCalc Service Worker — PWA offline support
// v57: app-shell precache stays lean (~30 core files). Calculator HTML and
// blog .webp images now cache at runtime on first visit instead of being
// force-downloaded at install — keeps first-visit mobile data burn low.
// Navigations stay network-first so freshly deployed HTML reaches users
// and crawlers immediately; offline falls back to the precached shell.
const CACHE = 'decidecalc-v57';
const ASSETS = [
  // App-shell pages (homepage + always-on navigation/legal)
  '/',
  '/index.html',
  '/about.html',
  '/privacy.html',
  '/terms.html',
  '/contact.html',
  '/cookie-policy.html',
  '/404.html',
  '/tools/index.html',
  '/categories/index.html',
  '/how-it-works/index.html',
  '/categories/finance/index.html',
  '/categories/career/index.html',
  '/categories/health/index.html',
  '/categories/life/index.html',
  '/categories/business/index.html',
  '/categories/datetime/index.html',
  '/categories/converter/index.html',
  '/categories/text/index.html',
  '/categories/dev/index.html',
  '/categories/utility/index.html',
  '/categories/education/index.html',
  '/categories/unique/index.html',
  '/blog/index.html',
  '/blog/blog.css',
  // Core runtime JS/CSS — needed on every page
  '/assets/css/main.css',
  '/assets/js/core.js',
  '/assets/js/layout.js',
  '/assets/js/tools.js',
  '/assets/js/calc-page.js',
  '/assets/js/finance-suite.js',
  '/assets/js/engagement.js',
  '/assets/js/toolkit.js',
  '/assets/js/ads.js',
  '/assets/js/consent.js',
  '/assets/js/dc-currency.js',
  // Brand icons + OG image
  '/assets/img/decidecalc-mark.svg',
  '/assets/img/decidecalc-favicon.svg',
  '/assets/img/favicon-16x16.png',
  '/assets/img/favicon-32x32.png',
  '/assets/img/favicon-48x48.png',
  '/assets/img/apple-touch-icon.png',
  '/assets/img/icon-192.png',
  '/assets/img/icon-512.png',
  '/assets/img/logo.png',
  '/assets/img/icon-192.svg',
  '/assets/img/icon-512.svg',
  '/assets/img/og.png',
  '/favicon.ico',
  '/site.webmanifest',
  '/browserconfig.xml',
];

// Install — cache all static assets
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS).then(() => self.skipWaiting())));
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))).then(() => self.clients.claim())));
});

// Fetch — static assets cache-first; HTML/navigations network-first (offline fallback)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  const isHtml = e.request.mode === 'navigate' || (e.request.headers.get('accept') || '').includes('text/html');
  if (isHtml) {
    // Network-first so freshly deployed HTML always reaches users and crawlers.
    // On success we keep a runtime copy in CACHE so revisited pages still work
    // offline (the slim install precache only carries the app shell).
    e.respondWith(fetch(e.request).then(res => {
      if (res && res.ok && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(c => c || caches.match('/index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => {
    if (cached) return cached;
    return fetch(e.request).then(res => {
      // Runtime-cache any successful same-origin GET so revisited pages
      // (and their blog .webp banners, calculator assets) stay offline-capable
      // without bloating the install-time precache.
      if (res && res.ok && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    });
  }));
});
