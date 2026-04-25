import FolderRow from "@/application/components/rag/FolderRow";
import FileRow from "@/application/components/rag/FileRow";
import type { FolderEntry, FileEntry } from "@/domain/entities/rag/fileEntry";

interface FileListProps {
  folders: FolderEntry[];
  files: FileEntry[];
  isLoading: boolean;
  error: Error | null;
  onFolderClick: (prefix: string) => void;
  onRetry: () => void;
  onFileRead?: (objectName: string) => void;
  onFileIndexLightRAG?: (objectName: string) => void;
  onFileIndexClassical?: (objectName: string) => void;
  onFolderIndexLightRAG?: (prefix: string) => void;
  onFolderIndexClassical?: (prefix: string) => void;
}

export default function FileList({
  folders,
  files,
  isLoading,
  error,
  onFolderClick,
  onRetry,
  onFileRead,
  onFileIndexLightRAG,
  onFileIndexClassical,
  onFolderIndexLightRAG,
  onFolderIndexClassical,
}: Readonly<FileListProps>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-on-surface-variant font-headline text-sm tracking-wide">
          Loading files...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span
          className="material-symbols-outlined text-4xl text-on-surface-variant"
          aria-hidden="true"
        >
          cloud_off
        </span>
        <p className="text-red-600 font-headline text-sm">
          Unable to load files. Please try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 text-secondary-brand font-headline text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            refresh
          </span>
          {"Retry"}
        </button>
      </div>
    );
  }

  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <span
          className="material-symbols-outlined text-4xl text-on-surface-variant"
          aria-hidden="true"
        >
          folder_off
        </span>
        <p className="text-on-surface-variant font-headline text-sm">
          No files or folders found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {folders.map((folder) => (
        <FolderRow
          key={folder.prefix}
          name={folder.name}
          onClick={() => onFolderClick(folder.prefix)}
          onIndexLightRAG={onFolderIndexLightRAG ? () => onFolderIndexLightRAG(folder.prefix) : undefined}
          onIndexClassical={onFolderIndexClassical ? () => onFolderIndexClassical(folder.prefix) : undefined}
        />
      ))}
      {files.map((file) => (
        <FileRow
          key={file.objectName}
          filename={file.filename}
          size={file.size}
          lastModified={file.lastModified}
          onRead={onFileRead ? () => onFileRead(file.objectName) : undefined}
          onIndexLightRAG={onFileIndexLightRAG ? () => onFileIndexLightRAG(file.objectName) : undefined}
          onIndexClassical={onFileIndexClassical ? () => onFileIndexClassical(file.objectName) : undefined}
        />
      ))}
    </div>
  );
}