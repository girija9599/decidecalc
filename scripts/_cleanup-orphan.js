'use strict';
// Remove the leftover orphan favicon fragment lines from the two pages the
// earlier broad pattern missed because their <text> node attributes use a
// slightly different order.
const fs = require('fs');
const pages = [
  'calculators/ideal-weight-calculator.html',
  'calculators/marks-percentage-calculator.html'
];
const orphan = /<rect width='100' height='100' rx='22' fill='%23[0-9A-Fa-f]+'\/><text[^<]*<\/text><\/svg>">\s*/;
for (const p of pages) {
  const before = fs.readFileSync(p, 'utf8');
  const next = before.replace(orphan, '');
  if (next !== before) {
    fs.writeFileSync(p, next);
    console.log('cleaned:', p);
  } else {
    console.log('no change:', p);
  }
}
