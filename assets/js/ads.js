/* ============================================================
   DecideCalc — ad readiness manager
   Ads stay entirely absent until a real publisher ID, slot IDs,
   and required consent configuration are provided. Disabled ads do
   not render visible boxes or reserve public-facing layout space.
   ============================================================ */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};

  DC.ads = {
    enabled: false,
    client: '',
    consentReady: true,
    slots: {}
  };

  let _loaderInjected = false;

  function isConfigured() {
    return !!(DC.ads.enabled && DC.ads.client && /^ca-pub-\d+$/.test(DC.ads.client));
  }

  function injectLoader() {
    if (_loaderInjected || !isConfigured()) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(DC.ads.client);
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
    _loaderInjected = true;
  }

  function renderLive(host, slotKey) {
    const cfg = DC.ads.slots[slotKey] || {};
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', DC.ads.client);
    if (cfg.slot) ins.setAttribute('data-ad-slot', cfg.slot);
    ins.setAttribute('data-ad-format', cfg.format || 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    host.appendChild(ins);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }

  DC.initAds = function () {
    document.querySelectorAll('.ad-slot').forEach(function (el) {
      if (!isConfigured()) {
        const shell = el.closest('.calc-ad-layout, .ad-module') || el;
        shell.hidden = true;
        return;
      }
      const shell = el.closest('.calc-ad-layout, .ad-module') || el;
      shell.hidden = false;
      if (!el.dataset.rendered) {
        el.innerHTML = '';
        renderLive(el, el.getAttribute('data-slot') || 'content');
        el.dataset.rendered = 'true';
      }
    });
    if (isConfigured()) injectLoader();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', DC.initAds);
  } else {
    DC.initAds();
  }
})();
