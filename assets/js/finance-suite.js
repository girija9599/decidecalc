/* DecideCalc - shared calculations for the Phase 2 finance tools. */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};
  const byId = function (id) { return document.getElementById(id); };
  const money = function (value) { return DC.inr(Math.round(value || 0)); };
  const value = function (name) { return Number((document.querySelector('[data-field="' + name + '"]') || {}).value); };
  const set = function (name, text) { const el = document.querySelector('[data-result="' + name + '"]'); if (el) el.textContent = text; };
  const clear = function (names) { names.forEach(function (name) { set(name, '—'); }); };
  const payment = function (principal, annualRate, months) {
    const rate = annualRate / 1200;
    if (!rate) return principal / months;
    return principal * rate / (1 - Math.pow(1 + rate, -months));
  };
  const resultNames = {
    debt: ['main', 'months', 'interest', 'paid', 'saved', 'strategy'],
    card: ['main', 'months', 'interest', 'paid', 'minimum', 'saved'],
    fee: ['main', 'gross', 'net', 'drag', 'lost', 'invested'],
    refinance: ['main', 'oldEmi', 'newEmi', 'oldCost', 'newCost', 'breakEven'],
    withdrawal: ['main', 'ending', 'rate', 'withdrawn', 'years', 'status'],
    bond: ['main', 'ytm', 'currentYield', 'coupon', 'income', 'gainLoss']
  };
  function recommendation(title, text) {
    set('recoTitle', title);
    set('recoText', text);
  }
  function chart(labels, datasets, label) {
    if (!byId('calcChart')) return;
    DC.makeChart('calcChart', {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        scales: { y: { ticks: { callback: function (v) { return DC.compact(v); } } } },
        plugins: { tooltip: { callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + money(ctx.raw); } } } }
      },
      dcChart: { label: label }
    });
  }
  function simulateDebt(debts, extra, strategy) {
    let balances = debts.map(function (d) { return d.balance; });
    let totalInterest = 0, totalPaid = 0, month = 0;
    const series = [], labels = [];
    while (balances.some(function (b) { return b > 0.01; }) && month < 720) {
      const open = debts.map(function (d, i) { return balances[i] > 0.01 ? i : -1; }).filter(function (i) { return i >= 0; });
      let available = extra;
      open.forEach(function (i) {
        const interest = balances[i] * debts[i].rate / 1200;
        totalInterest += interest;
        balances[i] += interest;
        const minimum = Math.min(balances[i], debts[i].minimum);
        balances[i] -= minimum;
        totalPaid += minimum;
      });
      const target = open.filter(function (i) { return balances[i] > 0.01; }).sort(function (a, b) {
        return strategy === 'snowball' ? balances[a] - balances[b] : debts[b].rate - debts[a].rate;
      });
      target.forEach(function (i) {
        if (available <= 0) return;
        const overpayment = Math.min(balances[i], available);
        balances[i] -= overpayment;
        totalPaid += overpayment;
        available -= overpayment;
      });
      month++;
      if (month % 12 === 0 || !balances.some(function (b) { return b > 0.01; })) {
        labels.push('Year ' + Math.ceil(month / 12));
        series.push(Math.max(0, balances.reduce(function (sum, b) { return sum + b; }, 0)));
      }
    }
    return { months: month, interest: totalInterest, paid: totalPaid, labels: labels, series: series, paidOff: !balances.some(function (b) { return b > 0.01; }) };
  }
  function debt() {
    const strategy = (document.querySelector('[data-field="strategy"]') || {}).value || 'avalanche';
    const extra = value('extra');
    const debts = [1, 2, 3].map(function (i) { return { balance: value('balance' + i), rate: value('rate' + i), minimum: value('minimum' + i) }; }).filter(function (d) { return d.balance > 0; });
    if (!debts.length || debts.some(function (d) { return d.rate < 0 || d.rate > 60 || d.minimum <= 0; }) || extra < 0) return invalid('Add at least one debt with a positive minimum payment and a rate from 0% to 60%.');
    const starting = debts.reduce(function (sum, d) { return sum + d.balance; }, 0);
    const selected = simulateDebt(debts, extra, strategy);
    const alternative = simulateDebt(debts, extra, strategy === 'avalanche' ? 'snowball' : 'avalanche');
    if (!selected.paidOff) return invalid('Your combined payments do not pay down the balances. Increase the minimum or extra payment.');
    set('main', money(starting) + ' debt plan'); set('months', selected.months + ' months'); set('interest', money(selected.interest)); set('paid', money(selected.paid));
    const diff = Math.max(0, alternative.interest - selected.interest);
    set('saved', diff ? money(diff) + ' vs ' + (strategy === 'avalanche' ? 'snowball' : 'avalanche') : 'Similar cost');
    set('strategy', strategy === 'avalanche' ? 'Highest APR first' : 'Smallest balance first');
    recommendation(strategy === 'avalanche' ? 'Avalanche minimizes interest' : 'Snowball builds momentum', 'At your current payments, you can be debt-free in ' + selected.months + ' months. ' + (diff ? 'This strategy saves about ' + money(diff) + ' versus the alternative.' : 'Both strategies have a similar interest cost for these inputs.'));
    chart(selected.labels, [{ label: 'Combined balance', data: selected.series, borderColor: '#00C2A8', backgroundColor: 'rgba(0,194,168,.14)', fill: true, tension: .3, borderWidth: 2.5, pointRadius: 0 }], 'Debt balance over time');
  }
  function card() {
    const balance = value('balance'), apr = value('apr'), minPercent = value('minimumPercent'), minFloor = value('minimumFloor'), extra = value('extra'), purchases = value('purchases');
    if (!(balance > 0) || apr < 0 || apr > 60 || minPercent <= 0 || minFloor < 0 || extra < 0 || purchases < 0) return invalid('Enter a positive balance and minimum-payment rate. APR must be between 0% and 60%.');
    let bal = balance, interest = 0, paid = 0, months = 0, firstMinimum = 0, labels = [], series = [];
    while (bal > 0.01 && months < 720) {
      const monthlyInterest = bal * apr / 1200; bal += monthlyInterest + purchases; interest += monthlyInterest;
      const minimum = Math.min(bal, Math.max(minFloor, bal * minPercent / 100));
      if (!months) firstMinimum = minimum;
      const due = Math.min(bal, minimum + extra); bal -= due; paid += due; months++;
      if (months % 12 === 0 || bal <= 0.01) { labels.push('Year ' + Math.ceil(months / 12)); series.push(Math.max(0, bal)); }
    }
    if (bal > 0.01) return invalid('The balance cannot be paid off with these payments and new purchases. Raise your payment or stop adding charges.');
    const noExtra = extra ? cardBaseline(balance, apr, minPercent, minFloor, purchases) : null;
    set('main', money(minFloor + extra) + '+ / month'); set('months', months + ' months'); set('interest', money(interest)); set('paid', money(paid)); set('minimum', money(firstMinimum)); set('saved', noExtra && noExtra.paidOff ? money(Math.max(0, noExtra.interest - interest)) + ' with extra' : '—');
    recommendation(purchases ? 'New purchases slow repayment' : 'A fixed extra payment changes the payoff date', 'Your current plan clears the card in ' + months + ' months and costs ' + money(interest) + ' in interest. Pay more than the moving minimum whenever cash flow allows.');
    chart(labels, [{ label: 'Card balance', data: series, borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,.14)', fill: true, tension: .3, borderWidth: 2.5, pointRadius: 0 }], 'Credit card balance over time');
  }
  function cardBaseline(balance, apr, minPercent, minFloor, purchases) {
    let bal = balance, interest = 0, months = 0;
    while (bal > 0.01 && months < 720) { const i = bal * apr / 1200; bal += i + purchases; interest += i; bal -= Math.min(bal, Math.max(minFloor, bal * minPercent / 100)); months++; }
    return { interest: interest, paidOff: bal <= 0.01 };
  }
  function fee() {
    const initial = value('initial'), monthly = value('monthly'), grossRate = value('grossRate'), expense = value('expense'), years = value('years');
    if (initial < 0 || monthly < 0 || grossRate < 0 || grossRate > 40 || expense < 0 || expense > 10 || !(years > 0 && years <= 60)) return invalid('Use non-negative investments, a 0%–40% return, a 0%–10% fee and 1–60 years.');
    let gross = initial, net = initial, labels = [], grossSeries = [], netSeries = [];
    const grossMonthly = Math.pow(1 + grossRate / 100, 1 / 12) - 1;
    const netMonthly = Math.pow(1 + (grossRate - expense) / 100, 1 / 12) - 1;
    for (let month = 1; month <= years * 12; month++) { gross = gross * (1 + grossMonthly) + monthly; net = net * (1 + netMonthly) + monthly; if (month % 12 === 0) { labels.push('Year ' + month / 12); grossSeries.push(gross); netSeries.push(net); } }
    const invested = initial + monthly * years * 12, drag = gross - net, growth = Math.max(0, gross - invested);
    set('main', money(drag) + ' fee drag'); set('gross', money(gross)); set('net', money(net)); set('drag', money(drag)); set('lost', growth ? (drag / growth * 100).toFixed(1) + '% of growth' : '—'); set('invested', money(invested));
    recommendation(expense <= .5 ? 'Low fee, lower drag' : 'Fees compound against you', 'At ' + expense + '% annually, the after-fee projection is ' + money(net) + ', which is ' + money(drag) + ' below the same gross-return projection. Compare costs alongside risk and portfolio fit.');
    chart(labels, [{ label: 'Before fees', data: grossSeries, borderColor: '#3B82F6', backgroundColor: 'transparent', fill: false, tension: .3, borderWidth: 2.5, pointRadius: 0 }, { label: 'After fees', data: netSeries, borderColor: '#00C2A8', backgroundColor: 'rgba(0,194,168,.13)', fill: true, tension: .3, borderWidth: 2.5, pointRadius: 0 }], 'Investment value before and after fees');
  }
  function refinance() {
    const balance = value('balance'), oldRate = value('oldRate'), oldYears = value('oldYears'), newRate = value('newRate'), newYears = value('newYears'), fees = value('fees');
    if (!(balance > 0) || oldRate < 0 || newRate < 0 || oldRate > 40 || newRate > 40 || !(oldYears > 0 && oldYears <= 40) || !(newYears > 0 && newYears <= 40) || fees < 0) return invalid('Enter a positive balance, valid terms up to 40 years, rates from 0% to 40%, and non-negative transfer costs.');
    const oldEmi = payment(balance, oldRate, oldYears * 12), newEmi = payment(balance, newRate, newYears * 12), oldCost = oldEmi * oldYears * 12, newCost = newEmi * newYears * 12 + fees, savings = oldCost - newCost;
    const monthlyCash = oldEmi - newEmi, breakEven = monthlyCash > 0 ? Math.ceil(fees / monthlyCash) + ' months' : 'No monthly break-even';
    set('main', savings >= 0 ? money(savings) + ' potential saving' : money(Math.abs(savings)) + ' more costly'); set('oldEmi', money(oldEmi)); set('newEmi', money(newEmi)); set('oldCost', money(oldCost)); set('newCost', money(newCost)); set('breakEven', breakEven);
    recommendation(savings > 0 ? 'Refinancing reduces modeled cost' : 'Keeping the current loan is cheaper', (savings > 0 ? 'The new loan saves ' + money(savings) : 'The new loan costs ' + money(Math.abs(savings)) + ' more') + ' after ' + money(fees) + ' in switching costs. Confirm foreclosure charges, rate-reset terms and any promotional-rate expiry before switching.');
    chart(['Keep current loan', 'Refinance'], [{ label: 'Total remaining cost', data: [oldCost, newCost], borderColor: '#00C2A8', backgroundColor: ['rgba(59,130,246,.55)', 'rgba(0,194,168,.62)'], borderWidth: 0 }], 'Loan cost comparison');
  }
  function withdrawal() {
    const corpus = value('corpus'), withdrawal = value('withdrawal'), rate = value('rate'), inflation = value('inflation'), years = value('years');
    if (!(corpus > 0) || withdrawal < 0 || rate < 0 || rate > 30 || inflation < 0 || inflation > 20 || !(years > 0 && years <= 60)) return invalid('Use a positive corpus, 1–60 years, a 0%–30% return and a 0%–20% inflation assumption.');
    let balance = corpus, annualWithdrawal = withdrawal, total = 0, survived = 0, labels = [], series = [];
    for (let year = 1; year <= years; year++) { balance *= 1 + rate / 100; const actual = Math.min(balance, annualWithdrawal); balance -= actual; total += actual; survived = year; labels.push('Year ' + year); series.push(Math.max(0, balance)); if (balance <= .01) break; annualWithdrawal *= 1 + inflation / 100; }
    const withdrawalRate = withdrawal / corpus * 100, lasts = balance <= .01 ? survived + ' years' : 'Beyond plan';
    set('main', lasts); set('ending', money(balance)); set('rate', withdrawalRate.toFixed(2) + '%'); set('withdrawn', money(total)); set('years', survived + ' of ' + years); set('status', balance > .01 ? 'Plan survives' : 'Depletes in year ' + survived);
    recommendation(balance > .01 ? 'Portfolio supports this plan' : 'Withdrawal plan needs adjustment', balance > .01 ? 'After ' + years + ' years, the projection retains ' + money(balance) + '. Returns and inflation vary, so revisit the plan regularly.' : 'The portfolio runs out in year ' + survived + '. Reducing the first-year withdrawal, delaying retirement, or adding income can extend it.');
    chart(labels, [{ label: 'Portfolio balance', data: series, borderColor: '#00C2A8', backgroundColor: 'rgba(0,194,168,.14)', fill: true, tension: .3, borderWidth: 2.5, pointRadius: 0 }], 'Retirement portfolio balance over time');
  }
  function bond() {
    const face = value('face'), price = value('price'), couponRate = value('couponRate'), years = value('years'), frequency = value('frequency');
    if (!(face > 0 && price > 0 && couponRate >= 0 && couponRate <= 30 && years > 0 && years <= 100 && [1, 2, 4].indexOf(frequency) >= 0)) return invalid('Enter positive face value and price, a 0%–30% coupon, 1–100 years and a supported coupon frequency.');
    const periods = Math.round(years * frequency), coupon = face * couponRate / 100 / frequency;
    const presentValue = function (yieldRate) { let pv = 0; for (let n = 1; n <= periods; n++) pv += coupon / Math.pow(1 + yieldRate / frequency, n); return pv + face / Math.pow(1 + yieldRate / frequency, periods); };
    let low = -0.99, high = 10, mid = 0;
    for (let i = 0; i < 160; i++) { mid = (low + high) / 2; if (presentValue(mid) > price) low = mid; else high = mid; }
    const ytm = mid * 100, currentYield = face * couponRate / 100 / price * 100, couponIncome = coupon * periods, gainLoss = face - price;
    set('main', ytm.toFixed(2) + '% YTM'); set('ytm', ytm.toFixed(2) + '%'); set('currentYield', currentYield.toFixed(2) + '%'); set('coupon', money(coupon * frequency) + ' / year'); set('income', money(couponIncome)); set('gainLoss', (gainLoss >= 0 ? '+' : '−') + money(Math.abs(gainLoss)) + ' at maturity');
    recommendation(price < face ? 'Discount bond: maturity value lifts YTM' : price > face ? 'Premium bond: maturity value reduces YTM' : 'Par bond: YTM matches coupon rate', 'Yield to maturity assumes every scheduled coupon is received and reinvested at the same yield, and that you hold the bond to maturity. It is not a guarantee of return.');
    const labels = [], coupons = [], principal = []; for (let n = 1; n <= periods; n++) { labels.push('Payment ' + n); coupons.push(coupon); principal.push(n === periods ? face : 0); }
    chart(labels, [{ label: 'Coupon cash flow', data: coupons, borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,.34)', fill: true, tension: .15, borderWidth: 2, pointRadius: 0 }, { label: 'Principal repayment', data: principal, borderColor: '#00C2A8', backgroundColor: 'rgba(0,194,168,.5)', fill: true, tension: .15, borderWidth: 2, pointRadius: 0 }], 'Bond coupon and principal cash flows');
  }
  function invalid(message) {
    const error = byId('validation'); if (error) error.textContent = message;
    clear(resultNames[(document.body.dataset.financeTool || '')] || []);
    recommendation('Check your inputs', message);
    if (DC.charts && DC.charts.calcChart) { DC.charts.calcChart.destroy(); delete DC.charts.calcChart; }
  }
  DC.financeSuite = {
    init: function (type) {
      const calculate = { debt: debt, card: card, fee: fee, refinance: refinance, withdrawal: withdrawal, bond: bond }[type];
      if (!calculate) return;
      document.querySelectorAll('[data-field]').forEach(function (input) { input.addEventListener('input', calculate); input.addEventListener('change', calculate); });
      const button = byId('calcBtn'); if (button) button.addEventListener('click', calculate);
      const reset = byId('resetBtn'); if (reset) reset.addEventListener('click', function () { const form = byId('financeForm'); if (form) form.reset(); calculate(); });
      const share = byId('shareBtn'); if (share) share.addEventListener('click', function () { DC.shareWhatsApp(document.title.replace(' | DecideCalc', '') + ': ' + (document.querySelector('[data-result="main"]') || {}).textContent + ' via DecideCalc'); });
      const copy = byId('copyBtn'); if (copy) copy.addEventListener('click', function () { DC.copyResult(document.title.replace(' | DecideCalc', '') + '\n' + (document.querySelector('[data-result="main"]') || {}).textContent + '\n' + (document.querySelector('[data-result="recoText"]') || {}).textContent); });
      calculate();
    }
  };
})();
