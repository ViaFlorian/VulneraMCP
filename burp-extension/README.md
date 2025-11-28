# Burp Suite Extension for Bug Bounty MCP

This Burp Suite extension sends all HTTP traffic to the Bug Bounty MCP bridge server for analysis.

## Building

1. Install Java JDK 8 or later
2. Download Burp Suite API JAR file from PortSwigger
3. Compile the extension:

```bash
javac -cp burpsuite_pro.jar BurpBridge.java
jar cf burp-bridge.jar BurpBridge.class
```

## Installation

1. Open Burp Suite
2. Go to Extensions → Installed → Add
3. Select "Java" extension type
4. Browse to `burp-bridge.jar`
5. Click "Next" and ensure it loads without errors

## Configuration

The extension sends traffic to `http://localhost:9131/traffic` by default.

To change the bridge URL, modify the `bridgeUrl` variable in `BurpBridge.java` and rebuild.

## Usage

Once installed, the extension will automatically:
- Capture all HTTP requests and responses
- Send them to the MCP bridge server
- Allow the MCP server to analyze traffic in real-time

The bridge server must be running for the extension to work (it will fail silently if the bridge is not available).

