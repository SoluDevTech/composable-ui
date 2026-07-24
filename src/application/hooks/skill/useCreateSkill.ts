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
 */
export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, description, content }: CreateSkillInput) => {
      const body = content ?? "";
      const markdown = buildFrontmatter({ name, description }, body);
      const path = `/skills/${name}/SKILL.md`;
      return storeApi.putFile(path, markdown);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-files"] });
    },
  });
}
