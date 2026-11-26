import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, badge, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-strong bg-surface-subtle/60 p-5",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted">
          {icon}
        </div>
        {badge}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
