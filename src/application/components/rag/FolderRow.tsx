interface FolderRowProps {
  name: string;
  onClick: () => void;
}

export default function FolderRow({ name, onClick }: Readonly<FolderRowProps>) {
  return (
    <button
      type="button"
      tabIndex={0}
      onClick={onClick}
      aria-label={name}
      className="w-full flex items-center gap-4 px-6 py-4 rounded-xl hover:bg-surface-container transition-colors text-left"
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
  );
}
