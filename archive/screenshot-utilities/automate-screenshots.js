#!/usr/bin/env node

/**
 * Automated Screenshot Generation Agent
 * 
 * This script automates the entire process:
 * 1. Checks if ZAP is running
 * 2. Starts ZAP if needed (via Docker)
 * 3. Waits for ZAP to be ready
 * 4. Runs the screenshot generator
 * 5. Processes and formats outputs
 */

const { exec, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const util = require('util');

const execPromise = util.promisify(exec);

const ZAP_URL = process.env.ZAP_URL || 'http://localhost:8081';
const ZAP_PORT = 8081;
const TARGET_URL = process.argv[2] || 'https://httpbin.org';
const OUTPUT_DIR = path.join(__dirname, 'blog-screenshots-output');

// Colors (simple version without chalk)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'bright');
  console.log('='.repeat(80) + '\n');
}

class ScreenshotAgent {
  constructor() {
    this.zapContainerId = null;
    this.zapStarted = false;
  }

  /**
   * Check if ZAP is already running
   */
  async checkZAPRunning() {
    try {
      const response = await axios.get(`${ZAP_URL}/JSON/core/view/version/`, {
        timeout: 3000,
      });
      if (response.data && response.data.version) {
        log(`✓ ZAP is already running (version: ${response.data.version})`, 'green');
        return true;
      }
    } catch (error) {
      // ZAP is not running
      return false;
    }
    return false;
  }

  /**
   * Check if ZAP Docker container exists
   */
  async findZAPContainer() {
    try {
      const { stdout } = await execPromise(
        "docker ps -a --filter 'ancestor=zaproxy/zap-stable' --format '{{.ID}}'"
      );
      const containerId = stdout.trim();
      if (containerId) {
        // Check if it's running
        const { stdout: running } = await execPromise(
          `docker ps --filter 'id=${containerId}' --format '{{.ID}}'`
        );
        if (running.trim()) {
          this.zapContainerId = containerId;
          return 'running';
        } else {
          this.zapContainerId = containerId;
          return 'stopped';
        }
      }
    } catch (error) {
      // No container found or docker not available
    }
    return 'not_found';
  }

  /**
   * Start ZAP Docker container
   */
  async startZAP() {
    logSection('Starting ZAP');

    // Check if container exists
    const containerStatus = await this.findZAPContainer();

    if (containerStatus === 'running') {
      log('✓ ZAP container is already running', 'green');
      this.zapStarted = true;
      return true;
    }

    if (containerStatus === 'stopped') {
      log('Found stopped ZAP container, starting it...', 'yellow');
      try {
        await execPromise(`docker start ${this.zapContainerId}`);
        log('✓ ZAP container started', 'green');
        this.zapStarted = true;
        await this.waitForZAP();
        return true;
      } catch (error) {
        log(`✗ Failed to start container: ${error.message}`, 'red');
        return false;
      }
    }

    // Create new container
    log('Creating new ZAP Docker container...', 'blue');
    try {
      const dockerCmd = `docker run -d -p ${ZAP_PORT}:8080 -p 8090:8090 --name zap-blog-screenshots zaproxy/zap-stable zap.sh -daemon -host 0.0.0.0 -port 8080 -config api.disablekey=true`;
      
      log(`Running: ${dockerCmd}`, 'cyan');
      const { stdout } = await execPromise(dockerCmd);
      this.zapContainerId = stdout.trim();
      log(`✓ ZAP container created: ${this.zapContainerId}`, 'green');
      this.zapStarted = true;

      // Wait for ZAP to be ready
      await this.waitForZAP();
      return true;
    } catch (error) {
      log(`✗ Failed to start ZAP: ${error.message}`, 'red');
      log('\nTroubleshooting:', 'yellow');
      log('  1. Make sure Docker is running', 'yellow');
      log('  2. Check if port 8081 is available', 'yellow');
      log('  3. Try: docker ps -a', 'yellow');
      return false;
    }
  }

  /**
   * Wait for ZAP to be ready
   */
  async waitForZAP(maxAttempts = 30) {
    log('Waiting for ZAP to be ready...', 'blue');
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(`${ZAP_URL}/JSON/core/view/version/`, {
          timeout: 2000,
        });
        if (response.data && response.data.version) {
          log(`✓ ZAP is ready! (version: ${response.data.version})`, 'green');
          return true;
        }
      } catch (error) {
        // Not ready yet
        process.stdout.write('.');
        await this.sleep(2000);
      }
    }

    log('\n✗ ZAP did not become ready in time', 'red');
    return false;
  }

  /**
   * Run the screenshot generator
   */
  async runScreenshotGenerator() {
    logSection('Running Screenshot Generator');

    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'generate-blog-screenshots.js');
      const child = spawn('node', [scriptPath, TARGET_URL], {
        stdio: 'inherit',
        env: { ...process.env, ZAP_URL },
      });

      child.on('close', (code) => {
        if (code === 0) {
          log('\n✓ Screenshot generator completed successfully!', 'green');
          resolve(true);
        } else {
          log(`\n✗ Screenshot generator exited with code ${code}`, 'red');
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        log(`\n✗ Failed to run screenshot generator: ${error.message}`, 'red');
        reject(error);
      });
    });
  }

  /**
   * Process and format outputs for blog
   */
  async processOutputs() {
    logSection('Processing Outputs');

    try {
      const files = await fs.readdir(OUTPUT_DIR);
      log(`Found ${files.length} output files`, 'blue');

      // Create summary
      const summary = {
        generated: new Date().toISOString(),
        target: TARGET_URL,
        zapUrl: ZAP_URL,
        files: files,
      };

      const summaryPath = path.join(OUTPUT_DIR, 'summary.json');
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
      log(`✓ Summary saved: ${summaryPath}`, 'green');

      // List key files
      log('\nKey output files:', 'cyan');
      const keyFiles = [
        '1-zap-health-check.txt',
        '5-zap-alerts.json',
        '6-enhanced-findings.json',
        '7-before-after-comparison.txt',
      ];

      for (const file of keyFiles) {
        const filePath = path.join(OUTPUT_DIR, file);
        try {
          const stats = await fs.stat(filePath);
          log(`  ✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`, 'green');
        } catch (error) {
          log(`  ✗ ${file} (not found)`, 'yellow');
        }
      }

      return true;
    } catch (error) {
      log(`✗ Error processing outputs: ${error.message}`, 'red');
      return false;
    }
  }

  /**
   * Create a markdown summary for the blog
   */
  async createBlogSummary() {
    logSection('Creating Blog Summary');

    try {
      const enhancedFindingsPath = path.join(OUTPUT_DIR, '6-enhanced-findings.json');
      const beforeAfterPath = path.join(OUTPUT_DIR, '7-before-after-comparison.txt');
      const zapAlertsPath = path.join(OUTPUT_DIR, '5-zap-alerts.json');

      let summary = `# Screenshot Generation Summary\n\n`;
      summary += `**Generated:** ${new Date().toISOString()}\n`;
      summary += `**Target:** ${TARGET_URL}\n`;
      summary += `**ZAP URL:** ${ZAP_URL}\n\n`;

      // Enhanced findings
      try {
        const enhancedData = JSON.parse(await fs.readFile(enhancedFindingsPath, 'utf8'));
        summary += `## Enhanced Findings\n\n`;
        summary += `Total findings: ${enhancedData.length}\n\n`;
        summary += `| Type | Severity | Correlation Score | AI Score | Verified |\n`;
        summary += `|------|----------|------------------|----------|----------|\n`;
        
        enhancedData.slice(0, 10).forEach(f => {
          summary += `| ${f.type} | ${f.severity} | ${f.correlationScore?.toFixed(2) || 'N/A'} | ${f.aiScore?.toFixed(2) || 'N/A'} | ${f.verified ? '✓' : '✗'} |\n`;
        });
        summary += `\n`;
      } catch (error) {
        summary += `*Enhanced findings data not available*\n\n`;
      }

      // Before/After
      try {
        const beforeAfter = await fs.readFile(beforeAfterPath, 'utf8');
        summary += `## Before/After Comparison\n\n`;
        summary += `\`\`\`\n${beforeAfter}\n\`\`\`\n\n`;
      } catch (error) {
        summary += `*Before/After data not available*\n\n`;
      }

      const summaryPath = path.join(OUTPUT_DIR, 'BLOG_SUMMARY.md');
      await fs.writeFile(summaryPath, summary);
      log(`✓ Blog summary created: ${summaryPath}`, 'green');

      return true;
    } catch (error) {
      log(`✗ Error creating summary: ${error.message}`, 'red');
      return false;
    }
  }

  /**
   * Cleanup (optional - keeps container for reuse)
   */
  async cleanup(removeContainer = false) {
    if (removeContainer && this.zapContainerId) {
      logSection('Cleaning Up');
      try {
        await execPromise(`docker stop ${this.zapContainerId}`);
        await execPromise(`docker rm ${this.zapContainerId}`);
        log('✓ ZAP container removed', 'green');
      } catch (error) {
        log(`✗ Cleanup error: ${error.message}`, 'yellow');
      }
    } else if (this.zapContainerId) {
      log('\n💡 Tip: ZAP container is still running for reuse', 'cyan');
      log(`   Container ID: ${this.zapContainerId}`, 'cyan');
      log(`   To remove: docker stop ${this.zapContainerId} && docker rm ${this.zapContainerId}`, 'cyan');
    }
  }

  /**
   * Main execution flow
   */
  async run() {
    logSection('Automated Screenshot Generation Agent');
    log(`Target: ${TARGET_URL}`, 'blue');
    log(`ZAP URL: ${ZAP_URL}\n`, 'blue');

    try {
      // Step 1: Check if ZAP is running
      const zapRunning = await this.checkZAPRunning();
      
      if (!zapRunning) {
        // Step 2: Start ZAP
        const zapStarted = await this.startZAP();
        if (!zapStarted) {
          log('\n✗ Failed to start ZAP. Exiting.', 'red');
          process.exit(1);
        }
      }

      // Step 3: Run screenshot generator
      await this.runScreenshotGenerator();

      // Step 4: Process outputs
      await this.processOutputs();

      // Step 5: Create blog summary
      await this.createBlogSummary();

      // Success!
      logSection('All Done!');
      log('✓ Screenshots generated successfully!', 'green');
      log(`\nOutput directory: ${OUTPUT_DIR}`, 'cyan');
      log('\nNext steps:', 'yellow');
      log('  1. Review terminal output above (take screenshots)', 'yellow');
      log('  2. Check files in blog-screenshots-output/', 'yellow');
      log('  3. Review BLOG_SUMMARY.md', 'yellow');
      log('  4. Use screenshots in your blog post\n', 'yellow');

      // Cleanup (optional)
      await this.cleanup(false); // Set to true to remove container

    } catch (error) {
      log(`\n✗ Error: ${error.message}`, 'red');
      if (error.stack) {
        log(error.stack, 'red');
      }
      process.exit(1);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the agent
if (require.main === module) {
  const agent = new ScreenshotAgent();
  agent.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ScreenshotAgent;

