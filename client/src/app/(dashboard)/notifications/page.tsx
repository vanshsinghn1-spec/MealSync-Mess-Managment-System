"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Bell, Info, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      loadNotifications();
    }
  }, [session]);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl font-display">Announcements</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1">Announcements and alerts posted by administrative team</p>
      </div>

      {/* List */}
      <Card padding="lg" className="min-h-[350px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-6 h-6 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {notifications.map((notif) => (
              <div key={notif._id} className="py-5 first:pt-0 last:pb-0 flex gap-4">
                <div className="w-9 h-9 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 text-[var(--accent)] shadow-card">
                  <Bell size={16} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-sm font-bold text-[var(--ink)]">{notif.title}</h3>
                    <Badge variant="muted" className="text-[9px] uppercase font-bold px-2 py-0.5">
                      {new Date(notif.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-normal">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--ink-muted)]">
            <Bell size={40} className="stroke-[1.5] mb-3 text-[var(--ink-muted)]/50" />
            <p className="text-sm font-semibold">No alerts posted recently.</p>
            <p className="text-xs mt-1 text-[var(--ink-muted)]/75">All student dining updates will be listed here.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

