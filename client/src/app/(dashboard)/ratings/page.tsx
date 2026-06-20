"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Star, MessageSquare, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import FoodIndicator from "@/components/layout/FoodIndicator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";

interface FeedbackItemInput {
  foodItem: string;
  rating: number;
  comment: string;
}

export default function RateMealPage() {
  const { data: session } = useSession();
  const userMessId = (session?.user as any)?.messId;
  const userMessSlug = userMessId?.slug || "mess-1";

  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Rating values
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [overallComment, setOverallComment] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        setError(null);
        setSuccess(false);

        const res = await api.get(`/menu/today?meal=${activeMeal}`);
        const activeVeg = res.data.vegMenus?.find(
          (m: any) => m.messId.slug === userMessSlug || m.messId._id === userMessId?._id || m.messId === userMessId
        );
        const vegItems = activeVeg ? activeVeg.items : [];

        const activeNonVeg = res.data.nonVegMenus?.find(
          (m: any) => m.messId.slug === userMessSlug || m.messId._id === userMessId?._id || m.messId === userMessId
        );
        const nonVegItems = activeNonVeg ? activeNonVeg.items : [];

        // Combine standard and extra items
        const combined = [
          ...vegItems.map((item: any) => ({ name: item.name, isVeg: true })),
          ...nonVegItems.map((item: any) => ({ name: item.name, isVeg: false }))
        ];

        setMenuItems(combined);

        // Initialize ratings to 5 stars
        const initialRatings: Record<string, number> = {};
        const initialComments: Record<string, string> = {};
        combined.forEach(item => {
          initialRatings[item.name] = 5;
          initialComments[item.name] = "";
        });
        setRatings(initialRatings);
        setComments(initialComments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      loadMenu();
    }
  }, [activeMeal, session, userMessId]);

  const handleRatingChange = (itemName: string, value: number) => {
    setRatings(prev => ({ ...prev, [itemName]: value }));
  };

  const handleCommentChange = (itemName: string, value: string) => {
    setComments(prev => ({ ...prev, [itemName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actualMessId = userMessId?._id || userMessId;
    if (!actualMessId) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const itemsPayload: FeedbackItemInput[] = menuItems.map((item: any) => ({
        foodItem: item.name,
        rating: ratings[item.name] || 5,
        comment: comments[item.name] || ""
      }));

      await api.post("/feedback", {
        messId: actualMessId,
        meal: activeMeal,
        items: itemsPayload,
        overallComment
      });

      setSuccess(true);
      setOverallComment("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit ratings.");
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl font-display">Submit Meal Ratings</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1">Rate individual items to help improve hostel dining quality</p>
      </div>

      {/* Selector */}
      <div className="flex justify-center sm:justify-start">
        <Tabs
          items={mealTabs}
          value={activeMeal}
          onChange={(val) => setActiveMeal(val)}
        />
      </div>

      {/* Main content form */}
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <Card padding="lg" className="min-h-[250px] relative space-y-6">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
                  <p className="text-xs text-[var(--ink-muted)]">Loading food items...</p>
                </div>
              </div>
            ) : menuItems.length > 0 ? (
              <div className="space-y-6">
                <div className="border-b border-[var(--border)] pb-3 text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider">
                  Menu Items to Review
                </div>

                <div className="space-y-4">
                  {menuItems.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl space-y-3.5 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FoodIndicator isVeg={item.isVeg} />
                          <span className="text-sm font-semibold text-[var(--ink)]">{item.name}</span>
                        </div>

                        {/* Interactive stars selection */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange(item.name, star)}
                              className="text-[var(--ink-muted)]/40 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                size={18}
                                fill={star <= (ratings[item.name] || 5) ? "var(--warning)" : "none"}
                                className={star <= (ratings[item.name] || 5) ? "text-[var(--warning)]" : "text-[var(--ink-muted)]/40"}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Text Comment */}
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]/50">
                          <MessageSquare size={14} />
                        </div>
                        <input
                          type="text"
                          value={comments[item.name] || ""}
                          onChange={(e) => handleCommentChange(item.name, e.target.value)}
                          placeholder="Optional comment about this dish..."
                          className="w-full bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--accent)] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-[var(--ink)] outline-none transition-colors duration-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--ink-muted)] text-xs">
                <AlertCircle className="mb-2 text-[var(--ink-muted)]/60" />
                No items scheduled to rate in today's {activeMeal}.
              </div>
            )}
          </Card>

          {menuItems.length > 0 && (
            <Card padding="lg" className="space-y-4">
              <label className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider block">
                Overall Comments
              </label>
              <textarea
                rows={3}
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                placeholder="Give a short overview of today's meal preparation, service, or sanitation..."
                className="w-full bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--accent)] rounded-2xl p-4 text-xs text-[var(--ink)] outline-none transition-colors duration-200 resize-none"
              />
            </Card>
          )}

          {success && (
            <div className="p-4 bg-[var(--accent-soft)] text-[var(--success)] text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>
                Thank you! Your ratings have been submitted. View reviews on the{" "}
                <Link href="/feedback" className="underline font-bold">Feedback history</Link> page.
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-[var(--danger)]/10 text-[var(--danger)] text-xs rounded-2xl flex items-start gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {menuItems.length > 0 && (
            <Button
              type="submit"
              disabled={submitting}
              variant="accent"
              className="px-6 py-3 text-xs font-bold rounded-2xl shadow-sm"
            >
              {submitting ? "Submitting Ratings..." : "Submit Ratings"}
              <Save size={14} />
            </Button>
          )}

        </form>
      </div>

    </div>
  );
}

