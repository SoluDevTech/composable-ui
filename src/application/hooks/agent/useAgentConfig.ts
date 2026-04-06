import { useQuery } from "@tanstack/react-query";
import { agentApi } from "@/infrastructure/api/agent/agentApi";

export function useAgentConfig(name: string | null) {
  return useQuery({
    queryKey: ["agent", name],
    queryFn: () => {
      if (!name) throw new Error("name is required");
      return agentApi.getAgent(name);
    },
    enabled: !!name,
  });
}
