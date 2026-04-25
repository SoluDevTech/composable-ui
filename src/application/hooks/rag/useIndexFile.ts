import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ragIndexApi } from "@/infrastructure/api/rag/ragIndexApi";

export function useIndexFile() {
  return useMutation({
    mutationFn: (request: { fileName: string; workingDir: string }) =>
      ragIndexApi.indexFile({
        file_name: request.fileName,
        working_dir: request.workingDir,
      }),
    onSuccess: () => {
      toast.success("File indexing started in background");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start file indexing");
    },
  });
}