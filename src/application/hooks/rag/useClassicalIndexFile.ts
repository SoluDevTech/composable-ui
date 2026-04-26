import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ragIndexApi } from "@/infrastructure/api/rag/ragIndexApi";

export function useClassicalIndexFile() {
  return useMutation({
    mutationFn: (request: {
      fileName: string;
      workingDir: string;
      chunkSize: number;
      chunkOverlap: number;
    }) =>
      ragIndexApi.indexFileClassical({
        file_name: request.fileName,
        working_dir: request.workingDir,
        chunk_size: request.chunkSize,
        chunk_overlap: request.chunkOverlap,
      }),
    onSuccess: () => {
      toast.success("File indexing (Classical) started in background");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start classical file indexing");
    },
  });
}