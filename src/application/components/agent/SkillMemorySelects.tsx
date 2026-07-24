import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useStoreFiles } from "@/application/hooks/store/useStoreFiles";
import { storeApi } from "@/infrastructure/api/store/storeApi";
import { parseFrontmatter } from "@/application/lib/frontmatter";
import PillMultiSelect, {
  type PillMultiSelectOption,
} from "@/application/components/shared/PillMultiSelect";

const SKILLS_PREFIX = "/skills/";
const MEMORIES_PREFIX = "/memories/";

/**
 * Multi-select of available skills for use inside the agent form. Each option
 * value is the skill directory path (e.g. `/skills/rag/`); labels come from
 * each skill's frontmatter `name`. Skills are fetched in parallel via
 * `useQueries` so we don't create an N+1 fetch waterfall.
 */
export function SkillPillMultiSelect({
  selected,
  onChange,
  readOnly = false,
}: Readonly<{ selected: string[]; onChange?: (selected: string[]) => void; readOnly?: boolean }>) {
  const { data: files } = useStoreFiles(SKILLS_PREFIX);

  const skillPaths = useMemo(
    () =>
      (files ?? [])
        .map((f) => f.path)
        .filter((p) => p.endsWith("SKILL.md"))
        .sort(),
    [files],
  );

  // Fetch every SKILL.md in parallel to read its frontmatter name. The query
  // key mirrors useStoreFile so results are shared/cached with the viewer.
  const fileResults = useQueries({
    queries: skillPaths.map((path) => ({
      queryKey: ["store-file", path],
      queryFn: () => storeApi.getFile(path),
    })),
  });

  const options = useMemo<PillMultiSelectOption[]>(() => {
    return skillPaths.map((path, index) => {
      const file = fileResults[index]?.data;
      const dir = path.replace(/\/SKILL\.md$/, "");
      const name = file ? parseFrontmatter(file.content).data.name : null;
      return {
        value: `${dir}/`,
        label: name ?? deriveNameFromPath(path),
        description: file ? parseFrontmatter(file.content).data.description : undefined,
      };
    });
  }, [skillPaths, fileResults]);

  return (
    <PillMultiSelect
      options={options}
      selected={selected}
      onChange={onChange}
      readOnly={readOnly}
      emptyMessage="No skills found. Create skills in the Skills page first."
    />
  );
}

/**
 * Multi-select of available memories for use inside the agent form. Each
 * option value is the full memory path (e.g. `/memories/AGENTS.md`); the label
 * is the filename.
 */
export function MemoryPillMultiSelect({
  selected,
  onChange,
  readOnly = false,
}: Readonly<{ selected: string[]; onChange?: (selected: string[]) => void; readOnly?: boolean }>) {
  const { data: files } = useStoreFiles(MEMORIES_PREFIX);

  const options = useMemo<PillMultiSelectOption[]>(
    () =>
      (files ?? [])
        .map((f) => f.path)
        .sort()
        .map((path) => ({
          value: path,
          label: path.split("/").filter(Boolean).pop() ?? path,
        })),
    [files],
  );

  return (
    <PillMultiSelect
      options={options}
      selected={selected}
      onChange={onChange}
      readOnly={readOnly}
      emptyMessage="No memories found. Create memories in the Memories page first."
    />
  );
}

function deriveNameFromPath(path: string): string {
  // /skills/rag/SKILL.md -> rag
  const parts = path.split("/").filter(Boolean);
  return parts.length >= 2 ? parts[1] : path;
}
