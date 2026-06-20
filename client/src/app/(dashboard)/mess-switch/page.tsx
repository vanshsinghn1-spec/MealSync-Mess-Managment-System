"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { ArrowLeftRight, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";

export default function MessSwitchPage() {
  const { data: session } = useSession();
  const userMessId = (session?.user as any)?.messId;
  const userMessName = userMessId?.name || "Your Mess";

  const [messes, setMesses] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [reason, setReason] = useState("");
  
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSwitchData = async () => {
    try {
      setLoading(true);
      
      // 1. Get switch status
      const statusRes = await api.get("/mess-switch/status");
      setSwitchEnabled(statusRes.data.isEnabled);

      // 2. Get all messes
      const messesRes = await api.get("/messes");
      // Filter out user's current mess
      const filtered = messesRes.data.filter((m: any) => m._id !== userMessId?._id && m._id !== userMessId && m.name !== userMessName);
      setMesses(filtered);
      if (filtered.length > 0) {
        setSelectedTarget(filtered[0]._id);
      }

      // 3. Get user request history
      const historyRes = await api.get("/mess-switch/my");
      setRequests(historyRes.data);
    } catch (err) {
      console.error("Error loading mess-switch details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadSwitchData();
    }
  }, [session, userMessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      await api.post("/mess-switch", {
        toMess: selectedTarget,
        reason
      });

      setSuccess(true);
      setReason("");
      loadSwitchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit switch request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl font-display">Mess Allocation Switch</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1">Submit reallocation requests between Mess Sai and Mess Sheila</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Switch Request Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card padding="lg">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-[var(--ink)] uppercase tracking-wide font-display">New Reallocation Request</h3>
                <p className="text-xs text-[var(--ink-muted)] mt-0.5">Currently dining in: <span className="text-[var(--accent)] font-semibold">{userMessName}</span></p>
              </div>
              <Badge variant={switchEnabled ? "success" : "danger"} className="px-3 py-1 font-bold text-[10px] uppercase">
                {switchEnabled ? "Active" : "Closed"}
              </Badge>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <span className="w-6 h-6 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
              </div>
            ) : switchEnabled ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Target Mess */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider">Target Mess Hall</label>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--accent)] rounded-2xl px-4 py-3 text-xs outline-none text-[var(--ink)] transition-colors duration-200"
                  >
                    {messes.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.location})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reason */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider">Reason for Request</label>
                  <textarea
                    required
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a detailed explanation (e.g. food preferences, class schedules, medical needs)..."
                    className="w-full bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--accent)] rounded-2xl p-4 text-xs text-[var(--ink)] outline-none transition-colors duration-200 resize-none"
                  />
                </div>

                {success && (
                  <div className="p-3.5 bg-[var(--accent-soft)] text-[var(--success)] text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    <span>Mess switch request submitted successfully. It will be reviewed by the administrator shortly.</span>
                  </div>
                )}

                {error && (
                  <div className="p-3.5 bg-[var(--danger)]/10 text-[var(--danger)] text-xs rounded-xl flex items-center gap-2">
                    <XCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting || !selectedTarget}
                  variant="accent"
                  className="px-6 py-3 text-xs font-bold rounded-2xl shadow-sm"
                >
                  {submitting ? "Submitting..." : "Submit Reallocation Request"}
                  <ArrowLeftRight size={14} />
                </Button>

              </form>
            ) : (
              <div className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl flex items-start gap-2.5 text-xs text-[var(--ink-muted)]">
                <AlertCircle size={16} className="text-[var(--ink-muted)]/65 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[var(--ink)]">Reallocation Window Closed:</span> Mess switching requests are currently deactivated by the administration. Check back later or contact the student mess committee.
                </div>
              </div>
            )}
          </Card>

        </div>

        {/* Right Column: Request History List */}
        <div className="space-y-6">
          <Card padding="lg">
            <h3 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider font-display mb-4">Reallocation History</h3>
            <hr className="border-[var(--border)] mb-4" />

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-6 text-[var(--ink-muted)] text-xs">Loading requests...</div>
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <div key={req._id} className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl space-y-3 hover:border-[var(--accent)]/30 transition-all duration-200 group">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        {req.status === "approved" && <CheckCircle2 size={14} className="text-[var(--success)]" />}
                        {req.status === "pending" && <Clock size={14} className="text-[var(--warning)] animate-pulse" />}
                        {req.status === "rejected" && <XCircle size={14} className="text-[var(--danger)]" />}
                        <span className="font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">To {req.toMess?.name}</span>
                      </div>
                      <Badge variant={req.status === "approved" ? "success" : req.status === "rejected" ? "danger" : "muted"}>
                        {req.status}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-[var(--ink-muted)] font-normal leading-relaxed">
                      Reason: "{req.reason}"
                    </p>

                    {req.adminNote && (
                      <div className="text-[10px] bg-[var(--surface)] p-2.5 rounded-xl border border-[var(--border)] text-[var(--ink-muted)]">
                        <span className="font-bold text-[var(--ink-muted)]/75 uppercase tracking-wider text-[8px] block mb-0.5">Admin Note</span>
                        "{req.adminNote}"
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-[var(--ink-muted)] text-xs">No switch history recorded.</div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

