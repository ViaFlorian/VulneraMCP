import { Server } from '../mcp/server';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { formatToolResult, ToolResult, BurpRequest, BurpResponse } from '../types';
import { setWorkingMemory } from '../integrations/redis';

let burpBridge: Express | null = null;
let burpTraffic: Array<{ request: BurpRequest; response: BurpResponse; timestamp: Date }> = [];

export function registerBurpTools(server: Server) {
  // Search Burp traffic
  server.tool(
    'burp.search',
    {
      description: 'Search Burp bridge traffic for a pattern (regex supported)',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Search pattern (regex)' },
          field: {
            type: 'string',
            description: 'Field to search (url, headers, body, all)',
            default: 'all',
          },
        },
        required: ['pattern'],
      },
    },
    async ({ pattern, field = 'all' }: any): Promise<ToolResult> => {
      try {
        const base = process.env.BURP_API_BASE;
        if (base) {
          // Use external Burp API if configured
          const response = await axios.post(`${base}/search`, { pattern, field });
          return formatToolResult(true, response.data);
        }

        // Search local traffic cache
        const regex = new RegExp(pattern, 'i');
        const matches = burpTraffic.filter((entry) => {
          if (field === 'url') {
            return regex.test(entry.request.url);
          } else if (field === 'headers') {
            const headersStr = JSON.stringify(entry.request.headers || {});
            return regex.test(headersStr);
          } else if (field === 'body') {
            return regex.test(entry.request.body || '') || regex.test(entry.response.body || '');
          } else {
            // Search all
            const allText = JSON.stringify(entry);
            return regex.test(allText);
          }
        });

        return formatToolResult(true, {
          matches: matches.slice(0, 100), // Limit results
          count: matches.length,
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Send raw request through Burp
  server.tool(
    'burp.send_raw',
    {
      description: 'Send raw HTTP request through Burp bridge',
      inputSchema: {
        type: 'object',
        properties: {
          method: { type: 'string', description: 'HTTP method' },
          url: { type: 'string', description: 'Target URL' },
          headers: { type: 'object', description: 'HTTP headers' },
          body: { type: 'string', description: 'Request body' },
        },
        required: ['method', 'url'],
      },
    },
    async ({ method, url, headers = {}, body }: any): Promise<ToolResult> => {
      try {
        const base = process.env.BURP_API_BASE;
        if (base) {
          const response = await axios.post(`${base}/raw`, {
            method,
            url,
            headers,
            body,
          });
          return formatToolResult(true, response.data);
        }

        // Fallback: send directly via axios
        const response = await axios({
          method: method.toLowerCase(),
          url,
          headers,
          data: body,
          validateStatus: () => true,
          timeout: 30000,
        });

        const burpRequest: BurpRequest = { method, url, headers, body };
        const burpResponse: BurpResponse = {
          status: response.status,
          headers: response.headers as Record<string, string>,
          body: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        };

        burpTraffic.push({
          request: burpRequest,
          response: burpResponse,
          timestamp: new Date(),
        });

        // Keep only last 1000 entries
        if (burpTraffic.length > 1000) {
          burpTraffic = burpTraffic.slice(-1000);
        }

        await setWorkingMemory(`burp:request:${Date.now()}`, {
          request: burpRequest,
          response: burpResponse,
        }, 3600);

        return formatToolResult(true, {
          request: burpRequest,
          response: burpResponse,
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Get recent Burp traffic
  server.tool(
    'burp.get_traffic',
    {
      description: 'Get recent Burp traffic entries',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of entries to return', default: 50 },
        },
      },
    },
    async ({ limit = 50 }: any): Promise<ToolResult> => {
      try {
        const recent = burpTraffic.slice(-limit).reverse();
        return formatToolResult(true, {
          entries: recent,
          count: recent.length,
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Start Burp bridge server
  server.tool(
    'burp.start_bridge',
    {
      description: 'Start the Burp bridge HTTP server to receive traffic from Burp extension',
      inputSchema: {
        type: 'object',
        properties: {
          port: { type: 'number', description: 'Port to listen on', default: 9131 },
        },
      },
    },
    async ({ port = 9131 }: any): Promise<ToolResult> => {
      try {
        if (burpBridge) {
          return formatToolResult(true, { message: 'Bridge already running', port });
        }

        burpBridge = express();
        burpBridge.use(bodyParser.json());
        burpBridge.use(bodyParser.urlencoded({ extended: true }));

        // Endpoint to receive traffic from Burp extension
        burpBridge.post('/traffic', (req, res) => {
          const { request, response } = req.body;
          if (request && response) {
            burpTraffic.push({
              request,
              response,
              timestamp: new Date(),
            });
            res.json({ success: true });
          } else {
            res.status(400).json({ error: 'Invalid request/response' });
          }
        });

        // Search endpoint
        burpBridge.post('/search', (req, res) => {
          const { pattern, field = 'all' } = req.body;
          const regex = new RegExp(pattern, 'i');
          const matches = burpTraffic.filter((entry) => {
            if (field === 'url') {
              return regex.test(entry.request.url);
            } else if (field === 'headers') {
              return regex.test(JSON.stringify(entry.request.headers || {}));
            } else if (field === 'body') {
              return regex.test(entry.request.body || '') || regex.test(entry.response.body || '');
            } else {
              return regex.test(JSON.stringify(entry));
            }
          });
          res.json({ matches: matches.slice(0, 100), count: matches.length });
        });

        burpBridge.listen(port, () => {
          console.error(`Burp bridge listening on port ${port}`);
        });

        return formatToolResult(true, {
          message: 'Burp bridge started',
          port,
          endpoints: {
            traffic: `POST http://localhost:${port}/traffic`,
            search: `POST http://localhost:${port}/search`,
          },
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );
}

