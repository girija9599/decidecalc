'use strict';
/**
 * One-time canonical-host alignment + title shortening batch.
 * - Rewrites every `https://decidecalc.com` URL to `https://www.decidecalc.com`
 * so internal canonicals, OG tags, JSON-LD, sitemap and robots agree with the
 * actual production redirect destination (non-www -> www 308).
 * - Shortens the specific title flags identified by Bing's "Title too long" scan.
 * Idempotent — re-runs are a no-op.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKIP = new Set(["node_modules", ".git", ".zcode", "artifacts"]);

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP.has(e.name)) yield* walk(p); }
    else if (e.isFile()) {
      if (/\.(html|css|js|xml|json|txt)$/i.test(e.name) && !e.name.endsWith(".min.js")) yield p;
    }
  }
}

const TITLE_REPLACEMENTS = [
  // [old, new] — both branches in JS template and static HTML
  [/^DecideCalc — Free Online Calculators \| EMI, SIP, GST, Tax, Salary, BMI & More$/, "Free Online Calculators — EMI, SIP, GST, Tax & More | DecideCalc"],
  [/^Bond Yield vs Yield to Maturity in India: What’s the Difference\? \| DecideCalc$/, "Bond Yield vs YTM in India | DecideCalc"],
  [/^Why Paying Only the Credit Card Minimum Keeps You in Debt Longer \| DecideCalc$/, "Credit Card Minimum Payment Payoff Guide | DecideCalc"],
  [/^Debt Snowball vs Avalanche in India: Which Payoff Plan Works\? \| DecideCalc$/, "Debt Snowball vs Avalanche — India Payoff Guide | DecideCalc"],
  [/^What Is a Sustainable Retirement Withdrawal Rate in India\? \| DecideCalc$/, "Retirement Withdrawal Rates India | DecideCalc"],
  [/^Home Loan Balance Transfer or Refinance in India: Savings, Costs and Red Flags \| DecideCalc$/, "Home Loan Balance Transfer vs Refinance — India | DecideCalc"],
];

let touched = 0, bytesDelta = 0;
for (const file of walk(ROOT)) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;
  // Host alignment: apex → www
  src = src
    .replace(/https:\/\/decidecalc\.com(?=\/|"|'|<|\)|\s|$)/g, "https://www.decidecalc.com")
    .replace(/\"https:\/\/decidecalc\.com\"/g, '"https://www.decidecalc.com"');
  // Title shortening — exact full-string matches inside <title> or in JS string literals
  for (const [re, replacement] of TITLE_REPLACEMENTS) {
    src = src.replace(new RegExp(`<title>\\s*${re.source.slice(1, -1).replace(/[\\\/]/g, m => "\\\\" + m)}\\s*<\\/title>`, ""), `<title>${replacement}</title>`)
             .replace(new RegExp(`"${re.source.slice(1, -1).replace(/"/g, '\\\\"')}"`, "g"), `"${replacement}"`)
             .replace(new RegExp(`'${re.source.slice(1, -1).replace(/'/g, "\\\\'")}'`, "g"), `'${replacement}'`);
  }
  if (src !== before) {
    fs.writeFileSync(file, src);
    touched++;
    bytesDelta += Math.abs(src.length - before.length);
  }
}
console.log(`Aligned + shortened: updated ${touched} file(s), delta ${bytesDelta} bytes.`);
