/* ============================================================
   DecideCalc — shared EMI / financing calculator core
   14-currency selector (persisted in localStorage), reducing-
   balance EMI math with final-payment reconciliation, lazy
   amortization table with expand/collapse preview, and shared
   Excel / PDF export (libraries load on demand, Chart.js-style).
   ============================================================ */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};

  /* ---------- Currency configuration (centralized) ---------- */
  const DC_CURR = [
    { c: 'INR', s: '₹',   l: 'en-IN', name: 'Indian Rupee',      d: 2 },
    { c: 'USD', s: '$',   l: 'en-US', name: 'US Dollar',         d: 2 },
    { c: 'EUR', s: '€',   l: 'de-DE', name: 'Euro',              d: 2 },
    { c: 'GBP', s: '£',   l: 'en-GB', name: 'British Pound',     d: 2 },
    { c: 'AED', s: 'د.إ', l: 'en-AE', name: 'UAE Dirham',        d: 2 },
    { c: 'CAD', s: 'C$',  l: 'en-CA', name: 'Canadian Dollar',   d: 2 },
    { c: 'AUD', s: 'A$',  l: 'en-AU', name: 'Australian Dollar', d: 2 },
    { c: 'SGD', s: 'S$',  l: 'en-SG', name: 'Singapore Dollar',  d: 2 },
    { c: 'JPY', s: '¥',   l: 'ja-JP', name: 'Japanese Yen',      d: 0 },
    { c: 'CNY', s: '¥',   l: 'zh-CN', name: 'Chinese Yuan',      d: 2 },
    { c: 'CHF', s: 'CHF', l: 'de-CH', name: 'Swiss Franc',       d: 2 },
    { c: 'NZD', s: 'NZ$', l: 'en-NZ', name: 'New Zealand Dollar',d: 2 },
    { c: 'ZAR', s: 'R',   l: 'en-ZA', name: 'South African Rand',d: 2 },
    { c: 'SAR', s: '﷼',   l: 'ar-SA', name: 'Saudi Riyal',       d: 2 }
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

  /* Intl.NumberFormat-based formatter; never emits NaN/Infinity/negative-zero. */
  function formatCurrency(n, code) {
    const c = code ? (DC_CURR.find(x => x.c === code) || get()) : get();
    if (!isFinite(n)) n = 0;
    if (Object.is(n, -0)) n = 0;
    const v = new Intl.NumberFormat(c.l, { minimumFractionDigits: 0, maximumFractionDigits: c.d }).format(n);
    return c.s + v;
  }
  function fmt(n) { return formatCurrency(n); }

  /* ---------- EMI math ---------- */
  function emi(principal, annualRate, months) {
    const n = Math.max(1, Math.round(months) || 1);
    const r = (annualRate || 0) / 100 / 12;
    if (!(principal > 0)) return { pmt: 0, n, r };
    const pmt = r > 0
      ? principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
      : principal / n;
    return { pmt: isFinite(pmt) ? pmt : 0, n, r };
  }

  /* Amortization schedule with final-payment reconciliation: the last row is
     adjusted so the closing balance is exactly 0 (within float tolerance).
     Never emits negative zero, NaN or Infinity. */
  const TOL = 0.005;
  function amortize(principal, annualRate, months) {
    const { pmt, n, r } = emi(principal, annualRate, months);
    const rows = [];
    if (!(principal > 0) || !isFinite(pmt)) return rows;
    let bal = principal;
    for (let i = 1; i <= n; i++) {
      const open = bal;
      const intr = open * r;
      let prin = pmt - intr;
      let pay = pmt;
      if (i === n || open - prin <= TOL) {
        // final (or clearing) payment: pay off exactly what remains
        prin = open;
        pay = open + intr;
      }
      bal = Math.abs(open - prin) < TOL ? 0 : open - prin;
      rows.push({ i, pmt: pay, principal: prin, interest: intr, balance: bal });
      if (bal <= TOL && i < n) {
        // loan cleared early (e.g. tiny rounding): stop cleanly
        for (let j = i + 1; j <= n; j++) rows.push({ i: j, pmt: 0, principal: 0, interest: 0, balance: 0 });
        break;
      }
    }
    return rows;
  }

  /* ---------- Lazy CDN loader (same pattern as Chart.js) ---------- */
  const _scriptCache = {};
  function loadScript(src, globalCheck) {
    if (globalCheck && window[globalCheck]) return Promise.resolve();
    if (_scriptCache[src]) return _scriptCache[src];
    _scriptCache[src] = new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { delete _scriptCache[src]; reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
    return _scriptCache[src];
  }

  /* ---------- Shared loan context (consumed by exporters) ---------- */
  let context = null; // { name, summary, rows, currencyCode }
  function summarizeFromRows(rows) {
    if (!rows || !rows.length) return null;
    let ti = 0, tp = 0, p = 0;
    rows.forEach(function (r) { ti += r.interest; tp += r.pmt; p += r.principal; });
    return {
      loanAmount: null, downPayment: null, amountFinanced: p, rate: null,
      months: rows.length, emi: rows[0].pmt,
      totalInterest: ti, totalPayable: tp
    };
  }

  /* ---------- Amortization table with 12-month preview + expand/collapse ----------
     Lazy row rendering: only the first 12 rows exist in the DOM initially;
     expanding builds the remainder once. Collapse removes them again.
     Also mounts the shared Download Excel / Download PDF buttons. */
  const PREVIEW = 12;
  function renderTable(tbody, rows, f, opts) {
    opts = opts || {};
    const table = tbody.closest('table');
    const wrap = table ? (table.parentNode) : null;
    const section = tbody.closest('section') || (wrap ? wrap.closest('section') : null);
    tbody.innerHTML = '';

    // wipe any controls from a previous render
    if (section) section.querySelectorAll('.amorti-actions').forEach(function (el) { el.remove(); });

    const name = opts.name || (DC.page && DC.page.slug)
      || (document.title.split('|')[0] || 'Loan').trim();
    const summary = opts.summary || DC.loanSummary || summarizeFromRows(rows);
    context = { name: name, summary: summary, rows: rows, currencyCode: get().c };

    const CELL = 'padding:8px 12px;';
    function rowTr(row) {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border)';
      tr.dataset.amortiRow = '1';
      tr.innerHTML =
        '<td style="' + CELL + 'text-align:left;color:var(--text-soft);font-weight:500">' + row.i + '</td>' +
        '<td style="' + CELL + 'text-align:right;font-weight:600;color:var(--text)">' + f(row.pmt) + '</td>' +
        '<td style="' + CELL + 'text-align:right">' + f(row.principal) + '</td>' +
        '<td style="' + CELL + 'text-align:right">' + f(row.interest) + '</td>' +
        '<td style="' + CELL + 'text-align:right;font-variant-numeric:tabular-nums">' + f(row.balance) + '</td>';
      return tr;
    }

    const head = rows.slice(0, PREVIEW);
    head.forEach(function (row, idx) {
      const tr = rowTr(row);
      if (idx % 2 === 1) tr.style.background = 'color-mix(in srgb, var(--text) 3%, transparent)';
      tbody.appendChild(tr);
    });

    if (rows.length > PREVIEW) {
      let expanded = false;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-ghost btn-sm amorti-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', tbody.id || 'amorti-body');
      btn.textContent = 'Show all ' + rows.length + ' months ↓';
      btn.addEventListener('click', function () {
        expanded = !expanded;
        if (expanded) {
          // build the remaining rows once, then keep them (just toggle visibility)
          if (tbody.querySelectorAll('tr[data-amorti-row]').length < rows.length) {
            rows.slice(PREVIEW).forEach(function (row, idx) {
              const tr = rowTr(row);
              if ((idx + PREVIEW) % 2 === 1) tr.style.background = 'color-mix(in srgb, var(--text) 3%, transparent)';
              tbody.appendChild(tr);
            });
          }
          tbody.querySelectorAll('tr[data-amorti-row]').forEach(function (tr) { tr.style.display = ''; });
          btn.textContent = 'Show first 12 months ↑';
        } else {
          tbody.querySelectorAll('tr[data-amorti-row]').forEach(function (tr, idx) {
            if (idx >= PREVIEW) tr.style.display = 'none';
          });
          btn.textContent = 'Show all ' + rows.length + ' months ↓';
        }
        btn.setAttribute('aria-expanded', String(expanded));
      });

      const toggleWrap = document.createElement('div');
      toggleWrap.className = 'amorti-actions';
      toggleWrap.style.textAlign = 'center';
      toggleWrap.style.marginTop = '14px';
      toggleWrap.appendChild(btn);

      const actions = buildActions();
      const bar = document.createElement('div');
      bar.className = 'amorti-actions';
      bar.style.cssText = 'margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap';
      bar.appendChild(toggleWrap.querySelector('button'));
      actions.forEach(function (b) { bar.appendChild(b); });

      if (section) section.appendChild(bar);
      else if (wrap && wrap.parentNode) wrap.parentNode.insertBefore(bar, wrap.nextSibling);
    } else {
      const actions = buildActions();
      if (actions.length) {
        const bar = document.createElement('div');
        bar.className = 'amorti-actions';
        bar.style.cssText = 'margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap';
        actions.forEach(function (b) { bar.appendChild(b); });
        if (section) section.appendChild(bar);
        else if (wrap && wrap.parentNode) wrap.parentNode.insertBefore(bar, wrap.nextSibling);
      }
    }
    if (section) section.style.display = '';
  }

  function buildActions() {
    const out = [];
    if (!context || !context.rows || !context.rows.length) return out;
    const xl = document.createElement('button');
    xl.type = 'button';
    xl.className = 'btn btn-ghost btn-sm';
    xl.setAttribute('aria-label', 'Download ' + context.name + ' amortization schedule as Excel');
    xl.textContent = 'Download Excel';
    xl.addEventListener('click', function () { exportExcel(); });
    const pdf = document.createElement('button');
    pdf.type = 'button';
    pdf.className = 'btn btn-ghost btn-sm';
    pdf.setAttribute('aria-label', 'Download ' + context.name + ' amortization schedule as PDF');
    pdf.textContent = 'Download PDF';
    pdf.addEventListener('click', function () { exportPDF(); });
    out.push(xl, pdf);
    return out;
  }

  function dateStamp() {
    const d = new Date();
    const p = function (x) { return (x < 10 ? '0' : '') + x; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function safeName(name) {
    return String(name).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'Loan';
  }

  /* ---------- Excel export (ExcelJS, loaded on demand) ---------- */
  const EXCELJS = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
  function exportExcel() {
    if (!context) return;
    const ctx = context;
    xlBtnBusy(true);
    loadScript(EXCELJS, 'ExcelJS').then(function () {
      const wb = new ExcelJS.Workbook();
      wb.creator = 'DecideCalc';
      const cur = DC_CURR.find(function (x) { return x.c === ctx.currencyCode; }) || get();
      const S = ctx.summary || {};
      const money = function (v) {
        if (v == null || !isFinite(v)) return '';
        return cur.s + new Intl.NumberFormat(cur.l, { minimumFractionDigits: 0, maximumFractionDigits: cur.d }).format(v);
      };

      /* Sheet 1 — Loan Summary */
      const ws = wb.addWorksheet('Loan Summary', { views: [{ showGridLines: false }] });
      ws.columns = [{ width: 26 }, { width: 30 }];
      ws.getCell('A1').value = 'DecideCalc';
      ws.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF0F1533' } };
      ws.getCell('A2').value = 'Calculate Before You Decide — www.decidecalc.com';
      ws.getCell('A2').font = { color: { argb: 'FF7884A0' }, size: 10 };
      ws.getCell('A4').value = ctx.name;
      ws.getCell('A4').font = { bold: true, size: 13 };
      const rows1 = [
        ['Calculation Date', new Date().toLocaleDateString(cur.l)],
        ['Currency', cur.c + ' (' + cur.name + ')'],
        ['Loan Amount', S.loanAmount != null ? money(S.loanAmount) : (S.amountFinanced != null ? money(S.amountFinanced) : '')],
        ['Down Payment', S.downPayment != null ? money(S.downPayment) : '—'],
        ['Amount Financed', S.amountFinanced != null ? money(S.amountFinanced) : ''],
        ['Interest Rate', S.rate != null ? S.rate.toFixed(2) + '% per year' : ''],
        ['Loan Term', S.months != null ? S.months + ' months' : ''],
        ['Monthly EMI', S.emi != null ? money(S.emi) : ''],
        ['Total Interest', S.totalInterest != null ? money(S.totalInterest) : ''],
        ['Total Payable', S.totalPayable != null ? money(S.totalPayable) : '']
      ];
      rows1.forEach(function (pair, idx) {
        const rNum = 6 + idx;
        ws.getCell('A' + rNum).value = pair[0];
        ws.getCell('A' + rNum).font = { bold: true };
        ws.getCell('B' + rNum).value = pair[1];
        ws.getCell('A' + rNum).border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F2' } } };
        ws.getCell('B' + rNum).border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F2' } } };
      });
      const emiRow = 6 + rows1.findIndex(function (p) { return p[0] === 'Monthly EMI'; });
      ws.getCell('A' + emiRow).font = { bold: true, color: { argb: 'FF1B3A6B' } };
      ws.getCell('B' + emiRow).font = { bold: true, color: { argb: 'FF1B3A6B' } };

      /* Sheet 2 — Amortization Schedule */
      const ws2 = wb.addWorksheet('Amortization Schedule');
      ws2.columns = [
        { header: 'Month', key: 'm', width: 10 },
        { header: 'Payment', key: 'pmt', width: 16 },
        { header: 'Principal', key: 'prin', width: 16 },
        { header: 'Interest', key: 'intr', width: 16 },
        { header: 'Balance', key: 'bal', width: 18 }
      ];
      ws2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A6B' } };
      ws2.getRow(1).height = 22;
      ctx.rows.forEach(function (r) {
        ws2.addRow({ m: r.i, pmt: money(r.pmt), prin: money(r.principal), intr: money(r.interest), bal: money(r.balance) });
      });
      // totals row
      let ti = 0, tp = 0, tpn = 0;
      ctx.rows.forEach(function (r) { ti += r.interest; tp += r.pmt; tpn += r.principal; });
      const tot = ws2.addRow({ m: 'Total', pmt: money(tp), prin: money(tpn), intr: money(ti), bal: '' });
      tot.font = { bold: true };
      // borders for data area
      for (let rn = 2; rn <= ws2.rowCount; rn++) {
        for (let cn = 1; cn <= 5; cn++) {
          ws2.getRow(rn).getCell(cn).border = {
            top: { style: 'hair', color: { argb: 'FFE2E8F2' } },
            left: { style: 'hair', color: { argb: 'FFE2E8F2' } },
            bottom: { style: 'hair', color: { argb: 'FFE2E8F2' } },
            right: { style: 'hair', color: { argb: 'FFE2E8F2' } }
          };
        }
      }
      ws2.views = [{ state: 'frozen', ySplit: 1 }];
      ws2.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 5 } };

      wb.xlsx.writeBuffer().then(function (buf) {
        const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        triggerDownload(blob, 'DecideCalc-' + safeName(ctx.name) + '-Amortization-' + dateStamp() + '.xlsx');
        xlBtnBusy(false);
      }).catch(function () { xlBtnBusy(false); });
    }).catch(function () { xlBtnBusy(false); });
  }

  /* ---------- PDF export (jsPDF + autotable, loaded on demand) ---------- */
  const JSPDF = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';
  const AUTOTABLE = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js';
  function exportPDF() {
    if (!context) return;
    const ctx = context;
    loadScript(JSPDF, 'jspdf').then(function () {
      return loadScript(AUTOTABLE);
    }).then(function () {
      const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
      if (!jsPDFCtor) throw new Error('jsPDF unavailable');
      const doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });
      const cur = DC_CURR.find(function (x) { return x.c === ctx.currencyCode; }) || get();
      const S = ctx.summary || {};
      const money = function (v) {
        if (v == null || !isFinite(v)) return '—';
        return cur.s + new Intl.NumberFormat(cur.l, { minimumFractionDigits: 0, maximumFractionDigits: cur.d }).format(v);
      };
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const pageW = W - 72;

      function chrome() {
        const pn = doc.internal.getNumberOfPages();
        doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(15, 21, 51);
        doc.text('DECIDECALC', 36, 42);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(120, 132, 160);
        doc.text('Calculate Before You Decide  ·  www.decidecalc.com', 36, 54);
        doc.setDrawColor(226, 232, 242); doc.line(36, 62, W - 36, 62);
        doc.setFontSize(8.5);
        doc.text('Page ' + pn + ' of {total}', W - 36, H - 22, { align: 'right' });
        doc.text('Generated ' + new Date().toLocaleDateString(cur.l) + ' · Currency: ' + cur.c, 36, H - 22);
      }

      // page 1 body
      let y = 88;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(15, 21, 51);
      doc.text(ctx.name, 36, y); y += 24;
      doc.setFontSize(11); doc.setTextColor(75, 88, 117);
      doc.text('Loan Summary', 36, y); y += 18;

      const sumRows = [
        ['Calculation Date', new Date().toLocaleDateString(cur.l)],
        ['Currency', cur.c + ' (' + cur.name + ')']
      ];
      if (S.loanAmount != null) sumRows.push(['Loan Amount', money(S.loanAmount)]);
      if (S.downPayment != null) sumRows.push(['Down Payment', money(S.downPayment)]);
      if (S.amountFinanced != null) sumRows.push(['Amount Financed', money(S.amountFinanced)]);
      if (S.rate != null) sumRows.push(['Interest Rate', S.rate.toFixed(2) + '% per year']);
      if (S.months != null) sumRows.push(['Loan Term', S.months + ' months']);

      doc.autoTable({
        startY: y,
        margin: { left: 36, right: 36 },
        body: sumRows,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 5, lineColor: [226, 232, 242], lineWidth: 0.5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 140, textColor: [15, 21, 51] } },
        didDrawPage: chrome
      });
      y = doc.lastAutoTable.finalY + 26;

      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(27, 58, 107);
      doc.text('Monthly EMI: ' + money(S.emi), 36, y); y += 14;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(75, 88, 117);
      doc.text('Total Interest ' + money(S.totalInterest) + '   ·   Total Payable ' + money(S.totalPayable), 36, y); y += 24;

      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(15, 21, 51);
      doc.text('Amortization Schedule', 36, y); y += 6;

      const body = ctx.rows.map(function (r) {
        return [r.i, money(r.pmt), money(r.principal), money(r.interest), money(r.balance)];
      });
      doc.autoTable({
        startY: y + 8,
        margin: { left: 36, right: 36, top: 70 },
        head: [['Month', 'Payment', 'Principal', 'Interest', 'Balance']],
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [27, 58, 107], fontSize: 9, halign: 'right' },
        styles: { fontSize: 8.5, cellPadding: 4, lineColor: [226, 232, 242], lineWidth: 0.5 },
        columnStyles: { 0: { halign: 'left', cellWidth: 50 }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
        didParseCell: function (d) { if (d.section === 'head' && d.column.index === 0) d.cell.styles.halign = 'left'; },
        didDrawPage: chrome
      });

      const total = doc.internal.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        // stamp real total pages in the pre-rendered placeholder
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(120, 132, 160);
        // overwrite placeholder area: draw a white box then re-write footer
        doc.setFillColor(255, 255, 255);
        doc.rect(W - 120, H - 32, 90, 14, 'F');
        doc.text('Page ' + p + ' of ' + total, W - 36, H - 22, { align: 'right' });
      }

      doc.save('DecideCalc-' + safeName(ctx.name) + '-Amortization-' + dateStamp() + '.pdf');
    }).catch(function (e) {
      if (DC.toast) DC.toast('PDF export failed — please try again', 'error');
    });
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { a.remove(); URL.revokeObjectURL(url); }, 800);
  }

  function xlBtnBusy(busy) {
    document.querySelectorAll('.amorti-actions .btn').forEach(function (b) {
      if (b.textContent.indexOf('Download Excel') === 0) b.textContent = busy ? 'Preparing…' : 'Download Excel';
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
      '<select id="dcCurrency" class="input" style="max-width:280px" aria-label="Select display currency">' +
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
  DC.emiCore = {
    get, set, fmt, formatCurrency, emi, amortize, renderTable, mount,
    loadScript, exportExcel, exportPDF
  };
})();
