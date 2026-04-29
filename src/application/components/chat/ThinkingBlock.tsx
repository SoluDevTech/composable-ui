import { useState } from "react";
import { cn } from "@/application/lib/utils";

interface ThinkingBlockProps {
  text: string | null;
  className?: string;
}

export default function ThinkingBlock({ text, className }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text?.trim()) return null;

  return (
    <div
      className={cn(
        "mb-4 rounded-xl border border-outline-variant/20 bg-surface-container-low/60",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container-lowest/50 transition-colors rounded-t-xl last:rounded-b-xl"
        aria-expanded={isExpanded}
      >
        <span className="material-symbols-outlined text-base text-secondary-brand">
          lightbulb
        </span>
        <span>Thinking</span>
        <span className="material-symbols-outlined text-base ml-auto transition-transform duration-200">
          {isExpanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-3">
          <pre className="font-mono text-[11px] leading-relaxed text-on-surface-variant whitespace-pre-wrap break-words">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}
