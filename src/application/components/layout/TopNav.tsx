import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/application/lib/utils";

const NAV_LINKS = [
  { to: "/chat", label: "Orchestration" },
  { to: "/agents", label: "Agents" },
  { to: "/rag", label: "RAG" },
] as const;

export default function TopNav() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="bg-slate-50/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between max-w-[1440px] mx-auto gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/logo.png"
            alt="Composables logo"
            width={40}
            height={40}
            className="h-10 w-auto select-none"
          />
          <span className="font-headline text-xl font-bold text-on-surface tracking-tight select-none">
            Composables
          </span>
        </div>

        {/* Center: Navigation (desktop) */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "font-headline text-sm font-semibold uppercase tracking-widest pb-1 transition-colors duration-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2",
                  isActive
                    ? "text-secondary-brand border-b-2 border-secondary-brand"
                    : "text-slate-500 hover:text-on-surface",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Settings"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant text-xl"
              aria-hidden="true"
            >
              settings
            </span>
          </button>
          <button
            type="button"
            aria-label="Account"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant text-xl"
              aria-hidden="true"
            >
              account_circle
            </span>
          </button>

          {/* Mobile nav toggle */}
          <button
            type="button"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2"
          >
            <span
              className="material-symbols-outlined text-on-surface-variant text-xl"
              aria-hidden="true"
            >
              {mobileNavOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileNavOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="md:hidden mt-4 flex flex-col gap-1 pt-2 border-t border-outline-variant/30"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                cn(
                  "font-headline text-sm font-semibold uppercase tracking-widest py-3 px-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-brand focus-visible:ring-offset-2",
                  isActive
                    ? "text-secondary-brand bg-secondary-brand/5"
                    : "text-slate-500 hover:text-on-surface hover:bg-surface-container-low",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}