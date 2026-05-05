import { useState, useId } from "react";
import { cn } from "@/application/lib/utils";

interface ThinkingBlockProps {
  text: string | null;
}

export default function ThinkingBlock({ text }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  if (!text?.trim()) return null;

  return (
    <div className="mt-4 rounded-xl border border-outline-variant/10 bg-surface-container-low/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className={cn(
          "flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container-lowest/50 transition-colors",
          isExpanded ? "rounded-t-xl" : "rounded-xl",
        )}
        aria-expanded={isExpanded}
        aria-controls={panelId}
      >
        <span
          className="material-symbols-outlined text-base text-secondary-brand transition-transform"
          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          expand_more
        </span>
        <span>Thinking</span>
      </button>
      {isExpanded && (
        <div id={panelId} role="region" aria-label="Thinking content">
          <pre className="px-4 pb-3 text-xs font-mono text-on-surface-variant/80 whitespace-pre-wrap break-words leading-relaxed">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}
