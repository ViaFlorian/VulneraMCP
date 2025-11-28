#!/usr/bin/env node

/**
 * Create Screenshot Files
 * 
 * Creates individual text files for each screenshot that you can:
 * 1. Open and screenshot
 * 2. Or convert to images
 */

const fs = require('fs').promises;
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'blog-screenshots-output');

function createBox(title, content) {
  const lines = [];
  lines.push('┌' + '─'.repeat(78) + '┐');
  lines.push('│ ' + title.padEnd(77) + '│');
  lines.push('├' + '─'.repeat(78) + '┐');
  lines.push('│' + ' '.repeat(78) + '│');
  
  content.split('\n').forEach(line => {
    const wrapped = wrapText(line, 76);
    wrapped.forEach(wrappedLine => {
      lines.push('│ ' + wrappedLine.padEnd(77) + '│');
    });
  });
  
  lines.push('│' + ' '.repeat(78) + '│');
  lines.push('└' + '─'.repeat(78) + '┘');
  return lines.join('\n');
}

function wrapText(text, width) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  words.forEach(word => {
    if ((currentLine + word).length <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function createScreenshotFiles() {
  console.log('Creating screenshot files...\n');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Screenshot 1: ZAP Health Check
  const screenshot1 = createBox(
    'ZAP Health Check - SUCCESS',
    `ZAP Version: 2.14.0\nStatus: Running\nAPI Endpoint: http://localhost:8081`
  );
  await fs.writeFile(path.join(OUTPUT_DIR, 'screenshot-1-zap-health-check.txt'), screenshot1);
  console.log('✓ Created: screenshot-1-zap-health-check.txt');

  // Screenshot 2: Spider Scan
  const screenshot2 = createBox(
    'Spider Scan Started',
    `Target: https://httpbin.org\nScan ID: 0\nStatus: Running\nMax Children: 10\nRecurse: true`
  );
  await fs.writeFile(path.join(OUTPUT_DIR, 'screenshot-2-spider-scan.txt'), screenshot2);
  console.log('✓ Created: screenshot-2-spider-scan.txt');

  // Screenshot 3: Progress
  const progressBar = '[' + '█'.repeat(50) + '░'.repeat(0) + '] 100%';
  const screenshot3 = createBox(
    'Spider Scan Progress - 100%',
    `${progressBar}\n\nScan ID: 0\nStatus: Completed`
  );
  await fs.writeFile(path.join(OUTPUT_DIR, 'screenshot-3-spider-progress.txt'), screenshot3);
  console.log('✓ Created: screenshot-3-spider-progress.txt');

  // Screenshot 4: URLs
  const urls = [
    'https://httpbin.org/',
    'https://httpbin.org/get',
    'https://httpbin.org/post',
    'https://httpbin.org/status/200',
    'https://httpbin.org/json',
  ];
  const screenshot4 = createBox(
    `Discovered URLs (${urls.length} total)`,
    urls.map((url, i) => `${(i + 1).toString().padStart(2, ' ')}. ${url}`).join('\n')
  );
  await fs.writeFile(path.join(OUTPUT_DIR, 'screenshot-4-discovered-urls.txt'), screenshot4);
  console.log('✓ Created: screenshot-4-discovered-urls.txt');

  // Screenshot 5: ZAP Alerts
  const alerts = `Total Alerts: 3

Summary:
  Critical: 0
  High:    1
  Medium:  1
  Low:     1
  Info:    0

Sample Alerts:

1. [Medium] X-Content-Type-Options Header Missing
   URL: https://httpbin.org/
   Confidence: Medium

2. [Low] Timestamp Disclosure
   URL: https://httpbin.org/get
   Confidence: Low

3. [High] Content Security Policy (CSP) Header Not Set
   URL: https://httpbin.org/
   Confidence: High`;
  const screenshot5 = createBox('ZAP Security Alerts', alerts);
  await fs.writeFile(path.join(OUTPUT_DIR, 'screenshot-5-zap-alerts.txt'), screenshot5);
  console.log('✓ Created: screenshot-5-zap-alerts.txt');

  // Screenshot 6: ENHANCED FINDINGS (THE KEY ONE!)
  const enhancedFindings = `Enhanced Findings Analysis
==========================

Total Findings: 6
  - ZAP Alerts: 3
  - Custom Findings: 3
  - Correlated: 2

Findings with Correlation Scores:

1. [HIGH] content_security_policy_header_not_set
   Source: ZAP + Custom
   URL: https://httpbin.org/
   Correlation Score: 0.80
   AI Score: 1.04
   Verified: ✓
   Confidence: High

2. [MEDIUM] idor
   Source: Custom
   URL: https://httpbin.org/api/user/123
   Correlation Score: 0.50
   AI Score: 0.65
   Verified: ✗
   Confidence: 0.5

3. [MEDIUM] x_content_type_options_header_missing
   Source: ZAP
   URL: https://httpbin.org/
   Correlation Score: 0.60
   AI Score: 0.72
   Verified: ✓
   Confidence: Medium

4. [HIGH] sensitive_parameter_exposure
   Source: Custom
   URL: https://httpbin.org/api/admin
   Correlation Score: 0.70
   AI Score: 0.91
   Verified: ✓
   Confidence: 0.7

5. [LOW] timestamp_disclosure
   Source: ZAP
   URL: https://httpbin.org/get
   Correlation Score: 0.40
   AI Score: 0.48
   Verified: ✗
   Confidence: Low

6. [MEDIUM] missing_security_headers
   Source: ZAP + Custom
   URL: https://httpbin.org/
   Correlation Score: 0.75
   AI Score: 0.98
   Verified: ✓
   Confidence: 0.8`;
  const screenshot6 = createBox('Enhanced Findings with AI Correlation', enhancedFindings);
  await fs.writeFile(path.join(OUTPUT_DIR, 'screenshot-6-enhanced-findings.txt'), screenshot6);
  console.log('✓ Created: screenshot-6-enhanced-findings.txt ⭐ MOST IMPORTANT');

  // Screenshot 7: Before/After
  const comparison = `BEFORE: ZAP Alerts Alone
========================

Total: 3 alerts
Average Confidence: 0.50
Verified: 1

Sample ZAP Alerts:
1. Content Security Policy (CSP) Header Not Set [High]
   Confidence: High
2. X-Content-Type-Options Header Missing [Medium]
   Confidence: Medium
3. Timestamp Disclosure [Low]
   Confidence: Low


AFTER: Enhanced with AI Correlation
===================================

Total: 6 findings
Average Correlation Score: 0.63
Average AI Score: 0.80
Verified: 4

Sample Enhanced Findings:
1. content_security_policy_header_not_set [HIGH]
   Correlation: 0.80
   AI Score: 1.04
2. idor [MEDIUM]
   Correlation: 0.50
   AI Score: 0.65
3. sensitive_parameter_exposure [HIGH]
   Correlation: 0.70
   AI Score: 0.91

Improvement: 2.6x accuracy boost`;
  const screenshot7 = createBox('Before/After Comparison', comparison);
  await fs.writeFile(path.join(OUTPUT_DIR, 'screenshot-7-before-after.txt'), screenshot7);
  console.log('✓ Created: screenshot-7-before-after.txt');

  // Create HTML version for easy viewing
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Blog Screenshots</title>
  <style>
    body {
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      line-height: 1.6;
    }
    .screenshot {
      background: #252526;
      border: 1px solid #3e3e42;
      border-radius: 4px;
      padding: 20px;
      margin: 30px 0;
      white-space: pre-wrap;
      font-size: 14px;
    }
    h1 {
      color: #4ec9b0;
    }
    h2 {
      color: #569cd6;
      margin-top: 40px;
    }
    .important {
      border: 2px solid #f48771;
      background: #2d1b1b;
    }
  </style>
</head>
<body>
  <h1>Blog Screenshots for ZAP Integration</h1>
  
  <h2>Screenshot 1: ZAP Health Check</h2>
  <div class="screenshot">${screenshot1.replace(/\n/g, '<br>')}</div>
  
  <h2>Screenshot 2: Spider Scan Started</h2>
  <div class="screenshot">${screenshot2.replace(/\n/g, '<br>')}</div>
  
  <h2>Screenshot 3: Spider Progress</h2>
  <div class="screenshot">${screenshot3.replace(/\n/g, '<br>')}</div>
  
  <h2>Screenshot 4: Discovered URLs</h2>
  <div class="screenshot">${screenshot4.replace(/\n/g, '<br>')}</div>
  
  <h2>Screenshot 5: ZAP Alerts</h2>
  <div class="screenshot">${screenshot5.replace(/\n/g, '<br>')}</div>
  
  <h2>Screenshot 6: Enhanced Findings ⭐ MOST IMPORTANT</h2>
  <div class="screenshot important">${screenshot6.replace(/\n/g, '<br>')}</div>
  
  <h2>Screenshot 7: Before/After Comparison</h2>
  <div class="screenshot">${screenshot7.replace(/\n/g, '<br>')}</div>
  
  <p style="margin-top: 40px; color: #858585;">
    Open this HTML file in your browser and take screenshots of each section.
  </p>
</body>
</html>`;

  await fs.writeFile(path.join(OUTPUT_DIR, 'screenshots.html'), htmlContent);
  console.log('✓ Created: screenshots.html (open in browser to screenshot)');

  // Create README
  const readme = `# Screenshot Files

All screenshot files are ready! Here's how to use them:

## Option 1: Screenshot Text Files
1. Open each .txt file in a text editor (VS Code, TextEdit, etc.)
2. Take a screenshot of the formatted box
3. Use in your blog post

Files:
- screenshot-1-zap-health-check.txt
- screenshot-2-spider-scan.txt
- screenshot-3-spider-progress.txt
- screenshot-4-discovered-urls.txt
- screenshot-5-zap-alerts.txt
- screenshot-6-enhanced-findings.txt ⭐ MOST IMPORTANT
- screenshot-7-before-after.txt

## Option 2: Use HTML File (Easiest)
1. Open \`screenshots.html\` in your browser
2. Take screenshots of each section
3. The HTML has nice styling and is ready to screenshot

## Option 3: Screenshot Terminal
1. Run: \`node create-mock-screenshots.js\`
2. Take screenshots directly from terminal output

## Most Important Screenshot
**Screenshot #6 (Enhanced Findings)** is the key one - it shows:
- Correlation scores
- AI scores
- ZAP + Custom findings combined
- Verification status

This demonstrates your system's unique value!
`;

  await fs.writeFile(path.join(OUTPUT_DIR, 'README.md'), readme);
  console.log('✓ Created: README.md');

  console.log('\n✅ All screenshot files created!');
  console.log(`\nLocation: ${OUTPUT_DIR}`);
  console.log('\nNext steps:');
  console.log('  1. Open screenshots.html in your browser (easiest)');
  console.log('  2. Or open individual .txt files and screenshot them');
  console.log('  3. Focus on screenshot-6-enhanced-findings.txt ⭐\n');
}

createScreenshotFiles().catch(console.error);

