import type { ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  FolderKanban,
  LayoutDashboard,
  Link2,
  PenSquare,
  Send,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  icon: ReactNode;
  active?: boolean;
  milestoneTag?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, active: true },
  { label: "Social Accounts", icon: <Link2 className="h-4 w-4" />, milestoneTag: "M4" },
  { label: "Composer", icon: <PenSquare className="h-4 w-4" />, milestoneTag: "M3" },
  { label: "Calendar", icon: <CalendarDays className="h-4 w-4" />, milestoneTag: "M5" },
  { label: "Media Library", icon: <FolderKanban className="h-4 w-4" />, milestoneTag: "M3" },
  { label: "History & Analytics", icon: <BarChart3 className="h-4 w-4" />, milestoneTag: "M6" },
  { label: "Settings", icon: <Settings className="h-4 w-4" />, milestoneTag: "M2" },
];

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-canvas text-foreground">
      {/* Left Navigation Rail */}
      <aside className="w-full lg:w-64 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-surface flex flex-col">
        <div className="h-14 px-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Send className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight block leading-none">
                Surgeventa
              </span>
              <span className="text-[11px] text-muted font-mono">v0.1 · Foundation</span>
            </div>
          </div>
          <Badge variant="brand" className="lg:hidden">
            M1
          </Badge>
        </div>

        <nav
          aria-label="Workspace modules"
          className="p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible"
        >
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors",
                item.active
                  ? "bg-brand-soft text-brand font-medium"
                  : "text-muted/85 cursor-default",
              )}
              title={
                item.milestoneTag
                  ? `Scheduled for Milestone ${item.milestoneTag.slice(1)}`
                  : "Active workspace view"
              }
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </span>
              {item.milestoneTag ? (
                <span className="hidden lg:inline-flex text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-subtle text-muted border border-border">
                  {item.milestoneTag}
                </span>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="hidden lg:block mt-auto p-4 border-t border-border">
          <div className="rounded-lg bg-surface-subtle border border-border p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              <span>Zero-Spend Policy Active</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Official free APIs only. Paid-only networks default to verified assisted handoffs.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 px-6 border-b border-border bg-surface flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight truncate">
              Publishing Workspace
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <Badge variant="brand">Milestone 1 · Foundation</Badge>
            <Badge variant="neutral" className="hidden sm:inline-flex font-mono">
              UTC
            </Badge>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
