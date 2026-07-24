import { cn } from "@/application/lib/utils";

export interface PillMultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface PillMultiSelectProps {
  options: PillMultiSelectOption[];
  selected: string[];
  onChange?: (selected: string[]) => void;
  emptyMessage?: string;
  readOnly?: boolean;
}

/**
 * Multi-select rendered as toggle pills. Mirrors the styling of the former
 * middleware toggles (mono, uppercase, tracked). Selection state is exposed
 * via `aria-pressed` on each pill button.
 *
 * When `readOnly` is true, only selected options are rendered (no toggling).
 */
export function PillMultiSelect({
  options,
  selected,
  onChange,
  emptyMessage = "No items found",
  readOnly = false,
}: Readonly<PillMultiSelectProps>) {
  const selectedSet = new Set(selected);
  const visibleOptions = readOnly ? options.filter((o) => selectedSet.has(o.value)) : options;

  if (visibleOptions.length === 0) {
    return (
      <p
        className="font-mono text-xs uppercase tracking-[0.1em] text-muted"
        data-od-id="pill-multi-select-empty"
      >
        {emptyMessage}
      </p>
    );
  }

  function handleClick(value: string) {
    if (!onChange) return;
    if (selectedSet.has(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5" role="group" data-od-id="pill-multi-select">
      {visibleOptions.map((option) => {
        const isActive = selectedSet.has(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleClick(option.value)}
            title={option.description}
            className={cn(
              "border px-3 py-1 font-mono text-xs uppercase tracking-[0.1em] transition-[background-color,border-color,color] duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus",
              isActive
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-transparent text-muted hover:bg-surface-warm hover:text-fg",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default PillMultiSelect;
