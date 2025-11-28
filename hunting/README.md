# Social Deal Bug Hunting Workflow

This directory contains tools and scripts for bug hunting on the Social Deal program (Intigriti).

## ⚠️ Important: Follow Program Rules

- **Rate Limit**: Maximum 2 requests/second
- **User Agent**: Required (configured in scripts)
- **Automated Tooling**: Allowed (respect rate limits)
- **Scope**: Only test in-scope domains and assets

## Structure

```
hunting/
├── socialdeal-config.json    # Program configuration
├── rate-limiter.js           # Rate limiting utility
├── socialdeal-recon.js       # Reconnaissance script
└── README.md                 # This file
```

## Configuration

All program details are in `socialdeal-config.json`:
- Domain: www.socialdeal.nl
- Rate limit: 2 req/sec
- Test credentials
- In-scope assets
- Tech stack info

## Usage

### Basic Reconnaissance

```bash
cd hunting
node socialdeal-recon.js
```

This will:
- Test main domain
- Check security headers
- Test in-scope URLs
- Check for exposed files
- Save findings to database (viewable in dashboard)

### Using MCP Tools

The MCP server provides tools you can use via AI assistant:

1. **Reconnaissance:**
   ```
   "Run subfinder on socialdeal.nl"
   "Run httpx on discovered subdomains"
   ```

2. **Security Testing:**
   ```
   "Test for XSS on https://www.socialdeal.nl/search?q=test"
   "Test for SQL injection on https://www.socialdeal.nl/api/..."
   ```

3. **ZAP Scanning:**
   ```
   "Start ZAP spider scan on https://www.socialdeal.nl"
   "Get ZAP alerts for socialdeal.nl"
   ```

4. **JavaScript Analysis:**
   ```
   "Analyze JavaScript at https://www.socialdeal.nl/app.js"
   "Extract endpoints from JavaScript files"
   ```

### Findings Storage

All findings are automatically saved to PostgreSQL database:
- View in dashboard: http://localhost:3000
- Access via MCP: `db.get_findings`
- Export via API: `GET /api/findings`

## Test Credentials

Account 1:
- Username: `intigriti-1@socialdeal.nl`
- Password: `rR7R281kz%!F`

Account 2:
- Username: `intigriti-2@socialdeal.nl`
- Password: `r92x%4bRbMys`

⚠️ **DO NOT change passwords** for these test accounts.

## Workflow

1. **Initial Reconnaissance**
   ```bash
   node hunting/socialdeal-recon.js
   ```

2. **Subdomain Discovery** (via MCP)
   - Use `recon.subfinder` on socialdeal.nl
   - Use `recon.amass` for additional discovery
   - Use `recon.httpx` to check live hosts

3. **JavaScript Analysis** (via MCP)
   - Use `js.analyze` on discovered JS files
   - Extract endpoints and secrets

4. **Security Testing** (via MCP, respect rate limits)
   - Use `security.test_xss` on input fields
   - Use `security.test_sqli` on parameters
   - Use `security.test_idor` on ID-based endpoints
   - Use `zap.proxy_process` for intelligent testing

5. **Review Findings**
   - Check dashboard: http://localhost:3000
   - Review saved findings
   - Prioritize based on severity

## Rate Limiting

All scripts respect the 2 req/sec limit automatically.

For manual testing:
```javascript
const RateLimiter = require('./rate-limiter');
const limiter = new RateLimiter(2); // 2 req/sec

await limiter.execute(async () => {
  // Your request here
});
```

## Best Practices

1. ✅ **Always respect rate limits** (max 2 req/sec)
2. ✅ **Use test credentials** for authenticated testing
3. ✅ **Save all findings** to database (automatic)
4. ✅ **Document payloads** and responses
5. ✅ **Test only in-scope** domains/assets
6. ❌ **Don't use automated tools** that violate rate limits
7. ❌ **Don't test out-of-scope** vulnerabilities (see config)
8. ❌ **Don't change** test account passwords

## Integration with Dashboard

All findings are saved to the database and visible in:
- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3000/api/findings
- **MCP Tools**: Use `db.get_findings` to retrieve

## Next Steps

1. Run initial reconnaissance: `node hunting/socialdeal-recon.js`
2. Check dashboard for findings: http://localhost:3000
3. Use MCP tools for deeper testing
4. Focus on high-impact vulnerabilities:
   - Full access to servers/database
   - Infrastructure information disclosure
   - Authentication bypass
   - IDOR with impact

Happy hunting! 🐛


