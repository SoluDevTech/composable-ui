import { cn } from "@/application/lib/utils";

export interface SegmentedToggleOption<V extends string> {
  value: V;
  label: string;
}

type TogglePattern = "tab" | "toggle" | "radio";

interface SegmentedToggleProps<V extends string> {
  value: V;
  options: SegmentedToggleOption<V>[];
  onChange: (value: V) => void;
  /**
   * Accessibility pattern to use:
   * - "tab":    WAI-ARIA tabs pattern — `role="tab"` + `aria-selected` (default, for content panels).
   * - "toggle": `<button>` with `aria-pressed` (for binary/multi exclusive toggles).
   * - "radio":  WAI-ARIA radiogroup — `role="radio"` + `aria-checked` (for mutually exclusive choice lists).
   */
  pattern?: TogglePattern;
  ariaLabel?: string;
  className?: string;
  itemClassName?: string;
}

export default function SegmentedToggle<V extends string>({
  value,
  options,
  onChange,
  pattern = "tab",
  ariaLabel,
  className,
  itemClassName,
}: Readonly<SegmentedToggleProps<V>>) {
  const isTab = pattern === "tab";
  const isRadio = pattern === "radio";

  const parentRole = isTab ? "tablist" : isRadio ? "radiogroup" : undefined;

  return (
    <div
      role={parentRole}
      aria-label={ariaLabel}
      className={cn("inline-flex items-center border border-border bg-surface-warm p-1", className)}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        const childRole = isTab ? "tab" : isRadio ? "radio" : undefined;
        return (
          <button
            key={opt.value}
            type="button"
            role={childRole}
            aria-selected={isTab ? selected : undefined}
            aria-checked={isRadio ? selected : undefined}
            aria-pressed={!isTab && !isRadio ? selected : undefined}
            tabIndex={isRadio ? (selected ? 0 : -1) : undefined}
            onClick={() => {
              if (!selected) onChange(opt.value);
            }}
            className={cn(
              "px-3 py-1 font-mono text-xs uppercase tracking-[0.1em] transition-[background-color,border-color,color] duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus",
              isTab && selected
                ? "border-b-2 border-accent text-accent"
                : selected
                  ? "bg-surface text-accent"
                  : "text-muted hover:text-fg",
              itemClassName,
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
