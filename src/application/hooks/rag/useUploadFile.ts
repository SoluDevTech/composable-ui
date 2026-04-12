import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ragApi } from "@/infrastructure/api/rag/ragApi";

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ prefix, file }: { prefix: string; file: File }) =>
      ragApi.uploadFile(prefix, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rag", "files"] });
      queryClient.invalidateQueries({ queryKey: ["rag", "folders"] });
    },
  });
}
