import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ragApi } from "@/infrastructure/api/rag/ragApi";

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ objectName, workingDir }: { objectName: string; workingDir?: string }) =>
      ragApi.deleteFile(objectName, workingDir),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rag", "files"] });
    },
  });
}
