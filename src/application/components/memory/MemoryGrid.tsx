import { useMemo } from "react";
import { Plus } from "lucide-react";
import { useStoreFiles } from "@/application/hooks/store/useStoreFiles";
import { useStoreFile } from "@/application/hooks/store/useStoreFile";
import MemoryCard from "@/application/components/memory/MemoryCard";

interface MemoryGridProps {
  readonly onCreateNew: () => void;
  readonly onConfigure: (name: string) => void;
}

const MEMORIES_PREFIX = "/memories/";

export default function MemoryGrid({ onCreateNew, onConfigure }: Readonly<MemoryGridProps>) {
  const { data: files, isLoading, error } = useStoreFiles(MEMORIES_PREFIX);

  const memoryPaths = useMemo(
    () => (files ?? []).map((f) => f.path).sort(),
    [files],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24" data-od-id="memory-grid">
        <span
          className="spin mr-3 inline-block h-4 w-4 border-2 border-border border-t-accent"
          aria-hidden="true"
        />
        <p className="font-mono text-sm text-muted">Loading memories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24" data-od-id="memory-grid">
        <p className="font-mono text-sm text-danger">Failed to load memories: {error.message}</p>
      </div>
    );
  }

  if (memoryPaths.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" data-od-id="memory-grid">
        <MemoryCreateButton onClick={onCreateNew} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" data-od-id="memory-grid">
      {memoryPaths.map((path) => (
        <MemoryGridItem key={path} path={path} onConfigure={onConfigure} />
      ))}
      <MemoryCreateButton onClick={onCreateNew} />
    </div>
  );
}

function MemoryGridItem({
  path,
  onConfigure,
}: Readonly<{ path: string; onConfigure: (name: string) => void }>) {
  const { data: file } = useStoreFile(path);
  const name = deriveNameFromPath(path);
  const preview = useMemo(() => {
    if (!file) return "";
    const truncated = file.content.slice(0, 100);
    return file.content.length > 100 ? `${truncated}…` : truncated;
  }, [file]);

  return (
    <div className="min-w-0">
      <MemoryCard name={name} preview={preview} onConfigure={onConfigure} />
    </div>
  );
}

function deriveNameFromPath(path: string): string {
  // /memories/AGENTS.md -> AGENTS.md
  const parts = path.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : path;
}

function MemoryCreateButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-od-id="memory-card-new"
      className="group flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-border bg-surface/50 text-muted transition-[border-color,color] duration-base ease-standard hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:shadow-focus"
    >
      <span
        className="flex h-12 w-12 items-center justify-center border border-border bg-surface text-muted transition-colors group-hover:border-accent group-hover:text-accent"
        aria-hidden="true"
      >
        <Plus className="h-6 w-6" />
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.1em]">New Memory</span>
    </button>
  );
}