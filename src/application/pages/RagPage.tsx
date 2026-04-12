import { useState, useMemo } from "react";
import MainLayout from "@/application/components/layout/MainLayout";
import BreadcrumbBar from "@/application/components/rag/BreadcrumbBar";
import FileList from "@/application/components/rag/FileList";
import { useFolders } from "@/application/hooks/rag/useFolders";
import { useFiles } from "@/application/hooks/rag/useFiles";

function prefixToSegments(prefix: string): string[] {
  const trimmed = prefix.replace(/\/+$/, "");
  if (!trimmed) return [];
  return trimmed.split("/");
}

function segmentsToPrefix(segments: string[], upToIndex: number): string {
  if (upToIndex < 0) return "";
  return segments.slice(0, upToIndex + 1).join("/") + "/";
}

export default function RagPage() {
  const [currentPrefix, setCurrentPrefix] = useState("");

  const segments = useMemo(
    () => prefixToSegments(currentPrefix),
    [currentPrefix],
  );

  const foldersQuery = useFolders(currentPrefix);
  const filesQuery = useFiles(currentPrefix, false);

  const handleNavigate = (index: number) => {
    if (index < 0) {
      setCurrentPrefix("");
    } else {
      setCurrentPrefix(segmentsToPrefix(segments, index));
    }
  };

  const handleFolderClick = (prefix: string) => {
    setCurrentPrefix(prefix);
  };

  const isLoading = foldersQuery.isLoading || filesQuery.isLoading;
  const error = foldersQuery.error || filesQuery.error;

  return (
    <MainLayout showSidebar={false}>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1440px] mx-auto px-8 py-12">
          <div className="mb-12">
            <h1 className="font-headline text-5xl font-bold text-on-surface mb-3">
              RAG Storage
            </h1>
            <p className="text-on-surface-variant text-sm max-w-md">
              Browse and explore documents stored in MinIO object storage.
            </p>
          </div>

          <BreadcrumbBar segments={segments} onNavigate={handleNavigate} />

          <FileList
            folders={foldersQuery.data ?? []}
            files={filesQuery.data ?? []}
            isLoading={isLoading}
            error={error}
            onFolderClick={handleFolderClick}
            onRetry={() => {
              foldersQuery.refetch();
              filesQuery.refetch();
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
