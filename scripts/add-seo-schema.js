// Batch script to add complete SEO schema (WebApplication, HowTo, FAQPage, BreadcrumbList) 
// and hreflang tags to all calculator pages

const fs = require('fs');
const path = require('path');

const CALCULATORS_DIR = path.join(__dirname, '..', 'calculators');
const files = fs.readdirSync(CALCULATORS_DIR).filter(f => f.endsWith('.html'));

// Calculator metadata for schema
const calculatorMeta = {
  'emi-calculator': {
    name: 'EMI Calculator',
    displayName: 'Calculate Loan EMI Online Free',
    category: 'FinanceApplication',
    description: 'Calculate your monthly loan EMI, total interest and amortization schedule with this India-first EMI calculator.',
    categorySlug: 'finance',
    faqs: [
      { q: 'What is an EMI?', a: 'EMI (Equated Monthly Instalment) is the fixed amount you pay every month to repay a loan. It includes both principal and interest components.' },
      { q: 'How is EMI calculated?', a: 'EMI = P x r x (1+r)^n / ((1+r)^n - 1), where P is principal loan amount, r is monthly interest rate, and n is tenure in months.' },
      { q: 'Does prepayment reduce my EMI?', a: 'Prepayment can reduce either your EMI or tenure. Keeping EMI constant and shortening tenure saves more total interest.' },
      { q: 'Is this EMI calculator free?', a: 'Yes, 100% free, no login required. All calculations happen in your browser.' }
    ],
    howtoSteps: [
      { name: 'Enter loan details', text: 'Input the loan amount, interest rate, and tenure in years or months.' },
      { name: 'View EMI breakdown', text: 'See your monthly EMI, total interest payable, and principal allocation.' },
      { name: 'Explore amortization', text: 'Check the yearly amortization schedule to understand interest vs principal over time.' },
      { name: 'Use results', text: 'Share, copy, or compare with prepayment scenarios.' }
    ],
    categorySlug: 'finance',
    blogSlug: 'emi-vs-sip-which-is-better-india',
    blogTitle: 'EMI vs SIP'
  },
  'sip-calculator': {
    name: 'SIP Returns Calculator',
    displayName: 'Calculate Mutual Fund SIP Returns Online',
    category: 'FinanceApplication',
    description: 'Calculate your mutual fund SIP growth, corpus and expected returns with this India-focused SIP calculator.',
    categorySlug: 'finance',
    faqs: [
      { q: 'What is SIP?', a: 'Systematic Investment Plan allows you to invest small amounts regularly in mutual funds. Benefits include rupee cost averaging and disciplined investing.' },
      { q: 'How much return can I expect from SIP?', a: 'Historical returns vary; expect 10-12% annually for equity funds, but past performance does not guarantee future results.' },
      { q: 'Can I cancel SIP?', a: 'Yes, you can stop or modify SIP at any time with your asset management company or via your banking app.' },
      { q: 'Is SIP better than lumpsum?', a: 'For long-term goals (10+ years), SIP typically beats lumpsum due to rupee cost averaging in volatile markets.' }
    ],
    howtoSteps: [
      { name: 'Enter investment amount', text: 'Input your monthly SIP amount and select the investment duration in years.' },
      { name: 'Set expected return', text: 'Enter your expected annual rate of return (default 10% for equity funds).' },
      { name: 'Calculate corpus', text: 'View your projected corpus, total investment, and estimated returns at the end of tenure.' }
    ],
    categorySlug: 'finance',
    blogSlug: 'emi-vs-sip-which-is-better-india',
    blogTitle: 'EMI vs SIP'
  },
  'income-tax-calculator': {
    name: 'Income Tax Calculator',
    displayName: 'Calculate Income Tax for FY 2025-26',
    category: 'FinanceApplication',
    description: 'Calculate income tax liability using New vs Old regime. India income tax calculator for FY 2025-26.',
    categorySlug: 'finance',
    faqs: [
      { q: 'Which tax regime is better?', a: 'New regime offers lower rates but fewer deductions. Old regime allows deductions under Section 80C, HRA, 80D etc. Calculator helps compare.' },
      { q: 'What is tax slab rate in new regime?', a: 'Up to ₹3 lakh: 0%, ₹3-6 lakh: 5%, ₹6-9 lakh: 10%, ₹9-12 lakh: 15%, ₹12-15 lakh: 20%, above ₹15 lakh: 30% plus cess.' },
      { q: 'How is tax calculated?', a: 'Tax = (Income x slab rate) + applicable cess (4% on tax). Under old regime, deductions reduce taxable income first.' },
      { q: 'What is cess?', a: 'Health and Education Cess is 4% on tax amount. Total tax liability = Basic tax + cess + surcharge if applicable.' }
    ],
    howtoSteps: [
      { name: 'Enter gross income', text: 'Input your total annual income including salary, business, or other sources.' },
      { name: 'Select tax regime', text: 'Choose New regime (lower rates) or Old regime (allowing deductions).' },
      { name: 'Enter deductions', text: 'Under old regime, enter 80C, HRA, 80D, and other eligible deductions.' },
      { name: 'View tax liability', text: 'See calculated tax, cess, and net payable amount under both regimes.' }
    ],
    categorySlug: 'finance',
    blogSlug: 'income-tax-calculator-india-2025-26',
    blogTitle: 'Income Tax Calculator India 2025-26'
  },
  'retirement-calculator': {
    name: 'Retirement Calculator',
    displayName: 'Calculate Retirement Corpus and Pension',
    category: 'FinanceApplication',
    description: 'Plan your retirement corpus, pension, and FIRE number with this India retirement planning calculator.',
    categorySlug: 'finance',
    faqs: [
      { q: 'What is FIRE number?', a: 'Financial Independence Retire Early number is the corpus needed to generate passive income equal to expenses (typically 4% safe withdrawal rate).' },
      { q: 'How much should I retire with?', a: 'Multiply desired annual retirement expense by 25-30x. Adjust for inflation and your withdrawal rate preference.' },
      { q: 'Should I invest in NPS or mutual funds?', a: 'NPS offers tax benefits and lower returns; mutual funds offer higher growth potential. A combination often works best.' },
      { q: 'How to calculate retirement corpus?', a: 'Use the 4% rule: annual expenses x 25 = corpus needed to generate passive income at retirement.' }
    ],
    howtoSteps: [
      { name: 'Enter current age', text: 'Input your age and planned retirement age (default 60).' },
      { name: 'Set monthly expenses', text: 'Enter desired annual retirement expenses in today\'s rupees.' },
      { name: 'Choose return rate', text: 'Select expected annual return (7-8% for equity allocation).' },
      { name: 'View corpus needed', text: 'See total corpus, monthly pension, and years to reach goal.' }
    ],
    categorySlug: 'finance',
    blogSlug: 'retirement-withdrawal-rate-india',
    blogTitle: 'Retirement Withdrawal Rate'
  },
  'ppf-calculator': {
    name: 'PPF Calculator',
    displayName: 'Calculate Public Provident Fund Returns',
    category: 'FinanceApplication',
    description: 'Calculate PPF maturity value, interest earnings and tax benefits with this India PPF calculator.',
    categorySlug: 'finance',
    faqs: [
      { q: 'What is PPF?', a: 'Public Provident Fund is a long-term savings scheme with 15-year lock-in, offering tax-free returns and EEE status (Exempt, Exempt, Exempt).' },
      { q: 'Current PPF interest rate?', a: 'As of 2026, PPF offers 7.1% per annum, compounded quarterly. Rate is reviewed quarterly by the government.' },
      { q: 'PPF contribution limit?', a: 'Minimum ₹500, maximum ₹1.5 lakh per financial year. Can be deposited in lump sum or installments.' },
      { q: 'Can I withdraw from PPF?', a: 'After 15 years, full withdrawal is allowed. Partial withdrawals permitted from 12th year onwards.' }
    ],
    howtoSteps: [
      { name: 'Enter annual contribution', text: 'Input your yearly PPF investment amount (max ₹1.5 lakh).' },
      { name: 'Set tenure', text: 'Choose investment period (up to 15 years for full maturity).' },
      { name: 'View maturity value', text: 'See projected maturity amount, total interest earned, and tax benefits.' }
    ],
    categorySlug: 'finance',
    blogSlug: 'ppf-calculator-guide-india-2025',
    blogTitle: 'PPF Calculator Guide'
  },
  'gst-calculator': {
    name: 'GST Calculator',
    displayName: 'Calculate GST Amount and Price',
    category: 'FinanceApplication',
    description: 'Calculate GST amount, inclusive and exclusive prices with this India GST rate calculator for 2025.',
    categorySlug: 'finance',
    faqs: [
      { q: 'What are current GST rates in India?', a: 'GST rates include 5% (essentials), 12% (services), 18% (most goods/services), and 28% (luxury items). Some items attract 1% or 3% for specific categories.' },
      { q: 'How to calculate GST amount?', a: 'Multiply taxable value by GST rate. For inclusive prices: GST = (Price x Rate) / (100 + Rate).' },
      { q: 'What is IGST, CGST, SGST?', a: 'IGST applies to inter-state supplies; CGST+SGST apply to intra-state supplies. Each is half of the total GST rate.' },
      { q: 'Can I claim input tax credit?', a: 'Registered businesses can claim GST paid on inputs as credit against output GST liability through GSTN portal.' }
    ],
    howtoSteps: [
      { name: 'Enter price', text: 'Input the base price (exclusive or inclusive of GST).' },
      { name: 'Select GST rate', text: 'Choose from 5%, 12%, 18%, or 28% or enter custom rate.' },
      { name: 'Choose calculation type', text: 'Select whether price is exclusive or inclusive of GST.' },
      { name: 'View breakdown', text: 'See GST amount, base price, and final price in your chosen format.' }
    ],
    categorySlug: 'finance',
    blogSlug: 'gst-calculator-guide-india-2025',
    blogTitle: 'GST Calculator Guide'
  },
  'compound-interest-calculator': {
    name: 'Compound Interest Calculator',
    displayName: 'Calculate Compound Interest Growth',
    category: 'FinanceApplication',
    description: 'Calculate compound interest growth, final amount and effective return with this India compound interest calculator.',
    categorySlug: 'finance',
    faqs: [
      { q: 'What is compound interest?', a: 'Compound interest is interest earned on both principal and previously earned interest. It accelerates growth over time.' },
      { q: 'How to calculate compound interest?', a: 'A = P(1 + r/n)^(nt), where P is principal, r is rate, n is compounding frequency, t is years.' },
      { q: 'What is the Rule of 72?', a: 'Divide 72 by the interest rate to estimate years to double your money (e.g., 8% = 9 years to double).' },
      { q: 'Simple vs compound interest?', a: 'Simple interest = P x r x t. Compound = P(1+r)^t - P. Compound grows faster due to earning on interest.' }
    ],
    howtoSteps: [
      { name: 'Enter principal', text: 'Input the initial amount (principal) you want to invest or borrow.' },
      { name: 'Set interest rate', text: 'Enter annual interest rate and select compounding frequency (annual, half-yearly, quarterly, monthly).' },
      { name: 'Choose time period', text: 'Set investment duration in years.' },
      { name: 'View growth', text: 'See final amount, total interest earned, and growth chart.' }
    ],
    categorySlug: 'finance',
    blogSlug: null,
    blogTitle: null
  },
  'bmi-calculator': {
    name: 'BMI Calculator',
    displayName: 'Calculate Body Mass Index for India',
    category: 'HealthApplication',
    description: 'Calculate BMI using WHO and Asian-Indian categories with this free BMI calculator and healthy weight range.',
    categorySlug: 'health',
    faqs: [
      { q: 'What is BMI?', a: 'Body Mass Index measures weight relative to height (kg/m^2). It helps assess weight status for health risk.' },
      { q: 'What are BMI categories for India?', a: 'Underweight <18.5, Normal 18.5-22.9, Overweight 23-24.9, Obese Class I 25-29.9, Obese Class II 30+.' },
      { q: 'Is BMI accurate?', a: 'BMI is a screening tool, not diagnostic. It does not account for muscle mass, bone density, or fat distribution.' },
      { q: 'How often should I check BMI?', a: 'Check annually or before/after major lifestyle changes like weight loss or muscle gain programs.' }
    ],
    howtoSteps: [
      { name: 'Enter height', text: 'Input your height in centimeters or feet-inches.' },
      { name: 'Enter weight', text: 'Input your current weight in kilograms or pounds.' },
      { name: 'Select unit', text: 'Choose Metric or Imperial units for consistent calculation.' },
      { name: 'View BMI and category', text: 'See your BMI score, corresponding category, and healthy range for your height.' }
    ],
    categorySlug: 'health',
    blogSlug: 'how-much-health-insurance-need-india',
    blogTitle: 'Health Insurance Need'
  }
};

// Generate JSON-LD schema for a calculator
function generateSchema(meta, category, slug) {
  const name = meta.name;
  const displayName = meta.displayName || meta.name;
  const categorySlug = meta.categorySlug || 'finance';
  
  // WebApplication schema
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': name + ' — ' + displayName,
    'applicationCategory': meta.category,
    'operatingSystem': 'Web',
    'url': 'https://www.decidecalc.com/calculators/' + slug,
    'description': meta.description,
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'INR'
    },
    'browserRequirements': 'Requires JavaScript',
    'inLanguage': 'en-IN',
    'creator': {
      '@type': 'Organization',
      'name': 'DecideCalc',
      'url': 'https://www.decidecalc.com'
    }
  };

  // HowTo schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to use ' + name + ' with DecideCalc',
    'step': meta.howtoSteps.map((step, i) => ({
      '@type': 'HowToStep',
      'position': i + 1,
      'name': step.name || ('Step ' + (i + 1)),
      'text': step.text
    }))
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.decidecalc.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1), 'item': 'https://www.decidecalc.com/categories/' + categorySlug },
      { '@type': 'ListItem', 'position': 3, 'name': name }
    ]
  };

  // FAQPage schema (if FAQs exist)
  let faqSchema = null;
  if (meta.faqs && meta.faqs.length > 0) {
    faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': meta.faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.a
        }
      }))
    };
  }

  return { webAppSchema, howToSchema, breadcrumbSchema, faqSchema };
}

// Generate hreflang tags
function generateHreflang(slug) {
  return '  <link rel="alternate" hreflang="en-IN" href="https://www.decidecalc.com/calculators/' + slug + '">\n  <link rel="alternate" hreflang="x-default" href="https://www.decidecalc.com/calculators/' + slug + '">';
}

// Process all calculator files
let updatedCount = 0;
files.forEach(file => {
  const filePath = path.join(CALCULATORS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const slug = file.replace('.html', '');
  const meta = calculatorMeta[slug];
  
  if (!meta) {
    console.log('Skipping ' + file + ' - no metadata');
    return;
  }
  
  // Check if schema already exists
  if (content.includes('"@type":"WebApplication"')) {
    console.log('Schema already exists for ' + file);
    return;
  }
  
  // Generate schema
  const { webAppSchema, howToSchema, breadcrumbSchema, faqSchema } = generateSchema(meta, meta.categorySlug, slug);
  
  // Insert schema after the CSS link tag
  const cssLinkMatch = content.match(/<link rel="stylesheet" href="\/assets\/css\/main\.css">/);
  if (!cssLinkMatch) {
    console.log('Warning: CSS link not found in ' + file);
    return;
  }
  
  let newContent = content;
  
  // Insert schema blocks after CSS
  const schemaBlocks = '\n  <!-- SEO Structured Data -->\n  <script type="application/ld+json">' + JSON.stringify(webAppSchema) + '</script>\n  <script type="application/ld+json">' + JSON.stringify(howToSchema) + '</script>\n  <script type="application/ld+json">' + JSON.stringify(breadcrumbSchema) + '</script>' + (faqSchema ? '\n  <script type="application/ld+json">' + JSON.stringify(faqSchema) + '</script>' : '') + '\n  <!-- hreflang tags -->\n' + generateHreflang(slug);
  
  newContent = newContent.replace(
    /<link rel="stylesheet" href="\/assets\/css\/main\.css">/,
    '<link rel="stylesheet" href="/assets/css/main.css">' + schemaBlocks
  );
  
  // Add hreflang if missing
  if (!newContent.includes('hreflang="en-IN"')) {
    // Find the gtag script and add hreflang before it
    if (newContent.includes('window.dataLayer')) {
      newContent = newContent.replace(
        /(window\.dataLayer\s*=\s*window\.dataLayer\s*\|\| \[\];)/,
        generateHreflang(slug) + '\n  <script>\n    ' + '$1'
      );
    }
  }
  
  fs.writeFileSync(filePath, newContent);
  console.log('Updated ' + file);
  updatedCount++;
});

console.log('Done. Updated ' + updatedCount + ' files out of ' + files.length);