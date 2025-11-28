# Run Automated Screenshots - Quick Start

## One Command to Rule Them All

```bash
node automate-screenshots.js [target-url]
```

That's it! The agent will:
1. ✅ Check if ZAP is running on port **8081**
2. ✅ Start ZAP via Docker if needed
3. ✅ Wait for ZAP to be ready
4. ✅ Run the screenshot generator
5. ✅ Process and format all outputs
6. ✅ Create a blog summary

## Port Configuration

**ZAP Proxy Port: 8081** (confirmed)

- **Host port**: 8081 (where you access ZAP)
- **Container port**: 8080 (ZAP's internal port)
- **Docker mapping**: `-p 8081:8080`

The automation script automatically:
- Connects to `http://localhost:8081`
- Creates Docker container with correct port mapping
- Verifies ZAP is accessible on port 8081

## Examples

### Default target (httpbin.org)
```bash
node automate-screenshots.js
```

### Custom target
```bash
node automate-screenshots.js https://example.com
```

### With custom ZAP URL (if different)
```bash
ZAP_URL=http://localhost:8081 node automate-screenshots.js
```

## What It Does

1. **Checks ZAP Status**
   - Tries to connect to `http://localhost:8081`
   - If running, proceeds immediately
   - If not, starts ZAP automatically

2. **Starts ZAP (if needed)**
   - Creates Docker container: `zap-blog-screenshots`
   - Maps port 8081 → 8080
   - Waits for ZAP to be ready

3. **Runs Screenshot Generator**
   - Executes `generate-blog-screenshots.js`
   - Creates all 7 screenshot outputs
   - Formats terminal output with boxes

4. **Processes Outputs**
   - Saves all data to `blog-screenshots-output/`
   - Creates JSON and text files
   - Generates summary

5. **Creates Blog Summary**
   - Generates `BLOG_SUMMARY.md`
   - Includes enhanced findings table
   - Includes before/after comparison

## Output Location

All files saved to: `blog-screenshots-output/`

Key files:
- `1-zap-health-check.txt` - ZAP connection proof
- `5-zap-alerts.json` - ZAP security alerts
- `6-enhanced-findings.json` - **KEY FILE** - Enhanced findings with correlation
- `7-before-after-comparison.txt` - Improvement metrics
- `BLOG_SUMMARY.md` - Ready-to-use summary

## Troubleshooting

### Port 8081 already in use
```bash
# Check what's using the port
lsof -i :8081

# Stop existing ZAP container
docker ps
docker stop <container-id>
```

### Docker not running
```bash
# Start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux)
sudo systemctl start docker
```

### ZAP container exists but stopped
The script will automatically start it for you!

## Next Steps After Running

1. **Review terminal output** - Take screenshots of formatted boxes
2. **Check output files** - Review `blog-screenshots-output/`
3. **Read BLOG_SUMMARY.md** - Use in your blog post
4. **Select best screenshots** - Use Screenshot #6 (Enhanced Findings) as the key one

## Cleanup (Optional)

The script keeps the ZAP container running for reuse. To remove:

```bash
docker stop zap-blog-screenshots
docker rm zap-blog-screenshots
```

Or the script will show you the container ID if you want to remove it later.

---

**Ready? Just run:**
```bash
node automate-screenshots.js
```

🚀


