'use strict';
// Deep route parity — registry ↔ files ↔ categories ↔ sitemap.
const fs = require('fs');
const toolsSrc = fs.readFileSync('assets/js/tools.js', 'utf8');
const slugs = [...toolsSrc.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
const tools  = slugs.map(s => {
  const re = new RegExp("slug:\\s*'" + s.replace(/[.*+?^${}()|[\]\\]/g, m => '\\' + m) + "'[^}]*cat:\\s*'([^']+)'");
  const m = toolsSrc.match(re);
  return { slug: s, cat: m && m[1] };
});
const cats = [...toolsSrc.matchAll(/\{\s*id:\s*'([^']+)'/g)].map(m => m[1]);

const missingFile = tools.filter(t => !fs.existsSync('calculators/' + t.slug + '.html')).map(t => t.slug);
const dupSlugs   = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
const unknownCat = tools.filter(t => !cats.includes(t.cat)).map(t => t.slug + ' (cat=' + t.cat + ')');
const catDirs    = fs.readdirSync('categories').filter(d => fs.statSync('categories/' + d).isDirectory());
const orphanDir  = catDirs.filter(d => !cats.includes(d));
const missingDir = cats.filter(c => !catDirs.includes(c));
// Each category folder must have an index.html
const noIndex = catDirs.filter(d => !fs.existsSync('categories/' + d + '/index.html'));
// Every calculator file should be registered (except template leftovers)
const calcFiles = fs.readdirSync('calculators').filter(f => f.endsWith('.html'));
const unregistered = calcFiles.filter(f => !slugs.includes(f.replace(/\.html$/, '')));

console.log('registry tools:', slugs.length);
console.log('categories in registry:', cats.length);
console.log('missing calculator files:', missingFile.length, missingFile);
console.log('duplicate slugs:', dupSlugs.length, dupSlugs);
console.log('tools with unknown category:', unknownCat.length, unknownCat);
console.log('category folders on disk:', catDirs.length);
console.log('category folder missing index.html:', noIndex.length, noIndex);
console.log('orphan category folder (not in registry):', orphanDir.length, orphanDir);
console.log('registry category missing folder:', missingDir.length, missingDir);
console.log('unregistered calculator files:', unregistered.length, unregistered);

const pass = ![missingFile, dupSlugs, unknownCat, noIndex, orphanDir, missingDir, unregistered].some(a => a.length);
console.log(pass ? 'ROUTE-PARITY: PASS' : 'ROUTE-PARITY: FAIL');
process.exit(pass ? 0 : 1);
