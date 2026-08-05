'use strict';
/**
 * Idempotent favicon unification — ensure EVERY page carries the exact same
 * <link rel="icon"> set, mounted at fixed root-absolute paths, so any browser
 * (desktop/mobile/Chrome tab group/bookmark) renders the same DecideCalc mark.
 *
 * Canonical set:
 *   /favicon.ico            — multi-resolution 16/32/48 PNG, flat bitmap
 *   /assets/img/favicon-16x16.png / favicon-32x32.png / favicon-48x48.png
 *   /assets/img/apple-touch-icon.png (180)
 *   /assets/img/decidecalc-favicon.svg (mask-icon)
 *   /site.webmanifest       — app shortcut icon sizes
 * The site no longer uses decidecalc-mark.svg as a favicon anywhere.
 *
 * Run: node scripts/unify-favicons.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

/** Canonical favicon block (whitespace-normalized for compliant indenting). */
const BLOCK = [
  '<link rel="icon" href="/favicon.ico" sizes="any">',
  '<link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-16x16.png">',
  '<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32x32.png">',
  '<link rel="icon" type="image/png" sizes="48x48" href="/assets/img/favicon-48x48.png">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png">',
  '<link rel="mask-icon" href="/assets/img/decidecalc-favicon.svg" color="#0F1533">',
  '<link rel="manifest" href="/site.webmanifest">'
].join('\n    ');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.git', '.zcode', 'scripts', 'artifacts'].includes(e.name)) yield* walk(p);
    } else if (e.isFile() && e.name.endsWith('.html') && !e.name.startsWith('_')) yield p;
  }
}

function normalizeFavicons(src) {
  // Remove any existing rel="icon" link lines and any straggler data-URI svg link.
  let out = src.replace(/<link[^>]+rel=["'](?:icon(?:\s+type)?|shortcut icon)["'][^>]*>\s*/g, '');
  // Remove any remaining link with favicon words (data-uri image/svg etc.)
  out = out.replace(/<link[^>]+rel=[^>]*icon[^>]*>\s*/gi, '');
  out = out.replace(/<link[^>]+rel=["']manifest["'][^>]*>\s*/gi, '');
  // Remove duplicate mask-icon line (sometimes formatted on one line)
  out = out.replace(/<link[^>]+mask-icon[^>]*>\s*/gi, '');

  // Where to insert: right after meta name="theme-color" if present, else after meta viewport
  const anchor = /<meta name="theme-color"[^>]*>\s*/.test(out)
    ? /<meta name="theme-color"[^>]*>\s*/
    : /<meta name="viewport"[^>]*>\s*/;

  if (!anchor.test(out)) return src; // safety
  const m = out.match(anchor);
  const pos = out.indexOf(m[0]) + m[0].length;
  return out.slice(0, pos) + BLOCK + '\n' + out.slice(pos);
}

let touched = 0;
for (const file of walk(ROOT)) {
  const before = fs.readFileSync(file, 'utf8');
  const after = normalizeFavicons(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    touched++;
  }
}
console.log('Updated', touched, 'page(s) with the unified favicon block.');
