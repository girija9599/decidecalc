import * as fs from 'fs';
import * as path from 'path';

const calcDir = 'C:/Users/LENOVO/Desktop/DecideCal/calculators';
const files = fs.readdirSync(calcDir).filter(f => f.endsWith('.html'));

// Tool metadata - category info
const toolMeta = {
  'emi-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'sip-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'income-tax-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'retirement-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'gst-calculator': { cat: 'business', catName: 'Business Tools' },
  'ppf-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'bmi-calculator': { cat: 'health', catName: 'Health & Lifestyle' },
  'age-calculator': { cat: 'datetime', catName: 'Date & Time' },
  'rent-vs-buy': { cat: 'finance', catName: 'Finance & Tax' },
  'compound-interest-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'home-loan-eligibility': { cat: 'finance', catName: 'Finance & Tax' },
  'nps-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'epf-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'emergency-fund-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'scss-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'fd-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'cagr-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'ssy-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'hra-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'loan-vs-investment': { cat: 'finance', catName: 'Finance & Tax' },
  'gratuity-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'net-worth-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'loan-refinance-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'investment-fee-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'debt-to-income-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'credit-utilization-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'debt-payoff-planner': { cat: 'finance', catName: 'Finance & Tax' },
  'credit-card-payoff-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'bond-ytm-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'car-loan-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'auto-loan-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'used-car-loan-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'truck-loan-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'motorcycle-loan-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'scooter-loan-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'bike-loan-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'ev-loan-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'personal-loan-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'iphone-emi-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'phone-emi-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'laptop-emi-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'ipad-emi-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'tv-emi-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'appliance-emi-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'loan-payment-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'interest-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'discount-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'tip-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'sales-tax-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'take-home-pay-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'marks-percentage-calculator': { cat: 'education', catName: 'Education Tools' },
  'student-loan-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  '401k-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'ira-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'mssc-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'pmay-clss-subsidy-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'rd-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'rule-of-72': { cat: 'finance', catName: 'Finance & Tax' },
  'rent-affordability-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'flation-calculator': { cat: 'finance', catName: 'Finance & Tax' },
  'fd-vs-mutual-fund': { cat: 'finance', catName: 'Finance & Tax' },
  'life-decision-scorer': { cat: 'unique', catName: 'Decision Tools' },
  'pregnancy-due-date': { cat: 'life', catName: 'Life Planning' },
  'pregnancy-week-tracker': { cat: 'life', catName: 'Life Planning' },
  'wedding-budget-planner': { cat: 'life', catName: 'Life Planning' },
  'baby-cost-calculator': { cat: 'life', catName: 'Life Planning' },
  'unit-converter': { cat: 'converter', catName: 'Unit & Currency' },
  'currency-converter': { cat: 'converter', catName: 'Unit & Currency' },
  'word-counter': { cat: 'text', catName: 'Text Tools' },
  'case-converter': { cat: 'text', catName: 'Text Tools' },
  'slug-generator': { cat: 'text', catName: 'Text Tools' },
  'lorem-ipsum-generator': { cat: 'text', catName: 'Text Tools' },
  'number-to-words': { cat: 'text', catName: 'Text Tools' },
  'json-formatter': { cat: 'dev', catName: 'Developer Tools' },
  'base64-tool': { cat: 'dev', catName: 'Developer Tools' },
  'markdown-to-html': { cat: 'dev', catName: 'Developer Tools' },
  'jwt-decoder': { cat: 'dev', catName: 'Developer Tools' },
  'hash-generator': { cat: 'dev', catName: 'Developer Tools' },
  'password-generator': { cat: 'utility', catName: 'Utility Tools' },
  'random-number-generator': { cat: 'utility', catName: 'Utility Tools' },
  'password-strength-meter': { cat: 'utility', catName: 'Utility Tools' },
  'uuid-generator': { cat: 'utility', catName: 'Utility Tools' },
  'percentage-calculator': { cat: 'education', catName: 'Education Tools' },
  'cgpa-calculator': { cat: 'education', catName: 'Education Tools' }
};

let fixed = 0;

for (const file of files) {
  const filePath = path.join(calcDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has WebApplication schema
  if (content.includes('"@type":"WebApplication"')) continue;
  
  const slug = file.replace('.html', '');
  const meta = toolMeta[slug] || { cat: 'finance', catName: 'Finance & Tax' };
  
  // Extract title
  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : slug;
  
  // Extract description
  const descMatch = content.match(/name="description" content="([^"]+)"/);
  const desc = descMatch ? descMatch[1] : 'Free online calculator for ' + slug;
  
  // Build JSON-LD schemas
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": title,
    "url": "https://www.decidecalc.com/calculators/" + slug,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "description": desc,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
    "inLanguage": "en-IN",
    "creator": { "@type": "Organization", "name": "DecideCalc", "url": "https://www.decidecalc.com" }
  };
  
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to use " + title,
    "step": [
      { "@type": "HowToStep", "position": 1, "name": "Enter values", "text": "Input your numbers in the calculator fields." },
      { "@type": "HowToStep", "position": 2, "name": "Calculate", "text": "Click the Calculate button to get results." },
      { "@type": "HowToStep", "position": 3, "name": "Review results", "text": "View your calculation resu
