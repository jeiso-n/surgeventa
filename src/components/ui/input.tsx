import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({ className, hasError, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground placeholder:text-muted/70 transition-colors",
        "focus:border-brand focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        hasError ? "border-danger" : "border-border-strong",
        className,
      )}
      {...props}
    />
  );
}
