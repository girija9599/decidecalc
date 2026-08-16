/* DecideCalc — Vercel Web Analytics injector (idempotent).
   Loaded via <script defer src=".../vercel-analytics.js"></script> in every page <head>.
   Injects Vercel's privacy-friendly, real-time traffic insights.
   https://vercel.com/docs/analytics/quickstart */
(function () {
  'use strict';
  
  if (window.__dcVercelAnalyticsLoaded) return; // already injected by this module
  window.__dcVercelAnalyticsLoaded = true;

  // Check if already present on the page
  var existing = document.querySelector('script[src*="vercel-insights.com"]');
  if (existing) return;

  // Inject the Vercel Web Analytics script
  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://cdn.vercel-insights.com/v1/script.js';
  document.head.appendChild(s);
})();
