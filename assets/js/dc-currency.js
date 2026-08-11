/* ============================================================
   DecideCalc — shared EMI / financing calculator core
   Provides an 11-currency selector (persisted in localStorage),
   reducing-balance EMI math, amortization schedule, and helpers
   that each calculator page wires into its own UI.
   ============================================================ */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};

  const DC_CURR = [
    { c: 'USD', s: '$',   l: 'en-US' }, { c: 'INR', s: '₹',   l: 'en-IN' },
    { c: 'EUR', s: '€',   l: 'de-DE' }, { c: 'GBP', s: '£',   l: 'en-GB' },
    { c: 'CAD', s: 'C$',  l: 'en-CA' }, { c: 'AUD', s: 'A$',  l: 'en-AU' },
    { c: 'AED', s: 'د.إ', l: 'en-AE' }, { c: 'JPY', s: '¥',   l: 'ja-JP' },
    { c: 'SGD', s: 'S$',  l: 'en-SG' }
  ];
  const KEY = 'dc_currency';

  function get() {
    try {
      const v = localStorage.getItem(KEY);
      const f = DC_CURR.find(x => x.c === v);
      return f || DC_CURR[0];
    } catch (e) { return DC_CURR[0]; }
  }
  function set(code) {
    try { localStorage.setItem(KEY, code); } catch (e) {}
  }
  function fmt(n) {
    const c = get();
    const v = Math.round(isFinite(n) ? n : 0);
    try { return c.s + v.toLocaleString(c.l); } catch (e) { return c.s + v.toLocaleString(); }
  }
  function emi(principal, annualRate, months) {
    const n = Math.max(1, Math.round(months));
    const r = (annualRate || 0) / 100 / 12;
    if (principal <= 0) return { pmt: 0, n, r };
    const pmt = r > 0
      ? principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
      : principal / n;
    return { pmt, n, r };
  }
  function amortize(principal, annualRate, months) {
    const { pmt, n, r } = emi(principal, annualRate, months);
    const rows = [];
    let bal = principal;
    for (let i = 1; i <= n; i++) {
      const intr = bal * r;
      const prin = pmt - intr;
      bal = Math.max(0, bal - prin);
      rows.push({ i, pmt, principal: prin, interest: intr, balance: bal });
    }
    return rows;
  }
  function renderTable(tbody, rows, f) {
    tbody.innerHTML = '';
    // Remove any leftover toggle button from a previous computation
    const oldToggle = document.getElementById('amortiToggle');
    if (oldToggle && oldToggle.parentNode) oldToggle.parentNode.removeChild(oldToggle);

    const CELL = 'padding:8px 12px;';
    const rowHtml = (row) =>
      '<td style="' + CELL + 'text-align:left;color:var(--text-mute);font-weight:500">' + row.i + '</td>' +
      '<td style="' + CELL + 'text-align:right;font-weight:600;color:var(--text)">' + f(row.pmt) + '</td>' +
      '<td style="' + CELL + 'text-align:right">' + f(row.principal) + '</td>' +
      '<td style="' + CELL + 'text-align:right">' + f(row.interest) + '</td>' +
      '<td style="' + CELL + 'text-align:right;font-variant-numeric:tabular-nums">' + f(row.balance) + '</td>';

    rows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border)';
      tr.dataset.amortiRow = '1';
      // Alternate row striping for readability
      if (idx % 2 === 1) tr.style.background = 'color-mix(in srgb, var(--text) 3%, transparent)';
      // Only first 12 months visible initially; rest hidden until the toggle
      if (idx >= 12) tr.style.display = 'none';
      tr.innerHTML = rowHtml(row);
      tbody.appendChild(tr);
    });

    // Expand / collapse toggle (only when the loan runs longer than 12 months)
    if (rows.length > 12) {
      const table = tbody.closest('table');
      const wrap = table && table.parentNode ? table.parentNode : null;
      if (wrap && wrap.parentNode) {
        const btn = document.createElement('button');
        btn.id = 'amortiToggle';
        btn.type = 'button';
        btn.style.cssText = 'margin-top:14px;display:inline-block;padding:8px 18px;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:.88rem;font-weight:600;cursor:pointer';
        btn.textContent = 'Show all ' + rows.length + ' months ▾';
        btn.addEventListener('click', function () {
          const hidden = tbody.querySelectorAll('tr[data-amorti-row]');
          const isCollapsed = btn.dataset.expanded !== '1';
          hidden.forEach((tr, idx) => { if (idx >= 12) tr.style.display = isCollapsed ? '' : 'none'; });
          btn.dataset.expanded = isCollapsed ? '1' : '0';
          btn.textContent = isCollapsed ? 'Show less ▴' : 'Show all ' + rows.length + ' months ▾';
        });
        wrap.parentNode.insertBefore(btn, wrap.nextSibling);
        btn.dataset.expanded = '0';
      }
    }
  }
  /* Insert a styled currency <select> before the first .field inside `host`.
     Calls onChange() whenever the user switches currency. */
  function mount(host, onChange) {
    if (!host) return;
    const wrap = document.createElement('div');
    wrap.className = 'field';
    const cur = get();
    wrap.innerHTML = '<label for="dcCurrency">Currency</label>' +
      '<select id="dcCurrency" class="input" style="max-width:280px">' +
      DC_CURR.map(x => '<option value="' + x.c + '"' + (x.c === cur.c ? ' selected' : '') + '>' +
        x.c + ' — ' + x.s + '</option>').join('') +
      '</select>';
    host.insertBefore(wrap, host.firstChild);
    wrap.querySelector('select').addEventListener('change', function () {
      set(this.value);
      if (typeof onChange === 'function') onChange();
    });
  }

  DC.DC_CURR = DC_CURR;
  DC.emiCore = { get, set, fmt, emi, amortize, renderTable, mount };
})();
