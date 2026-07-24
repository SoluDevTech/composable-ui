import { useQuery } from "@tanstack/react-query";
import { storeApi } from "@/infrastructure/api/store/storeApi";

/**
 * List store files under a path prefix. Cached under
 * `["store-files", prefix]`; mutations (put/delete) invalidate the family.
 */
export function useStoreFiles(prefix: string) {
  return useQuery({
    queryKey: ["store-files", prefix],
    queryFn: () => storeApi.listFiles(prefix),
  });
}
