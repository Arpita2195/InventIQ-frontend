import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import NotificationBell from "./NotificationBell";
import { ShimmerButton } from "./ui";
import {
  LayoutDashboard,
  MessageSquareText,
  Package,
  Receipt,
  BookText,
  Megaphone,
  BarChart3,
  Truck,
  Settings,
  LogOut,
  User as UserIcon,
} from "lucide-react";

const navItems = [
  { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { to: "/chat", icon: <MessageSquareText size={20} />, label: "AI Chat" },
  { to: "/inventory", icon: <Package size={20} />, label: "Inventory" },
  { to: "/billing", icon: <Receipt size={20} />, label: "Billing" },
  { to: "/khata", icon: <BookText size={20} />, label: "Khata Book" },
  { to: "/offers", icon: <Megaphone size={20} />, label: "Offers" },
  { to: "/reports", icon: <BarChart3 size={20} />, label: "Reports" },
  { to: "/suppliers", icon: <Truck size={20} />, label: "Suppliers" },
  { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "IQ";

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] transition-all duration-300 z-20">
        <div className="p-7 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 uppercase font-syne">
              I
            </div>
            <div className="font-syne font-extrabold text-2xl text-slate-900 tracking-tighter">
              Invent<span className="text-indigo-600">IQ</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 uppercase tracking-[0.2em] font-bold">
            Smart Retail Assistant
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 flex flex-col gap-1.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] transition-all duration-200 group
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-bold shadow-sm border border-indigo-100/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-indigo-600" : "opacity-70"}`}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-5 mt-auto border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[13px] font-bold text-slate-900 truncate">
                {user?.name || "User Name"}
              </div>
              <div className="text-[11px] text-slate-500 font-medium truncate uppercase tracking-wider">
                {user?.shopName || "My Store"}
              </div>
            </div>
          </div>

          <ShimmerButton
            onClick={handleLogout}
            variant="danger"
            className="w-full py-3 rounded-2xl text-[13px] font-bold shadow-lg shadow-rose-100 transition-all border border-rose-100/50"
          >
            <LogOut size={16} strokeWidth={2.5} />
            <span>Logout</span>
          </ShimmerButton>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-[70px] border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-10 flex-shrink-0 z-10 shadow-sm shadow-slate-900/5">
          <div className="font-syne text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            Control Center
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-100 uppercase tracking-wider">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               System Live
            </div>
            <NotificationBell />
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 hover:border-indigo-200 hover:text-indigo-500 transition-all cursor-pointer shadow-sm">
              <UserIcon size={18} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50/50 p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
