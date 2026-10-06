"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sage)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--forest)] text-white hover:bg-[var(--forest-hover)] shadow-sm",
        forest:
          "bg-[#173b2a] text-white hover:bg-[#24563e] shadow-sm",
        lime:
          "bg-[#d9f36b] text-[#173b2a] font-bold hover:bg-[#cbf052] shadow-sm",
        primary:
          "bg-[var(--forest)] text-white hover:bg-[var(--forest-hover)] shadow-sm",
        accent:
          "bg-[var(--sage)] text-white hover:opacity-90 shadow-sm",
        outline:
          "bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--surface-2)]",
        secondary:
          "bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--border)]",
        ghost:
          "bg-transparent text-[var(--ink)] hover:bg-[var(--surface-2)]",
        soft:
          "bg-[var(--sage-soft)] text-[var(--forest)] hover:bg-[var(--sage-soft)]/80 font-semibold",
        destructive:
          "bg-[var(--danger)] text-white hover:opacity-90",
        danger:
          "bg-transparent text-[var(--danger)] hover:bg-[var(--danger)]/10",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-full",
        sm: "h-8 px-3.5 text-xs rounded-full",
        md: "h-10 px-4.5 text-sm rounded-full",
        lg: "h-12 px-6 text-sm font-semibold rounded-full",
        xl: "h-14 px-8 text-base font-bold rounded-full",
        icon: "h-10 w-10 rounded-full",
        iconSm: "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
