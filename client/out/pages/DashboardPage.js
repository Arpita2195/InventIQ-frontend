import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { inventoryApi, chatApi, billApi } from "../api";
import { StatCard, ShimmerButton, GradientCard, GlassCard, Badge } from "../components/ui";
import StockAlertCard from "../components/StockAlertCard";
import SalesChart from "../components/SalesChart";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  MessageSquare,
  Package,
  Gift,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Banknote,
  ArrowRight,
  Sparkles
} from "lucide-react";
export default function DashboardPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [billStats, setBillStats] = useState(null);
  const [report, setReport] = useState({
    daily: [],
    topItems: [],
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const [inv, low, rep, bStats] = await Promise.all([
        inventoryApi.getAll(),
        inventoryApi.getLowStock(),
        chatApi.getReports(7),
        billApi.getStats()
      ]);
      setInventory(inv.data);
      setLowStock(low.data);
      setReport(rep.data);
      setBillStats(bStats.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const hour = (/* @__PURE__ */ new Date()).getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const totalValue = inventory.reduce((a, i) => a + i.quantity * i.price, 0);
  const quickActions = [
    {
      to: "/chat",
      label: "Open AI Chat",
      sub: "Smart Assistance",
      icon: /* @__PURE__ */ React.createElement(Sparkles, { size: 18 }),
      color: "primary"
    },
    {
      to: "/inventory",
      label: "Manage Stock",
      sub: "Inventory Tracking",
      icon: /* @__PURE__ */ React.createElement(Package, { size: 18 }),
      color: "secondary"
    },
    {
      to: "/offers",
      label: "WhatsApp Promo",
      sub: "Marketing Tools",
      icon: /* @__PURE__ */ React.createElement(Gift, { size: 18 }),
      color: "warning"
    },
    {
      to: "/reports",
      label: "Sales Analytics",
      sub: "Business Insights",
      icon: /* @__PURE__ */ React.createElement(BarChart3, { size: 18 }),
      color: "success"
    }
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-10 pb-10 max-w-7xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "animate-fadeIn" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-3xl animate-bounce" }, "\u{1F44B}"), /* @__PURE__ */ React.createElement("h1", { className: "font-syne text-3xl font-black text-slate-900 tracking-tight" }, greeting, ", ", /* @__PURE__ */ React.createElement("span", { className: "text-indigo-600" }, user?.name?.split(" ")[0]), "!")), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 font-medium flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }), user?.shopName, " ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, "|"), " Store Monitoring Active")), /* @__PURE__ */ React.createElement(
    ShimmerButton,
    {
      onClick: load,
      variant: "primary",
      className: "flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-indigo-100"
    },
    /* @__PURE__ */ React.createElement(RefreshCw, { size: 18, className: loading ? "animate-spin" : "" }),
    /* @__PURE__ */ React.createElement("span", null, "Sync Data")
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" }, /* @__PURE__ */ React.createElement(
    StatCard,
    {
      label: "Today's Profit",
      value: `\u20B9${(billStats?.dailyProfit || 0).toLocaleString()}`,
      icon: /* @__PURE__ */ React.createElement(TrendingUp, null),
      color: "primary",
      trend: 12
    }
  ), /* @__PURE__ */ React.createElement(
    StatCard,
    {
      label: "Weekly Revenue",
      value: `\u20B9${(billStats?.weeklyRevenue || 0).toLocaleString()}`,
      icon: /* @__PURE__ */ React.createElement(Banknote, null),
      color: "secondary",
      trend: 8
    }
  ), /* @__PURE__ */ React.createElement(
    StatCard,
    {
      label: "Inventory Alerts",
      value: lowStock.length,
      icon: /* @__PURE__ */ React.createElement(AlertCircle, null),
      color: "danger",
      trend: -5
    }
  ), /* @__PURE__ */ React.createElement(
    StatCard,
    {
      label: "Assets Value",
      value: `\u20B9${totalValue.toLocaleString()}`,
      icon: /* @__PURE__ */ React.createElement(Package, null),
      color: "warning",
      trend: 2.5
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8" }, /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-2 space-y-8" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-8" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-slate-900 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(BarChart3, { className: "text-indigo-600" }), "Revenue Performance"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-400 mt-1 font-medium" }, "Last 7 days retail trajectory")), /* @__PURE__ */ React.createElement(Badge, { variant: "primary" }, "7 Day Period")), /* @__PURE__ */ React.createElement("div", { className: "h-[350px]" }, /* @__PURE__ */ React.createElement(SalesChart, { data: report.daily })))), /* @__PURE__ */ React.createElement("div", { className: "space-y-8" }, /* @__PURE__ */ React.createElement(StockAlertCard, { items: lowStock }), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden relative group" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:scale-110" }), /* @__PURE__ */ React.createElement("h3", { className: "text-lg font-bold text-slate-800 mb-6 relative" }, "Control Center"), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 relative" }, quickActions.map((a) => /* @__PURE__ */ React.createElement(
    Link,
    {
      key: a.to,
      to: a.to,
      className: "flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group/item"
    },
    /* @__PURE__ */ React.createElement("div", { className: cn(
      "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover/item:scale-110 shadow-sm",
      a.color === "primary" ? "bg-indigo-50 text-indigo-600" : a.color === "secondary" ? "bg-cyan-50 text-cyan-600" : a.color === "warning" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
    ) }, a.icon),
    /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "text-[13.5px] font-bold text-slate-700" }, a.label), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-400 font-medium" }, a.sub)),
    /* @__PURE__ */ React.createElement(ArrowRight, { size: 14, className: "text-slate-300 group-hover/item:text-indigo-500 group-hover/item:translate-x-1 transition-all" })
  )))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-10" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-2xl font-black text-slate-900 tracking-tight" }, "Market Demand"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 font-medium text-sm mt-1" }, "Top performing inventory items over 7 days")), /* @__PURE__ */ React.createElement(Link, { to: "/reports", className: "text-indigo-600 text-[13px] font-bold hover:underline flex items-center gap-1.5 px-4 py-2 bg-indigo-50/50 rounded-full" }, "Full Analytics ", /* @__PURE__ */ React.createElement(ArrowRight, { size: 14 }))), !report.topItems?.length ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100" }, /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4" }, /* @__PURE__ */ React.createElement(BarChart3, { className: "text-slate-300" })), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 font-bold" }, "No sales data recorded yet"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-[12px] mt-1" }, "Use the AI Assistant to log your first sale!")) : /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6" }, report.topItems.map((item, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: item.name,
      className: "p-6 rounded-[28px] border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden group"
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100 shadow-sm" }, "#", i + 1),
    /* @__PURE__ */ React.createElement("div", { className: "text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400" }, "Sold Item"),
    /* @__PURE__ */ React.createElement("div", { className: "text-[17px] font-black text-slate-800 mb-4 whitespace-nowrap overflow-hidden text-ellipsis" }, item.name),
    /* @__PURE__ */ React.createElement("div", { className: "flex items-end justify-between border-t border-slate-50 pt-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400 font-bold uppercase mb-0.5" }, "Revenue"), /* @__PURE__ */ React.createElement("div", { className: "text-lg font-black text-indigo-600" }, "\u20B9", item.revenue.toLocaleString())), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-400 font-bold uppercase mb-0.5" }, "Quantity"), /* @__PURE__ */ React.createElement("div", { className: "text-slate-700 font-black" }, item.qty, " ", /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400 font-medium" }, "PKT"))))
  )))));
}
