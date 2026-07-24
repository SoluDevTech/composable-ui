import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Pencil, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useStoreFile } from "@/application/hooks/store/useStoreFile";
import { usePutStoreFile } from "@/application/hooks/store/usePutStoreFile";
import { useDeleteStoreFile } from "@/application/hooks/store/useDeleteStoreFile";
import { buildFrontmatter, parseFrontmatter } from "@/application/lib/frontmatter";
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

interface SkillViewerProps {
  readonly skillPath: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function resolveSkillStorePath(skillPath: string): string {
  const trimmed = skillPath.trim();
  if (trimmed.endsWith("SKILL.md")) return trimmed;
  const name = trimmed.replace(/^\/?skills\/?/, "").replace(/\/$/, "");
  return `/skills/${name}/SKILL.md`;
}

interface SkillEditFormProps {
  readonly initialName: string;
  readonly initialDescription: string;
  readonly initialContent: string;
  readonly onSave: (name: string, description: string, content: string) => void;
  readonly onCancel: () => void;
  readonly isPending: boolean;
}

function SkillEditForm({
  initialName,
  initialDescription,
  initialContent,
  onSave,
  onCancel,
  isPending,
}: Readonly<SkillEditFormProps>) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [content, setContent] = useState(initialContent);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="skill-edit-name" className="mb-2 block text-xs uppercase tracking-[0.1em]">
          Name
        </Label>
        <Input
          id="skill-edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="rag"
        />
      </div>
      <div>
        <Label
          htmlFor="skill-edit-description"
          className="mb-2 block text-xs uppercase tracking-[0.1em]"
        >
          Description
        </Label>
        <Input
          id="skill-edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="RAG queries"
        />
      </div>
      <div>
        <Label
          htmlFor="skill-edit-content"
          className="mb-2 block text-xs uppercase tracking-[0.1em]"
        >
          Content
        </Label>
        <Textarea
          id="skill-edit-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          className="font-mono text-xs"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          onClick={() => onSave(name.trim(), description.trim(), content)}
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

export default function SkillViewer({ skillPath, open, onOpenChange }: Readonly<SkillViewerProps>) {
  const storePath = useMemo(() => resolveSkillStorePath(skillPath), [skillPath]);
  const { data: file, isLoading, error } = useStoreFile(open ? storePath : null);
  const putFile = usePutStoreFile();
  const deleteFile = useDeleteStoreFile();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!open) return null;

  const parsed = file ? parseFrontmatter(file.content) : null;

  function handleSave(name: string, description: string, content: string) {
    if (!name) {
      toast.error("Skill name is required");
      return;
    }
    const markdown = buildFrontmatter({ name, description }, content);
    putFile.mutate(
      { path: storePath, content: markdown },
      {
        onSuccess: () => {
          toast.success("Skill saved successfully");
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
        toast.success(`Skill "${skillPath}" deleted`);
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
    a.download = storePath.split("/").filter(Boolean).pop() ?? "SKILL.md";
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
            <DialogTitle className="font-display text-lg">{skillPath}</DialogTitle>
            <DialogDescription className="text-sm text-muted">
              {mode === "edit"
                ? "Edit the skill's name, description, and body."
                : "View the skill. Use Edit to modify or Export to download the markdown."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overscroll-contain overflow-y-auto bg-surface px-6 py-6 sm:px-8">
          {mode === "edit" && parsed ? (
            <SkillEditForm
              key={storePath}
              initialName={parsed.data.name ?? ""}
              initialDescription={parsed.data.description ?? ""}
              initialContent={parsed.body}
              onSave={handleSave}
              onCancel={() => setMode("view")}
              isPending={putFile.isPending}
            />
          ) : (
            <ScrollArea className="max-h-[70vh]">
              {isLoading && (
                <p className="py-8 text-center font-mono text-sm text-muted" aria-live="polite">
                  Loading skill…
                </p>
              )}
              {error && (
                <p className="py-8 text-center font-mono text-sm text-danger">
                  Failed to load skill: {error.message}
                </p>
              )}
              {file && parsed && (
                <div className="space-y-6">
                  <div className="space-y-1 border border-border-soft bg-surface-warm p-3">
                    <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted">Name</p>
                    <p className="font-mono text-sm text-fg">{parsed.data.name ?? skillPath}</p>
                    {parsed.data.description && (
                      <>
                        <p className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-muted">
                          Description
                        </p>
                        <p className="font-mono text-sm text-fg">{parsed.data.description}</p>
                      </>
                    )}
                  </div>
                  <article className="prose prose-sm max-w-none text-fg-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.body}</ReactMarkdown>
                  </article>
                </div>
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
