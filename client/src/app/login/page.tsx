"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Utensils,
  AlertTriangle,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { DarkPanel } from "@/components/ui/DarkPanel";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!email.toLowerCase().endsWith("@iiitdm.ac.in")) {
      setError("Only @iiitdm.ac.in institutional emails are authorized.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected authentication error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] p-3 sm:p-5 gap-0 lg:gap-6 selection:bg-[#d9f36b] selection:text-[#173b2a]">
      {/* Left — Clean Branded Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Logo */}
          <div className="mb-8 sm:mb-10">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#173b2a] text-[#d9f36b] shadow-md transition-transform group-hover:scale-105">
                <Utensils className="size-6" />
              </span>
              <div>
                <span className="block text-xl font-extrabold tracking-tight text-[var(--ink)]">
                  MealSync
                </span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                  IIITDM Kancheepuram
                </span>
              </div>
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)] leading-tight">
            Welcome back.
          </h1>
          <p className="text-[var(--ink-muted)] mt-2 text-sm sm:text-base">
            Sign in with your institute account to manage meals, ratings, and mess allocations.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-2 block">
                Institute Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rollnumber@iiitdm.ac.in"
                  autoComplete="email"
                  className="peer w-full h-12 pl-11 pr-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/50 outline-none transition-all focus:border-[#579169] focus:ring-4 focus:ring-[#579169]/15 shadow-sm"
                />
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]/60 peer-focus:text-[#173b2a] transition-colors">
                  <Mail size={16} />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="peer w-full h-12 pl-11 pr-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/50 outline-none transition-all focus:border-[#579169] focus:ring-4 focus:ring-[#579169]/15 shadow-sm"
                />
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]/60 peer-focus:text-[#173b2a] transition-colors">
                  <KeyRound size={16} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 text-xs text-[#cf4f45] bg-[#f8e3e0] dark:bg-[rgba(207,79,69,0.15)] rounded-2xl p-3.5 leading-snug font-medium"
              >
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-2xl bg-[#173b2a] text-[#d9f36b] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(23,59,42,0.25)] hover:bg-[#24563e] active:scale-[0.985] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span className="text-white">Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Notice */}
          <div className="mt-8 rounded-2xl bg-[var(--surface-2)] p-4 border border-[var(--border)] text-xs text-[var(--ink-muted)] flex items-start gap-3">
            <ShieldCheck size={16} className="text-[#579169] shrink-0 mt-0.5" />
            <p>
              Only registered students, mess committee members, and SAC administrators can access the dining portal.
            </p>
          </div>

          <div className="text-sm text-center mt-6">
            <Link
              href="/"
              className="text-[#579169] font-bold hover:underline inline-flex items-center gap-1"
            >
              ← Back to Live Menu
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right — Forest Brand Panel (Desktop) */}
      <div className="hidden lg:block flex-1 relative rounded-[2.5rem] overflow-hidden isolate shadow-2xl">
        <DarkPanel className="h-full w-full" radius="rounded-[2.5rem]">
          <div className="h-full flex flex-col justify-between p-12 xl:p-16 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
                <Sparkles size={12} className="text-[#d9f36b]" />
                <span className="text-[10px] tracking-widest text-[#d9f36b] uppercase font-bold">
                  Live Dining System
                </span>
              </div>

              <h2 className="text-4xl xl:text-5xl font-extrabold leading-[1.05] tracking-tight mt-8 max-w-lg">
                Fresh food insights,<br />
                <span className="text-[#b5c7b7]">zero guesswork.</span>
              </h2>

              <p className="text-white/70 text-base mt-4 max-w-md leading-relaxed">
                Check daily menu offerings across Mess Sai and Mess Sheila, submit dish ratings,
                request hall switches, and keep track of live dining schedules.
              </p>

              {/* Feature Highlights */}
              <div className="mt-10 space-y-3.5">
                {[
                  "Real-time menu updates with vegetarian & non-vegetarian tags",
                  "Verified meal feedback affecting monthly vendor evaluations",
                  "Automated semester and weekly mess allocation switching",
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/85">
                    <CheckCircle2 size={16} className="text-[#d9f36b] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Live Metrics Row */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8 mt-12">
              {[
                { label: "Campus Students", value: "2,400+" },
                { label: "Meals Served/Day", value: "6,000+" },
                { label: "Average Rating", value: "4.6 ★" },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-2xl font-extrabold text-[#d9f36b] tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DarkPanel>
      </div>
    </div>
  );
}
