# Caido Troubleshooting

## Issue: Getting HTML Instead of API Response

If `caido.query` returns HTML (Caido web UI), it means:

### Problem
- Caido web UI is running on port 8080
- But the MCP/API endpoint is different or not configured

### Solutions

#### Option 1: Check Caido API Settings
1. Open Caido
2. Go to Settings → API or MCP
3. Find the API endpoint URL
4. Update `CAIDO_MCP_SERVER` in `~/.cursor/mcp.json`

#### Option 2: Use Caido's GraphQL API
Caido uses GraphQL. The endpoint might be:
- `http://localhost:8080/graphql`
- `http://localhost:8080/api/graphql`

Update config:
```json
"CAIDO_MCP_SERVER": "localhost:8080/graphql"
```

#### Option 3: Check Caido Documentation
- Caido might need a separate MCP server plugin
- Or the API might be on a different port (8081, 8082, etc.)

#### Option 4: Manual Testing
Test the API directly:
```bash
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ requests { id method path } }"}'
```

If this works, use that endpoint in your config.

### Current Status
- ✅ MCP tools are ready
- ✅ Integration code is set up
- ⚠️ Need to find correct Caido API endpoint
- ⚠️ May need to enable MCP server in Caido settings

### Next Steps
1. Check Caido settings for API/MCP configuration
2. Find the correct endpoint URL
3. Update `CAIDO_MCP_SERVER` in config
4. Restart Cursor
5. Test again

The tools will work once the correct endpoint is configured!








