#!/usr/bin/env node

/**
 * Master Test Runner
 * Runs all security tests in sequence
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');

async function runAllTests(targetUrl) {
  if (!targetUrl) {
    console.log(chalk.red('❌ Please provide a target URL'));
    console.log(chalk.cyan('Usage: node run-all-tests.js <target-url>'));
    process.exit(1);
  }

  console.log(chalk.blue('🚀 Starting comprehensive bug bounty testing suite...\n'));
  console.log(chalk.cyan(`Target: ${targetUrl}\n`));

  const tests = [
    {
      name: 'Chrome DevTools Tester',
      script: 'chrome-devtools-tester.js',
      description: 'Comprehensive DevTools-based testing'
    },
    {
      name: 'Security Vulnerability Scanner',
      script: 'security-vulnerability-scanner.js',
      description: 'XSS, IDOR, CSRF, SQL Injection testing'
    },
    {
      name: 'Network Analyzer',
      script: 'network-analyzer.js',
      description: 'Network traffic analysis and API discovery'
    }
  ];

  const results = [];

  for (const test of tests) {
    console.log(chalk.blue(`\n${'='.repeat(60)}`));
    console.log(chalk.cyan(`Running: ${test.name}`));
    console.log(chalk.gray(`Description: ${test.description}`));
    console.log(chalk.blue(`${'='.repeat(60)}\n`));

    try {
      const startTime = Date.now();
      const { stdout, stderr } = await execPromise(
        `node ${test.script} "${targetUrl}"`,
        { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
      );
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      results.push({
        name: test.name,
        status: 'success',
        duration: `${duration}s`,
        output: stdout
      });

      console.log(chalk.green(`✅ ${test.name} completed in ${duration}s`));
      
      if (stderr) {
        console.log(chalk.yellow(`⚠️  Warnings: ${stderr}`));
      }
    } catch (error) {
      results.push({
        name: test.name,
        status: 'failed',
        error: error.message,
        output: error.stdout || ''
      });

      console.log(chalk.red(`❌ ${test.name} failed: ${error.message}`));
    }

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Generate summary report
  console.log(chalk.blue('\n' + '='.repeat(60)));
  console.log(chalk.cyan('Test Summary'));
  console.log(chalk.blue('='.repeat(60) + '\n'));

  results.forEach(result => {
    const statusColor = result.status === 'success' ? chalk.green : chalk.red;
    console.log(statusColor(`${result.status === 'success' ? '✅' : '❌'} ${result.name}`));
    if (result.duration) {
      console.log(chalk.gray(`   Duration: ${result.duration}`));
    }
    if (result.error) {
      console.log(chalk.red(`   Error: ${result.error}`));
    }
  });

  // Save summary
  const summaryPath = path.join('./test-results', `test-summary-${Date.now()}.json`);
  await fs.ensureDir('./test-results');
  await fs.writeJSON(summaryPath, {
    timestamp: new Date().toISOString(),
    targetUrl: targetUrl,
    results: results
  }, { spaces: 2 });

  console.log(chalk.green(`\n✅ Summary saved to: ${summaryPath}`));
  console.log(chalk.cyan('\n📁 All detailed reports are in ./test-results/\n'));

  const successCount = results.filter(r => r.status === 'success').length;
  const totalCount = results.length;

  if (successCount === totalCount) {
    console.log(chalk.green(`🎉 All tests completed successfully! (${successCount}/${totalCount})`));
  } else {
    console.log(chalk.yellow(`⚠️  Some tests failed (${successCount}/${totalCount} succeeded)`));
  }
}

// Main execution
const targetUrl = process.argv[2] || process.env.TARGET_URL;

runAllTests(targetUrl).catch(error => {
  console.error(chalk.red(`❌ Fatal error: ${error.message}`));
  process.exit(1);
});

