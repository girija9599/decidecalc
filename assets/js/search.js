/* ============================================================
   DecideCalc — Global site search
   Stateless: scans the live page DOM for [data-search] elements
   (blog-card, tool-card, cat-card, mini-card, nav links).
   Opens a full-screen overlay; hides on Escape or backdrop click.
   ============================================================ */
(function () {
  'use strict';
  var panel, input, results, toggle;

  function init () {
    panel   = document.getElementById('globalSearch');
    input   = document.getElementById('globalSearchInput');
    results = document.getElementById('globalSearchResults');
    toggle  = document.getElementById('searchToggle');
    if (!panel || !input || !toggle) return;

    toggle.addEventListener('click', function () { openSearch(); });
    input.addEventListener('input', debounce(onSearch, 120));
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSearch();
    });
    var escKey = panel.querySelector('.global-search-box kbd');
    if (escKey) escKey.addEventListener('click', function () { closeSearch(); });
    panel.addEventListener('click', function (e) {
      if (e.target === panel) closeSearch();
    });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closeSearch();
    });

    // Soft-load if user landed on /search querystring (optional future use)
    var q = new URLSearchParams(window.location.search).get('q');
    if (q) setTimeout(function () { openSearch(); input.value = q; onSearch(); }, 200);
  }

  function openSearch () {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    setTimeout(function () { input.focus(); }, 80);
    document.body.style.overflow = 'hidden';
  }

  function closeSearch () {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    input.value = '';
    results.innerHTML = '';
    document.body.style.overflow = '';
  }

  function onSearch () {
    var q = input.value.trim().toLowerCase();
    if (!q) { results.innerHTML = ''; return; }
    var hits = collectHits(q);
    if (!hits.length) {
      results.innerHTML = '<div class="search-empty">No results for "' + escHTML(q) + '"</div>';
      return;
    }
    results.innerHTML = hits.slice(0, 20).map(function (h) {
      var iconSVG = (h.icon || '\n            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>\n          ');
      return '<a class="search-result" href="' + escHTML(h.href) + (h.samePage ? '' : '') + '">' +
        '<span class="sr-icon">' + iconSVG + '</span>' +
        '<span class="sr-body">' +
          '<span class="sr-title">' + escHTML(h.title) + '</span>' +
          '<span class="sr-meta">' + escHTML(h.typeLabel) + (h.cat ? ' \u00B7 ' + escHTML(h.cat) : '') + '</span>' +
        '</span>' +
      '</a>';
    }).join('');
  }

  function collectHits (q) {
    var seen = {};
    var out = [];

    function add (item) {
      var k = item.href;
      if (seen[k]) return;
      seen[k] = true;
      out.push(item);
    }

    // 1. [data-search] cards (blog-card, tool-card, cat-card, mini-card, nav links)
    var nodes = document.querySelectorAll('[data-search]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var text = (el.getAttribute('data-search') || '').toLowerCase();
      if (text.indexOf(q) === -1) continue;
      var href  = el.getAttribute('href') || '';
      if (!href) continue;
      var titleEl = el.querySelector('h2, h3, h4');
      var title = titleEl ? cleanTitle(titleEl.textContent) : cleanTitle(el.textContent.trim().slice(0, 80));
      var typeLabel = 'Page';
      var cat = '';
      var icon = '';
      if (el.classList.contains('blog-card'))  { typeLabel = 'Blog guide'; icon = (typeof DC !== 'undefined' && DC.icon) ? DC.icon('trending') : ''; }
      else if (el.classList.contains('tool-card') || el.classList.contains('tool-ic')) { typeLabel = 'Calculator'; icon = (el.querySelector('.tool-ic') || {}).innerHTML || ''; }
      else if (el.classList.contains('cat-card'))  { typeLabel = 'Category'; icon = (el.querySelector('.cat-icon') || {}).innerHTML || ''; }
      else if (el.classList.contains('mini-card')) { typeLabel = 'Tool'; icon = (el.querySelector('.mic') || {}).innerHTML || ''; }
      if (el.style && el.style.getPropertyValue) cat = el.style.getPropertyValue('--cat-color').trim() || '';
      add({ href: href, title: title || href.replace(/\.html$/, '').split('/').pop(), typeLabel: typeLabel, cat: cat, icon: icon, samePage: false });
    }

    // 2. Fallback: plain <a> elements with meaningful text (nav, footer, etc.)
    if (out.length < 3) {
      var links = document.querySelectorAll('a[href]');
      for (var j = 0; j < links.length; j++) {
        var a = links[j];
        // Prefer a heading inside the link over full textContent (avoids "titlecategory" concatenation)
        var aTitleEl = a.querySelector('h2, h3, h4');
        var aTitle = aTitleEl ? cleanTitle(aTitleEl.textContent) : cleanTitle(a.textContent || '');
        if (!aTitle) continue;
        var aText = aTitle.toLowerCase();
        if (aText.length < 3) continue;
        if (aText.indexOf(q) === -1) continue;
        var h = a.getAttribute('href') || '';
        if (!h || h === '#' || h.indexOf('javascript:') === 0) continue;
        add({ href: h, title: aTitle, typeLabel: 'Link', cat: '', icon: '', samePage: false });
      }
    }

    return out;
  }

  function debounce (fn, ms) {
    var t; return function () { var c = this, a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }

  function escHTML (s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[m];
    });
  }

  function cleanTitle (s) {
    // Remove repeated adjacent words (e.g. "LinkLink" → "Link"), collapse whitespace
    var t = String(s).replace(/([\w])\1{2,}/g, '$1').replace(/\s+/g, ' ').trim();
    // If title is just noise words, return empty so caller can fall back
    if (t.toLowerCase() === 'link' || t.toLowerCase() === 'link link') return '';
    return t;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();