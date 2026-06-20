"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  AlertTriangle,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { DarkPanel } from "@/components/ui/DarkPanel";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
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
      setError("Please fill in all fields.");
      return;
    }

    if (!email.toLowerCase().endsWith("@iiitdm.ac.in")) {
      setError("Only @iiitdm.ac.in emails are allowed.");
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
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] p-3 sm:p-4 gap-0 lg:gap-4">
      {/* Left — Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Logo */}
          <div className="mb-12">
            <div className="h-12 w-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center">
              <UtensilsCrossed size={24} className="text-white" />
            </div>
          </div>

          <h1 className="font-display text-[34px] font-semibold tracking-tight text-[var(--ink)] leading-[1.05]">
            Welcome back
          </h1>
          <p className="text-[var(--ink-muted)] mt-2 text-[15px]">
            Sign in to manage your mess details.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-4">
            {/* Email Field */}
            <div>
              <label className="text-sm font-medium text-[var(--ink)] mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@iiitdm.ac.in"
                  autoComplete="email"
                  className="peer w-full h-12 pl-11 pr-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/60 outline-none transition-all duration-200 focus:border-[var(--accent)]/40 focus:ring-4 focus:ring-[var(--accent)]/10"
                />
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]/55 peer-focus:text-[var(--accent-strong)] transition-colors">
                  <Mail size={16} strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[var(--ink)]">
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
                  className="peer w-full h-12 pl-11 pr-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/60 outline-none transition-all duration-200 focus:border-[var(--accent)]/40 focus:ring-4 focus:ring-[var(--accent)]/10"
                />
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]/55 peer-focus:text-[var(--accent-strong)] transition-colors">
                  <KeyRound size={16} strokeWidth={2} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
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
                className="flex items-start gap-3 text-xs text-[var(--danger)] bg-[#F8E3E0] rounded-2xl px-4 py-2.5 leading-snug"
              >
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit */}
            <div className="pt-1">
              <motion.button
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={submitting}
                className="relative w-full h-12 rounded-2xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 overflow-hidden shadow-[0_8px_24px_-8px_rgba(47,74,58,0.55)] transition-all duration-200 hover:shadow-[0_12px_28px_-8px_rgba(47,74,58,0.7)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, #5B7C6A 0%, #3A5C49 50%, #2F4A3A 100%)",
                }}
              >
                {/* Soft sheen */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 50%)",
                  }}
                />
                <span className="relative z-10 inline-flex items-center gap-2">
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in <ArrowRight size={15} />
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </form>

          <div className="text-sm text-[var(--ink-muted)] text-center mt-8">
            <Link
              href="/"
              className="text-[var(--accent-strong)] font-semibold hover:underline"
            >
              Back to Live Dashboard
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right — Brand Panel (desktop only) */}
      <div className="hidden lg:block flex-1 relative rounded-[28px] overflow-hidden isolate">
        <DarkPanel className="h-full w-full" radius="rounded-[28px]">
          <div className="h-full flex flex-col justify-center px-10 xl:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 backdrop-blur-md">
                <Sparkles size={12} className="text-white/80" />
                <span className="text-[11px] tracking-wide text-white/80 uppercase font-semibold">
                  IIITDM Kancheepuram
                </span>
              </div>

              <h2
                className="font-serif text-[44px] xl:text-[60px] leading-[1.02] text-white mt-8 max-w-[540px]"
                style={{
                  fontStyle: "italic",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
              >
                Your meals,
                <br />
                <em>simplified.</em>
              </h2>

              <p className="text-white/65 text-base xl:text-lg mt-6 max-w-md leading-relaxed">
                View daily menus, rate your meals, track nutrition, and manage
                your hostel dining experience — all in one place.
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-6 mt-10">
                {[
                  { label: "Students", value: "2,400+" },
                  { label: "Meals Rated", value: "12,000+" },
                  { label: "Mess Halls", value: "2" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-display text-[22px] font-semibold text-white tabular">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-white/50 uppercase tracking-wide font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </DarkPanel>
      </div>
    </div>
  );
}
