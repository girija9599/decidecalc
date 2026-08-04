#!/usr/bin/env node
/* DecideCalc release parity verifier: registry, pages, sitemap, SW, canonicals and JSON-LD. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = process.cwd();
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const exists = p => fs.existsSync(path.join(root, p));
const errors = [];
const sandbox = { window: { DC: {} } };
vm.runInNewContext(read('assets/js/tools.js'), sandbox);
const tools = sandbox.window.DC.tools || [];
const slugs = tools.map(t => t.slug);
const unique = new Set(slugs);
if (tools.length !== unique.size) errors.push('Duplicate registry slugs found');
const names = tools.map(t => t.name.toLowerCase());
if (names.length !== new Set(names).size) errors.push('Duplicate registry names found');
const sitemap = read('sitemap.xml');
const sw = read('sw.js');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (urls.length !== new Set(urls).size) errors.push('Duplicate sitemap URLs found');
if (urls.some(u => u.includes('#') || u.endsWith('.html'))) errors.push('Sitemap contains hash or .html URL');
for (const t of tools) {
  const page = `calculators/${t.slug}.html`;
  if (!exists(page)) { errors.push(`Missing calculator page: ${page}`); continue; }
  const html = read(page);
  const canon = `https://decidecalc.com/calculators/${t.slug}`;
  if (!html.includes(`<link rel="canonical" href="${canon}">`)) errors.push(`Missing canonical: ${t.slug}`);
  if (!smLocal(`https://decidecalc.com/calculators/${t.slug}`)) errors.push(`Missing sitemap URL: ${t.slug}`);
  if (!sw.includes(`'/${page}'`)) errors.push(`Missing SW asset: ${page}`);
  if (!html.includes(`slug:'${t.slug}'`) && !html.includes(`slug: '${t.slug}'`)) errors.push(`Page slug mismatch: ${t.slug}`);
}
function smLocal(url) { return sitemap.includes(`<loc>${url}</loc>`); }
const htmlFiles = walk(root).filter(f => f.endsWith('.html'));
for (const f of htmlFiles) {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  const html = read(rel);
  const canons = [...html.matchAll(/<link rel="canonical" href="([^"]+)">/g)].map(m => m[1]);
  if (canons.length > 1) errors.push(`Multiple canonicals: ${rel}`);
  for (const [i, m] of [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].entries()) {
    try { JSON.parse(m[1]); } catch (e) { errors.push(`Invalid JSON-LD #${i + 1}: ${rel}`); }
  }
}
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => { const p = path.join(dir, e.name); if (e.name.startsWith('.') || e.name === 'node_modules') return []; return e.isDirectory() ? walk(p) : [p]; }); }
for (const p of ['favicon.ico','site.webmanifest','browserconfig.xml','assets/img/icon-192.png','assets/img/icon-512.png','assets/img/apple-touch-icon.png','assets/img/decidecalc-favicon.svg','assets/img/logo.png']) if (!exists(p)) errors.push(`Missing favicon/app asset: ${p}`);
for (const p of ['index.html','tools/index.html','categories/index.html','blog/index.html','how-it-works/index.html']) if (!exists(p)) errors.push(`Missing route page: ${p}`);
console.log(`Parity: ${tools.length} tools, ${htmlFiles.length} HTML pages, ${urls.length} sitemap URLs`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('PARITY: PASS');
