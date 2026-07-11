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

  // Parent role varies by pattern.
  const parentRole = isTab ? "tablist" : isRadio ? "radiogroup" : undefined;

  return (
    <div
      role={parentRole}
      aria-label={ariaLabel}
      className={cn("flex items-center gap-1 bg-surface-container rounded-lg p-1", className)}
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
              "px-6 py-2 rounded-md font-headline text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-inset",
              selected
                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface",
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
