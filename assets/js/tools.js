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
    { slug: 'car-loan-calculator',             name: 'Car Loan Calculator',                cat: 'finance', icon: 'zap',      aliases: 'auto loan car payment vehicle financing monthly installment amortization', blurb: 'Monthly car payment, total interest and full amortization for any auto loan.', popular: true, popularOrder: 7 },
    { slug: '8th-pay-commission-calculator',   name: '8th Pay Commission Calculator',      cat: 'finance', icon: 'briefcase', aliases: '8th cpc pay commission fitment factor central government salary india arrears', blurb: 'Estimate your 8th CPC salary with fitment factor scenarios, HRA, TA, deductions, and arrears calculator.' },
    { slug: 'emi-vs-sip-comparison',           name: 'EMI vs SIP Comparison',              cat: 'finance', icon: 'scale',    aliases: 'emi vs sip which is better loan prepayment vs invest india', blurb: 'Compare loan prepayment vs SIP investing — see which gives better returns.' },
    { slug: 'fd-vs-mutual-fund-comparison',    name: 'FD vs Mutual Fund Comparison',       cat: 'finance', icon: 'trending', aliases: 'fd vs mutual fund which is better fixed deposit vs mf india', blurb: 'Compare FD returns vs Mutual Fund SIP with risk, returns & tax analysis.' },
    { slug: 'rent-vs-buy-comparison',          name: 'Rent vs Buy Comparison',             cat: 'finance', icon: 'home',     aliases: 'rent vs buy house property india roi calculator', blurb: 'Compare renting vs buying a house with ROI, break-even & cost analysis.' },

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
    { slug: 'auto-loan-calculator', name: 'Auto Loan Calculator', cat: 'finance', icon: 'zap', aliases: 'car auto vehicle financing monthly payment amortization', blurb: 'Monthly payment, total interest and full amortization for any auto loan.' },
    { slug: 'used-car-loan-calculator', name: 'Used Car Loan Calculator', cat: 'finance', icon: 'zap', aliases: 'preowned used auto financing monthly payment', blurb: 'Monthly payment and total interest for a pre-owned vehicle loan.' },
    { slug: 'truck-loan-calculator', name: 'Truck Loan Calculator', cat: 'finance', icon: 'zap', aliases: 'pickup commercial truck financing payment', blurb: 'Monthly payment and total interest for a new or work truck loan.' },
    { slug: 'motorcycle-loan-calculator', name: 'Motorcycle Loan Calculator', cat: 'finance', icon: 'zap', aliases: 'motorcycle bike financing two-wheeler payment', blurb: 'Monthly payment for a motorcycle or two-wheeler loan.' },
    { slug: 'scooter-loan-calculator', name: 'Scooter Loan Calculator', cat: 'finance', icon: 'zap', aliases: 'scooter moped two-wheeler financing payment', blurb: 'Monthly installment for a scooter or moped purchase.' },
    { slug: 'bike-loan-calculator', name: 'Bike Loan Calculator', cat: 'finance', icon: 'zap', aliases: 'bike two-wheeler motorcycle emi installment', blurb: 'Monthly EMI for a commuter bike or motorcycle loan.' },
    { slug: 'ev-loan-calculator', name: 'EV Loan Calculator', cat: 'finance', icon: 'zap', aliases: 'electric vehicle ev green loan charging', blurb: 'Monthly payment for an electric-vehicle purchase.' },
    { slug: 'personal-loan-calculator', name: 'Personal Loan Calculator', cat: 'finance', icon: 'percent', aliases: 'unsecured personal loan debt consolidation medical', blurb: 'Monthly payment for a fixed-rate personal loan.' },
    { slug: 'iphone-emi-calculator', name: 'iPhone EMI Calculator', cat: 'finance', icon: 'zap', aliases: 'iphone apple smartphone installment emi plan', blurb: 'Monthly installment and interest for an iPhone on finance.' },
    { slug: 'phone-emi-calculator', name: 'Phone EMI Calculator', cat: 'finance', icon: 'zap', aliases: 'phone smartphone android installment emi plan', blurb: 'Monthly installment for any smartphone on EMI.' },
    { slug: 'laptop-emi-calculator', name: 'Laptop EMI Calculator', cat: 'finance', icon: 'zap', aliases: 'laptop computer notebook installment emi plan', blurb: 'Monthly installment for a laptop purchase.' },
    { slug: 'ipad-emi-calculator', name: 'iPad EMI Calculator', cat: 'finance', icon: 'zap', aliases: 'ipad tablet apple installment emi plan', blurb: 'Monthly installment for an iPad or tablet.' },
    { slug: 'tv-emi-calculator', name: 'Tv EMI Calculator', cat: 'finance', icon: 'zap', aliases: 'tv television smart-tv installment emi plan', blurb: 'Monthly installment for a smart TV or home-theater purchase.' },
    { slug: 'appliance-emi-calculator', name: 'Appliance EMI Calculator', cat: 'finance', icon: 'zap', aliases: 'appliance refrigerator washer ac installment emi', blurb: 'Monthly installment for a home appliance purchase.' },
    { slug: 'loan-payment-calculator', name: 'Loan Payment Calculator', cat: 'finance', icon: 'percent', aliases: 'loan payment fixed-rate amortization installment', blurb: 'Monthly payment on any fixed-rate loan.' },
    { slug: 'interest-calculator', name: 'Interest Calculator', cat: 'finance', icon: 'trending', aliases: 'interest simple compound growth savings', blurb: 'Simple and compound interest on any amount over time.' },
    { slug: 'debt-payoff-calculator', name: 'Debt Payoff Calculator', cat: 'finance', icon: 'zap', aliases: 'debt payoff credit-card loan timeline extra-payment', blurb: 'How long to pay off a balance plus interest saved by paying extra.' },
    { slug: 'discount-calculator', name: 'Discount Calculator', cat: 'finance', icon: 'percent', aliases: 'discount percent off sale price savings', blurb: 'Final price and savings for any percent-off sale, including stacked discounts.' },
    { slug: 'tip-calculator', name: 'Tip Calculator', cat: 'finance', icon: 'percent', aliases: 'tip gratuity restaurant delivery split check', blurb: 'Tip amount, total bill and per-person split for dining and delivery.' },
    { slug: 'sales-tax-calculator', name: 'Sales Tax Calculator', cat: 'finance', icon: 'percent', aliases: 'sales tax vat state retail total price', blurb: 'Add or remove sales tax using any state or local rate.' },
    { slug: 'take-home-pay-calculator', name: 'Take Home Pay Calculator', cat: 'finance', icon: 'trending', aliases: 'take-home pay net salary income tax fica', blurb: 'Estimate your net paycheck from a US gross salary.' },
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

  /* Map calculator slugs to relevant blog articles. Curated, not random —
     keeps calculator pages pointed at genuinely useful reading. */
  DC.relatedArticles = {
    'compound-interest-calculator': ['how-to-calculate-compound-interest', 'simple-interest-vs-compound-interest', 'how-much-will-10000-grow-compound-interest'],
    'simple-interest-calculator': ['simple-interest-vs-compound-interest', 'how-to-calculate-compound-interest'],
    'mortgage-calculator': ['how-to-calculate-mortgage-payment', '30-year-vs-15-year-mortgage', 'how-much-house-can-i-afford'],
    'paycheck-calculator': ['how-to-calculate-paycheck-from-salary', 'gross-pay-vs-net-pay', 'how-to-calculate-investment-return'],
    'percentage-calculator': ['how-to-calculate-percentage-increase-and-decrease', 'how-to-calculate-a-discount'],
    'savings-goal-calculator': ['how-much-will-10000-grow-compound-interest', 'how-to-calculate-savings-rate'],
    'budget-50-30-20-calculator': ['how-to-calculate-paycheck-from-salary'],
    'investment-fee-calculator': ['mutual-fund-expense-ratio-impact-india', 'how-to-calculate-compound-interest'],
    'credit-card-payoff-calculator': ['debt-snowball-vs-avalanche-india', 'credit-card-minimum-payment-payoff-india'],
    'debt-payoff-planner': ['debt-snowball-vs-avalanche-india', 'credit-card-minimum-payment-payoff-india'],
    'retirement-calculator': ['retirement-withdrawal-rate-india', 'how-much-will-10000-grow-compound-interest'],
    'retirement-withdrawal-calculator': ['retirement-withdrawal-rate-india', 'emi-vs-sip-which-is-better-india'],
    'home-loan-refinance-calculator': ['home-loan-balance-transfer-refinance-india'],
    'rent-vs-buy': ['rent-or-buy-house-2026-india', 'how-to-calculate-mortgage-payment', '30-year-vs-15-year-mortgage'],
    'loan-refinance-calculator': ['home-loan-balance-transfer-refinance-india', 'how-to-calculate-loan-interest'],
    'emi-calculator': ['emi-vs-sip-which-is-better-india', 'how-to-calculate-loan-interest', 'how-to-calculate-mortgage-payment'],
    'sip-calculator': ['emi-vs-sip-which-is-better-india', 'how-much-will-10000-grow-compound-interest', 'how-to-calculate-compound-interest'],
    'income-tax-calculator': ['how-to-calculate-paycheck-from-salary', 'gross-pay-vs-net-pay'],
    'bond-ytm-calculator': ['bond-yield-vs-ytm-india'],
    'car-loan-calculator': ['how-to-calculate-car-payment', 'how-to-calculate-loan-interest', '30-year-vs-15-year-mortgage'],
    'apy-calculator': ['apr-vs-apy'],
    'health-insurance-need': ['how-much-health-insurance-need-india'],
    'cagr-calculator': ['how-much-will-10000-grow-compound-interest', 'how-to-calculate-investment-return'],
    'rule-of-72': ['how-much-will-10000-grow-compound-interest', 'how-to-calculate-compound-interest'],
    'inflation-calculator': ['how-to-calculate-inflation-rate', 'how-to-calculate-investment-return'],
    '401k-calculator': ['401k-vs-roth-ira', 'how-to-calculate-savings-rate'],
    'ira-calculator': ['401k-vs-roth-ira', 'how-to-calculate-savings-rate'],
    'auto-loan-calculator': ['how-to-calculate-car-payment', 'how-to-calculate-loan-interest', 'how-much-motorcycle-can-i-afford'],
    'used-car-loan-calculator': ['how-to-calculate-car-payment', 'how-to-calculate-loan-interest'],
    'truck-loan-calculator': ['how-to-calculate-car-payment', 'how-to-calculate-loan-interest'],
    'motorcycle-loan-calculator': ['how-much-motorcycle-can-i-afford', 'how-to-calculate-loan-interest'],
    'scooter-loan-calculator': ['how-much-motorcycle-can-i-afford', 'how-to-calculate-loan-interest'],
    'bike-loan-calculator': ['how-much-motorcycle-can-i-afford', 'how-to-calculate-loan-interest'],
    'ev-loan-calculator': ['how-to-calculate-car-payment', 'how-to-calculate-loan-interest'],
    'personal-loan-calculator': ['how-to-pay-off-debt-fast', 'how-to-calculate-loan-interest'],
    'iphone-emi-calculator': ['should-you-finance-a-phone', 'how-to-calculate-a-discount'],
    'phone-emi-calculator': ['should-you-finance-a-phone', 'how-to-calculate-a-discount'],
    'laptop-emi-calculator': ['should-you-finance-a-phone', 'how-to-calculate-a-discount'],
    'ipad-emi-calculator': ['should-you-finance-a-phone', 'how-to-calculate-a-discount'],
    'tv-emi-calculator': ['should-you-finance-a-phone', 'how-to-calculate-a-discount'],
    'appliance-emi-calculator': ['should-you-finance-a-phone', 'how-to-calculate-a-discount'],
    'loan-payment-calculator': ['how-to-calculate-loan-interest', 'how-to-pay-off-debt-fast'],
    'interest-calculator': ['how-to-calculate-loan-interest', 'how-to-pay-off-debt-fast'],
    'debt-payoff-calculator': ['how-to-pay-off-debt-fast', 'debt-snowball-vs-avalanche-india', 'credit-card-minimum-payment-payoff-india'],
    'discount-calculator': ['how-to-calculate-a-discount', 'how-to-calculate-percentage-increase-and-decrease'],
    'tip-calculator': ['how-to-calculate-tip', 'how-to-calculate-percentage-increase-and-decrease'],
    'sales-tax-calculator': ['what-is-sales-tax-how-to-calculate', 'how-to-calculate-a-discount'],
    'take-home-pay-calculator': ['how-to-calculate-take-home-pay', 'how-to-calculate-paycheck-from-salary', 'gross-pay-vs-net-pay'],
    'student-loan-calculator': ['how-to-calculate-student-loan-interest', 'how-to-calculate-loan-interest'],
    '8th-pay-commission-calculator': ['8th-pay-commission-calculator-2026'],
    '8th-pay-commission-calculator-2026': ['8th-pay-commission-calculator'],
    'emi-vs-sip-comparison': ['emi-vs-sip-which-is-better-india', 'how-to-calculate-loan-interest', 'how-much-will-10000-grow-compound-interest'],
    'fd-vs-mutual-fund-comparison': ['mutual-fund-expense-ratio-impact-india', 'how-much-will-10000-grow-compound-interest'],
    'rent-vs-buy-comparison': ['rent-or-buy-house-2026-india', 'how-to-calculate-mortgage-payment'],
    'ppf-calculator': ['ppf-calculator-guide-india-2025'],
    'gst-calculator': ['gst-calculator-guide-india-2025'],
    'income-tax-calculator': ['income-tax-calculator-india-2025-26', 'how-to-calculate-paycheck-from-salary', 'gross-pay-vs-net-pay']
  };
  DC.relatedArticlesList = function (slug, n) {
    n = n || 3;
    const list = DC.relatedArticles[slug] || [];
    return list.slice(0, n);
  };
  DC.blogMeta = {
    'how-to-calculate-compound-interest': { title: 'How to Calculate Compound Interest: Formula, Examples & Free Calculator', desc: 'Learn the compound interest formula step by step with a $10,000 example, see how monthly compounding changes the result, and use our free compound interest calculator to project your savings instantly.', icon: 'trending' },
    'simple-interest-vs-compound-interest': { title: 'Simple Interest vs. Compound Interest: What\'s the Difference?', desc: 'Simple interest is a flat slice of the principal; compound interest is interest on interest. Compare both formulas side-by-side with $10,000 at 8% for 20 years.', icon: 'percent' },
    'how-much-will-10000-grow-compound-interest': { title: 'How Much Will $10,000 Grow With Compound Interest?', desc: 'Run exact future values for $10,000 at 5%, 7%, and 10% over 10–30 years. See the difference between annual, monthly and daily compounding and the Rule of 72 shortcut.', icon: 'piggy' },
    'how-to-calculate-mortgage-payment': { title: 'How to Calculate Your Monthly Mortgage Payment (PITI Formula)', desc: 'Step-by-step mortgage payment formula — P, r, n, taxes, insurance and PMI — with a $320,000 example and a side-by-side 15 vs 30 year cost comparison.', icon: 'home' },
    '30-year-vs-15-year-mortgage': { title: '30-Year vs. 15-Year Mortgage: Which Costs Less Overall?', desc: 'The 30-year gives you a lower payment; the 15-year cuts total interest nearly in half. See the exact monthly cost, total interest, and personal-finance trade-offs.', icon: 'home' },
    'how-much-house-can-i-afford': { title: 'How Much House Can I Afford on My Income? (The 28/36 Rule)', desc: 'Calculate your maximum mortgage payment from income, debts and down payment using the 28/36 rule, and see exactly what your home budget is at $70K, $90K and $110K.', icon: 'home' },
    'how-to-calculate-paycheck-from-salary': { title: 'How to Calculate Take-Home Pay From Your Annual Salary', desc: 'Convert salary to hourly, bi-weekly or monthly pay, then subtract federal tax, FICA, state income tax and benefits to find your real paycheck in the USA.', icon: 'money' },
    'gross-pay-vs-net-pay': { title: 'Gross Pay vs. Net Pay: What\'s the Difference?', desc: 'Gross is before deductions; net is what actually hits your bank. See a full stub breakdown of federal withholding, FICA (7.65%), state tax and pre-tax 401(k).', icon: 'money' },
    'how-to-calculate-percentage-increase-and-decrease': { title: 'How to Calculate Percentage Increase and Percentage Decrease', desc: 'The percentage-change formula (+ and −), salary-raise example, stock-price example, and the simple rule that avoids the most common mistake.', icon: 'percent' },
    'how-to-calculate-a-discount': { title: 'How to Calculate a Discount: Sale Price, Savings & Original Price', desc: 'Three quick formulas: find the sale price, find what you saved, or reverse it to recover the original price before a 20% or 30% off tag.', icon: 'percent' },
    'how-to-calculate-loan-interest': { title: 'How to Calculate How Much Interest You\'ll Pay on a Loan', desc: 'Amortization vs simple interest, the PMT formula, and the exact total interest on a $35,000 car loan at 10% — plus how one extra payment cuts it.', icon: 'bank' },
    'how-to-calculate-investment-return': { title: 'How to Calculate Investment Return (CAGR vs. Simple Growth)', desc: 'Total return vs annualized return, the XIRR effect of monthly contributions, and why 10 years of 7% beats 20 years of 5%.', icon: 'trending' },
    'rent-or-buy-house-2026-india': { title: 'Rent or Buy a House in 2026? A Complete Framework', desc: 'Compare down payment, closing costs, mortgage, rent, property taxes, maintenance and opportunity cost to see whether renting or buying builds more wealth in 2026.', icon: 'home' },
    'how-to-calculate-inflation-rate': { title: 'How to Calculate the Inflation Rate (CPI Formula)', desc: 'The inflation rate formula, CPI explained, real vs nominal return, and how $50,000 in cash loses purchasing power at 3% annual inflation.', icon: 'percent' },
    'how-to-calculate-savings-rate': { title: 'How to Calculate Your Savings Rate (Formula + FIRE Targets)', desc: 'The savings rate formula, gross vs net income basis, employer 401(k) match treatment, and the FIRE savings-rate benchmarks that determine your retirement date.', icon: 'piggy' },
    'apr-vs-apy': { title: 'APR vs APY: What\'s the Difference? (With Formula)', desc: 'APR vs APY explained: the conversion formula, which rate applies to credit cards vs savings accounts, and how daily compounding changes the true cost.', icon: 'percent' },
    '401k-vs-roth-ira': { title: '401(k) vs Roth IRA: Which Should You Fund First?', desc: 'The tax difference, 2026 contribution limits, employer match rules, and the expert-recommended order of operations for US retirement savers.', icon: 'bank' },
    'how-to-calculate-student-loan-interest': { title: 'How to Calculate Student Loan Interest (Daily Accrual Formula)', desc: 'Daily interest accrual on federal student loans, subsidized vs unsubsidized, IDR plans, and the true 10-year cost of a $30,000 loan at 5.5%.', icon: 'money' },
    'bond-yield-vs-ytm-india': { title: 'Bond Yield vs YTM in India', desc: 'Current yield, yield to maturity, coupon income and the price-to-face-value gap — how to evaluate any Indian bond before you invest.', icon: 'bank' },
    'credit-card-minimum-payment-payoff-india': { title: 'Credit Card Minimum Payment Trap: India Payoff Guide', desc: 'Why paying only the minimum on an Indian credit card costs lakhs, how revolver interest and grace-period loss work, and a faster payoff plan.', icon: 'percent' },
    'debt-snowball-vs-avalanche-india': { title: 'Debt Snowball vs Avalanche: India Payoff Guide', desc: 'Compare the snowball and avalanche methods for Indian credit cards and personal loans, and build the payoff sequence that fits your behaviour.', icon: 'trending' },
    'emi-vs-sip-which-is-better-india': { title: 'EMI vs SIP: Which Is Better in India?', desc: 'Should you prepay your home loan or invest through a SIP? An India-first framework using interest rate, tax benefit and time horizon.', icon: 'scale' },
    'how-much-home-loan-on-my-salary': { title: 'How Much Home Loan Can I Get on My Salary? (2026 Eligibility Guide)', desc: 'FOIR, EMI capacity and LTV explained with a salary-wise home loan eligibility table for Rs 30k-1.5 lakh incomes, plus a free eligibility calculator.', icon: 'home' },
    'how-much-sip-for-1-crore': { title: 'SIP Calculator Guide: How Much to Invest Monthly for Rs 1 Crore', desc: 'Exact monthly SIP for a 1 crore corpus at every horizon — Rs 4,300 for 25 years, Rs 10,100 for 20 — with step-up maths and a free SIP calculator.', icon: 'piggy' },
    'how-to-calculate-in-hand-salary-from-ctc': { title: 'In-Hand Salary Calculator India 2026: CTC to Take-Home Pay', desc: 'How CTC becomes in-hand salary: EPF, gratuity, professional tax and income tax under both regimes, with a Rs 12 lakh CTC worked example.', icon: 'money' },
    'nps-vs-ppf-vs-epf': { title: 'NPS vs PPF vs EPF: Which Retirement Scheme Wins in 2026?', desc: 'NPS, PPF and EPF compared on returns, tax, liquidity and lock-in — with a Rs 10,000/month 20-year projection and which scheme fits which goal.', icon: 'piggy' },
    'bmi-calculator-for-indian-adults': { title: 'BMI Calculator for Indian Adults: What Is a Healthy Range?', desc: 'Why the ICMR healthy BMI range (18-22.9) is lower than WHO norms, healthy weight by height for Indian adults, and the waist-size numbers that matter more.', icon: 'heart' },
    'personal-loan-vs-car-loan': { title: 'Personal Loan vs Car Loan: Which Is Better in India?', desc: 'Personal loan vs car loan compared on rates, tenure, fees and total cost with an Rs 8 lakh worked example — plus when the pricier loan wins.', icon: 'bank' },
    'hra-exemption-calculation-example': { title: 'HRA Exemption Explained: How Much Tax Can You Actually Save?', desc: 'HRA exemption calculation with worked examples: the three-rule least-of formula, metro vs non-metro, and the five mistakes that trigger notices.', icon: 'home' },
    'credit-card-emi-vs-personal-loan': { title: 'Credit Card EMI vs Personal Loan: Which Costs Less?', desc: 'Credit card EMI vs personal loan compared on a Rs 1 lakh 12-month example — flat vs reducing rates, the GST trap, and when each option wins.', icon: 'percent' },
    'how-to-calculate-emi-manually': { title: 'How EMI Is Calculated: The Formula With a Worked Example', desc: 'Calculate EMI manually: the reducing-balance formula step by step on a Rs 10 lakh loan, with mental-math shortcuts and the flat-rate trap explained.', icon: 'bank' },
    'gratuity-calculation-formula-india': { title: 'Gratuity Calculation in India: Formula, Eligibility & Examples', desc: 'The 15/26 gratuity formula with worked examples, the 5-year eligibility rule, the Rs 20 lakh tax exemption limit, and rounding rules explained.', icon: 'briefcase' },
    'stamp-duty-and-registration-charges-india': { title: 'Stamp Duty & Registration Charges by State (2026 Guide)', desc: 'State-wise stamp duty and registration rates for 2026 — Maharashtra, Delhi, Karnataka, UP and more — with women concessions and a Rs 50 lakh worked example.', icon: 'home' },
    '50-30-20-budget-rule-indian-salary': { title: 'The 50/30/20 Budget Rule, Adapted for Indian Salaries', desc: 'The 50/30/20 rule on real Indian salaries — needs/wants/savings splits at Rs 35k-1.2L, metro rent reality, and when 60/25/15 beats the textbook.', icon: 'piggy' },
    'should-i-switch-jobs-for-20-percent-hike': { title: 'Should You Switch Jobs for a 20% Hike? A Decision Framework', desc: 'A framework for the 20% hike decision: in-hand maths, forfeited bonuses and gratuity, role risk scoring, and what staying really costs over five years.', icon: 'briefcase' },
    'first-year-baby-cost-india': { title: 'First-Year Baby Costs in India: A Realistic Budget Breakdown', desc: 'What a baby costs in year one in India — delivery, diapers, vaccines, childcare by city tier, from Rs 60,000 to Rs 6 lakh, with savings tips and pre-baby money moves.', icon: 'baby' },
    'cagr-vs-absolute-returns': { title: 'CAGR vs Absolute Returns: Why Your Fund App Might Mislead You', desc: 'CAGR vs absolute returns explained with a Rs 5 lakh example — why your fund apps headline number depends on the timeframe, and when to use XIRR instead.', icon: 'trending' },
    'esic-vs-esi-explained': { title: 'ESIC vs ESI: What It Means for Your Salary', desc: 'ESIC vs ESI explained: the 0.75% + 3.25% contribution rates, the Rs 21,000 ceiling, the full benefits stack, and how to read the ESI line on your payslip.', icon: 'shield' },
    'zerodha-vs-upstox-vs-angel-one-brokerage-comparison': { title: 'Zerodha vs Upstox vs Angel One: Brokerage & STT Compared (2026)', desc: 'Zerodha, Upstox and Angel One brokerage compared — delivery, intraday, F&O and options charges with a Rs 1 lakh all-in trade breakdown and STT reality check.', icon: 'percent' },
    'ppf-calculator-15-years': { title: 'PPF Calculator for 15 Years: Full Year-by-Year Maturity Schedule', desc: 'The complete 15-year PPF maturity chart at 7.1% — Rs 1.5 lakh a year matures at Rs 40.68 lakh — plus extension rules, withdrawal limits and deposit timing.', icon: 'piggy' },
    'indian-wedding-cost-city-wise': { title: 'How Much Does an Indian Wedding Really Cost? City-Wise Budget', desc: 'Indian wedding costs by city in 2026: Rs 8-15 lakh in tier-3 towns to Rs 35-70 lakh in metros, category shares, destination maths and real saving levers.', icon: 'ring' },
    'atal-pension-yojana-explained': { title: 'Atal Pension Yojana Explained: Contribution & Payout Rules', desc: 'Atal Pension Yojana: monthly contributions for Rs 1,000-5,000 pensions by entry age, eligibility, exit and nominee rules, tax benefits and honest return analysis.', icon: 'shield' },
    'how-to-reduce-home-loan-emi': { title: 'How to Reduce Your Home Loan EMI: 7 Practical Ways (India, 2026)', desc: '7 practical, India-specific ways to lower your home loan EMI in 2026 — from prepayment to refinancing — plus a free EMI calculator to see your exact savings.', icon: 'home' },
    'home-loan-balance-transfer-refinance-india': { title: 'Home Loan Balance Transfer vs Refinance in India', desc: 'When transferring or refinancing a home loan actually saves money after processing, legal, valuation, GST and prepayment charges.', icon: 'home' },
    'how-much-health-insurance-need-india': { title: 'How Much Health Insurance Cover You Need in India', desc: 'Estimate the right family health cover using your city, age, employer policy and medical inflation — with a step-by-step worksheet.', icon: 'shield' },
    'mutual-fund-expense-ratio-impact-india': { title: 'How Expense Ratio Eats Your Mutual Fund Returns', desc: 'See how a small expense ratio, recurring cost and tracking difference compound over years and shrink your final corpus in India.', icon: 'trending' },
    'how-to-calculate-car-payment': { title: 'How to Calculate a Car Payment (With Formula)', desc: 'The car payment formula step by step, a $28,000 auto loan worked example at 7% APR, how down payment and term change the math, and the dealer tactics to watch for.', icon: 'zap' },
    'how-much-motorcycle-can-i-afford': { title: 'How Much Motorcycle Can I Afford? Budget Rules & Payment Math', desc: 'Afford a motorcycle without wrecking your budget: the 10/20 rule, insurance markup by engine size, gear and registration costs, and a $12,000 bike worked example.', icon: 'zap' },
    'should-you-finance-a-phone': { title: 'Should You Finance a Phone? 0% EMI vs Credit Card vs Cash', desc: 'When phone financing makes sense: 0% carrier plans vs credit-card EMI vs cash, the hidden cost of "free phone" trade-in deals, and the 24-month upgrade trap.', icon: 'percent' },
    'how-to-calculate-tip': { title: 'How to Calculate a Tip: Fast Mental Math, Splits & Tipping Guide', desc: 'The 10% trick for instant tip math, pre-tax vs post-total debates, how to split a tip across a group, US vs India vs Europe norms, and delivery-app tip screens.', icon: 'percent' },
    'what-is-sales-tax-how-to-calculate': { title: 'What Is Sales Tax? How to Calculate It (Formulas + Examples)', desc: 'Sales tax explained: add it to a price, reverse it out of a total, combined state and local rates, tax on discounted items, and US vs GST vs VAT differences.', icon: 'percent' },
    'how-to-calculate-take-home-pay': { title: 'How to Calculate Take-Home Pay From Salary (Step by Step)', desc: 'From gross salary to the number that lands in your bank: federal brackets, FICA at 7.65%, state tax, 401(k) and insurance deductions with a $75,000 example.', icon: 'money' },
    'how-to-pay-off-debt-fast': { title: 'How to Pay Off Debt Fast: Avalanche vs Snowball + Payoff Math', desc: 'The fastest way to become debt-free: avalanche vs snowball compared on $23,900 of real debt, the minimum-payment trap, and extra-payment strategies that cut years.', icon: 'trending' },
    'retirement-withdrawal-rate-india': { title: 'Retirement Withdrawal Rates in India: A Practical Guide', desc: 'Inflation, sequence-of-returns risk and flexibility — how long a retirement corpus could last at different withdrawal rates in India.', icon: 'piggy' },
    '8th-pay-commission-calculator-2026': { title: '8th Pay Commission Calculator 2026: Estimated Salary, Fitment Factor & Arrears Guide', desc: 'Complete guide to the 8th CPC with fitment factor scenarios, salary estimation formula, HRA changes, arrears calculation, and a free calculator for Indian government employees.', icon: 'briefcase' },
    'ppf-calculator-guide-india-2025': { title: 'PPF Calculator Guide: Plan Your Tax-Free Corpus (India 2025)', desc: 'How PPF works, current interest rate, contribution limits, tax benefits under 80C, and how to estimate your maturity amount with our calculator.', icon: 'piggy' },
    'gst-calculator-guide-india-2025': { title: 'GST Calculator Guide: How to Calculate GST in India (2025)', desc: 'Learn GST rates, inclusive vs exclusive pricing, CGST/SGST vs IGST, and how to calculate GST for any item or service in India.', icon: 'percent' },
    'income-tax-calculator-india-2025-26': { title: 'Income Tax Calculator India 2025-26: New vs Old Regime Guide', desc: 'Compare new vs old tax regime, latest tax slabs, deductions, and learn which regime saves you more tax in FY 2025-26.', icon: 'money' }
  };

  DC.toolMatches = function (t, q) {
    if (!q) return true;
    const hay = (t.name + ' ' + t.blurb + ' ' + (t.aliases || '')).toLowerCase();
    return hay.indexOf(q) !== -1;
  };
})();
