"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  Star,
  Sparkles,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Flame,
  Sun,
  CloudSun,
  Coffee,
  Moon,
  Clock3,
  Check,
  Download,
  CalendarDays,
  Bell,
  Menu as MenuIcon,
  X,
  ChevronDown
} from "lucide-react";
import FoodIndicator from "@/components/layout/FoodIndicator";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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

const mealConfigs = [
  { id: "breakfast", name: "Breakfast", time: "07:30 – 09:00", icon: Sun, accent: "bg-[#f8d9a7] text-[#8c5916]" },
  { id: "lunch", name: "Lunch", time: "12:00 – 14:00", icon: CloudSun, accent: "bg-[#c8e5d3] text-[#1c633a]" },
  { id: "snacks", name: "Snacks", time: "17:00 – 18:00", icon: Coffee, accent: "bg-[#e1d4f3] text-[#552d87]" },
  { id: "dinner", name: "Dinner", time: "19:30 – 21:00", icon: Moon, accent: "bg-[#c8d8ed] text-[#244b7a]" },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const { theme, toggle: toggleTheme } = useTheme();
  const [selectedMess, setSelectedMess] = useState<"mess-1" | "mess-2">("mess-1");
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [ratings, setRatings] = useState<FoodRating[]>([]);
  const [pollStats, setPollStats] = useState<PollStats>({ likes: 42, dislikes: 6, total: 48 });
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // SWR hook: fetches all 4 meals in a single request, cached in memory
  const { meals, day, weekType, currentMeal, isLoading: menuLoading } = useTodayMenu();

  // Default to server-determined current meal on first load
  const activeMealId = selectedMeal || currentMeal || "lunch";
  const activeMealConfig = mealConfigs.find((m) => m.id === activeMealId) || mealConfigs[1];

  // Derive veg and non-veg items from the pre-fetched meals object
  const { activeVegMenu, activeNonVegMenu } = useMemo(() => {
    if (!meals || !meals[activeMealId]) {
      return { activeVegMenu: null, activeNonVegMenu: null };
    }

    const mealData = meals[activeMealId];
    const veg = mealData.vegMenus?.find((m: any) => m.messId?.slug === selectedMess) || null;
    const nonVeg = mealData.nonVegMenus?.find((m: any) => m.messId?.slug === selectedMess) || null;

    return { activeVegMenu: veg, activeNonVegMenu: nonVeg };
  }, [meals, activeMealId, selectedMess]);

  // Combine items according to filter
  const displayedItems = useMemo(() => {
    const list: any[] = [];
    if (dietFilter !== "non-veg" && activeVegMenu?.items) {
      list.push(...activeVegMenu.items.map((it: any) => ({ ...it, isVeg: true })));
    }
    if (dietFilter !== "veg" && activeNonVegMenu?.items) {
      list.push(...activeNonVegMenu.items.map((it: any) => ({ ...it, isVeg: false })));
    }
    return list;
  }, [activeVegMenu, activeNonVegMenu, dietFilter]);

  // Fetch ratings and polls (secondary data, non-blocking)
  useEffect(() => {
    async function fetchSidebarData() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const dbMessId = selectedMess === "mess-1" ? "60d07e6181f9f25712e3e6f1" : "60d07e6181f9f25712e3e6f2";

        const [ratingsRes, pollRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/feedback/ratings/${dbMessId}`),
          axios.get(`${API_BASE}/polls/stats/${dbMessId}/${activeMealId}`),
        ]);

        if (ratingsRes.status === "fulfilled" && Array.isArray(ratingsRes.value.data)) {
          setRatings(ratingsRes.value.data);
        }
        if (pollRes.status === "fulfilled" && pollRes.value.data?.total !== undefined) {
          setPollStats(pollRes.value.data);
        }
      } catch (error) {
        console.error("Error fetching ratings or poll data:", error);
      }
    }

    if (activeMealId) {
      fetchSidebarData();
    }
  }, [selectedMess, activeMealId]);

  // Notifications
  useEffect(() => {
    setNotifications([
      {
        _id: "1",
        title: "Special Dinner Scheduled",
        message: "A grand feast dinner is scheduled for Wednesday night in both Mess Sai and Mess Sheila.",
        date: "06 Oct",
      },
      {
        _id: "2",
        title: "Mess Switching Window Open",
        message: "Students can request to switch between Mess Sai and Mess Sheila through the student portal.",
        date: "05 Oct",
      },
    ]);
  }, []);

  // Quick Poll Vote
  const handleVote = async (type: "up" | "down") => {
    setUserVote(type);
    setVoteSubmitted(true);
    setPollStats((prev) => ({
      ...prev,
      likes: type === "up" ? prev.likes + 1 : prev.likes,
      dislikes: type === "down" ? prev.dislikes + 1 : prev.dislikes,
      total: prev.total + 1,
    }));
  };

  const getItemRating = (itemName: string) => {
    const ratingObj = ratings.find(
      (r) =>
        itemName.toLowerCase().includes(r.foodItem.toLowerCase()) ||
        r.foodItem.toLowerCase().includes(itemName.toLowerCase())
    );
    return ratingObj ? ratingObj.avgRating : null;
  };

  const getItemRatingCount = (itemName: string) => {
    const ratingObj = ratings.find(
      (r) =>
        itemName.toLowerCase().includes(r.foodItem.toLowerCase()) ||
        r.foodItem.toLowerCase().includes(itemName.toLowerCase())
    );
    return ratingObj ? ratingObj.count : 0;
  };

  const hallName = selectedMess === "mess-1" ? "Mess Sai" : "Mess Sheila";
  const CurrentIcon = activeMealConfig.icon;

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] selection:bg-[#d9f36b] selection:text-[#173b2a]">
      {/* -------------------- STICKY HEADER -------------------- */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--border)] transition-colors">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <nav className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#173b2a] text-[#d9f36b] shadow-sm transition-transform group-hover:scale-105">
                <Utensils className="size-5" />
              </span>
              <div>
                <span className="block text-xl font-bold tracking-tight text-[var(--ink)] leading-none">
                  MealSync
                </span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)] mt-1">
                  IIITDM Kancheepuram
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden items-center gap-8 text-sm font-medium text-[var(--ink-muted)] md:flex">
              <a href="#menu" className="hover:text-[var(--ink)] transition-colors">
                Today&apos;s Menu
              </a>
              <a href="#feedback" className="hover:text-[var(--ink)] transition-colors">
                Feedback & Poll
              </a>
              <a href="#announcements" className="hover:text-[var(--ink)] transition-colors">
                Announcements
              </a>
              <a
                href="/mess-menu.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[var(--ink)] transition-colors"
              >
                <Download className="size-3.5" />
                <span>Weekly PDF</span>
              </a>
            </div>

            {/* Right Action Buttons */}
            <div className="hidden items-center gap-3 md:flex">
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="rounded-full p-2.5 text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>

              {session ? (
                <Link href="/dashboard">
                  <Button variant="lime" size="md" className="gap-2 px-5">
                    <span>Dashboard</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="forest" size="md" className="gap-2 px-5">
                    <span>Log in</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-full p-2 text-[var(--ink-muted)]"
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
              <button
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-xl p-2 text-[var(--ink)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                {mobileMenuOpen ? <X className="size-6" /> : <MenuIcon className="size-6" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-4 right-4 top-20 z-50 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl md:hidden"
            >
              <div className="flex flex-col gap-2 font-medium">
                <a
                  href="#menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm hover:bg-[var(--surface-2)]"
                >
                  Today&apos;s Menu
                </a>
                <a
                  href="#feedback"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm hover:bg-[var(--surface-2)]"
                >
                  Feedback & Poll
                </a>
                <a
                  href="#announcements"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm hover:bg-[var(--surface-2)]"
                >
                  Announcements
                </a>
                <a
                  href="/mess-menu.pdf"
                  target="_blank"
                  className="rounded-xl px-4 py-3 text-sm hover:bg-[var(--surface-2)]"
                >
                  Download Weekly PDF
                </a>
                <div className="pt-2 border-t border-[var(--border)]">
                  {session ? (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="lime" className="w-full justify-center">
                        Open Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="forest" className="w-full justify-center">
                        Log In to Portal
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* -------------------- HERO SECTION -------------------- */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-[2.2rem] bg-[#173b2a] px-6 py-14 text-white sm:px-12 lg:px-16 lg:py-20 shadow-2xl">
          <div className="hero-glow" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left Hero Content */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d9f36b] backdrop-blur-sm">
                <span className="size-2 rounded-full bg-[#d9f36b] animate-pulse" />
                Live Dining Portal · IIITDM
              </div>

              <h1 className="max-w-2xl text-[clamp(2.75rem,5.5vw,5.5rem)] font-extrabold leading-[0.93] tracking-[-0.05em] text-white">
                Know what&apos;s<br />
                <span className="text-[#b5c7b7]">on your plate.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                Your everyday campus companion for real-time mess menus, honest dish ratings,
                dining hall switches, and transparent SAC updates.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href="#menu">
                  <Button variant="lime" size="lg" className="gap-2 px-6 shadow-lg">
                    <span>View Today&apos;s Menu</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="#feedback">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="gap-2 text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <span>Rate a Meal</span>
                    <ChevronDown className="size-4" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Right Hero: Floating 3D Plate Card */}
            <div className="relative hidden min-h-[340px] lg:flex items-center justify-center">
              {/* Floating tilted menu card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="plate-card plate-card-animated w-[320px] rounded-[1.8rem] bg-[var(--surface)] p-6 text-[var(--ink)] shadow-[0_25px_50px_rgba(0,0,0,0.35)] border border-white/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                      Now Serving · {hallName}
                    </p>
                    <p className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--ink)]">
                      {activeMealConfig.name}
                    </p>
                  </div>
                  <span className={`flex size-11 items-center justify-center rounded-2xl ${activeMealConfig.accent} shadow-sm`}>
                    <CurrentIcon className="size-5" />
                  </span>
                </div>

                {/* Preview Dishes */}
                <div className="mt-6 flex flex-col gap-2.5">
                  {menuLoading ? (
                    <div className="space-y-2 py-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                    </div>
                  ) : activeVegMenu?.items && activeVegMenu.items.length > 0 ? (
                    activeVegMenu.items.slice(0, 3).map((dish: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-[var(--ink)]/80">
                        <Check className="size-3.5 text-[#579169] shrink-0" />
                        <span className="truncate">{dish.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[var(--ink-muted)] italic py-2">
                      Live menu scheduled for today
                    </div>
                  )}
                </div>

                {/* Time & Live Status */}
                <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs">
                  <span className="flex items-center gap-1.5 text-[var(--ink-muted)] font-medium">
                    <Clock3 className="size-3.5" /> {activeMealConfig.time}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#579169]">
                    <span className="size-1.5 rounded-full bg-[#579169] animate-pulse" />
                    LIVE
                  </span>
                </div>
              </motion.div>

              {/* Floating Rating Pill */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="absolute -bottom-2 -left-2 rounded-2xl bg-[#d9f36b] p-4 text-[#173b2a] shadow-xl flex items-center gap-3"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#173b2a] text-[#d9f36b]">
                  <Flame className="size-5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold leading-none">4.8 ★</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#173b2a]/70 mt-1">
                    Top Dish Rating
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- MENU EXPLORER SECTION -------------------- */}
      <section id="menu" className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-16 sm:py-24 scroll-mt-20">
        {/* Section Heading & Dining Hall Toggle */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#579169]">
              Your Dining Day
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl text-[var(--ink)]">
              Today&apos;s menu, at a glance.
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Showing live menu for <strong className="text-[var(--forest)] font-bold">{hallName}</strong>
              {day && ` · ${day}`} {weekType && `(${weekType.toUpperCase()} Week)`}
            </p>
          </div>

          {/* Mess Selector Pills */}
          <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-2)] p-1.5 shadow-sm">
            <button
              onClick={() => setSelectedMess("mess-1")}
              className={`rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedMess === "mess-1"
                  ? "bg-[#173b2a] text-white shadow-md"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              Mess Sai (A)
            </button>
            <button
              onClick={() => setSelectedMess("mess-2")}
              className={`rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedMess === "mess-2"
                  ? "bg-[#173b2a] text-white shadow-md"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              Mess Sheila (B)
            </button>
          </div>
        </div>

        {/* 4 Meal Tabs */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {mealConfigs.map((item) => {
            const Icon = item.icon;
            const isActive = activeMealId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedMeal(item.id)}
                className={`meal-tab cursor-pointer text-left ${isActive ? "meal-tab-active" : ""}`}
              >
                <span className={`flex size-11 items-center justify-center rounded-xl ${item.accent}`}>
                  <Icon className="size-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-sm text-[var(--ink)]">{item.name}</span>
                  <span className="block text-xs text-[var(--ink-muted)] mt-0.5">{item.time}</span>
                </div>
                {isActive && <span className="size-2 rounded-full bg-[#579169] shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Meal Detail Container */}
        <div className="mt-6 rounded-[2rem] bg-[var(--surface)] p-6 sm:p-8 shadow-[0_14px_45px_rgba(23,59,42,0.06)] border border-[var(--border)]">
          {/* Header & Dietary Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#579169]">
                <span className="size-2 rounded-full bg-[#579169] animate-pulse" />
                Live Serving
              </div>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
                {activeMealConfig.name} at {hallName}
              </h3>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                Served between {activeMealConfig.time} · Freshly updated from hostel store
              </p>
            </div>

            {/* Dietary Filter Buttons */}
            <div className="flex items-center gap-1.5 rounded-xl bg-[var(--surface-2)] p-1 border border-[var(--border)]">
              {(["all", "veg", "non-veg"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDietFilter(filter)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    dietFilter === filter
                      ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {filter === "all" ? "All Items" : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Dish List */}
          <div className="mt-6">
            {menuLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 py-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-[var(--surface-2)] animate-pulse" />
                ))}
              </div>
            ) : displayedItems.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {displayedItems.map((dish: any, idx: number) => {
                  const rating = getItemRating(dish.name);
                  const count = getItemRatingCount(dish.name);
                  const isVeg = dish.isVeg !== false;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 transition-all hover:border-[#579169]/40 hover:bg-[var(--surface)] hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FoodIndicator isVeg={isVeg} />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[var(--ink)] truncate group-hover:text-[var(--forest)] transition-colors">
                            {dish.name}
                          </p>
                          <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                            {isVeg ? "Vegetarian" : "Non-Vegetarian"}
                          </p>
                        </div>
                      </div>

                      {/* Dish Rating */}
                      <div className="flex flex-col items-end shrink-0">
                        {rating ? (
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star className="size-3.5 fill-current" />
                            <span>{rating.toFixed(1)}</span>
                            <span className="text-[10px] text-[var(--ink-muted)] font-normal">
                              ({count})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[var(--ink-muted)]/60 font-medium">
                            Unrated
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--ink-muted)]">
                <Utensils className="size-10 stroke-1 mb-2 opacity-40" />
                <p className="font-semibold text-sm">No dishes scheduled for this filter</p>
                <p className="text-xs opacity-75 mt-0.5">Try toggling to "All Items" or select another meal</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------- FEEDBACK & QUICK POLL SECTION -------------------- */}
      <section id="feedback" className="bg-[#e6eee3] dark:bg-[#121c15] px-4 py-20 sm:px-8 lg:px-12 transition-colors">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left Text */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#173b2a] dark:text-[#d9f36b]">
              Make Your Voice Count
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl text-[#173b2a] dark:text-white leading-[1.02]">
              Good food gets better with honest feedback.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#173b2a]/75 dark:text-white/70">
              Tell the mess team and SAC council what worked today. Student feedback directly
              influences supplier vendor quality and weekly menu revisions.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Link href="/feedback">
                <Button variant="forest" size="lg" className="gap-2">
                  <span>Detailed Feedback Form</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Poll Card */}
          <div className="rounded-[2rem] bg-[var(--surface)] p-6 sm:p-8 shadow-xl border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                  Live Community Poll
                </p>
                <p className="mt-1 text-xl font-extrabold text-[var(--ink)]">
                  How was {activeMealConfig.name} today?
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#fff1cf] text-[#e0a63b] shadow-sm">
                <Star className="size-5 fill-current" />
              </div>
            </div>

            {/* Voting Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleVote("up")}
                className={`vote-button ${userVote === "up" ? "vote-button-active" : ""}`}
              >
                <ThumbsUp className="size-4" /> Loved it
              </button>
              <button
                onClick={() => handleVote("down")}
                className={`vote-button ${userVote === "down" ? "vote-button-active" : ""}`}
              >
                <ThumbsDown className="size-4" /> Needs work
              </button>
            </div>

            {/* Confirmation State */}
            {voteSubmitted && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 text-xs font-bold text-[#579169]"
              >
                <Check className="size-4" /> Thank you — your response was recorded in the live tally.
              </motion.p>
            )}

            {/* Poll Metrics & Progress Bar */}
            <div className="mt-6 border-t border-[var(--border)] pt-5">
              <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-semibold mb-2">
                <span>{pollStats.total} responses today</span>
                <span className="text-[#579169] font-bold">
                  {pollStats.total > 0 ? Math.round((pollStats.likes / pollStats.total) * 100) : 85}% positive
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)] flex">
                <div
                  className="bg-[#579169] transition-all duration-500 rounded-full"
                  style={{
                    width: `${pollStats.total > 0 ? (pollStats.likes / pollStats.total) * 100 : 85}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- ANNOUNCEMENTS SECTION -------------------- */}
      <section id="announcements" className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-20 scroll-mt-20">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#579169]">
              Stay In The Loop
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)]">
              Campus updates,<br />without the noise.
            </h2>
            <p className="mt-4 text-sm text-[var(--ink-muted)] leading-relaxed">
              Official mess notices, holiday schedule changes, and monthly SAC menu revision announcements.
            </p>
            <div className="mt-6">
              <Link href="/notifications">
                <Button variant="soft" size="md" className="gap-2">
                  <span>View All Notifications</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Notices Feed */}
          <div className="flex flex-col divide-y divide-[var(--border)] rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-6 sm:px-8 shadow-sm">
            {notifications.map((notif) => (
              <article key={notif._id} className="flex gap-4 sm:gap-5 py-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f8d9a7] text-[#8c5916]">
                  <CalendarDays className="size-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-bold text-sm sm:text-base text-[var(--ink)]">{notif.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
                      {notif.date}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--ink-muted)]">
                    {notif.message}
                  </p>
                </div>
              </article>
            ))}

            <article className="flex gap-4 sm:gap-5 py-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#c8e5d3] text-[#1c633a]">
                <Download className="size-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-bold text-sm sm:text-base text-[var(--ink)]">Weekly Mess Menu PDF</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
                    Verified
                  </span>
                </div>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--ink-muted)]">
                  Download the complete printable weekly PDF menu for offline dining reference.
                </p>
                <a
                  href="/mess-menu.pdf"
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#579169] hover:underline"
                >
                  Download Menu PDF <ArrowRight className="size-3.5" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* -------------------- FOOTER -------------------- */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-10 px-4 sm:px-8 lg:px-12 transition-colors">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 text-xs text-[var(--ink-muted)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-[#173b2a] text-[#d9f36b]">
              <Utensils className="size-3" />
            </span>
            <span className="font-extrabold text-[var(--forest)] text-sm">MealSync</span>
            <span className="text-[var(--ink-muted)]/50">|</span>
            <span>IIITDM Kancheepuram Dining Portal</span>
          </div>
          <div>© {new Date().getFullYear()} MealSync. Designed for campus life.</div>
        </div>
      </footer>
    </main>
  );
}
