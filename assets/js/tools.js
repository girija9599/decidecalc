/* ============================================================
   DecideCalc — Tool registry (single source of truth)
   Every entry here maps to a real, working calculator page.
   Unfinished tools are NOT listed — only live, verified routes.
   ============================================================ */
(function () {
  'use strict';
  const DC = window.DC = window.DC || {};

  /* ---------- Categories ----------
     `order` controls homepage display order. Counts are derived from
     the live tool list so categories and totals cannot drift. */
  DC.categories = [
    { id: 'finance',  name: 'Finance & Tax',       icon: 'money',     color: 'var(--cat-finance)',  varName: '--cat-finance',  order: 1, desc: 'Loans, investments, taxes, salary & savings — money decisions made simple.' },
    { id: 'career',   name: 'Career & Salary',     icon: 'briefcase', color: 'var(--cat-career)',   varName: '--cat-career',   order: 2, desc: 'Switch jobs, negotiate hikes, plan your next career move.' },
    { id: 'health',   name: 'Health & Lifestyle',  icon: 'heart',     color: 'var(--cat-health)',   varName: '--cat-health',   order: 3, desc: 'Real age, insurance needs, BMI — decide for your wellbeing.' },
    { id: 'life',     name: 'Life Planning',       icon: 'cake',      color: 'var(--cat-life)',     varName: '--cat-life',     order: 4, desc: 'Weddings, babies, pregnancy — plan life\'s biggest moments.' },
    { id: 'business', name: 'Business Tools',      icon: 'bank',      color: 'var(--cat-business)', varName: '--cat-business', order: 5, desc: 'GST and fuel-cost tools for practical everyday planning.' },
    { id: 'unique',   name: 'Decision Tools',      icon: 'sparkle',   color: 'var(--cat-unique)',   varName: '--cat-unique',   order: 6, desc: 'Tools that exist nowhere else — score any life decision out of 100.' },
    { id: 'datetime', name: 'Date & Time',         icon: 'clock',     color: 'var(--cat-life)',     varName: '--cat-life',     order: 7, desc: 'Age, business days, leap years — everyday date maths made simple.' },
    { id: 'converter',name: 'Unit & Currency',     icon: 'scale',     color: 'var(--cat-career)',   varName: '--cat-career',   order: 8, desc: 'Length, weight, temperature, currency — accurate offline conversions.' },
    { id: 'text',     name: 'Text Tools',          icon: 'sparkle',   color: 'var(--cat-health)',   varName: '--cat-health',   order: 9, desc: 'Word counter, case converter — clean, private text utilities.' },
    { id: 'dev',      name: 'Developer Tools',     icon: 'code',      color: 'var(--cat-finance)',  varName: '--cat-finance',  order: 10, desc: 'JSON formatter, Base64, and other everyday dev utilities.' },
    { id: 'utility',  name: 'Utility Tools',       icon: 'shield',    color: 'var(--cat-unique)',   varName: '--cat-unique',   order: 11, desc: 'Passwords and other quick, private utilities — fully offline.' },
    { id: 'education',name: 'Education Tools',     icon: 'graduation',color: 'var(--cat-business)', varName: '--cat-business', order: 12, desc: 'Percentage, CGPA, marks — student-friendly academic helpers.' }
  ];

  /* ---------- Tools (live only) ----------
     slug → file at calculators/<slug>.html. */
  DC.tools = [
    /* ===== Finance & Tax (15 new + classics) ===== */
    { slug: 'emi-calculator',               name: 'EMI Calculator',                  cat: 'finance', icon: 'bank',     aliases: 'loan installment monthly emi amortization', blurb: 'Loan EMI, total interest & full amortization schedule.', popular: true, popularOrder: 1 },
    { slug: 'sip-calculator',               name: 'SIP Returns Calculator',          cat: 'finance', icon: 'trending', aliases: 'mutual fund monthly sip investment corpus',    blurb: 'Monthly SIP corpus, returns & maturity projection.', popular: true, popularOrder: 2 },
    { slug: 'income-tax-calculator',        name: 'Income Tax Calculator',           cat: 'finance', icon: 'percent',  aliases: 'itr tax regime old new cess',                  blurb: 'Old vs new regime — which saves you more tax?', popular: true, popularOrder: 3 },
    { slug: 'rent-vs-buy',                  name: 'Rent vs Buy House',               cat: 'finance', icon: 'home',     aliases: 'property house mortgage buy rent',             blurb: 'Compare the financial impact of renting and buying.' },
    { slug: 'loan-vs-investment',           name: 'Loan vs Investment',              cat: 'finance', icon: 'scale',    aliases: 'prepay invest surplus',                        blurb: 'Repay the loan or invest the money? See which wins.' },
    { slug: 'retirement-calculator',        name: 'Retirement Calculator',           cat: 'finance', icon: 'piggy',    aliases: 'fire corpus pension retire',                   blurb: 'Plan a retirement corpus, pension and FIRE number.' },
    { slug: 'fd-vs-mutual-fund',            name: 'FD vs Mutual Fund',               cat: 'finance', icon: 'trending', aliases: 'fixed deposit equity comparison',               blurb: 'Compare fixed deposits with market-linked mutual funds.' },
    { slug: 'home-loan-eligibility',        name: 'Home Loan Eligibility',           cat: 'finance', icon: 'home',     aliases: 'loan amount salary',                            blurb: 'Estimate home-loan eligibility from your income.' },
    { slug: 'ppf-calculator',               name: 'PPF Calculator',                  cat: 'finance', icon: 'piggy',    aliases: 'public provident fund',                         blurb: 'Estimate Public Provident Fund maturity value.' },
    { slug: 'gratuity-calculator',          name: 'Gratuity Calculator',             cat: 'finance', icon: 'money',    aliases: 'service gratuity exit',                         blurb: 'Estimate gratuity when you leave an eligible job.' },
    { slug: 'compound-interest-calculator', name: 'Compound Interest Calculator',    cat: 'finance', icon: 'trending', aliases: 'interest compounding lump sum',                  blurb: 'See how compound interest grows one-time savings.' },
    { slug: 'fd-calculator',                name: 'FD Calculator',                   cat: 'finance', icon: 'piggy',    aliases: 'fixed deposit maturity bank',                    blurb: 'Fixed-deposit maturity with quarterly compounding & senior bonus.' },
    { slug: 'simple-interest-calculator',   name: 'Simple Interest Calculator',      cat: 'finance', icon: 'percent',  aliases: 'si prt/100 loan',                                blurb: 'I = P×R×T/100 — compare against compound interest side-by-side.' },
    { slug: 'inflation-calculator',         name: 'Inflation Calculator',            cat: 'finance', icon: 'trending', aliases: 'future value cpi purchasing power',              blurb: 'See what ₹X today costs in Y years — and how much money shrinks.' },
    { slug: 'cagr-calculator',              name: 'CAGR Calculator',                 cat: 'finance', icon: 'trending', aliases: 'compound annual growth rate stock fund',         blurb: 'True compound annual growth rate from start to end value.' },
    { slug: 'rd-calculator',                name: 'RD Calculator',                   cat: 'finance', icon: 'piggy',    aliases: 'recurring deposit monthly rd bank post office',  blurb: 'Recurring-deposit maturity with true quarterly compounding.' },
    { slug: 'rule-of-72',                   name: 'Rule of 72 & 114',                cat: 'finance', icon: 'percent',  aliases: 'doubling time tripling rule of 114 144',         blurb: 'How fast does money double? Exact vs 72/114/144 shortcuts.' },
    { slug: 'rent-affordability-calculator', name: 'Rent Affordability Calculator',  cat: 'finance', icon: 'home',     aliases: 'how much rent can i afford 30 percent rule',     blurb: 'Safe monthly rent using the 25/30/35% rule + move-in costs.' },
    { slug: 'nps-calculator',               name: 'NPS Calculator',                  cat: 'finance', icon: 'shield',   aliases: 'national pension retirement 40 60 split',        blurb: 'NPS corpus at 60 with mandatory 40% annuity + 60% tax-free lump.' },
    { slug: 'epf-calculator',               name: 'EPF Calculator',                  cat: 'finance', icon: 'bank',     aliases: 'employee provident fund pf 12 percent eps',       blurb: 'EPF corpus at 58 — real EPS carve-out, 8.33% to pension capped ₹1,250.' },
    { slug: 'ssy-calculator',               name: 'Sukanya Samriddhi Calculator',    cat: 'finance', icon: 'baby',     aliases: 'girl child ssy 8.2 deposit 15 years maturity 21',  blurb: 'SSY: deposit 15 yrs, matures 21 yrs from opening — 8.2% tax-free.' },
    { slug: 'apy-calculator',               name: 'Atal Pension Yojana Calculator',  cat: 'finance', icon: 'shield',   aliases: 'apy atal pension yojana government scheme pension', blurb: 'Indicative APY monthly contribution from joining age and chosen pension.' },
    { slug: 'hra-calculator',               name: 'HRA Exemption Calculator',        cat: 'finance', icon: 'home',     aliases: 'house rent allowance old regime section 10 13a metro', blurb: 'Section 10(13A) three-rule minimum — metro 50% vs non-metro 40%.' },
    { slug: 'home-loan-comparison',         name: 'Home Loan Comparison',            cat: 'finance', icon: 'home',     aliases: 'compare two loans sbi hdfc emi total cost',        blurb: 'Two loans side-by-side: EMI, total cost incl fees, true winner.' },
    { slug: 'brokerage-calculator',         name: 'Brokerage Calculator',            cat: 'finance', icon: 'percent',  aliases: 'zerodha groww upstox trade cost stt gst stamp intraday', blurb: 'True trade cost: brokerage + STT + GST + stamp duty + SEBI + txn.' },
    { slug: 'stamp-duty-calculator',        name: 'Stamp Duty Calculator',           cat: 'finance', icon: 'home',     aliases: 'registration property charges state-wise circle rate', blurb: 'State-wise stamp + registration for Indian property — gender rebates.' },
    { slug: 'professional-tax-calculator',  name: 'Professional Tax Calculator',     cat: 'finance', icon: 'briefcase', aliases: 'ptax salary deduction maharashtra karnataka wb', blurb: 'State-wise monthly P-Tax slabs, special-month rules and annual caps.' },
    { slug: 'net-worth-calculator',         name: 'Net Worth Calculator',            cat: 'finance', icon: 'piggy',    aliases: 'assets liabilities wealth balance sheet',         blurb: 'Add up assets & liabilities to see your true net worth and financial-health band.' },
    { slug: 'scss-calculator',              name: 'SCSS Calculator',                 cat: 'finance', icon: 'shield',   aliases: 'senior citizen savings scheme quarterly interest retirement', blurb: 'SCSS quarterly interest, 5-year maturity and senior-savings rules.' },
    { slug: 'mortgage-calculator',          name: 'Mortgage Calculator',              cat: 'finance', icon: 'home',     aliases: 'piti pmi property tax home insurance global usa loan', blurb: 'Mortgage payment with PITI, PMI, HOA and total borrowing cost.' },
    { slug: 'debt-to-income-calculator',    name: 'Debt-to-Income Calculator',        cat: 'finance', icon: 'scale',    aliases: 'dti 28 36 rule emi nmi loan affordability debt', blurb: 'Front-end and back-end DTI for housing and loan affordability.' },
    { slug: 'esi-contribution-calculator',  name: 'ESI Contribution Calculator',       cat: 'finance', icon: 'briefcase',aliases: 'esi esic employee state insurance payroll salary wages', blurb: 'Employee and employer ESI contribution with ceiling and continuation guidance.' },
    { slug: 'credit-utilization-calculator', name: 'Credit Utilization Calculator',     cat: 'finance', icon: 'target',  aliases: 'credit utilization ratio revolving card limit balance score', blurb: 'Overall and per-card utilization with healthy bands and next steps.' },
    { slug: 'emergency-fund-calculator',     name: 'Emergency Fund Calculator',          cat: 'finance', icon: 'shield',   aliases: 'emergency fund savings months expenses rainy day cushion', blurb: 'Realistic emergency-fund target, coverage months and gap by income type and dependents.' },
    { slug: 'kvp-calculator',                name: 'KVP Calculator',                     cat: 'finance', icon: 'piggy',    aliases: 'kisan vikas patra post office small savings double money', blurb: 'KVP maturity at 7.5% p.a. compounded annually — doubles in ~115 months.' },
    { slug: 'nsc-calculator',                name: 'NSC Calculator',                     cat: 'finance', icon: 'shield',   aliases: 'national savings certificate post office 80c 5 year', blurb: 'NSC VIII Issue maturity at 7.7% p.a. with year-wise growth and 80C rules.' },
    { slug: 'savings-goal-calculator',       name: 'Savings Goal Calculator',            cat: 'finance', icon: 'target',   aliases: 'goal based saving monthly sip required target date reverse', blurb: 'Reverse-SIP: exact monthly saving needed to hit any target by your deadline.' },
    { slug: 'budget-50-30-20-calculator',   name: '50/30/20 Budget Calculator',         cat: 'finance', icon: 'pie',      aliases: '50 30 20 rule needs wants savings budget split paycheck', blurb: 'Split take-home into needs/wants/savings and grade your actual spending.' },
    { slug: 'student-loan-calculator',       name: 'Student Loan Calculator',            cat: 'finance', icon: 'graduation', aliases: 'student loan federal private payment payoff interest repayment', blurb: 'Student loan payment, payoff timeline, total interest and extra-payment impact.' },
    { slug: '401k-calculator',               name: '401(k) Calculator',                  cat: 'finance', icon: 'piggy',    aliases: '401k 401(k) employer match roth traditional retirement contribution', blurb: '401(k) balance at retirement with match, Roth vs traditional and IRS caps.' },
    { slug: 'ira-calculator',                name: 'IRA Calculator',                     cat: 'finance', icon: 'money',    aliases: 'ira roth ira traditional backdoor contribution 2025 phase out', blurb: 'Roth vs traditional IRA projection with 2025 phase-outs and backdoor guidance.' },
    { slug: 'paycheck-calculator',           name: 'Paycheck Calculator',                cat: 'finance', icon: 'money',    aliases: 'take home salary net pay withholding federal state fica w4 biweekly', blurb: 'Per-paycheck take-home: federal + state withholding, FICA and pre-tax deferrals.' },
    { slug: 'mssc-calculator',                 name: 'MSSC Calculator',                   cat: 'finance', icon: 'heart',    aliases: 'mahila samman savings certificate women post office 2 year', blurb: 'Mahila Samman Savings Certificate: 7.5% quarterly-compounded maturity over 2 years, partial withdrawal and closure rules.' },
    { slug: 'pmay-clss-subsidy-calculator',    name: 'PMAY CLSS Subsidy Calculator',      cat: 'finance', icon: 'home',     aliases: 'pmay pradhan mantri awas yojana home loan subsidy clss ews lig mig first house', blurb: 'PMAY-Urban CLSS: upfront NPV interest subsidy, reduced EMI and total interest saved for EWS, LIG, MIG-I and MIG-II.' },
    { slug: 'debt-payoff-planner',             name: 'Debt Payoff Planner',                cat: 'finance', icon: 'target',   aliases: 'debt avalanche snowball payoff plan credit cards loans', blurb: 'Compare snowball and avalanche payoff plans, timeline and interest saved.' },
    { slug: 'credit-card-payoff-calculator',   name: 'Credit Card Payoff Calculator',      cat: 'finance', icon: 'bank',     aliases: 'credit card balance apr minimum payment payoff interest', blurb: 'See your card payoff date, interest cost and extra-payment savings.' },
    { slug: 'investment-fee-calculator',       name: 'Investment Fee Calculator',          cat: 'finance', icon: 'percent',  aliases: 'expense ratio mutual fund fees investment fee drag', blurb: 'See how fund fees and expense ratios reduce long-term investment returns.' },
    { slug: 'loan-refinance-calculator',       name: 'Loan Refinance Calculator',          cat: 'finance', icon: 'scale',    aliases: 'refinance balance transfer loan switch break even fees', blurb: 'Compare keeping your loan with refinancing or a balance transfer.' },
    { slug: 'retirement-withdrawal-calculator',name: 'Retirement Withdrawal Calculator',    cat: 'finance', icon: 'piggy',    aliases: 'retirement withdrawal drawdown safe withdrawal corpus lasts', blurb: 'Estimate how long your retirement savings can support withdrawals.' },
    { slug: 'bond-ytm-calculator',             name: 'Bond Yield to Maturity Calculator',  cat: 'finance', icon: 'trending', aliases: 'bond ytm yield coupon price maturity current yield', blurb: 'Calculate current yield and yield to maturity from a bond price and coupon.' },

    /* ===== Career & Salary (3) ===== */
    { slug: 'job-switch-decision',          name: 'Job Switch Decision',             cat: 'career',  icon: 'briefcase', aliases: 'quit resign change job',                        blurb: 'Score-based guidance for a potential job switch.' },
    { slug: 'salary-hike-negotiator',       name: 'Salary Hike Negotiator',          cat: 'career',  icon: 'trending',  aliases: 'raise increment ask',                           blurb: 'Plan a salary-hike ask and negotiation script.' },
    { slug: 'career-switch-roi',            name: 'Career Switch ROI',               cat: 'career',  icon: 'graduation', aliases: 'retrain reskill mba',                           blurb: 'Estimate retraining break-even and five-year impact.' },

    /* ===== Health & Lifestyle (3) ===== */
    { slug: 'bmi-calculator',               name: 'BMI Calculator',                  cat: 'health',  icon: 'heart',    aliases: 'body mass index weight',                         blurb: 'Body Mass Index in kg/m² with India-specific guidance.', popular: true, popularOrder: 6 },
    { slug: 'real-age-calculator',          name: 'Real Age Calculator',             cat: 'health',  icon: 'heart',    aliases: 'biological age lifestyle',                       blurb: 'Estimate biological age from lifestyle inputs.' },
    { slug: 'health-insurance-need',        name: 'Health Insurance Need',           cat: 'health',  icon: 'shield',   aliases: 'medical cover policy',                            blurb: 'Estimate a suitable health-insurance cover range.' },
    { slug: 'calorie-calculator',           name: 'BMR & Calorie Calculator',        cat: 'health',  icon: 'heart',    aliases: 'tdee calories bmr weight loss meal',              blurb: 'BMR, maintenance calories & safe weight-loss targets.' },
    { slug: 'water-intake-calculator',      name: 'Water Intake Calculator',         cat: 'health',  icon: 'heart',    aliases: 'hydration water glasses litres daily',            blurb: 'Personalised daily water target by weight, climate & exercise.' },
    { slug: 'ideal-weight-calculator',      name: 'Ideal Weight Calculator',         cat: 'health',  icon: 'scale',    aliases: 'healthy weight bmi devine weight loss',           blurb: 'WHO healthy weight range + four established IBW formulas.' },
    { slug: 'sleep-calculator',             name: 'Sleep Calculator',                cat: 'health',  icon: 'moon',     aliases: 'rem cycle bedtime wake rest',                       blurb: 'Ideal bedtimes/wake times pegged to 90-minute REM cycles.' },
    { slug: 'body-fat-calculator',          name: 'Body Fat Calculator (Navy)',      cat: 'health',  icon: 'heart',    aliases: 'navy circumference body composition bf percent',      blurb: 'US Navy formula: true body-fat % without a Dexa scan.' },
    { slug: 'pace-calculator',              name: 'Running Pace Calculator',         cat: 'health',  icon: 'zap',      aliases: 'pace speed min/km marathon race time predictor',     blurb: 'Pace ↔ speed converter + Riegel race-time predictor.' },

    /* ===== Life Planning (4) ===== */
    { slug: 'pregnancy-due-date',           name: 'Pregnancy Due Date',              cat: 'life',    icon: 'baby',     aliases: 'lmp conception trimester',                       blurb: 'Estimate a due date and pregnancy week from LMP.' },
    { slug: 'pregnancy-week-tracker',       name: 'Pregnancy Week Tracker',          cat: 'life',    icon: 'baby',     aliases: 'weeks pregnant trimester milestone baby size',     blurb: 'Current week, trimester, baby size & next medical milestone.' },
    { slug: 'wedding-budget-planner',       name: 'Wedding Budget Planner',          cat: 'life',    icon: 'ring',     aliases: 'marriage ceremony venue',                        blurb: 'Plan an India-specific wedding budget allocation.' },
    { slug: 'baby-cost-calculator',         name: 'Baby Cost Calculator',            cat: 'life',    icon: 'baby',     aliases: 'child expense first year',                        blurb: 'Estimate first-year costs of having a baby in India.' },

    /* ===== Business Tools (2) ===== */
    { slug: 'gst-calculator',               name: 'GST Calculator',                  cat: 'business', icon: 'percent', aliases: 'cgst sgst tax invoice',                          blurb: 'Calculate GST-inclusive or GST-exclusive amounts.', popular: true, popularOrder: 5 },
    { slug: 'fuel-cost-calculator',         name: 'Fuel Cost Calculator',            cat: 'business', icon: 'bolt2',   aliases: 'petrol diesel mileage trip',                      blurb: 'Estimate a trip fuel cost from distance and mileage.' },

    /* ===== Decision Tools (1) ===== */
    { slug: 'life-decision-scorer',         name: 'Life Decision Scorer',            cat: 'unique',  icon: 'sparkle', aliases: 'decision score yes no maybe',                      blurb: 'Score a big decision out of 100 with practical prompts.' },

    /* ===== Date & Time (5) ===== */
    { slug: 'age-calculator',               name: 'Age Calculator',                  cat: 'datetime', icon: 'clock',    aliases: 'dob birthday years months days',                blurb: 'Exact age in years, months & days from your date of birth.' },
    { slug: 'date-difference-calculator',   name: 'Date Difference',                 cat: 'datetime', icon: 'clock',    aliases: 'days between two dates duration',                blurb: 'Days, weeks, hours & seconds between two dates.' },
    { slug: 'business-days-calculator',     name: 'Business Days Calculator',        cat: 'datetime', icon: 'briefcase',aliases: 'working days weekdays sla weekdays only',         blurb: 'Count working weekdays between two dates (excl. Sat–Sun).' },
    { slug: 'leap-year-checker',            name: 'Leap Year Checker',               cat: 'datetime', icon: 'calendar', aliases: 'february 29 leap common gregorian',              blurb: 'Check any year with the exact Gregorian rules & reasons.' },
    { slug: 'time-duration-calculator',     name: 'Time Duration Calculator',        cat: 'datetime', icon: 'clock',    aliases: 'hours minutes shift timesheet night',            blurb: 'Hours & mins between two times — night shifts handled.' },
    { slug: 'countdown-timer',              name: 'Event Countdown',                 cat: 'datetime', icon: 'clock',    aliases: 'days until event wedding exam vacation seconds',   blurb: 'Live countdown to any date — days, hours, minutes, seconds ticking.' },
    { slug: 'financial-year-calculator',    name: 'Financial Year Finder',           cat: 'datetime', icon: 'calendar', aliases: 'indian fy ay assessment year fiscal quarter',      blurb: 'Any date → its FY (Apr-Mar), AY, fiscal quarter, calendar year.' },
    { slug: 'week-number-calculator',       name: 'Week Number Calculator',          cat: 'datetime', icon: 'calendar', aliases: 'iso 8601 week of year monday sunday doy',          blurb: 'ISO-8601 + US week numbers, day-of-year, total weeks in the year.' },

    /* ===== Unit & Currency (2) ===== */
    { slug: 'unit-converter',               name: 'Unit Converter',                  cat: 'converter',icon: 'scale',    aliases: 'length weight temperature km miles cm inch kg',  blurb: 'Convert 40+ units across 7 categories — exact factors.' },
    { slug: 'currency-converter',           name: 'Currency Converter',              cat: 'converter',icon: 'money',    aliases: 'inr usd dollar rupee exchange rate',               blurb: 'INR ↔ USD/EUR/AED & 20 more — editable, offline rates.' },

    /* ===== Text Tools (3) ===== */
    { slug: 'word-counter',                 name: 'Word Counter',                    cat: 'text',     icon: 'sparkle',  aliases: 'character words essay count',                      blurb: 'Words, characters, sentences, paragraphs, reading time.' },
    { slug: 'case-converter',               name: 'Case Converter',                  cat: 'text',     icon: 'sparkle',  aliases: 'uppercase lowercase title case camel',             blurb: 'UPPER / lower / Title / Sentence / camel / snake converter.' },
    { slug: 'slug-generator',               name: 'Slug Generator',                  cat: 'text',     icon: 'sparkle',  aliases: 'url seo blog title wordpress',                     blurb: 'SEO-friendly URL slugs — stop words, hyphens, auto-clean.' },
    { slug: 'lorem-ipsum-generator',        name: 'Lorem Ipsum Generator',           cat: 'text',     icon: 'sparkle',  aliases: 'placeholder dummy filler copy',                    blurb: 'Paragraphs / sentences / words of Lorem Ipsum for mockups.' },
    { slug: 'number-to-words',              name: 'Number to Words',                 cat: 'text',     icon: 'money',    aliases: 'cheque spell currency lakh crore words',          blurb: 'Numbers → words in Indian + International systems, with currency.' },

    /* ===== Developer Tools (4) ===== */
    { slug: 'json-formatter',               name: 'JSON Formatter',                  cat: 'dev',      icon: 'code',     aliases: 'beautify minify validate json',                    blurb: 'Beautify, minify & validate JSON with exact error lines.' },
    { slug: 'base64-tool',                  name: 'Base64 & URL Tool',               cat: 'dev',      icon: 'code',     aliases: 'encode decode url percent escape',                 blurb: 'Unicode-safe Base64 + URL encoder/decoder — offline.' },
    { slug: 'markdown-to-html',             name: 'Markdown → HTML',                 cat: 'dev',      icon: 'code',     aliases: 'md converter preview render',                      blurb: 'GitHub-flavoured Markdown to HTML with live preview.' },
    { slug: 'jwt-decoder',                  name: 'JWT Decoder',                     cat: 'dev',      icon: 'lock',     aliases: 'json web token decode payload exp claims',         blurb: 'Decode JWT header & payload — claims, expiration, issuer.' },
    { slug: 'hash-generator',               name: 'Hash Generator',                  cat: 'dev',      icon: 'lock',     aliases: 'md5 sha sha1 sha256 sha512 checksum file text',    blurb: 'MD5, SHA-1, SHA-256, SHA-384, SHA-512 — fully offline.' },

    /* ===== Utility Tools (2) ===== */
    { slug: 'password-generator',           name: 'Password Generator',              cat: 'utility',  icon: 'shield',   aliases: 'strong random secure crypto',                      blurb: 'Cryptographically-strong random passwords — 100% offline.' },
    { slug: 'random-number-generator',      name: 'Random Number Generator',         cat: 'utility',  icon: 'sparkle',  aliases: 'dice roll coin flip lottery random picker',        blurb: 'Secure random numbers — range, dice, coin flips & lottery picks.' },
    { slug: 'password-strength-meter',      name: 'Password Strength Meter',         cat: 'utility',  icon: 'shield',   aliases: 'check entropy crack time bits',                    blurb: 'Entropy + crack-time + pattern detection — fully offline.' },
    { slug: 'uuid-generator',               name: 'UUID Generator',                  cat: 'utility',  icon: 'zap',      aliases: 'guid v4 random identifier bulk',                   blurb: 'Cryptographically-strong v4 UUIDs — one or bulk generate.' },

    /* ===== Education Tools (2) ===== */
    { slug: 'percentage-calculator',        name: 'Percentage Calculator',           cat: 'education',icon: 'percent',  aliases: 'marks discount hike percent of',                   blurb: 'X% of Y, what %, % change & discounts — four modes in one.' },
    { slug: 'cgpa-calculator',              name: 'CGPA Calculator',                 cat: 'education',icon: 'graduation',aliases: 'sgpa cgpa university 9.5 10',                     blurb: 'Credit-weighted CGPA + % conversion for Indian universities.' },
    { slug: 'marks-percentage-calculator',  name: 'Marks to Percentage',             cat: 'education',icon: 'graduation',aliases: 'marks percentage score grade board cbse',           blurb: 'Simple total or subject-wise marks-to-percentage conversion.' }
  ];

  DC.tool = function (slug) {
    for (let i = 0; i < DC.tools.length; i++) if (DC.tools[i].slug === slug) return DC.tools[i];
    return null;
  };
  DC.catName = function (id) {
    for (let i = 0; i < DC.categories.length; i++) if (DC.categories[i].id === id) return DC.categories[i];
    return null;
  };
  DC.categoriesSorted = function () {
    return DC.categories.slice().sort(function (a, b) { return (a.order || 99) - (b.order || 99); });
  };
  DC.catCount = function (id) {
    return DC.tools.filter(function (t) { return t.cat === id; }).length;
  };
  DC.popular = function (n) {
    n = n || 6;
    return DC.tools.filter(function (t) { return t.popular; })
      .sort(function (a, b) { return (a.popularOrder || 99) - (b.popularOrder || 99); })
      .slice(0, n);
  };
  DC.related = function (slug, n) {
    n = n || 3;
    const t = DC.tool(slug); if (!t) return [];
    const sameCat = DC.tools.filter(function (x) { return x.cat === t.cat && x.slug !== slug; });
    const others = DC.tools.filter(function (x) { return x.cat !== t.cat && x.slug !== slug; });
    return sameCat.concat(others).slice(0, n);
  };
  DC.toolMatches = function (t, q) {
    if (!q) return true;
    const hay = (t.name + ' ' + t.blurb + ' ' + (t.aliases || '')).toLowerCase();
    return hay.indexOf(q) !== -1;
  };
})();
