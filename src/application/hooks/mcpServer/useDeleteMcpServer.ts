import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mcpRegistryApi } from "@/infrastructure/api/mcpServer/mcpRegistryApi";

/**
 * Delete a registered MCP server. Invalidates the `["mcp-registry"]` query
 * on success so list views refetch.
 */
export function useDeleteMcpServer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => mcpRegistryApi.delete(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mcp-registry"] });
    },
  });
}
