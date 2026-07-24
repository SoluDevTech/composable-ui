import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeApi } from "@/infrastructure/api/store/storeApi";

export interface CreateMemoryInput {
  name: string;
  content: string;
}

/**
 * Create a new memory file at `/memories/{name}.md` containing the provided
 * markdown content (no frontmatter for memories).
 *
 * Throws an error if a memory with the same name already exists, to prevent
 * silent overwrite of the existing content.
 */
export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, content }: CreateMemoryInput) => {
      const path = `/memories/${name}.md`;
      const existing = await storeApi.getFile(path);
      if (existing !== null) {
        throw new Error(`A memory named "${name}" already exists`);
      }
      return storeApi.putFile(path, content ?? "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-files"] });
    },
  });
}
