import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ragApi } from "@/infrastructure/api/rag/ragApi";

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ prefix }: { prefix: string }) => ragApi.createFolder(prefix),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rag", "folders"] });
      queryClient.invalidateQueries({ queryKey: ["rag", "files"] });
    },
  });
}
