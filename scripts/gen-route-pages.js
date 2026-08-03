#!/usr/bin/env node
/* DecideCalc — generate clean-route listing pages (static, registry-driven).
   Creates:
     categories/index.html        -> /categories
     categories/<id>/index.html   -> /categories/<id>   (x12)
     tools/index.html             -> /tools
     how-it-works/index.html      -> /how-it-works
   All pages render live from DC.tools at runtime, so future registry
   additions appear automatically. Uses only classes that exist in
   assets/css/main.css (cat-card, tool-card, chip, input, card, badge). */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://decidecalc.com';

/* Category meta mirrored from assets/js/tools.js */
const CATS = [
  { id: 'finance',   name: 'Finance & Tax',      desc: 'Loans, investments, taxes, salary & savings — money decisions made simple.' },
  { id: 'career',    name: 'Career & Salary',    desc: 'Switch jobs, negotiate hikes, plan your next career move.' },
  { id: 'health',    name: 'Health & Lifestyle', desc: 'Real age, insurance needs, BMI — decide for your wellbeing.' },
  { id: 'life',      name: 'Life Planning',      desc: 'Weddings, babies, pregnancy — plan life\'s biggest moments.' },
  { id: 'business',  name: 'Business Tools',     desc: 'GST and fuel-cost tools for practical everyday planning.' },
  { id: 'unique',    name: 'Decision Tools',     desc: 'Score any life decision out of 100 — a tool found nowhere else.' },
  { id: 'datetime',  name: 'Date & Time',        desc: 'Age, business days, leap years — everyday date maths made simple.' },
  { id: 'converter', name: 'Unit & Currency',    desc: 'Length, weight, temperature, currency — accurate offline conversions.' },
  { id: 'text',      name: 'Text Tools',         desc: 'Word counter, case converter — clean, private text utilities.' },
  { id: 'dev',       name: 'Developer Tools',    desc: 'JSON formatter, Base64, and other everyday dev utilities.' },
  { id: 'utility',   name: 'Utility Tools',      desc: 'Passwords and other quick, private utilities — fully offline.' },
  { id: 'education', name: 'Education Tools',    desc: 'Percentage, CGPA, marks — student-friendly academic helpers.' }
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escQ = s => esc(s).replace(/"/g, '&quot;');

const head = ({ title, desc, canonical, base }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${escQ(desc)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escQ(title)}">
  <meta property="og:description" content="${escQ(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE}/assets/img/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="robots" content="index,follow">
  <meta name="theme-color" content="#0F1533">
  <link rel="stylesheet" href="${base}assets/css/main.css">
  <link rel="manifest" href="${base}manifest.json">
</head>`;

const scripts = base => `  <script src="${base}assets/js/core.js"></script>
  <script src="${base}assets/js/tools.js"></script>
  <script src="${base}assets/js/layout.js"></script>
  <script src="${base}assets/js/ads.js"></script>`;

/* Tool-card renderer identical to the homepage cards */
const toolCardFn = `
    function toolCard(t) {
      var cat = DC.catName(t.cat);
      return '<a class="tool-card reveal" href="%BASE%calculators/' + t.slug + '" style="--cat-color:' + cat.color + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
          '<span class="tool-ic">' + DC.icon(t.icon) + '</span>' +
          '<span class="tag" style="color:var(--success);border-color:color-mix(in srgb,var(--success) 35%,var(--border));background:color-mix(in srgb,var(--success) 10%,transparent)">● Live</span>' +
        '</div>' +
        '<h3>' + t.name + '</h3>' +
        '<p>' + t.blurb + '</p>' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:8px;font-size:.82rem;font-weight:700;color:' + cat.color + '">' +
          '<span>' + cat.name.split(' ')[0] + '</span><span>Open →</span>' +
        '</div>' +
      '</a>';
    }`;

/* ---------- 1. /categories hub ---------- */
function categoriesHub() {
  return `${head({
    title: 'All Calculator Categories — DecideCalc',
    desc: 'Browse all 12 DecideCalc categories: finance & tax, career, health, life planning, business, date & time, converters, text, developer, utility, education and decision tools.',
    canonical: SITE + '/categories', base: '../'
  })}
<body>
  <main class="container" style="padding-top:40px;padding-bottom:80px">
    <nav class="breadcrumb"><a href="../">Home</a><span class="sep">/</span><span>Categories</span></nav>
    <span class="badge reveal">12 live categories</span>
    <h1 class="reveal d1" style="margin-top:12px">Browse by <span style="color:var(--primary)">Category</span></h1>
    <p class="lead reveal d2 mt-2" style="max-width:640px">Every category page lists its live tools with instant, no-login results. Pick a lane and start calculating.</p>
    <div class="grid grid-3" id="catGrid" style="margin-top:30px"></div>
  </main>
${scripts('../')}
  <script>
    (function () {
      var grid = document.getElementById('catGrid');
      grid.innerHTML = DC.categoriesSorted().map(function (c, i) {
        var live = DC.catCount(c.id);
        return '<a class="cat-card reveal d' + (i % 3) + '" href="' + c.id + '" style="--cat-color:' + c.color + '">' +
          '<div class="cat-icon">' + DC.icon(c.icon) + '</div>' +
          '<h3>' + c.name + '</h3>' +
          '<p>' + c.desc + '</p>' +
          '<div class="cat-meta"><span>' + live + ' tool' + (live === 1 ? '' : 's') + '</span><span class="arrow">' + DC.icon('arrow') + '</span></div>' +
        '</a>';
      }).join('');
      DC.renderLayout();
      setTimeout(function () { DC.initReveal(); }, 0);
    })();
  </script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"All Calculator Categories","url":"${SITE}/categories","isPartOf":{"@type":"WebSite","name":"DecideCalc","url":"${SITE}/"}}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${SITE}/"},{"@type":"ListItem","position":2,"name":"Categories"}]}</script>
</body>
</html>
`;
}

/* ---------- 2. /categories/<id> ---------- */
function categoryPage(cat) {
  return `${head({
    title: cat.name + ' Calculators — Free & Instant | DecideCalc',
    desc: cat.desc + ' Free, instant ' + cat.name.toLowerCase() + ' calculators on DecideCalc — no login, works on any device.',
    canonical: SITE + '/categories/' + cat.id, base: '../../'
  })}
<body>
  <main class="container" style="padding-top:40px;padding-bottom:80px">
    <nav class="breadcrumb"><a href="../../">Home</a><span class="sep">/</span><a href="../">Categories</a><span class="sep">/</span><span>${esc(cat.name)}</span></nav>
    <span class="badge reveal" id="catCount"></span>
    <h1 class="reveal d1" style="margin-top:12px">${esc(cat.name)}</h1>
    <p class="lead reveal d2 mt-2" style="max-width:640px">${esc(cat.desc)}</p>
    <div class="search-box reveal d3" style="max-width:460px">
      <input id="toolSearch" class="input" type="search" placeholder="Search ${escQ(cat.name.toLowerCase())} tools…" autocomplete="off" aria-label="Search ${escQ(cat.name)} tools">
    </div>
    <div class="grid grid-3" id="toolsGrid" style="margin-top:26px"></div>
    <p id="noResults" hidden style="color:var(--muted);margin-top:18px">No tools match your search. Try a different term or <a href="../">browse all categories</a>.</p>
  </main>
  <noscript><p style="max-width:720px;margin:40px auto;padding:0 20px">The ${esc(cat.name)} tool list needs JavaScript. All calculators also run 100% in your browser.</p></noscript>
${scripts('../../')}
  <script>
    (function () {
      var list = DC.tools.filter(function (t) { return t.cat === '${cat.id}'; });
      document.getElementById('catCount').textContent = list.length + ' live tool' + (list.length === 1 ? '' : 's');
      ${toolCardFn.replace('%BASE%', '../../')}
      var grid = document.getElementById('toolsGrid');
      grid.innerHTML = list.map(toolCard).join('');
      var cards = Array.prototype.slice.call(grid.children);
      document.getElementById('toolSearch').addEventListener('input', function (e) {
        var q = e.target.value.trim().toLowerCase(), shown = 0;
        cards.forEach(function (el, i) {
          var t = list[i];
          var ok = !q || ((t.name + ' ' + t.blurb + ' ' + (t.aliases || '')).toLowerCase().indexOf(q) !== -1);
          el.style.display = ok ? '' : 'none';
          if (ok) shown++;
        });
        document.getElementById('noResults').hidden = shown !== 0;
      });
      DC.renderLayout();
      setTimeout(function () { DC.initReveal(); }, 0);
    })();
  </script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"${escQ(cat.name)} Calculators","url":"${SITE}/categories/${cat.id}","description":"${escQ(cat.desc)}","isPartOf":{"@type":"WebSite","name":"DecideCalc","url":"${SITE}/"}}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${SITE}/"},{"@type":"ListItem","position":2,"name":"Categories","item":"${SITE}/categories"},{"@type":"ListItem","position":3,"name":"${escQ(cat.name)}"}]}</script>
</body>
</html>
`;
}

/* ---------- 3. /tools ---------- */
function toolsPage() {
  return `${head({
    title: 'All 90+ Free Calculators & Tools — DecideCalc',
    desc: 'Every live DecideCalc calculator in one directory: finance, tax, career, health, life planning, date & time, converters, text, developer, utility and education tools. Search and filter instantly.',
    canonical: SITE + '/tools', base: '../'
  })}
<body>
  <main class="container" style="padding-top:40px;padding-bottom:80px">
    <nav class="breadcrumb"><a href="../">Home</a><span class="sep">/</span><span>All Tools</span></nav>
    <span class="badge reveal" id="toolCount"></span>
    <h1 class="reveal d1" style="margin-top:12px">All <span style="color:var(--primary)">Calculators &amp; Tools</span></h1>
    <p class="lead reveal d2 mt-2" style="max-width:640px">Search by name or tap a category chip. Every tool here is live — instant results, real recommendations, no login.</p>
    <div class="search-box reveal d3" style="max-width:480px">
      <input id="toolSearch" class="input" type="search" placeholder="Search: EMI, SIP, tax, BMI, age, password…" autocomplete="off" aria-label="Search all tools">
    </div>
    <div class="chip-group reveal" id="filterChips" style="margin-top:14px"></div>
    <div class="grid grid-3" id="toolsGrid" style="margin-top:26px"></div>
    <p id="noResults" hidden style="color:var(--muted);margin-top:18px">No tools match your search — try a broader term like “loan”, “tax” or “health”.</p>
  </main>
  <noscript><p style="max-width:720px;margin:40px auto;padding:0 20px">The tool directory needs JavaScript. Visit <a href="../categories">Categories</a> for grouped listings.</p></noscript>
${scripts('../')}
  <script>
    (function () {
      var activeFilter = 'all', activeQuery = '';
      document.getElementById('toolCount').textContent = DC.tools.length + ' live tools';
      var wrap = document.getElementById('filterChips');
      var chips = [{ id: 'all', name: 'All' }].concat(DC.categoriesSorted());
      wrap.innerHTML = chips.map(function (c) {
        return '<button type="button" class="chip' + (c.id === 'all' ? ' active' : '') + '" data-cat="' + c.id + '"' + (c.color ? ' style="--cat-color:' + c.color + '"' : '') + '>' + c.name + '</button>';
      }).join('');
      wrap.querySelectorAll('.chip').forEach(function (b) {
        b.addEventListener('click', function () {
          activeFilter = b.getAttribute('data-cat');
          wrap.querySelectorAll('.chip').forEach(function (x) { x.classList.toggle('active', x === b); });
          apply();
        });
      });
      ${toolCardFn.replace('%BASE%', '../')}
      var grid = document.getElementById('toolsGrid');
      grid.innerHTML = DC.tools.map(toolCard).join('');
      var cards = Array.prototype.slice.call(grid.children);
      function apply() {
        var shown = 0;
        cards.forEach(function (el, i) {
          var t = DC.tools[i];
          var ok = (activeFilter === 'all' || t.cat === activeFilter) &&
            (!activeQuery || (t.name + ' ' + t.blurb + ' ' + (t.aliases || '')).toLowerCase().indexOf(activeQuery) !== -1);
          el.style.display = ok ? '' : 'none';
          if (ok) shown++;
        });
        document.getElementById('noResults').hidden = shown !== 0;
      }
      document.getElementById('toolSearch').addEventListener('input', function (e) {
        activeQuery = e.target.value.trim().toLowerCase();
        apply();
      });
      DC.renderLayout();
      setTimeout(function () { DC.initReveal(); }, 0);
    })();
  </script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"All Calculators & Tools","url":"${SITE}/tools","isPartOf":{"@type":"WebSite","name":"DecideCalc","url":"${SITE}/"}}</script>
</body>
</html>
`;
}

/* ---------- 4. /how-it-works ---------- */
function howItWorks() {
  return `${head({
    title: 'How DecideCalc Works — Free, Private, Instant Calculators',
    desc: 'DecideCalc runs 90+ decision calculators entirely in your browser: no login, no uploads, instant results with formulas explained and clear recommendations.',
    canonical: SITE + '/how-it-works', base: '../'
  })}
<body>
  <main class="container" style="padding-top:40px;padding-bottom:80px;max-width:820px">
    <nav class="breadcrumb"><a href="../">Home</a><span class="sep">/</span><span>How It Works</span></nav>
    <span class="badge reveal">Simple by design</span>
    <h1 class="reveal d1" style="margin-top:12px">How <span style="color:var(--primary)">DecideCalc</span> Works</h1>
    <p class="lead reveal d2 mt-2">Type your numbers, get a clear answer in seconds — with the formula shown, a plain-language summary and a practical recommendation.</p>

    <article class="card reveal d3" style="margin-top:28px">
      <h2>1. Pick a tool</h2>
      <p class="mt-2">Browse the <a href="../categories">12 categories</a> or search the <a href="../tools">full tools directory</a>. Every listed tool is live and working — no placeholders, no “coming soon”.</p>
    </article>
    <article class="card reveal">
      <h2>2. Enter your numbers</h2>
      <p class="mt-2">Inputs are validated as you type. If something is missing or out of range, you get a specific error message — never a broken result.</p>
    </article>
    <article class="card reveal">
      <h2>3. Read the full answer</h2>
      <p class="mt-2">Each result includes the formula used, a written summary, charts with visible data labels, and a concrete recommendation. You can copy, print, share or download the result.</p>
    </article>
    <article class="card reveal">
      <h2>4. Your data stays yours</h2>
      <p class="mt-2">All calculations run in your browser with vanilla JavaScript. There are no accounts and no uploads. The only things stored are small convenience preferences on your own device (theme, recent tools, favourites) — details in the <a href="../privacy">Privacy Policy</a>.</p>
    </article>
    <article class="card reveal">
      <h2>5. Free forever</h2>
      <p class="mt-2">DecideCalc is free with no paywall. Unobtrusive ads (once enabled) keep the lights on — they never touch your inputs or results. Questions? <a href="../contact">Contact us</a>.</p>
    </article>

    <div style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap">
      <a class="btn btn-primary" href="../tools">Explore all tools</a>
      <a class="btn btn-ghost" href="../categories">Browse categories</a>
    </div>
  </main>
${scripts('../')}
  <script>
    DC.renderLayout();
    setTimeout(function () { DC.initReveal(); }, 0);
  </script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo","name":"How to use DecideCalc","step":[{"@type":"HowToStep","position":1,"name":"Pick a tool"},{"@type":"HowToStep","position":2,"name":"Enter your numbers"},{"@type":"HowToStep","position":3,"name":"Read the full answer"},{"@type":"HowToStep","position":4,"name":"Keep your data private"},{"@type":"HowToStep","position":5,"name":"Use it free forever"}]}</script>
</body>
</html>
`;
}

/* ---------- write ---------- */
function write(rel, content) {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log('wrote', rel);
}

write('categories/index.html', categoriesHub());
CATS.forEach(c => write(path.join('categories', c.id, 'index.html'), categoryPage(c)));
write('tools/index.html', toolsPage());
write('how-it-works/index.html', howItWorks());
console.log('Done: 16 route pages generated.');
