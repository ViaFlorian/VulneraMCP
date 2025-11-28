# Bug Bounty Dashboard

A beautiful web dashboard for visualizing bug bounty findings, test results, and statistics from the Bug Bounty MCP Server.

## Features

- 📊 **Real-time Statistics**: View total findings, breakdown by severity (Critical, High, Medium, Low)
- 🔍 **Findings List**: Browse all security findings with detailed information
- ⚡ **Auto-refresh**: Dashboard automatically updates every 30 seconds
- 🎨 **Modern UI**: Clean, responsive design with gradient backgrounds
- 📈 **Severity-based Color Coding**: Easy visual identification of vulnerability severity

## Quick Start

### 1. Build the Project

```bash
npm run build
```

### 2. Start the Dashboard Server

```bash
npm run dashboard
```

Or directly:

```bash
node dashboard-server.js
```

### 3. Open in Browser

Navigate to: **http://localhost:3000**

(Default port is 3000. Change it by setting `DASHBOARD_PORT` environment variable)

## Configuration

### Environment Variables

- `DASHBOARD_PORT`: Port for dashboard server (default: 3000)
- `POSTGRES_HOST`: PostgreSQL host (default: localhost)
- `POSTGRES_PORT`: PostgreSQL port (default: 5432)
- `POSTGRES_DB`: Database name (default: bugbounty)
- `POSTGRES_USER`: Database user (default: postgres)
- `POSTGRES_PASSWORD`: Database password

### Example `.env` file:

```env
DASHBOARD_PORT=3000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=bugbounty
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

## API Endpoints

The dashboard server provides the following REST API endpoints:

### GET `/api/statistics`
Get overall statistics about findings.

**Response:**
```json
{
  "totalFindings": 42,
  "bySeverity": {
    "critical": 5,
    "high": 12,
    "medium": 15,
    "low": 10
  },
  "recentFindings": 8,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET `/api/findings`
Get list of findings.

**Query Parameters:**
- `limit` (optional): Number of findings to return (default: 100)
- `target` (optional): Filter by target URL/domain
- `severity` (optional): Filter by severity (critical, high, medium, low)

**Response:**
```json
{
  "findings": [
    {
      "id": 1,
      "target": "https://example.com/api/users",
      "type": "SQL Injection",
      "severity": "high",
      "description": "SQL injection vulnerability found in user parameter",
      "score": 8,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### GET `/api/test-results`
Get test results.

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 50)
- `target` (optional): Filter by target
- `testType` (optional): Filter by test type
- `success` (optional): Filter by success status (true/false)

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Running Both Servers

You can run both the MCP server and dashboard simultaneously:

### Terminal 1 - MCP Server:
```bash
npm run build
npm start
```

### Terminal 2 - Dashboard:
```bash
npm run dashboard
```

## Architecture

```
┌─────────────────┐
│   Browser       │
│   Dashboard UI  │
└────────┬────────┘
         │
         │ HTTP/REST API
         │
┌────────▼──────────────┐
│  Dashboard Server     │
│  (Express + API)      │
└────────┬──────────────┘
         │
         │ SQL Queries
         │
┌────────▼──────────────┐
│  PostgreSQL Database  │
│  (Findings & Results) │
└───────────────────────┘
```

The dashboard is a separate server from the MCP server:
- **MCP Server**: Handles MCP protocol via stdin/stdout (for AI agents)
- **Dashboard Server**: Handles HTTP requests (for web UI)

Both servers share the same PostgreSQL database.

## Troubleshooting

### Dashboard shows "Database not available"

1. Check if PostgreSQL is running:
   ```bash
   psql -U postgres -d bugbounty
   ```

2. Verify environment variables in `.env` file

3. Check dashboard server logs for connection errors

### No findings showing

1. Make sure you've saved findings using the MCP server tools (e.g., `db.save_finding`)
2. Check if the database has been initialized: `db.init` tool
3. Verify database connection in dashboard server logs

### Port already in use

Change the port:
```bash
DASHBOARD_PORT=3001 node dashboard-server.js
```

## Development

The dashboard is a simple HTML/CSS/JavaScript application served by Express. To modify:

- **HTML/CSS**: Edit `public/index.html`
- **API Endpoints**: Edit `dashboard-server.js`
- **Styling**: CSS is embedded in `public/index.html` in `<style>` tags

## Future Enhancements

Potential improvements:
- [ ] Charts and graphs using Chart.js
- [ ] Filtering and search functionality
- [ ] Export findings to CSV/JSON
- [ ] Real-time updates using WebSockets
- [ ] User authentication
- [ ] Test results visualization
- [ ] Timeline view of findings
- [ ] Dark mode

## License

MIT



