"use client";

import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--surface-2)] rounded-2xl",
        className
      )}
      {...props}
    />
  );
}
