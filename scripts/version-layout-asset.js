'use strict';
/**
 * Cache-bust the shared layout script after a routing/logo hotfix.
 * The site previously served layout.js with a long immutable cache policy.
 * Existing visitors can therefore execute an old layout that builds relative
 * logo URLs on nested category routes. A stable version query forces every
 * HTML page to request the corrected root-absolute layout implementation.
 *
 * Safe to rerun: replaces any existing layout.js version query with VERSION.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VERSION = '20260804-2';
const SKIP = new Set(['node_modules', '.git', '.zcode']);

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name)) walk(path.join(dir, entry.name), files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.join(dir, entry.name));
    }
  }
}

const html = [];
walk(ROOT, html);
let changed = 0;
for (const file of html) {
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(/(src=["'][^"']*assets\/js\/layout\.js)(?:\?[^"']*)?(["'])/g, `$1?v=${VERSION}$2`);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed++;
  }
}

console.log(`Updated ${changed} HTML layout-script references to v=${VERSION}.`);
