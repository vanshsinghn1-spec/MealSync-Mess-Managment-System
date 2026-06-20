"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center">
            <div className="w-5 h-5 rounded-lg bg-[var(--accent)]/50 animate-pulse" />
          </div>
          <p className="text-sm text-[var(--ink-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg)] p-2 md:p-4 gap-0 md:gap-0">
      <Sidebar />
      <main className="flex-1 px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
        <Topbar />
        {children}
      </main>
    </div>
  );
}
