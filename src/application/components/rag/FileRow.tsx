import { useState } from "react";
import { formatFileSize } from "@/application/lib/formatFileSize";

interface FileRowProps {
  filename: string;
  size: number;
  lastModified: string | null;
  onRead?: () => void;
  onIndexLightRAG?: () => void;
  onIndexClassical?: () => void;
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

function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const icons: Record<string, string> = {
    pdf: "picture_as_pdf",
    doc: "description",
    docx: "description",
    xls: "table_chart",
    xlsx: "table_chart",
    png: "image",
    jpg: "image",
    jpeg: "image",
    gif: "image",
    svg: "image",
    md: "article",
    txt: "article",
    csv: "table_chart",
    json: "data_object",
    yaml: "data_object",
    yml: "data_object",
    zip: "folder_zip",
  };
  return icons[ext] || "description";
}

export default function FileRow({
  filename,
  size,
  lastModified,
  onRead,
  onIndexLightRAG,
  onIndexClassical,
}: Readonly<FileRowProps>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasIndexOptions = onIndexLightRAG || onIndexClassical;

  return (
    <div
      className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-left"
    >
      <span
        className="material-symbols-outlined text-2xl text-on-surface-variant"
        aria-hidden="true"
      >
        {getFileIcon(filename)}
      </span>
      <span className="font-body text-sm text-on-surface flex-1">
        {filename}
      </span>
      <span className="font-body text-sm text-on-surface-variant w-24 text-right">
        {formatFileSize(size)}
      </span>
      <span className="font-body text-sm text-on-surface-variant w-32 text-right">
        {formatDate(lastModified)}
      </span>
      <div className="flex items-center gap-1">
        {onRead && (
          <button
            type="button"
            onClick={onRead}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors"
            aria-label={`Read ${filename}`}
          >
            <span className="material-symbols-outlined text-lg text-on-surface-variant">
              visibility
            </span>
          </button>
        )}
        {hasIndexOptions && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors"
              aria-label={`Index options for ${filename}`}
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
    </div>
  );
}