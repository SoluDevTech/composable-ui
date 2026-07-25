import { useMutation } from "@tanstack/react-query";
import { mcpRegistryApi } from "@/infrastructure/api/mcpServer/mcpRegistryApi";
import type { McpServerInput } from "@/domain/entities/mcpServer/registeredMcpServer";

/**
 * Validate (test connection) an MCP server config. Returns the tool count on
 * success. Does NOT invalidate the registry — validation is read-only.
 */
export function useValidateMcpServer() {
  return useMutation({
    mutationFn: (input: McpServerInput) => mcpRegistryApi.validate(input),
  });
}
