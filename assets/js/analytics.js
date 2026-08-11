/* DecideCalc — single Google Analytics injector (idempotent).
   Loaded via <script defer src=".../analytics.js"></script> in every page <head>.
   Benefits over pasting the inline gtag snippet 174 times: same tag, one load,
   exactly ONE registration guaranteed even if a page later gains the inline snippet. */
(function () {
  'use strict';
  var ID = 'G-7X2R2ZXN4Z';
  if (window.__dcGaLoaded) return;                // already injected by this module
  window.__dcGaLoaded = true;

  // If the page already carries an inline gtag snippet for the SAME id, do nothing.
  var html = document.documentElement.innerHTML;
  if (html.indexOf('googletagmanager.com/gtag/js?id=' + ID) !== -1) return;
  var existing = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (existing && existing.src.indexOf('id=' + ID) !== -1) return;

  // Inject the real async loader (what the inline snippet does itself).
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.insertBefore(s, document.head.firstChild);

  // Bootstrap the dataLayer + standard config before the loader arrives.
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', ID);

  // Make gtag globally callable and keep exact snippet shape.
  window.gtag = window.gtag || gtag;
})();
