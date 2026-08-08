#!/usr/bin/env node
/* Verify the canonical DecideCalc favicon assets and head references. */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const required = [
  ['assets/img/favicon-16x16.png', 16, 16],
  ['assets/img/favicon-32x32.png', 32, 32],
  ['assets/img/favicon-48x48.png', 48, 48],
  ['assets/img/apple-touch-icon.png', 180, 180],
  ['assets/img/icon-192.png', 192, 192],
  ['assets/img/icon-512.png', 512, 512]
];
const errors = [];
const read = file => fs.readFileSync(path.join(ROOT, file));

function pngSize(file) {
  const b = read(file);
  if (b.toString('ascii', 1, 4) !== 'PNG') throw new Error('invalid PNG signature');
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

for (const [file, width, height] of required) {
  try {
    const size = pngSize(file);
    if (size.width !== width || size.height !== height) {
      errors.push(`${file}: expected ${width}x${height}, got ${size.width}x${size.height}`);
    }
  } catch (e) {
    errors.push(`${file}: ${e.message}`);
  }
}

try {
  const ico = read('favicon.ico');
  if (ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) errors.push('favicon.ico: invalid ICO header');
  const entries = ico.readUInt16LE(4);
  if (entries < 3) errors.push(`favicon.ico: expected at least 3 sizes, got ${entries}`);
  const sizes = [];
  for (let i = 0; i < entries; i++) {
    const offset = 6 + i * 16;
    sizes.push([ico[offset] || 256, ico[offset + 1] || 256]);
  }
  for (const size of [16, 32, 48]) if (!sizes.some(([w, h]) => w === size && h === size)) errors.push(`favicon.ico: missing ${size}x${size} entry`);
} catch (e) {
  errors.push(`favicon.ico: ${e.message}`);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    if (entry.name.startsWith('.') || entry.name === 'node_modules') return [];
    return entry.isDirectory() ? walk(file) : [file];
  });
}

const htmlFiles = walk(ROOT).filter(file => file.endsWith('.html') && path.basename(file) !== '_tool-template.html');
const requiredTags = [
  '<link rel="icon" href="/favicon.ico" sizes="any">',
  '<link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-16x16.png">',
  '<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32x32.png">',
  '<link rel="icon" type="image/png" sizes="48x48" href="/assets/img/favicon-48x48.png">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png">',
  '<link rel="manifest" href="/site.webmanifest">'
];
for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  for (const tag of requiredTags) if (!html.includes(tag)) errors.push(`${rel}: missing ${tag}`);
}

console.log(`Favicon assets checked: ${required.length + 1}; HTML heads checked: ${htmlFiles.length}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('FAVICON: PASS');
