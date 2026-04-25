import { formatFileSize } from "@/application/lib/formatFileSize";

interface FileRowProps {
  filename: string;
  size: number;
  lastModified: string | null;
  onRead?: () => void;
  onIndex?: () => void;
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
  onIndex,
}: Readonly<FileRowProps>) {
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
        {onIndex && (
          <button
            type="button"
            onClick={onIndex}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors"
            aria-label={`Index ${filename}`}
          >
            <span className="material-symbols-outlined text-lg text-on-surface-variant">
              playlist_add
            </span>
          </button>
        )}
      </div>
    </div>
  );
}