"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { UtensilsCrossed, Calendar, Flame, AlertCircle } from "lucide-react";
import FoodIndicator from "@/components/layout/FoodIndicator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";

export default function TodayMenuPage() {
  const { data: session } = useSession();
  const userMessId = (session?.user as any)?.messId;
  const userMessName = userMessId?.name || "Your Mess";
  const userMessSlug = userMessId?.slug || "mess-1";

  const [selectedMeal, setSelectedMeal] = useState<string>("breakfast");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [nonVegItems, setNonVegItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayDetails, setDayDetails] = useState({ day: "", weekType: "" });

  useEffect(() => {
    async function fetchMenu() {
      try {
        setLoading(true);
        const res = await api.get(`/menu/today?meal=${selectedMeal}`);
        setDayDetails({ day: res.data.day, weekType: res.data.weekType });

        const activeVeg = res.data.vegMenus?.find(
          (m: any) => m.messId.slug === userMessSlug || m.messId._id === userMessId?._id || m.messId === userMessId
        );
        setMenuItems(activeVeg ? activeVeg.items : []);

        const activeNonVeg = res.data.nonVegMenus?.find(
          (m: any) => m.messId.slug === userMessSlug || m.messId._id === userMessId?._id || m.messId === userMessId
        );
        setNonVegItems(activeNonVeg ? activeNonVeg.items : []);
      } catch (err) {
        console.error("Error loading today's menu:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchMenu();
    }
  }, [selectedMeal, session, userMessId]);

  const mealTabs = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "snacks", label: "Snacks" },
    { value: "dinner", label: "Dinner" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl font-display">Today's Mess Menu</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1">Viewing menu items assigned to {userMessName}</p>
      </div>

      {/* Control Selector */}
      <div className="flex justify-center sm:justify-start">
        <Tabs
          items={mealTabs}
          value={selectedMeal}
          onChange={(val) => setSelectedMeal(val)}
          className="w-full sm:w-auto"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Menu items */}
        <Card padding="lg" className="lg:col-span-2 min-h-[350px] relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
                <p className="text-xs text-[var(--ink-muted)]">Fetching daily items...</p>
              </div>
            </div>
          ) : menuItems.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--ink)] capitalize font-display">{selectedMeal} Details</h3>
                  <p className="text-xs text-[var(--ink-muted)] mt-0.5">
                    {dayDetails.day} ({dayDetails.weekType.toUpperCase()} Week)
                  </p>
                </div>
                <Badge variant="default" className="text-[10px] uppercase font-bold">
                  Standard Veg
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {menuItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/30 rounded-2xl flex items-center gap-4 transition-all duration-200 group"
                  >
                    <FoodIndicator isVeg={true} />
                    <span className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--accent-strong)] transition-colors">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-[var(--ink-muted)]">
              <UtensilsCrossed size={40} className="mb-3 text-[var(--ink-muted)]/50" />
              <p className="text-sm font-semibold">No menu set for today's {selectedMeal}.</p>
            </div>
          )}
        </Card>

        {/* Right 1 Col: Non veg add-ons */}
        <Card padding="lg">
          <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2 uppercase tracking-wide mb-3 font-display">
            <Flame size={16} className="text-[var(--accent)]" />
            Special Paid Extras
          </h3>
          <p className="text-xs text-[var(--ink-muted)] mb-5">
            Special additions prepared for today's {selectedMeal} that can be purchased extra.
          </p>

          <hr className="border-[var(--border)] mb-5" />

          {loading ? (
            <div className="py-10 text-center text-[var(--ink-muted)] text-xs">Loading extras...</div>
          ) : nonVegItems.length > 0 ? (
            <div className="space-y-3">
              {nonVegItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <FoodIndicator isVeg={item.isVeg} />
                    <span className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--accent-strong)] transition-colors">{item.name}</span>
                  </div>
                  <Badge variant="muted" className="text-xs font-extrabold px-3 py-1 bg-[var(--surface)] text-[var(--ink)] border border-[var(--border)]">
                    ₹{item.cost}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl text-xs text-[var(--ink-muted)]">
              <AlertCircle size={15} className="text-[var(--ink-muted)]/65 flex-shrink-0 mt-0.5" />
              <span>No non-veg extras listed for today's {selectedMeal}.</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

