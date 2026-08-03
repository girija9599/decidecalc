/* ============================================================
   DecideCalc — AdSense-ready ad placement manager
   ============================================================
   Single source of truth for ad slots. When `enabled` is false
   (default — no approved publisher ID yet), it renders attractive
   gradient placeholder boxes labelled "Ad" so the layout is final
   and consistent. To go live:
     1. Set enabled = true
     2. Paste your AdSense publisher ID into `client`
     3. (optional) set per-slot format/slot IDs in DC.ads.slots
   The official async loader is injected exactly once, on first init.
   ============================================================ */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};

  /* ===== Configuration — fill these in to go live ===== */
  DC.ads = {
    enabled: false,                                // flip to true when approved
    client: 'ca-pub-XXXXXXXXXXXXXXXX',            // your AdSense publisher ID
    slots: {
      'header':   { format: 'auto', slot: '' },   // 728x90 / fluid
      'content':  { format: 'auto', slot: '' },   // in-article / in-content
      'sidebar':  { format: 'vertical', slot: '' },// 160x600 / 300x600
      'midpage':  { format: 'auto', slot: '' },   // homepage mid-content
      'footer':   { format: 'auto', slot: '' }    // responsive footer
    }
  };

  let _loaderInjected = false;

  // Inject the official AdSense loader once
  function injectLoader() {
    if (_loaderInjected || !DC.ads.enabled) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + DC.ads.client;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
    _loaderInjected = true;
  }

  // Render a single real AdSense `<ins>` unit inside a host element
  function renderLive(hostEl, slotKey) {
    const cfg = DC.ads.slots[slotKey] || { format: 'auto', slot: '' };
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', DC.ads.client);
    if (cfg.slot) ins.setAttribute('data-ad-slot', cfg.slot);
    ins.setAttribute('data-ad-format', cfg.format);
    ins.setAttribute('data-full-width-responsive', 'true');
    hostEl.appendChild(ins);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }

  // Render a labelled gradient placeholder when not yet live
  function renderPlaceholder(hostEl, slotKey) {
    const labels = { header: 'Header banner · 728×90', content: 'In-content ad', sidebar: 'Sidebar · 160×600', midpage: 'Mid-content ad', footer: 'Footer banner' };
    const lbl = labels[slotKey] || 'Advertisement';
    hostEl.classList.add('is-placeholder');
    hostEl.innerHTML =
      '<div class="ad-ph-inner">' +
        '<span class="ad-ph-tag">Ad</span>' +
        '<span class="ad-ph-label">' + lbl + '</span>' +
        '<span class="ad-ph-hint">Google AdSense — paste your publisher ID in assets/js/ads.js</span>' +
      '</div>';
  }

  // Initialize every `.ad-slot` on the page.
  // Each `.ad-slot` should declare data-slot="header|content|sidebar|midpage|footer".
  DC.initAds = function () {
    const slots = document.querySelectorAll('.ad-slot');
    if (!slots.length) return;

    if (DC.ads.enabled) {
      injectLoader();
      slots.forEach(function (el) {
        const key = el.getAttribute('data-slot') || 'content';
        el.innerHTML = '';
        renderLive(el, key);
      });
    } else {
      slots.forEach(function (el) {
        const key = el.getAttribute('data-slot') || 'content';
        renderPlaceholder(el, key);
      });
    }
  };

  // Auto-init on DOMContentLoaded once core is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', DC.initAds);
  } else {
    DC.initAds();
  }
})();
