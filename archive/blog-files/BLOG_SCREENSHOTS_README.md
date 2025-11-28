# Blog Screenshot Generator

This script generates formatted outputs for blog screenshots by running a complete ZAP scan workflow on a test target.

## Quick Start

### 1. Start ZAP

Make sure ZAP is running on port 8081:

```bash
# Using Docker (recommended)
docker run -d -p 8081:8080 -p 8090:8090 \
  zaproxy/zap-stable \
  zap.sh -daemon -host 0.0.0.0 -port 8080 \
  -config api.disablekey=true

# Verify ZAP is running
curl http://localhost:8081/JSON/core/view/version/
```

### 2. Run the Screenshot Generator

```bash
# Using default target (httpbin.org)
node generate-blog-screenshots.js

# Using a custom target
node generate-blog-screenshots.js https://example.com

# Using a vulnerable test app (if you have one)
node generate-blog-screenshots.js http://localhost:3000
```

### 3. Capture Screenshots

The script will output formatted boxes in the terminal. Take screenshots of:

1. **ZAP Health Check** - Shows successful connection
2. **Spider Scan Started** - Shows scan initiation
3. **Spider Progress** - Shows scan progress bar
4. **Discovered URLs** - Shows URLs found by ZAP
5. **ZAP Alerts** - Shows security alerts from ZAP
6. **Enhanced Findings** - **KEY SCREENSHOT** - Shows correlation scores
7. **Before/After Comparison** - Shows improvement

All outputs are also saved to `blog-screenshots-output/` directory.

## What Each Screenshot Shows

### Screenshot 1: ZAP Health Check
- **Purpose**: Prove ZAP integration works
- **Shows**: ZAP version, connection status, API endpoint
- **Use in blog**: "ZAP Integration" section

### Screenshot 2: Spider Scan Started
- **Purpose**: Show programmatic control of ZAP
- **Shows**: Target URL, scan ID, scan parameters
- **Use in blog**: "ZAP Integration" section

### Screenshot 3: Spider Progress
- **Purpose**: Show real-time scanning
- **Shows**: Progress bar, scan status
- **Use in blog**: "Scanning Workflow" section

### Screenshot 4: Discovered URLs
- **Purpose**: Show ZAP's discovery capabilities
- **Shows**: List of URLs found by spider
- **Use in blog**: "ZAP Integration" section

### Screenshot 5: ZAP Alerts
- **Purpose**: Show ZAP's vulnerability detection
- **Shows**: Security alerts with risk levels
- **Use in blog**: "ZAP Integration" section

### Screenshot 6: Enhanced Findings ⭐ **MOST IMPORTANT**
- **Purpose**: Show the key differentiator
- **Shows**: 
  - ZAP alerts + custom findings
  - Correlation scores
  - AI scores
  - Verification status
- **Use in blog**: "Correlation Engine" section (main feature)

### Screenshot 7: Before/After Comparison
- **Purpose**: Visually demonstrate improvement
- **Shows**: 
  - ZAP alone (before)
  - Enhanced results (after)
  - Improvement metrics
- **Use in blog**: "Benefits" section

## Output Files

All outputs are saved to `blog-screenshots-output/`:

- `1-zap-health-check.txt` - Health check response
- `2-spider-scan-started.txt` - Scan initiation
- `3-spider-progress.txt` - Progress tracking
- `4-discovered-urls.txt` - URL list
- `5-zap-alerts.json` - Alerts in JSON format
- `6-enhanced-findings.txt` - Enhanced findings (text)
- `6-enhanced-findings.json` - Enhanced findings (JSON)
- `7-before-after-comparison.txt` - Comparison data

## Tips for Great Screenshots

### Terminal Setup
- Use a clean terminal theme (dark or light, but consistent)
- Use a readable font (Monaco, Fira Code, or similar)
- Make terminal window wide enough (at least 120 columns)
- Remove unnecessary clutter (close other tabs/windows)

### Screenshot Quality
- **Resolution**: At least 1920x1080
- **Format**: PNG for terminal/text, JPG for photos
- **Cropping**: Crop tightly around the formatted boxes
- **Annotations**: Add arrows/labels if needed (use Preview, Skitch, etc.)

### What to Include
- ✅ The formatted output boxes
- ✅ Terminal prompt (shows it's real)
- ✅ Clear labels/annotations
- ✅ Consistent styling

### What to Avoid
- ❌ Personal information (blur if needed)
- ❌ Cluttered interface
- ❌ Low resolution
- ❌ Sensitive data (use test sites)

## Example Workflow

```bash
# 1. Start ZAP
docker run -d -p 8081:8080 zaproxy/zap-stable \
  zap.sh -daemon -host 0.0.0.0 -port 8080 \
  -config api.disablekey=true

# 2. Wait a few seconds for ZAP to start
sleep 5

# 3. Run the generator
node generate-blog-screenshots.js https://httpbin.org

# 4. Take screenshots of the terminal output
# 5. Review output files in blog-screenshots-output/
# 6. Use screenshots in your blog post
```

## Troubleshooting

### ZAP Not Accessible
```
Error: ZAP is not accessible
```

**Solution:**
- Check ZAP is running: `curl http://localhost:8081/JSON/core/view/version/`
- Verify port 8081 is not in use
- Check Docker container: `docker ps`

### No Alerts Found
If the test site doesn't have vulnerabilities, that's okay! The script will still show:
- The workflow
- Enhanced findings (simulated)
- The correlation system

### Script Hangs
If the spider scan takes too long:
- Press Ctrl+C to stop
- Use a smaller target or set `maxChildren: 5`
- Check ZAP logs: `docker logs <container-id>`

## Customization

### Change Target URL
```bash
node generate-blog-screenshots.js https://your-target.com
```

### Change ZAP URL
```bash
ZAP_URL=http://localhost:8090 node generate-blog-screenshots.js
```

### Use Different Test Sites

**Safe test sites:**
- `https://httpbin.org` - HTTP testing service
- `https://example.com` - Simple test site
- `https://jsonplaceholder.typicode.com` - API testing

**Vulnerable test apps (for more alerts):**
- OWASP WebGoat
- DVWA (Damn Vulnerable Web Application)
- Juice Shop
- HackTheBox challenges

## Next Steps

1. ✅ Run the script and capture screenshots
2. ✅ Review output files
3. ✅ Select best screenshots for blog
4. ✅ Add annotations if needed
5. ✅ Include in blog post submission

Good luck with your blog submission! 🚀

