#!/usr/bin/env node

/**
 * Advanced Network Traffic Analyzer
 * Captures and analyzes all network requests/responses with DevTools
 */

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class NetworkAnalyzer {
  constructor(options = {}) {
    this.targetUrl = options.targetUrl || 'https://example.com';
    this.headless = options.headless || false;
    this.devtools = true;
    this.outputDir = options.outputDir || './test-results';
    this.networkData = {
      requests: [],
      responses: [],
      apiEndpoints: [],
      sensitiveData: [],
      errors: []
    };
  }

  async initialize() {
    console.log(chalk.blue('🌐 Initializing Network Analyzer...'));
    
    await fs.ensureDir(this.outputDir);
    
    this.browser = await puppeteer.launch({
      headless: this.headless,
      devtools: this.devtools,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--enable-logging',
        '--v=1'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Enable CDP for detailed network monitoring
    this.client = await this.page.target().createCDPSession();
    await this.client.send('Network.enable');
    await this.client.send('Network.setRequestInterception', { patterns: [{ urlPattern: '*' }] });
    
    // Set up comprehensive network monitoring
    this.setupNetworkMonitoring();
    
    console.log(chalk.green('✅ Network Analyzer ready'));
  }

  setupNetworkMonitoring() {
    // Monitor all requests
    this.client.on('Network.requestWillBeSent', (params) => {
      const request = {
        requestId: params.requestId,
        url: params.request.url,
        method: params.request.method,
        headers: params.request.headers,
        postData: params.request.postData,
        type: params.type,
        timestamp: new Date(params.wallTime * 1000).toISOString(),
        initiator: params.initiator
      };
      
      this.networkData.requests.push(request);
      
      // Detect API endpoints
      if (this.isApiEndpoint(request.url)) {
        this.networkData.apiEndpoints.push({
          ...request,
          endpoint: this.extractEndpoint(request.url)
        });
        console.log(chalk.cyan(`📡 API: ${request.method} ${request.url}`));
      }
      
      // Check for sensitive data in requests
      if (request.postData) {
        this.checkSensitiveData(request.postData, request.url, 'request');
      }
    });

    // Monitor all responses
    this.client.on('Network.responseReceived', async (params) => {
      const response = {
        requestId: params.requestId,
        url: params.response.url,
        status: params.response.status,
        statusText: params.response.statusText,
        headers: params.response.headers,
        mimeType: params.response.mimeType,
        timestamp: new Date().toISOString()
      };
      
      this.networkData.responses.push(response);
      
      // Get response body for analysis
      try {
        const responseBody = await this.client.send('Network.getResponseBody', {
          requestId: params.requestId
        });
        
        if (responseBody.body) {
          this.analyzeResponse(response.url, responseBody.body, response.mimeType);
        }
      } catch (e) {
        // Some responses can't be read (binary, etc.)
      }
    });

    // Monitor loading failures
    this.client.on('Network.loadingFailed', (params) => {
      this.networkData.errors.push({
        requestId: params.requestId,
        errorText: params.errorText,
        type: params.type,
        timestamp: new Date().toISOString()
      });
      console.log(chalk.red(`❌ Network Error: ${params.errorText}`));
    });
  }

  isApiEndpoint(url) {
    const apiPatterns = [
      /\/api\//,
      /\/v\d+\//,
      /\/graphql/,
      /\/rest\//,
      /\/rpc\//,
      /\.json$/,
      /\.xml$/
    ];
    
    return apiPatterns.some(pattern => pattern.test(url));
  }

  extractEndpoint(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  checkSensitiveData(data, url, type) {
    const sensitivePatterns = [
      { pattern: /password["\s]*[:=]["\s]*["']([^"']+)["']/gi, type: 'password' },
      { pattern: /api[_-]?key["\s]*[:=]["\s]*["']([^"']+)["']/gi, type: 'api_key' },
      { pattern: /token["\s]*[:=]["\s]*["']([^"']+)["']/gi, type: 'token' },
      { pattern: /secret["\s]*[:=]["\s]*["']([^"']+)["']/gi, type: 'secret' },
      { pattern: /authorization["\s]*[:=]["\s]*["']([^"']+)["']/gi, type: 'authorization' }
    ];

    sensitivePatterns.forEach(({ pattern, type: dataType }) => {
      const matches = data.match(pattern);
      if (matches) {
        this.networkData.sensitiveData.push({
          type: dataType,
          location: type,
          url: url,
          matches: matches.slice(0, 3),
          timestamp: new Date().toISOString()
        });
        console.log(chalk.red(`🔴 Sensitive data detected: ${dataType} in ${type}`));
      }
    });
  }

  analyzeResponse(url, body, mimeType) {
    if (mimeType && mimeType.includes('application/json')) {
      try {
        const json = JSON.parse(body);
        this.analyzeJsonResponse(url, json);
      } catch (e) {
        // Not valid JSON
      }
    }
    
    // Check for sensitive data in response body
    this.checkSensitiveData(body, url, 'response');
  }

  analyzeJsonResponse(url, json) {
    // Recursively search for sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card', 'api_key'];
    
    const searchObject = (obj, path = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          this.networkData.sensitiveData.push({
            type: 'sensitive_field',
            field: currentPath,
            url: url,
            hasValue: value !== null && value !== undefined,
            timestamp: new Date().toISOString()
          });
          console.log(chalk.yellow(`⚠️  Sensitive field found: ${currentPath}`));
        }
        
        if (typeof value === 'object' && value !== null) {
          searchObject(value, currentPath);
        }
      }
    };
    
    searchObject(json);
  }

  async navigateToUrl(url) {
    console.log(chalk.blue(`🌐 Navigating to: ${url}`));
    this.targetUrl = url;
    
    await this.page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Wait for all network activity to settle
    await this.page.waitForTimeout(5000);
    
    console.log(chalk.green('✅ Navigation complete'));
  }

  async generateReport() {
    console.log(chalk.blue('📊 Generating network analysis report...'));
    
    const report = {
      timestamp: new Date().toISOString(),
      targetUrl: this.targetUrl,
      summary: {
        totalRequests: this.networkData.requests.length,
        totalResponses: this.networkData.responses.length,
        apiEndpoints: this.networkData.apiEndpoints.length,
        sensitiveDataFindings: this.networkData.sensitiveData.length,
        errors: this.networkData.errors.length
      },
      apiEndpoints: this.networkData.apiEndpoints.map(ep => ({
        method: ep.method,
        url: ep.url,
        endpoint: ep.endpoint,
        timestamp: ep.timestamp
      })),
      sensitiveData: this.networkData.sensitiveData,
      errors: this.networkData.errors,
      allRequests: this.networkData.requests,
      allResponses: this.networkData.responses
    };

    // Save detailed JSON
    const jsonPath = path.join(this.outputDir, `network-analysis-${Date.now()}.json`);
    await fs.writeJSON(jsonPath, report, { spaces: 2 });
    console.log(chalk.green(`✅ Report saved: ${jsonPath}`));

    // Generate markdown summary
    const mdPath = path.join(this.outputDir, `network-analysis-${Date.now()}.md`);
    const markdown = this.generateMarkdownReport(report);
    await fs.writeFile(mdPath, markdown);
    console.log(chalk.green(`✅ Markdown report saved: ${mdPath}`));

    // Export API endpoints as separate file
    const endpointsPath = path.join(this.outputDir, `api-endpoints-${Date.now()}.json`);
    await fs.writeJSON(endpointsPath, report.apiEndpoints, { spaces: 2 });
    console.log(chalk.green(`✅ API endpoints exported: ${endpointsPath}`));

    return report;
  }

  generateMarkdownReport(report) {
    return `# Network Analysis Report

**Target:** ${report.targetUrl}  
**Date:** ${new Date(report.timestamp).toLocaleString()}

## Summary

- **Total Requests:** ${report.summary.totalRequests}
- **Total Responses:** ${report.summary.totalResponses}
- **API Endpoints Discovered:** ${report.summary.apiEndpoints}
- **Sensitive Data Findings:** ${report.summary.sensitiveDataFindings}
- **Network Errors:** ${report.summary.errors}

## API Endpoints

${report.apiEndpoints.length > 0
  ? report.apiEndpoints.map(ep => `- **${ep.method}** \`${ep.url}\``).join('\n')
  : 'No API endpoints detected.'}

## Sensitive Data Findings

${report.sensitiveData.length > 0
  ? report.sensitiveData.map(data => `
### ${data.type}
- **Location:** ${data.location}
- **URL:** ${data.url || 'N/A'}
- **Field:** ${data.field || 'N/A'}
- **Timestamp:** ${data.timestamp}
`).join('\n')
  : 'No sensitive data detected.'}

## Network Errors

${report.errors.length > 0
  ? report.errors.map(err => `- ${err.errorText} (${err.type})`).join('\n')
  : 'No network errors.'}

## Recommendations

1. Review all API endpoints for proper authentication
2. Investigate sensitive data findings
3. Fix network errors
4. Implement rate limiting on API endpoints
5. Add request/response logging for security monitoring
`;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args[0] || process.env.TARGET_URL || 'https://example.com';
  
  const analyzer = new NetworkAnalyzer({
    targetUrl: targetUrl,
    headless: false,
    devtools: true,
    outputDir: './test-results'
  });

  try {
    await analyzer.initialize();
    await analyzer.navigateToUrl(targetUrl);
    
    console.log(chalk.cyan('\n📡 Network monitoring active. Browser will remain open for 60 seconds...\n'));
    
    await analyzer.page.waitForTimeout(60000);
    
    await analyzer.generateReport();
    await analyzer.close();
    
    console.log(chalk.green('\n✅ Network analysis complete!'));
    
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    await analyzer.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = NetworkAnalyzer;

