'use strict';
/**
 * Release smoke test against the local static site.
 * - Loads key pages, collects console errors, 4xx/5xx responses, page errors
 * - Verifies calculator interaction: fields present, results compute, chart aria, FAQ count
 * - Verifies guides: single H1, hero image, Article + FAQPage JSON-LD, Last reviewed/disclaimer
 * - Verifies /tools?q= pre-fills and filters
 * - Runs mobile viewport (390x844) rendering for a few routes (no horizontal overflow)
 *
 * Run:
 *   node scripts/release-smoke.js [BASE_URL]
 * Requires playwright-core and a system Chrome (channel: chrome).
 * Exit code 0 = PASS, 1 = FAIL.
 */
const { chromium } = require('playwright-core');

const BASE = process.argv[2] || 'http://127.0.0.1:8101';

const CALCULATORS = [
  'debt-payoff-planner',
  'credit-card-payoff-calculator',
  'investment-fee-calculator',
  'loan-refinance-calculator',
  'retirement-withdrawal-calculator',
  'bond-ytm-calculator'
];

const GUIDES = [
  'debt-snowball-vs-avalanche-india',
  'credit-card-minimum-payment-payoff-india',
  'home-loan-balance-transfer-refinance-india',
  'mutual-fund-expense-ratio-impact-india',
  'retirement-withdrawal-rate-india',
  'bond-yield-vs-ytm-india'
];

const failures = [];
function fail(msg) { failures.push(msg); console.log('  FAIL  ' + msg); }
function ok(msg) { console.log('  ok    ' + msg); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  async function visit(path) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors = [];
    const badResponses = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('response', r => {
      const u = r.url();
      if (u.startsWith(BASE) && r.status() >= 400) badResponses.push(r.status() + ' ' + u);
    });
    const resp = await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    return { page, ctx, errors, badResponses, status: resp ? resp.status() : 0 };
  }

  // ---------- 1. Route render sweep (console + 404 guard) ----------
  console.log('\n[1] Route render sweep — desktop');
  const routes = ['/', '/tools', ...CALCULATORS.map(s => '/calculators/' + s), ...GUIDES.map(g => '/blog/' + g)];
  for (const r of routes) {
    const v = await visit(r);
    if (v.status !== 200) fail(`${r} HTTP ${v.status}`);
    else if (v.errors.length) fail(`${r} console errors: ${v.errors.slice(0, 2).join(' | ')}`);
    else if (v.badResponses.length) fail(`${r} bad assets: ${v.badResponses.slice(0, 2).join(' | ')}`);
    else ok(r);
    await v.ctx.close();
  }

  // ---------- 2. Calculator interactivity ----------
  console.log('\n[2] Calculator interactivity');
  for (const slug of CALCULATORS) {
    const v = await visit('/calculators/' + slug);
    const { page } = v;
    try {
      const h1 = await page.locator('h1').count();
      if (h1 !== 1) fail(slug + ' h1 count = ' + h1);

      const fieldCount = await page.locator('[data-field]').count();
      if (fieldCount < 1) fail(slug + ' no [data-field] inputs');

      const results = page.locator('[data-result]');
      const rn = await results.count();
      if (rn < 1) fail(slug + ' no [data-result] elements');
      else {
        const head = await results.first().innerText();
        if (!head.trim()) fail(slug + ' first result empty');
      }

      const chart = page.locator('#calcChart');
      if (await chart.count()) {
        const aria = await chart.getAttribute('aria-label');
        if (!aria) fail(slug + ' chart missing aria-label');
      }

      const faqs = await page.locator('.faq-item, details.faq-item').count();
      if (faqs < 3) fail(slug + ' faq count = ' + faqs);

      const rel = await page.locator('#relatedTools a').count();
      if (rel < 1) fail(slug + ' no related tool links');

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      if (!canonical || !canonical.endsWith('/calculators/' + slug)) fail(slug + ' canonical mismatch: ' + canonical);

      if (v.errors.length) fail(slug + ' console errors: ' + v.errors.slice(0, 2).join(' | '));
      if (v.badResponses.length) fail(slug + ' bad assets: ' + v.badResponses.slice(0, 2).join(' | '));
      ok(slug);
    } catch (e) { fail(slug + ' exception: ' + e.message); }
    await v.ctx.close();
  }

  // ---------- 3. Guide article structure ----------
  console.log('\n[3] Guide structure');
  for (const slug of GUIDES) {
    const v = await visit('/blog/' + slug);
    const { page } = v;
    try {
      const h1 = await page.locator('h1').count();
      if (h1 !== 1) fail(slug + ' h1 count = ' + h1);

      const imgs = await page.locator('main img').count();
      if (imgs < 1) fail(slug + ' no main img');

      const jsonLd = await page.locator('script[type="application/ld+json"]').count();
      if (jsonLd < 2) fail(slug + ' json-ld count = ' + jsonLd);

      const body = await page.locator('body').innerText();
      if (!body.includes('Last reviewed')) fail(slug + ' missing Last reviewed');
      if (!/disclaimer/i.test(body)) fail(slug + ' missing disclaimer');

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      if (!canonical || !canonical.endsWith('/blog/' + slug)) fail(slug + ' canonical mismatch: ' + canonical);

      if (v.errors.length) fail(slug + ' console errors: ' + v.errors.slice(0, 2).join(' | '));
      if (v.badResponses.length) fail(slug + ' bad assets: ' + v.badResponses.slice(0, 2).join(' | '));
      ok(slug);
    } catch (e) { fail(slug + ' exception: ' + e.message); }
    await v.ctx.close();
  }

  // ---------- 4. /tools?q= search behavior ----------
  console.log('\n[4] /tools search');
  {
    const v = await visit('/tools?q=debt%20payoff');
    const { page } = v;
    try {
      const val = await page.locator('#toolSearch').inputValue();
      if (val !== 'debt payoff') fail('tools search input value = ' + JSON.stringify(val));
      const visible = await page.locator('.tool-card', { has: page.locator('..') }).count();
      const shown = await page.evaluate(() => {
        return [...document.querySelectorAll('.tool-card')].filter(c => c.offsetParent !== null).length;
      });
      if (shown < 1) fail('tools search visible cards = 0');
      await page.locator('#toolSearch').fill('emi');
      await page.waitForTimeout(250);
      if (!page.url().includes('q=emi')) fail('tools search URL did not update: ' + page.url());
      ok('tools?q= works, visible=' + shown);
    } catch (e) { fail('tools search exception: ' + e.message); }
    await v.ctx.close();
  }

  // ---------- 5. Mobile viewport ----------
  console.log('\n[5] Mobile viewport sweep (390x844)');
  for (const r of ['/', '/calculators/debt-payoff-planner', '/blog/bond-yield-vs-ytm-india']) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(BASE + r, { waitUntil: 'load' });
    await sleep(600);
    const overX = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overX) fail('mobile overflowX on ' + r);
    else if (errors.length) fail('mobile console errors on ' + r + ': ' + errors.slice(0, 2).join(' | '));
    else ok('mobile ' + r);
    await ctx.close();
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  if (failures.length) {
    console.log('SMOKE: FAIL (' + failures.length + ' issue(s))');
    failures.forEach(f => console.log('  - ' + f));
    process.exit(1);
  }
  console.log('SMOKE: PASS');
  process.exit(0);
})();
