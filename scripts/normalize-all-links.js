'use strict';
/**
 * Idempotent IFM — convert production-breaking relative hrefs/srcs to root-absolute
 * URLs across every nested page of the static site.
 *
 * Why: with cleanUrls:true + trailingSlash:false on Vercel, a page reachable at
 *   /blog/<slug>/   (308 → /blog/<slug>)   AND   /blog/<slug>
 * will be parsed differently by the browser depending on which form the user
 * currently has loaded. Relative references (../foo, blog.css, ./…) either work
 * or silently 404, depending on which form the user is on. Root-absolute paths
 * never depend on the trailing-slash form.
 *
 * What this does NOT do:
 *   - it never touches an anchor (href="#..."), a URL with protocol
 *     (https:, http:, mailto:, tel:, data:, javascript:), or absolute-path
 *     references that already start with '/'.
 *   - it never modifies title/description/canonical/OG/Twitter/JSON-LD text.
 *
 * Run:  node scripts/normalize-all-links.js
 * Safe: idempotent — re-running makes no new changes.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.zcode'].includes(e.name)) continue;
      walk(p, out);
    } else if (e.isFile() && e.name.endsWith('.html')) {
      out.push(p);
    }
  }
  return out;
}

function depth(file) {
  return file.length ? file.split(/[\\\/]/).length : 0;
}

const reHref = /\bhref\s*=\s*"([^"]+)"/g;
const reSrc  = /\bsrc\s*=\s*"([^"]+)"/g;

function isInternalRelative(u) {
  if (!u) return false;
  if (u.startsWith('/')) return false;
  if (u.startsWith('#')) return false;
  if (/^[a-z][a-z0-9+\-.]*:/i.test(u) || u.startsWith('//')) return false;
  return true;
}

function normalizePage(fileAbs) {
  const dirRel = path.relative(ROOT, path.dirname(fileAbs)).replace(/\\/g, '/');
  const depthFromRoot = dirRel === '' ? 0 : dirRel.split('/').length;

  let src = fs.readFileSync(fileAbs, 'utf8');
  const before = src;

  src = src.replace(reHref, (m, u) => {
    if (!isInternalRelative(u)) return m;
    return 'href="' + rewrite(u, depthFromRoot) + '"';
  });
  src = src.replace(reSrc, (m, u) => {
    if (!isInternalRelative(u)) return m;
    return 'src="' + rewrite(u, depthFromRoot) + '"';
  });

  function rewrite(u, depth) {
    // '../x' from depth N → one level above root-N
    // './x' → drop the './' — stay in same dir, expressed root-absolute
    // 'x'  → relative in same dir (rare: only for en-dir pages that already work)
    if (u.startsWith('../')) {
      const up = (u.match(/\.\.\//g) || []).length;
      const rest = u.slice(up * 3);
      const rootFrom = depth - up;
      return rootFrom <= 0 ? '/' + rest : '/' + rest;
    }
    if (u.startsWith('./')) {
      return depth === 0 ? '/' + u.slice(2) : '/' + (dirRel + '/' + u.slice(2)).replace(/\\/g, '/');
    }
    // Bare rel (no ./ no ../): leave alone — used for intra-page anchors etc.
    return u;
  }

  if (src !== before) {
    fs.writeFileSync(fileAbs, src);
    return true;
  }
  return false;
}

const files = walk(ROOT);
let n = 0, list = [];
for (const f of files) {
  if (normalizePage(f)) {
    n++; list.push(path.relative(ROOT, f).replace(/\\/g, '/'));
  }
}
console.log(`Scanned ${files.length} html files`);
console.log(`Updated ${n} file(s):`);
list.forEach(f => console.log('  -', f));
