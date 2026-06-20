"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { User, Mail, Phone, Building, GraduationCap, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load details from session
  useEffect(() => {
    if (session?.user) {
      setFullName(session.user.name || "");
      // Fetch profile data for details
      async function getProfile() {
        try {
          const res = await api.get("/auth/me");
          setPhone(res.data.user.phone || "");
        } catch (e) {
          console.error(e);
        }
      }
      getProfile();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const res = await api.put("/auth/profile", {
        fullName,
        phone
      });

      // Update next-auth session data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: res.data.user.fullName
        }
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile settings.");
    } finally {
      setSubmitting(false);
    }
  };

  const userRole = (session?.user as any)?.role || "student";
  const userRoll = (session?.user as any)?.rollNumber;
  const userMess = (session?.user as any)?.messId?.name || "Mess Sai";

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl font-display">My Profile Settings</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1">Manage your account profile details and communications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Summary card */}
        <Card padding="lg" className="text-center space-y-4 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[var(--accent-soft)] border border-[var(--border)] flex items-center justify-center text-[var(--accent-strong)] font-extrabold text-2xl shadow-card">
            {fullName ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "ME"}
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--ink)] font-display">{fullName || "User"}</h2>
            <Badge variant="muted" className="mt-1.5 uppercase tracking-wide text-[9px]">
              {userRole.replace("_", " ")}
            </Badge>
          </div>
          
          <hr className="w-full border-[var(--border)]" />
          
          <div className="w-full text-left space-y-3 text-xs text-[var(--ink-muted)] font-normal">
            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-[var(--ink-muted)]/60" />
              <span className="truncate">{session?.user?.email}</span>
            </div>
            {userRole === "student" && (
              <>
                <div className="flex items-center gap-2.5">
                  <GraduationCap size={14} className="text-[var(--ink-muted)]/60" />
                  <span>Roll: {userRoll || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building size={14} className="text-[var(--ink-muted)]/60" />
                  <span>Mess: {userMess}</span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Right Col: Forms editor (2 columns) */}
        <Card padding="lg" className="md:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider font-display">Edit Account Information</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]/50" size={16} />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--accent)] rounded-2xl py-3.5 pl-12 pr-4 text-xs text-[var(--ink)] outline-none transition-colors duration-200"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]/50" size={16} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--accent)] rounded-2xl py-3.5 pl-12 pr-4 text-xs text-[var(--ink)] outline-none transition-colors duration-200"
                />
              </div>
            </div>

            {success && (
              <div className="p-3 bg-[var(--accent-soft)] text-[var(--success)] text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-[var(--danger)]/10 text-[var(--danger)] text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              variant="accent"
              className="px-6 py-3 text-xs font-bold rounded-2xl shadow-sm"
            >
              {submitting ? "Updating..." : "Save Profile Details"}
              <Save size={14} />
            </Button>

          </form>
        </Card>
      </div>
    </div>
  );
}

