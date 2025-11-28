/**
 * Caido Helper Functions
 * Utility functions to assist with common Caido operations
 */

import { queryCaido } from '../integrations/caido';

export interface EndpointInfo {
  path: string;
  method: string;
  statusCode?: number;
  host: string;
  count: number;
}

export interface AuthFlowInfo {
  endpoint: string;
  method: string;
  patterns: string[];
}

/**
 * Extract unique endpoints from Caido requests
 */
export async function extractEndpoints(
  requests: any[],
  groupByMethod: boolean = true
): Promise<Map<string, EndpointInfo[]>> {
  const endpoints = new Map<string, EndpointInfo[]>();

  requests.forEach((req: any) => {
    if (!req.path) return;

    const key = groupByMethod ? `${req.method}:${req.path}` : req.path;
    const host = req.host || 'unknown';
    const statusCode = req.response?.statusCode;

    if (!endpoints.has(key)) {
      endpoints.set(key, []);
    }

    const existing = endpoints.get(key)!;
    const existingEndpoint = existing.find(
      (e) => e.method === req.method && e.path === req.path && e.host === host
    );

    if (existingEndpoint) {
      existingEndpoint.count++;
      if (statusCode && !existingEndpoint.statusCode) {
        existingEndpoint.statusCode = statusCode;
      }
    } else {
      existing.push({
        path: req.path,
        method: req.method,
        statusCode,
        host,
        count: 1,
      });
    }
  });

  return endpoints;
}

/**
 * Find authentication-related endpoints
 */
export async function findAuthEndpoints(host?: string): Promise<AuthFlowInfo[]> {
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
    'logout',
    'verify',
    '2fa',
    'mfa',
  ];

  const results: AuthFlowInfo[] = [];

  for (const pattern of authPatterns) {
    let httpql = `req.path.cont:"${pattern}" OR req.body.cont:"${pattern}" OR req.headers.cont:"${pattern}"`;
    if (host) {
      httpql = `req.host.cont:"${host}" AND (${httpql})`;
    }

    const result = await queryCaido(httpql, 50);
    if (result.success && result.data?.requests) {
      const requests = result.data.requests;
      if (requests.length > 0) {
        const uniqueEndpoints = new Set<string>();
        requests.forEach((req: any) => {
          if (req.path) {
            uniqueEndpoints.add(`${req.method} ${req.path}`);
          }
        });

        uniqueEndpoints.forEach((endpoint) => {
          const [method, path] = endpoint.split(' ', 2);
          results.push({
            endpoint: path,
            method,
            patterns: [pattern],
          });
        });
      }
    }
  }

  return results;
}

/**
 * Find API endpoints (common patterns)
 */
export async function findApiEndpoints(host?: string): Promise<EndpointInfo[]> {
  const apiPatterns = [
    '/api/',
    '/v1/',
    '/v2/',
    '/v3/',
    '/graphql',
    '/rest/',
    '/rpc/',
    '/jsonrpc',
  ];

  const allEndpoints: EndpointInfo[] = [];

  for (const pattern of apiPatterns) {
    let httpql = `req.path.cont:"${pattern}"`;
    if (host) {
      httpql = `req.host.cont:"${host}" AND ${httpql}`;
    }

    const result = await queryCaido(httpql, 100);
    if (result.success && result.data?.requests) {
      const requests = result.data.requests;
      const endpoints = await extractEndpoints(requests);
      
      endpoints.forEach((endpointList) => {
        endpointList.forEach((endpoint) => {
          if (!allEndpoints.find(e => e.path === endpoint.path && e.method === endpoint.method)) {
            allEndpoints.push(endpoint);
          }
        });
      });
    }
  }

  return allEndpoints;
}

/**
 * Find sensitive data patterns
 */
export async function findSensitiveData(host?: string): Promise<any[]> {
  const sensitivePatterns = [
    'password',
    'secret',
    'key',
    'token',
    'api_key',
    'apikey',
    'authorization',
    'bearer',
    'credential',
    'private',
    'access_token',
    'refresh_token',
  ];

  const findings: any[] = [];

  for (const pattern of sensitivePatterns) {
    let httpql = `req.body.cont:"${pattern}" OR req.headers.cont:"${pattern}" OR req.path.cont:"${pattern}"`;
    if (host) {
      httpql = `req.host.cont:"${host}" AND (${httpql})`;
    }

    const result = await queryCaido(httpql, 50);
    if (result.success && result.data?.requests) {
      const requests = result.data.requests;
      requests.forEach((req: any) => {
        findings.push({
          pattern,
          method: req.method,
          path: req.path,
          host: req.host,
          hasInBody: JSON.stringify(req).includes(pattern),
          hasInHeaders: JSON.stringify(req).includes(pattern),
        });
      });
    }
  }

  return findings;
}

/**
 * Analyze request methods distribution
 */
export function analyzeMethods(requests: any[]): Record<string, number> {
  const methods: Record<string, number> = {};

  requests.forEach((req: any) => {
    const method = req.method || 'UNKNOWN';
    methods[method] = (methods[method] || 0) + 1;
  });

  return methods;
}

/**
 * Analyze status codes distribution
 */
export function analyzeStatusCodes(requests: any[]): Record<number, number> {
  const statusCodes: Record<number, number> = {};

  requests.forEach((req: any) => {
    const status = req.response?.statusCode;
    if (status) {
      statusCodes[status] = (statusCodes[status] || 0) + 1;
    }
  });

  return statusCodes;
}

/**
 * Find endpoints by status code
 */
export async function findEndpointsByStatus(
  statusCode: number,
  host?: string
): Promise<EndpointInfo[]> {
  // Note: This requires querying all requests and filtering
  // Caido's HTTPQL might not support direct status code filtering
  let httpql = host ? `req.host.cont:"${host}"` : '';
  const result = await queryCaido(httpql || '*', 1000);
  
  if (!result.success || !result.data?.requests) {
    return [];
  }

  const filtered = result.data.requests.filter(
    (req: any) => req.response?.statusCode === statusCode
  );

  const endpoints = await extractEndpoints(filtered);
  const allEndpoints: EndpointInfo[] = [];
  endpoints.forEach((endpointList) => {
    allEndpoints.push(...endpointList);
  });

  return allEndpoints;
}

/**
 * Group requests by host
 */
export function groupByHost(requests: any[]): Map<string, any[]> {
  const grouped = new Map<string, any[]>();

  requests.forEach((req: any) => {
    const host = req.host || 'unknown';
    if (!grouped.has(host)) {
      grouped.set(host, []);
    }
    grouped.get(host)!.push(req);
  });

  return grouped;
}

/**
 * Find duplicate endpoints (same path, different methods)
 */
export function findDuplicatePaths(requests: any[]): Map<string, string[]> {
  const pathMethods = new Map<string, Set<string>>();

  requests.forEach((req: any) => {
    if (!req.path) return;
    if (!pathMethods.has(req.path)) {
      pathMethods.set(req.path, new Set());
    }
    pathMethods.get(req.path)!.add(req.method);
  });

  const duplicates = new Map<string, string[]>();
  pathMethods.forEach((methods, path) => {
    if (methods.size > 1) {
      duplicates.set(path, Array.from(methods));
    }
  });

  return duplicates;
}







