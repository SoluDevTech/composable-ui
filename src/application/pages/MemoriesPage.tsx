import { useState } from "react";
import { Plus } from "lucide-react";
import AppShell from "@/application/components/layout/AppShell";
import MemoryGrid from "@/application/components/memory/MemoryGrid";
import CreateMemoryDialog from "@/application/components/memory/CreateMemoryDialog";
import MemoryViewer from "@/application/components/memory/MemoryViewer";
import { useStoreFiles } from "@/application/hooks/store/useStoreFiles";
import { Badge } from "@/application/components/ui/badge";
import { Button } from "@/application/components/ui/button";

export default function MemoriesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewerMemory, setViewerMemory] = useState<string | null>(null);
  const { data: files } = useStoreFiles("/memories/");
  const total = files?.length ?? 0;

  return (
    <AppShell>
      <div
        className="memories-view flex flex-1 flex-col gap-6 overflow-y-auto bg-bg p-4 md:p-8"
        data-od-id="memories-view"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="max-w-md font-body text-sm text-muted">
            Manage markdown memory files. Each memory lives at
            <span className="font-mono text-fg-2"> /memories/&lt;name&gt;.md </span>
            and can be referenced by agents.
          </p>
          <div className="flex items-center gap-3">
            <Badge variant="default" data-od-id="memory-count">
              {total} memor{total === 1 ? "y" : "ies"}
            </Badge>
            <Button
              type="button"
              variant="default"
              onClick={() => setCreateDialogOpen(true)}
              data-od-id="create-memory"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Memory
            </Button>
          </div>
        </div>

        <MemoryGrid
          onCreateNew={() => setCreateDialogOpen(true)}
          onConfigure={(name) => setViewerMemory(name)}
        />
      </div>

      <CreateMemoryDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      {viewerMemory && (
        <MemoryViewer
          memoryPath={viewerMemory}
          open
          onOpenChange={(open) => {
            if (!open) setViewerMemory(null);
          }}
        />
      )}
    </AppShell>
  );
}
