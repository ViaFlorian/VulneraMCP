import 'dotenv/config';
import { Server } from './mcp/server';
import { registerReconTools } from './tools/recon';
import { registerJsTools } from './tools/js';
import { registerSecurityTools } from './tools/security';
import { registerCSRFTools } from './tools/csrf';
import { registerBurpTools } from './tools/burp';
import { registerRenderTools, closeBrowser } from './tools/render';
import { registerCaidoTools } from './tools/caido';
import { registerDatabaseTools } from './tools/database';
import { registerTrainingTools } from './tools/training';
import { registerTrainingExtractorTools } from './tools/training_extractor';
import { registerZAPTools } from './tools/zap';
import { initPostgres } from './integrations/postgres';
import { initRedis } from './integrations/redis';

const server = new Server({
  name: 'bugbounty-mcp',
  version: '1.0.0',
});

// Register all tool modules
registerReconTools(server);
registerJsTools(server);
registerSecurityTools(server);
registerCSRFTools(server);
registerBurpTools(server);
registerRenderTools(server);
registerCaidoTools(server);
registerDatabaseTools(server);
registerTrainingTools(server);
registerTrainingExtractorTools(server);
registerZAPTools(server);

// Initialize connections
async function initialize() {
  try {
    // Initialize PostgreSQL (non-blocking)
    try {
      initPostgres();
      console.error('PostgreSQL connection initialized');
    } catch (error) {
      console.error('PostgreSQL initialization failed:', error);
    }

    // Initialize Redis (non-blocking, optional)
    try {
      const redisInit = initRedis();
      if (redisInit) {
        console.error('✓ Redis connection initialized');
      } else {
        console.error('ℹ Redis not available (optional - server will work without it)');
      }
    } catch (error) {
      console.error('ℹ Redis not available (optional - server will work without it)');
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Start server
server.on('start', () => {
  console.error('🚀 Bug Bounty MCP Server started!');
  console.error('Available tool categories:');
  console.error('  - recon.* : Reconnaissance tools (subfinder, httpx, amass, dns)');
  console.error('  - js.* : JavaScript analysis (download, beautify, endpoints, secrets)');
  console.error('  - security.* : Security testing (XSS, SQLi, IDOR, CSP, auth bypass)');
  console.error('  - burp.* : Burp Suite integration (search, send_raw, get_traffic)');
  console.error('  - caido.* : Caido integration (query, search, analyze_auth)');
  console.error('  - render.* : Rendering tools (screenshot, extract_dom, extract_forms)');
  console.error('  - db.* : Database operations (save_finding, get_findings, init)');
  console.error('  - training.* : Training data (import, match, stats, extract_from_writeup)');
  console.error('  - security.test_csrf : Advanced CSRF testing with PoC generation');
  console.error('  - zap.* : ZAP integration (spider, active_scan, alerts, proxy_process)');
  console.error('\nServer ready for MCP connections!');
});

// Error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit immediately - let the server try to handle it
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.error('\nShutting down...');
  await closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('\nShutting down...');
  await closeBrowser();
  process.exit(0);
});

// Start
(async () => {
  await initialize();
  await server.start();
})();

