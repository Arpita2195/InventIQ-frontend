import { useState, useMemo } from "react";
import { useInventory } from "../context/InventoryContext";
import InventoryTable from "../components/InventoryTable";
import { StatCard, Badge } from "../components/ui";
import {
  Package,
  AlertTriangle,
  Banknote,
  Percent,
  Calculator,
  Info,
  Layers
} from "lucide-react";
const getGSTRate = (category, name = "") => {
  const categoryMap = {
    // 0% GST
    "fresh vegetables": 0,
    "fresh fruits": 0,
    "milk": 0,
    "salt": 0,
    "bread": 0,
    "eggs": 0,
    // 5% GST
    "sugar": 5,
    "tea": 5,
    "coffee": 5,
    "edible oil": 5,
    "spices": 5,
    "masala": 5,
    "grains": 5,
    "pulses": 5,
    "rice": 5,
    "wheat": 5,
    "atta": 5,
    "curd": 5,
    "lassi": 5,
    "packed grains": 5,
    "packed pulses": 5,
    "paneer": 5,
    "sweets": 5,
    "agarbatti": 5,
    // 12% GST
    "butter": 12,
    "ghee": 12,
    "cheese": 12,
    "dry fruits": 12,
    "fruit juice": 12,
    "namkeen": 12,
    "snacks": 12,
    "ketchup": 12,
    "sauces": 12,
    "juice": 12,
    // 18% GST
    "biscuits": 18,
    "chocolates": 18,
    "chocolate": 18,
    "ice cream": 18,
    "hair oil": 18,
    "soap": 18,
    "toothpaste": 18,
    "shampoo": 18,
    "detergent": 18,
    "cleaning": 18,
    "personal care": 18,
    "mineral water": 18,
    "water bottle": 18,
    "maggie": 18,
    "pizza": 18,
    "general": 18,
    // 28% GST
    "aerated drinks": 28,
    "cold drinks": 28,
    "cola": 28,
    "energy drinks": 28
  };
  let keyToSearch = category?.toLowerCase() || "general";
  if (keyToSearch === "general" || keyToSearch === "genral") {
    keyToSearch = name.toLowerCase();
  }
  for (const [k, v] of Object.entries(categoryMap)) {
    if (keyToSearch.includes(k)) return v;
  }
  return 18;
};
export default function InventoryPage() {
  const { items, loading, refreshInventory } = useInventory();
  const stats = useMemo(() => {
    const totalValue = items.reduce((a, i) => a + i.quantity * i.price, 0);
    const gstAmount = items.reduce((a, i) => {
      const rate = i.gstRate || getGSTRate(i.category, i.name);
      return a + i.quantity * i.price * rate / 100;
    }, 0);
    const lowStockCount = items.filter((i) => i.quantity <= i.lowStockThreshold).length;
    return {
      totalItems: items.length,
      lowStock: lowStockCount,
      totalValue,
      gstAmount,
      totalWithGst: totalValue + gstAmount
    };
  }, [items]);
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-8 animate-fadeIn max-w-7xl mx-auto pb-10" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "font-syne text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3" }, /* @__PURE__ */ React.createElement(Layers, { className: "text-indigo-600 w-8 h-8" }), "Stock Inventory"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 font-medium mt-1 flex items-center gap-2" }, "Control and monitor your shop's full product catalog")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold border border-indigo-100 uppercase tracking-wider" }, /* @__PURE__ */ React.createElement(Info, { size: 14 }), "Automatic GST Classification Active")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" }, /* @__PURE__ */ React.createElement(
    StatCard,
    {
      label: "Total SKUs",
      value: stats.totalItems,
      icon: /* @__PURE__ */ React.createElement(Package, null),
      color: "primary"
    }
  ), /* @__PURE__ */ React.createElement(
    StatCard,
    {
      label: "Low Stock",
      value: stats.lowStock,
      icon: /* @__PURE__ */ React.createElement(AlertTriangle, null),
      color: "danger"
    }
  ), /* @__PURE__ */ React.createElement(
    StatCard,
    {
      label: "Total Value",
      value: `\u20B9${stats.totalValue.toLocaleString()}`,
      icon: /* @__PURE__ */ React.createElement(Banknote, null),
      color: "secondary"
    }
  ), /* @__PURE__ */ React.createElement(
    StatCard,
    {
      label: "GST Liability",
      value: `\u20B9${stats.gstAmount.toLocaleString()}`,
      icon: /* @__PURE__ */ React.createElement(Percent, null),
      color: "warning"
    }
  ), /* @__PURE__ */ React.createElement(
    StatCard,
    {
      label: "Gross Value",
      value: `\u20B9${stats.totalWithGst.toLocaleString()}`,
      icon: /* @__PURE__ */ React.createElement(Calculator, null),
      color: "success"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100/50 rounded-2xl p-6 relative overflow-hidden group shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-4 relative" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm" }, /* @__PURE__ */ React.createElement(Info, { className: "text-indigo-600", size: 20 })), /* @__PURE__ */ React.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-bold text-slate-800 mb-1 tracking-tight" }, "Kirana Store GST Guidelines"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-x-6 gap-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-slate-300" }), /* @__PURE__ */ React.createElement("span", { className: "text-[12px] text-slate-500 font-medium whitespace-nowrap" }, "Exempt (0%): Milk, Salt, Bread, Fresh Produce")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-amber-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[12px] text-slate-500 font-medium whitespace-nowrap" }, "Essentials (5%): Sugar, Oil, Pulses, Spices")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400" }), /* @__PURE__ */ React.createElement("span", { className: "text-[12px] text-slate-500 font-medium whitespace-nowrap" }, "Standard (12%): Ghee, Butter, Processed Juices")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-indigo-500" }), /* @__PURE__ */ React.createElement("span", { className: "text-[12px] text-slate-500 font-medium whitespace-nowrap" }, "FMCG (18%): Soaps, Detergents, Chocolates")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-rose-500" }), /* @__PURE__ */ React.createElement("span", { className: "text-[12px] text-slate-500 font-medium whitespace-nowrap" }, "Premium (28%): Cold Drinks, Energy Drinks")))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]" }, loading ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-40 animate-pulse" }, /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4" }, /* @__PURE__ */ React.createElement(Layers, { className: "text-slate-300" })), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]" }, "Synchronizing Catalog...")) : /* @__PURE__ */ React.createElement(InventoryTable, { items, onRefresh: refreshInventory, getGSTRate })));
}
