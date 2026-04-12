import { useQuery } from "@tanstack/react-query";
import { ragApi } from "@/infrastructure/api/rag/ragApi";

export function useFolders(prefix?: string) {
  return useQuery({
    queryKey: ["rag", "folders", prefix],
    queryFn: () => ragApi.listFolders(prefix),
    enabled: prefix !== undefined,
    staleTime: 30_000,
  });
}
