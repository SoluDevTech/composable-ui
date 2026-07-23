import { FileText, Eye, Trash } from "lucide-react";
import { Button } from "@/application/components/ui/button";
import { cn } from "@/application/lib/utils";
import { formatFileSize } from "@/application/lib/formatFileSize";
import IndexActionMenu from "@/application/components/rag/IndexActionMenu";

interface FileRowProps {
  filename: string;
  size: number;
  lastModified: string | null;
  isIndexing?: boolean;
  onRead?: () => void;
  onIndexClassical?: () => void;
  onDelete?: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "\u2014";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function FileRow({
  filename,
  size,
  lastModified,
  isIndexing,
  onRead,
  onIndexClassical,
  onDelete,
}: Readonly<FileRowProps>) {
  const sizeText = `${formatFileSize(size)} · ${formatDate(lastModified)}`;

  return (
    <div
      data-od-id={`file-row-${filename}`}
      className={cn(
        "grid grid-cols-[40px_1fr_auto] md:grid-cols-[40px_1fr_auto_auto] items-center gap-3 px-3 py-2 border-b border-border-soft transition-[background-color] duration-fast ease-standard hover:bg-surface-warm",
        isIndexing && "opacity-60",
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center text-muted" aria-hidden="true">
        {isIndexing ? (
          <span className="spin" data-testid="file-row-spinner" />
        ) : (
          <FileText className="h-5 w-5" />
        )}
      </span>
      <span className="min-w-0 truncate text-sm text-fg font-body">{filename}</span>
      <span className="hidden md:block text-xs font-mono text-muted text-right">{sizeText}</span>
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {onRead && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRead}
            disabled={isIndexing}
            aria-label={`Read ${filename}`}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
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
            disabled={isIndexing}
            aria-label={`Delete ${filename}`}
            data-od-id={`file-delete-${filename}`}
          >
            <Trash className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        )}
        {onIndexClassical && <IndexActionMenu onIndexClassical={onIndexClassical} />}
      </div>
    </div>
  );
}
