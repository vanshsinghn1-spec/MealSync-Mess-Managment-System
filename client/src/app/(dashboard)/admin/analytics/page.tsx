"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { BarChart3, TrendingUp, Trash2, PieChart as PieIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Prevent Next.js hydration issues with Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await api.get("/admin/analytics");
        setAnalyticsData(res.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchAnalytics();
    }
  }, [session]);

  if (!mounted) return null;

  // Formatting ratingTrends for charting
  const getRatingData = () => {
    if (!analyticsData?.ratingTrends) return [];
    
    // Group trends by date
    const dateGroups: Record<string, any> = {};
    analyticsData.ratingTrends.forEach((trend: any) => {
      const dateStr = new Date(trend.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      if (!dateGroups[dateStr]) {
        dateGroups[dateStr] = { date: dateStr };
      }
      
      // If messId matches Sai or Sheila
      const messName = trend.messId === "mess-1" || trend.messId?.slug === "mess-1" ? "Mess Sai" : "Mess Sheila";
      dateGroups[dateStr][messName] = trend.avgRating;
    });

    return Object.values(dateGroups);
  };

  // Formatting wasteByMeal for charting
  const getWasteData = () => {
    if (!analyticsData?.wasteByMeal) return [];
    return analyticsData.wasteByMeal.map((item: any) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      records: item.totalRecords
    }));
  };

  // Formatting pollResults for charting
  const getPollData = () => {
    if (!analyticsData?.pollResults) return [];
    return analyticsData.pollResults.map((item: any) => ({
      name: item._id === "like" ? "Likes" : "Dislikes",
      value: item.count
    }));
  };

  const COLORS = ["#5B7C6A", "#D6A374", "#8FB39C", "#E0A96D"];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl font-display">Administrative Analytics</h1>
        <p className="text-sm text-[var(--ink-muted)] mt-1">Review ratings trends, waste compilations, and poll distributions</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-[var(--surface)] border border-[var(--border)] rounded-3xl gap-3 shadow-card">
          <span className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
          <p className="text-xs text-[var(--ink-muted)]">Compiling chart data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Ratings Trend */}
          <Card padding="lg" className="space-y-4">
            <CardHeader className="flex items-center justify-between mb-2">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 font-display">
                  <TrendingUp size={16} className="text-[var(--accent)]" />
                  Rating Trends (Last 30 Days)
                </CardTitle>
                <CardDescription>Average rating evolution for Sai and Sheila mess halls</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-72 w-full text-xs">
              {getRatingData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getRatingData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--ink-muted)" />
                    <YAxis domain={[1, 5]} stroke="var(--ink-muted)" />
                    <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)", borderRadius: "12px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="Mess Sai" stroke="#5B7C6A" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Mess Sheila" stroke="#D6A374" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--ink-muted)]">No ratings data recorded in this period.</div>
              )}
            </CardContent>
          </Card>

          {/* Chart 2: Waste by Meal */}
          <Card padding="lg" className="space-y-4">
            <CardHeader className="flex items-center justify-between mb-2">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 font-display">
                  <Trash2 size={16} className="text-red-500" />
                  Waste Logs Count by Meal
                </CardTitle>
                <CardDescription>Total number of leftovers entries compiled per meal category</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-72 w-full text-xs">
              {getWasteData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getWasteData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--ink-muted)" />
                    <YAxis stroke="var(--ink-muted)" />
                    <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)", borderRadius: "12px" }} />
                    <Bar dataKey="records" fill="#5B7C6A" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--ink-muted)]">No food waste data logged in this period.</div>
              )}
            </CardContent>
          </Card>

          {/* Chart 3: Poll results distribution */}
          <Card padding="lg" className="space-y-4 lg:col-span-2">
            <CardHeader className="flex items-center justify-between mb-2">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 font-display">
                  <PieIcon size={16} className="text-[var(--accent)]" />
                  Total Poll Responses Distribution (Likes vs Dislikes)
                </CardTitle>
                <CardDescription>Proportional feedback breakdown for daily served meals</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-72 w-full flex flex-col md:flex-row items-center justify-center gap-8">
              {getPollData().length > 0 ? (
                <>
                  <div className="h-60 w-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPollData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={6}
                          dataKey="value"
                        >
                          {getPollData().map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--ink)", borderRadius: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-3">
                    {getPollData().map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <span className="text-[var(--ink)] font-semibold text-sm">
                          {entry.name}: <span className="text-[var(--accent-strong)] ml-1 font-bold">{entry.value} votes</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-[var(--ink-muted)]">No poll responses recorded in this period.</div>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}

