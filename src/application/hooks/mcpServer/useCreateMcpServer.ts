import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mcpRegistryApi } from "@/infrastructure/api/mcpServer/mcpRegistryApi";
import type { McpServerInput } from "@/domain/entities/mcpServer/registeredMcpServer";

/**
 * Register a new MCP server. Invalidates the `["mcp-registry"]` query on
 * success so list views refetch.
 */
export function useCreateMcpServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: McpServerInput) => mcpRegistryApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mcp-registry"] });
    },
  });
}
