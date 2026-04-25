import { useState } from "react";

interface FolderRowProps {
  name: string;
  onClick: () => void;
  onIndexLightRAG?: () => void;
  onIndexClassical?: () => void;
}

export default function FolderRow({ name, onClick, onIndexLightRAG, onIndexClassical }: Readonly<FolderRowProps>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasIndexOptions = onIndexLightRAG || onIndexClassical;

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
      {hasIndexOptions && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-8 h-8 mr-4 rounded-lg hover:bg-surface-container transition-colors"
            aria-label={`Index options for ${name}`}
          >
            <span className="material-symbols-outlined text-lg text-on-surface-variant">
              playlist_add
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg min-w-[200px]">
              {onIndexLightRAG && (
                <button
                  type="button"
                  className="flex items-center gap-2 w-full px-3 py-2.5 font-body text-sm text-on-surface hover:bg-surface-container transition-colors"
                  onClick={() => { onIndexLightRAG(); setMenuOpen(false); }}
                >
                  <span className="material-symbols-outlined text-base text-secondary-brand" aria-hidden="true">hub</span>
                  {"Index with LightRAG"}
                </button>
              )}
              {onIndexClassical && (
                <button
                  type="button"
                  className="flex items-center gap-2 w-full px-3 py-2.5 font-body text-sm text-on-surface hover:bg-surface-container transition-colors"
                  onClick={() => { onIndexClassical(); setMenuOpen(false); }}
                >
                  <span className="material-symbols-outlined text-base text-on-surface-variant" aria-hidden="true">search</span>
                  {"Index with Classical"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}