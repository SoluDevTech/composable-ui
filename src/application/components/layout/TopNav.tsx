import { NavLink } from "react-router-dom";
import { cn } from "@/application/lib/utils";

const NAV_LINKS = [
  { to: "/chat", label: "Orchestration" },
  { to: "/agents", label: "Agents" },
] as const;

export default function TopNav() {
  return (
    <header className="bg-slate-50/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm px-8 py-4">
      <div className="flex items-center justify-between max-w-[1440px] mx-auto">
        {/* Left: Brand */}
        <div className="font-headline text-xl font-bold text-on-surface tracking-tight select-none">
          Composables
        </div>

        {/* Center: Navigation */}
        <nav className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "font-headline text-sm font-semibold uppercase tracking-widest pb-1 transition-colors duration-200",
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-xl">
              settings
            </span>
          </button>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-xl">
              account_circle
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
