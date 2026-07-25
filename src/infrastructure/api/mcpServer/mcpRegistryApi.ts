import type {
  RegisteredMcpServer,
  McpServerInput,
  McpServerValidationResult,
} from "@/domain/entities/mcpServer/registeredMcpServer";
import type { McpRegistryPort } from "@/domain/ports/mcpServer/mcpRegistryPort";
import { mcpApiClient } from "@/infrastructure/api/mcpAxiosInstance";

const BASE = "/api/v1/mcp/servers";

/**
 * Axios implementation of {@link McpRegistryPort}. Errors are propagated as
 * `Error` instances by the axios response interceptor in {@link mcpApiClient};
 * this adapter lets them bubble unchanged.
 */
export const mcpRegistryApi: McpRegistryPort = {
  async list(): Promise<RegisteredMcpServer[]> {
    const response = await mcpApiClient.get<RegisteredMcpServer[]>(BASE);
    return response.data;
  },

  async get(name: string): Promise<RegisteredMcpServer> {
    const response = await mcpApiClient.get<RegisteredMcpServer>(
      `${BASE}/${encodeURIComponent(name)}`,
    );
    return response.data;
  },

  async reveal(name: string): Promise<RegisteredMcpServer> {
    const response = await mcpApiClient.get<RegisteredMcpServer>(
      `${BASE}/${encodeURIComponent(name)}/reveal`,
    );
    return response.data;
  },

  async create(input: McpServerInput): Promise<RegisteredMcpServer> {
    const response = await mcpApiClient.post<RegisteredMcpServer>(BASE, input);
    return response.data;
  },

  async update(name: string, input: McpServerInput): Promise<RegisteredMcpServer> {
    const response = await mcpApiClient.put<RegisteredMcpServer>(
      `${BASE}/${encodeURIComponent(name)}`,
      input,
    );
    return response.data;
  },

  async delete(name: string): Promise<void> {
    await mcpApiClient.delete(`${BASE}/${encodeURIComponent(name)}`);
  },

  async validate(input: McpServerInput): Promise<McpServerValidationResult> {
    const response = await mcpApiClient.post<McpServerValidationResult>(`${BASE}/validate`, input);
    return response.data;
  },
};
