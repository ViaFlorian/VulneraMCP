# Service Startup Guide

All services have been started! Here's how to access and manage them:

## 🚀 Running Services

### 1. ZAP Proxy
- **URL**: http://localhost:8081
- **API Docs**: http://localhost:8081/UI
- **Status**: Check with `docker ps | grep zap`
- **Logs**: `docker logs zap-proxy`

### 2. MCP Server (Backend)
- **Status**: Running in background
- **Logs**: `tail -f mcp-server.log`
- **Process**: `ps aux | grep "node dist/index.js"`

### 3. Dashboard Server (Frontend)
- **URL**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health
- **Logs**: `tail -f dashboard-server.log`

## 🛠️ Management Commands

### Stop All Services
```bash
# Stop MCP Server
pkill -f "node dist/index.js"

# Stop Dashboard
pkill -f "dashboard-server.js"

# Stop ZAP
docker stop zap-proxy
docker rm zap-proxy
```

### Start Services Manually

#### Start ZAP:
```bash
docker run -d --name zap-proxy -p 8081:8080 zaproxy/zap-stable zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.disablekey=true
```

#### Start MCP Server:
```bash
npm run build
nohup node dist/index.js > mcp-server.log 2>&1 &
```

#### Start Dashboard:
```bash
nohup node dashboard-server.js > dashboard-server.log 2>&1 &
```

### View Logs
```bash
# MCP Server logs
tail -f mcp-server.log

# Dashboard logs
tail -f dashboard-server.log

# ZAP logs
docker logs -f zap-proxy
```

## ✅ Testing

### Test ZAP Health
```bash
curl http://localhost:8081/JSON/core/view/version/
```

### Test Dashboard
```bash
curl http://localhost:3000/api/health
```

### Test MCP Server
```bash
node test-mcp-server.js
```

## 🔧 Troubleshooting

### Port Already in Use
If port 8081 or 3000 is already in use:
- Change ZAP port: Use `-p 8082:8080` instead
- Change Dashboard port: Set `DASHBOARD_PORT=3001` environment variable

### ZAP Not Starting
```bash
# Check if container exists
docker ps -a | grep zap

# Remove old container
docker rm -f zap-proxy

# Start fresh
docker run -d --name zap-proxy -p 8081:8080 zaproxy/zap-stable zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.disablekey=true
```

### Services Not Responding
1. Check if processes are running: `ps aux | grep node`
2. Check logs for errors
3. Verify PostgreSQL is running (if using database)

## 📝 Next Steps

1. **Open Dashboard**: http://localhost:3000
2. **Test ZAP**: Use `zap.health_check` tool via MCP
3. **Run Spider Scan**: Use `zap.start_spider` with a target URL
4. **View Findings**: Check the dashboard for results



