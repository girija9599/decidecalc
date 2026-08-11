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
    const show = rows.length <= 13 ? rows : [...rows.slice(0, 12), { ellipsis: true, n: rows.length - 1 }, rows[rows.length - 1]];
    show.forEach(row => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border)';
      if (row.ellipsis) {
        tr.innerHTML = '<td colspan="5" style="padding:4px 10px;text-align:center;color:var(--text-soft);font-style:italic">… months 13–' + row.n + ' …</td>';
      } else {
        tr.innerHTML = '<td style="padding:5px 10px">' + row.i + '</td>' +
          '<td style="padding:5px 10px;text-align:right">' + f(row.pmt) + '</td>' +
          '<td style="padding:5px 10px;text-align:right">' + f(row.principal) + '</td>' +
          '<td style="padding:5px 10px;text-align:right">' + f(row.interest) + '</td>' +
          '<td style="padding:5px 10px;text-align:right">' + f(row.balance) + '</td>';
      }
      tbody.appendChild(tr);
    });
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
