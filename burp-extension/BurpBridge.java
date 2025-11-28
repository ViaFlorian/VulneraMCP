package burp;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class BurpBridge implements IBurpExtender, IHttpListener, IProxyListener {
    private IBurpExtenderCallbacks callbacks;
    private IExtensionHelpers helpers;
    private String bridgeUrl = "http://localhost:9131/traffic";
    
    @Override
    public void registerExtenderCallbacks(IBurpExtenderCallbacks callbacks) {
        this.callbacks = callbacks;
        this.helpers = callbacks.getHelpers();
        
        callbacks.setExtensionName("Bug Bounty MCP Bridge");
        callbacks.registerHttpListener(this);
        callbacks.registerProxyListener(this);
        
        callbacks.printOutput("Bug Bounty MCP Bridge extension loaded");
        callbacks.printOutput("Bridge URL: " + bridgeUrl);
    }
    
    @Override
    public void processHttpMessage(int toolFlag, boolean messageIsRequest, IHttpRequestResponse messageInfo) {
        if (messageIsRequest) {
            return;
        }
        
        try {
            IRequestInfo requestInfo = helpers.analyzeRequest(messageInfo);
            IResponseInfo responseInfo = helpers.analyzeResponse(messageInfo.getResponse());
            
            String requestBody = new String(messageInfo.getRequest());
            String responseBody = new String(messageInfo.getResponse());
            
            // Extract request details
            String method = requestInfo.getMethod();
            URL url = requestInfo.getUrl();
            List<String> requestHeaders = requestInfo.getHeaders();
            
            // Extract response details
            int statusCode = responseInfo.getStatusCode();
            List<String> responseHeaders = responseInfo.getHeaders();
            
            // Build JSON payload
            String jsonPayload = buildJsonPayload(
                method,
                url.toString(),
                requestHeaders,
                requestBody.substring(requestInfo.getBodyOffset()),
                statusCode,
                responseHeaders,
                responseBody.substring(responseInfo.getBodyOffset())
            );
            
            // Send to bridge
            sendToBridge(jsonPayload);
            
        } catch (Exception e) {
            callbacks.printError("Error processing message: " + e.getMessage());
        }
    }
    
    @Override
    public void processProxyMessage(boolean messageIsRequest, IInterceptedProxyMessage message) {
        // Also capture proxy messages
        if (!messageIsRequest) {
            IHttpRequestResponse messageInfo = message.getMessageInfo();
            processHttpMessage(IBurpExtenderCallbacks.TOOL_PROXY, false, messageInfo);
        }
    }
    
    private String buildJsonPayload(
        String method,
        String url,
        List<String> requestHeaders,
        String requestBody,
        int statusCode,
        List<String> responseHeaders,
        String responseBody
    ) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"request\":{");
        json.append("\"method\":\"").append(escapeJson(method)).append("\",");
        json.append("\"url\":\"").append(escapeJson(url)).append("\",");
        json.append("\"headers\":{");
        
        // Parse request headers
        boolean first = true;
        for (String header : requestHeaders) {
            if (header.contains(":")) {
                String[] parts = header.split(":", 2);
                if (parts.length == 2) {
                    if (!first) json.append(",");
                    json.append("\"").append(escapeJson(parts[0].trim())).append("\":\"")
                         .append(escapeJson(parts[1].trim())).append("\"");
                    first = false;
                }
            }
        }
        
        json.append("},");
        json.append("\"body\":\"").append(escapeJson(requestBody)).append("\"");
        json.append("},");
        json.append("\"response\":{");
        json.append("\"status\":").append(statusCode).append(",");
        json.append("\"headers\":{");
        
        // Parse response headers
        first = true;
        for (String header : responseHeaders) {
            if (header.contains(":")) {
                String[] parts = header.split(":", 2);
                if (parts.length == 2) {
                    if (!first) json.append(",");
                    json.append("\"").append(escapeJson(parts[0].trim())).append("\":\"")
                         .append(escapeJson(parts[1].trim())).append("\"");
                    first = false;
                }
            }
        }
        
        json.append("},");
        json.append("\"body\":\"").append(escapeJson(responseBody)).append("\"");
        json.append("}");
        json.append("}");
        
        return json.toString();
    }
    
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
    
    private void sendToBridge(String jsonPayload) {
        try {
            URL url = new URL(bridgeUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonPayload.getBytes("utf-8");
                os.write(input, 0, input.length);
            }
            
            int responseCode = conn.getResponseCode();
            if (responseCode != 200) {
                callbacks.printError("Bridge returned error: " + responseCode);
            }
            
        } catch (IOException e) {
            // Silently fail - bridge might not be running
            // callbacks.printError("Failed to send to bridge: " + e.getMessage());
        }
    }
}

