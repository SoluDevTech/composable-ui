import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mcpRegistryApi } from "@/infrastructure/api/mcpServer/mcpRegistryApi";
import type { McpServerInput } from "@/domain/entities/mcpServer/registeredMcpServer";

/**
 * Update an existing MCP server. Invalidates the `["mcp-registry"]` query on
 * success so list views refetch.
 */
export function useUpdateMcpServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, input }: { name: string; input: McpServerInput }) =>
      mcpRegistryApi.update(name, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mcp-registry"] });
    },
  });
}
