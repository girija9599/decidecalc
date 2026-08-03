/* ============================================================
   DecideCalc — Core shared utilities
   Dark mode · Scroll reveal · Toasts · Counters ·
   Charts · Share · Formatting · FAQ · Range fills
   ============================================================ */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};

  /* ---------- Safe helpers ---------- */
  DC.escape = function (value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  };
  DC.uid = function (prefix) {
    DC._uid = (DC._uid || 0) + 1;
    return (prefix || 'dc') + '-' + DC._uid;
  };

  /* ---------- Theme (dark mode) ---------- */
  DC.applyTheme = function (t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('dc-theme', t); } catch (e) {}
  };
  DC.initTheme = function () {
    let t;
    try { t = localStorage.getItem('dc-theme'); } catch (e) {}
    if (!t) t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    DC.applyTheme(t);
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const cur = document.documentElement.getAttribute('data-theme');
        DC.applyTheme(cur === 'dark' ? 'light' : 'dark');
      });
    });
  };

  /* ---------- Mobile navigation ---------- */
  DC.initNav = function () {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.mobile-nav');
    const backdrop = document.querySelector('.nav-backdrop');
    if (!toggle || !menu || !backdrop || toggle.dataset.bound) return;
    toggle.dataset.bound = 'true';
      const blocked = function () { return document.querySelectorAll('main, .site-footer'); };
    const setBackgroundState = function (open) {
      blocked().forEach(function (el) {
        if ('inert' in el) el.inert = open;
        else el.setAttribute('aria-hidden', open ? 'true' : 'false');
      });
    };
    const close = function (returnFocus) {
      const wasOpen = menu.classList.contains('is-open');
      menu.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
      menu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
      setBackgroundState(false);
      if (wasOpen && returnFocus) toggle.focus();
    };
    const open = function () {
      menu.classList.add('is-open');
      backdrop.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation');
      menu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-open');
      setBackgroundState(true);
      const first = menu.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (first) setTimeout(function () { first.focus(); }, 0);
    };
    toggle.addEventListener('click', function () { toggle.getAttribute('aria-expanded') === 'true' ? close(false) : open(); });
    backdrop.addEventListener('click', function () { close(true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { close(false); }); });
    document.addEventListener('keydown', function (e) {
      if (!menu.classList.contains('is-open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key !== 'Tab') return;
      const focusable = Array.prototype.filter.call(menu.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'), function (el) { return !el.disabled; });
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) close(false); }, { passive:true });
  };

  /* ---------- Header scroll shadow ---------- */
  DC.initHeader = function () {
    const h = document.querySelector('.site-header');
    if (!h) return;
    const onScroll = function () {
      if (window.scrollY > 8) h.classList.add('scrolled');
      else h.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  /* ---------- Scroll reveal ---------- */
  DC.initReveal = function () {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  };

  /* ---------- Animated counters ---------- */
  DC.initCounters = function () {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    const fmt = function (v) { return Math.round(v).toLocaleString('en-IN'); };
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.getAttribute('data-count'));
        const dur = 1500;
        const start = performance.now();
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const dec = el.getAttribute('data-dec') === '1';
        const step = function (now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = prefix + (dec ? val.toFixed(1) : fmt(val)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  };

  /* ---------- Toasts ---------- */
  DC.toast = function (msg, type) {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>',
      '': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>'
    };
    t.innerHTML = (icons[type] || icons['']);
    const span = document.createElement('span');
    span.textContent = msg;
    t.appendChild(span);
    wrap.appendChild(t);
    setTimeout(function () {
      t.style.opacity = '0'; t.style.transform = 'translateY(16px)'; t.style.transition = '.35s';
      setTimeout(function () { t.remove(); }, 350);
    }, 2600);
  };

  /* ---------- Number / currency formatting ---------- */
  DC.inr = function (n, dec) {
    if (!isFinite(n)) n = 0;
    return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: dec == null ? 0 : dec, minimumFractionDigits: dec == null ? 0 : dec });
  };
  DC.num = function (n, dec) {
    if (!isFinite(n)) n = 0;
    return Number(n).toLocaleString('en-IN', { maximumFractionDigits: dec == null ? 0 : dec });
  };
  DC.compact = function (n) {
    if (!isFinite(n)) n = 0;
    n = Number(n);
    if (Math.abs(n) >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
    if (Math.abs(n) >= 100000) return '₹' + (n / 100000).toFixed(2) + ' L';
    if (Math.abs(n) >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
    return '₹' + Math.round(n);
  };
  DC.pct = function (n, dec) { return (dec == null ? n.toFixed(1) : n.toFixed(dec)) + '%'; };
  DC.fnum = function (v) { v = parseFloat(v); return isNaN(v) ? 0 : v; };

  /* ---------- Range sliders: fill, formatted value + manual entry ---------- */
  DC.rangeValue = function (range, value) {
    const min = Number(range.min || 0);
    const max = Number(range.max || 100);
    const step = Number(range.step || 1);
    let next = Number(value);
    if (!isFinite(next)) next = min;
    next = Math.min(max, Math.max(min, next));
    if (step > 0) next = min + Math.round((next - min) / step) * step;
    const precision = String(step).indexOf('.') === -1 ? 0 : String(step).split('.')[1].length;
    return Number(next.toFixed(precision));
  };

  DC.rangeLabel = function (range) {
    if (range.dataset.rangeLabel) return range.dataset.rangeLabel;
    const prefix = range.getAttribute('data-prefix') || '';
    const suffix = range.getAttribute('data-suffix') || '';
    const dec = parseInt(range.getAttribute('data-dec') || '0', 10);
    return prefix + Number(range.value).toLocaleString('en-IN', { maximumFractionDigits: dec, minimumFractionDigits: dec }) + suffix;
  };

  DC.syncRange = function (range) {
    if (!range) return;
    const min = Number(range.min || 0);
    const max = Number(range.max || 100);
    const value = Number(range.value);
    const fill = max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    range.style.setProperty('--fill', fill + '%');

    const out = document.querySelector('[data-range-out="' + range.id + '"]') || document.getElementById('out-' + range.id);
    if (out) out.textContent = DC.rangeLabel(range);

    const manual = document.querySelector('[data-range-manual="' + range.id + '"]');
    if (manual) {
      manual.min = range.min;
      manual.max = range.max;
      manual.step = range.step || '1';
      if (document.activeElement !== manual) manual.value = range.value;
    }
  };

  DC.setRangeValue = function (range, value, emit) {
    if (!range) return;
    range.value = DC.rangeValue(range, value);
    DC.syncRange(range);
    if (emit) range.dispatchEvent(new Event('input', { bubbles: true }));
  };

  DC.initRanges = function () {
    document.querySelectorAll('input[type="range"]').forEach(function (range) {
      const out = document.querySelector('[data-range-out="' + range.id + '"]') || document.getElementById('out-' + range.id);
      let manual = document.querySelector('[data-range-manual="' + range.id + '"]');

      // Existing calculator pages use a readable value pill. Add one raw numeric editor
      // beside it so every slider can also be typed accurately on desktop and mobile.
      if (out && !manual) {
        manual = document.createElement('input');
        manual.className = 'range-manual';
        manual.type = 'number';
        manual.inputMode = 'decimal';
        manual.setAttribute('data-range-manual', range.id);
        manual.setAttribute('aria-label', ((range.closest('.field') && range.closest('.field').querySelector('label') || {}).textContent || range.id) + ' manual value');
        out.parentNode.appendChild(manual);
      }

      if (!range.dataset.rangeBound) {
        range.dataset.rangeBound = 'true';
        range.addEventListener('input', function () { DC.syncRange(range); });

        if (manual) {
          manual.addEventListener('focus', function () { manual.select(); });
          manual.addEventListener('input', function () {
            if (manual.value === '' || !isFinite(Number(manual.value))) return;
            const typed = Number(manual.value);
            const min = Number(range.min), max = Number(range.max);
            // Keep an in-progress out-of-range value editable; normalize it on blur/change.
            if (typed >= min && typed <= max) {
              range.value = DC.rangeValue(range, typed);
              DC.syncRange(range);
              range.dispatchEvent(new Event('input', { bubbles: true }));
            }
          });
          manual.addEventListener('change', function () {
            if (manual.value === '') { DC.syncRange(range); return; }
            DC.setRangeValue(range, manual.value, true);
          });
          manual.addEventListener('blur', function () {
            if (manual.value === '') DC.syncRange(range);
          });
        }
      }
      DC.syncRange(range);
    });
  };

  /* ---------- Chart helper (Chart.js must be loaded) ---------- */
  DC.themeColors = function () {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      text: dark ? '#B7C4DC' : '#44546A',
      textStrong: dark ? '#F3F7FF' : '#14213D',
      grid: dark ? 'rgba(255,255,255,.07)' : 'rgba(16,27,45,.07)',
      card: dark ? '#131E33' : '#FFFFFF',
      tip: dark ? '#131E33' : '#FFFFFF',
      tipBorder: dark ? '#324767' : '#CBD5E6'
    };
  };

  DC._deepMerge = function (target) {
    target = target || {};
    for (let i = 1; i < arguments.length; i++) {
      const source = arguments[i] || {};
      Object.keys(source).forEach(function (key) {
        const value = source[key];
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Function)) {
          target[key] = DC._deepMerge(target[key] && typeof target[key] === 'object' && !Array.isArray(target[key]) ? target[key] : {}, value);
        } else {
          target[key] = value;
        }
      });
    }
    return target;
  };

  DC._chartRows = function (config) {
    const data = config && config.data || {};
    const labels = data.labels || [];
    const datasets = data.datasets || [];
    const rows = [];
    if (config.type === 'doughnut' || config.type === 'pie' || config.type === 'radar') {
      const ds = datasets[0] || { data: [] };
      labels.forEach(function (label, index) {
        rows.push([label, ds.data[index]]);
      });
      return rows;
    }
    labels.forEach(function (label, index) {
      const row = [label];
      datasets.forEach(function (set) { row.push((set.data || [])[index]); });
      rows.push(row);
    });
    return rows;
  };

  DC._palette = function (index) {
    const colors = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];
    return colors[index % colors.length];
  };

  DC._chartValuePlugin = function (config) {
    return {
      id: 'decidecalcValueLabels',
      afterDatasetsDraw: function (chart) {
        const settings = (config && config.dcChart && config.dcChart.valueLabels) || {};
        if (settings.display === false) return;
        const ctx = chart.ctx, c = DC.themeColors();
        ctx.save();
        ctx.font = '600 11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        if (chart.config.type === 'bar') {
          chart.data.datasets.forEach(function (set, si) {
            chart.getDatasetMeta(si).data.forEach(function (el, di) {
              const raw = set.data[di];
              if (!isFinite(raw)) return;
              const text = typeof settings.formatter === 'function' ? settings.formatter(raw, di, si) : String(raw);
              ctx.fillStyle = c.textStrong;
              ctx.fillText(text, el.x, el.y - 4);
            });
          });
        } else if (chart.config.type === 'line' && settings.points === 'ends') {
          chart.data.datasets.forEach(function (set, si) {
            const meta = chart.getDatasetMeta(si);
            for (let di = meta.data.length - 1; di >= 0; di--) {
              const raw = set.data[di];
              if (!isFinite(raw)) continue;
              const point = meta.data[di];
              const text = typeof settings.formatter === 'function' ? settings.formatter(raw, di, si) : String(raw);
              ctx.fillStyle = c.textStrong;
              ctx.textAlign = di === 0 ? 'left' : 'right';
              ctx.fillText(text, point.x, point.y - 6);
              break;
            }
          });
        } else if (chart.config.type === 'doughnut' || chart.config.type === 'pie') {
          chart.getDatasetMeta(0).data.forEach(function (el, di) {
            const raw = (chart.data.datasets[0].data || [])[di];
            if (!isFinite(raw)) return;
            const value = typeof settings.formatter === 'function' ? settings.formatter(raw, di, 0) : String(raw);
            const pos = el.tooltipPosition();
            const metrics = ctx.measureText(value);
            const width = metrics.width + 10;
            ctx.fillStyle = c.card;
            ctx.strokeStyle = c.grid;
            ctx.beginPath();
            ctx.roundRect(pos.x - width / 2, pos.y - 17, width, 21, 7);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = c.textStrong;
            ctx.textBaseline = 'middle';
            ctx.fillText(value, pos.x, pos.y - 6);
          });
        }
        ctx.restore();
      }
    };
  };

  DC._renderChartAlt = function (id, canvas, config) {
    const meta = (config && config.dcChart) || {};
    const title = meta.title || (document.title.split('|')[0] || 'Chart').trim();
    const rows = DC._chartRows(config);
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', title);
    const host = canvas.closest('.chart-wrap') || canvas.parentElement;
    if (!host) return;

    let alt = document.getElementById(id + '-chart-alt');
    if (!alt) {
      alt = document.createElement('div');
      alt.className = 'chart-alt';
      alt.id = id + '-chart-alt';
      canvas.insertAdjacentElement('afterend', alt);
    }
    canvas.setAttribute('aria-describedby', alt.id + '-desc');

    const descId = alt.id + '-desc';
    const tableId = alt.id + '-table';
    const originalPlugin = (config.plugins || []).filter(function (plugin) { return plugin && plugin.id !== 'decidecalcValueLabels'; });
    const labels = config.data.labels || [];
    let head = '';
    let body = '';
    if (config.type === 'doughnut' || config.type === 'pie' || config.type === 'radar') {
      head = '<tr><th>Label</th><th>Value</th></tr>';
      body = rows.map(function (row) {
        return '<tr><td>' + DC.escape(row[0]) + '</td><td>' + DC.escape(typeof meta.tableFormatter === 'function' ? meta.tableFormatter(row[1], row[0]) : row[1]) + '</td></tr>';
      }).join('');
    } else {
      head = '<tr><th>Period</th>' + ((config.data.datasets || []).map(function (set) { return '<th>' + DC.escape(set.label || 'Value') + '</th>'; }).join('')) + '</tr>';
      body = rows.map(function (row) {
        return '<tr><td>' + DC.escape(row[0]) + '</td>' + row.slice(1).map(function (value) {
          return '<td>' + DC.escape(typeof meta.tableFormatter === 'function' ? meta.tableFormatter(value, row[0]) : value) + '</td>';
        }).join('') + '</tr>';
      }).join('');
    }
    const summary = typeof meta.summaryFormatter === 'function'
      ? meta.summaryFormatter(labels, config.data.datasets || [], rows)
      : (meta.summary || 'This chart visualises the current calculated values.');
    alt.innerHTML =
      '<div id="' + descId + '" class="chart-desc">' + DC.escape(summary) + '</div>' +
      '<button class="chart-data-toggle" type="button" aria-expanded="false" aria-controls="' + tableId + '">View chart data</button>' +
      '<div id="' + tableId + '" class="chart-data-panel" hidden><table class="breakdown"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
    const toggle = alt.querySelector('.chart-data-toggle');
    const panel = alt.querySelector('.chart-data-panel');
    toggle.onclick = function () {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.textContent = open ? 'View chart data' : 'Hide chart data';
      panel.hidden = open;
    };
    config.plugins = originalPlugin.concat([DC._chartValuePlugin(config)]);
  };

  DC.charts = {}; // registry for destroy/re-render on theme change
  DC.makeChart = function (id, config) {
    const canvas = (typeof id === 'string') ? document.getElementById(id) : id;
    if (!canvas || !window.Chart) return null;
    if (DC.charts[id]) { DC.charts[id].destroy(); }
    const c = DC.themeColors();
    const merged = DC._deepMerge({
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: c.text, usePointStyle: true, padding: 16, font: { weight: '600' } } },
          tooltip: { backgroundColor: c.tip, titleColor: c.text, bodyColor: c.text, borderColor: c.tipBorder, borderWidth: 1, padding: 12, cornerRadius: 8, displayColors: true, usePointStyle: true }
        },
        animation: { duration: 900, easing: 'easeOutQuart' }
      }
    }, config || {});

    if (merged.type === 'bar' || merged.type === 'line') {
      merged.options.scales = DC._deepMerge({
        x: { ticks: { color: c.text, font: { weight: '600' } }, grid: { display: false }, border: { color: c.grid } },
        y: { ticks: { color: c.text }, grid: { color: c.grid }, border: { display: false } }
      }, merged.options.scales || {});
    }

    merged._dcChart = JSON.parse(JSON.stringify(config.dcChart || {}));
    DC._renderChartAlt(canvas.id || id, canvas, merged);
    const plugins = merged.plugins || [];
    delete merged.plugins;
    const ch = new Chart(canvas, Object.assign({}, merged, { plugins: plugins }));
    ch.$dcChartConfig = {
      type: merged.type,
      data: merged.data,
      options: merged.options,
      dcChart: merged._dcChart,
      plugins: plugins
    };
    DC.charts[id] = ch;
    return ch;
  };

  /* Re-render charts on theme change */
  DC._rerenderCharts = function () {
    Object.keys(DC.charts).forEach(function (k) {
      const ch = DC.charts[k]; if (!ch || !ch.$dcChartConfig) return;
      const cfg = ch.$dcChartConfig;
      ch.destroy();
      delete DC.charts[k];
      DC.makeChart(ch.canvas.id, { type: cfg.type, data: cfg.data, options: cfg.options, dcChart: cfg.dcChart, plugins: [] });
    });
  };

  /* ---------- Share ---------- */
  DC.shareWhatsApp = function (text, url) {
    url = url || window.location.href;
    const t = encodeURIComponent((text || 'I just used DecideCalc') + ' — ' + url);
    window.open('https://wa.me/?text=' + t, '_blank', 'noopener');
    DC.toast('Opening WhatsApp…', 'success');
  };
  DC.copyResult = function (text) {
    const done = function () { DC.toast('Result copied to clipboard', 'success'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
      ta.select(); try { document.execCommand('copy'); done(); } catch (e) { DC.toast('Copy failed', 'error'); }
      ta.remove();
    }
  };

  /* ---------- FAQ accordion ---------- */
  DC.initFAQ = function () {
    document.querySelectorAll('.faq-q').forEach(function (q) {
      if (q.dataset.bound) return;
      q.dataset.bound = 'true';
      q.addEventListener('click', function () {
        const item = q.closest('.faq-item');
        const wasOpen = item.classList.contains('open');
        const wrap = item.parentElement;
        if (wrap && wrap.dataset.single) {
          wrap.querySelectorAll('.faq-item.open').forEach(function (o) {
            if (o === item) return;
            o.classList.remove('open');
            const otherQ = o.querySelector('.faq-q');
            const otherA = o.querySelector('.faq-a');
            if (otherQ) otherQ.setAttribute('aria-expanded', 'false');
            if (otherA) otherA.setAttribute('aria-hidden', 'true');
          });
        }
        item.classList.toggle('open', !wasOpen);
        q.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
        const answer = item.querySelector('.faq-a');
        if (answer) answer.setAttribute('aria-hidden', wasOpen ? 'true' : 'false');
      });
    });
  };

  /* ---------- Segmented control ---------- */
  DC.initSegmented = function () {
    document.querySelectorAll('.segmented').forEach(function (seg) {
      const target = seg.getAttribute('data-target');
      seg.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          const value = b.getAttribute('data-value') || b.getAttribute('data-val');
          seg.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          if (target) {
            const hidden = document.querySelector('[name="' + target + '"]');
            if (hidden) hidden.value = value;
            seg.dispatchEvent(new CustomEvent('segment:change', { detail: { value: value }, bubbles: true }));
          }
        });
      });
    });
  };

  /* ---------- Boot ---------- */
  DC.boot = function () {
    document.documentElement.classList.add('js');
    DC.initTheme();
    DC.initNav();
    DC.initHeader();
    DC.initReveal();
    DC.initCounters();
    DC.initRanges();
    DC.initFAQ();
    DC.initSegmented();
    // Re-render charts when theme toggles
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.addEventListener('click', function () { setTimeout(DC._rerenderCharts, 100); });
    });
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register(DC.base + 'sw.js').catch(function () {});
      });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', DC.boot);
  else DC.boot();
})();
