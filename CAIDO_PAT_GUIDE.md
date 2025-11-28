# Caido Personal Access Token (PAT) Creation Guide

## Overview
To use the Caido Cloud API, you need a Personal Access Token (PAT). PATs act on your behalf and have the same permissions as your account.

## Step 1: Get Your CAIDO_SESSION Cookie

1. **Open Caido Cloud** in your browser:
   - Go to: https://app.caido.io
   - Log in with your account

2. **Open Browser Dev Tools**:
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
   - Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)

3. **Find the Cookie**:
   - In the left sidebar, expand **Cookies** → `https://app.caido.io`
   - Look for a cookie named `CAIDO_SESSION`
   - Copy the entire cookie value (it's a long string)

4. **Temporarily Add to Config**:
   - Open `~/.cursor/mcp.json`
   - Add `"CAIDO_SESSION": "<your-cookie-value>"` to the `env` section
   - **Important**: This is temporary - you'll remove it after creating the PAT

## Step 2: Create the PAT

### Option A: Using the MCP Tool (After Restarting Cursor)

1. **Restart Cursor** to load the updated config with `CAIDO_SESSION`

2. **Use the tool**:
   ```
   caido.create_pat with {"name": "MCP Server Token"}
   ```

   Or with optional parameters:
   ```
   caido.create_pat with {"name": "MCP Server Token", "teamId": "YOUR_TEAM_ID", "expiresAt": "2025-12-31T23:59:59Z"}
   ```

3. **Copy the token** from the response (it starts with `caido_...`)

### Option B: Using curl (Manual)

```bash
curl -X POST https://api.caido.io/dashboard/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: CAIDO_SESSION=<YOUR_SESSION_COOKIE>" \
  -d '{
    "query": "mutation CreatePat($input: CreatePatInput!) { createPat(input: $input) { pat { id token name createdAt expiresAt } } }",
    "variables": {
      "input": {
        "name": "MCP Server Token"
      }
    }
  }'
```

## Step 3: Update Your Config

1. **Remove `CAIDO_SESSION`** from `~/.cursor/mcp.json` (you don't need it anymore)

2. **Update the config**:
   ```json
   {
     "mcpServers": {
       "bugbounty-mcp": {
         "env": {
           "CAIDO_MCP_SERVER": "api.caido.io",
           "CAIDO_API_TOKEN": "<YOUR_NEW_PAT_TOKEN>"
         }
       }
     }
   }
   ```

3. **Restart Cursor** to load the new PAT

## Step 4: Test

Test the connection:
```
caido.agent_discover_endpoints with {"host": "stripchat.com"}
```

## Troubleshooting

### "CAIDO_SESSION cookie required"
- Make sure you're logged into https://app.caido.io
- Check that the cookie value is correct (no extra spaces)
- The cookie expires when you log out, so create the PAT while logged in

### "INVALID_TOKEN" error
- The PAT might be expired or revoked
- Create a new PAT and update `CAIDO_API_TOKEN`

### "No requests found"
- Make sure you have traffic captured in your Caido instance
- The host filter might be too specific - try a broader query first

## Revoking a PAT

If you need to revoke a PAT:

1. Get your `CAIDO_SESSION` cookie again (temporarily)
2. Use the tool:
   ```
   caido.revoke_pat with {"patId": "YOUR_PAT_ID"}
   ```

Or manually:
```bash
curl -X POST https://api.caido.io/dashboard/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: CAIDO_SESSION=<YOUR_SESSION_COOKIE>" \
  -d '{
    "query": "mutation RevokePat($id: ID!) { revokePat(id: $id) { pat { id } } }",
    "variables": {
      "id": "YOUR_PAT_ID"
    }
  }'
```

## Security Notes

- **PATs are sensitive**: Treat them like passwords
- **Store securely**: Don't commit PATs to version control
- **Rotate regularly**: Create new PATs periodically and revoke old ones
- **Team-scoped**: If you specify a `teamId`, the PAT will only have access to that team's resources






