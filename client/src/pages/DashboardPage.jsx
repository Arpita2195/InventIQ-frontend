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
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [inv, low, rep, bStats] = await Promise.all([
        inventoryApi.getAll(),
        inventoryApi.getLowStock(),
        chatApi.getReports(7),
        billApi.getStats(),
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

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const totalValue = inventory.reduce((a, i) => a + i.quantity * i.price, 0);

  const quickActions = [
    {
      to: "/chat",
      label: "Open AI Chat",
      sub: "Smart Assistance",
      icon: <Sparkles size={18} />,
      color: "primary",
    },
    {
      to: "/inventory",
      label: "Manage Stock",
      sub: "Inventory Tracking",
      icon: <Package size={18} />,
      color: "secondary",
    },
    {
      to: "/offers",
      label: "WhatsApp Promo",
      sub: "Marketing Tools",
      icon: <Gift size={18} />,
      color: "warning",
    },
    {
      to: "/reports",
      label: "Sales Analytics",
      sub: "Business Insights",
      icon: <BarChart3 size={18} />,
      color: "success",
    },
  ];

  return (
    <div className="space-y-10 pb-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl animate-bounce">👋</span>
            <h1 className="font-syne text-3xl font-black text-slate-900 tracking-tight">
              {greeting}, <span className="text-indigo-600">{user?.name?.split(" ")[0]}</span>!
            </h1>
          </div>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {user?.shopName} <span className="text-slate-300">|</span> Store Monitoring Active
          </p>
        </div>
        <ShimmerButton
          onClick={load}
          variant="primary"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl shadow-xl shadow-indigo-100"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          <span>Sync Data</span>
        </ShimmerButton>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Today's Profit"
          value={`₹${(billStats?.dailyProfit || 0).toLocaleString()}`}
          icon={<TrendingUp />}
          color="primary"
          trend={12}
        />
        <StatCard
          label="Weekly Revenue"
          value={`₹${(billStats?.weeklyRevenue || 0).toLocaleString()}`}
          icon={<Banknote />}
          color="secondary"
          trend={8}
        />
        <StatCard
          label="Inventory Alerts"
          value={lowStock.length}
          icon={<AlertCircle />}
          color="danger"
          trend={-5}
        />
        <StatCard
          label="Assets Value"
          value={`₹${totalValue.toLocaleString()}`}
          icon={<Package />}
          color="warning"
          trend={2.5}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales visualization */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                       <BarChart3 className="text-indigo-600" />
                       Revenue Performance
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 font-medium">Last 7 days retail trajectory</p>
                 </div>
                 <Badge variant="primary">7 Day Period</Badge>
              </div>
              <div className="h-[350px]">
                <SalesChart data={report.daily} />
              </div>
           </div>
        </div>

        {/* Action Center */}
        <div className="space-y-8">
           <StockAlertCard items={lowStock} />
           
           <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:scale-110" />
              <h3 className="text-lg font-bold text-slate-800 mb-6 relative">Control Center</h3>
              <div className="space-y-3 relative">
                {quickActions.map((a) => (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group/item"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover/item:scale-110 shadow-sm",
                      a.color === 'primary' ? 'bg-indigo-50 text-indigo-600' :
                      a.color === 'secondary' ? 'bg-cyan-50 text-cyan-600' :
                      a.color === 'warning' ? 'bg-amber-50 text-amber-600' :
                      'bg-emerald-50 text-emerald-600'
                    )}>
                      {a.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13.5px] font-bold text-slate-700">{a.label}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{a.sub}</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover/item:text-indigo-500 group-hover/item:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Featured list */}
      <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Market Demand</h3>
            <p className="text-slate-400 font-medium text-sm mt-1">Top performing inventory items over 7 days</p>
          </div>
          <Link to="/reports" className="text-indigo-600 text-[13px] font-bold hover:underline flex items-center gap-1.5 px-4 py-2 bg-indigo-50/50 rounded-full">
            Full Analytics <ArrowRight size={14} />
          </Link>
        </div>

        {!report.topItems?.length ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100">
             <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <BarChart3 className="text-slate-300" />
             </div>
             <p className="text-slate-500 font-bold">No sales data recorded yet</p>
             <p className="text-slate-400 text-[12px] mt-1">Use the AI Assistant to log your first sale!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {report.topItems.map((item, i) => (
              <div
                key={item.name}
                className="p-6 rounded-[28px] border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100 shadow-sm">
                  #{i + 1}
                </div>
                <div className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400">Sold Item</div>
                <div className="text-[17px] font-black text-slate-800 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
                
                <div className="flex items-end justify-between border-t border-slate-50 pt-4">
                   <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Revenue</div>
                      <div className="text-lg font-black text-indigo-600">₹{item.revenue.toLocaleString()}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Quantity</div>
                      <div className="text-slate-700 font-black">{item.qty} <span className="text-[10px] text-slate-400 font-medium">PKT</span></div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
