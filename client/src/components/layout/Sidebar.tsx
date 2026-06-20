"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  Star,
  MessageSquare,
  ArrowLeftRight,
  ShieldCheck,
  BarChart3,
  Bell,
  LogOut,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/menu/today", label: "Today's Menu", icon: UtensilsCrossed },
  { href: "/menu/weekly", label: "Weekly Menu", icon: CalendarDays },
  { href: "/ratings", label: "Rate Meal", icon: Star, roles: ["student"] },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/mess-switch", label: "Mess Switch", icon: ArrowLeftRight, roles: ["student"] },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/admin", label: "Admin Panel", icon: ShieldCheck, roles: ["admin"] },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, roles: ["admin"] },
];

const ROW_BASE =
  "relative flex items-center h-11 w-11 rounded-2xl overflow-hidden " +
  "group-hover/sidebar:w-[200px] " +
  "transition-[width,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";

const LABEL_BASE =
  "text-sm font-medium whitespace-nowrap pr-4 " +
  "opacity-0 -translate-x-1 " +
  "transition-[opacity,transform] duration-200 ease-out " +
  "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:delay-100";

function NavItemRow({ href, icon: Icon, label, isActive, onClick }: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href={href} title={label} className="block" onClick={onClick}>
      <div
        className={cn(
          ROW_BASE,
          isActive
            ? "bg-[var(--ink)] text-[var(--bg)] shadow-card"
            : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        )}
      >
        <span className="h-11 w-11 flex items-center justify-center shrink-0">
          <Icon size={18} strokeWidth={2} />
        </span>
        <span className={LABEL_BASE}>{label}</span>
      </div>
    </Link>
  );
}

function MobileNavItem({ href, icon: Icon, label, isActive, onClick }: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
        isActive
          ? "bg-[var(--ink)] text-[var(--bg)]"
          : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
      )}
    >
      <Icon size={18} strokeWidth={2} />
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRole = (session?.user as Record<string, unknown>)?.role as string;
  const userName = session?.user?.name || "User";

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 h-10 w-10 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-card flex items-center justify-center text-[var(--ink)] md:hidden"
        id="mobile-menu-btn"
      >
        <Menu size={18} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-transform duration-300 md:hidden p-3",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-2 py-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[var(--accent)] flex items-center justify-center">
              <UtensilsCrossed size={18} className="text-white" />
            </div>
            <span className="font-display text-[15px] font-semibold tracking-tight text-[var(--ink)]">
              MealSync
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-2)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mobile Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <MobileNavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                onClick={() => setMobileOpen(false)}
              />
            );
          })}
        </nav>

        {/* Mobile Footer */}
        <div className="border-t border-[var(--border)] pt-3 space-y-1">
          <MobileNavItem
            href="/profile"
            icon={Settings}
            label="Profile"
            isActive={pathname === "/profile"}
            onClick={() => setMobileOpen(false)}
          />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors w-full"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar — Collapsible Icon Sidebar */}
      <aside
        className={cn(
          "group/sidebar hidden md:flex shrink-0 h-[calc(100vh-32px)] sticky top-4 ml-4",
          "flex-col items-center justify-between py-5 rounded-3xl",
          "bg-[var(--surface)] border border-[var(--border)] shadow-card overflow-hidden",
          "w-[88px] hover:w-[248px]",
          "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        )}
      >
        {/* Top: Logo + Nav */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo */}
          <div
            className={cn(
              "flex items-center h-14 w-14 group-hover/sidebar:w-[200px]",
              "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            )}
          >
            <div className="h-11 w-11 flex items-center justify-center shrink-0">
              <div className="h-9 w-9 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                <UtensilsCrossed size={18} className="text-white" />
              </div>
            </div>
            <span
              className={cn(
                "ml-1 font-display text-base font-semibold text-[var(--ink)] whitespace-nowrap",
                "opacity-0 -translate-x-1",
                "transition-[opacity,transform] duration-200 ease-out",
                "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:delay-100"
              )}
            >
              MealSync
            </span>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col items-center gap-1.5">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <NavItemRow
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive}
                />
              );
            })}
          </nav>
        </div>

        {/* Bottom: Settings, Logout, Avatar */}
        <div className="flex flex-col items-center gap-2 w-full">
          {/* Profile / Settings */}
          <Link href="/profile" title="Profile" className="block">
            <div
              className={cn(
                ROW_BASE,
                pathname === "/profile"
                  ? "bg-[var(--ink)] text-[var(--bg)] shadow-card"
                  : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              )}
            >
              <span className="h-11 w-11 flex items-center justify-center shrink-0">
                <Settings size={18} strokeWidth={2} />
              </span>
              <span className={LABEL_BASE}>Profile</span>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Log out"
            className="block"
          >
            <div
              className={cn(
                ROW_BASE,
                "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              )}
            >
              <span className="h-11 w-11 flex items-center justify-center shrink-0">
                <LogOut size={18} strokeWidth={2} />
              </span>
              <span className={LABEL_BASE}>Log out</span>
            </div>
          </button>

          {/* User Avatar */}
          <div
            className={cn(
              "flex items-center h-12 mt-1 w-10 group-hover/sidebar:w-[200px] overflow-hidden",
              "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            )}
          >
            <div className="h-10 w-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)] font-semibold flex items-center justify-center text-sm ring-2 ring-[var(--surface)] shrink-0">
              {userName[0]?.toUpperCase() || "U"}
            </div>
            <div
              className={cn(
                "ml-3 min-w-0 flex-1",
                "opacity-0 -translate-x-1",
                "transition-[opacity,transform] duration-200 ease-out",
                "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:delay-100"
              )}
            >
              <div className="text-sm font-semibold text-[var(--ink)] truncate">
                {userName}
              </div>
              <div className="text-[11px] text-[var(--ink-muted)] truncate capitalize">
                {userRole?.replace("_", " ") || "Student"}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
