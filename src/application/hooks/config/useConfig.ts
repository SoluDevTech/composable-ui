import { useQuery } from "@tanstack/react-query";
import { configRepository } from "@/infrastructure/config/configRepositoryInstance";

export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => configRepository.getConfig(),
    staleTime: Infinity,
  });
}
