import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agentApi } from "@/infrastructure/api/agent/agentApi";

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, yamlFile }: { name: string; yamlFile: File }) =>
      agentApi.createAgent(name, yamlFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
