/* ============================================================
   DecideCalc — shared EMI / financing calculator core
   14-currency selector (persisted in localStorage), reducing-
   balance EMI math with final-payment reconciliation, lazy
   amortization table with expand/collapse preview, and shared
   branded Excel / PDF exports (libraries + Unicode font load
   on demand, Chart.js-style).
   ============================================================ */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};

  /* ---------- Currency configuration (centralized) ---------- */
  /* All display currencies round to whole units (d: 0) — decimals made the
     mobile amortization table and score cards hard to read. */
  const DC_CURR = [
    { c: 'INR', s: '₹',   l: 'en-IN', name: 'Indian Rupee',      d: 0 },
    { c: 'USD', s: '$',   l: 'en-US', name: 'US Dollar',         d: 0 },
    { c: 'EUR', s: '€',   l: 'de-DE', name: 'Euro',              d: 0 },
    { c: 'GBP', s: '£',   l: 'en-GB', name: 'British Pound',     d: 0 },
    { c: 'AED', s: 'د.إ', l: 'en-AE', name: 'UAE Dirham',        d: 0 },
    { c: 'CAD', s: 'C$',  l: 'en-CA', name: 'Canadian Dollar',   d: 0 },
    { c: 'AUD', s: 'A$',  l: 'en-AU', name: 'Australian Dollar', d: 0 },
    { c: 'SGD', s: 'S$',  l: 'en-SG', name: 'Singapore Dollar',  d: 0 },
    { c: 'JPY', s: '¥',   l: 'ja-JP', name: 'Japanese Yen',      d: 0 },
    { c: 'CNY', s: '¥',   l: 'zh-CN', name: 'Chinese Yuan',      d: 0 },
    { c: 'CHF', s: 'CHF', l: 'de-CH', name: 'Swiss Franc',       d: 0 },
    { c: 'NZD', s: 'NZ$', l: 'en-NZ', name: 'New Zealand Dollar',d: 0 },
    { c: 'ZAR', s: 'R',   l: 'en-ZA', name: 'South African Rand',d: 0 },
    { c: 'SAR', s: '﷼',   l: 'ar-SA', name: 'Saudi Riyal',       d: 0 },
    { c: 'MXN', s: 'Mex$', l: 'es-MX', name: 'Mexican Peso',     d: 0 }
  ];
  const KEY = 'dc_currency';
  const BRAND = { primary: '1B3A6B', accent: '00C2A8', heading: '0F1533', muted: '7884A0', stripe: 'F5F7FA', border: 'E2E8F2' };

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
        prin = open;
        pay = open + intr;
      }
      bal = Math.abs(open - prin) < TOL ? 0 : open - prin;
      rows.push({ i, pmt: pay, principal: prin, interest: intr, balance: bal });
      if (bal <= TOL && i < n) {
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

  /* Download status per format — 'idle' | 'busy' | 'done'.
     Reset to idle whenever the calculation re-runs (any input change or a
     new calculation), so downloads are clearly available for fresh results. */
  const _dl = { excel: 'idle', pdf: 'idle' };

  function applyState(btn, kind) {
    const st = _dl[kind];
    btn.classList.toggle('dc-done', st === 'done');
    if (st === 'busy') btn.textContent = kind === 'excel' ? 'Preparing Excel…' : 'Preparing PDF…';
    else if (st === 'done') {
      btn.textContent = 'Done ✓';
      btn.style.color = '#15803D';
      btn.style.borderColor = '#86EFAC';
    } else {
      btn.textContent = kind === 'excel' ? 'Download Excel' : 'Download PDF';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  }
  function setExportState(kind, state) {
    _dl[kind] = state;
    document.querySelectorAll('.amorti-actions button[data-dc-export="' + kind + '"]').forEach(function (b) {
      applyState(b, kind);
    });
  }
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

  /* Where the schedule card lives.
     'below' (default) = full-width card directly below the calculator
     columns, exactly where it was originally — chart stays in the results
     panel. Change to 'panel' to park it inside the results panel instead. */
  const SCHEDULE_PLACEMENT = 'below';

  /* ---------- Amortization table with 12-month preview + expand/collapse ----------
     Lazy row rendering: only the first 12 rows exist in the DOM initially.
     The Download Excel / Download PDF buttons sit directly ABOVE the
     "Amortization schedule" heading so they are immediately visible. */
  const PREVIEW = 12;
  function renderTable(tbody, rows, f, opts) {
    opts = opts || {};
    const table = tbody.closest('table');
    const wrap = table ? (table.parentNode) : null;
    let section = tbody.closest('section') || (wrap ? wrap.closest('section') : null);
    tbody.innerHTML = '';

    if (section) section.querySelectorAll('.amorti-actions').forEach(function (el) { el.remove(); });

    const name = opts.name || (DC.page && DC.page.slug)
      || (document.title.split('|')[0] || 'Loan').trim();
    const summary = opts.summary || DC.loanSummary || summarizeFromRows(rows);
    context = { name: name, summary: summary, rows: rows, currencyCode: get().c };

    /* The calculation just re-ran (any input change or a new calculation) —
       previous download completions no longer describe this result. */
    _dl.excel = 'idle';
    _dl.pdf = 'idle';

    /* Placement: by default the schedule stays in its original full-width
       spot below the calculator layout. 'panel' mode relocates it into the
       results panel before the chart (defensive: insert relative to the
       chart's actual parent, since .chart-wrap is not always a direct child
       of .result-panel). */
    if (section && SCHEDULE_PLACEMENT === 'panel') {
      const panel = document.querySelector('.result-panel');
      const chartWrap = panel ? panel.querySelector('.chart-wrap') : null;
      if (panel && chartWrap) {
        const anchorParent = chartWrap.parentNode;
        if (section.parentNode !== anchorParent || section.nextElementSibling !== chartWrap) {
          section.classList.remove('mt-4');
          section.style.marginTop = '14px';
          anchorParent.insertBefore(section, chartWrap);
        }
      }
    }

    const CELL = 'padding:8px 12px;white-space:nowrap;';
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

    /* Mobile: never squeeze the columns into unreadable wrapped fragments —
       the table keeps a readable minimum width and scrolls horizontally in
       its overflow-x wrapper instead. */
    if (table) {
      table.style.minWidth = '560px';
      table.querySelectorAll('th').forEach(function (th) { th.style.whiteSpace = 'nowrap'; });
    }

    rows.slice(0, PREVIEW).forEach(function (row, idx) {
      const tr = rowTr(row);
      if (idx % 2 === 1) tr.style.background = 'color-mix(in srgb, var(--text) 3%, transparent)';
      tbody.appendChild(tr);
    });

    const toggle = buildToggle(tbody, rows, rowTr);
    const actions = buildActions();

    /* Export buttons go ABOVE the heading; the expand toggle stays under the table. */
    if (section) {
      if (actions.length) {
        const bar = document.createElement('div');
        bar.className = 'amorti-actions';
        bar.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;align-items:center';
        bar.setAttribute('aria-live', 'polite');
        actions.forEach(function (b) { bar.appendChild(b); });
        section.insertBefore(bar, section.firstChild);
      }
      section.style.display = '';
    }

    if (toggle) {
      const tw = document.createElement('div');
      tw.className = 'amorti-actions';
      tw.style.cssText = 'margin-top:14px;display:flex;justify-content:center';
      tw.appendChild(toggle);
      if (wrap && wrap.parentNode) wrap.parentNode.insertBefore(tw, wrap.nextSibling);
      else if (section) section.appendChild(tw);
    }
  }

  function buildToggle(tbody, rows, rowTr) {
    if (rows.length <= PREVIEW) return null;
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
    return btn;
  }

  function buildActions() {
    const out = [];
    if (!context || !context.rows || !context.rows.length) return out;
    const xl = document.createElement('button');
    xl.type = 'button';
    xl.className = 'btn btn-accent btn-sm';
    xl.setAttribute('data-dc-export', 'excel');
    xl.setAttribute('aria-label', 'Download ' + context.name + ' amortization schedule as Excel');
    xl.textContent = 'Download Excel';
    xl.addEventListener('click', function () { exportExcel(); });
    const pdf = document.createElement('button');
    pdf.type = 'button';
    pdf.className = 'btn btn-ghost btn-sm';
    pdf.setAttribute('data-dc-export', 'pdf');
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
  function dateDisplay() {
    const d = new Date();
    const p = function (x) { return (x < 10 ? '0' : '') + x; };
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  function safeName(name) {
    return String(name).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'Loan';
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

  /* ---------- Site logo as PNG data URL (canvas-rasterized SVG, cached) ---------- */
  let _logoDataUrl = null;
  function getLogoDataUrl() {
    if (_logoDataUrl) return Promise.resolve(_logoDataUrl);
    return new Promise(function (resolve) {
      const img = new Image();
      img.onload = function () {
        try {
          const size = 256;
          const cv = document.createElement('canvas');
          cv.width = size; cv.height = size;
          cv.getContext('2d').drawImage(img, 0, 0, size, size);
          _logoDataUrl = cv.toDataURL('image/png');
          resolve(_logoDataUrl);
        } catch (e) { fetchPngFallback(resolve); }
      };
      img.onerror = function () { fetchPngFallback(resolve); };
      img.src = '/assets/img/decidecalc-mark.svg';
    });
  }
  function fetchPngFallback(resolve) {
    // committed raster version of the brand mark — same asset family as the header
    fetch('/assets/img/apple-touch-icon.png').then(function (r) { return r.blob(); }).then(function (blob) {
      const fr = new FileReader();
      fr.onload = function () { _logoDataUrl = fr.result; resolve(_logoDataUrl); };
      fr.onerror = function () { resolve(null); };
      fr.readAsDataURL(blob);
    }).catch(function () { resolve(null); });
  }

  /* ---------- Unicode font (₹ glyph) for the PDF, fetched on demand ---------- */
  const FONT_URLS = [
    'https://cdn.jsdelivr.net/npm/notosans-fontface@1.2.3/fonts/NotoSans-Regular.ttf',
    'https://unpkg.com/notosans-fontface@1.2.3/fonts/NotoSans-Regular.ttf',
    'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf'
  ];
  let _fontB64 = null;
  function loadRupeeFont() {
    if (_fontB64) return Promise.resolve(_fontB64);
    function attempt(i) {
      if (i >= FONT_URLS.length) return Promise.resolve(null);
      return fetch(FONT_URLS[i]).then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.arrayBuffer();
      }).then(function (buf) {
        const bytes = new Uint8Array(buf);
        let bin = '';
        for (let k = 0; k < bytes.length; k += 0x8000) {
          bin += String.fromCharCode.apply(null, bytes.subarray(k, k + 0x8000));
        }
        _fontB64 = btoa(bin);
        return _fontB64;
      }).catch(function () { return attempt(i + 1); });
    }
    return attempt(0);
  }

  /* PDF-safe currency text: with Noto Sans embedded, ₹/د.إ/﷼ render fine.
     If the font could not be fetched, fall back to ASCII-safe codes so the
     PDF never shows broken glyphs. */
  function pdfSymbol(cur, fontOk) {
    if (fontOk) return cur.s;
    if (cur.c === 'INR') return 'Rs ';
    if (cur.c === 'AED') return 'AED ';
    if (cur.c === 'SAR') return 'SAR ';
    return cur.s; // $ € £ ¥ are safe in the standard PDF fonts
  }

  /* ============================================================
     EXCEL EXPORT — branded two-sheet workbook (ExcelJS)
     Sheet 1 "Loan Summary": logo + brand block + styled summary
     Sheet 2 "Amortization Schedule": branding rows, then every
     month as real numeric cells with currency formats, striped
     rows, borders, frozen header, autofilter, landscape print.
     ============================================================ */
  const EXCELJS = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';

  function inrNumFmt(symbol, decimals) {
    if (symbol.length === 1 && /[\u20B9]/.test(symbol)) {
      // true lakh/crore grouping: 1,00,00,000.00
      const zeros = decimals ? '.' + '0'.repeat(decimals) : '';
      return '[>=10000000]"' + symbol + '"##\\,##\\,##\\,##0' + zeros + ';[>=100000]"' + symbol + '"##\\,##\\,##0' + zeros + ';"' + symbol + '"##,##0' + zeros;
    }
    const zeros = decimals ? '.' + '0'.repeat(decimals) : '';
    return '"' + symbol + '"#,##0' + zeros;
  }

  function buildWorkbook() {
    const ctx = context;
    const cur = DC_CURR.find(function (x) { return x.c === ctx.currencyCode; }) || get();
    const S = ctx.summary || {};
    const wb = new ExcelJS.Workbook();
    wb.creator = 'DecideCalc';
    wb.created = new Date();

    return getLogoDataUrl().then(function (logo) {
      let logoId = null;
      if (logo) logoId = wb.addImage({ base64: logo, extension: 'png' });

      const numFmt = inrNumFmt(cur.s, cur.d);
      const moneyCell = function (cell, v) {
        if (v != null && isFinite(v)) { cell.value = Math.round(v * 100) / 100; cell.numFmt = numFmt; }
        else cell.value = '—';
        cell.alignment = { horizontal: 'right' };
      };

      /* ---------- Sheet 1: Loan Summary ---------- */
      const ws = wb.addWorksheet('Loan Summary', {
        views: [{ showGridLines: false }],
        pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6 } }
      });
      ws.columns = [{ width: 3 }, { width: 24 }, { width: 26 }, { width: 3 }];

      if (logoId != null) ws.addImage(logoId, { tl: { col: 0.3, row: 0.3 }, ext: { width: 52, height: 52 } });
      ws.getCell('B2').value = 'DecideCalc';
      ws.getCell('B2').font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF0F1533' } };
      ws.getCell('B3').value = 'Calculate Before You Decide';
      ws.getCell('B3').font = { size: 10, color: { argb: 'FF7884A0' } };
      ws.getCell('B4').value = 'www.decidecalc.com';
      ws.getCell('B4').font = { size: 10, color: { argb: 'FF1B3A6B' }, underline: true };
      ws.getRow(5).height = 8;

      ws.getCell('B6').value = ctx.name;
      ws.getCell('B6').font = { size: 14, bold: true, color: { argb: 'FF1B3A6B' } };
      ws.getCell('B7').value = 'Amortization Report';
      ws.getCell('B7').font = { size: 11, bold: true, color: { argb: 'FF0F1533' } };

      const metaRows = [
        ['Calculation Date', dateDisplay()],
        ['Currency', cur.c + ' (' + cur.name + ')']
      ];
      metaRows.forEach(function (pair, idx) {
        const r = 9 + idx;
        ws.getCell('B' + r).value = pair[0];
        ws.getCell('B' + r).font = { size: 10, color: { argb: 'FF7884A0' } };
        ws.getCell('C' + r).value = pair[1];
        ws.getCell('C' + r).font = { size: 10, bold: true };
        ws.getCell('C' + r).alignment = { horizontal: 'right' };
      });

      ws.getCell('B12').value = 'LOAN SUMMARY';
      ws.getCell('B12').font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getCell('B12').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A6B' } };
      ws.getCell('C12').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A6B' } };
      ws.getCell('B12').alignment = { vertical: 'middle' };
      ws.getRow(12).height = 20;

      const sumRows = [];
      if (S.loanAmount != null) sumRows.push(['Loan Amount', S.loanAmount]);
      if (S.downPayment != null) sumRows.push(['Down Payment', S.downPayment]);
      sumRows.push(['Interest Rate (% per year)', S.rate != null ? S.rate : null]);
      sumRows.push(['Loan Term (months)', S.months != null ? S.months : null]);
      sumRows.forEach(function (pair, idx) {
        const r = 13 + idx;
        const b = ws.getCell('B' + r), c = ws.getCell('C' + r);
        b.value = pair[0]; b.font = { size: 10 };
        b.border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F2' } } };
        c.border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F2' } } };
        if (pair[0].indexOf('Rate') === 0) { c.value = pair[1]; c.numFmt = '0.00"%"'; c.alignment = { horizontal: 'right' }; }
        else if (pair[0].indexOf('Term') === 0) { c.value = pair[1]; c.alignment = { horizontal: 'right' }; }
        else moneyCell(c, pair[1]);
        if (idx % 2 === 1) {
          b.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F7FA' } };
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F7FA' } };
        }
      });

      const hlRows = [
        ['Monthly EMI', S.emi],
        ['Amount Financed', S.amountFinanced],
        ['Total Interest', S.totalInterest],
        ['Total Payable', S.totalPayable]
      ];
      hlRows.forEach(function (pair, idx) {
        const r = 19 + idx;
        const b = ws.getCell('B' + r), c = ws.getCell('C' + r);
        b.value = pair[0];
        c.value = pair[1] != null ? Math.round(pair[1] * 100) / 100 : '—';
        c.numFmt = numFmt;
        const fill = idx === 0 ? 'FF1B3A6B' : (idx % 2 ? 'FFEFF3F9' : 'FFFFFFFF');
        b.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
        b.font = { size: 11, bold: true, color: { argb: 'FF0F1533' } };
        c.font = { size: 11, bold: true, color: { argb: 'FF0F1533' } };
        c.alignment = { horizontal: 'right' };
        b.border = c.border = {
          top: { style: 'thin', color: { argb: 'FFD7DFEC' } },
          left: { style: 'thin', color: { argb: 'FFD7DFEC' } },
          bottom: { style: 'thin', color: { argb: 'FFD7DFEC' } },
          right: { style: 'thin', color: { argb: 'FFD7DFEC' } }
        };
        ws.getRow(r).height = 20;
      });
      ws.getCell('B24').value = 'Generated ' + dateDisplay() + ' · DecideCalc — www.decidecalc.com';
      ws.getCell('B24').font = { size: 8.5, color: { argb: 'FF7884A0' } };

      /* ---------- Sheet 2: Amortization Schedule (every month) ---------- */
      const ws2 = wb.addWorksheet('Amortization Schedule', {
        views: [{ state: 'frozen', ySplit: 6, topLeftCell: 'A7', showGridLines: false }],
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '6:6', margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5 } }
      });
      ws2.columns = [
        { key: 'm', width: 9 }, { key: 'pmt', width: 16 }, { key: 'prin', width: 16 },
        { key: 'intr', width: 16 }, { key: 'bal', width: 18 }
      ];
      // branding block
      ws2.getCell('A1').value = 'DecideCalc';
      ws2.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FF0F1533' } };
      ws2.getCell('A2').value = 'Calculate Before You Decide · www.decidecalc.com';
      ws2.getCell('A2').font = { size: 9, color: { argb: 'FF7884A0' } };
      ws2.getCell('A3').value = ctx.name + ' — Amortization Schedule  ·  ' + dateDisplay() + '  ·  ' + cur.c;
      ws2.getCell('A3').font = { size: 10, bold: true, color: { argb: 'FF1B3A6B' } };
      ws2.getRow(4).height = 6;

      const HEAD = 5; // header row (branding sits in rows 1–3, frozen with it)
      const head = ['Month', 'Payment', 'Principal', 'Interest', 'Balance'];
      head.forEach(function (h, idx) {
        const c = ws2.getRow(HEAD).getCell(idx + 1);
        c.value = h;
        c.font = { size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A6B' } };
        c.alignment = { horizontal: idx === 0 ? 'left' : 'right', vertical: 'middle' };
        c.border = {
          top: { style: 'thin', color: { argb: 'FF1B3A6B' } },
          left: { style: 'thin', color: { argb: 'FF1B3A6B' } },
          bottom: { style: 'thin', color: { argb: 'FF1B3A6B' } },
          right: { style: 'thin', color: { argb: 'FF1B3A6B' } }
        };
      });
      ws2.getRow(HEAD).height = 22;

      ctx.rows.forEach(function (r, idx) {
        const row = ws2.getRow(HEAD + 1 + idx);
        const vals = [r.i, r.pmt, r.principal, r.interest, r.balance];
        vals.forEach(function (v, cIdx) {
          const cell = row.getCell(cIdx + 1);
          if (cIdx === 0) { cell.value = v; cell.alignment = { horizontal: 'left' }; }
          else { cell.value = Math.round(v * 100) / 100; cell.numFmt = numFmt; cell.alignment = { horizontal: 'right' }; }
          cell.border = {
            top: { style: 'hair', color: { argb: 'FFE2E8F2' } },
            left: { style: 'hair', color: { argb: 'FFE2E8F2' } },
            bottom: { style: 'hair', color: { argb: 'FFE2E8F2' } },
            right: { style: 'hair', color: { argb: 'FFE2E8F2' } }
          };
          if (idx % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F7FA' } };
        });
      });

      let ti = 0, tp = 0, tpn = 0;
      ctx.rows.forEach(function (r) { ti += r.interest; tp += r.pmt; tpn += r.principal; });
      const totRow = ws2.getRow(HEAD + 1 + ctx.rows.length);
      ['Total', tp, tpn, ti, ''].forEach(function (v, cIdx) {
        const cell = totRow.getCell(cIdx + 1);
        cell.value = cIdx === 0 ? 'Total' : (v === '' ? '' : Math.round(v * 100) / 100);
        if (cIdx > 0 && v !== '') cell.numFmt = numFmt;
        cell.font = { bold: true };
        cell.alignment = { horizontal: cIdx === 0 ? 'left' : 'right' };
        cell.border = { top: { style: 'double', color: { argb: 'FF1B3A6B' } } };
      });

      ws2.autoFilter = { from: { row: HEAD, column: 1 }, to: { row: HEAD, column: 5 } };
      return wb;
    });
  }

  function exportExcel() {
    if (!context || !context.rows || !context.rows.length) {
      if (DC.toast) DC.toast('Please calculate your result first.', 'error');
      return Promise.resolve(null);
    }
    setExportState('excel', 'busy');
    return loadScript(EXCELJS, 'ExcelJS').then(function () {
      return buildWorkbook();
    }).then(function (wb) {
      return wb.xlsx.writeBuffer().then(function (buf) {
        const filename = 'DecideCalc-' + safeName(context.name) + '-Amortization-' + dateStamp() + '.xlsx';
        triggerDownload(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
        setExportState('excel', 'done');
        return { filename: filename, workbook: wb };
      });
    }).catch(function () {
      setExportState('excel', 'idle');
      if (DC.toast) DC.toast('Unable to generate Excel file. Please try again.', 'error');
      return null;
    });
  }

  /* ============================================================
     PDF EXPORT — branded financial report (jsPDF + autotable)
     Noto Sans embedded so ₹ renders correctly; header band with
     the real site logo; putTotalPages for true page counts.
     ============================================================ */
  const JSPDF = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';
  const AUTOTABLE = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js';
  const TOTAL_PAGES_EXP = '{dc_total_pages}';

  function exportPDF() {
    if (!context || !context.rows || !context.rows.length) {
      if (DC.toast) DC.toast('Please calculate your result first.', 'error');
      return Promise.resolve(null);
    }
    setExportState('pdf', 'busy');
    return loadScript(JSPDF, 'jspdf').then(function () {
      return loadScript(AUTOTABLE);
    }).then(function () {
      return Promise.all([loadRupeeFont(), getLogoDataUrl()]);
    }).then(function (assets) {
      const fontB64 = assets[0];
      const logoUrl = assets[1];
      const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
      if (!jsPDFCtor) throw new Error('jsPDF unavailable');
      const doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });

      const fontOk = !!fontB64;
      window.__dcFontOk = fontOk; // debug/QA: was the Unicode font embedded?
      if (fontOk) {
        doc.addFileToVFS('NotoSans-Regular.ttf', fontB64);
        doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
        doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'bold');
        doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'italic');
      }
      const FONT = fontOk ? 'NotoSans' : 'helvetica';
      const cur = DC_CURR.find(function (x) { return x.c === context.currencyCode; }) || get();
      const sym = pdfSymbol(cur, fontOk);
      const money = function (v) {
        if (v == null || !isFinite(v)) return '—';
        return sym + new Intl.NumberFormat(cur.l, { minimumFractionDigits: 0, maximumFractionDigits: cur.d }).format(v);
      };
      const S = context.summary || {};
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const BAND = 62;

      function chrome() {
        // brand header band with the real site logo
        doc.setFillColor(27, 58, 107);
        doc.rect(0, 0, W, BAND, 'F');
        if (logoUrl) {
          try { doc.addImage(logoUrl, 'PNG', 18, 11, 40, 40); } catch (e) { /* keep text-only band */ }
        }
        doc.setTextColor(255, 255, 255);
        doc.setFont(FONT, 'bold'); doc.setFontSize(15);
        doc.text('DecideCalc', logoUrl ? 68 : 24, 27);
        doc.setFont(FONT, 'normal'); doc.setFontSize(8.5);
        doc.text('Calculate Before You Decide  ·  www.decidecalc.com', logoUrl ? 68 : 24, 41);
        doc.setFont(FONT, 'bold'); doc.setFontSize(9.5);
        doc.text('Amortization Report', W - 24, 27, { align: 'right' });
        doc.setFont(FONT, 'normal'); doc.setFontSize(8.5);
        doc.text('Generated: ' + dateDisplay(), W - 24, 41, { align: 'right' });
        // thin accent rule under the band
        doc.setFillColor(0, 194, 168);
        doc.rect(0, BAND, W, 3, 'F');

        // footer
        doc.setDrawColor(226, 232, 242);
        doc.line(24, H - 40, W - 24, H - 40);
        doc.setFont(FONT, 'normal'); doc.setFontSize(8); doc.setTextColor(120, 132, 160);
        doc.text('DecideCalc · Calculate Before You Decide · www.decidecalc.com', 24, H - 26);
        doc.text('Generated: ' + dateDisplay() + '  ·  Currency: ' + cur.c + ' (' + cur.name + ')', 24, H - 15);
        doc.text('Page ' + doc.internal.getNumberOfPages() + ' of ' + TOTAL_PAGES_EXP, W - 24, H - 26, { align: 'right' });
        doc.setTextColor(15, 21, 51);
      }

      chrome();
      let y = BAND + 24;
      doc.setFont(FONT, 'bold'); doc.setFontSize(15); doc.setTextColor(15, 21, 51);
      doc.text(context.name, 24, y); y += 22;

      const sumBody = [['Calculation Date', dateDisplay()], ['Currency', cur.c + ' (' + cur.name + ')']];
      if (S.loanAmount != null) sumBody.push(['Loan Amount', money(S.loanAmount)]);
      if (S.downPayment != null) sumBody.push(['Down Payment', money(S.downPayment)]);
      if (S.rate != null) sumBody.push(['Interest Rate', S.rate.toFixed(2) + '% per year']);
      if (S.months != null) sumBody.push(['Loan Term', S.months + ' months']);

      doc.autoTable({
        startY: y,
        margin: { left: 24, right: 24 },
        body: sumBody,
        theme: 'grid',
        styles: { font: FONT, fontSize: 9, cellPadding: 5, lineColor: [226, 232, 242], lineWidth: 0.5 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 150, textColor: [15, 21, 51] } }
      });
      y = doc.lastAutoTable.finalY + 22;

      // Monthly EMI + Amount Financed + Total Interest + Total Payable highlight block
      doc.setFillColor(239, 243, 249);
      doc.roundedRect(24, y, W - 48, 52, 6, 6, 'F');
      doc.setFillColor(27, 58, 107);
      doc.rect(24, y, 4, 52, 'F');
      doc.setFont(FONT, 'normal'); doc.setFontSize(8.5); doc.setTextColor(120, 132, 160);
      doc.text('MONTHLY EMI', 40, y + 16);
      doc.text('AMOUNT FINANCED', 168, y + 16);
      doc.text('TOTAL INTEREST', 296, y + 16);
      doc.text('TOTAL PAYABLE', 424, y + 16);
      doc.setFont(FONT, 'bold'); doc.setFontSize(13); doc.setTextColor(15, 21, 51);
      doc.text(money(S.emi), 40, y + 34);
      doc.text(money(S.amountFinanced), 168, y + 34);
      doc.text(money(S.totalInterest), 296, y + 34);
      doc.text(money(S.totalPayable), 424, y + 34);
      y += 70;

      doc.setFont(FONT, 'bold'); doc.setFontSize(12); doc.setTextColor(27, 58, 107);
      doc.text('AMORTIZATION SCHEDULE', 24, y); y += 8;

      const body = context.rows.map(function (r) {
        return [r.i, money(r.pmt), money(r.principal), money(r.interest), money(r.balance)];
      });
      doc.autoTable({
        startY: y + 10,
        margin: { left: 24, right: 24, top: BAND + 16, bottom: 52 },
        head: [['Month', 'Payment', 'Principal', 'Interest', 'Balance']],
        body: body,
        theme: 'grid',
        styles: { font: FONT, fontSize: 8.5, cellPadding: 4.5, lineColor: [226, 232, 242], lineWidth: 0.4, textColor: [75, 88, 117] },
        headStyles: { font: FONT, fillColor: [27, 58, 107], textColor: [255, 255, 255], fontSize: 9, halign: 'right', fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
          0: { halign: 'left', cellWidth: 46, fontStyle: 'bold', textColor: [15, 21, 51] },
          1: { halign: 'right', fontStyle: 'bold', textColor: [15, 21, 51] },
          2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }
        },
        didParseCell: function (d) { if (d.section === 'head' && d.column.index === 0) d.cell.styles.halign = 'left'; }
      });

      // real total page count — jsPDF replaces the placeholder everywhere
      doc.putTotalPages(TOTAL_PAGES_EXP);
      const filename = 'DecideCalc-' + safeName(context.name) + '-Amortization-' + dateStamp() + '.pdf';
      doc.save(filename);
      setExportState('pdf', 'done');
      return { filename: filename, doc: doc };
    }).catch(function () {
      setExportState('pdf', 'idle');
      if (DC.toast) DC.toast('Unable to generate PDF. Please try again.', 'error');
      return null;
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
