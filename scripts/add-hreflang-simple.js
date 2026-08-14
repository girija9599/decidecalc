const fs = require('fs');
const path = require('path');

const CALCULATORS_DIR = path.join(__dirname, '..', 'calculators');
const files = fs.readdirSync(CALCULATORS_DIR).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(CALCULATORS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const slug = file.replace('.html', '');
  
  // Skip if already has hreflang
  if (content.includes('hreflang=')) {
    return;
  }
  
  // Add hreflang before </head>
  const hreflang = '  <link rel="alternate" hreflang="en-IN" href="https://www.decidecalc.com/calculators/' + slug + '">\n  <link rel="alternate" hreflang="x-default" href="https://www.decidecalc.com/calculators/' + slug + '">';
  
  content = content.replace('</head>', hreflang + '\n</head>');
  
  fs.writeFileSync(filePath, content);
  console.log('Added hreflang to:', slug);
});

console.log('Done');
