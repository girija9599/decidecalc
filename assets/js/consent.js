/* ============================================================
   DecideCalc — cookie notice banner
   Lightweight informational notice. Stores dismissal in
   localStorage under 'dc_consent'. No third-party CMP required
   while advertising is not yet live.
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'dc_consent';
  function hasConsent() {
    try { return !!localStorage.getItem(KEY); } catch (e) { return true; }
  }
  function dismiss(banner) {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
  }
  function show() {
    if (hasConsent()) return;
    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie notice');
    banner.innerHTML =
      '<div class="cookie-banner-inner">' +
        '<p class="cookie-text">DecideCalc uses cookies for site preferences and analytics. See our ' +
        '<a href="/cookie-policy">Cookie Policy</a> and <a href="/privacy">Privacy Policy</a>.</p>' +
        '<button type="button" class="btn btn-primary cookie-ok" aria-label="Accept cookies">OK</button>' +
      '</div>';
    document.body.appendChild(banner);
    banner.querySelector('.cookie-ok').addEventListener('click', function () {
      dismiss(banner);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show);
  } else {
    show();
  }
})();
