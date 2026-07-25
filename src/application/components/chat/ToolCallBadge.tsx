import { useState, useId } from "react";
import { ChevronDown, Wrench } from "lucide-react";
import { cn } from "@/application/lib/utils";

interface ToolCallBadgeProps {
  name: string;
  args: string | null;
  source: string | null;
}

export default function ToolCallBadge({ name, args, source }: Readonly<ToolCallBadgeProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  const accentClass = source ? "border-cyan text-cyan" : "border-accent text-accent";

  return (
    <div
      className={cn("border bg-surface font-mono text-xs", accentClass)}
      data-od-id="tool-call-badge"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="uppercase tracking-[0.1em]">Calling tool: {name}</span>
        {source && (
          <span className="ml-auto font-body text-[10px] normal-case tracking-normal text-muted">
            {source}
          </span>
        )}
        {args && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="ml-1 inline-flex items-center"
            aria-expanded={isExpanded}
            aria-controls={panelId}
            aria-label="Toggle args"
          >
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
      {isExpanded && args && (
        <pre
          id={panelId}
          className="overflow-x-auto whitespace-pre-wrap border-t border-border bg-bg px-3 py-2 text-xs text-fg-2"
        >
          {args}
        </pre>
      )}
    </div>
  );
}
