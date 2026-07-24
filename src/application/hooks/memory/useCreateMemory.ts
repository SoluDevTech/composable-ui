import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeApi } from "@/infrastructure/api/store/storeApi";

export interface CreateMemoryInput {
  name: string;
  content: string;
}

/**
 * Create a new memory file at `/memories/{name}.md` containing the provided
 * markdown content (no frontmatter for memories).
 */
export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, content }: CreateMemoryInput) => {
      const path = `/memories/${name}.md`;
      return storeApi.putFile(path, content ?? "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-files"] });
    },
  });
}
