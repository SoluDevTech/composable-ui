import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Pencil, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useStoreFile } from "@/application/hooks/store/useStoreFile";
import { usePutStoreFile } from "@/application/hooks/store/usePutStoreFile";
import { useDeleteStoreFile } from "@/application/hooks/store/useDeleteStoreFile";
import { extractApiMessage } from "@/infrastructure/api/store/storeApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/application/components/ui/dialog";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import { Label } from "@/application/components/ui/label";
import { Textarea } from "@/application/components/ui/textarea";
import { ScrollArea } from "@/application/components/ui/scroll-area";

interface MemoryViewerProps {
  readonly memoryPath: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function resolveMemoryStorePath(memoryPath: string): string {
  const trimmed = memoryPath.trim();
  if (trimmed.startsWith("/memories/")) return trimmed;
  const name = trimmed.replace(/^\/?memories\/?/, "");
  return `/memories/${name}`;
}

interface MemoryEditFormProps {
  readonly memoryName: string;
  readonly initialContent: string;
  readonly onSave: (content: string) => void;
  readonly onCancel: () => void;
  readonly isPending: boolean;
}

function MemoryEditForm({
  memoryName,
  initialContent,
  onSave,
  onCancel,
  isPending,
}: Readonly<MemoryEditFormProps>) {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="memory-edit-name" className="mb-2 block text-xs uppercase tracking-[0.1em]">
          Name
        </Label>
        <Input id="memory-edit-name" value={memoryName} readOnly disabled aria-readonly="true" />
      </div>
      <div>
        <Label
          htmlFor="memory-edit-content"
          className="mb-2 block text-xs uppercase tracking-[0.1em]"
        >
          Content
        </Label>
        <Textarea
          id="memory-edit-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className="font-mono text-xs"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex-1" />
        <Button type="button" onClick={() => onSave(content)} disabled={isPending}>
          {isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

export default function MemoryViewer({
  memoryPath,
  open,
  onOpenChange,
}: Readonly<MemoryViewerProps>) {
  const storePath = useMemo(() => resolveMemoryStorePath(memoryPath), [memoryPath]);
  const { data: file, isLoading, error } = useStoreFile(open ? storePath : null);
  const putFile = usePutStoreFile();
  const deleteFile = useDeleteStoreFile();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!open) return null;

  function handleSave(content: string) {
    putFile.mutate(
      { path: storePath, content },
      {
        onSuccess: () => {
          toast.success("Memory saved successfully");
          setMode("view");
        },
        onError: (err) => toast.error(extractApiMessage(err)),
      },
    );
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteFile.mutate(storePath, {
      onSuccess: () => {
        toast.success(`Memory "${memoryPath}" deleted`);
        onOpenChange(false);
        setConfirmDelete(false);
      },
      onError: (err) => {
        toast.error(extractApiMessage(err));
        setConfirmDelete(false);
      },
    });
  }

  function handleExport() {
    if (!file) return;
    const blob = new Blob([file.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = storePath.split("/").filter(Boolean).pop() ?? "memory.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function handleClose() {
    setMode("view");
    setConfirmDelete(false);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden p-0 sm:p-0">
        <div className="shrink-0 border-b border-border bg-surface px-6 pb-4 pt-6 sm:px-8">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="font-display text-lg">{memoryPath}</DialogTitle>
            <DialogDescription className="text-sm text-muted">
              {mode === "edit"
                ? "Edit the memory's content. The filename cannot be renamed."
                : "View the memory. Use Edit to modify the content or Export to download."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overscroll-contain overflow-y-auto bg-surface px-6 py-6 sm:px-8">
          {mode === "edit" && file ? (
            <MemoryEditForm
              key={storePath}
              memoryName={memoryPath}
              initialContent={file.content}
              onSave={handleSave}
              onCancel={() => setMode("view")}
              isPending={putFile.isPending}
            />
          ) : (
            <ScrollArea className="max-h-[70vh]">
              {isLoading && (
                <p className="py-8 text-center font-mono text-sm text-muted" aria-live="polite">
                  Loading memory…
                </p>
              )}
              {error && (
                <p className="py-8 text-center font-mono text-sm text-danger">
                  Failed to load memory: {error.message}
                </p>
              )}
              {file && (
                <article className="prose prose-sm max-w-none text-fg-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{file.content}</ReactMarkdown>
                </article>
              )}
            </ScrollArea>
          )}
        </div>

        {mode === "view" && (
          <div className="shrink-0 border-t border-border bg-surface px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" onClick={handleExport} disabled={!file}>
                <Download className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button type="button" onClick={() => setMode("edit")} disabled={!file}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteFile.isPending}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {confirmDelete ? "Confirm Delete?" : "Delete"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
