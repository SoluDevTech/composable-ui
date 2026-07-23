import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Folder } from "lucide-react";
import { Input } from "@/application/components/ui/input";
import { cn } from "@/application/lib/utils";

interface WorkspaceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  folders: string[];
}

const NO_MATCH_THRESHOLD = 0;

export default function WorkspaceSelector({
  value,
  onChange,
  folders,
}: Readonly<WorkspaceSelectorProps>) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredSuggestions = folders.filter(
    (f) => f !== value && (inputValue === "" || f.startsWith(inputValue)),
  );

  useEffect(() => {
    if (!showSuggestions) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  function commitSelection(folder: string) {
    setInputValue(folder);
    onChange(folder);
    setShowSuggestions(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    const count = filteredSuggestions.length;
    if (!showSuggestions || count === NO_MATCH_THRESHOLD) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev === count - 1 ? NO_MATCH_THRESHOLD : prev + 1));
      requestAnimationFrame(() => {
        const nextIdx = activeIndex + 1 > count - 1 ? NO_MATCH_THRESHOLD : activeIndex + 1;
        itemRefs.current[nextIdx]?.focus();
      });
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= NO_MATCH_THRESHOLD ? count - 1 : prev - 1));
      requestAnimationFrame(() => {
        const prevIdx = activeIndex <= NO_MATCH_THRESHOLD ? count - 1 : activeIndex - 1;
        itemRefs.current[prevIdx]?.focus();
      });
      return;
    }
    if (e.key === "Enter") {
      if (activeIndex >= NO_MATCH_THRESHOLD && activeIndex < count) {
        e.preventDefault();
        commitSelection(filteredSuggestions[activeIndex]);
        return;
      }
      setShowSuggestions(false);
      return;
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    }
  }

  const labelId = "workspace-label";
  const listboxId = "workspace-listbox";

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Folder
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showSuggestions && filteredSuggestions.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-labelledby={labelId}
          aria-label="Workspace (working directory)"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
            setShowSuggestions(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Select or type workspace…"
          autoComplete="off"
          spellCheck={false}
          className="pl-9"
        />
      </div>
      <span id={labelId} className="sr-only">
        Workspace (working directory)
      </span>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute top-full left-0 z-20 mt-1 w-full max-h-48 overflow-y-auto border border-border bg-surface block-shadow-raised py-1"
        >
          {filteredSuggestions.map((folder, idx) => (
            <li key={folder} role="option" aria-selected={idx === activeIndex}>
              <button
                ref={(el) => void (itemRefs.current[idx] = el)}
                type="button"
                tabIndex={idx === activeIndex ? 0 : -1}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm text-fg hover:bg-surface-warm hover:text-accent cursor-pointer focus-visible:outline-none focus-visible:shadow-focus transition-[background-color,color] duration-fast ease-standard",
                  idx === activeIndex && "bg-surface-warm text-accent",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => commitSelection(folder)}
              >
                {folder}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
