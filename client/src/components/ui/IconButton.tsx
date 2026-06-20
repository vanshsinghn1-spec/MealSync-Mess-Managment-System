"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "h-10 w-10 rounded-full flex items-center justify-center",
      "bg-[var(--surface)] border border-[var(--border)] shadow-card",
      "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:shadow-hover",
      "transition-all duration-200",
      className
    )}
    {...props}
  />
));
IconButton.displayName = "IconButton";
