"use client";

import { Sun, Moon, Utensils, Clock3 } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { getLiveServingMeal } from "@/lib/utils";

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Determine currently active live meal
  const currentMealName = getLiveServingMeal();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)] leading-tight">
          {greeting}, {firstName}.
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-1">
          Manage your mess schedules, food ratings, and meal feedback.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
        {/* Live meal pill */}
        {currentMealName && (
          <Link
            href="/menu/today"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e6eee3] dark:bg-[rgba(87,145,105,0.2)] border border-[#579169]/30 text-xs font-bold text-[#173b2a] dark:text-[#d9f36b] hover:opacity-90 transition-opacity"
          >
            <span className="size-2 rounded-full bg-[#579169] animate-pulse" />
            <span>{currentMealName} is Live</span>
          </Link>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title="Toggle theme"
          className="size-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-all cursor-pointer"
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </div>
    </header>
  );
}
