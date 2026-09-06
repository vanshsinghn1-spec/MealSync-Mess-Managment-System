"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  UtensilsCrossed,
  Star,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Flame,
  Award,
  Sun,
  CloudSun,
  Coffee,
  Moon,
  ChevronRight,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import FoodIndicator from "@/components/layout/FoodIndicator";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { DarkPanel } from "@/components/ui/DarkPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTodayMenu } from "@/hooks/useMenuData";

interface FoodRating {
  foodItem: string;
  avgRating: number;
  count: number;
}

interface PollStats {
  likes: number;
  dislikes: number;
  total: number;
}

export default function LandingPage() {
  const { data: session } = useSession();
  const { theme, toggle: toggleTheme } = useTheme();
  const [selectedMess, setSelectedMess] = useState<"mess-1" | "mess-2">("mess-1");
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [ratings, setRatings] = useState<FoodRating[]>([]);
  const [pollStats, setPollStats] = useState<PollStats>({ likes: 0, dislikes: 0, total: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);

  // SWR hook: fetches all 4 meals in a single request, cached in memory
  const { meals, day, weekType, currentMeal, isLoading: menuLoading } = useTodayMenu();

  // Default to server-determined current meal on first load
  const activeMeal = selectedMeal || currentMeal;

  // Derive veg and non-veg items from the pre-fetched meals object (instant tab switching)
  const { activeVegMenu, activeNonVegMenu } = useMemo(() => {
    if (!meals || !meals[activeMeal]) {
      return { activeVegMenu: null, activeNonVegMenu: null };
    }

    const mealData = meals[activeMeal];

    const veg = mealData.vegMenus?.find(
      (m: any) => m.messId?.slug === selectedMess
    ) || null;

    const nonVeg = mealData.nonVegMenus?.find(
      (m: any) => m.messId?.slug === selectedMess
    ) || null;

    return { activeVegMenu: veg, activeNonVegMenu: nonVeg };
  }, [meals, activeMeal, selectedMess]);

  // Fetch ratings and polls (secondary data, non-blocking)
  useEffect(() => {
    async function fetchSidebarData() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const dbMessId = selectedMess === "mess-1" ? "60d07e6181f9f25712e3e6f1" : "60d07e6181f9f25712e3e6f2";
        
        // Fire both requests in parallel instead of sequentially
        const [ratingsRes, pollRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/feedback/ratings/${dbMessId}`),
          axios.get(`${API_BASE}/polls/stats/${dbMessId}/${activeMeal}`),
        ]);

        if (ratingsRes.status === "fulfilled") {
          setRatings(ratingsRes.value.data);
        }
        if (pollRes.status === "fulfilled") {
          setPollStats(pollRes.value.data);
        }
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      }
    }

    if (activeMeal) {
      fetchSidebarData();
    }
  }, [selectedMess, activeMeal]);

  // Fetch Public Notifications
  useEffect(() => {
    async function fetchNotifications() {
      try {
        setNotifications([
          {
            _id: "1",
            title: "Special Dinner Scheduled",
            message: "A grand dinner is scheduled for Wednesday night in both Mess Sai and Mess Sheila.",
            createdAt: new Date().toISOString()
          },
          {
            _id: "2",
            title: "Mess Switching Window Open",
            message: "Students can request to switch between Mess Sai and Mess Sheila through the dashboard. Requests will be processed at the end of the week.",
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      } catch (e) {
        console.error(e);
      }
    }
    fetchNotifications();
  }, []);

  // Helper to find rating of a food item
  const getItemRating = (itemName: string) => {
    const ratingObj = ratings.find(r => itemName.toLowerCase().includes(r.foodItem.toLowerCase()) || r.foodItem.toLowerCase().includes(itemName.toLowerCase()));
    return ratingObj ? ratingObj.avgRating : null;
  };

  const getItemRatingCount = (itemName: string) => {
    const ratingObj = ratings.find(r => itemName.toLowerCase().includes(r.foodItem.toLowerCase()) || r.foodItem.toLowerCase().includes(itemName.toLowerCase()));
    return ratingObj ? ratingObj.count : 0;
  };

  const getDayLabel = () => {
    if (day && weekType) {
      return `${day} Menu (${weekType.toUpperCase()} Week)`;
    }
    return "Today's Menu";
  };

  const mealTabItems = [
    { value: "breakfast", label: "Breakfast", icon: <Sun size={14} /> },
    { value: "lunch", label: "Lunch", icon: <CloudSun size={14} /> },
    { value: "snacks", label: "Snacks", icon: <Coffee size={14} /> },
    { value: "dinner", label: "Dinner", icon: <Moon size={14} /> },
  ];
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans overflow-x-hidden selection:bg-[var(--accent-soft)] transition-colors duration-200">
      
      {/* Floating Navbar */}
      <header className="fixed top-2.5 sm:top-4 left-0 right-0 z-50 px-2.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="h-14 sm:h-16 px-3 sm:px-6 rounded-full border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md flex items-center justify-between shadow-card">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-sm shrink-0">
              <UtensilsCrossed size={16} className="text-white sm:hidden" />
              <UtensilsCrossed size={18} className="text-white hidden sm:block" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-[var(--ink)] leading-none">MealSync</h1>
              <p className="text-[9px] text-[var(--ink-muted)] font-medium tracking-wider uppercase hidden sm:block mt-0.5">IIITDM Kancheepuram</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Mess Menu PDF link */}
            <a href="/mess-menu.pdf" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] rounded-full transition-all flex items-center gap-1 shrink-0"
              >
                <span className="hidden sm:inline">Mess Menu PDF</span>
                <span className="sm:hidden text-[11px] font-bold">PDF</span>
              </Button>
            </a>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="iconSm"
              onClick={toggleTheme}
              title="Toggle theme"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full text-[var(--ink-muted)] hover:text-[var(--ink)] shrink-0"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </Button>

            {/* Log In Button */}
            <Link href="/login" className="shrink-0">
              <Button variant="accent" size="sm" className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-full shrink-0 flex items-center gap-1">
                <span>Log In</span>
                <ArrowRight size={14} className="hidden sm:inline" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative w-full">
        <DarkPanel
          className="w-full min-h-[420px] sm:min-h-[560px] flex items-center"
          radius="rounded-b-[32px] sm:rounded-b-[56px]"
          glow={true}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 pt-24 sm:pt-28 pb-12 sm:pb-16 text-center text-white flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-4 sm:mb-6">
              <Sparkles size={12} className="text-[#B6CFC0] animate-pulse" />
              <span className="text-[10px] tracking-wide text-white/90 uppercase font-semibold">
                Live Hostel Mess Portal
              </span>
            </div>
            
            <h2 className="font-display text-2xl sm:text-4xl lg:text-6xl font-bold leading-snug sm:leading-[1.08] tracking-tight max-w-4xl px-2">
              Real-time dining dashboard for hostel residents & officials
            </h2>

            <p className="text-white/70 text-xs sm:text-base lg:text-lg max-w-2xl mt-3 sm:mt-6 font-normal leading-relaxed px-2">
              View today's live menu, track ratings, vote on daily meals, and access dining reallocation requests seamlessly.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mt-6 sm:mt-8">
              <a href="#menu-dashboard">
                <Button variant="accent" size="lg" className="h-10 sm:h-12 px-5 sm:px-6 text-xs sm:text-sm font-semibold rounded-full shadow-lg">
                  View Today's Menu
                  <ChevronRight size={16} />
                </Button>
              </a>
              {!session && (
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-10 sm:h-12 px-5 sm:px-6 text-xs sm:text-sm font-semibold rounded-full border-white/20 text-white hover:bg-white/10 bg-transparent">
                    Student Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </DarkPanel>
      </section>

      {/* Main Content Dashboard */}
      <main id="menu-dashboard" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Menu display (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Control Bar: Mess Toggle & Meal Selector */}
            <Card variant="flat" className="p-4 sm:p-5 space-y-4">
              {/* Mess Switcher Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Select Dining Hall</h3>
                  <p className="text-[11px] text-[var(--ink-muted)]/80 mt-0.5">Toggle to view menus from different halls</p>
                </div>
                <div className="grid grid-cols-2 w-full sm:w-auto p-1 bg-[var(--surface-2)] rounded-2xl sm:rounded-full border border-[var(--border)] gap-1 shrink-0">
                  <button
                    onClick={() => setSelectedMess("mess-1")}
                    className={`px-3 sm:px-4.5 py-1.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all duration-200 truncate ${
                      selectedMess === "mess-1"
                        ? "bg-[var(--surface)] text-[var(--ink)] shadow-card"
                        : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    Mess Sai (Block A)
                  </button>
                  <button
                    onClick={() => setSelectedMess("mess-2")}
                    className={`px-3 sm:px-4.5 py-1.5 rounded-xl sm:rounded-full text-xs font-semibold transition-all duration-200 truncate ${
                      selectedMess === "mess-2"
                        ? "bg-[var(--surface)] text-[var(--ink)] shadow-card"
                        : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    Mess Sheila (Block B)
                  </button>
                </div>
              </div>

              <hr className="border-[var(--border)]" />

              {/* Meal Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "breakfast", label: "Breakfast", desc: "07:30 - 09:00", icon: <Sun size={15} /> },
                  { id: "lunch", label: "Lunch", desc: "12:00 - 14:00", icon: <CloudSun size={15} /> },
                  { id: "snacks", label: "Snacks", desc: "17:00 - 18:00", icon: <Coffee size={15} /> },
                  { id: "dinner", label: "Dinner", desc: "19:30 - 21:00", icon: <Moon size={15} /> }
                ].map(meal => (
                  <button
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal.id)}
                    className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-200 text-left group ${
                      activeMeal === meal.id
                        ? "bg-[var(--surface-2)] border-[var(--accent)]/50 text-[var(--ink)] shadow-card"
                        : "bg-transparent border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--accent)]/20"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold group-hover:text-[var(--ink)] transition-colors">
                      <span className={activeMeal === meal.id ? "text-[var(--accent)]" : "text-[var(--ink-muted)] group-hover:text-[var(--ink)]"}>
                        {meal.icon}
                      </span>
                      {meal.label}
                    </div>
                    <div className="text-[10px] text-[var(--ink-muted)]/75 mt-0.5">{meal.desc}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Menu Items Card Grid */}
            <Card padding="lg" className="min-h-[380px] relative p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] tracking-tight">{getDayLabel()}</h3>
                  <p className="text-xs text-[var(--ink-muted)] capitalize mt-0.5">
                    Listing all dishes for today's {activeMeal}
                  </p>
                </div>
                <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 shrink-0">
                  Live Menu
                </Badge>
              </div>

              {menuLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
                    <p className="text-xs text-[var(--ink-muted)]">Loading menu details...</p>
                  </div>
                </div>
              ) : activeVegMenu && activeVegMenu.items.length > 0 ? (
                <div className="space-y-6">
                  
                  {/* Menu Items */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Today's Served Menu
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeVegMenu.items.map((item: any, idx: number) => {
                        const itemRating = getItemRating(item.name);
                        const ratingCount = getItemRatingCount(item.name);
                        const isVeg = item.isVeg !== false;

                        return (
                          <div
                            key={idx}
                            className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-200 flex items-center justify-between gap-3 group min-w-0"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <FoodIndicator isVeg={isVeg} />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs sm:text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--accent-strong)] transition-colors break-words">{item.name}</div>
                                <div className="text-[10px] text-[var(--ink-muted)] mt-0.5">{isVeg ? 'Vegetarian' : 'Non-Vegetarian'}</div>
                              </div>
                            </div>
                            
                            {/* Rating badge */}
                            <div className="flex flex-col items-end shrink-0">
                              {itemRating ? (
                                <>
                                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs sm:text-sm">
                                    <Star size={13} fill="currentColor" />
                                    {itemRating.toFixed(1)}
                                  </div>
                                  <div className="text-[9px] text-[var(--ink-muted)] font-medium mt-0.5">{ratingCount} reviews</div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1 text-[var(--ink-muted)]/50 text-xs font-medium">
                                    <Star size={12} />
                                    N/A
                                  </div>
                                  <div className="text-[9px] text-[var(--ink-muted)]/40 mt-0.5">No reviews</div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--ink-muted)]">
                  <UtensilsCrossed size={40} className="stroke-[1.5] mb-3 text-[var(--ink-muted)]/60" />
                  <p className="text-sm font-semibold">No menu details found for today's {activeMeal}.</p>
                  <p className="text-xs mt-1 text-[var(--ink-muted)]/70">Menu updates pending from mess official seeders.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Poll Stats and Notifications (Right Column) */}
          <div className="space-y-6">
            
            {/* Live Meal Poll Card */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2 uppercase tracking-wide">
                  <Activity size={16} className="text-[var(--accent)]" />
                  Meal Feedback Poll
                </h4>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <p className="text-xs text-[var(--ink-muted)] mb-5">
                Live feedback from students dining in this meal today. Sign in to vote!
              </p>

              <div className="bg-[var(--surface-2)] p-4 rounded-2xl border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-medium">
                  <span>Likes ({pollStats.likes})</span>
                  <span>Dislikes ({pollStats.dislikes})</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="h-2.5 w-full bg-[var(--border)] rounded-full overflow-hidden flex">
                  {pollStats.total > 0 ? (
                    <>
                      <div
                        className="bg-[var(--accent)] h-full transition-all duration-500"
                        style={{ width: `${(pollStats.likes / pollStats.total) * 100}%` }}
                      />
                      <div
                        className="bg-[var(--danger)] h-full transition-all duration-500"
                        style={{ width: `${(pollStats.dislikes / pollStats.total) * 100}%` }}
                      />
                    </>
                  ) : (
                    <div className="bg-[var(--ink-muted)]/20 w-full h-full" />
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[var(--accent)] text-xs font-bold">
                      <ThumbsUp size={13} fill="currentColor" className="opacity-90" />
                      {pollStats.total > 0 ? Math.round((pollStats.likes / pollStats.total) * 100) : 0}%
                    </div>
                    <div className="flex items-center gap-1 text-[var(--danger)] text-xs font-bold">
                      <ThumbsDown size={13} fill="currentColor" className="opacity-90" />
                      {pollStats.total > 0 ? Math.round((pollStats.dislikes / pollStats.total) * 100) : 0}%
                    </div>
                  </div>
                  <div className="text-[10px] text-[var(--ink-muted)] font-semibold uppercase">{pollStats.total} total votes</div>
                </div>
              </div>

              <div className="mt-5">
                <Link href="/login">
                  <Button variant="outline" className="w-full text-xs font-semibold h-10 border-dashed rounded-2xl">
                    Sign In to Vote
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Public Announcements Board */}
            <Card padding="lg">
              <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2 uppercase tracking-wide mb-4">
                <Volume2 size={16} className="text-[var(--accent)]" />
                Announcements
              </h4>
              <hr className="border-[var(--border)] mb-4" />
              <div className="space-y-4">
                {notifications.map((notif, idx) => (
                  <div key={idx} className="space-y-1 group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                        {notif.title}
                      </span>
                      <span className="text-[9px] text-[var(--ink-muted)] font-semibold uppercase">
                        {new Date(notif.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--ink-muted)] leading-relaxed font-normal">{notif.message}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* System Status info */}
            <Card variant="flat" className="bg-gradient-to-br from-[var(--surface-2)] to-[var(--bg)] border border-[var(--border)] p-6 space-y-4">
              <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2 uppercase tracking-wide">
                <Award size={16} className="text-[var(--accent)]" />
                Portal Details
              </h4>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                This dashboard updates live directly from databases populated by student rating submissions. Sign up to rate dishes and give detailed feedback.
              </p>
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <div className="text-xl font-bold text-[var(--ink)]">4.8*</div>
                  <div className="text-[9px] text-[var(--ink-muted)] uppercase font-semibold mt-0.5">Top Dish (Dosa)</div>
                </div>
                <div className="border-l border-[var(--border)] h-8" />
                <div>
                  <div className="text-xl font-bold text-[var(--accent)]">100%</div>
                  <div className="text-[9px] text-[var(--ink-muted)] uppercase font-semibold mt-0.5">Active Sync</div>
                </div>
              </div>
            </Card>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-12 mt-16 text-center text-xs text-[var(--ink-muted)] font-normal">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 MealSync IIITDM Kancheepuram Mess Portal. Powered by Next.js & Node.js.</p>
          <p className="text-[11px] text-[var(--accent-strong)] font-medium">Crafted with high visual fidelity for hostellers.</p>
        </div>
      </footer>

    </div>
  );
}
