import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeApi } from "@/infrastructure/api/store/storeApi";

/**
 * Delete a store file. Invalidates the `["store-files"]` family so list
 * views refetch.
 */
export function useDeleteStoreFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (path: string) => storeApi.deleteFile(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-files"] });
    },
  });
}
