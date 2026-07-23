import { useState, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/application/lib/utils";

interface ToolResultBlockProps {
  name: string | null;
  content: string | null;
  source: string | null;
}

export default function ToolResultBlock({ name, content, source }: Readonly<ToolResultBlockProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  const accentClass = source ? "border-cyan text-cyan" : "border-accent text-accent";

  return (
    <div
      className={cn("border bg-bg font-mono text-xs", accentClass)}
      data-od-id="tool-result-block"
    >
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        aria-label="Toggle result"
      >
        <span className="uppercase tracking-[0.1em]">Tool Result</span>
        {name && <span className="normal-case tracking-normal text-muted">{name}</span>}
        {source && (
          <span className="ml-auto font-body text-[10px] normal-case tracking-normal text-muted">
            {source}
          </span>
        )}
        <ChevronDown
          className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {isExpanded && content && (
        <pre
          id={panelId}
          className="max-h-48 overflow-y-auto whitespace-pre-wrap border-t border-border bg-bg px-3 py-2 text-[10px] text-fg-2"
        >
          {content}
        </pre>
      )}
    </div>
  );
}
