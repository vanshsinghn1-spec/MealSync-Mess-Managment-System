"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  ChevronRight,
  Bell,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Users,
  Info
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";

export default function AdminPanelPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [switchEnabled, setSwitchEnabled] = useState(false);
  
  // Notification form
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [recipient, setRecipient] = useState("all");
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Switch request list
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Process note state
  const [adminNote, setAdminNote] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const dashboardRes = await api.get("/admin/dashboard");
      setStats(dashboardRes.data);

      const statusRes = await api.get("/mess-switch/status");
      setSwitchEnabled(statusRes.data.isEnabled);

      const switchRes = await api.get("/admin/switch-requests?status=pending");
      setRequests(switchRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadAdminData();
    }
  }, [session]);

  const handleToggleSwitch = async () => {
    try {
      const newStatus = !switchEnabled;
      await api.put(`/admin/feature-toggle/mess_switching`, { isEnabled: newStatus });
      setSwitchEnabled(newStatus);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMsg) return;

    try {
      setNotifLoading(true);
      await api.post("/admin/notifications", {
        title: notifTitle,
        message: notifMsg,
        recipientType: recipient
      });
      setNotifSuccess(true);
      setNotifTitle("");
      setNotifMsg("");
      setTimeout(() => setNotifSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleProcessRequest = async (requestId: string, action: "approved" | "rejected") => {
    try {
      await api.put(`/admin/switch-requests/${requestId}`, {
        status: action,
        adminNote: adminNote || `Request ${action} by administrator.`
      });
      setAdminNote("");
      setSelectedRequestId(null);
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl font-display">Admin Control Center</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1">Configure system variables, manage switch requests, and post alerts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns: switch requests */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card padding="lg" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--accent)]/5 rounded-full blur-2xl" />
              <h4 className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-wider font-display">Active Students</h4>
              <div className="text-3xl font-extrabold text-[var(--ink)] mt-1 font-display">
                {stats ? stats.totalStudents : 0}
              </div>
            </Card>
            <Card padding="lg" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--accent)]/5 rounded-full blur-2xl" />
              <h4 className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-wider font-display">Aggregate Rating</h4>
              <div className="text-3xl font-extrabold text-amber-500 mt-1 font-display">
                {stats ? stats.avgRating : 0}★
              </div>
            </Card>
            <Card padding="lg" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--accent)]/5 rounded-full blur-2xl" />
              <h4 className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-wider font-display">Pending Switches</h4>
              <div className="text-3xl font-extrabold text-[var(--accent)] mt-1 font-display">
                {stats ? stats.pendingRequests : 0}
              </div>
            </Card>
          </div>

          {/* Switch Request approvals list */}
          <Card padding="lg">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-[var(--ink)] uppercase tracking-wide font-display">Dining Switch Approvals</h3>
                <p className="text-xs text-[var(--ink-muted)] mt-0.5">Reassign student dining messes based on request reasons</p>
              </div>
              <Badge variant="default" className="text-[10px] font-bold">
                {requests.length} Requests
              </Badge>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <span className="w-6 h-6 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
              </div>
            ) : requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div key={req._id} className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl space-y-3 hover:border-[var(--accent)]/30 transition-all duration-200 group">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">{req.studentId?.fullName}</span>
                        <span className="text-[var(--ink-muted)]/30 mx-2">|</span>
                        <span className="text-[var(--ink-muted)]">{req.studentId?.rollNumber}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-[var(--ink-muted)]">{req.fromMess?.name}</span>
                        <ChevronRight size={10} className="text-[var(--ink-muted)]/60" />
                        <span className="text-[var(--accent-strong)] font-semibold">{req.toMess?.name}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--ink-muted)] font-normal bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]">
                      Reason: "{req.reason || "No reason provided."}"
                    </p>

                    {selectedRequestId === req._id ? (
                      <div className="space-y-3 pt-2">
                        <input
                          type="text"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Add optional note/comment..."
                          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-xs outline-none text-[var(--ink)] focus:border-[var(--accent)] transition-all duration-200"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => setSelectedRequestId(null)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleProcessRequest(req._id, "rejected")}
                            className="bg-[var(--danger)] hover:bg-[var(--danger)]/90 text-white font-bold"
                            size="sm"
                          >
                            Reject Request
                          </Button>
                          <Button
                            onClick={() => handleProcessRequest(req._id, "approved")}
                            variant="accent"
                            size="sm"
                          >
                            Approve Request
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <Button
                          onClick={() => setSelectedRequestId(req._id)}
                          variant="outline"
                          size="sm"
                        >
                          Review Request
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--ink-muted)] text-xs">
                No reallocation requests pending.
              </div>
            )}
          </Card>

        </div>

        {/* Right column: controls & announcements */}
        <div className="space-y-6">
          
          {/* Switching Toggle */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider font-display">Switch Settings</h3>
                <p className="text-xs text-[var(--ink-muted)] mt-0.5">Toggle switch submissions status</p>
              </div>
              <button onClick={handleToggleSwitch} className="text-[var(--accent)] hover:opacity-85 transition-opacity cursor-pointer">
                {switchEnabled ? <ToggleRight size={38} /> : <ToggleLeft size={38} className="text-[var(--ink-muted)]/50" />}
              </button>
            </div>
            <div className="p-3.5 bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] flex items-start gap-2.5 text-[11px] leading-relaxed text-[var(--ink-muted)]">
              <Info size={15} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
              <div>
                {switchEnabled
                  ? "Switching portal is OPEN. Students can request dining switches."
                  : "Switching portal is CLOSED. Request submissions are disabled."}
              </div>
            </div>
          </Card>

          {/* Broadcast Form */}
          <Card padding="lg">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wide font-display">Broadcast Message</h3>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">Post system-wide alert or notice banner</p>
            </div>

            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase">Target Audience</label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-3 py-2 text-xs outline-none text-[var(--ink)] focus:border-[var(--accent)] transition-all duration-200"
                >
                  <option value="all">Everyone</option>
                  <option value="students">Students Only</option>
                  <option value="mess_officials">Officials Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Server Maintenance Scheduled"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-3 py-2 text-xs outline-none text-[var(--ink)] focus:border-[var(--accent)] transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase">Alert Message</label>
                <textarea
                  required
                  rows={3}
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  placeholder="Details of the announcement..."
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-3 py-2 text-xs outline-none text-[var(--ink)] focus:border-[var(--accent)] transition-all duration-200 resize-none"
                />
              </div>

              {notifSuccess && (
                <div className="p-3 bg-[var(--accent-soft)] text-[var(--success)] text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>Announcement broadcasted successfully!</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={notifLoading}
                variant="accent"
                className="w-full py-3 text-xs font-bold rounded-2xl shadow-sm"
              >
                {notifLoading ? "Publishing..." : "Broadcast Alert"}
              </Button>
            </form>
          </Card>

        </div>
      </div>
    </div>
  );
}
