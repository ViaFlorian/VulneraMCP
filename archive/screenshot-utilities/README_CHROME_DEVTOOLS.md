# Chrome DevTools Bug Bounty Testing Framework

A comprehensive automated testing framework for bug bounty hunting using Chrome DevTools Protocol. This suite provides deep integration with Chrome's DevTools for network monitoring, security vulnerability scanning, and comprehensive bug detection.

## Features

- 🔍 **Chrome DevTools Integration** - Full access to Chrome DevTools with automated testing
- 🌐 **Network Traffic Analysis** - Capture and analyze all HTTP/HTTPS requests and responses
- 🔒 **Security Vulnerability Scanning** - Automated tests for XSS, IDOR, CSRF, SQL Injection, and more
- 📡 **API Endpoint Discovery** - Automatically discover and catalog all API endpoints
- 🍪 **Cookie & Storage Analysis** - Extract and analyze cookies, localStorage, and sessionStorage
- 🔐 **Security Header Analysis** - Check for missing or misconfigured security headers
- 📊 **Comprehensive Reporting** - Generate detailed JSON and Markdown reports
- 🐛 **Console Error Monitoring** - Capture all JavaScript errors and warnings
- 🔴 **Sensitive Data Detection** - Automatically detect passwords, tokens, API keys in responses

## Installation

```bash
# Install dependencies
npm install
```

## Quick Start

### Run All Tests

```bash
# Run comprehensive test suite
node run-all-tests.js https://target-website.com
```

### Individual Test Scripts

#### 1. Chrome DevTools Tester (Comprehensive)
```bash
node chrome-devtools-tester.js https://target-website.com
```

This script:
- Launches Chrome with DevTools open
- Monitors all network requests
- Captures console errors
- Analyzes security headers
- Detects sensitive data
- Extracts storage data
- Generates comprehensive reports

#### 2. Security Vulnerability Scanner
```bash
node security-vulnerability-scanner.js https://target-website.com
```

Tests for:
- XSS (Cross-Site Scripting)
- IDOR (Insecure Direct Object Reference)
- CSRF (Cross-Site Request Forgery)
- SQL Injection
- Missing Security Headers
- Authentication Issues

#### 3. Network Analyzer
```bash
node network-analyzer.js https://target-website.com
```

Features:
- Complete network traffic capture
- API endpoint discovery
- Request/response analysis
- Sensitive data detection in network traffic
- Error monitoring

## Usage Examples

### Basic Usage
```bash
# Set target URL as environment variable
export TARGET_URL="https://example.com"
node chrome-devtools-tester.js
```

### Custom Output Directory
```javascript
const tester = new ChromeDevToolsTester({
  targetUrl: 'https://example.com',
  headless: false,      // Keep browser visible
  devtools: true,       // Open DevTools
  outputDir: './my-results'
});
```

### Programmatic Usage

```javascript
const ChromeDevToolsTester = require('./chrome-devtools-tester');

async function test() {
  const tester = new ChromeDevToolsTester({
    targetUrl: 'https://example.com',
    headless: false,
    devtools: true
  });

  await tester.initialize();
  await tester.navigateToUrl('https://example.com');
  await tester.extractStorageData();
  const report = await tester.generateReport();
  await tester.close();
}

test();
```

## Output

All test results are saved in the `./test-results/` directory:

- `test-report-{timestamp}.json` - Detailed JSON report
- `test-summary-{timestamp}.md` - Human-readable Markdown summary
- `security-scan-{timestamp}.json` - Security vulnerability findings
- `network-analysis-{timestamp}.json` - Network traffic analysis
- `api-endpoints-{timestamp}.json` - Discovered API endpoints

## Report Structure

### Test Report Includes:
- Network requests (all HTTP/HTTPS traffic)
- API endpoints discovered
- Console errors and warnings
- Security vulnerabilities found
- Cookies and storage data
- Security headers analysis
- Sensitive data detection

### Vulnerability Severity Levels:
- **Critical** - Immediate action required
- **High** - Should be fixed soon
- **Medium** - Should be addressed
- **Low** - Nice to have
- **Info** - Informational only

## Advanced Features

### Custom Payloads

You can modify the test scripts to include custom payloads:

```javascript
// In security-vulnerability-scanner.js
const xssPayloads = [
  '<script>alert("XSS")</script>',
  // Add your custom payloads here
];
```

### Network Request Interception

The framework uses Chrome DevTools Protocol (CDP) for deep network monitoring:

```javascript
await this.client.send('Network.enable');
this.client.on('Network.requestWillBeSent', (params) => {
  // Analyze request
});
```

### Console Monitoring

All console messages are captured:

```javascript
this.page.on('console', (msg) => {
  if (msg.type() === 'error') {
    // Handle error
  }
});
```

## Troubleshooting

### Chrome Not Launching
- Ensure Chrome/Chromium is installed
- Check that Puppeteer can find Chrome executable
- Try running with `--no-sandbox` flag (already included)

### Network Requests Not Captured
- Ensure DevTools is enabled (`devtools: true`)
- Check that CDP session is properly initialized
- Verify network monitoring is enabled

### Timeout Errors
- Increase timeout values in navigation calls
- Check network connectivity
- Verify target URL is accessible

## Security Considerations

⚠️ **Important**: This tool is for authorized security testing only. Always ensure you have permission to test the target website.

- Only test websites you own or have explicit permission to test
- Follow responsible disclosure practices
- Do not use this tool for malicious purposes
- Respect rate limits and terms of service

## Integration with Other Tools

This framework can be integrated with:
- **Burp Suite** - Proxy traffic through Burp
- **OWASP ZAP** - Use ZAP for additional scanning
- **Caido** - Import findings into Caido
- **Custom Scripts** - Extend with your own tests

## Tips for Bug Bounty Hunting

1. **Start with Network Analysis** - Discover all API endpoints first
2. **Check Authentication** - Look for IDOR vulnerabilities in authenticated endpoints
3. **Test Input Fields** - Use XSS and SQL Injection payloads
4. **Review Security Headers** - Missing headers can lead to vulnerabilities
5. **Monitor Console** - JavaScript errors can reveal sensitive information
6. **Check Storage** - Cookies and localStorage may contain sensitive data
7. **Analyze Responses** - Look for sensitive data in API responses

## Contributing

Feel free to extend this framework with:
- Additional vulnerability tests
- Custom payloads
- Integration with other tools
- Performance improvements
- Better reporting formats

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check Chrome DevTools Protocol documentation
4. Review Puppeteer documentation

---

**Happy Bug Hunting! 🐛🔍**

