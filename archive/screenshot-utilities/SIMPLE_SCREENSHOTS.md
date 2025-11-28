# Simple Screenshot Guide - Let's Get This Working!

## Option 1: Manual (Simplest - No Docker needed if ZAP is already running)

If you already have ZAP running on port 8081:

```bash
# Just run the generator
node generate-blog-screenshots.js https://httpbin.org
```

That's it! Take screenshots of the terminal output.

---

## Option 2: Quick Docker Start (If ZAP not running)

```bash
# Start ZAP (one command)
docker run -d -p 8081:8080 --name zap-screenshots zaproxy/zap-stable zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.disablekey=true

# Wait 10 seconds for ZAP to start
sleep 10

# Run generator
node generate-blog-screenshots.js https://httpbin.org
```

---

## Option 3: Use Existing ZAP (If you have ZAP Desktop)

If you're running ZAP Desktop:
1. Make sure it's listening on port 8081
2. Run: `node generate-blog-screenshots.js https://httpbin.org`

---

## What You'll Get

The script will output formatted boxes in your terminal. Just:
1. **Take screenshots** of the terminal output
2. **That's your blog screenshots!**

The key screenshot is **#6 - Enhanced Findings** - it shows correlation scores.

---

## Troubleshooting

### "ZAP is not accessible"
- Check: `curl http://localhost:8081/JSON/core/view/version/`
- If it works, ZAP is running
- If not, start ZAP (Option 2 above)

### "Docker not working"
- Skip Docker, use ZAP Desktop instead
- Or install ZAP locally

### "Script hangs"
- Press Ctrl+C
- Check if ZAP is actually running
- Try a simpler target like `https://example.com`

---

## The Simplest Path Forward

**Just want screenshots?** Use a test site that's already scanned or create mock data:

1. Take a screenshot of your ZAP integration code
2. Create a simple mock output showing enhanced findings
3. Use that for the blog

The blog is about the **concept** and **integration**, not necessarily live scanning.

---

## Need Help?

Tell me:
1. Do you have ZAP running? (Desktop or Docker?)
2. What error are you seeing?
3. Do you just want mock data for screenshots?

Let's get you winning! 🚀


