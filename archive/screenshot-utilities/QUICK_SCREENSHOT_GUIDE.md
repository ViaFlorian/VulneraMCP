# Quick Screenshot Guide - TL;DR

## 3-Step Process

### Step 1: Start ZAP
```bash
docker run -d -p 8081:8080 zaproxy/zap-stable \
  zap.sh -daemon -host 0.0.0.0 -port 8080 \
  -config api.disablekey=true
```

### Step 2: Run the Generator
```bash
node generate-blog-screenshots.js https://httpbin.org
```

### Step 3: Take Screenshots
Capture the formatted terminal output boxes. The script generates 7 key screenshots:

1. ✅ ZAP Health Check
2. ✅ Spider Scan Started  
3. ✅ Spider Progress
4. ✅ Discovered URLs
5. ✅ ZAP Alerts
6. ⭐ **Enhanced Findings** (MOST IMPORTANT!)
7. ✅ Before/After Comparison

## The Key Screenshot (#6)

**Enhanced Findings** is the most important - it shows:
- ZAP alerts + custom findings combined
- Correlation scores (0.0-1.0)
- AI scores (boosted values)
- Verification status

This demonstrates your system's unique value!

## Output Location

All data saved to: `blog-screenshots-output/`

## Need Help?

See `BLOG_SCREENSHOTS_README.md` for detailed instructions.

