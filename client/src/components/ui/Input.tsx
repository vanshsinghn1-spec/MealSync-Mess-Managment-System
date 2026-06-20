"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, rightElement, ...props }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        className={cn(
          "peer w-full h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/60 outline-none transition-all duration-200 focus:border-[var(--accent)]/40 focus:ring-4 focus:ring-[var(--accent)]/10",
          icon ? "pl-11 pr-4" : "px-4",
          rightElement ? "pr-11" : "",
          className
        )}
        {...props}
      />
      {icon && (
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]/55 peer-focus:text-[var(--accent-strong)] transition-colors">
          {icon}
        </div>
      )}
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  )
);
Input.displayName = "Input";
