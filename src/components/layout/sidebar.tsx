import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { NAV_ITEMS } from "@/constants/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] font-display text-sm font-bold text-white shadow-[var(--shadow-glow)]">
        HRIS
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="font-display truncate text-sm font-bold text-[color:var(--color-sidebar-foreground)]">
            On Progress
          </p>
          <p className="truncate text-[11px] text-[color:var(--color-sidebar-muted)]">HR Information System</p>
        </div>
      )}
    </div>
  );
}

function SidebarLinks({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <nav className="flex flex-col gap-1 px-2.5">
      {items.map((item) => {
        const link = collapsed ? (
          <NavLink key={item.to} to={item.to} className="flex items-center justify-center py-1">
            {({ isActive }) => (
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] transition-all duration-200",
                  "text-[color:var(--color-sidebar-muted)] hover:bg-white/[0.08] hover:text-[color:var(--color-sidebar-foreground)]",
                  isActive &&
                    "bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-glow)] hover:bg-[image:var(--gradient-primary)] hover:text-white"
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
              </span>
            )}
          </NavLink>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "text-[color:var(--color-sidebar-muted)] hover:bg-white/[0.06] hover:text-[color:var(--color-sidebar-foreground)]",
                isActive &&
                  "bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-glow)] hover:bg-[image:var(--gradient-primary)] hover:text-white"
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.to} content={item.label} side="right">
              {link}
            </Tooltip>
          );
        }
        return link;
      })}
    </nav>
  );
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <TooltipProvider>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col shrink-0 border-r border-[color:var(--color-sidebar-border)] bg-[color:var(--color-sidebar)] shadow-lg transition-[width] duration-200",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <Logo collapsed={collapsed} />
        <div className="flex-1 overflow-y-auto pb-4">
          <SidebarLinks collapsed={collapsed} />
        </div>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="mx-2.5 mb-4 flex items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[color:var(--color-sidebar-border)] py-2 text-xs font-medium text-[color:var(--color-sidebar-muted)] hover:bg-white/[0.06] hover:text-[color:var(--color-sidebar-foreground)]"
          aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-text-primary/30 backdrop-blur-[2px] animate-fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-[color:var(--color-sidebar)] shadow-xl animate-slide-up">
            <div className="flex items-center justify-between">
              <Logo collapsed={false} />
              <button
                type="button"
                onClick={onCloseMobile}
                className="mr-3 rounded-full p-1.5 text-[color:var(--color-sidebar-muted)] hover:bg-white/[0.06] hover:text-[color:var(--color-sidebar-foreground)]"
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pb-4" onClick={onCloseMobile}>
              <SidebarLinks collapsed={false} />
            </div>
          </aside>
        </div>
      )}
    </TooltipProvider>
  );
}
