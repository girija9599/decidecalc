#!/usr/bin/env node
/* DecideCalc — clean URL migration (static, framework-free)
   Converts public links to extensionless clean URLs and keeps old
   physical .html files as backward-compatible entry points. */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const PAGES = [
  ...fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && f[0] !== '_').map(f => path.join(ROOT, f)),
  ...fs.readdirSync(path.join(ROOT, 'calculators')).filter(f => f.endsWith('.html')).map(f => path.join(ROOT, 'calculators', f)),
  ...fs.readdirSync(path.join(ROOT, 'blog')).filter(f => f.endsWith('.html')).map(f => path.join(ROOT, 'blog', f)),
];
const JS = fs.readdirSync(path.join(ROOT, 'assets/js')).filter(f => f.endsWith('.js')).map(f => path.join(ROOT, 'assets/js', f));
const FILES = [...PAGES, ...JS, path.join(ROOT, 'sitemap.xml'), path.join(ROOT, 'robots.txt')];
const SITE = 'https://decidecalc.com';
const PUBLIC_PAGES = ['about', 'contact', 'privacy', 'terms', 'sitemap'];

function depth(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  return rel.split('/').length - 1;
}

const cleanRoute = (fromFile, href) => {
  if (!href || /^(?:[a-z]+:|mailto:|tel:|#|data:)/i.test(href)) return href;
  const [beforeHash, hash = ''] = href.split('#');
  const part = beforeHash.replace(/\\/g, '/');
  let dir = '';
  let page = part;
  if (part.startsWith('../')) { dir = '../'.repeat((part.match(/\.\.\//g) || []).length); page = part.slice(dir.length); }
  if (page === 'index.html') return (dir || '') || './';
  if (page === 'blog/index.html') return dir + 'blog/';
  if (!/\.html$/i.test(page)) return href;
  const clean = page.slice(0, -5);
  if (PUBLIC_PAGES.includes(clean)) return dir + clean;
  if (clean.startsWith('blog/')) return dir + 'blog/' + clean.slice(5);
  if (clean.startsWith('calculators/')) return dir + 'calculators/' + clean.slice(12);
  return dir + clean;
};

const cleanAbsolute = (fromFile, url) => {
  const value = cleanRoute(fromFile, url.replace(SITE, ''));
  return SITE + (value.startsWith('/') ? value : '/' + value);
};

let changed = 0;
for (const file of FILES) {
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  const ext = path.extname(file).toLowerCase();
  if (['.html', '.js', '.xml', '.txt'].includes(ext)) {
    text = text.replace(/(["'])((?:\.\.\/)*(?:|blog\/|calculators\/)[^"'<>\s#]+?\.html)\1/g, (m, q, href) => q + cleanRoute(file, href) + q);
    text = text.replace(/(["'])index\.html\1/g, (m, q) => q + cleanRoute(file, 'index.html') + q);
    text = text.replace(new RegExp(SITE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^"\'<>\\s]+\\.html)', 'g'), m => cleanAbsolute(file, m));
    text = text.replace(new RegExp(SITE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\/index(?=["\'<>\\s]|$)', 'g'), SITE + '/');
    text = text.replace(new RegExp(SITE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\/blog\/index(?=["\'<>\\s]|$)', 'g'), SITE + '/blog/');
  }
  if (text !== original) {
    fs.writeFileSync(file, text);
    changed++;
  }
}
console.log(`Clean URL migration updated ${changed} files.`);
