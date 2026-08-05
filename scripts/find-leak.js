'use strict';
// Locate the leaked "D>" pattern in a live-served calculator page.
const path = process.argv[2] || 'calculators/job-switch-decision';
const https = require('https');
https.get('https://www.decidecalc.com/' + path, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    let idx = -1, n = 0;
    while ((idx = data.indexOf('D">', idx + 1)) !== -1 && n < 8) {
      console.log(`\nMATCH ${n} at ${idx}`);
      console.log(data.slice(Math.max(0, idx - 250), idx + 100));
      n++;
    }
    if (n === 0) console.log('No D"> found in body; running looser scan...');
    else console.log('\n' + n + ' direct matches');
  });
});
