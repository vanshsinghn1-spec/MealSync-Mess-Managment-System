"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Utensils,
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
  { href: "/menu/today", label: "Today's Menu", icon: Utensils },
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
  "group-hover/sidebar:w-[208px] " +
  "transition-[width,background-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer";

const LABEL_BASE =
  "text-sm font-semibold whitespace-nowrap pr-4 " +
  "opacity-0 -translate-x-1 " +
  "transition-[opacity,transform] duration-200 ease-out " +
  "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:delay-100";

function NavItemRow({
  href,
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
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
            ? "bg-[#173b2a] text-[#d9f36b] shadow-md dark:bg-[#1f4935] dark:text-[#d9f36b]"
            : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        )}
      >
        <span className="h-11 w-11 flex items-center justify-center shrink-0">
          <Icon size={19} strokeWidth={2.2} />
        </span>
        <span className={LABEL_BASE}>{label}</span>
      </div>
    </Link>
  );
}

function MobileNavItem({
  href,
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
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
        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
        isActive
          ? "bg-[#173b2a] text-[#d9f36b] shadow-sm"
          : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
      )}
    >
      <Icon size={19} strokeWidth={2.2} />
      <span>{label}</span>
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
      {/* Mobile Menu Hamburger Trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 h-11 w-11 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-md flex items-center justify-center text-[var(--ink)] md:hidden cursor-pointer"
        id="mobile-menu-btn"
        aria-label="Open sidebar menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-transform duration-300 md:hidden p-4 shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-2 py-3 mb-4 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#173b2a] text-[#d9f36b] shadow-sm">
              <Utensils size={18} />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[var(--ink)] block leading-none">
                MealSync
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[var(--ink-muted)] font-semibold">
                IIITDM Portal
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="size-9 rounded-xl flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-2)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
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
        <div className="border-t border-[var(--border)] pt-4 space-y-2">
          <MobileNavItem
            href="/profile"
            icon={Settings}
            label="Profile"
            isActive={pathname === "/profile"}
            onClick={() => setMobileOpen(false)}
          />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#cf4f45] hover:bg-[#cf4f45]/10 transition-colors w-full cursor-pointer"
          >
            <LogOut size={19} strokeWidth={2.2} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar — Sleek Collapsible Dock */}
      <aside
        className={cn(
          "group/sidebar hidden md:flex shrink-0 h-[calc(100vh-32px)] sticky top-4 ml-4",
          "flex-col items-center justify-between py-6 rounded-[2rem]",
          "bg-[var(--surface)] border border-[var(--border)] shadow-[0_14px_45px_rgba(23,59,42,0.06)] overflow-hidden",
          "w-[90px] hover:w-[250px]",
          "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-30"
        )}
      >
        {/* Top: Brand Logo + Nav Items */}
        <div className="flex flex-col items-center gap-6 w-full px-4">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "flex items-center h-12 w-full",
              "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            )}
          >
            <div className="h-11 w-11 flex items-center justify-center shrink-0">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#173b2a] text-[#d9f36b] shadow-sm">
                <Utensils size={19} />
              </div>
            </div>
            <span
              className={cn(
                "ml-3 font-bold text-base text-[var(--ink)] tracking-tight whitespace-nowrap",
                "opacity-0 -translate-x-1",
                "transition-[opacity,transform] duration-200 ease-out",
                "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:delay-100"
              )}
            >
              MealSync
            </span>
          </Link>

          {/* Nav List */}
          <nav className="flex flex-col items-center gap-1.5 w-full">
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

        {/* Bottom: Settings, Logout, User Card */}
        <div className="flex flex-col items-center gap-2 w-full px-4 border-t border-[var(--border)] pt-4">
          {/* Profile */}
          <Link href="/profile" title="Profile" className="block w-full">
            <div
              className={cn(
                ROW_BASE,
                pathname === "/profile"
                  ? "bg-[#173b2a] text-[#d9f36b] shadow-md"
                  : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              )}
            >
              <span className="h-11 w-11 flex items-center justify-center shrink-0">
                <Settings size={19} strokeWidth={2.2} />
              </span>
              <span className={LABEL_BASE}>Profile</span>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Log out"
            className="block w-full"
          >
            <div
              className={cn(
                ROW_BASE,
                "text-[var(--ink-muted)] hover:bg-[#cf4f45]/10 hover:text-[#cf4f45]"
              )}
            >
              <span className="h-11 w-11 flex items-center justify-center shrink-0">
                <LogOut size={19} strokeWidth={2.2} />
              </span>
              <span className={LABEL_BASE}>Log out</span>
            </div>
          </button>

          {/* User Avatar & Name Tag */}
          <div
            className={cn(
              "flex items-center h-12 mt-2 w-full overflow-hidden rounded-2xl bg-[var(--surface-2)] p-1",
              "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            )}
          >
            <div className="size-9 rounded-xl bg-[#173b2a] text-[#d9f36b] font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
              {userName[0]?.toUpperCase() || "U"}
            </div>
            <div
              className={cn(
                "ml-2.5 min-w-0 flex-1",
                "opacity-0 -translate-x-1",
                "transition-[opacity,transform] duration-200 ease-out",
                "group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0 group-hover/sidebar:delay-100"
              )}
            >
              <div className="text-xs font-bold text-[var(--ink)] truncate">
                {userName}
              </div>
              <div className="text-[10px] text-[var(--ink-muted)] truncate capitalize">
                {userRole?.replace("_", " ") || "Student"}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
