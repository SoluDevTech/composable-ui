import { useQuery } from "@tanstack/react-query";
import { storeApi } from "@/infrastructure/api/store/storeApi";

/**
 * Fetch files with a truncated content preview in a single request.
 * Eliminates N+1 fetches when displaying memory cards or skill frontmatter.
 */
export function useStoreFilePreviews(prefix: string, chars: number = 300) {
  return useQuery({
    queryKey: ["store-file-previews", prefix, chars],
    queryFn: () => storeApi.listFilePreviews(prefix, chars),
  });
}
