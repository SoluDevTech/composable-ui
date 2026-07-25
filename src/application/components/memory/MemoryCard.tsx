import { BookOpen, Settings } from "lucide-react";
import { Button } from "@/application/components/ui/button";

interface MemoryCardProps {
  readonly name: string;
  readonly preview: string;
  readonly onConfigure: (name: string) => void;
}

/**
 * Presentational card for a single memory file. Mirrors the SkillCard visual
 * treatment. `name` is the filename, `preview` is a truncated content preview.
 */
export function MemoryCard({ name, preview, onConfigure }: Readonly<MemoryCardProps>) {
  return (
    <div
      data-od-id={`memory-card-${name}`}
      className="group relative flex flex-col gap-3 border border-border bg-surface p-4 block-shadow-raised transition-[border-color,box-shadow,transform] duration-base ease-standard hover:-translate-y-0.5 hover:border-accent"
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center border border-border bg-surface-warm font-display text-lg text-accent"
          aria-hidden="true"
        >
          <BookOpen className="h-6 w-6" />
        </div>
      </div>

      <h3 className="min-w-0 truncate font-display text-lg uppercase tracking-[0.06em] text-fg">
        {name}
      </h3>
      <p className="line-clamp-3 break-words font-mono text-xs text-muted">{preview}</p>

      <div className="mt-auto flex items-center gap-2 border-t border-border-soft pt-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onConfigure(name)}
          data-od-id={`memory-configure-${name}`}
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Configure
        </Button>
      </div>
    </div>
  );
}

export default MemoryCard;
