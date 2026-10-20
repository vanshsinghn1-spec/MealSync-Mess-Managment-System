"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Bell, AlertTriangle, Utensils, Megaphone, ShieldCheck, Mail, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Notification } from "@/types";

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "sac" | "admin">("all");
  const [isSimulating, setIsSimulating] = useState(false);

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

  useEffect(() => {
    if (session) {
      loadNotifications();
    }
  }, [session]);

  // Quick simulation trigger for testing Issue #1 live
  const handleSimulateSacEmail = async () => {
    try {
      setIsSimulating(true);
      await api.post("/notifications/simulate-sac", {
        subject: "Urgent: Menu change for Dinner today (Special Feast)",
        message: "Due to fresh vendor supply deliveries, Special Paneer Butter Masala, Butter Naan, and Gulab Jamun will be served instead of Mixed Veg Sabzi across Jasmine and Ashoka Mess.",
        from: "SAC Mess Affairs <mess.affairs@iiitdm.ac.in>"
      });
      await loadNotifications();
    } catch (err) {
      console.error("Error simulating SAC email:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Filter based on selected tab
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "all") return true;
    if (activeTab === "sac") {
      return notif.source === "sac_email" || notif.category === "sac_update" || notif.category === "menu_substitution" || notif.category === "emergency";
    }
    if (activeTab === "admin") {
      return notif.source === "admin" || (!notif.source && notif.category === "general");
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Page Title & Simulator Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl font-display">
            Announcements & Alerts
          </h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Real-time mess updates from SAC - Mess Affairs and administrative team
          </p>
        </div>

        {/* Demo / Test simulation button */}
        <button
          onClick={handleSimulateSacEmail}
          disabled={isSimulating}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-bold text-[var(--ink)] hover:bg-[var(--surface-3)] transition-all shadow-xs self-start sm:self-auto cursor-pointer disabled:opacity-50"
          title="Simulate receiving an official SAC mess update email"
        >
          <Mail size={14} className="text-[var(--accent)]" />
          <span>{isSimulating ? "Parsing..." : "Simulate SAC Email"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-[var(--ink)] text-[var(--bg)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
          }`}
        >
          All Updates ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab("sac")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === "sac"
              ? "bg-[#173b2a] text-[#d9f36b] dark:bg-[#d9f36b] dark:text-[#173b2a]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
          }`}
        >
          SAC Official
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === "admin"
              ? "bg-[var(--ink)] text-[var(--bg)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]"
          }`}
        >
          Admin Notices
        </button>
      </div>

      {/* List */}
      <Card padding="lg" className="min-h-[350px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-6 h-6 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {filteredNotifications.map((notif) => {
              const isUrgent = notif.priority === "urgent" || notif.category === "emergency";
              const isMenu = notif.category === "menu_substitution";
              const isSac = notif.source === "sac_email" || notif.category === "sac_update";

              return (
                <div key={notif._id} className="py-5 first:pt-0 last:pb-0 flex gap-4">
                  {/* Category icon */}
                  <div
                    className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-card ${
                      isUrgent
                        ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-600"
                        : isMenu
                        ? "bg-[#f4faee] dark:bg-[#152a1e] border-[#579169]/30 text-[#173b2a] dark:text-[#d9f36b]"
                        : isSac
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                        : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--accent)]"
                    }`}
                  >
                    {isUrgent ? (
                      <AlertTriangle size={18} />
                    ) : isMenu ? (
                      <Utensils size={18} />
                    ) : isSac ? (
                      <Megaphone size={18} />
                    ) : (
                      <Bell size={18} />
                    )}
                  </div>

                  {/* Body */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[var(--ink)] leading-snug">
                        {notif.title}
                      </h3>

                      {/* Badges */}
                      {isUrgent && (
                        <Badge variant="danger" className="text-[9px] uppercase font-extrabold px-2 py-0.5">
                          Urgent
                        </Badge>
                      )}
                      {isMenu && (
                        <Badge variant="success" className="text-[9px] uppercase font-bold px-2 py-0.5">
                          Menu Change
                        </Badge>
                      )}
                      {isSac && !isMenu && (
                        <Badge variant="outline" className="text-[9px] uppercase font-bold px-2 py-0.5 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
                          SAC Notice
                        </Badge>
                      )}
                      {notif.source === "sac_email" && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--ink-muted)] opacity-80">
                          <ShieldCheck size={11} className="text-emerald-500" />
                          <span>Verified SAC Email</span>
                        </span>
                      )}

                      <span className="text-[11px] text-[var(--ink-muted)] ml-auto font-medium">
                        {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-normal whitespace-pre-line">
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-[var(--ink-muted)]">
            <Bell size={40} className="stroke-[1.5] mb-3 text-[var(--ink-muted)]/50" />
            <p className="text-sm font-semibold">No alerts in this category.</p>
            <p className="text-xs mt-1 text-[var(--ink-muted)]/75">
              Official SAC mess announcements and admin notices will appear here.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
