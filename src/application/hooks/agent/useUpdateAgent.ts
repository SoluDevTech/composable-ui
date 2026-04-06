import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agentApi } from "@/infrastructure/api/agent/agentApi";

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, yamlFile }: { name: string; yamlFile: File }) =>
      agentApi.updateAgent(name, yamlFile),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", variables.name] });
    },
  });
}
