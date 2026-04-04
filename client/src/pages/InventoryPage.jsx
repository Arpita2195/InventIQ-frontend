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

// Indian Kirana / FMCG GST rates by category
const getGSTRate = (category, name = "") => {
  const categoryMap = {
    // 0% GST
    "fresh vegetables": 0, "fresh fruits": 0, "milk": 0, "salt": 0, "bread": 0, "eggs": 0,
    // 5% GST
    "sugar": 5, "tea": 5, "coffee": 5, "edible oil": 5, "spices": 5, "masala": 5,
    "grains": 5, "pulses": 5, "rice": 5, "wheat": 5, "atta": 5, "curd": 5, "lassi": 5,
    "packed grains": 5, "packed pulses": 5, "paneer": 5, "sweets": 5, "agarbatti": 5,
    // 12% GST
    "butter": 12, "ghee": 12, "cheese": 12, "dry fruits": 12, "fruit juice": 12,
    "namkeen": 12, "snacks": 12, "ketchup": 12, "sauces": 12, "juice": 12,
    // 18% GST
    "biscuits": 18, "chocolates": 18, "chocolate": 18, "ice cream": 18, "hair oil": 18, "soap": 18,
    "toothpaste": 18, "shampoo": 18, "detergent": 18, "cleaning": 18, "personal care": 18,
    "mineral water": 18, "water bottle": 18, "maggie": 18, "pizza": 18, "general": 18,
    // 28% GST
    "aerated drinks": 28, "cold drinks": 28, "cola": 28, "energy drinks": 28,
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

  // Memoize calculations for performance
  const stats = useMemo(() => {
    const totalValue = items.reduce((a, i) => a + i.quantity * i.price, 0);
    const gstAmount = items.reduce((a, i) => {
      const rate = i.gstRate || getGSTRate(i.category, i.name);
      return a + (i.quantity * i.price * rate / 100);
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

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-syne text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Layers className="text-indigo-600 w-8 h-8" />
            Stock Inventory
          </h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            Control and monitor your shop's full product catalog
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold border border-indigo-100 uppercase tracking-wider">
           <Info size={14} />
           Automatic GST Classification Active
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total SKUs"
          value={stats.totalItems}
          icon={<Package />}
          color="primary"
        />
        <StatCard
          label="Low Stock"
          value={stats.lowStock}
          icon={<AlertTriangle />}
          color="danger"
        />
        <StatCard
          label="Total Value"
          value={`₹${stats.totalValue.toLocaleString()}`}
          icon={<Banknote />}
          color="secondary"
        />
        <StatCard
          label="GST Liability"
          value={`₹${stats.gstAmount.toLocaleString()}`}
          icon={<Percent />}
          color="warning"
        />
        <StatCard
          label="Gross Value"
          value={`₹${stats.totalWithGst.toLocaleString()}`}
          icon={<Calculator />}
          color="success"
        />
      </div>

      {/* GST Guideline Box */}
      <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100/50 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="flex items-start gap-4 relative">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <Info className="text-indigo-600" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 mb-1 tracking-tight">Kirana Store GST Guidelines</h4>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="text-[12px] text-slate-500 font-medium whitespace-nowrap">Exempt (0%): Milk, Salt, Bread, Fresh Produce</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[12px] text-slate-500 font-medium whitespace-nowrap">Essentials (5%): Sugar, Oil, Pulses, Spices</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[12px] text-slate-500 font-medium whitespace-nowrap">Standard (12%): Ghee, Butter, Processed Juices</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span className="text-[12px] text-slate-500 font-medium whitespace-nowrap">FMCG (18%): Soaps, Detergents, Chocolates</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-[12px] text-slate-500 font-medium whitespace-nowrap">Premium (28%): Cold Drinks, Energy Drinks</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table section */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
               <Layers className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Synchronizing Catalog...</p>
          </div>
        ) : (
          <InventoryTable items={items} onRefresh={refreshInventory} getGSTRate={getGSTRate} />
        )}
      </div>
    </div>
  );
}
