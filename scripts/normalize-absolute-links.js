'use strict';
/**
 * Idempotent IFM — convert production-breaking relative hrefs/srcs (that fail
 * after cleanUrls trailing-slash redirects) to root-absolute URLs.
 *
 * Only applied to NESTED pages that are reachable under multiple URL forms
 * (e.g. /blog vs /blog/). The pages each retain their existing canonical.
 *
 * Run: node scripts/normalize-absolute-links.js  (safe to re-run)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const targets = [
  // blog index and every blog post (path/name pairs share the same pattern)
  'blog/index.html',
  'blog/emi-vs-sip-which-is-better-india.html',
  'blog/how-much-health-insurance-need-india.html',
  'blog/rent-or-buy-house-2026-india.html',
  'blog/debt-snowball-vs-avalanche-india.html',
  'blog/credit-card-minimum-payment-payoff-india.html',
  'blog/home-loan-balance-transfer-refinance-india.html',
  'blog/mutual-fund-expense-ratio-impact-india.html',
  'blog/retirement-withdrawal-rate-india.html',
  'blog/bond-yield-vs-ytm-india.html',
];

const subs = [
  // CSS/favicon/img/js under assets
  [/href="\.\.\/assets\//g, 'href="/assets/'],
  [/src="\.\.\/assets\//g, 'src="/assets/'],
  // blog stylesheet on blog pages — same-dir, breaks under /blog
  [/href="blog\.css"/g, 'href="/blog/blog.css"'],
  // script srcs on blog pages (blog/* lives under /blog/<slug>)
  [/src="\.\.\/assets\/js\//g, 'src="/assets/js/'],
];

let touched = 0, changedBytes = 0;
for (const rel of targets) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) { console.log('skip (missing): ' + rel); continue; }
  let src = fs.readFileSync(abs, 'utf8');
  const before = src;
  for (const [re, rep] of subs) src = src.replace(re, rep);
  if (src !== before) {
    fs.writeFileSync(abs, src);
    touched++;
    changedBytes += Math.abs(src.length - before.length);
    console.log('updated: ' + rel);
  } else {
    console.log('no change: ' + rel);
  }
}
console.log(`\nDone. touched=${touched}, bytes delta=${changedBytes}`);
