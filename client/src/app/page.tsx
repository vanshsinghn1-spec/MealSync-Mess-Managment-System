"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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

interface MenuItem {
  name: string;
  icon: string;
}

interface VegMenu {
  _id: string;
  messId: {
    _id: string;
    name: string;
    slug: string;
  };
  day: string;
  weekType: "odd" | "even";
  meal: string;
  items: MenuItem[];
}

interface NonVegMenu {
  _id: string;
  messId: {
    _id: string;
    name: string;
    slug: string;
  };
  date: string;
  meal: string;
  items: {
    name: string;
    cost: number;
    icon: string;
  }[];
}

interface TodayMenuResponse {
  date: string;
  day: string;
  weekType: "odd" | "even";
  currentMeal: string;
  vegMenus: VegMenu[];
  nonVegMenus: NonVegMenu[];
}

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
  const [selectedMeal, setSelectedMeal] = useState<string>("breakfast");
  const [menuData, setMenuData] = useState<TodayMenuResponse | null>(null);
  const [ratings, setRatings] = useState<FoodRating[]>([]);
  const [pollStats, setPollStats] = useState<PollStats>({ likes: 0, dislikes: 0, total: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Set default meal selection based on current hour on mount
  useEffect(() => {
    const getCurrentMealByTime = (): string => {
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 9) {
        return "breakfast";
      } else if (hour >= 9 && hour < 14) {
        return "lunch";
      } else if (hour >= 14 && hour < 18) {
        return "snacks";
      } else {
        return "dinner";
      }
    };
    setSelectedMeal(getCurrentMealByTime());
  }, []);

  // Fetch menu and rating details
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        
        // 1. Fetch Today's Menu
        const menuRes = await axios.get(`${API_BASE}/menu/today?meal=${selectedMeal}`);
        setMenuData(menuRes.data);
        if (menuRes.data.currentMeal && !selectedMeal) {
          setSelectedMeal(menuRes.data.currentMeal);
        }

        // 2. Fetch Ratings for the selected Mess
        const dbMessId = selectedMess === "mess-1" ? "60d07e6181f9f25712e3e6f1" : "60d07e6181f9f25712e3e6f2";
        
        try {
          const ratingsRes = await axios.get(`${API_BASE}/feedback/ratings/${dbMessId}`);
          setRatings(ratingsRes.data);
        } catch (e) {
          console.error("Error fetching ratings:", e);
        }

        // 3. Fetch Poll Stats
        try {
          const pollRes = await axios.get(`${API_BASE}/polls/stats/${dbMessId}/${selectedMeal}`);
          setPollStats(pollRes.data);
        } catch (e) {
          console.error("Error fetching polls:", e);
        }
      } catch (error) {
        console.error("Error fetching landing page data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedMess, selectedMeal]);

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

  // Filter menu data for selected mess
  const activeVegMenu = menuData?.vegMenus?.find(m => m.messId.slug === selectedMess);
  const activeNonVegMenu = menuData?.nonVegMenus?.find(m => m.messId.slug === selectedMess);

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
    if (menuData) {
      return `${menuData.day} Menu (${menuData.weekType.toUpperCase()} Week)`;
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
      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="h-14 sm:h-16 px-4 sm:px-6 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md flex items-center justify-between shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-sm">
              <UtensilsCrossed size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-[var(--ink)]">MealSync</h1>
              <p className="text-[9px] text-[var(--ink-muted)] font-medium tracking-wider uppercase">IIITDM Kancheepuram</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mess Menu PDF link */}
            <a href="/mess-menu.pdf" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3.5 text-xs sm:text-sm font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] rounded-full transition-all"
              >
                Mess Menu PDF
              </Button>
            </a>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="iconSm"
              onClick={toggleTheme}
              title="Toggle theme"
              className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </Button>

            <Link href="/login">
              <Button variant="accent" size="sm" className="h-9 text-xs sm:text-sm font-semibold">
                Log In
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative w-full">
        <DarkPanel
          className="w-full min-h-[500px] sm:min-h-[580px] flex items-center"
          radius="rounded-b-[40px] sm:rounded-b-[56px]"
          glow={true}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-28 pb-16 text-center text-white flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 backdrop-blur-md mb-6">
              <Sparkles size={12} className="text-[#B6CFC0] animate-pulse" />
              <span className="text-[10px] tracking-wide text-white/85 uppercase font-semibold">
                Live Hostel Mess Portal
              </span>
            </div>
            
            <h2 className="font-display text-[40px] sm:text-[56px] lg:text-[72px] leading-[1.05] tracking-tight max-w-4xl">
              Know what's cooking.
              <br />
              <span className="text-white/50">Rate what</span>{" "}
              <span
                style={{
                  backgroundImage: "linear-gradient(120deg, #B6CFC0 0%, #8FB39C 55%, #5B7C6A 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                matters.
              </span>
            </h2>
            
            <p className="text-white/65 text-sm sm:text-base lg:text-lg mt-6 max-w-xl leading-relaxed">
              View daily menus, check live student ratings, track nutrition, and submit feedback dynamically in real time.
            </p>

            <div className="flex flex-wrap gap-3 mt-8 justify-center">
              <a href="#menu-dashboard">
                <Button variant="accent" size="md" className="h-11 px-5 text-sm font-semibold">
                  View Today's Menu
                </Button>
              </a>
              {!session && (
                <Link href="/login">
                  <Button variant="outline" size="md" className="h-11 px-5 text-sm font-medium border-white/12 hover:bg-white/8 text-white bg-transparent">
                    Student Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </DarkPanel>
      </section>

      {/* Main Content Dashboard */}
      <main id="menu-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Menu display (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Control Bar: Mess Toggle & Meal Selector */}
            <Card variant="flat" className="p-5 space-y-4">
              {/* Mess Switcher Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Select Dining Hall</h3>
                  <p className="text-[11px] text-[var(--ink-muted)]/80 mt-0.5">Toggle to view menus from different halls</p>
                </div>
                <div className="inline-flex bg-[var(--surface-2)] p-1 rounded-full border border-[var(--border)] self-start sm:self-auto">
                  <button
                    onClick={() => setSelectedMess("mess-1")}
                    className={`px-4.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      selectedMess === "mess-1"
                        ? "bg-[var(--surface)] text-[var(--ink)] shadow-card"
                        : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    Mess Sai (Block A)
                  </button>
                  <button
                    onClick={() => setSelectedMess("mess-2")}
                    className={`px-4.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
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
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "breakfast", label: "Breakfast", desc: "07:30 - 09:00", icon: <Sun size={15} /> },
                  { id: "lunch", label: "Lunch", desc: "12:00 - 14:00", icon: <CloudSun size={15} /> },
                  { id: "snacks", label: "Snacks", desc: "17:00 - 18:00", icon: <Coffee size={15} /> },
                  { id: "dinner", label: "Dinner", desc: "19:30 - 21:00", icon: <Moon size={15} /> }
                ].map(meal => (
                  <button
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal.id)}
                    className={`flex-1 min-w-[110px] p-3 rounded-2xl border transition-all duration-200 text-left group ${
                      selectedMeal === meal.id
                        ? "bg-[var(--surface-2)] border-[var(--accent)]/50 text-[var(--ink)] shadow-card"
                        : "bg-transparent border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--accent)]/20"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-sm font-semibold group-hover:text-[var(--ink)] transition-colors">
                      <span className={selectedMeal === meal.id ? "text-[var(--accent)]" : "text-[var(--ink-muted)] group-hover:text-[var(--ink)]"}>
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
            <Card padding="lg" className="min-h-[380px] relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[var(--ink)] tracking-tight">{getDayLabel()}</h3>
                  <p className="text-xs text-[var(--ink-muted)] capitalize mt-0.5">
                    Listing all dishes for today's {selectedMeal}
                  </p>
                </div>
                <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                  Live Menu
                </Badge>
              </div>

              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
                    <p className="text-xs text-[var(--ink-muted)]">Loading menu details...</p>
                  </div>
                </div>
              ) : activeVegMenu && activeVegMenu.items.length > 0 ? (
                <div className="space-y-6">
                  
                  {/* Veg Menu Items */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Standard Menu (Veg)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeVegMenu.items.map((item, idx) => {
                        const itemRating = getItemRating(item.name);
                        const ratingCount = getItemRatingCount(item.name);

                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-200 flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <FoodIndicator isVeg={true} />
                              <div>
                                <div className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--accent-strong)] transition-colors">{item.name}</div>
                                <div className="text-[10px] text-[var(--ink-muted)] mt-0.5">Vegetarian Standard</div>
                              </div>
                            </div>
                            
                            {/* Rating badge */}
                            <div className="flex flex-col items-end">
                              {itemRating ? (
                                <>
                                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
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

                  {/* Non-Veg Menu Extras (if any exists for today/meal) */}
                  {activeNonVegMenu && activeNonVegMenu.items && activeNonVegMenu.items.length > 0 && (
                    <div className="space-y-3 pt-6 border-t border-[var(--border)]">
                      <h4 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        Available Extras (Special Paid Menu)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeNonVegMenu.items.map((item, idx) => {
                          const itemRating = getItemRating(item.name);
                          const ratingCount = getItemRatingCount(item.name);

                          return (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-200 flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-3">
                                <FoodIndicator isVeg={item.isVeg} />
                                <div>
                                  <div className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--accent-strong)] transition-colors">{item.name}</div>
                                  <div className="text-xs font-bold text-[var(--ink-muted)] mt-1">₹{item.cost}</div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                {itemRating ? (
                                  <>
                                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
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
                  )}

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--ink-muted)]">
                  <UtensilsCrossed size={40} className="stroke-[1.5] mb-3 text-[var(--ink-muted)]/60" />
                  <p className="text-sm font-semibold">No menu details found for today's {selectedMeal}.</p>
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
                  <div className="text-xl font-bold text-[var(--ink)]">4.8★</div>
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
