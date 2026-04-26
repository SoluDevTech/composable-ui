import { useState } from "react";

interface IndexActionMenuProps {
  onIndexLightRAG: () => void;
  onIndexClassical: () => void;
}

export default function IndexActionMenu({
  onIndexLightRAG,
  onIndexClassical,
}: Readonly<IndexActionMenuProps>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors"
        aria-label="Index options"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="material-symbols-outlined text-lg text-on-surface-variant">
          playlist_add
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg min-w-[200px]">
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2.5 font-body text-sm text-on-surface hover:bg-surface-container transition-colors"
            onClick={() => {
              onIndexLightRAG();
              setOpen(false);
            }}
          >
            <span className="material-symbols-outlined text-base text-secondary-brand" aria-hidden="true">hub</span>
            {"Index with LightRAG"}
          </button>
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2.5 font-body text-sm text-on-surface hover:bg-surface-container transition-colors"
            onClick={() => {
              onIndexClassical();
              setOpen(false);
            }}
          >
            <span className="material-symbols-outlined text-base text-on-surface-variant" aria-hidden="true">search</span>
            {"Index with Classical"}
          </button>
        </div>
      )}
    </div>
  );
}