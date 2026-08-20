/* ============================================================
   DecideCalc — cookie notice banner
   Lightweight informational notice. Stores dismissal in
   localStorage under 'dc_consent'. No third-party CMP required
   while advertising is not yet live.
   Respects navigator.doNotTrack / window.doNotTrack: if the user
   has opted out globally the banner is not shown and we set the
   official Google Analytics opt-out hook so GA stops sending.
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'dc_consent';
  var GA_ID = 'G-7X2R2ZXN4Z';
  function hasConsent() {
    try { return !!localStorage.getItem(KEY); } catch (e) { return true; }
  }
  function dntEnabled() {
    var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    return dnt === '1' || dnt === 'yes';
  }
  // If the browser reports DoNotTrack, suppress analytics globally for this
  // session via Google's documented opt-out flag. Set before the banner shows;
  // the inline gtag snippet on each page may have already fired one page_view
  // on this load (snippetting is the historical deploy pattern), but any
  // subsequent SPA-style navigation will be silenced.
  if (dntEnabled()) {
    window['ga-disable-' + GA_ID] = true;
  }
  function dismiss(banner) {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
  }
  function show() {
    if (hasConsent()) return;
    if (dntEnabled()) return;   // user already opted out globally — don't nag.
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
