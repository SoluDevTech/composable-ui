import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ragFileContentApi } from "@/infrastructure/api/rag/ragFileContentApi";

export function useReadFile() {
  return useMutation({
    mutationFn: (filePath: string) => ragFileContentApi.readFile(filePath),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to read file content");
    },
  });
}