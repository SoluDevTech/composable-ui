import { useState, useRef, useEffect, type KeyboardEvent } from "react";

interface IndexActionMenuProps {
  onIndexLightRAG: () => void;
  onIndexClassical: () => void;
}

const MENU_ITEMS = [
  {
    key: "lightrag",
    label: "Index with LightRAG",
    icon: "hub",
    iconClass: "text-secondary-brand",
  },
  {
    key: "classical",
    label: "Index with Classical",
    icon: "search",
    iconClass: "text-on-surface-variant",
  },
] as const;

export default function IndexActionMenu({
  onIndexLightRAG,
  onIndexClassical,
}: Readonly<IndexActionMenuProps>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // When opening the menu, focus the first item after paint.
  // Avoid setting state synchronously in the body of an effect to prevent cascading renders.
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => itemRefs.current[0]?.focus(), 0);
    return () => clearTimeout(timer);
  }, [open]);

  function toggleMenu(nextOpen: boolean) {
    if (!nextOpen) setActiveIndex(0);
    setOpen(nextOpen);
  }

  function handleTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMenu(true);
    }
  }

  function handleItemKey(e: KeyboardEvent<HTMLButtonElement>, idx: number) {
    const lastIdx = MENU_ITEMS.length - 1;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = idx === lastIdx ? 0 : idx + 1;
      setActiveIndex(next);
      itemRefs.current[next]?.focus();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = idx === 0 ? lastIdx : idx - 1;
      setActiveIndex(prev);
      itemRefs.current[prev]?.focus();
    }
  }

  function runAction(key: string) {
    if (key === "lightrag") onIndexLightRAG();
    if (key === "classical") onIndexClassical();
    toggleMenu(false);
    buttonRef.current?.focus();
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2"
        aria-label="Index options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => toggleMenu(!open)}
        onKeyDown={handleTriggerKey}
      >
        <span
          className="material-symbols-outlined text-lg text-on-surface-variant"
          aria-hidden="true"
        >
          playlist_add
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Index options"
          className="absolute right-0 top-full mt-1 z-50 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg min-w-[200px] py-1"
        >
          {MENU_ITEMS.map((item, idx) => (
            <button
              key={item.key}
              ref={(el) => void (itemRefs.current[idx] = el)}
              type="button"
              role="menuitem"
              aria-current={activeIndex === idx}
              tabIndex={activeIndex === idx ? 0 : -1}
              className="flex items-center gap-2 w-full px-3 py-2.5 font-body text-sm text-on-surface hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-secondary-brand"
              onClick={() => runAction(item.key)}
              onKeyDown={(e) => handleItemKey(e, idx)}
            >
              <span
                className={`material-symbols-outlined text-base ${item.iconClass}`}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}