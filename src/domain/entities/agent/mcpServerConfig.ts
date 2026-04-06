export enum McpTransportType {
  STDIO = "stdio",
  HTTP = "http",
}

export interface McpServerConfig {
  name: string;
  transport: McpTransportType;
  command?: string;
  args: string[];
  url?: string;
  headers: Record<string, string>;
  env: Record<string, string>;
  auth_token?: string;
}
