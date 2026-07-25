import { useQuery } from "@tanstack/react-query";
import { mcpRegistryApi } from "@/infrastructure/api/mcpServer/mcpRegistryApi";

/**
 * List all registered MCP servers. Cached under the `["mcp-registry"]` key;
 * mutations (create/update/delete) invalidate it.
 */
export function useMcpRegistry() {
  return useQuery({
    queryKey: ["mcp-registry"],
    queryFn: () => mcpRegistryApi.list(),
  });
}
