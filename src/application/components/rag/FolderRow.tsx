interface FolderRowProps {
  name: string;
  onClick: () => void;
  onIndex?: () => void;
}

export default function FolderRow({ name, onClick, onIndex }: Readonly<FolderRowProps>) {
  return (
    <div className="w-full flex items-center">
      <button
        type="button"
        tabIndex={0}
        onClick={onClick}
        aria-label={name}
        className="flex-1 flex items-center gap-4 px-6 py-4 rounded-xl hover:bg-surface-container transition-colors text-left"
      >
        <span
          className="material-symbols-outlined text-2xl text-secondary-brand"
          aria-label="folder icon"
        >
          folder
        </span>
        <span className="font-headline text-sm font-semibold text-on-surface flex-1">
          {name}
        </span>
        <span
          className="material-symbols-outlined text-lg text-outline"
          aria-hidden="true"
        >
          chevron_right
        </span>
      </button>
      {onIndex && (
        <button
          type="button"
          onClick={onIndex}
          className="flex items-center justify-center w-8 h-8 mr-4 rounded-lg hover:bg-surface-container transition-colors"
          aria-label={`Index ${name}`}
        >
          <span className="material-symbols-outlined text-lg text-on-surface-variant">
            playlist_add
          </span>
        </button>
      )}
    </div>
  );
}