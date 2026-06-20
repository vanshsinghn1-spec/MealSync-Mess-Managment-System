"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Star, MessageSquare, Award, ArrowUpRight, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";

export default function FeedbackPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "student";
  const userMessId = (session?.user as any)?.messId;

  const [activeTab, setActiveTab] = useState<string>("recent");
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [myFeedback, setMyFeedback] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [itemRatings, setItemRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset active tab if user is not student and has "my" tab selected
    if (userRole !== "student" && activeTab === "my") {
      setActiveTab("recent");
    }
  }, [userRole, activeTab]);

  useEffect(() => {
    async function loadFeedback() {
      try {
        setLoading(true);
        const actualMessId = userMessId?._id || userMessId || "60d07e6181f9f25712e3e6f1";

        if (activeTab === "recent") {
          const res = await api.get("/feedback/recent?limit=15");
          setRecentFeedback(res.data);
        } else if (activeTab === "my" && userRole === "student") {
          const res = await api.get("/feedback/my");
          setMyFeedback(res.data);
        } else if (activeTab === "summary" && (userRole === "admin" || userRole === "mess_official")) {
          const res = await api.get(`/feedback/summary/${actualMessId}`);
          setSummaryData(res.data);
        } else if (activeTab === "items" && (userRole === "admin" || userRole === "mess_official")) {
          const res = await api.get(`/feedback/ratings/${actualMessId}`);
          setItemRatings(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      loadFeedback();
    }
  }, [activeTab, session, userRole, userMessId]);

  const tabsItems = [
    { value: "recent", label: "Recent Feed" },
    ...(userRole === "student" ? [{ value: "my", label: "My Reviews" }] : []),
    ...((userRole === "admin" || userRole === "mess_official") ? [
      { value: "summary", label: "Meal Summary" },
      { value: "items", label: "Item Analytics" }
    ] : [])
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl font-display">Feedback Board</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1">Review student ratings and dining logs</p>
      </div>

      {/* Navigation tabs */}
      <div className="flex justify-center sm:justify-start">
        <Tabs
          items={tabsItems}
          value={activeTab}
          onChange={(val) => setActiveTab(val)}
        />
      </div>

      {/* Main content display */}
      <Card padding="lg" className="min-h-[350px] relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
              <p className="text-xs text-[var(--ink-muted)]">Querying feedback database...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* 1. RECENT PUBLIC FEEDBACK LIST */}
            {activeTab === "recent" && (
              recentFeedback.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentFeedback.map((feed) => (
                    <div key={feed._id} className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl space-y-3 hover:border-[var(--accent)]/30 transition-all duration-200 group">
                      <div className="flex items-center justify-between text-xs">
                        <div className="font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">{feed.messId?.name}</div>
                        <span className="text-[var(--ink-muted)] capitalize">{feed.meal} — {new Date(feed.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                      </div>
                      
                      <div className="space-y-1.5 pt-1">
                        {feed.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-[var(--ink-muted)] font-normal">{item.foodItem}</span>
                            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                              <Star size={11} fill="currentColor" />
                              {item.rating}
                            </span>
                          </div>
                        ))}
                      </div>

                      {feed.overallComment && (
                        <div className="text-[11px] text-[var(--ink-muted)]/80 italic border-t border-[var(--border)] pt-2.5 flex items-start gap-1">
                          <MessageSquare size={12} className="mt-0.5 flex-shrink-0" />
                          <span>"{feed.overallComment}"</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-[var(--ink-muted)] text-xs">No feedback records found.</div>
              )
            )}

            {/* 2. STUDENT'S OWN FEEDBACK HISTORY */}
            {activeTab === "my" && (
              myFeedback.length > 0 ? (
                <div className="space-y-4">
                  {myFeedback.map((feed) => (
                    <div key={feed._id} className="p-5 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl space-y-4">
                      <div className="flex justify-between items-center text-xs pb-2.5 border-b border-[var(--border)]">
                        <div>
                          <span className="font-bold text-[var(--ink)] capitalize">{feed.meal} Meal</span>
                          <span className="text-[var(--ink-muted)]/40 mx-2">|</span>
                          <span className="text-[var(--ink-muted)] font-medium">{feed.messId?.name}</span>
                        </div>
                        <span className="text-[var(--ink-muted)] uppercase font-semibold">
                          {new Date(feed.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {feed.items.map((item: any, i: number) => (
                          <div key={i} className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <div className="font-semibold text-[var(--ink)]">{item.foodItem}</div>
                              {item.comment && <p className="text-[10px] text-[var(--ink-muted)] mt-0.5">"{item.comment}"</p>}
                            </div>
                            <span className="flex items-center gap-0.5 text-amber-500 font-extrabold bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                              {item.rating}★
                            </span>
                          </div>
                        ))}
                      </div>

                      {feed.overallComment && (
                        <p className="text-xs text-[var(--ink-muted)] italic bg-[var(--surface)] border border-[var(--border)] p-3 rounded-xl">
                          Overall Comment: "{feed.overallComment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-[var(--ink-muted)] text-xs">You have not submitted any reviews yet.</div>
              )
            )}

            {/* 3. RATINGS SUMMARY TABLE FOR OFFICIALS */}
            {activeTab === "summary" && (
              summaryData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[10px] text-[var(--ink-muted)] uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Meal Type</th>
                        <th className="py-3 px-4">Review Submissions</th>
                        <th className="py-3 px-4">Student Count</th>
                        <th className="py-3 px-4 text-right">Average Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] text-xs text-[var(--ink)]">
                      {summaryData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[var(--surface-2)]">
                          <td className="py-3.5 px-4 font-medium">
                            {new Date(row.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="py-3.5 px-4 capitalize font-semibold text-[var(--accent-strong)]">{row.meal}</td>
                          <td className="py-3.5 px-4">{row.feedbackCount} logs</td>
                          <td className="py-3.5 px-4 text-[var(--ink-muted)]">{row.totalStudents} students</td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-amber-500">
                            {row.avgRating.toFixed(1)}★
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-[var(--ink-muted)] text-xs">No summary stats recorded.</div>
              )
            )}

            {/* 4. FOOD ITEM PERFORMANCE LEADERBOARD */}
            {activeTab === "items" && (
              itemRatings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itemRatings.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl flex items-center justify-between group hover:border-[var(--accent)]/30 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xs text-[var(--accent)] font-bold group-hover:scale-105 transition-transform">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--ink)]">{item.foodItem}</div>
                          <div className="text-[10px] text-[var(--ink-muted)] mt-0.5">{item.count} reviews compiled</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 font-extrabold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                        <Star size={13} fill="currentColor" />
                        {item.avgRating.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-[var(--ink-muted)] text-xs">No item statistics generated.</div>
              )
            )}

          </div>
        )}
      </Card>
    </div>
  );
}

