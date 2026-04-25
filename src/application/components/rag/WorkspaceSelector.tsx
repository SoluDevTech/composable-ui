import { useState, useRef, useEffect } from "react";

interface WorkspaceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  folders: string[];
}

export default function WorkspaceSelector({
  value,
  onChange,
  folders,
}: Readonly<WorkspaceSelectorProps>) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = folders.filter(
    (f) => f !== value && (inputValue === "" || f.startsWith(inputValue)),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-lg text-on-surface-variant"
          aria-hidden="true"
        >
          folder_open
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Select or type workspace..."
          className="bg-surface-container-lowest border border-outline-variant rounded-md px-3 py-1.5 font-body text-sm text-on-surface w-64 focus:outline-none focus:ring-2 focus:ring-secondary-brand"
          aria-label="Workspace (working directory)"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute top-full left-9 z-10 mt-1 w-64 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg max-h-48 overflow-auto">
          {filteredSuggestions.map((folder) => (
            <li key={folder}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 font-body text-sm text-on-surface hover:bg-surface-container transition-colors"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setInputValue(folder);
                  onChange(folder);
                  setShowSuggestions(false);
                }}
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