import { useState, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/application/lib/utils";

interface ThinkingBlockProps {
  text: string | null;
  source?: string | null;
}

export default function ThinkingBlock({ text, source = null }: Readonly<ThinkingBlockProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  if (!text?.trim()) return null;

  const label = source ? `Thinking — ${source}` : "Thinking";

  return (
    <div className="mt-2 border border-border bg-bg">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-muted transition-[color] duration-fast ease-standard hover:text-fg"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        aria-label={label}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {isExpanded && (
        <div id={panelId} role="region" aria-label={`${label} content`}>
          <pre className="overflow-x-auto whitespace-pre-wrap border-t border-border bg-bg px-3 py-2 font-mono text-xs leading-relaxed text-fg-2">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}
