# 🚀 Quick Start - All Services Running!

## ✅ Current Status

All services have been successfully started:

### 1. **ZAP Proxy** ✅
- **Container**: `zap-daemon`
- **Status**: Running (Healthy)
- **URL**: http://localhost:8081
- **Web UI**: http://localhost:8081/UI
- **Check**: `docker ps | grep zap-daemon`

### 2. **MCP Server (Backend)** ✅
- **Status**: Running in background
- **PID**: Check with `ps aux | grep "node dist/index.js"`
- **Logs**: `tail -f mcp-server.log`

### 3. **Dashboard (Frontend)** ✅
- **URL**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health**: http://localhost:3000/api/health
- **Logs**: `tail -f dashboard-server.log`

## 🎯 Access Your Services

### Open Dashboard in Browser:
```
http://localhost:3000
```

### Open ZAP Web UI:
```
http://localhost:8081/UI
```

## 🧪 Test ZAP Integration

You can now test ZAP functionality! Here are some test commands:

### Test ZAP Health Check (via MCP):
Ask your AI assistant (if using Cursor/ChatGPT):
```
"Check ZAP health using zap.health_check"
```

### Test ZAP via cURL:
```bash
# Check ZAP version
curl "http://localhost:8081/JSON/core/view/version/"

# Get ZAP sites
curl "http://localhost:8081/JSON/core/view/sites/"

# Check ZAP alerts
curl "http://localhost:8081/JSON/alert/view/alerts/"
```

## 📊 View Logs

### Real-time Log Monitoring:

**Terminal 1 - MCP Server:**
```bash
tail -f mcp-server.log
```

**Terminal 2 - Dashboard:**
```bash
tail -f dashboard-server.log
```

**Terminal 3 - ZAP:**
```bash
docker logs -f zap-daemon
```

## 🛑 Stop Services

### Stop All:
```bash
# Stop MCP Server
pkill -f "node dist/index.js"

# Stop Dashboard
pkill -f "dashboard-server.js"

# Stop ZAP (optional - keep it running)
docker stop zap-daemon
```

### Stop Individual Services:
```bash
# MCP Server only
pkill -f "node dist/index.js"

# Dashboard only
pkill -f "dashboard-server.js"

# ZAP only
docker stop zap-daemon
```

## 🔄 Restart Services

### Restart MCP Server:
```bash
pkill -f "node dist/index.js"
npm run build
nohup node dist/index.js > mcp-server.log 2>&1 &
```

### Restart Dashboard:
```bash
pkill -f "dashboard-server.js"
nohup node dashboard-server.js > dashboard-server.log 2>&1 &
```

### Restart ZAP:
```bash
docker restart zap-daemon
```

## 🧪 Example: Test ZAP Spider Scan

1. **Open Dashboard**: http://localhost:3000
2. **Use MCP Tool** (via AI assistant):
   ```
   "Start a ZAP spider scan on https://example.com using zap.start_spider"
   ```
3. **Check Progress**:
   ```
   "Get spider scan status with scanId from previous result"
   ```
4. **View Results**:
   - Check dashboard for findings
   - Use `zap.get_alerts` to see security alerts
   - Use `zap.get_sites` to see discovered sites

## 📝 Next Steps

1. ✅ **Dashboard**: Open http://localhost:3000 to see the UI
2. ✅ **ZAP UI**: Open http://localhost:8081/UI to see ZAP interface
3. ✅ **Test**: Try running a spider scan on a test target
4. ✅ **View Results**: Check dashboard for findings and alerts

## 🔧 Troubleshooting

### Dashboard Not Loading?
- Check if port 3000 is available: `lsof -i :3000`
- Check dashboard logs: `tail -f dashboard-server.log`
- Restart: `pkill -f dashboard-server.js && node dashboard-server.js`

### ZAP Not Responding?
- Check container: `docker ps | grep zap-daemon`
- Check logs: `docker logs zap-daemon`
- Restart: `docker restart zap-daemon`

### MCP Server Not Working?
- Check logs: `tail -f mcp-server.log`
- Verify build: `npm run build`
- Restart: `pkill -f "node dist/index.js" && npm start`

## 🎉 Everything is Ready!

All services are running and ready for testing. Happy bug hunting! 🐛🔍



