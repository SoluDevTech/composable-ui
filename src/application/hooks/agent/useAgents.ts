import { useQuery } from "@tanstack/react-query";
import { agentApi } from "@/infrastructure/api/agent/agentApi";

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => agentApi.listAgents(),
  });
}
