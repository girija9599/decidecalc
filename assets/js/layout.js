/* ============================================================
   DecideCalc — Shared layout (header, footer, nav)
   Injected on every page for consistency. Header/footer defined
   once here; each page calls DC.renderLayout().
   ============================================================ */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};

  DC.icon = function (name) {
    const I = {
      calc: '<path d="M5 4h4v4H5zM15 4h4v4h-4zM5 14h4v4H5zM15 14h4v4h-4zM9 7h6M9 15h6M7 9v6M17 9v6"/>',
      money: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.5a2.5 2 0 00-2.5-2 2.5 2 0 00-2.5 2c0 1.2 1 1.7 2.5 2s2.5.8 2.5 2a2.5 2 0 01-2.5 2 2.5 2 0 01-2.5-2M12 6v1M12 17v1"/>',
      briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 12h18"/>',
      heart: '<path d="M12 21s-7-4.5-9.5-9A5 5 0 0112 6a5 5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z"/>',
      cake: '<path d="M4 21h16v-7a4 4 0 00-4-4H8a4 4 0 00-4 4v7zM4 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M12 6V3M12 3l-.5 1M12 3l.5 1"/>',
      scale: '<path d="M12 3v18M5 8h14M5 8l-3 6h6zM19 8l-3 6h6zM7 21h10"/>',
      lightning: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>',
      trending: '<path d="M3 17l6-6 4 4 7-7M14 8h6v6"/>',
      bolt2: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>',
      sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"/>',
      moon: '<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6L4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4"/>',
      check: '<path d="M20 6L9 17l-5-5"/>',
      x: '<path d="M18 6L6 18M6 6l12 12"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 5a3.5 3.5 0 010 7M17 20a6.5 6.5 0 00-3-5.5"/>',
      star: '<path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18l-5.9 3 1.2-6.5L2.5 9.9 9.1 9z"/>',
      rocket: '<path d="M12 2c4 2 6 6 6 10l-3 3H9l-3-3c0-4 2-8 6-10zM12 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM9 18l-2 3M15 18l2 3"/>',
      graduation: '<path d="M12 4L2 9l10 5 10-5-10-5zM6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5M22 9v5"/>',
      home: '<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z"/>',
      bank: '<path d="M3 10l9-6 9 6M4 10h16M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18"/>',
      percent: '<path d="M19 5L5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
      baby: '<circle cx="12" cy="6" r="2.5"/><path d="M6 21c0-3 2.5-6 6-6s6 3 6 6M9 11l-1.5 1.5M15 11l1.5 1.5"/>',
      ring: '<path d="M12 8a5 5 0 100 10 5 5 0 000-10zM12 8V4M9 4l3-2 3 2"/>',
      whisper: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
      flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3"/>',
      copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/>',
      share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
      whatsapp: '<path d="M3 21l1.8-5.2A8 8 0 1112 20a8 8 0 01-4-1L3 21zM9 9c0 3 3 6 6 6l1.5-1.5-2-1-1 .5c-1-.5-2-1.5-2.5-2.5l.5-1-1-2L9 9z"/>',
      download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
      print: '<path d="M6 9V3h12v6M6 18H4a1 1 0 01-1-1v-6a2 2 0 012-2h14a2 2 0 012 2v6a1 1 0 01-1 1h-2M6 14h12v7H6z"/>',
      refresh: '<path d="M21 12a9 9 0 11-3-6.7M21 4v4h-4"/>',
      chart: '<path d="M3 3v18h18M8 14v3M13 10v7M18 6v11"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
      lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
      globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z"/>',
      zap: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>',
      target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
      compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/>',
      pie: '<path d="M12 3v9h9a9 9 0 10-9-9z"/>',
      layers: '<path d="M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
      piggy: '<path d="M4 12a6 6 0 016-6h4a6 6 0 016 6v2a4 4 0 01-4 4l-1 2h-2l-1-2H9l-1 2H6v-4a6 6 0 01-2-4zM16 9a1 1 0 100 2 1 1 0 000-2z"/>',
      rupee: '<path d="M7 4h10M7 8h10M14 4c2 0 3.5 1.5 3.5 3.5S16 11 14 11H7l8 9"/>',
      code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
      calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
      portal: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>'
    };
    const p = I[name] || I.sparkle;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  };

  DC.renderLayout = function (opts) {
    opts = opts || {};
    const here = (window.location.pathname.split('/').pop() || './');
    const inCalc = window.location.pathname.indexOf('/calculators/') !== -1;
    const inBlog = window.location.pathname.indexOf('/blog/') !== -1;
    const nav = [
      { href: '/', label: 'Home', key: 'home' },
      { href: '/categories', label: 'Categories', key: 'categories' },
      { href: '/tools', label: 'All Tools', key: 'tools' },
      { href: '/blog', label: 'Blog', key: 'blog' },
      { href: '/how-it-works', label: 'How It Works', key: 'how' }
    ];
    const norm = p => (p || '/').replace(/\/+$|^$/, '') || '/';
    const cur = norm(window.location.pathname);
    const navHTML = nav.map(function (n) {
      const isActive = norm(n.href) === cur;
      return '<a href="' + n.href + '"' + (isActive ? ' aria-current="page"' : '') + '>' + n.label + '</a>';
    }).join('');

    const header =
      '<header class="site-header">' +
        '<div class="container nav">' +
          '<a class="brand" href="' + (DC.base || '/') + '" aria-label="DecideCalc home">' +
            '<span class="brand-mark"><img src="' + DC.base + 'assets/img/favicon-48x48.png" width="36" height="36" alt="" aria-hidden="true"></span>' +
            '<span class="brand-copy"><span class="brand-name">Decide<span>Calc</span></span><small>Calculate Before You Decide</small></span>' +
          '</a>' +
          '<nav class="nav-links">' + navHTML + '</nav>' +
          '<div class="nav-actions">' +
            '<a href="/tools" class="btn btn-primary btn-sm">Explore Tools <span aria-hidden="true">→</span></a>' +
            '<button class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="mobileNav">' +
              '<span></span><span></span><span></span>' +
            '</button>' +
            '<button class="theme-toggle" aria-label="Toggle dark mode">' +
              '<span class="sun">' + DC.icon('sun') + '</span>' +
              '<span class="moon">' + DC.icon('moon') + '</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</header>' +
      // Mobile drawer + backdrop live OUTSIDE the sticky header. A fixed
      // element inside a position:sticky + backdrop-filter header is
      // trapped by that containing block and never paints correctly.
      '<div class="mobile-nav" id="mobileNav" aria-hidden="true">' +
        '<div class="container mobile-nav-inner">' + navHTML +
          '<a href="' + DC.base + 'tools" class="btn btn-primary mobile-nav-cta">Explore all tools <span aria-hidden="true">→</span></a>' +
        '</div>' +
      '</div>' +
      '<div class="nav-backdrop" aria-hidden="true"></div>';

    const year = new Date().getFullYear();
    const footer =
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="footer-grid">' +
            '<div class="footer-brand">' +
              '<a class="brand footer-logo" href="' + (DC.base || '/') + '" aria-label="DecideCalc home">' +
                '<span class="brand-mark"><img src="' + DC.base + 'assets/img/favicon-48x48.png" width="40" height="40" alt="" aria-hidden="true"></span>' +
                '<span class="brand-copy"><span class="brand-name">Decide<span>Calc</span></span><small>Calculate Before You Decide</small></span>' +
              '</a>' +
              '<p style="color:rgba(255,255,255,.72);max-width:300px">DecideCalc is a free, no-login, India-first platform of practical life-decision calculators. Every listed tool works — instant results, real recommendations.</p>' +
            '</div>' +
            '<div><h4>Categories</h4>' +
              '<a href="' + DC.base + 'categories/finance">Finance & Tax</a>' +
              '<a href="' + DC.base + 'categories/career">Career & Salary</a>' +
              '<a href="' + DC.base + 'categories/health">Health & Lifestyle</a>' +
              '<a href="' + DC.base + 'categories/life">Life Planning</a>' +
              '<a href="' + DC.base + 'categories/business">Business Tools</a>' +
              '<a href="' + DC.base + 'categories/datetime">Date & Time</a>' +
              '<a href="' + DC.base + 'categories/converter">Unit & Currency</a>' +
              '<a href="' + DC.base + 'categories/text">Text Tools</a>' +
              '<a href="' + DC.base + 'categories/dev">Developer Tools</a>' +
              '<a href="' + DC.base + 'categories/utility">Utility Tools</a>' +
              '<a href="' + DC.base + 'categories/education">Education Tools</a>' +
              '<a href="' + DC.base + 'categories/unique">Decision Tools</a>' +
            '</div>' +
            '<div><h4>Popular Tools</h4>' +
              '<a href="' + DC.base + 'calculators/emi-calculator">EMI Calculator</a>' +
              '<a href="' + DC.base + 'calculators/sip-calculator">SIP Returns</a>' +
              '<a href="' + DC.base + 'calculators/income-tax-calculator">Income Tax</a>' +
              '<a href="' + DC.base + 'calculators/retirement-calculator">Retirement</a>' +
              '<a href="' + DC.base + 'calculators/life-decision-scorer">Life Decision Scorer</a>' +
              '<a href="' + DC.base + 'calculators/gst-calculator">GST Calculator</a>' +
            '</div>' +
            '<div><h4>Company</h4>' +
              '<a href="' + DC.base + 'blog/">Blog</a>' +
              '<a href="' + DC.base + 'about">About Us</a>' +
              '<a href="' + DC.base + 'privacy">Privacy Policy</a>' +
              '<a href="' + DC.base + 'terms">Terms of Use</a>' +
              '<a href="' + DC.base + 'contact">Contact</a>' +
            '</div>' +
          '</div>' +
          '<div class="footer-bottom">' +
            '<span>© <span id="dcYear">' + year + '</span> DecideCalc</span>' +
          '</div>' +
        '</div>' +
      '</footer>';

    // Inject header at top of body
    document.body.insertAdjacentHTML('afterbegin', header);
    document.body.insertAdjacentHTML('beforeend', footer);
    // Keep year current even if user keeps a tab open over new year
    setInterval(function () {
      const el = document.getElementById('dcYear');
      if (el) el.textContent = new Date().getFullYear();
    }, 60 * 60 * 1000);
    // Initialize ad slots once they are in the DOM
    setTimeout(function () { if (DC.initAds) DC.initAds(); }, 0);
  };

  // base path: always site root. Using an absolute '/' here prevents the
  // class of bugs caused by cleanUrls:true + trailingSlash:false where '/blog'
  // and '/blog/' resolve the same HTML but the browser's relative-path base
  // differs (leading to 404s on nested pages for scripts/styles/nav links).
  DC.base = '/';
})();
