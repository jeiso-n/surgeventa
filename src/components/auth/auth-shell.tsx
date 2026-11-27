import type { ReactNode } from "react";
import { Lock, Send, ShieldCheck } from "lucide-react";

export interface AuthShellProps {
  heading: string;
  subheading: string;
  children: ReactNode;
}

export function AuthShell({ heading, subheading, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-canvas text-foreground flex flex-col justify-center px-4 py-10">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-xs">
            <Send className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-wider text-brand">Surgeventa</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{heading}</h1>
            <p className="text-sm text-muted">{subheading}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
          {children}
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            Database-backed sessions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            Server-enforced access
          </span>
        </div>
      </div>
    </div>
  );
}
