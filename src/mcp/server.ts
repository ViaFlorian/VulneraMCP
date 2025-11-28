import * as readline from 'readline';

export interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (params: any) => Promise<any>;
}

export interface ServerOptions {
  name: string;
  version: string;
}

export class Server {
  private name: string;
  private version: string;
  private tools: Map<string, Tool> = new Map();
  private rl: readline.Interface;
  private initialized = false;

  constructor(options: ServerOptions) {
    this.name = options.name;
    this.version = options.version;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
  }

  tool(
    name: string,
    definition: { description: string; inputSchema: any },
    handler: (params: any) => Promise<any>
  ): void {
    this.tools.set(name, {
      name,
      description: definition.description,
      inputSchema: definition.inputSchema,
      handler,
    });
  }

  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  on(event: 'start', callback: () => void): void {
    if (event === 'start') {
      // Call immediately after initialization
      setImmediate(callback);
    }
  }

  async start(): Promise<void> {
    let buffer = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const request = JSON.parse(trimmed);
          const response = await this.handleRequest(request);
          if (response) {
            process.stdout.write(JSON.stringify(response) + '\n');
          }
        } catch (error: any) {
          // Try to extract id from the potentially malformed JSON
          let requestId: string | number | undefined = undefined;
          try {
            const partialMatch = trimmed.match(/"id"\s*:\s*([^,}\]]+)/);
            if (partialMatch) {
              const idValue = partialMatch[1].trim().replace(/['"]/g, '');
              // Skip if it's "null"
              if (idValue.toLowerCase() !== 'null') {
              requestId = isNaN(Number(idValue)) ? idValue : Number(idValue);
              }
            }
          } catch {
            // Ignore if we can't extract id
          }
          
          // Only send error response if we have a valid (non-null) id
          // If id is null or undefined, it's a notification and we shouldn't respond
          if (requestId !== undefined && requestId !== null) {
          const errorResponse: any = {
            jsonrpc: '2.0',
              id: requestId,
            error: {
              code: -32700,
              message: 'Parse error',
              data: error.message,
            },
          };
            process.stdout.write(JSON.stringify(errorResponse) + '\n');
          }
        }
      }
    });

    process.stdin.on('end', () => {
      process.exit(0);
    });
  }

  private async handleRequest(request: any): Promise<any> {
    // If id is null or undefined, this is a notification - don't send a response
    const requestId = request.id;
    if (requestId === null || requestId === undefined) {
      // This is a notification, handle it but don't return a response
      if (!this.initialized && request.method !== 'initialize') {
        // Silently ignore notifications when not initialized
        return null;
      }
      // Handle notification methods (but they shouldn't return responses)
      return null;
    }
    
    if (!this.initialized && request.method !== 'initialize') {
      return {
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32002,
          message: 'Server not initialized',
        },
      };
    }

    switch (request.method) {
      case 'initialize':
        return this.handleInitialize(request);

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id: requestId,
          result: {
            tools: Array.from(this.tools.values()).map((tool) => ({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema,
            })),
          },
        };

      case 'tools/call':
        return this.handleToolCall(request);

      default:
        return {
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32601,
            message: 'Method not found',
          },
        };
    }
  }

  private async handleInitialize(request: any): Promise<any> {
    this.initialized = true;
    const requestId = request.id;
    // Initialize must always have an id, but check just in case
    if (requestId === null || requestId === undefined) {
      return null;
    }
    return {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: this.name,
          version: this.version,
        },
      },
    };
  }

  private async handleToolCall(request: any): Promise<any> {
    const requestId = request.id;
    // If id is null/undefined, this is a notification - don't respond
    if (requestId === null || requestId === undefined) {
      return null;
    }
    
    const { name, arguments: args } = request.params || {};
    const tool = this.tools.get(name);

    if (!tool) {
      return {
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32601,
          message: `Tool not found: ${name}`,
        },
      };
    }

    try {
      const result = await tool.handler(args || {});
      return {
        jsonrpc: '2.0',
        id: requestId,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
      };
    } catch (error: any) {
      return {
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error.message,
        },
      };
    }
  }
}

