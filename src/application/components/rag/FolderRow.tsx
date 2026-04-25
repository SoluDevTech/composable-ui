import IndexActionMenu from "@/application/components/rag/IndexActionMenu";

interface FolderRowProps {
  name: string;
  onClick: () => void;
  isIndexing?: boolean;
  onIndexLightRAG?: () => void;
  onIndexClassical?: () => void;
}

export default function FolderRow({ name, onClick, isIndexing, onIndexLightRAG, onIndexClassical }: Readonly<FolderRowProps>) {
  const hasIndexOptions = onIndexLightRAG || onIndexClassical;

  return (
    <div className={`w-full flex items-center ${isIndexing ? "opacity-60" : ""}`}>
      <button
        type="button"
        tabIndex={0}
        onClick={onClick}
        disabled={isIndexing}
        aria-label={name}
        className="flex-1 flex items-center gap-4 px-6 py-4 rounded-xl hover:bg-surface-container transition-colors text-left"
      >
        <span
          className="material-symbols-outlined text-2xl text-secondary-brand"
          aria-label="folder icon"
        >
          {isIndexing ? "progress_activity" : "folder"}
        </span>
        <span className="font-headline text-sm font-semibold text-on-surface flex-1">
          {name}
        </span>
        {isIndexing && (
          <span className="material-symbols-outlined text-lg animate-spin text-secondary-brand" aria-hidden="true">
            progress_activity
          </span>
        )}
        <span
          className="material-symbols-outlined text-lg text-outline"
          aria-hidden="true"
        >
          chevron_right
        </span>
      </button>
      {hasIndexOptions && (
        <div className="mr-4">
          <IndexActionMenu
            onIndexLightRAG={onIndexLightRAG!}
            onIndexClassical={onIndexClassical!}
          />
        </div>
      )}
    </div>
  );
}