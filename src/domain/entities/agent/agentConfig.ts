import type { McpServerConfig } from "./mcpServerConfig";

export enum MiddlewareType {
  TODO_LIST = "todo_list",
  FILESYSTEM = "filesystem",
  SUB_AGENT = "sub_agent",
}

export enum BackendType {
  STATE = "state",
  STORE = "store",
  FILESYSTEM = "filesystem",
  COMPOSITE = "composite",
}

export interface BackendConfig {
  type: BackendType;
  root_dir?: string;
}

export interface InterruptRule {
  before?: boolean;
  after?: boolean;
}

export interface HITLConfig {
  rules: Record<string, boolean | InterruptRule>;
}

export interface SubAgentConfig {
  name: string;
  description: string;
  instructions?: string;
  model?: string;
  tools: string[];
  skills: string[];
  mcp_servers: McpServerConfig[];
  response_format?: Record<string, unknown>;
}

export interface AgentConfig {
  name: string;
  model: string;
  system_prompt?: string;
  system_prompt_file?: string;
  tools: string[];
  middleware: MiddlewareType[];
  backend: BackendConfig;
  hitl: HITLConfig;
  memory: string[];
  skills: string[];
  subagents: SubAgentConfig[];
  mcp_servers: McpServerConfig[];
  response_format?: Record<string, unknown>;
  debug: boolean;
}
