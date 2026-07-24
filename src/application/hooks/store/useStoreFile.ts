import { useQuery } from "@tanstack/react-query";
import { storeApi } from "@/infrastructure/api/store/storeApi";

/**
 * Fetch a single store file by path. Disabled when `path` is null/empty.
 * Cached under `["store-file", path]`.
 */
export function useStoreFile(path: string | null) {
  return useQuery({
    queryKey: ["store-file", path],
    queryFn: () => {
      if (!path) throw new Error("path is required");
      return storeApi.getFile(path);
    },
    enabled: !!path,
  });
}
