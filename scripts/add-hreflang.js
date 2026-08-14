// Script to add hreflang tags and basic schema to calculator files missing them

const fs = require('fs');
const path = require('path');

const CALCULATORS_DIR = path.join(__dirname, '..', 'calculators');

// Map of calculator slugs to their categories and descriptions
const calcInfo = {
  'appliance-emi-calculator': { category: 'UtilityApplication', name: 'Appliance EMI Calculator', desc: 'Calculate EMI for home appliances like washing machine, AC, refrigerator.' },
  'auto-loan-calculator': { category: 'FinanceApplication', name: 'Auto Loan Calculator', desc: 'Calculate auto loan EMI, total interest and tenure for car loans.' },
  'bike-loan-calculator': { category: 'FinanceApplication', name: 'Bike Loan Calculator', desc: 'Calculate bike loan EMI, total interest and tenure for two-wheeler loans.' },
  'debt-payoff-calculator': { category: 'FinanceApplication', name: 'Debt Payoff Calculator', desc: 'Calculate time and interest saved by paying extra on debt.' },
  'discount-calculator': { category: 'UtilityApplication', name: 'Discount Calculator', desc: 'Calculate discount amount and final price after applying discount.' },
  'ev-loan-calculator': { category: 'FinanceApplication', name: 'EV Loan Calculator', desc: 'Calculate electric vehicle loan financing and EMI options.' },
  'interest-calculator': { category: 'FinanceApplication', name: 'Interest Calculator', desc: 'Calculate simple and compound interest on any amount.' },
  'ipad-emi-calculator': { category: 'FinanceApplication', name: 'iPad EMI Calculator', desc: 'Calculate iPad loan EMI for Apple device financing.' },
  'iphone-emi-calculator': { category: 'FinanceApplication', name: 'iPhone EMI Calculator', desc: 'Calculate iPhone loan EMI for Apple device financing.' },
  'laptop-emi-calculator': { category: 'FinanceApplication', name: 'Laptop EMI Calculator', desc: 'Calculate laptop loan EMI for computing devices.' },
  'loan-payment-calculator': { category: 'FinanceApplication', name: 'Loan Payment Calculator', desc: 'Calculate total payment and interest on any loan.' },
  'motorcycle-loan-calculator': { category: 'FinanceApplication', name: 'Motorcycle Loan Calculator', desc: 'Calculate motorcycle loan EMI with interest rate input.' },
  'personal-loan-calculator': { category: 'FinanceApplication', name: 'Personal Loan Calculator', desc: 'Calculate personal loan EMI, interest and tenure.' },
  'phone-emi-calculator': { category: 'FinanceApplication', name: 'Phone EMI Calculator', desc: 'Calculate phone loan EMI for smartphone financing.' },
  'sales-tax-calculator': { category: 'FinanceApplication', name: 'Sales Tax Calculator', desc: 'Calculate sales tax amount and final price.' },
  'scooter-loan-calculator': { category: 'FinanceApplication', name: 'Scooter Loan Calculator', desc: 'Calculate scooter loan EMI for commuting vehicles.' },
  'take-home-pay-calculator': { category: 'FinanceApplication', name: 'Take Home Pay Calculator', desc: 'Calculate net salary after all deductions.' },
  'tip-calculator': { category: 'UtilityApplication', name: 'Tip Calculator', desc: 'Calculate tip amount for restaurant bills.' },
  'truck-loan-calculator': { category: 'FinanceApplication', name: 'Truck Loan Calculator', desc: 'Calculate truck loan EMI for commercial vehicles.' },
  'tv-emi-calculator': { category: 'FinanceApplication', name: 'TV EMI Calculator', desc: 'Calculate TV loan EMI for entertainment appliances.' }
};

const files = fs.readdirSync(CALCULATORS_DIR).filter(f => f.endsWith('.html'));

let updated = 0;
files.forEach(file => {
  const filePath = path.join(CALCULATORS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const slug = file.replace('.html', '');
  const info = calcInfo[slug];
  
  if (!info) return;
  
  // Skip if already has hreflang
  if (content.includes('hreflang=')) {
    return;
  }
  
  // Find gtag script and add hreflang before it
  let newContent = content;
  
  const gtagMatch = content.match(/<script>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];/);
  if (gtagMatch) {
    const hreflangTags = `  <link rel="alternate" hreflang="en-IN" href="https://www.decidecalc.com/calculators/${slug}">
  <link rel="alternate" hreflang="x-default" href="https://www.decidecalc.com/calculators/${slug}">
  <!-- Basic Schema -->
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"${info.name}","applicationCategory":"${info.category}","operatingSystem":"Web","url":"https://www.decidecalc.com/calculators/${slug}","description":"${info.desc}","offers":{"@type":"Offer","price":"0","priceCurrency":"INR"},"inLanguage":"en-IN","creator":{"@type":"Organization","name":"DecideCalc","url":"https://www.decidecalc.com"}}</script>
  `;
    
    newContent = newContent.replace(
      /<script>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];/,
      hreflangTags + '<script>\n    window.dataLayer = window.dataLayer || [];'
    );
    
    fs.writeFileSync(filePath, newContent);
    console.log('Updated:', slug);
    updated++;
  }
});

console.log('Updated', updated, 'files');