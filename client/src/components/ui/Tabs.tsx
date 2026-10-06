"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  layoutId?: string;
}

export function Tabs({ items, value, onChange, className, layoutId = "tab-pill" }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)] max-w-full overflow-x-auto no-scrollbar shrink-0",
        className
      )}
    >
      {items.map((item) => {
        const isActive = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "relative inline-flex items-center gap-2 h-9 px-4 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer z-10",
              isActive ? "text-[var(--forest)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 rounded-full bg-[var(--surface)] shadow-[0_2px_8px_rgba(23,59,42,0.08)] -z-10"
              />
            )}
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
