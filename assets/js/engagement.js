/* ============================================================
   DecideCalc — Recently Used + Favorites (localStorage-backed)

   API:
     DC.trackVisit(slug)              — log current page's visit (once / page)
     DC.recent(n)                     — array of last n visited tools (entries have tool metadata)
     DC.toggleFavorite(slug)          — returns true if now favorited
     DC.isFavorite(slug)
     DC.favorites()                   — array of tool entries (most favored first)
     DC.favCount()                    — int
     DC.recentCount()
   Storage keys: dc_recent_v1, dc_fav_v1 (≤20 each).
   ============================================================ */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};
  const RECENT_KEY = 'dc_recent_v1';
  const FAV_KEY = 'dc_fav_v1';
  const CAP = 20;

  function readList(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; }
  }
  function writeList(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list.slice(0, CAP))); } catch (_) { /* quota */ }
  }
  function ensureShape(list) {
    return Array.isArray(list) ? list.filter(x => x && typeof x.slug === 'string') : [];
  }

  DC.trackVisit = function (slug) {
    if (!slug || !DC.tool || !DC.tool(slug)) return;
    const now = Date.now();
    const list = ensureShape(readList(RECENT_KEY)).filter(x => x.slug !== slug);
    list.unshift({ slug: slug, t: now });
    writeList(RECENT_KEY, list);
  };

  DC.recent = function (n) {
    n = n || 6;
    const list = ensureShape(readList(RECENT_KEY));
    const out = [];
    for (const item of list) {
      const t = DC.tool(item.slug);
      if (t) out.push(Object.assign({}, t, { visitedAt: item.t }));
      if (out.length >= n) break;
    }
    return out;
  };

  DC.toggleFavorite = function (slug) {
    if (!slug || !DC.tool || !DC.tool(slug)) return false;
    let list = ensureShape(readList(FAV_KEY));
    const existing = list.findIndex(x => x.slug === slug);
    let isFav;
    if (existing >= 0) {
      list.splice(existing, 1);
      isFav = false;
    } else {
      list.unshift({ slug: slug, t: Date.now() });
      isFav = true;
    }
    writeList(FAV_KEY, list);
    return isFav;
  };

  DC.isFavorite = function (slug) {
    if (!slug) return false;
    return ensureShape(readList(FAV_KEY)).some(x => x.slug === slug);
  };

  DC.favorites = function () {
    const list = ensureShape(readList(FAV_KEY));
    const out = [];
    for (const item of list) {
      const t = DC.tool(item.slug);
      if (t) out.push(Object.assign({}, t, { favoredAt: item.t }));
    }
    return out;
  };

  DC.favCount = function () { return ensureShape(readList(FAV_KEY)).length; };
  DC.recentCount = function () { return ensureShape(readList(RECENT_KEY)).filter(x => DC.tool && DC.tool(x.slug)).length; };

  // Wire every calculator page automatically: read its DC.page.slug when present.
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        if (DC.page && DC.page.slug) DC.trackVisit(DC.page.slug);
        // Inject favorite button next to the calc header if available
        const header = document.querySelector('.calc-header');
        if (header && DC.page && DC.page.slug && !document.getElementById('dcFavBtn')) {
          const slug = DC.page.slug;
          const btn = document.createElement('button');
          btn.id = 'dcFavBtn';
          btn.className = 'btn btn-ghost btn-sm';
          btn.style.cssText = 'margin-left:auto;flex-shrink:0;padding:6px 10px;font-size:.8rem;white-space:nowrap';
          btn.setAttribute('aria-label', DC.isFavorite(slug) ? 'Remove from favorites' : 'Add to favorites');
          const refresh = function () {
            const f = DC.isFavorite(slug);
            btn.innerHTML = f ? '★ In favorites' : '☆ Add to favorites';
            btn.setAttribute('aria-pressed', f ? 'true' : 'false');
          };
          btn.addEventListener('click', function () {
            const now = DC.toggleFavorite(slug);
            refresh();
            if (DC.toast) DC.toast(now ? '★ Added to favorites' : 'Removed from favorites');
          });
          refresh();
          header.appendChild(btn);
        }
      }, 50);
    });
  }
})();
