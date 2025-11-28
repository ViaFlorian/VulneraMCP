import axios, { AxiosInstance } from 'axios';
import { CaidoQuery } from '../types';

let caidoClient: AxiosInstance | null = null;

export function initCaido(includeAuth: boolean = true, useSessionCookie: boolean = false): AxiosInstance {
  // Determine if using cloud API or local instance
  const server = process.env.CAIDO_MCP_SERVER || 'localhost:8080';
  const isCloudAPI = server.includes('api.caido.io') || (server.includes('caido.io') && !server.includes('localhost'));
  
  // For cloud API, use api.caido.io as base URL directly
  const baseURL = isCloudAPI 
    ? 'https://api.caido.io'
    : `http://${server.replace(/^https?:\/\//, '')}`;

  const headers: any = {
    'Content-Type': 'application/json',
  };

  // Add authentication if token is provided and includeAuth is true
  // According to Caido docs: PATs use "Authorization: Bearer <PAT>" format
  // https://developer.caido.io/reference/authentication.html
  if (includeAuth && process.env.CAIDO_API_TOKEN && !useSessionCookie) {
    const token = process.env.CAIDO_API_TOKEN;
    // All Caido tokens (PATs) use Bearer format
    headers['Authorization'] = `Bearer ${token}`;
  }

  // For PAT creation, use CAIDO_SESSION cookie instead
  if (useSessionCookie && process.env.CAIDO_SESSION) {
    headers['Cookie'] = `CAIDO_SESSION=${process.env.CAIDO_SESSION}`;
  }

  return axios.create({
    baseURL,
    timeout: 30000,
    headers,
  });
}

export async function queryCaido(httpql: string, limit?: number): Promise<any> {
  const server = process.env.CAIDO_MCP_SERVER || 'localhost:8080';
  const isCloudAPI = server.includes('api.caido.io') || (server.includes('caido.io') && !server.includes('localhost'));
  // Cloud API uses /graphql, local uses /graphql
  const graphqlEndpoint = '/graphql';
  
  // Caido's GraphQL schema: requests returns RequestConnection
  // RequestConnection has: nodes (array of Request), count, pageInfo, edges
  const graphqlQuery = {
    query: `
      query QueryRequests($httpql: HTTPQL, $first: Int) {
        requests(
          filter: $httpql
          first: $first
        ) {
          nodes {
            id
            method
            path
            host
            query
            port
            isTls
            createdAt
            source
            response {
              statusCode
            }
          }
          count {
            value
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `,
    variables: {
      httpql: httpql, // HTTPQL is a string type in Caido
      first: limit || 100,
    },
  };

  // For local instances, try without auth first (some local instances allow unauthenticated access)
  // If that fails, try with auth
  if (!isCloudAPI) {
    try {
      const clientNoAuth = initCaido(false);
      const response = await clientNoAuth.post(graphqlEndpoint, graphqlQuery);
      
      if (!response.data.errors) {
        if (response.data && response.data.data && response.data.data.requests) {
          const requestsData = response.data.data.requests;
          return {
            success: true,
            data: {
              requests: requestsData.nodes || [],
              count: requestsData.count?.value || 0,
              hasMore: requestsData.pageInfo?.hasNextPage || false,
            },
          };
        }
        return {
          success: true,
          data: response.data,
        };
      }
    } catch (error: any) {
      // If no-auth fails, continue to try with auth
    }
  }

  // Try with authentication
  try {
    const client = initCaido(true);
    const response = await client.post(graphqlEndpoint, graphqlQuery);
    
    if (response.data.errors) {
      const errors = response.data.errors.map((e: any) => {
        if (e.extensions?.CAIDO?.code === 'AUTHORIZATION') {
          if (isCloudAPI) {
            return 'Authentication required. Get API token from Caido Cloud Settings → API and set CAIDO_API_TOKEN in mcp.json';
          } else {
            return 'Authentication required for local instance. Get API token from your local Caido instance: Open http://localhost:8080 → Settings → API → Generate Token, then set CAIDO_API_TOKEN in mcp.json. Alternatively, you can use the cloud API by setting CAIDO_MCP_SERVER to "api.caido.io" in mcp.json';
          }
        }
        return e.message;
      });
      return {
        success: false,
        error: errors.join('; '),
        data: null,
      };
    }
    
    if (response.data && response.data.data && response.data.data.requests) {
      const requestsData = response.data.data.requests;
      return {
        success: true,
        data: {
          requests: requestsData.nodes || [],
          count: requestsData.count?.value || 0,
          hasMore: requestsData.pageInfo?.hasNextPage || false,
        },
      };
    }
    
    // Fallback: return raw data if structure is different
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Caido query failed',
      data: null,
    };
  }
}

export async function listByHttpql(query: CaidoQuery): Promise<any> {
  return queryCaido(query.httpql, query.limit);
}

export async function searchCaido(pattern: string, field?: string): Promise<any> {
  const httpql = field 
    ? `${field}.cont:"${pattern}"`
    : `req.body.cont:"${pattern}" OR req.headers.cont:"${pattern}" OR req.path.cont:"${pattern}"`;
  
  return queryCaido(httpql);
}

/**
 * Create a Personal Access Token (PAT) for Caido Cloud API
 * Requires CAIDO_SESSION cookie from logged-in session
 */
export async function createPat(name: string, teamId?: string, expiresAt?: string): Promise<any> {
  if (!process.env.CAIDO_SESSION) {
    return {
      success: false,
      error: 'CAIDO_SESSION cookie required. Log in to https://app.caido.io and get the CAIDO_SESSION cookie from browser dev tools.',
      data: null,
    };
  }

  const mutation = {
    query: `
      mutation CreatePat($input: CreatePatInput!) {
        createPat(input: $input) {
          pat {
            id
            token
            name
            createdAt
            expiresAt
          }
        }
      }
    `,
    variables: {
      input: {
        name,
        ...(teamId && { teamId }),
        ...(expiresAt && { expiresAt }),
      },
    },
  };

  try {
    const client = initCaido(false, true); // Use session cookie, not PAT
    // Try /graphql first, fallback to /dashboard/graphql
    let response;
    try {
      response = await client.post('/graphql', mutation);
    } catch (e: any) {
      if (e.response?.status === 404) {
        response = await client.post('/dashboard/graphql', mutation);
      } else {
        throw e;
      }
    }

    if (response.data.errors) {
      return {
        success: false,
        error: response.data.errors.map((e: any) => e.message).join('; '),
        data: null,
      };
    }

    if (response.data.data?.createPat?.pat) {
      return {
        success: true,
        data: response.data.data.createPat.pat,
      };
    }

    return {
      success: false,
      error: 'Unexpected response format',
      data: null,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create PAT',
      data: null,
    };
  }
}

/**
 * Revoke a Personal Access Token (PAT)
 */
export async function revokePat(patId: string): Promise<any> {
  if (!process.env.CAIDO_SESSION) {
    return {
      success: false,
      error: 'CAIDO_SESSION cookie required. Log in to https://app.caido.io and get the CAIDO_SESSION cookie from browser dev tools.',
      data: null,
    };
  }

  const mutation = {
    query: `
      mutation RevokePat($id: ID!) {
        revokePat(id: $id) {
          pat {
            id
          }
        }
      }
    `,
    variables: {
      id: patId,
    },
  };

  try {
    const client = initCaido(false, true); // Use session cookie, not PAT
    // Try /graphql first, fallback to /dashboard/graphql
    let response;
    try {
      response = await client.post('/graphql', mutation);
    } catch (e: any) {
      if (e.response?.status === 404) {
        response = await client.post('/dashboard/graphql', mutation);
      } else {
        throw e;
      }
    }

    if (response.data.errors) {
      return {
        success: false,
        error: response.data.errors.map((e: any) => e.message).join('; '),
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.data?.revokePat?.pat || { id: patId },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to revoke PAT',
      data: null,
    };
  }
}

