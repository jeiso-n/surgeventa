import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";

type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  role?: "alert" | "status";
}

const variantStyles: Record<AlertVariant, string> = {
  info: "bg-surface-subtle border-border-strong text-foreground",
  success: "bg-success-soft border-success/30 text-success",
  warning: "bg-warning-soft border-warning/30 text-warning",
  danger: "bg-danger-soft border-danger/30 text-danger",
};

const variantIcons: Record<AlertVariant, ReactNode> = {
  info: <Info className="h-4 w-4 shrink-0 mt-0.5 text-brand" aria-hidden="true" />,
  success: <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />,
  warning: <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />,
  danger: <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />,
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
  role = variant === "danger" ? "alert" : "status",
}: AlertProps) {
  return (
    <div
      role={role}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-xs leading-relaxed",
        variantStyles[variant],
        className,
      )}
    >
      {variantIcons[variant]}
      <div className="space-y-0.5 min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
