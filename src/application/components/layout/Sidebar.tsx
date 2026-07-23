import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Bot, Database, MessagesSquare, Settings, X } from "lucide-react";
import { cn } from "@/application/lib/utils";
import { useSidebarStore } from "@/application/stores/useSidebarStore";

interface NavItem {
  to: string;
  label: string;
  icon: typeof MessagesSquare;
  odId: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: "/chat", label: "Orchestration", icon: MessagesSquare, odId: "nav-orchestration" },
  { to: "/agents", label: "Agents", icon: Bot, odId: "nav-agents" },
  { to: "/rag", label: "RAG Storage", icon: Database, odId: "nav-rag" },
] as const;

const SYSTEM_ITEMS: readonly NavItem[] = [
  { to: "/settings", label: "Settings", icon: Settings, odId: "nav-settings" },
] as const;

const NAV_LINK_BASE =
  "flex w-full items-center gap-3 border border-transparent border-l-[3px] border-l-transparent px-4 py-3 text-left font-body text-base font-medium text-fg-2 transition-[background-color,border-color,color] duration-fast ease-standard hover:bg-surface-warm hover:border-l-border hover:text-fg focus-visible:outline-none focus-visible:shadow-focus";
const NAV_LINK_ACTIVE = "border-l-accent bg-surface-warm text-accent";

function SidebarLink({
  to,
  label,
  icon: Icon,
  odId,
  onClick,
}: NavItem & { onClick: () => void }) {
  return (
    <NavLink
      key={to}
      to={to}
      data-od-id={odId}
      onClick={onClick}
      className={({ isActive }) => cn(NAV_LINK_BASE, isActive && NAV_LINK_ACTIVE)}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {label}
    </NavLink>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-5 py-6">
      <div className="flex h-10 w-10 items-center justify-center border-2 border-accent bg-accent font-display text-sm text-accent-on block-shadow">
        C
      </div>
      <span className="font-display text-sm uppercase tracking-[0.06em] text-fg">
        Composable<span className="text-accent">UI</span>
      </span>
    </div>
  );
}

function SidebarNav() {
  const close = useSidebarStore((s) => s.close);

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary navigation">
      <div className="mb-6">
        <div className="px-3 pb-1 pt-2 font-mono text-xs uppercase tracking-[0.1em] text-muted">
          Surfaces
        </div>
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} onClick={close} />
        ))}
      </div>
      <div className="mb-6">
        <div className="px-3 pb-1 pt-2 font-mono text-xs uppercase tracking-[0.1em] text-muted">
          System
        </div>
        {SYSTEM_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} onClick={close} />
        ))}
      </div>
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="flex items-center gap-3 border-t border-border px-5 py-4">
      <div className="flex h-10 w-10 items-center justify-center border border-border bg-surface-warm font-mono text-xs text-accent">
        YH
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-fg">Yohan</div>
        <div className="font-mono text-xs text-muted">Operator</div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const close = useSidebarStore((s) => s.close);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <>
      <aside
        data-od-id="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col overflow-hidden border-r border-border bg-surface transition-transform duration-base ease-standard md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <SidebarBrand />
        <SidebarNav />
        <SidebarFooter />
        <button
          type="button"
          onClick={close}
          aria-label="Close menu"
          tabIndex={isOpen ? 0 : -1}
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center text-fg-2 hover:text-fg md:hidden",
            !isOpen && "pointer-events-none",
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  );
}
