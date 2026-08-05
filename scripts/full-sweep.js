'use strict';
// Regression-only full site sweep: all routes must render with no console errors,
// exactly one H1, no broken asset request, and shared header/logo present.
// Run: node scripts/full-sweep.js http://127.0.0.1:8104
const { chromium } = require('playwright-core');
const fs = require('fs');

const BASE = process.argv[2] || 'http://127.0.0.1:8104';
const toolsSrc = fs.readFileSync('assets/js/tools.js', 'utf8');
const slugs = [...toolsSrc.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
const cats = [...toolsSrc.matchAll(/\{\s*id:\s*'([^']+)'/g)].map(m => m[1]);

const staticPages = ['/', '/about', '/contact', '/privacy', '/terms', '/how-it-works', '/tools', '/categories', '/blog'];
const routes = [
  ...staticPages,
  ...cats.map(c => '/categories/' + c),
  ...slugs.map(s => '/calculators/' + s),
  ...fs.readdirSync('blog').filter(f => f.endsWith('.html') && f !== 'index.html').map(f => '/blog/' + f.replace(/\.html$/, ''))
];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = { pass: 0, fail: [] };

  // Desktop sweep
  for (const r of routes) {
    try {
      const page = await browser.newPage();
      const errs = [], boosts = [];
      page.on('pageerror', e => errs.push('PAGEERROR:' + e.message.slice(0, 200)));
      page.on('console', m => { if (m.type() === 'error') errs.push('console:' + m.text().slice(0, 200)); });
      page.on('response', res => { const u = res.url(); if (u.startsWith(BASE) && res.status() >= 400) boosts.push(res.status() + ' ' + u); });
      const resp = await page.goto(BASE + r, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(600);
      const status = resp ? resp.status() : 0;
      const h1 = await page.locator('h1').count().catch(() => 0);
      const logo = await page.locator('.site-header .brand-mark img').count();
      const layoutScript = await page.locator('script[src*="layout.js"]').count();

      const failReasons = [];
      if (status !== 200) failReasons.push('HTTP ' + status);
      if (h1 !== 1)      failReasons.push('h1=' + h1);
      if (!logo)         failReasons.push('no-logo');
      if (!layoutScript) failReasons.push('no-layout-script');
      if (errs.length)   failReasons.push('js-err:' + errs[0]);
      if (boosts.length) failReasons.push('assets:' + boosts[0]);

      if (failReasons.length) results.fail.push({ route: r, reasons: failReasons });
      else results.pass++;

      await page.close();
    } catch (e) {
      results.fail.push({ route: r, reasons: ['exception:' + e.message.slice(0, 100)] });
    }
  }

  // Mobile sweep over representative routes
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobRoutes = ['/', '/categories', '/categories/finance', '/categories/life', '/categories/career',
                     '/blog', '/blog/emi-vs-sip-which-is-better-india', '/blog/debt-snowball-vs-avalanche-india',
                     '/calculators/emi-calculator', '/calculators/debt-payoff-planner',
                     '/tools', '/contact', '/about'];

  for (const r of mobRoutes) {
    try {
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', e => errs.push('pageerror:' + e.message.slice(0, 120)));
      page.on('console', m => { if (m.type() === 'error') errs.push('console:' + m.text().slice(0, 120)); });
      const resp = await page.goto(BASE + r + '?m=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      const h1 = await page.locator('h1').count();
      const logo = await page.locator('.site-header .brand-mark img').count();
      if (overflow || h1 !== 1 || !logo || errs.length) {
        results.fail.push({ route: '[mobile] ' + r, reasons: [
          overflow ? 'overflowX' : null, h1 !== 1 ? 'h1=' + h1 : null, !logo ? 'no-logo' : null, errs[0] || null
        ].filter(Boolean)});
      } else results.pass++;
      await page.close();
    } catch (e) {
      results.fail.push({ route: '[mobile] ' + r, reasons: ['exception:' + e.message.slice(0, 100)] });
    }
  }

  console.log('Desktop+mobile sweep:', results.pass, 'ok,', results.fail.length, 'fail');
  if (results.fail.length) {
    console.log('Failures:');
    results.fail.forEach(f => console.log('  ', f.route, '-', f.reasons.join(' | ')));
    process.exit(1);
  }
  console.log('SWEEP: PASS');
  process.exit(0);
})().catch(e => { console.error('sweep error', e); process.exit(2); });
