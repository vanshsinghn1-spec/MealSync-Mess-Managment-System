"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Star,
  Sparkles,
  ArrowLeftRight,
  ShieldCheck,
  Bell,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Save,
  Plus,
  Trash,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import FoodIndicator from "@/components/layout/FoodIndicator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "student";
  const userMessId = (session?.user as any)?.messId;
  const userName = session?.user?.name || "User";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl font-display">
            Welcome, {userName}!
          </h1>
          <p className="text-sm text-[var(--ink-muted)] capitalize flex items-center gap-1.5 mt-0.5">
            <span>Logged in as {userRole?.replace("_", " ")}</span>
            {userRole === "student" && userMessId?.name && (
              <>
                <span className="text-[var(--ink-muted)]/50">•</span>
                <span className="text-[var(--accent-strong)] font-bold">{userMessId.name}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--ink-muted)] shadow-card">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Active Session
        </div>
      </div>

      {/* Conditional Dashboard Rendering */}
      {userRole === "student" && <StudentDashboard userMessId={userMessId} />}
      {userRole === "mess_official" && <MessOfficialDashboard userMessId={userMessId} />}
      {userRole === "admin" && <AdminDashboard />}
    </div>
  );
}

/* -------------------------------------------------------------------------
   1. STUDENT DASHBOARD
   ------------------------------------------------------------------------- */
function StudentDashboard({ userMessId }: { userMessId: any }) {
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [menuItems, setMenuItems] = useState<any[]>([]);

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
    setActiveMeal(getCurrentMealByTime());
  }, []);
  const [nonVegItems, setNonVegItems] = useState<any[]>([]);
  const [hasVoted, setHasVoted] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [switchRequests, setSwitchRequests] = useState<any[]>([]);
  const [switchEnabled, setSwitchEnabled] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch today's menu
        const menuRes = await api.get(`/menu/today?meal=${activeMeal}`);
        const userMessSlug = userMessId?.slug || "mess-1";
        
        const activeVeg = menuRes.data.vegMenus?.find((m: any) => m.messId.slug === userMessSlug || m.messId._id === userMessId?._id || m.messId === userMessId);
        setMenuItems(activeVeg ? activeVeg.items : []);

        const activeNonVeg = menuRes.data.nonVegMenus?.find((m: any) => m.messId.slug === userMessSlug || m.messId._id === userMessId?._id || m.messId === userMessId);
        setNonVegItems(activeNonVeg ? activeNonVeg.items : []);

        // Fetch notifications
        const notifRes = await api.get("/notifications");
        setNotifications(notifRes.data);

        // Fetch user switch requests
        const switchRes = await api.get("/mess-switch/my");
        setSwitchRequests(switchRes.data);

        // Fetch switch status
        const statusRes = await api.get("/mess-switch/status");
        setSwitchEnabled(statusRes.data.isEnabled);
      } catch (err) {
        console.error("Error loading student dashboard data:", err);
      }
    }
    loadData();
  }, [activeMeal, userMessId]);

  const handleVote = async (voteType: "like" | "dislike") => {
    try {
      const actualMessId = userMessId?._id || userMessId;
      if (!actualMessId) return;
      await api.post("/polls/vote", {
        messId: actualMessId,
        meal: activeMeal,
        vote: voteType
      });
      setHasVoted(voteType);
    } catch (e) {
      console.error("Error voting:", e);
    }
  };

  const mealTabs = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "snacks", label: "Snacks" },
    { value: "dinner", label: "Dinner" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Menu & Quick Vote (2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Meal toggles */}
        <div className="flex justify-center sm:justify-start">
          <Tabs
            items={mealTabs}
            value={activeMeal}
            onChange={(val) => {
              setActiveMeal(val);
              setHasVoted(null);
            }}
            className="w-full sm:w-auto"
          />
        </div>

        {/* Menu details */}
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--ink)] tracking-tight font-display capitalize">
                Today's {activeMeal} Menu
              </h2>
              <p className="text-xs text-[var(--ink-muted)]">Standard menu items seeded for your mess</p>
            </div>
            <Link href="/ratings">
              <Button variant="soft" size="sm" className="font-semibold">
                <Star size={14} fill="currentColor" />
                Submit Review
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {menuItems.length > 0 ? (
              menuItems.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-3">
                  <FoodIndicator isVeg={true} />
                  <span className="text-sm font-semibold text-[var(--ink)]">{item.name}</span>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-10 text-center text-[var(--ink-muted)] text-xs">
                No menu items set for this meal.
              </div>
            )}
          </div>
        </Card>

        {/* Quick Vote Card */}
        <Card padding="lg" className="bg-gradient-to-br from-[var(--surface-2)] to-[var(--bg)]">
          <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2 uppercase tracking-wider mb-2 font-display">
            <Sparkles size={16} className="text-[var(--accent)]" />
            Cast Your Vote
          </h3>
          <p className="text-xs text-[var(--ink-muted)] mb-5">
            How was the {activeMeal} today? Likes and dislikes help mess representatives evaluate quality.
          </p>

          <div className="flex gap-4">
            <Button
              onClick={() => handleVote("like")}
              variant={hasVoted === "like" ? "accent" : "outline"}
              className="flex-1 py-4.5 rounded-2xl text-xs font-bold"
            >
              <ThumbsUp size={15} fill={hasVoted === "like" ? "currentColor" : "none"} />
              Delicious
            </Button>
            <Button
              onClick={() => handleVote("dislike")}
              variant={hasVoted === "dislike" ? "accent" : "outline"}
              className={`flex-1 py-4.5 rounded-2xl text-xs font-bold ${hasVoted === "dislike" ? "bg-[var(--danger)] hover:bg-[var(--danger)]" : ""}`}
            >
              <ThumbsDown size={15} fill={hasVoted === "dislike" ? "currentColor" : "none"} />
              Disappointing
            </Button>
          </div>
        </Card>

      </div>

      {/* Mess switch & Notifications (1 column) */}
      <div className="space-y-6">
        
        {/* Mess switch request status */}
        <Card padding="lg">
          <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2 uppercase tracking-wide mb-3 font-display">
            <ArrowLeftRight size={16} className="text-[var(--accent)]" />
            Mess Switching
          </h3>
          <p className="text-xs text-[var(--ink-muted)] leading-relaxed mb-4">
            {switchEnabled
              ? "Mess switching window is currently active. You can request to change your dining assignment."
              : "Mess switching is currently closed. Contact the administrator for immediate needs."}
          </p>

          {switchRequests.length > 0 ? (
            <div className="space-y-2 mb-4">
              <div className="text-[9px] text-[var(--ink-muted)] uppercase font-bold tracking-wider">Your Requests</div>
              {switchRequests.slice(0, 2).map((req, idx) => (
                <div key={idx} className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[var(--ink)]">To {req.toMess?.name}</span>
                    <p className="text-[10px] text-[var(--ink-muted)] mt-0.5">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={req.status === "approved" ? "success" : req.status === "rejected" ? "danger" : "muted"}>
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : null}

          {switchEnabled && (
            <Link href="/mess-switch" className="block w-full">
              <Button variant="accent" className="w-full text-xs font-bold rounded-2xl shadow-sm">
                Submit Switch Request
              </Button>
            </Link>
          )}
        </Card>

        {/* Notifications */}
        <Card padding="lg">
          <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2 uppercase tracking-wide mb-4 font-display">
            <Bell size={16} className="text-[var(--accent)]" />
            Latest Announcements
          </h3>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.slice(0, 3).map((notif, idx) => (
                <div key={idx} className="border-b border-[var(--border)] pb-3 last:border-none last:pb-0 space-y-1">
                  <div className="text-xs font-bold text-[var(--ink)]">{notif.title}</div>
                  <p className="text-[11px] text-[var(--ink-muted)] leading-normal">{notif.message}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[var(--ink-muted)] text-xs">No alerts posted.</div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   2. MESS OFFICIAL DASHBOARD
   ------------------------------------------------------------------------- */
function MessOfficialDashboard({ userMessId }: { userMessId: any }) {
  const [meal, setMeal] = useState("lunch");
  
  // Non veg add state
  const [nvName, setNvName] = useState("");
  const [nvCost, setNvCost] = useState("");
  const [nvIcon, setNvIcon] = useState("non-veg");
  const [nonVegLoading, setNonVegLoading] = useState(false);
  const [nvSuccess, setNvSuccess] = useState(false);

  // Waste state
  const [wasteItem, setWasteItem] = useState("");
  const [wasteAmt, setWasteAmt] = useState("");
  const [wasteList, setWasteList] = useState<{ foodItem: string; leftoverAmount: string }[]>([]);
  const [wasteLoading, setWasteLoading] = useState(false);
  const [wasteSuccess, setWasteSuccess] = useState(false);

  // Stats state
  const [ratingsCount, setRatingsCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const actualMessId = userMessId?._id || userMessId;
        if (!actualMessId) return;
        const res = await api.get(`/feedback/ratings/${actualMessId}`);
        const total = res.data.reduce((acc: number, item: any) => acc + item.count, 0);
        const avg = res.data.length
          ? res.data.reduce((acc: number, item: any) => acc + item.avgRating, 0) / res.data.length
          : 0;

        setRatingsCount(total);
        setAvgRating(Math.round(avg * 10) / 10 || 0);
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, [userMessId]);

  const handleAddNonVeg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nvName || !nvCost) return;

    try {
      setNonVegLoading(true);
      const actualMessId = userMessId?._id || userMessId;
      await api.post("/menu/non-veg", {
        messId: actualMessId,
        meal,
        items: [{ name: nvName, cost: parseFloat(nvCost), icon: nvIcon }]
      });
      setNvSuccess(true);
      setNvName("");
      setNvCost("");
      setTimeout(() => setNvSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setNonVegLoading(false);
    }
  };

  const handleAddWasteItem = () => {
    if (!wasteItem || !wasteAmt) return;
    setWasteList([...wasteList, { foodItem: wasteItem, leftoverAmount: wasteAmt + " kg" }]);
    setWasteItem("");
    setWasteAmt("");
  };

  const handleRemoveWasteItem = (idx: number) => {
    setWasteList(wasteList.filter((_, i) => i !== idx));
  };

  const handleLogWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wasteList.length === 0) return;

    try {
      setWasteLoading(true);
      const actualMessId = userMessId?._id || userMessId;
      await api.post("/waste", {
        messId: actualMessId,
        meal,
        items: wasteList
      });
      setWasteSuccess(true);
      setWasteList([]);
      setTimeout(() => setWasteSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setWasteLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Stats & Add Non-Veg Extras */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card padding="lg" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-2xl pointer-events-none" />
            <h4 className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider font-display">Overall Average Rating</h4>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-[var(--ink)]">{avgRating}★</span>
              <span className="text-xs text-[var(--ink-muted)]">last 30 days</span>
            </div>
          </Card>
          
          <Card padding="lg" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-2xl pointer-events-none" />
            <h4 className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider font-display">Total Feedbacks Logged</h4>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-[var(--accent)]">{ratingsCount}</span>
              <span className="text-xs text-[var(--ink-muted)]">review entries</span>
            </div>
          </Card>
        </div>

        {/* Add Non-Veg Extra Item Form */}
        <Card padding="lg">
          <div className="mb-6">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2 uppercase tracking-wide font-display">
              <Plus size={18} className="text-[var(--accent)]" />
              Upload Today's Non-Veg Extras
            </h3>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">Submit special extras for students to purchase</p>
          </div>

          <form onSubmit={handleAddNonVeg} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase">Meal Category</label>
                <select
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-xs outline-none text-[var(--ink)] focus:border-[var(--accent)] transition-all duration-200"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase">Item Name</label>
                <input
                  type="text"
                  required
                  value={nvName}
                  onChange={(e) => setNvName(e.target.value)}
                  placeholder="e.g. Chicken Biryani Extra"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-xs outline-none text-[var(--ink)] focus:border-[var(--accent)] transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase">Cost (₹)</label>
                <input
                  type="number"
                  required
                  value={nvCost}
                  onChange={(e) => setNvCost(e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-xs outline-none text-[var(--ink)] focus:border-[var(--accent)] transition-all duration-200"
                />
              </div>
            </div>

            {nvSuccess && (
              <div className="p-3 bg-[var(--accent-soft)] text-[var(--success)] text-xs rounded-xl flex items-center gap-2">
                <CheckCircle size={14} />
                Non-veg extra items added successfully!
              </div>
            )}

            <Button
              type="submit"
              disabled={nonVegLoading}
              variant="accent"
              size="sm"
              className="mt-2"
            >
              {nonVegLoading ? "Submitting..." : "Add Non-Veg Item"}
              <Save size={14} />
            </Button>
          </form>
        </Card>

      </div>

      {/* Right Column: Log Food Waste */}
      <div className="space-y-6">
        <Card padding="lg">
          <div className="mb-6">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2 uppercase tracking-wide font-display">
              <Trash2 size={18} className="text-[var(--danger)]" />
              Log Waste Record
            </h3>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">Record food waste weight generated from today's meal</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase">Food Item</label>
                <input
                  type="text"
                  value={wasteItem}
                  onChange={(e) => setWasteItem(e.target.value)}
                  placeholder="e.g. Rice"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-3 py-2 text-xs outline-none text-[var(--ink)] focus:border-[var(--danger)] transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase">Amount (kg)</label>
                <input
                  type="number"
                  value={wasteAmt}
                  onChange={(e) => setWasteAmt(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-3 py-2 text-xs outline-none text-[var(--ink)] focus:border-[var(--danger)] transition-all duration-200"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAddWasteItem}
              variant="outline"
              className="w-full text-xs font-semibold py-2 rounded-2xl flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              Add Item to List
            </Button>
          </div>

          {wasteList.length > 0 && (
            <div className="space-y-2 bg-[var(--surface-2)] p-3 rounded-2xl border border-[var(--border)] mt-4">
              <div className="text-[9px] text-[var(--ink-muted)] font-bold uppercase tracking-wider">Logging Items</div>
              <div className="space-y-1.5">
                {wasteList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                    <span className="font-medium text-[var(--ink)]">{item.foodItem} ({item.leftoverAmount})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWasteItem(idx)}
                      className="text-[var(--danger)] hover:opacity-85 transition-opacity"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wasteSuccess && (
            <div className="p-3 bg-[var(--accent-soft)] text-[var(--success)] text-xs rounded-xl flex items-center gap-2 mt-4">
              <CheckCircle size={14} />
              Waste record submitted to database!
            </div>
          )}

          <Button
            type="button"
            onClick={handleLogWaste}
            disabled={wasteLoading || wasteList.length === 0}
            className="w-full mt-4 bg-[var(--danger)] hover:bg-[var(--danger)]/90 text-white font-bold text-xs py-3.5 rounded-2xl shadow-sm"
          >
            {wasteLoading ? "Submitting..." : "Submit Waste Record"}
            <Save size={14} />
          </Button>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   3. ADMIN DASHBOARD
   ------------------------------------------------------------------------- */
function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [switchEnabled, setSwitchEnabled] = useState(false);
  
  // Notification form
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [recipient, setRecipient] = useState("all");
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Switch request list
  const [requests, setRequests] = useState<any[]>([]);

  const loadAdminData = async () => {
    try {
      const dashboardRes = await api.get("/admin/dashboard");
      setStats(dashboardRes.data);

      const statusRes = await api.get("/mess-switch/status");
      setSwitchEnabled(statusRes.data.isEnabled);

      const switchRes = await api.get("/admin/switch-requests?status=pending");
      setRequests(switchRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleSwitch = async () => {
    try {
      const newStatus = !switchEnabled;
      await api.put("/admin/feature-toggle/mess_switching", { isEnabled: newStatus });
      setSwitchEnabled(newStatus);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMsg) return;

    try {
      setNotifLoading(true);
      await api.post("/admin/notifications", {
        title: notifTitle,
        message: notifMsg,
        recipientType: recipient
      });
      setNotifSuccess(true);
      setNotifTitle("");
      setNotifMsg("");
      setTimeout(() => setNotifSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleProcessRequest = async (requestId: string, action: "approved" | "rejected") => {
    try {
      await api.put(`/admin/switch-requests/${requestId}`, {
        status: action,
        adminNote: `Request ${action} by Admin.`
      });
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Admin stats & Switch manager (2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Metric summary boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="lg" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--accent)]/5 rounded-full blur-2xl" />
            <h4 className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-wider font-display">Total Active Students</h4>
            <div className="text-3xl font-extrabold text-[var(--ink)] mt-1 font-display">
              {stats ? stats.totalStudents : 0}
            </div>
          </Card>

          <Card padding="lg" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--accent)]/5 rounded-full blur-2xl" />
            <h4 className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-wider font-display">Average Dining Rating</h4>
            <div className="text-3xl font-extrabold text-amber-500 mt-1 font-display">
              {stats ? stats.avgRating : 0}★
            </div>
          </Card>

          <Card padding="lg" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--accent)]/5 rounded-full blur-2xl" />
            <h4 className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-wider font-display">Pending Switch Requests</h4>
            <div className="text-3xl font-extrabold text-[var(--accent)] mt-1 font-display">
              {stats ? stats.pendingRequests : 0}
            </div>
          </Card>
        </div>

        {/* Mess switch request approvals table */}
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-[var(--ink)] uppercase tracking-wide font-display">Pending Switch Requests</h3>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">Approve or reject student dining reallocation requests</p>
            </div>
            <Badge variant="default" className="text-[10px] font-bold">
              {requests.length} Requests
            </Badge>
          </div>

          <div className="overflow-x-auto">
            {requests.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[10px] text-[var(--ink-muted)] uppercase font-bold">
                    <th className="py-2.5 pb-3">Student</th>
                    <th className="py-2.5 pb-3">Swap Details</th>
                    <th className="py-2.5 pb-3">Reason</th>
                    <th className="py-2.5 pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-xs">
                  {requests.map((req) => (
                    <tr key={req._id} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td className="py-4.5">
                        <div className="font-semibold text-[var(--ink)]">{req.studentId?.fullName}</div>
                        <div className="text-[10px] text-[var(--ink-muted)]">{req.studentId?.rollNumber}</div>
                      </td>
                      <td className="py-4.5">
                        <span className="text-[var(--ink)] font-medium">{req.fromMess?.name}</span>
                        <ChevronRight size={10} className="inline mx-1.5 text-[var(--ink-muted)]" />
                        <span className="text-[var(--accent-strong)] font-semibold">{req.toMess?.name}</span>
                      </td>
                      <td className="py-4.5 max-w-[150px] truncate text-[var(--ink-muted)] font-normal" title={req.reason}>
                        {req.reason || "No reason specified"}
                      </td>
                      <td className="py-4.5 text-right space-x-2">
                        <button
                          onClick={() => handleProcessRequest(req._id, "approved")}
                          className="px-3 py-1.5 bg-[var(--accent-soft)] hover:bg-[var(--accent-soft)]/80 text-[var(--accent-strong)] rounded-full text-[11px] font-bold transition cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleProcessRequest(req._id, "rejected")}
                          className="px-3 py-1.5 bg-[var(--danger)]/10 hover:bg-[var(--danger)]/15 text-[var(--danger)] rounded-full text-[11px] font-bold transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-[var(--ink-muted)] text-xs">
                No pending mess switch requests found.
              </div>
            )}
          </div>
        </Card>

      </div>

      {/* Right Column: Controls & Notifications */}
      <div className="space-y-6">
        
        {/* Toggle Mess Switching Option */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider font-display">Switching Feature</h3>
              <p className="text-xs text-[var(--ink-muted)] mt-0.5">Toggle student request reallocations</p>
            </div>
            <button onClick={handleToggleSwitch} className="text-[var(--accent)] hover:opacity-85 transition-opacity cursor-pointer">
              {switchEnabled ? <ToggleRight size={38} /> : <ToggleLeft size={38} className="text-[var(--ink-muted)]/50" />}
            </button>
          </div>
          <div className="p-3.5 bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] flex items-start gap-2.5 text-[11px] leading-relaxed text-[var(--ink-muted)]">
            <Info size={15} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <div>
              {switchEnabled
                ? "Students can currently submit swap requests between dining halls."
                : "Mess switching requests are currently disabled for all students."}
            </div>
          </div>
        </Card>

        {/* Post Notification form */}
        <Card padding="lg">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wide font-display">Publish Announcement</h3>
            <p className="text-xs text-[var(--ink-muted)] mt-0.5">Post system-wide alert or warning banner</p>
          </div>

          <form onSubmit={handleCreateNotification} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase">Target Audience</label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-3 py-2 text-xs outline-none text-[var(--ink)] focus:border-[var(--accent)] transition-all duration-200"
              >
                <option value="all">Everyone</option>
                <option value="students">Students Only</option>
                <option value="mess_officials">Officials Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase">Title</label>
              <input
                type="text"
                required
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. Special Menu Update"
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-3 py-2 text-xs outline-none text-[var(--ink)] focus:border-[var(--accent)] transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--ink-muted)] uppercase">Alert Message</label>
              <textarea
                required
                rows={3}
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                placeholder="Details of the announcement..."
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-3 py-2 text-xs outline-none text-[var(--ink)] focus:border-[var(--accent)] transition-all duration-200 resize-none"
              />
            </div>

            {notifSuccess && (
              <div className="p-3 bg-[var(--accent-soft)] text-[var(--success)] text-xs rounded-xl flex items-center gap-2">
                <CheckCircle size={14} />
                Announcement broadcasted successfully!
              </div>
            )}

            <Button
              type="submit"
              disabled={notifLoading}
              variant="accent"
              className="w-full py-3 text-xs font-bold rounded-2xl shadow-sm"
            >
              {notifLoading ? "Publishing..." : "Broadcast Alert"}
            </Button>
          </form>
        </Card>

      </div>
    </div>
  );
}

