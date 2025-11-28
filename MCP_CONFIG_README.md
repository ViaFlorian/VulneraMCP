# MCP Configuration File

## Location

The MCP configuration file is located at:
- **Actual config (used by Cursor)**: `~/.cursor/mcp.json`
- **Copy in this repo**: `./mcp.json` (this file)

## Important Notes

⚠️ **The actual config file that Cursor uses is at `~/.cursor/mcp.json`**

The `mcp.json` file in this folder is just a copy for reference. To update your actual configuration:

1. Edit `~/.cursor/mcp.json` directly, OR
2. Copy this file to `~/.cursor/mcp.json`

## Configuration Options

### Database (PostgreSQL)
- `POSTGRES_HOST`: Database host (default: `localhost`)
- `POSTGRES_PORT`: Database port (default: `5432`)
- `POSTGRES_DB`: Database name (default: `bugbounty`)
- `POSTGRES_USER`: Database user (default: `postgres`)
- `POSTGRES_PASSWORD`: Database password (empty for trust auth)

### Redis (Optional)
- `REDIS_HOST`: Redis host (default: `localhost`)
- `REDIS_PORT`: Redis port (default: `6379`)

### Burp Bridge
- `BURP_BRIDGE_PORT`: Port for Burp bridge server (default: `9131`)

### Caido Integration

#### For Cloud API:
```json
"CAIDO_MCP_SERVER": "api.caido.io",
"CAIDO_API_TOKEN": "your_pat_token_here"
```

#### For Local Instance:
```json
"CAIDO_MCP_SERVER": "localhost:8080",
"CAIDO_API_TOKEN": "your_local_token_here"
```

#### For Creating PATs (temporary):
```json
"CAIDO_SESSION": "your_session_cookie_here"
```
**Note**: Remove `CAIDO_SESSION` after creating the PAT - you only need it temporarily.

## Quick Setup

1. **Copy the config to Cursor's location**:
   ```bash
   cp mcp.json ~/.cursor/mcp.json
   ```

2. **Update paths if needed**:
   - Update `command` to your Node.js path: `which node`
   - Update `args[0]` to the full path of `dist/index.js`

3. **Set your tokens**:
   - Add your `CAIDO_API_TOKEN` (PAT for cloud or local token)
   - For PAT creation, temporarily add `CAIDO_SESSION`

4. **Restart Cursor** to load the new configuration

## Finding Your Node.js Path

```bash
which node
# Output: /usr/local/bin/node (or similar)
```

## Testing the Configuration

After updating `~/.cursor/mcp.json` and restarting Cursor, test with:

```
db.get_statistics
```

Or test Caido:
```
caido.agent_discover_endpoints with {"host": "example.com"}
```





