import { Server } from '../mcp/server';
import { formatToolResult, ToolResult } from '../types';
import { queryCaido, listByHttpql, searchCaido, createPat, revokePat } from '../integrations/caido';
import { setWorkingMemory } from '../integrations/redis';
import {
  extractEndpoints,
  findAuthEndpoints,
  findApiEndpoints,
  findSensitiveData,
  analyzeMethods,
  analyzeStatusCodes,
  findEndpointsByStatus,
  groupByHost,
  findDuplicatePaths,
} from '../helpers/caido-helpers';

export function registerCaidoTools(server: Server) {
  // Query Caido with HTTPQL
  server.tool(
    'caido.query',
    {
      description: 'Query Caido traffic using HTTPQL syntax',
      inputSchema: {
        type: 'object',
        properties: {
          httpql: {
            type: 'string',
            description: 'HTTPQL query string (e.g., req.host.cont:"example.com" AND req.path.cont:"api")',
          },
          limit: { type: 'number', description: 'Maximum number of results', default: 100 },
        },
        required: ['httpql'],
      },
    },
    async ({ httpql, limit = 100 }: any): Promise<ToolResult> => {
      try {
        const result = await queryCaido(httpql, limit);
        
        if (result.success && result.data) {
          await setWorkingMemory(`caido:query:${Date.now()}`, result.data, 3600);
        }

        return formatToolResult(result.success, result.data, result.error);
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // List by HTTPQL (alias for query)
  server.tool(
    'caido.list_by_httpql',
    {
      description: 'List Caido requests matching HTTPQL query',
      inputSchema: {
        type: 'object',
        properties: {
          httpql: {
            type: 'string',
            description: 'HTTPQL query string',
          },
          limit: { type: 'number', description: 'Maximum number of results', default: 100 },
        },
        required: ['httpql'],
      },
    },
    async ({ httpql, limit = 100 }: any): Promise<ToolResult> => {
      try {
        const result = await listByHttpql({ httpql, limit });
        
        if (result.success && result.data) {
          await setWorkingMemory(`caido:list:${Date.now()}`, result.data, 3600);
        }

        return formatToolResult(result.success, result.data, result.error);
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Search Caido traffic
  server.tool(
    'caido.search',
    {
      description: 'Search Caido traffic for a pattern',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Search pattern (will search in body, headers, and path)',
          },
          field: {
            type: 'string',
            description: 'Specific field to search (body, headers, path, host)',
          },
        },
        required: ['pattern'],
      },
    },
    async ({ pattern, field }: any): Promise<ToolResult> => {
      try {
        const result = await searchCaido(pattern, field);
        
        if (result.success && result.data) {
          await setWorkingMemory(`caido:search:${pattern}`, result.data, 3600);
        }

        return formatToolResult(result.success, result.data, result.error);
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Find specific endpoints in Caido
  server.tool(
    'caido.find_endpoints',
    {
      description: 'Find API endpoints in Caido traffic',
      inputSchema: {
        type: 'object',
        properties: {
          host: { type: 'string', description: 'Host to filter by' },
          pathPattern: { type: 'string', description: 'Path pattern to match' },
        },
      },
    },
    async ({ host, pathPattern }: any): Promise<ToolResult> => {
      try {
        let httpql = '';
        if (host && pathPattern) {
          httpql = `req.host.cont:"${host}" AND req.path.cont:"${pathPattern}"`;
        } else if (host) {
          httpql = `req.host.cont:"${host}"`;
        } else if (pathPattern) {
          httpql = `req.path.cont:"${pathPattern}"`;
        } else {
          return formatToolResult(false, null, 'Must provide host or pathPattern');
        }

        const result = await queryCaido(httpql, 500);
        
        if (result.success && result.data) {
          // Extract unique endpoints
          const requests = result.data.requests || [];
          const endpoints = new Set<string>();
          
          requests.forEach((req: any) => {
            if (req.path) {
              endpoints.add(req.path);
            }
          });

          await setWorkingMemory(`caido:endpoints:${host || 'all'}`, Array.from(endpoints), 7200);

          return formatToolResult(true, {
            endpoints: Array.from(endpoints),
            count: endpoints.size,
            totalRequests: requests.length,
          });
        }

        return formatToolResult(result.success, result.data, result.error);
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Analyze authentication flows
  server.tool(
    'caido.analyze_auth',
    {
      description: 'Analyze authentication-related requests in Caido traffic',
      inputSchema: {
        type: 'object',
        properties: {
          host: { type: 'string', description: 'Host to analyze' },
        },
      },
    },
    async ({ host }: any): Promise<ToolResult> => {
      try {
        const authPatterns = [
          'login',
          'auth',
          'token',
          'session',
          'oauth',
          'sso',
          'signin',
          'signup',
          'register',
          'password',
          'reset',
        ];

        const results: any[] = [];

        for (const pattern of authPatterns) {
          let httpql = `req.path.cont:"${pattern}" OR req.body.cont:"${pattern}"`;
          if (host) {
            httpql = `req.host.cont:"${host}" AND (${httpql})`;
          }

          const result = await queryCaido(httpql, 50);
          if (result.success && result.data) {
            const requests = result.data.requests || [];
            if (requests.length > 0) {
              results.push({
                pattern,
                requests: requests.map((req: any) => ({
                  method: req.method,
                  path: req.path,
                  host: req.host,
                })),
                count: requests.length,
              });
            }
          }
        }

        await setWorkingMemory(`caido:auth:${host || 'all'}`, results, 7200);

        return formatToolResult(true, {
          authEndpoints: results,
          summary: {
            totalPatterns: authPatterns.length,
            patternsFound: results.length,
            totalRequests: results.reduce((sum, r) => sum + r.count, 0),
          },
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Agent: Smart endpoint discovery with analysis
  server.tool(
    'caido.agent_discover_endpoints',
    {
      description: 'Intelligent endpoint discovery agent - finds and analyzes all endpoints for a host',
      inputSchema: {
        type: 'object',
        properties: {
          host: { type: 'string', description: 'Host to analyze' },
          includeAnalysis: { type: 'boolean', description: 'Include method/status analysis', default: true },
        },
        required: ['host'],
      },
    },
    async ({ host, includeAnalysis = true }: any): Promise<ToolResult> => {
      try {
        const result = await queryCaido(`req.host.cont:"${host}"`, 1000);
        
        if (!result.success || !result.data?.requests) {
          return formatToolResult(false, null, result.error || 'No requests found');
        }

        const requests = result.data.requests;
        const endpoints = await extractEndpoints(requests, true);
        
        const endpointList: any[] = [];
        endpoints.forEach((endpointListForPath) => {
          endpointList.push(...endpointListForPath);
        });

        const analysis: any = {};
        if (includeAnalysis) {
          analysis.methods = analyzeMethods(requests);
          analysis.statusCodes = analyzeStatusCodes(requests);
          analysis.duplicatePaths = Object.fromEntries(findDuplicatePaths(requests));
          analysis.totalRequests = requests.length;
          analysis.uniqueEndpoints = endpointList.length;
        }

        await setWorkingMemory(`caido:agent:endpoints:${host}`, { endpoints: endpointList, analysis }, 7200);

        return formatToolResult(true, {
          host,
          endpoints: endpointList,
          analysis: includeAnalysis ? analysis : undefined,
          summary: {
            totalRequests: requests.length,
            uniqueEndpoints: endpointList.length,
            hosts: Array.from(new Set(requests.map((r: any) => r.host))),
          },
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Agent: Find API endpoints intelligently
  server.tool(
    'caido.agent_find_apis',
    {
      description: 'Smart agent to find API endpoints using common patterns',
      inputSchema: {
        type: 'object',
        properties: {
          host: { type: 'string', description: 'Host to search' },
        },
      },
    },
    async ({ host }: any): Promise<ToolResult> => {
      try {
        const apiEndpoints = await findApiEndpoints(host);
        
        await setWorkingMemory(`caido:agent:apis:${host || 'all'}`, apiEndpoints, 7200);

        return formatToolResult(true, {
          host: host || 'all',
          apiEndpoints,
          count: apiEndpoints.length,
          summary: {
            byMethod: apiEndpoints.reduce((acc: any, ep) => {
              acc[ep.method] = (acc[ep.method] || 0) + 1;
              return acc;
            }, {}),
          },
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Agent: Security-focused analysis
  server.tool(
    'caido.agent_security_scan',
    {
      description: 'Security-focused agent that scans for auth endpoints, sensitive data, and vulnerabilities',
      inputSchema: {
        type: 'object',
        properties: {
          host: { type: 'string', description: 'Host to scan' },
        },
      },
    },
    async ({ host }: any): Promise<ToolResult> => {
      try {
        const [authEndpoints, sensitiveData, errorEndpoints] = await Promise.all([
          findAuthEndpoints(host),
          findSensitiveData(host),
          findEndpointsByStatus(500, host),
        ]);

        const findings = {
          auth: {
            endpoints: authEndpoints,
            count: authEndpoints.length,
          },
          sensitive: {
            findings: sensitiveData,
            count: sensitiveData.length,
            uniquePatterns: Array.from(new Set(sensitiveData.map((f: any) => f.pattern))),
          },
          errors: {
            endpoints: errorEndpoints,
            count: errorEndpoints.length,
          },
        };

        await setWorkingMemory(`caido:agent:security:${host || 'all'}`, findings, 7200);

        return formatToolResult(true, {
          host: host || 'all',
          ...findings,
          summary: {
            totalFindings: authEndpoints.length + sensitiveData.length + errorEndpoints.length,
            riskLevel: sensitiveData.length > 10 ? 'high' : sensitiveData.length > 5 ? 'medium' : 'low',
          },
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Agent: Analyze request patterns
  server.tool(
    'caido.agent_analyze_patterns',
    {
      description: 'Analyze request patterns, methods, status codes, and host distribution',
      inputSchema: {
        type: 'object',
        properties: {
          host: { type: 'string', description: 'Host to analyze (optional)' },
          limit: { type: 'number', description: 'Max requests to analyze', default: 1000 },
        },
      },
    },
    async ({ host, limit = 1000 }: any): Promise<ToolResult> => {
      try {
        const httpql = host ? `req.host.cont:"${host}"` : '';
        const result = await queryCaido(httpql || '*', limit);
        
        if (!result.success || !result.data?.requests) {
          return formatToolResult(false, null, result.error || 'No requests found');
        }

        const requests = result.data.requests;
        const methods = analyzeMethods(requests);
        const statusCodes = analyzeStatusCodes(requests);
        const hosts = groupByHost(requests);
        const duplicates = findDuplicatePaths(requests);

        const analysis = {
          methods,
          statusCodes,
          hosts: Object.fromEntries(
            Array.from(hosts.entries()).map(([h, reqs]) => [h, reqs.length])
          ),
          duplicatePaths: Object.fromEntries(duplicates),
          totalRequests: requests.length,
          uniqueHosts: hosts.size,
        };

        await setWorkingMemory(`caido:agent:patterns:${host || 'all'}`, analysis, 7200);

        return formatToolResult(true, analysis);
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Agent: Find endpoints by status code
  server.tool(
    'caido.agent_find_by_status',
    {
      description: 'Find endpoints that return specific HTTP status codes',
      inputSchema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', description: 'HTTP status code to find (e.g., 200, 404, 500)' },
          host: { type: 'string', description: 'Host to filter by' },
        },
        required: ['statusCode'],
      },
    },
    async ({ statusCode, host }: any): Promise<ToolResult> => {
      try {
        const endpoints = await findEndpointsByStatus(statusCode, host);
        
        await setWorkingMemory(`caido:agent:status:${statusCode}:${host || 'all'}`, endpoints, 7200);

        return formatToolResult(true, {
          statusCode,
          host: host || 'all',
          endpoints,
          count: endpoints.length,
          summary: {
            byMethod: endpoints.reduce((acc: any, ep) => {
              acc[ep.method] = (acc[ep.method] || 0) + 1;
              return acc;
            }, {}),
          },
        });
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Create Personal Access Token (PAT) for cloud API
  server.tool(
    'caido.create_pat',
    {
      description: 'Create a Personal Access Token (PAT) for Caido Cloud API. Requires CAIDO_SESSION cookie from logged-in session at https://app.caido.io',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name for the PAT (e.g., "MCP Server Token")',
          },
          teamId: {
            type: 'string',
            description: 'Optional: Team ID to associate the PAT with',
          },
          expiresAt: {
            type: 'string',
            description: 'Optional: Expiration date in RFC3339 format (e.g., "2025-12-31T23:59:59Z")',
          },
        },
        required: ['name'],
      },
    },
    async ({ name, teamId, expiresAt }: any): Promise<ToolResult> => {
      try {
        const result = await createPat(name, teamId, expiresAt);
        return formatToolResult(result.success, result.data, result.error);
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );

  // Revoke Personal Access Token (PAT)
  server.tool(
    'caido.revoke_pat',
    {
      description: 'Revoke a Personal Access Token (PAT). Requires CAIDO_SESSION cookie from logged-in session at https://app.caido.io',
      inputSchema: {
        type: 'object',
        properties: {
          patId: {
            type: 'string',
            description: 'ID of the PAT to revoke',
          },
        },
        required: ['patId'],
      },
    },
    async ({ patId }: any): Promise<ToolResult> => {
      try {
        const result = await revokePat(patId);
        return formatToolResult(result.success, result.data, result.error);
      } catch (error: any) {
        return formatToolResult(false, null, error.message);
      }
    }
  );
}

