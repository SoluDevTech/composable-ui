import { useQuery } from "@tanstack/react-query";
import { ragApi } from "@/infrastructure/api/rag/ragApi";

export function useFiles(prefix?: string, recursive = false) {
  return useQuery({
    queryKey: ["rag", "files", prefix, recursive],
    queryFn: () => ragApi.listFiles(prefix, recursive),
    enabled: prefix !== undefined,
    staleTime: 30_000,
  });
}
