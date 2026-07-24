import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeApi } from "@/infrastructure/api/store/storeApi";
import { buildFrontmatter } from "@/application/lib/frontmatter";

export interface CreateSkillInput {
  name: string;
  description: string;
  content: string;
}

/**
 * Create a new skill by writing `skills/{name}/SKILL.md` with a YAML
 * frontmatter block (name + description) followed by the markdown body.
 *
 * Throws an error if a skill with the same name already exists, to prevent
 * silent overwrite of the existing content.
 */
export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description, content }: CreateSkillInput) => {
      const path = `/skills/${name}/SKILL.md`;
      const existing = await storeApi.getFile(path);
      if (existing !== null) {
        throw new Error(`A skill named "${name}" already exists`);
      }
      const body = content ?? "";
      const markdown = buildFrontmatter({ name, description }, body);
      return storeApi.putFile(path, markdown);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-files"] });
    },
  });
}
