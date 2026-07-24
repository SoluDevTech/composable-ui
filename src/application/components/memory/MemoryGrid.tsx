import { useMemo } from "react";
import { Plus } from "lucide-react";
import { useStoreFilePreviews } from "@/application/hooks/store/useStoreFilePreviews";
import MemoryCard from "@/application/components/memory/MemoryCard";

interface MemoryGridProps {
  readonly onCreateNew: () => void;
  readonly onConfigure: (name: string) => void;
}

const MEMORIES_PREFIX = "/memories/";
const PREVIEW_CHARS = 300;

export default function MemoryGrid({ onCreateNew, onConfigure }: Readonly<MemoryGridProps>) {
  const { data: previews, isLoading, error } = useStoreFilePreviews(MEMORIES_PREFIX, PREVIEW_CHARS);

  const sortedPreviews = useMemo(
    () => (previews ?? []).slice().sort((a, b) => a.path.localeCompare(b.path)),
    [previews],
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

  if (sortedPreviews.length === 0) {
    return (
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        data-od-id="memory-grid"
      >
        <MemoryCreateButton onClick={onCreateNew} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" data-od-id="memory-grid">
      {sortedPreviews.map((item) => {
        const name = deriveNameFromPath(item.path);
        const preview =
          item.preview.length > PREVIEW_CHARS
            ? `${item.preview.slice(0, PREVIEW_CHARS)}…`
            : item.preview;
        return (
          <div key={item.path} className="min-w-0">
            <MemoryCard name={name} preview={preview} onConfigure={onConfigure} />
          </div>
        );
      })}
      <MemoryCreateButton onClick={onCreateNew} />
    </div>
  );
}

function deriveNameFromPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : path;
}

function MemoryCreateButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-od-id="memory-card-new"
      aria-label="Create a new memory"
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
