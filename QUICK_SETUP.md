# Quick Caido Setup Guide

## Current Status
✅ Your config is set to use **Caido Cloud API** (`api.caido.io`)
✅ You have a token configured
✅ Code has been updated to use the correct endpoints

## What You Need to Do

### Option 1: Verify Your Token is Valid (Recommended First Step)

1. **Get a fresh token from Caido Cloud:**
   - Go to [https://app.caido.io](https://app.caido.io) (or check if you have a local instance)
   - Log in
   - Go to **Settings** → **API** → **Personal Access Tokens**
   - Create a new token or verify your existing one

2. **Test your token:**
   ```bash
   cd /Users/telmonmaluleka/bugbounty-mcp-server
   node verify-caido-token.js "your_token_here"
   ```

### Option 2: Use Local Caido Instance (If Cloud Doesn't Work)

If the cloud API doesn't work, you can use a local Caido instance:

1. **Install and run Caido locally:**
   - Download from [https://caido.io/download](https://caido.io/download)
   - Run it (usually on `http://localhost:8080`)

2. **Get a local token:**
   - Open `http://localhost:8080`
   - Go to **Settings** → **API** → **Personal Access Tokens**
   - Create a new token

3. **Update `~/.cursor/mcp.json`:**
   ```json
   "CAIDO_MCP_SERVER": "localhost:8080",
   "CAIDO_API_TOKEN": "your_local_token_here"
   ```

4. **Restart Cursor**

## Current Configuration

Your `~/.cursor/mcp.json` is currently set to:
- `CAIDO_MCP_SERVER`: `"api.caido.io"` (Cloud API)
- `CAIDO_API_TOKEN`: Your token (starts with `caido_...`)

## Next Steps

1. **Restart Cursor** (Cmd+Q, then reopen)
2. **Test the connection:**
   ```
   caido.agent_discover_endpoints with {"host": "stripchat.com"}
   ```

## Troubleshooting

### If you get "INVALID_TOKEN":
- Your token might be expired or invalid
- Get a new token from Caido and update `CAIDO_API_TOKEN` in `~/.cursor/mcp.json`
- Make sure you're using a **cloud token** if `CAIDO_MCP_SERVER` is `"api.caido.io"`
- Make sure you're using a **local token** if `CAIDO_MCP_SERVER` is `"localhost:8080"`

### If you get "404":
- Make sure you've restarted Cursor after updating the config
- The code has been updated to use `https://api.caido.io/graphql` for cloud API

### If you get DNS errors:
- Check your internet connection
- Try using a local Caido instance instead

## Summary

**To set up Caido correctly:**

1. ✅ Code is updated and built
2. ⏳ **You need to:** Verify/get a valid token from Caido
3. ⏳ **You need to:** Restart Cursor
4. ⏳ **You need to:** Test with `caido.agent_discover_endpoints`

The MCP server is ready - you just need a valid token and to restart Cursor!




