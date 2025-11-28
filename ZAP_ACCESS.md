# ZAP Access Guide

## Current Status

✅ **ZAP is Running!**
- Port: 8081
- Process: Java process listening on localhost
- API: Working
- Web UI: Available

## Access ZAP

### Web UI
Open in browser:
```
http://localhost:8081/UI
```

If you see connection refused:
1. **Wait 10-15 seconds** - ZAP may still be initializing
2. **Clear browser cache** or use incognito mode
3. **Try the API endpoint first**: http://localhost:8081/JSON/core/view/version/

### API Endpoints

**Check Version:**
```
http://localhost:8081/JSON/core/view/version/
```

**Get Sites:**
```
http://localhost:8081/JSON/core/view/sites/
```

**Get Alerts:**
```
http://localhost:8081/JSON/alert/view/alerts/
```

## Using ZAP with Social Deal

### Via MCP Tools (Recommended)

You can use ZAP through the MCP server tools:

1. **Health Check:**
   ```
   Use tool: zap.health_check
   ```

2. **Spider Scan:**
   ```
   Use tool: zap.start_spider
   URL: https://www.socialdeal.nl
   ```

3. **Active Scan:**
   ```
   Use tool: zap.start_active_scan
   URL: https://www.socialdeal.nl
   ```

4. **Get Alerts:**
   ```
   Use tool: zap.get_alerts
   baseURL: https://www.socialdeal.nl
   ```

5. **Proxy Process (Intelligent Testing):**
   ```
   Use tool: zap.proxy_process
   URL: https://www.socialdeal.nl/search?q=test
   Method: GET
   ```

### Via Direct API

```bash
# Start spider scan
curl "http://localhost:8081/JSON/spider/action/scan/?url=https://www.socialdeal.nl"

# Check scan status
curl "http://localhost:8081/JSON/spider/view/status/"

# Get alerts
curl "http://localhost:8081/JSON/alert/view/alerts/?baseurl=https://www.socialdeal.nl"
```

## Troubleshooting

### Connection Refused

1. Check if ZAP is running:
   ```bash
   lsof -i :8081
   ps aux | grep zap
   ```

2. Wait for ZAP to fully start (can take 30-60 seconds)

3. Try accessing API first:
   ```bash
   curl http://localhost:8081/JSON/core/view/version/
   ```

### ZAP Not Responding

If ZAP stops responding:
- Check process: `ps aux | grep java`
- Restart if needed
- Check logs if running in Docker

## Next Steps for Social Deal

1. ✅ ZAP is running - you can use it now!
2. Start spider scan on www.socialdeal.nl
3. Run active scan for vulnerabilities
4. Check dashboard for findings: http://localhost:3000

## Quick Start

```bash
# Test ZAP health
curl http://localhost:8081/JSON/core/view/version/

# Start spider scan (via MCP tool)
# Use: zap.start_spider with URL: https://www.socialdeal.nl

# View findings in dashboard
# Open: http://localhost:3000
```

