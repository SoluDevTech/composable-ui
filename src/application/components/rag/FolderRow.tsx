import { Folder, Trash } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { cn } from "@/application/lib/utils";
import IndexActionMenu from "@/application/components/rag/IndexActionMenu";

interface FolderRowProps {
  name: string;
  onClick: () => void;
  isIndexing?: boolean;
  onIndexClassical?: () => void;
  onDelete?: () => void;
}

export default function FolderRow({
  name,
  onClick,
  isIndexing,
  onIndexClassical,
  onDelete,
}: Readonly<FolderRowProps>) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={name}
      data-od-id={`file-row-${name}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "grid grid-cols-[40px_1fr_auto] items-center gap-3 px-3 py-2 border-b border-border-soft cursor-pointer transition-[background-color] duration-fast ease-standard hover:bg-surface-warm focus-visible:outline-none focus-visible:shadow-focus",
        isIndexing && "opacity-60",
      )}
    >
      <span
        className="flex h-8 w-8 items-center justify-center text-accent"
        aria-label="folder icon"
      >
        <Folder className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-sm text-fg font-body truncate">{name}</span>
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {isIndexing && (
          <span className="spin text-accent" aria-hidden="true" data-testid="folder-spinner" />
        )}
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={`Delete ${name}`}
            data-od-id={`folder-delete-${name}`}
          >
            <Trash className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        )}
        {onIndexClassical && <IndexActionMenu onIndexClassical={onIndexClassical} />}
      </div>
    </div>
  );
}
