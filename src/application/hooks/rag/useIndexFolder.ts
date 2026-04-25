import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ragIndexApi } from "@/infrastructure/api/rag/ragIndexApi";

export function useIndexFolder() {
  return useMutation({
    mutationFn: (request: {
      workingDir: string;
      recursive: boolean;
      fileExtensions?: string[];
    }) =>
      ragIndexApi.indexFolder({
        working_dir: request.workingDir,
        recursive: request.recursive,
        file_extensions: request.fileExtensions,
      }),
    onSuccess: () => {
      toast.success("Folder indexing started in background");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start folder indexing");
    },
  });
}