#!/usr/bin/env node
/**
 * Script to add Vercel Web Analytics to all HTML files
 * Adds the analytics script tag before the closing </head> tag
 */

const fs = require('fs');
const path = require('path');

// The Vercel Web Analytics script to inject
const analyticsScript = `  <!-- Vercel Web Analytics -->
  <script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  </script>
  <script defer src="/_vercel/insights/script.js"></script>
`;

// Check if analytics is already present
function hasAnalytics(content) {
  return content.includes('/_vercel/insights/script.js') || 
         content.includes('Vercel Web Analytics');
}

// Add analytics script before closing </head> tag
function addAnalytics(content) {
  if (hasAnalytics(content)) {
    console.log('  ✓ Already has Vercel Analytics');
    return content;
  }

  // Find the closing </head> tag and insert before it
  const headCloseRegex = /(\s*)<\/head>/i;
  if (!headCloseRegex.test(content)) {
    console.log('  ✗ No </head> tag found, skipping');
    return content;
  }

  const updated = content.replace(headCloseRegex, `\n${analyticsScript}$1</head>`);
  console.log('  ✓ Added Vercel Analytics');
  return updated;
}

// Recursively find all HTML files
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip certain directories
      if (file === '.git' || file === 'node_modules' || file === '.playwright-mcp') {
        return;
      }
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main execution
console.log('🔍 Finding HTML files...\n');
const htmlFiles = findHtmlFiles('.');
console.log(`Found ${htmlFiles.length} HTML files\n`);

let updated = 0;
let skipped = 0;
let errors = 0;

htmlFiles.forEach(file => {
  try {
    console.log(`Processing: ${file}`);
    const content = fs.readFileSync(file, 'utf8');
    const newContent = addAnalytics(content);
    
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      updated++;
    } else {
      skipped++;
    }
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`);
    errors++;
  }
});

console.log('\n' + '='.repeat(50));
console.log('Summary:');
console.log(`  Updated: ${updated} files`);
console.log(`  Skipped: ${skipped} files (already had analytics)`);
console.log(`  Errors: ${errors} files`);
console.log('='.repeat(50));

if (updated > 0) {
  console.log('\n✅ Vercel Web Analytics has been added to all HTML files!');
  console.log('\nNext steps:');
  console.log('1. Commit these changes to your repository');
  console.log('2. Deploy to Vercel');
  console.log('3. Enable Web Analytics in your Vercel dashboard');
  console.log('   (Project Settings → Analytics → Enable)');
} else if (skipped > 0) {
  console.log('\n✅ All HTML files already have Vercel Web Analytics!');
}
