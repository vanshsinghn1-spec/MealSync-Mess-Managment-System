"use client";

import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
        success:
          "bg-[var(--accent-soft)] text-[var(--success)]",
        warning:
          "bg-[#FDF3E3] text-[var(--warning)] [data-theme='dark']_&:bg-[rgba(212,168,106,0.12)]",
        danger:
          "bg-[#F8E3E0] text-[var(--danger)] [data-theme='dark']_&:bg-[rgba(212,132,124,0.12)]",
        muted:
          "bg-[var(--surface-2)] text-[var(--ink-muted)]",
        outline:
          "bg-transparent border border-[var(--border)] text-[var(--ink-muted)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
