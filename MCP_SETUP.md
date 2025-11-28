# MCP Server Setup Guide for Cursor

## Quick Setup

Your Bug Bounty MCP server is configured in `.cursor/mcp.json`. 

### To Activate:

1. **Restart Cursor** - Close and reopen Cursor IDE completely
2. **Check MCP Status** - Go to Settings → Features → MCP → Tools & MCP Servers
3. You should see "bugbounty-mcp" listed under "Installed MCP Servers"

### Configuration File Location

- **Project-specific**: `.cursor/mcp.json` (already created)
- **Global**: `~/.cursor/mcp.json` (for all projects)

## Current Configuration

The server is configured with:
- **Command**: `node`
- **Script**: `/Users/telmonmaluleka/bugbounty-mcp-server/dist/index.js`
- **Environment**: PostgreSQL, Redis, Burp bridge settings

## Customizing Environment Variables

Edit `.cursor/mcp.json` to customize:

```json
{
  "mcpServers": {
    "bugbounty-mcp": {
      "command": "node",
      "args": [
        "/Users/telmonmaluleka/bugbounty-mcp-server/dist/index.js"
      ],
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DB": "bugbounty",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": "your_password_here",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379",
        "CAIDO_MCP_SERVER": "localhost:8080",
        "BURP_BRIDGE_PORT": "9131"
      }
    }
  }
}
```

## Adding Multiple MCP Servers

You can add multiple servers:

```json
{
  "mcpServers": {
    "bugbounty-mcp": {
      "command": "node",
      "args": ["/path/to/bugbounty-mcp-server/dist/index.js"]
    },
    "caido-mcp": {
      "command": "node",
      "args": ["/path/to/caido-mcp-server/dist/index.js"]
    }
  }
}
```

## Troubleshooting

### Server Not Appearing
1. Make sure the path to `dist/index.js` is correct
2. Verify the server builds: `npm run build`
3. Check Cursor logs: Help → Toggle Developer Tools → Console

### Server Not Responding
1. Test the server manually:
   ```bash
   node /Users/telmonmaluleka/bugbounty-mcp-server/dist/index.js
   ```
2. Check environment variables match your setup
3. Verify PostgreSQL/Redis are running if configured

### Tools Not Available
1. Restart Cursor completely
2. Check MCP server status in Settings
3. Verify the server started without errors

## Testing Your Setup

Once configured, try asking Cursor:

- "Run subfinder on example.com"
- "Analyze JavaScript at https://example.com/app.js"
- "Test for XSS on https://example.com/search?q=test"
- "Initialize the database" (first time only)

All 31 tools should be available!

