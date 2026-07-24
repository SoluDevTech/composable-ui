import { useMemo } from "react";
import { Plus } from "lucide-react";
import { useStoreFiles } from "@/application/hooks/store/useStoreFiles";
import { useStoreFile } from "@/application/hooks/store/useStoreFile";
import { parseFrontmatter } from "@/application/lib/frontmatter";
import SkillCard from "@/application/components/skill/SkillCard";

interface SkillGridProps {
  readonly onCreateNew: () => void;
  readonly onConfigure: (skillName: string) => void;
}

const SKILLS_PREFIX = "/skills/";

export default function SkillGrid({ onCreateNew, onConfigure }: Readonly<SkillGridProps>) {
  const { data: files, isLoading, error } = useStoreFiles(SKILLS_PREFIX);

  const skillPaths = useMemo(() => {
    return (files ?? [])
      .map((f) => f.path)
      .filter((p) => p.endsWith("SKILL.md"))
      .sort();
  }, [files]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24" data-od-id="skill-grid">
        <span
          className="spin mr-3 inline-block h-4 w-4 border-2 border-border border-t-accent"
          aria-hidden="true"
        />
        <p className="font-mono text-sm text-muted">Loading skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24" data-od-id="skill-grid">
        <p className="font-mono text-sm text-danger">Failed to load skills: {error.message}</p>
      </div>
    );
  }

  if (skillPaths.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" data-od-id="skill-grid">
        <SkillCreateButton onClick={onCreateNew} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" data-od-id="skill-grid">
      {skillPaths.map((path) => (
        <SkillGridItem key={path} path={path} onConfigure={onConfigure} />
      ))}
      <SkillCreateButton onClick={onCreateNew} />
    </div>
  );
}

function SkillGridItem({
  path,
  onConfigure,
}: Readonly<{ path: string; onConfigure: (name: string) => void }>) {
  const { data: file } = useStoreFile(path);
  const { name, description } = useMemo(() => {
    if (!file) return { name: deriveNameFromPath(path), description: "" };
    const { data } = parseFrontmatter(file.content);
    return {
      name: data.name ?? deriveNameFromPath(path),
      description: data.description ?? "",
    };
  }, [file, path]);

  return (
    <div className="min-w-0">
      <SkillCard name={name} description={description} onConfigure={onConfigure} />
    </div>
  );
}

function deriveNameFromPath(path: string): string {
  // /skills/rag/SKILL.md -> rag
  const parts = path.split("/").filter(Boolean);
  // parts[0] === "skills", parts[1] === "<name>", parts[2] === "SKILL.md"
  return parts.length >= 2 ? parts[1] : path;
}

function SkillCreateButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-od-id="skill-card-new"
      className="group flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border bg-surface/50 text-muted transition-[border-color,color] duration-base ease-standard hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:shadow-focus"
    >
      <span
        className="flex h-12 w-12 items-center justify-center border border-border bg-surface text-muted transition-colors group-hover:border-accent group-hover:text-accent"
        aria-hidden="true"
      >
        <Plus className="h-6 w-6" />
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.1em]">New Skill</span>
    </button>
  );
}