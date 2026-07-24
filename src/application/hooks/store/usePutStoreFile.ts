import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeApi } from "@/infrastructure/api/store/storeApi";

/**
 * Create or overwrite a store file. Invalidates the `["store-files"]` family
 * so list views refetch.
 */
export function usePutStoreFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      storeApi.putFile(path, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["store-files"] });
      queryClient.invalidateQueries({ queryKey: ["store-file", variables.path] });
    },
  });
}
