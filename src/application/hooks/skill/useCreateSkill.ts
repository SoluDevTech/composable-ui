import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeApi } from "@/infrastructure/api/store/storeApi";
import { buildFrontmatter } from "@/application/lib/frontmatter";

export interface CreateSkillInput {
  name: string;
  description: string;
  content: string;
}

const NAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

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
      const trimmedName = name.trim();
      if (!NAME_PATTERN.test(trimmedName)) {
        throw new Error(
          `Invalid skill name "${trimmedName}": only letters, digits, dots, hyphens, and underscores allowed`,
        );
      }
      const path = `/skills/${trimmedName}/SKILL.md`;
      const existing = await storeApi.getFile(path);
      if (existing !== null) {
        throw new Error(`A skill named "${trimmedName}" already exists`);
      }
      const body = content ?? "";
      const markdown = buildFrontmatter({ name: trimmedName, description }, body);
      return storeApi.putFile(path, markdown);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-files"] });
      queryClient.invalidateQueries({ queryKey: ["store-file-previews"] });
    },
  });
}
