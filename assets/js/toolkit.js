/* ============================================================
   DecideCalc — Generic tool scaffolding
   High-density, reusable input/output builders for batch-built tools.
   ============================================================ */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};

  DC.fieldInput = function (o) {
    o = o || {};
    const id = o.id, label = o.label, val = o.value != null ? o.value : '';
    const type = o.type || 'number';
    const extra = [];
    if (o.min != null) extra.push('min="' + o.min + '"');
    if (o.max != null) extra.push('max="' + o.max + '"');
    if (o.step != null) extra.push('step="' + o.step + '"');
    if (o.placeholder) extra.push('placeholder="' + o.placeholder + '"');
    let inner = '<input class="input" id="' + id + '" type="' + type + '" value="' + val + '" ' + extra.join(' ') + '>';
    if (o.prefix || o.suffix) {
      inner = '<div class="input-wrap">' +
        (o.prefix ? '<span class="prefix">' + o.prefix + '</span>' : '') +
        inner.replace('class="input"', 'class="input ' + (o.prefix ? 'with-prefix' : 'with-suffix') + '"') +
        (o.suffix ? '<span class="suffix">' + o.suffix + '</span>' : '') +
        '</div>';
    }
    return '<div class="field"><label for="' + id + '">' + label + '</label>' + inner + '</div>';
  };

  DC.fieldSelect = function (o) {
    const opts = (o.options || []).map(function (op) {
      const v = Array.isArray(op) ? op[0] : op;
      const t = Array.isArray(op) ? op[1] : op;
      const sel = (o.value != null && String(o.value) === String(v)) ? ' selected' : '';
      return '<option value="' + v + '"' + sel + '>' + t + '</option>';
    }).join('');
    return '<div class="field"><label for="' + o.id + '">' + o.label + '</label><select class="select" id="' + o.id + '">' + opts + '</select></div>';
  };

  DC.fieldTextarea = function (o) {
    const rows = o.rows || 8;
    return '<div class="field"><label for="' + o.id + '">' + o.label + '</label><textarea class="input" id="' + o.id + '" rows="' + rows + '"' + (o.placeholder ? ' placeholder="' + o.placeholder + '"' : '') + '>' + (o.value || '') + '</textarea></div>';
  };

  /* Standard result tile */
  DC.resultTile = function (id, label) {
    return '<div class="result-stat"><div class="v" id="' + id + '">—</div><div class="k">' + label + '</div></div>';
  };

  /* Bind reset with sensible defaults */
  DC.bindReset = function (btnId, defaults, onReset) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      Object.keys(defaults).forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = !!defaults[id];
        else el.value = defaults[id];
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      if (typeof onReset === 'function') onReset();
      DC.toast('Reset to defaults', 'success');
    });
  };
})();
