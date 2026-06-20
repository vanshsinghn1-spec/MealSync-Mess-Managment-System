"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { CalendarDays, HelpCircle, RefreshCw, Sun, CloudSun, Coffee, Moon } from "lucide-react";
import FoodIndicator from "@/components/layout/FoodIndicator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";

const getMealHeaderIcon = (meal: string) => {
  switch (meal) {
    case "breakfast": return <Sun size={13} className="text-amber-500" />;
    case "lunch": return <CloudSun size={13} className="text-sky-400" />;
    case "snacks": return <Coffee size={13} className="text-orange-400" />;
    default: return <Moon size={13} className="text-indigo-400" />;
  }
};

export default function WeeklyMenuPage() {
  const { data: session } = useSession();
  const userMessId = (session?.user as any)?.messId;

  const [selectedMess, setSelectedMess] = useState<"mess-1" | "mess-2">("mess-1");
  const [weekType, setWeekType] = useState<"odd" | "even">("even");
  const [weeklyMenu, setWeeklyMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Set default mess from session if possible
  useEffect(() => {
    if (userMessId?.slug) {
      setSelectedMess(userMessId.slug as any);
    }
  }, [userMessId]);

  useEffect(() => {
    async function loadWeekly() {
      try {
        setLoading(true);
        // Find mess mongo ID
        let dbMessId = selectedMess === "mess-1" ? "60d07e6181f9f25712e3e6f1" : "60d07e6181f9f25712e3e6f2";
        // If we are looking for the user's assigned mess, we can use the actual ID
        if (userMessId && (userMessId.slug === selectedMess || userMessId._id === selectedMess)) {
          dbMessId = userMessId._id;
        }

        const res = await api.get(`/menu/weekly/${dbMessId}?weekType=${weekType}`);
        setWeeklyMenu(res.data.weekly);
      } catch (err) {
        console.error("Error loading weekly menu:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      loadWeekly();
    }
  }, [selectedMess, weekType, session, userMessId]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const meals = ["breakfast", "lunch", "snacks", "dinner"];

  const weekTabs = [
    { value: "even", label: "Even Week" },
    { value: "odd", label: "Odd Week" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl font-display">Weekly Menu Grid</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1">Full schedule view of bi-weekly meal operations</p>
        </div>

        {/* Week odd/even switcher */}
        <div className="flex justify-center sm:justify-start">
          <Tabs
            items={weekTabs}
            value={weekType}
            onChange={(val) => setWeekType(val as "odd" | "even")}
          />
        </div>
      </div>

      {/* Mess toggles */}
      <div className="inline-flex bg-[var(--surface-2)] p-1 rounded-full border border-[var(--border)] max-w-md">
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

      {/* Calendar layout */}
      <Card padding="lg" className="min-h-[400px] relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
              <p className="text-xs text-[var(--ink-muted)]">Generating weekly schedule...</p>
            </div>
          </div>
        ) : weeklyMenu ? (
          <div className="space-y-8">
            {days.map((day) => (
              <div key={day} className="border-b border-[var(--border)] last:border-none pb-8 last:pb-0 space-y-4">
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2 font-display">
                  <CalendarDays size={16} className="text-[var(--accent)]" />
                  {day}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {meals.map((meal) => {
                    const items = weeklyMenu[day]?.[meal] || [];
                    return (
                      <div key={meal} className="p-4 bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/15 rounded-2xl space-y-3 transition-colors duration-200 group">
                        <div className="text-[10px] text-[var(--ink-muted)] font-bold uppercase tracking-wider capitalize flex items-center justify-between">
                          <span>{meal}</span>
                          <span className="flex-shrink-0">
                            {getMealHeaderIcon(meal)}
                          </span>
                        </div>
                        <ul className="text-xs font-normal text-[var(--ink)] space-y-1.5 divide-y divide-[var(--border)]">
                          {items.length > 0 ? (
                            items.map((item: any, index: number) => (
                              <li key={index} className="py-2 flex items-center gap-2 text-[var(--ink)] first:pt-0">
                                <FoodIndicator isVeg={true} />
                                <span className="truncate group-hover:text-[var(--accent-strong)] transition-colors">{item.name}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-[var(--ink-muted)]/50 italic py-2 first:pt-0">Not Scheduled</li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--ink-muted)]">
            <HelpCircle size={40} className="mb-3 text-[var(--ink-muted)]/50" />
            <p className="text-sm font-semibold">No weekly menu entries found for this mess.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

