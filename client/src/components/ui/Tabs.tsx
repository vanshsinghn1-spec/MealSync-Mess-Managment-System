"use client";

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
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-full bg-[var(--surface-2)] border border-[var(--border)]",
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "relative inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[13px] font-medium transition-all duration-200",
            value === item.value
              ? "bg-[var(--surface)] text-[var(--ink)] shadow-card"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
