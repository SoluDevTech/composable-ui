import { Loader2, AlertCircle, FolderOpen, RefreshCw } from "lucide-react";
import { Button } from "@/application/components/ui/button";
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
  onFileIndexClassical?: (objectName: string) => void;
  onFolderIndexClassical?: (prefix: string) => void;
  onFileDelete?: (objectName: string) => void;
  onFolderDelete?: (prefix: string) => void;
}

export default function FileList({
  folders,
  files,
  isLoading,
  error,
  onFolderClick,
  onRetry,
  onFileRead,
  onFileIndexClassical,
  onFolderIndexClassical,
  onFileDelete,
  onFolderDelete,
}: Readonly<FileListProps>) {
  if (isLoading) {
    return (
      <div
        data-od-id="file-list"
        className="flex flex-col border border-border bg-surface items-center justify-center py-24 gap-3"
      >
        <Loader2 className="spin h-6 w-6 text-muted" aria-hidden="true" />
        <p className="text-muted font-mono text-sm">Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        data-od-id="file-list"
        className="flex flex-col border border-border bg-surface items-center justify-center py-24 gap-4"
      >
        <AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />
        <p className="text-danger font-mono text-sm">Unable to load files. Please try again.</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  if (folders.length === 0 && files.length === 0) {
    return (
      <div
        data-od-id="file-list"
        className="flex flex-col border border-border bg-surface items-center justify-center py-24 gap-4"
      >
        <FolderOpen className="h-8 w-8 text-muted" aria-hidden="true" />
        <p className="text-muted font-mono text-sm">No files or folders found.</p>
      </div>
    );
  }

  return (
    <div data-od-id="file-list" className="flex flex-col border border-border bg-surface">
      {folders.map((folder) => (
        <FolderRow
          key={folder.prefix}
          name={folder.name}
          onClick={() => onFolderClick(folder.prefix)}
          onIndexClassical={
            onFolderIndexClassical ? () => onFolderIndexClassical(folder.prefix) : undefined
          }
          onDelete={onFolderDelete ? () => onFolderDelete(folder.prefix) : undefined}
        />
      ))}
      {files.map((file) => (
        <FileRow
          key={file.objectName}
          filename={file.filename}
          size={file.size}
          lastModified={file.lastModified}
          onRead={onFileRead ? () => onFileRead(file.objectName) : undefined}
          onIndexClassical={
            onFileIndexClassical ? () => onFileIndexClassical(file.objectName) : undefined
          }
          onDelete={onFileDelete ? () => onFileDelete(file.objectName) : undefined}
        />
      ))}
    </div>
  );
}
