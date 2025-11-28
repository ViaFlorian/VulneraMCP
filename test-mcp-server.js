#!/usr/bin/env node

/**
 * Test script for MCP Server
 * This script starts the MCP server and sends test requests to verify it's working
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Starting MCP Server Test...\n');
console.log('='.repeat(60));

const serverPath = path.join(__dirname, 'dist', 'index.js');
const server = spawn('node', [serverPath], {
  env: {
    ...process.env,
    NODE_ENV: 'development',
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverOutput = '';
let serverErrors = '';

// Capture stdout (JSON-RPC responses)
server.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  console.log('\n📤 SERVER RESPONSE (stdout):');
  console.log(output);
  console.log('─'.repeat(60));
});

// Capture stderr (debug logs)
server.stderr.on('data', (data) => {
  const output = data.toString();
  serverErrors += output;
  console.log('📋 SERVER LOG (stderr):');
  console.log(output);
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Wait a bit for server to initialize, then send test requests
setTimeout(() => {
  console.log('\n📨 Sending test requests...\n');
  
  // Test 1: Initialize
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  
  console.log('📤 Sending: initialize');
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // Test 2: List tools (after initialization)
  setTimeout(() => {
    const toolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };
    
    console.log('\n📤 Sending: tools/list');
    server.stdin.write(JSON.stringify(toolsRequest) + '\n');
    
    // Test 3: Try a simple tool call
    setTimeout(() => {
      const healthCheckRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'zap.health_check',
          arguments: {}
        }
      };
      
      console.log('\n📤 Sending: tools/call (zap.health_check)');
      server.stdin.write(JSON.stringify(healthCheckRequest) + '\n');
      
      // Close after a delay
      setTimeout(() => {
        console.log('\n\n✅ Test completed!');
        console.log('\n📊 Summary:');
        console.log('─'.repeat(60));
        console.log('Server Output (stdout):', serverOutput ? '✓ Received' : '✗ No output');
        console.log('Server Logs (stderr):', serverErrors ? '✓ Received' : '✗ No logs');
        console.log('\n🛑 Shutting down server...\n');
        server.kill();
        process.exit(0);
      }, 3000);
    }, 2000);
  }, 2000);
}, 1000);

// Handle server exit
server.on('exit', (code) => {
  console.log(`\n\nServer exited with code ${code}`);
  process.exit(code);
});



