import { Settings, Sparkles } from "lucide-react";
import { Button } from "@/application/components/ui/button";

interface SkillCardProps {
  readonly name: string;
  readonly description: string;
  readonly onConfigure: (skillPath: string) => void;
}

/**
 * Presentational card for a single skill. Mirrors the AgentCard visual
 * treatment (border + block-shadow-raised + hover lift).
 */
export function SkillCard({ name, description, onConfigure }: Readonly<SkillCardProps>) {
  return (
    <div
      data-od-id={`skill-card-${name}`}
      className="group relative flex flex-col gap-3 border border-border bg-surface p-4 block-shadow-raised transition-[border-color,box-shadow,transform] duration-base ease-standard hover:-translate-y-0.5 hover:border-accent"
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center border border-border bg-surface-warm font-display text-lg text-accent"
          aria-hidden="true"
        >
          <Sparkles className="h-6 w-6" />
        </div>
      </div>

      <h3 className="min-w-0 truncate font-display text-lg uppercase tracking-[0.06em] text-fg">
        {name}
      </h3>
      <p className="line-clamp-3 font-mono text-xs text-muted">{description}</p>

      <div className="mt-auto flex items-center gap-2 border-t border-border-soft pt-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onConfigure(name)}
          data-od-id={`skill-configure-${name}`}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Configure
        </Button>
      </div>
    </div>
  );
}

export default SkillCard;
