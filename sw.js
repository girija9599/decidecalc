// DecideCalc Service Worker — PWA offline support
const CACHE = 'decidecalc-v6';
const ASSETS = [
  '/',
  '/index.html',
  '/blog/index.html',
  '/blog/blog.css',
  '/blog/emi-vs-sip-which-is-better-india.html',
  '/blog/how-much-health-insurance-need-india.html',
  '/blog/rent-or-buy-house-2026-india.html',
  '/calculators/emi-calculator.html',
  '/calculators/sip-calculator.html',
  '/calculators/income-tax-calculator.html',
  '/calculators/rent-vs-buy.html',
  '/calculators/loan-vs-investment.html',
  '/calculators/retirement-calculator.html',
  '/calculators/fd-vs-mutual-fund.html',
  '/calculators/home-loan-eligibility.html',
  '/calculators/ppf-calculator.html',
  '/calculators/gratuity-calculator.html',
  '/calculators/job-switch-decision.html',
  '/calculators/salary-hike-negotiator.html',
  '/calculators/career-switch-roi.html',
  '/calculators/bmi-calculator.html',
  '/calculators/real-age-calculator.html',
  '/calculators/health-insurance-need.html',
  '/calculators/pregnancy-due-date.html',
  '/calculators/wedding-budget-planner.html',
  '/calculators/baby-cost-calculator.html',
  '/calculators/gst-calculator.html',
  '/calculators/fuel-cost-calculator.html',
  '/calculators/life-decision-scorer.html',
  '/assets/css/main.css',
  '/assets/js/core.js',
  '/assets/js/layout.js',
  '/assets/js/tools.js',
  '/assets/js/calc-page.js',
  '/assets/js/ads.js',
  '/assets/img/decidecalc-mark.svg',
  '/assets/img/icon-192.svg',
  '/assets/img/icon-512.svg',
  '/manifest.json'
];

// Install — cache all static assets
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS).then(() => self.skipWaiting())));
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))).then(() => self.clients.claim())));
});

// Fetch — cache-first for static, network-first for CDN
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => {
    if (cached) return cached;
    return fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    });
  }));
});
