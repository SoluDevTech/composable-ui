import { useState } from "react";
import { Plus } from "lucide-react";
import AppShell from "@/application/components/layout/AppShell";
import SkillGrid from "@/application/components/skill/SkillGrid";
import CreateSkillDialog from "@/application/components/skill/CreateSkillDialog";
import SkillViewer from "@/application/components/skill/SkillViewer";
import { useStoreFiles } from "@/application/hooks/store/useStoreFiles";
import { Badge } from "@/application/components/ui/badge";
import { Button } from "@/application/components/ui/button";

export default function SkillsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewerSkill, setViewerSkill] = useState<string | null>(null);
  const { data: files } = useStoreFiles("/skills/");
  const total = (files ?? []).filter((f) => f.path.endsWith("SKILL.md")).length;

  return (
    <AppShell>
      <div
        className="skills-view flex flex-1 flex-col gap-6 overflow-y-auto bg-bg p-4 md:p-8"
        data-od-id="skills-view"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="max-w-md font-body text-sm text-muted">
            Create and manage reusable skills. Each skill lives at
            <span className="font-mono text-fg-2"> /skills/&lt;name&gt;/SKILL.md </span>
            with YAML frontmatter and a markdown body.
          </p>
          <div className="flex items-center gap-3">
            <Badge variant="default" data-od-id="skill-count">
              {total} skill{total === 1 ? "" : "s"}
            </Badge>
            <Button
              type="button"
              variant="default"
              onClick={() => setCreateDialogOpen(true)}
              data-od-id="create-skill"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create Skill
            </Button>
          </div>
        </div>

        <SkillGrid
          onCreateNew={() => setCreateDialogOpen(true)}
          onConfigure={(name) => setViewerSkill(name)}
        />
      </div>

      <CreateSkillDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      {viewerSkill && (
        <SkillViewer
          skillPath={viewerSkill}
          open
          onOpenChange={(open) => {
            if (!open) setViewerSkill(null);
          }}
        />
      )}
    </AppShell>
  );
}
