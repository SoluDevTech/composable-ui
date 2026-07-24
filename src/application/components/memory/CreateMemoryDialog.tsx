import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useCreateMemory } from "@/application/hooks/memory/useCreateMemory";
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

interface CreateMemoryDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

const MEMORY_FORM_ID = "memory-create-form";

/**
 * Dialog to create a new memory file: a name (becomes
 * `/memories/{name}.md`) and a markdown body. No frontmatter for memories.
 */
export function CreateMemoryDialog({ open, onOpenChange }: Readonly<CreateMemoryDialogProps>) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const createMemory = useCreateMemory();

  function handleClose() {
    setName("");
    setContent("");
    onOpenChange(false);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Memory name is required");
      return;
    }
    createMemory.mutate(
      { name: trimmedName, content },
      {
        onSuccess: () => {
          toast.success("Memory created successfully");
          handleClose();
        },
        onError: (error) => {
          toast.error(extractApiMessage(error));
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0 sm:p-0">
        <div className="shrink-0 border-b border-border bg-surface px-6 pb-4 pt-6 sm:px-8">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="font-display text-lg">Create Memory</DialogTitle>
            <DialogDescription className="text-sm text-muted">
              Create a markdown memory file at
              <span className="font-mono text-fg-2"> /memories/&lt;name&gt;.md</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overscroll-contain overflow-y-auto bg-surface px-6 py-6 sm:px-8">
          <form id={MEMORY_FORM_ID} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="memory-name"
                className="mb-2 block text-xs uppercase tracking-[0.1em]"
              >
                Name
              </Label>
              <Input
                id="memory-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="AGENTS"
                autoComplete="off"
                spellCheck={false}
                aria-label="Name"
              />
            </div>

            <div>
              <Label
                htmlFor="memory-content"
                className="mb-2 block text-xs uppercase tracking-[0.1em]"
              >
                Content
              </Label>
              <Textarea
                id="memory-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Project rules and conventions…"
                rows={12}
                className="font-mono text-xs"
                aria-label="Content"
              />
            </div>
          </form>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-border bg-surface px-6 py-4 sm:px-8">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <div className="flex-1" />
          <Button type="submit" form={MEMORY_FORM_ID} disabled={createMemory.isPending}>
            {createMemory.isPending ? "Creating…" : "Create Memory"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateMemoryDialog;
