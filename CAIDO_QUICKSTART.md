# Caido Quick Start

## Setup (3 Steps)

### 1. Start Caido
- Open Caido application
- Make sure it's running and capturing traffic

### 2. Find Caido MCP Server Port
Caido's MCP server usually runs on:
- Default: `localhost:8080`
- Or check Caido settings for MCP server port

### 3. Update Config
Your `~/.cursor/mcp.json` is already updated with:
```json
"CAIDO_MCP_SERVER": "localhost:8080"
```

If Caido uses a different port, change `8080` to your port.

## Test Connection

Once Caido is running, test it:

```
caido.query
{
  "httpql": "req.host.cont:\"example.com\"",
  "limit": 10
}
```

## Quick Examples

### Find all API endpoints
```
caido.find_endpoints
{
  "host": "stripchat.com",
  "pathPattern": "/api"
}
```

### Search for secrets
```
caido.search
{
  "pattern": "api_key|token|secret",
  "field": "body"
}
```

### Analyze authentication
```
caido.analyze_auth
{
  "host": "stripchat.com"
}
```

### Query specific traffic
```
caido.query
{
  "httpql": "req.method.eq:\"POST\" AND req.path.cont:\"/api\"",
  "limit": 50
}
```

## HTTPQL Quick Reference

- `req.host.cont:"example.com"` - Host contains
- `req.path.cont:"/api"` - Path contains  
- `req.method.eq:"POST"` - Method equals
- `req.status.eq:200` - Status code
- `req.body.cont:"password"` - Body contains
- `AND` / `OR` - Combine conditions

## Troubleshooting

**Connection fails?**
1. Check Caido is running
2. Verify port in config matches Caido's MCP server port
3. Restart Cursor after config changes

**No results?**
- Make sure you've captured traffic in Caido first
- Check HTTPQL syntax is correct

That's it! Once Caido is running, the MCP tools will work automatically.









