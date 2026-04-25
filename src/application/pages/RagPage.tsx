import { useState, useMemo } from "react";
import MainLayout from "@/application/components/layout/MainLayout";
import BreadcrumbBar from "@/application/components/rag/BreadcrumbBar";
import FileList from "@/application/components/rag/FileList";
import UploadButton from "@/application/components/rag/UploadButton";
import RagTabBar from "@/application/components/rag/RagTabBar";
import QueryPanel from "@/application/components/rag/QueryPanel";
import WorkspaceSelector from "@/application/components/rag/WorkspaceSelector";
import FileContentPanel from "@/application/components/rag/FileContentPanel";
import { useFolders } from "@/application/hooks/rag/useFolders";
import { useFiles } from "@/application/hooks/rag/useFiles";
import { useIndexFile } from "@/application/hooks/rag/useIndexFile";
import { useIndexFolder } from "@/application/hooks/rag/useIndexFolder";
import { useClassicalIndexFile } from "@/application/hooks/rag/useClassicalIndexFile";
import { useClassicalIndexFolder } from "@/application/hooks/rag/useClassicalIndexFolder";
import { useReadFile } from "@/application/hooks/rag/useReadFile";

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
  const [activeTab, setActiveTab] = useState<"browse" | "query">("browse");
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [workingDir, setWorkingDir] = useState("");

  const [fileContentOpen, setFileContentOpen] = useState(false);

  const indexFile = useIndexFile();
  const indexFolder = useIndexFolder();
  const classicalIndexFile = useClassicalIndexFile();
  const classicalIndexFolder = useClassicalIndexFolder();
  const readFile = useReadFile();

  const segments = useMemo(
    () => prefixToSegments(currentPrefix),
    [currentPrefix],
  );

  const foldersQuery = useFolders(currentPrefix);
  const filesQuery = useFiles(currentPrefix, false);

  const workspaceFoldersQuery = useFolders("");

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

  const handleUploadComplete = () => {
    foldersQuery.refetch();
    filesQuery.refetch();
  };

  const handleFileRead = (objectName: string) => {
    readFile.mutate(objectName);
    setFileContentOpen(true);
  };

  const handleFileIndexLightRAG = (objectName: string) => {
    const dir = workingDir || currentPrefix;
    if (!dir) return;
    indexFile.mutate({ fileName: objectName, workingDir: dir });
  };

  const handleFileIndexClassical = (objectName: string) => {
    const dir = workingDir || currentPrefix;
    if (!dir) return;
    classicalIndexFile.mutate({ fileName: objectName, workingDir: dir, chunkSize: 1000, chunkOverlap: 200 });
  };

  const handleFolderIndexLightRAG = (prefix: string) => {
    const dir = workingDir || prefix;
    if (!dir) return;
    indexFolder.mutate({ workingDir: dir, recursive: true });
  };

  const handleFolderIndexClassical = (prefix: string) => {
    const dir = workingDir || prefix;
    if (!dir) return;
    classicalIndexFolder.mutate({ workingDir: dir, recursive: true, chunkSize: 1000, chunkOverlap: 200 });
  };

  const isLoading = foldersQuery.isLoading || filesQuery.isLoading;
  const error = foldersQuery.error || filesQuery.error;

  const folderSuggestions = (workspaceFoldersQuery.data ?? []).map(
    (f) => f.prefix,
  );

  return (
    <MainLayout showSidebar={false}>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1440px] mx-auto px-8 py-12">
          <div className="flex items-start justify-between mb-12">
            <div>
              <h1 className="font-headline text-5xl font-bold text-on-surface mb-3">
                RAG Storage
              </h1>
              <p className="text-on-surface-variant text-sm max-w-md">
                Browse and manage your RAG knowledge base.
              </p>
            </div>
            {activeTab === "browse" && (
              <UploadButton
                prefix={currentPrefix}
                onUploadComplete={handleUploadComplete}
              />
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <RagTabBar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {activeTab === "browse" && (
            <>
              <BreadcrumbBar segments={segments} onNavigate={handleNavigate} />

              <div className="relative">
                <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">Files</h2>

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
                  onFileRead={handleFileRead}
                  onFileIndexLightRAG={handleFileIndexLightRAG}
                  onFileIndexClassical={handleFileIndexClassical}
                  onFolderIndexLightRAG={handleFolderIndexLightRAG}
                  onFolderIndexClassical={handleFolderIndexClassical}
                />

                {fileContentOpen && readFile.data && (
                  <FileContentPanel
                    content={readFile.data.content}
                    metadata={readFile.data.metadata}
                    tables={readFile.data.tables}
                    onClose={() => setFileContentOpen(false)}
                  />
                )}
              </div>
            </>
          )}

          {activeTab === "query" && (
            <>
              <WorkspaceSelector
                value={workingDir}
                onChange={setWorkingDir}
                folders={folderSuggestions}
              />
              <QueryPanel
                workingDir={workingDir}
              />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}