#!/usr/bin/env node

/**
 * Chrome DevTools Bug Bounty Testing Framework
 * 
 * This script launches Chrome with DevTools, monitors network traffic,
 * captures console errors, and performs comprehensive security testing.
 */

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class ChromeDevToolsTester {
  constructor(options = {}) {
    this.targetUrl = options.targetUrl || 'https://example.com';
    this.headless = options.headless !== undefined ? options.headless : false;
    this.devtools = options.devtools !== undefined ? options.devtools : true;
    this.outputDir = options.outputDir || './test-results';
    this.results = {
      networkRequests: [],
      consoleErrors: [],
      consoleWarnings: [],
      securityIssues: [],
      apiEndpoints: [],
      cookies: [],
      localStorage: [],
      sessionStorage: [],
      headers: {},
      vulnerabilities: []
    };
  }

  async initialize() {
    console.log(chalk.blue('🚀 Initializing Chrome DevTools Tester...'));
    
    // Create output directory
    await fs.ensureDir(this.outputDir);
    
    // Launch browser with DevTools
    this.browser = await puppeteer.launch({
      headless: this.headless,
      devtools: this.devtools,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--enable-features=NetworkService,NetworkServiceLogging',
        '--log-level=0',
        '--disable-dev-shm-usage'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });

    this.page = await this.browser.newPage();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log(chalk.green('✅ Chrome launched with DevTools'));
  }

  setupEventListeners() {
    // Network request monitoring
    this.page.on('request', (request) => {
      const reqData = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        resourceType: request.resourceType(),
        timestamp: new Date().toISOString()
      };
      
      this.results.networkRequests.push(reqData);
      
      // Extract API endpoints
      if (reqData.url.includes('/api/') || 
          reqData.url.includes('/v1/') || 
          reqData.url.includes('/v2/') ||
          reqData.url.includes('/graphql') ||
          reqData.url.includes('/rest/')) {
        if (!this.results.apiEndpoints.find(e => e.url === reqData.url)) {
          this.results.apiEndpoints.push({
            url: reqData.url,
            method: reqData.method,
            headers: reqData.headers,
            timestamp: reqData.timestamp
          });
          console.log(chalk.cyan(`📡 API Endpoint: ${reqData.method} ${reqData.url}`));
        }
      }
    });

    // Network response monitoring
    this.page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      const headers = response.headers();
      
      // Check for security headers
      if (url === this.targetUrl || url.includes(this.targetUrl.replace('https://', '').replace('http://', '').split('/')[0])) {
        this.results.headers = headers;
        this.analyzeSecurityHeaders(headers, url);
      }

      // Check for sensitive data in responses
      try {
        const contentType = headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          const text = await response.text();
          this.analyzeResponseForSensitiveData(url, text);
        }
      } catch (e) {
        // Ignore errors reading response
      }
    });

    // Console error monitoring
    this.page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        this.results.consoleErrors.push({
          message: text,
          timestamp: new Date().toISOString(),
          stack: msg.stackTrace() || []
        });
        console.log(chalk.red(`❌ Console Error: ${text}`));
      } else if (type === 'warning') {
        this.results.consoleWarnings.push({
          message: text,
          timestamp: new Date().toISOString()
        });
        console.log(chalk.yellow(`⚠️  Console Warning: ${text}`));
      }
    });

    // Page error monitoring
    this.page.on('pageerror', (error) => {
      this.results.consoleErrors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        type: 'pageerror'
      });
      console.log(chalk.red(`💥 Page Error: ${error.message}`));
    });

    // Request failed monitoring
    this.page.on('requestfailed', (request) => {
      console.log(chalk.red(`🔴 Request Failed: ${request.url()}`));
      this.results.securityIssues.push({
        type: 'request_failed',
        url: request.url(),
        timestamp: new Date().toISOString()
      });
    });
  }

  analyzeSecurityHeaders(headers, url) {
    const securityChecks = {
      'X-Content-Type-Options': headers['x-content-type-options'] === 'nosniff',
      'X-Frame-Options': !!headers['x-frame-options'],
      'X-XSS-Protection': !!headers['x-xss-protection'],
      'Strict-Transport-Security': !!headers['strict-transport-security'],
      'Content-Security-Policy': !!headers['content-security-policy'],
      'Referrer-Policy': !!headers['referrer-policy'],
      'Permissions-Policy': !!headers['permissions-policy']
    };

    for (const [header, present] of Object.entries(securityChecks)) {
      if (!present) {
        this.results.vulnerabilities.push({
          type: 'missing_security_header',
          severity: 'medium',
          header: header,
          url: url,
          description: `Missing security header: ${header}`,
          timestamp: new Date().toISOString()
        });
        console.log(chalk.yellow(`⚠️  Missing Security Header: ${header}`));
      }
    }

    // Check for information disclosure
    if (headers['server']) {
      this.results.vulnerabilities.push({
        type: 'information_disclosure',
        severity: 'low',
        header: 'Server',
        value: headers['server'],
        url: url,
        description: `Server header exposes: ${headers['server']}`,
        timestamp: new Date().toISOString()
      });
      console.log(chalk.yellow(`ℹ️  Server Header: ${headers['server']}`));
    }
  }

  analyzeResponseForSensitiveData(url, text) {
    const sensitivePatterns = [
      { pattern: /password["\s]*:["\s]*["']([^"']+)["']/gi, type: 'password_exposure' },
      { pattern: /api[_-]?key["\s]*:["\s]*["']([^"']+)["']/gi, type: 'api_key_exposure' },
      { pattern: /token["\s]*:["\s]*["']([^"']+)["']/gi, type: 'token_exposure' },
      { pattern: /secret["\s]*:["\s]*["']([^"']+)["']/gi, type: 'secret_exposure' },
      { pattern: /ssn["\s]*:["\s]*["']([^"']+)["']/gi, type: 'ssn_exposure' },
      { pattern: /credit[_-]?card["\s]*:["\s]*["']([^"']+)["']/gi, type: 'credit_card_exposure' }
    ];

    sensitivePatterns.forEach(({ pattern, type }) => {
      const matches = text.match(pattern);
      if (matches) {
        this.results.vulnerabilities.push({
          type: type,
          severity: 'high',
          url: url,
          description: `Potential ${type} in response`,
          matches: matches.slice(0, 3), // Limit matches
          timestamp: new Date().toISOString()
        });
        console.log(chalk.red(`🔴 Potential ${type} detected in ${url}`));
      }
    });
  }

  async navigateToUrl(url) {
    console.log(chalk.blue(`🌐 Navigating to: ${url}`));
    this.targetUrl = url;
    
    try {
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Wait a bit for all resources to load
      await this.page.waitForTimeout(3000);
      
      console.log(chalk.green('✅ Page loaded'));
    } catch (error) {
      console.log(chalk.red(`❌ Navigation error: ${error.message}`));
      this.results.securityIssues.push({
        type: 'navigation_error',
        url: url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async extractStorageData() {
    console.log(chalk.blue('📦 Extracting storage data...'));
    
    // Extract cookies
    const cookies = await this.page.cookies();
    this.results.cookies = cookies;
    console.log(chalk.cyan(`🍪 Found ${cookies.length} cookies`));

    // Extract localStorage
    this.results.localStorage = await this.page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        storage[key] = localStorage.getItem(key);
      }
      return storage;
    });

    // Extract sessionStorage
    this.results.sessionStorage = await this.page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        storage[key] = sessionStorage.getItem(key);
      }
      return storage;
    });
  }

  async injectSecurityTestingScripts() {
    console.log(chalk.blue('🔧 Injecting security testing scripts...'));
    
    // Inject script to monitor fetch and XHR
    await this.page.evaluateOnNewDocument(() => {
      // Intercept fetch
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        console.log('[SECURITY] Fetch intercepted:', args[0]);
        return originalFetch.apply(this, args);
      };

      // Intercept XHR
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        console.log('[SECURITY] XHR intercepted:', method, url);
        return originalOpen.apply(this, [method, url, ...rest]);
      };
    });
  }

  async generateReport() {
    console.log(chalk.blue('📊 Generating comprehensive report...'));
    
    const report = {
      timestamp: new Date().toISOString(),
      targetUrl: this.targetUrl,
      summary: {
        totalRequests: this.results.networkRequests.length,
        apiEndpoints: this.results.apiEndpoints.length,
        consoleErrors: this.results.consoleErrors.length,
        consoleWarnings: this.results.consoleWarnings.length,
        vulnerabilities: this.results.vulnerabilities.length,
        cookies: this.results.cookies.length
      },
      results: this.results
    };

    // Save detailed JSON report
    const jsonPath = path.join(this.outputDir, `test-report-${Date.now()}.json`);
    await fs.writeJSON(jsonPath, report, { spaces: 2 });
    console.log(chalk.green(`✅ Detailed report saved: ${jsonPath}`));

    // Generate markdown summary
    const mdPath = path.join(this.outputDir, `test-summary-${Date.now()}.md`);
    const markdown = this.generateMarkdownReport(report);
    await fs.writeFile(mdPath, markdown);
    console.log(chalk.green(`✅ Summary report saved: ${mdPath}`));

    return report;
  }

  generateMarkdownReport(report) {
    return `# Chrome DevTools Security Test Report

**Target URL:** ${report.targetUrl}  
**Test Date:** ${new Date(report.timestamp).toLocaleString()}  
**Test Duration:** Automated scan

## Summary

- **Total Network Requests:** ${report.summary.totalRequests}
- **API Endpoints Discovered:** ${report.summary.apiEndpoints}
- **Console Errors:** ${report.summary.consoleErrors}
- **Console Warnings:** ${report.summary.consoleWarnings}
- **Vulnerabilities Found:** ${report.summary.vulnerabilities}
- **Cookies:** ${report.summary.cookies}

## Vulnerabilities

${report.results.vulnerabilities.length > 0 
  ? report.results.vulnerabilities.map(v => `
### ${v.type} (${v.severity})
- **URL:** ${v.url || 'N/A'}
- **Description:** ${v.description}
- **Timestamp:** ${v.timestamp}
`).join('\n')
  : 'No vulnerabilities detected.'}

## API Endpoints

${report.results.apiEndpoints.map(ep => `- **${ep.method}** ${ep.url}`).join('\n')}

## Security Headers

${Object.keys(report.results.headers).length > 0
  ? Object.entries(report.results.headers)
      .filter(([key]) => key.toLowerCase().startsWith('x-') || 
                          key.toLowerCase() === 'content-security-policy' ||
                          key.toLowerCase() === 'strict-transport-security')
      .map(([key, value]) => `- **${key}:** ${value}`)
      .join('\n')
  : 'No security headers analyzed.'}

## Console Errors

${report.results.consoleErrors.length > 0
  ? report.results.consoleErrors.map(err => `- ${err.message}`).join('\n')
  : 'No console errors.'}

## Recommendations

${report.results.vulnerabilities.length > 0
  ? '1. Review and fix all identified vulnerabilities\n2. Implement missing security headers\n3. Review API endpoints for proper authentication\n4. Fix console errors that may indicate security issues'
  : 'No immediate security concerns detected. Continue monitoring.'}
`;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log(chalk.blue('🔒 Browser closed'));
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args[0] || process.env.TARGET_URL || 'https://example.com';
  
  const tester = new ChromeDevToolsTester({
    targetUrl: targetUrl,
    headless: false, // Keep browser visible for DevTools
    devtools: true,  // Open DevTools automatically
    outputDir: './test-results'
  });

  try {
    await tester.initialize();
    await tester.injectSecurityTestingScripts();
    await tester.navigateToUrl(targetUrl);
    await tester.extractStorageData();
    
    // Keep browser open for manual inspection
    console.log(chalk.green('\n✅ Testing complete! Browser will remain open for manual inspection.'));
    console.log(chalk.cyan('Press Ctrl+C to close and generate report.\n'));
    
    // Wait for user to close
    process.on('SIGINT', async () => {
      console.log(chalk.blue('\n📊 Generating final report...'));
      await tester.generateReport();
      await tester.close();
      process.exit(0);
    });
    
    // Auto-generate report after 60 seconds if still running
    setTimeout(async () => {
      await tester.generateReport();
    }, 60000);
    
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    await tester.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ChromeDevToolsTester;

