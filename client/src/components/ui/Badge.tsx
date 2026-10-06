"use client";

import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--sage-soft)] text-[var(--forest)]",
        forest:
          "bg-[#173b2a] text-[#d9f36b]",
        lime:
          "bg-[#d9f36b] text-[#173b2a] font-bold",
        success:
          "bg-[var(--sage-soft)] text-[var(--success)]",
        warning:
          "bg-[#fdf3e3] text-[var(--warning)] [data-theme='dark']_&:bg-[rgba(212,168,106,0.15)]",
        danger:
          "bg-[#f8e3e0] text-[var(--danger)] [data-theme='dark']_&:bg-[rgba(212,132,124,0.15)]",
        muted:
          "bg-[var(--surface-2)] text-[var(--ink-muted)] border border-[var(--border)]",
        outline:
          "bg-transparent border border-[var(--border)] text-[var(--ink-muted)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({ className, variant, dot, pulse, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full shrink-0",
            variant === "forest" || variant === "lime" ? "bg-[#173b2a]" : "bg-current",
            pulse && "animate-pulse"
          )}
        />
      )}
      {children}
    </span>
  );
}
