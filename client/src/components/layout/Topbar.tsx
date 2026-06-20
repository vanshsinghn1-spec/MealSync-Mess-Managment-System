"use client";

import { Sun, Moon } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSession } from "next-auth/react";

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="flex items-start justify-between gap-6 mb-8">
      <div>
        <h1 className="font-display text-[clamp(28px,3vw,38px)] font-semibold leading-tight text-[var(--ink)]">
          {greeting}, {firstName}.
        </h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1">
          Manage your mess, menus, and meals — all in one place.
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <IconButton onClick={toggle} title="Toggle theme">
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </IconButton>
      </div>
    </header>
  );
}
