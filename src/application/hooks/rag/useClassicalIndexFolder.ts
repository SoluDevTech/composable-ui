import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ragIndexApi } from "@/infrastructure/api/rag/ragIndexApi";

export function useClassicalIndexFolder() {
  return useMutation({
    mutationFn: (request: {
      workingDir: string;
      recursive: boolean;
      fileExtensions?: string[];
      chunkSize: number;
      chunkOverlap: number;
    }) =>
      ragIndexApi.indexFolderClassical({
        working_dir: request.workingDir,
        recursive: request.recursive,
        file_extensions: request.fileExtensions,
        chunk_size: request.chunkSize,
        chunk_overlap: request.chunkOverlap,
      }),
    onSuccess: () => {
      toast.success("Folder indexing (Classical) started in background");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start classical folder indexing");
    },
  });
}