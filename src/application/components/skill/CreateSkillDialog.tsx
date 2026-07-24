import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useCreateSkill } from "@/application/hooks/skill/useCreateSkill";
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

interface CreateSkillDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

const SKILL_FORM_ID = "skill-create-form";

/**
 * Dialog to create a new skill: name + description (frontmatter) and a
 * markdown body. Submits via {@link useCreateSkill}, which writes
 * `skills/{name}/SKILL.md`.
 */
export function CreateSkillDialog({ open, onOpenChange }: Readonly<CreateSkillDialogProps>) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const createSkill = useCreateSkill();

  function handleClose() {
    setName("");
    setDescription("");
    setContent("");
    onOpenChange(false);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Skill name is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Skill description is required");
      return;
    }

    createSkill.mutate(
      { name: trimmedName, description: description.trim(), content },
      {
        onSuccess: () => {
          toast.success("Skill created successfully");
          handleClose();
        },
        onError: (error) => {
          toast.error(error.message);
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
            <DialogTitle className="font-display text-lg">Create Skill</DialogTitle>
            <DialogDescription className="text-sm text-muted">
              Define a reusable skill with a markdown body. Name and description become the skill's
              frontmatter.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overscroll-contain overflow-y-auto bg-surface px-6 py-6 sm:px-8">
          <form id={SKILL_FORM_ID} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="skill-name" className="mb-2 block text-xs uppercase tracking-[0.1em]">
                Name
              </Label>
              <Input
                id="skill-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="rag"
                autoComplete="off"
                spellCheck={false}
                aria-label="Name"
              />
            </div>

            <div>
              <Label
                htmlFor="skill-description"
                className="mb-2 block text-xs uppercase tracking-[0.1em]"
              >
                Description
              </Label>
              <Input
                id="skill-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="RAG queries"
                autoComplete="off"
                spellCheck={false}
                aria-label="Description"
              />
            </div>

            <div>
              <Label
                htmlFor="skill-content"
                className="mb-2 block text-xs uppercase tracking-[0.1em]"
              >
                Content
              </Label>
              <Textarea
                id="skill-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# My skill instructions…"
                rows={10}
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
          <Button type="submit" form={SKILL_FORM_ID} disabled={createSkill.isPending}>
            {createSkill.isPending ? "Creating…" : "Create Skill"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateSkillDialog;