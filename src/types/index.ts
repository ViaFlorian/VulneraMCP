export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  code?: number;
}

export interface ReconResult {
  subdomains?: string[];
  liveHosts?: string[];
  ips?: string[];
  error?: string;
}

export interface SecurityTestResult {
  vulnerability?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  payload?: string;
  response?: any;
  error?: string;
}

export interface JSAnalysisResult {
  endpoints?: string[];
  secrets?: string[];
  apiKeys?: string[];
  beautified?: string;
  error?: string;
}

export interface BurpRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface BurpResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface Finding {
  id?: string;
  target: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  payload?: string;
  response?: string;
  timestamp: Date;
  score?: number;
}

export interface CaidoQuery {
  httpql: string;
  limit?: number;
}

export function formatToolResult(
  success: boolean,
  data?: any,
  error?: string,
  code?: number
): ToolResult {
  return { success, data, error, code };
}

