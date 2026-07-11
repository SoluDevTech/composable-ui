import { useState, useRef, useEffect, type KeyboardEvent } from "react";

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

  // Keep internal input in sync if the parent updates the value.
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredSuggestions = folders.filter(
    (f) => f !== value && (inputValue === "" || f.startsWith(inputValue)),
  );

  // Close on outside click.
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
      // Defer focus until refs are updated for the new active index.
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
      <div className="flex items-center gap-2">
        <span
          id={labelId}
          className="material-symbols-outlined text-lg text-on-surface-variant"
          aria-hidden="true"
        >
          folder_open
        </span>
        <input
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
          className="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-1.5 font-body text-sm text-on-surface w-64 focus:outline-none focus:ring-2 focus:ring-secondary-brand"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute top-full left-9 z-10 mt-1 w-64 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg max-h-48 overflow-auto"
        >
          {filteredSuggestions.map((folder, idx) => (
            <li key={folder} role="option" aria-selected={idx === activeIndex}>
              <button
                ref={(el) => void (itemRefs.current[idx] = el)}
                type="button"
                tabIndex={idx === activeIndex ? 0 : -1}
                className="w-full text-left px-3 py-2 font-body text-sm text-on-surface hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary-brand transition-colors"
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
