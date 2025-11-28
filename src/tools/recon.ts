import { Server } from '../mcp/server';
import { runCommand, checkCommandExists } from '../utils/exec';
import { formatToolResult } from '../types';
import { ReconResult, ToolResult } from '../types';
import { saveTestResult } from '../integrations/postgres';
import { setWorkingMemory } from '../integrations/redis';
import * as fs from 'fs-extra';
import * as path from 'path';

export function registerReconTools(server: Server) {
  // Subfinder tool
  server.tool(
    'recon.subfinder',
    {
      description: 'Run subfinder to discover subdomains for a domain',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Target domain' },
          silent: { type: 'boolean', description: 'Silent mode', default: true },
        },
        required: ['domain'],
      },
    },
    async ({ domain, silent = true }: any): Promise<ToolResult> => {
      try {
        const exists = await checkCommandExists('subfinder');
        if (!exists) {
          return formatToolResult(
            false,
            null,
            'subfinder not found. Install from: https://github.com/projectdiscovery/subfinder'
          );
        }

        const args = ['-d', domain];
        if (silent) args.push('-silent');

        const result = await runCommand('subfinder', args);
        const subdomains = result.stdout
          .split('\n')
          .filter((s) => s.trim().length > 0);

        await saveTestResult(domain, 'subfinder', true, { subdomains });
        await setWorkingMemory(`recon:${domain}:subdomains`, subdomains, 3600);

        return formatToolResult(true, {
          subdomains,
          count: subdomains.length,
          raw: result.stdout,
        });
      } catch (error: any) {
        await saveTestResult(domain, 'subfinder', false, null, error.message);
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // HTTPx tool - check live hosts
  server.tool(
    'recon.httpx',
    {
      description: 'Run httpx to check which hosts are live and get status codes',
      inputSchema: {
        type: 'object',
        properties: {
          input: {
            type: 'string',
            description: 'Input file path or comma-separated URLs',
          },
          statusCode: { type: 'boolean', description: 'Show status codes', default: true },
          title: { type: 'boolean', description: 'Extract page titles', default: false },
        },
        required: ['input'],
      },
    },
    async ({ input, statusCode = true, title = false }: any): Promise<ToolResult> => {
      try {
        const exists = await checkCommandExists('httpx');
        if (!exists) {
          return formatToolResult(
            false,
            null,
            'httpx not found. Install from: https://github.com/projectdiscovery/httpx'
          );
        }

        const args = ['-silent'];
        if (statusCode) args.push('-status-code');
        if (title) args.push('-title');

        // Check if input is a file or URLs
        if (input.includes(',') || input.startsWith('http')) {
          args.push('-u', input);
        } else {
          args.push('-l', input);
        }

        const result = await runCommand('httpx', args);
        const liveHosts = result.stdout
          .split('\n')
          .filter((s) => s.trim().length > 0);

        await setWorkingMemory('recon:live_hosts', liveHosts, 3600);

        return formatToolResult(true, {
          liveHosts,
          count: liveHosts.length,
          raw: result.stdout,
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Amass tool
  server.tool(
    'recon.amass',
    {
      description: 'Run amass for passive/active subdomain enumeration',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Target domain' },
          passive: { type: 'boolean', description: 'Passive mode only', default: true },
        },
        required: ['domain'],
      },
    },
    async ({ domain, passive = true }: any): Promise<ToolResult> => {
      try {
        const exists = await checkCommandExists('amass');
        if (!exists) {
          return formatToolResult(
            false,
            null,
            'amass not found. Install from: https://github.com/owasp-amass/amass'
          );
        }

        const args = ['enum', '-d', domain];
        if (passive) args.push('-passive');

        const result = await runCommand('amass', args, 120000);
        const subdomains = result.stdout
          .split('\n')
          .filter((s) => s.trim().length > 0 && s.includes('.'));

        await saveTestResult(domain, 'amass', true, { subdomains });
        await setWorkingMemory(`recon:${domain}:amass`, subdomains, 3600);

        return formatToolResult(true, {
          subdomains,
          count: subdomains.length,
          raw: result.stdout,
        });
      } catch (error: any) {
        await saveTestResult(domain, 'amass', false, null, error.message);
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // DNS resolution tool
  server.tool(
    'recon.dns',
    {
      description: 'Resolve DNS records for a domain or subdomain',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain to resolve' },
          recordType: {
            type: 'string',
            description: 'DNS record type (A, AAAA, CNAME, MX, TXT)',
            default: 'A',
          },
        },
        required: ['domain'],
      },
    },
    async ({ domain, recordType = 'A' }: any): Promise<ToolResult> => {
      try {
        const exists = await checkCommandExists('dig');
        if (!exists) {
          return formatToolResult(false, null, 'dig command not found');
        }

        const result = await runCommand('dig', ['+short', domain, recordType]);
        const records = result.stdout
          .split('\n')
          .filter((s) => s.trim().length > 0);

        return formatToolResult(true, {
          domain,
          recordType,
          records,
          raw: result.stdout,
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Combined recon workflow
  server.tool(
    'recon.full',
    {
      description: 'Run full reconnaissance workflow: subfinder -> httpx -> amass',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Target domain' },
        },
        required: ['domain'],
      },
    },
    async ({ domain }: any): Promise<ToolResult> => {
      try {
        const results: ReconResult = {
          subdomains: [] as string[],
          liveHosts: [] as string[],
        };

        // Run subfinder
        const subfinderExists = await checkCommandExists('subfinder');
        if (subfinderExists) {
          const subfinderResult = await runCommand('subfinder', ['-d', domain, '-silent']);
          const subdomains = subfinderResult.stdout
            .split('\n')
            .filter((s) => s.trim().length > 0);
          results.subdomains = subdomains;
        }

        // Run amass
        const amassExists = await checkCommandExists('amass');
        if (amassExists) {
          const amassResult = await runCommand('amass', ['enum', '-d', domain, '-passive'], 120000);
          const amassSubs = amassResult.stdout
            .split('\n')
            .filter((s) => s.trim().length > 0 && s.includes('.'));
          results.subdomains = [...new Set([...(results.subdomains || []), ...amassSubs])];
        }

        // Check live hosts
        if (results.subdomains && results.subdomains.length > 0) {
          const httpxExists = await checkCommandExists('httpx');
          if (httpxExists) {
            const inputFile = path.join('/tmp', `subdomains_${Date.now()}.txt`);
            await fs.writeFile(inputFile, results.subdomains.join('\n'));
            
            const httpxResult = await runCommand('httpx', ['-l', inputFile, '-silent', '-status-code']);
            results.liveHosts = httpxResult.stdout
              .split('\n')
              .filter((s) => s.trim().length > 0);
            
            await fs.remove(inputFile);
          }
        }

        await setWorkingMemory(`recon:${domain}:full`, results, 7200);

        return formatToolResult(true, {
          ...results,
          summary: {
            totalSubdomains: results.subdomains?.length || 0,
            liveHosts: results.liveHosts?.length || 0,
          },
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );
}

