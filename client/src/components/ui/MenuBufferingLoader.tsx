"use client";

import React, { useEffect, useState } from "react";
import { UtensilsCrossed, Sparkles, ChefHat } from "lucide-react";

interface MenuBufferingLoaderProps {
  /** Variant of the loader layout */
  variant?: "grid" | "card" | "compact" | "weekly";
  /** Name of the meal being loaded (e.g. "Lunch", "Breakfast") */
  mealName?: string;
  /** Number of skeleton cards to render */
  count?: number;
  /** Additional container CSS class */
  className?: string;
}

export function MenuBufferingLoader({
  variant = "grid",
  mealName,
  count,
  className = "",
}: MenuBufferingLoaderProps) {
  const [isTakingTime, setIsTakingTime] = useState(false);

  // If loading exceeds 2.5 seconds (e.g. during a cold-start buffer), reassure the user
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTakingTime(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const cardCount = count || (variant === "compact" ? 3 : variant === "card" ? 4 : 6);

  // Compact variant: for sidebars, non-veg sections, or mini-widgets
  if (variant === "compact") {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--sage)] animate-pulse" />
            <span className="text-xs font-semibold text-[var(--ink-muted)]">
              Buffering items
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-1 rounded-full bg-[var(--sage)] animate-buffering-1" />
              <span className="size-1 rounded-full bg-[var(--sage)] animate-buffering-2" />
              <span className="size-1 rounded-full bg-[var(--sage)] animate-buffering-3" />
            </span>
          </div>
        </div>

        {Array.from({ length: cardCount }).map((_, idx) => (
          <div
            key={idx}
            className="animate-shimmer relative flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 overflow-hidden"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="size-4 rounded-md border border-[var(--border)] bg-[var(--surface)] shrink-0 flex items-center justify-center">
                <div className="size-2 rounded-full bg-[var(--border)]" />
              </div>
              <div className="h-3.5 rounded-md bg-[var(--border)] w-2/3" />
            </div>
            <div className="h-5 w-16 rounded-full bg-[var(--border)]/70 shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  // Weekly variant: calendar matrix shimmer
  if (variant === "weekly") {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Buffering Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center size-10 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <ChefHat className="size-5 text-[var(--sage)] animate-pulse" />
              <div className="absolute inset-0 rounded-xl border-2 border-transparent border-t-[var(--sage)] animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--ink)]">
                <span>Buffering Weekly Schedule</span>
                <span className="inline-flex items-center gap-1 ml-1">
                  <span className="size-1.5 rounded-full bg-[var(--sage)] animate-buffering-1" />
                  <span className="size-1.5 rounded-full bg-[var(--sage)] animate-buffering-2" />
                  <span className="size-1.5 rounded-full bg-[var(--sage)] animate-buffering-3" />
                </span>
              </div>
              <p className="text-xs text-[var(--ink-muted)]">
                Organizing meals across days and dietary preferences
              </p>
            </div>
          </div>
          {isTakingTime && (
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface)] border border-[var(--sage)]/30 px-3.5 py-1 text-[11px] font-semibold text-[var(--sage)]">
              <span className="size-2 rounded-full bg-[var(--lime)] animate-ping" />
              <span>Fetching from database...</span>
            </div>
          )}
        </div>

        {/* Calendar days skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-shimmer relative rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3 overflow-hidden"
            >
              <div className="h-3 rounded-md bg-[var(--border)] w-1/2" />
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <div className="h-3 rounded-md bg-[var(--border)]/80 w-3/4" />
                <div className="h-3 rounded-md bg-[var(--border)]/60 w-2/3" />
                <div className="h-3 rounded-md bg-[var(--border)]/70 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid & Card variants: used for landing page and today's menu
  return (
    <div className={`space-y-5 ${className}`}>
      {/* Central Buffering Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-r from-[var(--surface-2)] via-[var(--surface)] to-[var(--surface-2)] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Spinning/pulsing aura badge */}
            <div className="relative flex items-center justify-center size-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] shadow-inner shrink-0">
              <UtensilsCrossed className="size-5 text-[var(--sage)] animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-[var(--sage)] border-r-[var(--lime)] animate-spin" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--ink)]">
                  Buffering {mealName ? `${mealName} Menu` : "Today's Menu"}
                </span>
                <span className="inline-flex items-center gap-1.5 ml-0.5">
                  <span className="size-1.5 rounded-full bg-[var(--sage)] animate-buffering-1" />
                  <span className="size-1.5 rounded-full bg-[var(--sage)] animate-buffering-2" />
                  <span className="size-1.5 rounded-full bg-[var(--sage)] animate-buffering-3" />
                </span>
              </div>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                Fetching fresh dining schedule, items & allergen info
              </p>
            </div>
          </div>

          {/* Dynamic Reassurance Tag for cold-start buffering */}
          {isTakingTime ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sage)]/35 bg-[var(--surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--sage)] shadow-sm self-start sm:self-auto">
              <span className="size-2 rounded-full bg-[var(--lime)] animate-ping" />
              <span>Connecting to mess server container...</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] font-semibold text-[var(--ink-muted)] self-start sm:self-auto">
              <Sparkles className="size-3 text-[var(--sage)]" />
              <span>Live Dining Feed</span>
            </div>
          )}
        </div>
      </div>

      {/* Shimmer Dish Card Grid */}
      <div
        className={`grid gap-3 ${
          variant === "card"
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {Array.from({ length: cardCount }).map((_, idx) => (
          <div
            key={idx}
            className="animate-shimmer relative flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Veg / Non-veg indicator dot placeholder */}
              <div className="size-4.5 rounded-md border border-[var(--border)] bg-[var(--surface)] shrink-0 flex items-center justify-center">
                <div className="size-2 rounded-full bg-[var(--border)]" />
              </div>
              {/* Dish title and category lines */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div
                  className="h-3.5 rounded-md bg-[var(--border)]"
                  style={{ width: `${60 + ((idx * 17) % 35)}%` }}
                />
                <div className="h-2 rounded-md bg-[var(--border)]/60 w-1/3" />
              </div>
            </div>
            {/* Optional price or rating placeholder */}
            <div className="h-4 w-10 rounded-full bg-[var(--border)]/50 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
