"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "bg-[var(--surface)] border border-[var(--border)] shadow-[0_4px_20px_rgba(23,59,42,0.04)] transition-all duration-300",
  {
    variants: {
      variant: {
        default: "hover:shadow-[0_14px_45px_rgba(23,59,42,0.08)]",
        elevated: "shadow-[0_14px_45px_rgba(23,59,42,0.07)]",
        forest: "bg-[#173b2a] text-white border-white/10 shadow-xl",
        accent: "bg-[var(--forest)] text-white border-transparent",
        flat: "shadow-none",
      },
      radius: {
        md: "rounded-2xl",
        lg: "rounded-[1.75rem]",
        xl: "rounded-[2rem]",
      },
      padding: {
        none: "",
        sm: "p-4 sm:p-5",
        md: "p-6 sm:p-7",
        lg: "p-8 sm:p-10",
      },
    },
    defaultVariants: { variant: "default", radius: "lg", padding: "md" },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, radius, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, radius, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-start justify-between gap-3 mb-5", className)}
    {...props}
  />
);

export const CardTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-base sm:text-lg font-bold text-[var(--ink)] tracking-tight",
      className
    )}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed", className)} {...props} />
);

export const CardContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("", className)} {...props} />
);
