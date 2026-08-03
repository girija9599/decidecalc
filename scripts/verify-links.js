#!/usr/bin/env node
/* Verify every internal href/src resolves to a real file,
   allowing clean-URL (extensionless/directory-index) targets. */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
function walk(d) {
  let out = [];
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) {
      if (!f.startsWith('_') && f !== 'node_modules' && f !== '.git' && f !== 'scripts') out = out.concat(walk(p));
    } else if (f.endsWith('.html') && !f.startsWith('_')) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let broken = [], checked = 0;
const skip = /^(https?:|mailto:|tel:|data:|javascript:)/i;

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const dir = path.dirname(f);
  const re = /(?:href|src)="([^"]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    const u = m[1];
    if (!u || skip.test(u) || u.startsWith('#')) continue;
    if (u.includes("'") || u.includes('{{')) continue; // JS-templated or template placeholder
    const rel = u.split('#')[0].split('?')[0];
    if (!rel) continue;
    checked++;
    const target = path.normalize(path.join(dir, rel));
    if (fs.existsSync(target)) continue;
    if (fs.existsSync(target + '.html')) continue;
    if (fs.existsSync(path.join(target, 'index.html'))) continue;
    broken.push(path.relative(ROOT, f) + '  ->  ' + u);
  }
}
console.log('html pages scanned:', files.length);
console.log('local links checked:', checked);
console.log('BROKEN:', broken.length);
if (broken.length) console.log(broken.slice(0, 40).join('\n'));
