'use strict';
/* Inject <meta name="google-adsense-account"> into every page <head>.
   Idempotent — skips pages that already carry the tag. */
const fs = require('fs');
const path = require('path');
const PUB = 'ca-pub-3027138458482943';
const META = '<meta name="google-adsense-account" content="' + PUB + '">';

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.git', '.zcode'].includes(e.name)) yield* walk(p);
    } else if (e.name.endsWith('.html') && !e.name.startsWith('_')) yield p;
  }
}
let added = 0, already = 0;
for (const f of walk('.')) {
  const src = fs.readFileSync(f, 'utf8');
  const existing = src.match(/<meta name="google-adsense-account" content="([^"]+)">/);
  if (existing) { already++; if (existing[1] !== PUB) console.log('MISMATCH id in', f, existing[1]); continue; }
  const next = src.replace(/(<meta charset="UTF-8"\s*\/?>)/i, '$1\n  ' + META);
  if (next !== src) { fs.writeFileSync(f, next); added++; }
  else console.log('no charset meta in', f);
}
console.log('added:', added, '| already present:', already);
