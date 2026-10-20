"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Bell, Utensils, X, ChevronDown, ChevronUp, Sparkles, Megaphone } from "lucide-react";
import api from "@/lib/api";
import { Notification } from "@/types";

export function AnnouncementBanner() {
  const [banners, setBanners] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load dismissed banner IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mealsync_dismissed_banners");
      if (stored) {
        setDismissedIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Fetch active banners from server
  useEffect(() => {
    let isMounted = true;

    async function fetchBanners() {
      try {
        const res = await api.get("/notifications/banners");
        if (isMounted && Array.isArray(res.data)) {
          setBanners(res.data);
        }
      } catch (err) {
        // Quietly fail for banners if offline
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBanners();
    // Poll for emergency updates every 60 seconds
    const interval = setInterval(fetchBanners, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Filter out dismissed banners
  const visibleBanners = banners.filter((b) => !dismissedIds.has(b._id));

  if (loading || visibleBanners.length === 0) {
    return null;
  }

  const activeBanner = visibleBanners[currentIndex] || visibleBanners[0];

  const handleDismiss = (id: string) => {
    const updated = new Set(dismissedIds);
    updated.add(id);
    setDismissedIds(updated);
    try {
      localStorage.setItem("mealsync_dismissed_banners", JSON.stringify(Array.from(updated)));
    } catch {
      // Ignore storage error
    }
    // Adjust index if needed
    if (currentIndex >= visibleBanners.length - 1) {
      setCurrentIndex(0);
    }
  };

  const isEmergency = activeBanner.priority === "urgent" || activeBanner.category === "emergency";
  const isMenuChange = activeBanner.category === "menu_substitution";

  // Visual theme config
  const themeStyles = isEmergency
    ? {
        bg: "bg-red-50/90 dark:bg-red-950/40",
        border: "border-red-200 dark:border-red-800/60",
        text: "text-red-950 dark:text-red-100",
        badge: "bg-red-600 text-white dark:bg-red-700",
        iconText: "text-red-600 dark:text-red-400",
        icon: AlertTriangle,
        badgeLabel: "Official Alert • Urgent"
      }
    : isMenuChange
    ? {
        bg: "bg-[#f4faee] dark:bg-[#152a1e]/50",
        border: "border-[#d9f36b]/40 dark:border-[#579169]/30",
        text: "text-[#173b2a] dark:text-[#dcf0dc]",
        badge: "bg-[#173b2a] text-[#d9f36b] dark:bg-[#d9f36b] dark:text-[#173b2a]",
        iconText: "text-[#173b2a] dark:text-[#d9f36b]",
        icon: Utensils,
        badgeLabel: "SAC Menu Update"
      }
    : {
        bg: "bg-indigo-50/90 dark:bg-indigo-950/40",
        border: "border-indigo-200 dark:border-indigo-800/60",
        text: "text-indigo-950 dark:text-indigo-100",
        badge: "bg-indigo-600 text-white dark:bg-indigo-700",
        iconText: "text-indigo-600 dark:text-indigo-400",
        icon: Megaphone,
        badgeLabel: "SAC Announcement"
      };

  const IconComponent = themeStyles.icon;

  return (
    <div
      className={`mb-6 rounded-2xl border p-4 sm:p-4.5 shadow-sm transition-all animate-fade-in ${themeStyles.bg} ${themeStyles.border} ${themeStyles.text}`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* Left: Icon & Content */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-black/20 shadow-xs">
            <IconComponent size={17} className={themeStyles.iconText} />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            {/* Header: Badge & Date & Pagination */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${themeStyles.badge}`}>
                {themeStyles.badgeLabel}
              </span>
              <span className="text-[11px] font-medium opacity-70">
                {new Date(activeBanner.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>

              {visibleBanners.length > 1 && (
                <div className="flex items-center gap-1 ml-auto sm:ml-2 text-[10px] font-semibold opacity-75">
                  <span>{currentIndex + 1} of {visibleBanners.length}</span>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % visibleBanners.length)}
                    className="underline hover:opacity-100 ml-1 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold tracking-tight leading-snug">
              {activeBanner.title}
            </h4>

            {/* Message Body */}
            <div className="text-xs opacity-90 leading-relaxed font-normal">
              {isExpanded ? (
                <p className="whitespace-pre-line mt-1">{activeBanner.message}</p>
              ) : (
                <p className="line-clamp-2 mt-0.5">{activeBanner.message}</p>
              )}

              {activeBanner.message.length > 120 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1.5 inline-flex items-center gap-1 font-bold text-[11px] hover:underline cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      <span>Read full notice</span>
                      <ChevronDown size={12} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Dismiss button */}
        <button
          onClick={() => handleDismiss(activeBanner._id)}
          title="Dismiss notice"
          className="rounded-lg p-1.5 opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
