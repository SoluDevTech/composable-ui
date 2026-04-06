import { useState, useRef } from "react";
import { toast } from "sonner";
import { useCreateAgent } from "@/application/hooks/agent/useCreateAgent";

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAgentDialog({
  open,
  onOpenChange,
}: Readonly<CreateAgentDialogProps>) {
  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createAgent = useCreateAgent();

  if (!open) return null;

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();

    const file = fileInputRef.current?.files?.[0];
    if (!name.trim()) {
      toast.error("Agent name is required");
      return;
    }
    if (!file) {
      toast.error("YAML configuration file is required");
      return;
    }

    createAgent.mutate(
      { name: name.trim(), yamlFile: file },
      {
        onSuccess: () => {
          toast.success("Agent created successfully");
          setName("");
          if (fileInputRef.current) fileInputRef.current.value = "";
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  }

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm m-0 p-0 w-full h-full border-none bg-transparent"
      onClick={handleBackdropClick}
      onKeyDown={(e) => { if (e.key === "Escape") onOpenChange(false); }}
    >
      <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-md ambient-shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            Create Agent
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="agent-name"
              className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2"
            >
              Agent Name
            </label>
            <input
              id="agent-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-agent"
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary-brand/40 transition-shadow"
            />
          </div>

          <div>
            <label
              htmlFor="agent-yaml"
              className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2"
            >
              YAML Configuration
            </label>
            <input
              id="agent-yaml"
              ref={fileInputRef}
              type="file"
              accept=".yaml,.yml"
              className="w-full text-sm text-on-surface-variant file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-surface-container file:text-on-surface-variant hover:file:bg-surface-container-high file:transition-colors file:cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-6 py-3 rounded-full border border-outline-variant/30 text-on-surface-variant font-headline text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAgent.isPending}
              className="flex-1 px-6 py-3 rounded-full bg-primary-container text-white font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createAgent.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
