# Quick Start Guide

Get up and running with the Bug Bounty MCP Server in 5 minutes!

## Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd bugbounty-mcp-server

# Start everything with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f bugbounty-mcp
```

That's it! The server is now running and ready to connect.

## Option 2: Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
```

### 3. Start Services (Optional)

If you want database features:

```bash
# PostgreSQL (macOS)
brew install postgresql
brew services start postgresql
createdb bugbounty

# Redis (macOS)
brew install redis
brew services start redis
```

### 4. Build and Run

```bash
npm run build
npm start
```

### 5. Initialize Database (First Time)

Once the server is running, call the `db.init` tool via your MCP client to create tables.

## Connect to Cursor

1. Open Cursor Settings
2. Go to Features → MCP
3. Add new server:

```json
{
  "command": "node",
  "args": ["/absolute/path/to/bugbounty-mcp-server/dist/index.js"]
}
```

4. Restart Cursor

## Connect to ChatGPT Desktop

1. Edit `~/.config/chatgpt/mcp.json`:

```json
{
  "servers": {
    "bugbounty-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/bugbounty-mcp-server/dist/index.js"]
    }
  }
}
```

2. Restart ChatGPT Desktop

## Test It Works

Try asking your AI assistant:

- "Run subfinder on example.com"
- "Analyze the JavaScript at https://example.com/app.js"
- "Test for XSS on https://example.com/search?q=test"

## Next Steps

- Install optional CLI tools (subfinder, httpx, amass) for full recon capabilities
- Set up Burp Suite extension for traffic capture
- Configure Caido MCP server URL if you have one
- Read the full [README.md](README.md) for advanced usage

## Troubleshooting

**Server won't start:**
- Check Node.js version: `node --version` (needs 18+)
- Check for port conflicts
- Review error logs

**Database connection fails:**
- Verify PostgreSQL/Redis are running
- Check connection strings in `.env`
- Database is optional - server works without it

**Tools not working:**
- Some tools require CLI binaries (subfinder, httpx, etc.)
- Install them or the tools will return helpful error messages
- Check tool descriptions for requirements

## Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review tool descriptions in the MCP client
- Check server logs for error messages

