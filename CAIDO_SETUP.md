# Caido Setup Guide

This guide explains how to set up Caido integration for the Bug Bounty MCP server. You can use either **Caido Cloud** (recommended) or a **local Caido instance**.

## Option 1: Caido Cloud (Recommended)

### Step 1: Sign up for Caido Cloud
1. Go to [https://app.caido.io](https://app.caido.io)
2. Sign up or log in to your account

### Step 2: Get Your Personal Access Token (PAT)

#### Method A: Using the Web UI
1. Log in to [https://app.caido.io](https://app.caido.io)
2. Go to **Settings** → **API** (or **Personal Access Tokens**)
3. Click **Generate New Token** or **Create Token**
4. Give it a name (e.g., "MCP Server Token")
5. Copy the token immediately (you won't be able to see it again!)

#### Method B: Using the MCP Tool (if you have session cookie)
1. Log in to [https://app.caido.io](https://app.caido.io] in your browser
2. Open browser DevTools (F12) → Application/Storage → Cookies
3. Copy the `CAIDO_SESSION` cookie value
4. Temporarily add it to your `mcp.json`:
   ```json
   "CAIDO_SESSION": "your_session_cookie_value_here"
   ```
5. Restart Cursor
6. Use the `caido.create_pat` tool:
   ```
   caido.create_pat with {"name": "MCP Server Token"}
   ```
7. Copy the returned token and remove `CAIDO_SESSION` from `mcp.json`

### Step 3: Configure mcp.json

Update your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "bugbounty-mcp": {
      "command": "/usr/local/bin/node",
      "args": [
        "/Users/telmonmaluleka/bugbounty-mcp-server/dist/index.js"
      ],
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DB": "bugbounty",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": "",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379",
        "BURP_BRIDGE_PORT": "9131",
        "CAIDO_MCP_SERVER": "api.caido.io",
        "CAIDO_API_TOKEN": "your_pat_token_here"
      }
    }
  }
}
```

**Important:**
- Set `CAIDO_MCP_SERVER` to `"api.caido.io"` (this tells the MCP server to use cloud API)
- Set `CAIDO_API_TOKEN` to your Personal Access Token from Step 2
- Do NOT include `CAIDO_SESSION` unless you're creating a PAT (then remove it after)

### Step 4: Restart Cursor
1. Completely quit Cursor (Cmd+Q on Mac)
2. Reopen Cursor
3. The MCP server will load with the new configuration

### Step 5: Test the Connection

Try using a Caido tool:
```
caido.agent_discover_endpoints with {"host": "example.com"}
```

Or check if you have any traffic:
```
caido.query with {"httpql": "req.host.cont:\"example.com\""}
```

---

## Option 2: Local Caido Instance

### Step 1: Install and Run Caido Locally
1. Follow Caido's installation guide: [https://docs.caido.io/getting-started/installation](https://docs.caido.io/getting-started/installation)
2. Start Caido (usually runs on `http://localhost:8080`)

### Step 2: Get Your Local API Token
1. Open [http://localhost:8080](http://localhost:8080) in your browser
2. Go to **Settings** → **API** → **Personal Access Tokens**
3. Click **Generate New Token**
4. Give it a name and copy the token

### Step 3: Configure mcp.json

Update your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "bugbounty-mcp": {
      "command": "/usr/local/bin/node",
      "args": [
        "/Users/telmonmaluleka/bugbounty-mcp-server/dist/index.js"
      ],
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DB": "bugbounty",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": "",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379",
        "BURP_BRIDGE_PORT": "9131",
        "CAIDO_MCP_SERVER": "localhost:8080",
        "CAIDO_API_TOKEN": "your_local_pat_token_here"
      }
    }
  }
}
```

**Important:**
- Set `CAIDO_MCP_SERVER` to `"localhost:8080"` (or your local Caido port)
- Set `CAIDO_API_TOKEN` to your local Personal Access Token
- Make sure Caido is running before testing

### Step 4: Restart Cursor
1. Completely quit Cursor (Cmd+Q on Mac)
2. Reopen Cursor

### Step 5: Test the Connection

Try using a Caido tool:
```
caido.agent_discover_endpoints with {"host": "example.com"}
```

---

## Troubleshooting

### Error: "INVALID_TOKEN" or "AUTHORIZATION"
- **Cloud API**: Make sure you're using a cloud PAT and `CAIDO_MCP_SERVER` is set to `"api.caido.io"`
- **Local API**: Make sure you're using a local PAT and `CAIDO_MCP_SERVER` is set to `"localhost:8080"`
- **Token format**: The token should start with `caido_` and be quite long. Make sure you copied the entire token.

### Error: "Request failed with status code 404"
- Make sure you've restarted Cursor after updating `mcp.json`
- For cloud: The MCP server should use `https://app.caido.io/dashboard/graphql`
- For local: The MCP server should use `http://localhost:8080/graphql`

### Error: "Request failed with status code 403"
- Your token might be expired or revoked
- Generate a new PAT and update `CAIDO_API_TOKEN` in `mcp.json`
- Make sure you have the correct permissions on your Caido account

### No Traffic in Caido
- Make sure you've imported traffic into Caido (via proxy, browser extension, or manual import)
- Check that your HTTPQL queries match your traffic
- For cloud: Make sure you're querying the correct project/workspace

### Token Not Working After Restart
- Double-check that `CAIDO_API_TOKEN` in `mcp.json` matches your token exactly
- Make sure there are no extra spaces or quotes around the token
- Verify the token is still valid in Caido's settings

---

## Quick Reference

| Setting | Cloud API | Local API |
|---------|-----------|-----------|
| `CAIDO_MCP_SERVER` | `"api.caido.io"` | `"localhost:8080"` |
| `CAIDO_API_TOKEN` | Cloud PAT | Local PAT |
| Base URL (internal) | `https://app.caido.io` | `http://localhost:8080` |
| GraphQL Endpoint | `/dashboard/graphql` | `/graphql` |
| Where to get token | [app.caido.io](https://app.caido.io) → Settings → API | [localhost:8080](http://localhost:8080) → Settings → API |

---

## Next Steps

Once Caido is set up correctly:
1. Import traffic into Caido (via proxy, browser extension, or manual import)
2. Use `caido.agent_discover_endpoints` to find endpoints
3. Use `caido.agent_security_scan` to scan for vulnerabilities
4. Use `caido.query` to search traffic with HTTPQL

For more information, see:
- [Caido Documentation](https://docs.caido.io)
- [Caido API Reference](https://developer.caido.io)
