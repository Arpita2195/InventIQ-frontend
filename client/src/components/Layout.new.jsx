import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { to: "/chat", icon: <MessageSquareText size={20} />, label: "AI Chat" },
  { to: "/inventory", icon: <Package size={20} />, label: "Inventory" },
  { to: "/billing", icon: <Receipt size={20} />, label: "Billing" },
  { to: "/khata", icon: <BookText size={20} />, label: "Khata" },
  { to: "/offers", icon: <Megaphone size={20} />, label: "Offers" },
  { to: "/reports", icon: <BarChart3 size={20} />, label: "Reports" },
  { to: "/suppliers", icon: <Truck size={20} />, label: "Suppliers" },
  { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] bg-white border-r border-slate-200 flex-col flex-shrink-0 shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="font-syne font-extrabold text-2xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent tracking-tighter">
            InventIQ
          </div>
          <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-widest font-medium">
            Apni Dukaan, Apna AI
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] transition-all duration-200 group
                ${
                  isActive
                    ? "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 font-semibold shadow-[0_2px_10px_-3px_rgba(139,92,246,0.15)] border border-violet-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }
              `}
            >
              <span className={`transition-transform duration-200 ${isActive => isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[13px] font-semibold text-slate-800 truncate">
                {user?.name}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {user?.shopName}
              </div>
            </div>
          </div>

          <ShimmerButton
            onClick={handleLogout}
            variant="danger"
            className="w-full h-10 rounded-xl"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </ShimmerButton>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} className="text-slate-700" /> : <Menu size={24} className="text-slate-700" />}
          </button>
          <div className="font-syne font-extrabold text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            InventIQ
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
            {initials}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="absolute top-16 left-0 w-[280px] h-[calc(100vh-64px)] bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 shadow-md border border-violet-200"
                        : "text-slate-600 hover:bg-slate-100"
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile User Section */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{user?.name}</div>
                  <div className="text-xs text-slate-500">{user?.shopName}</div>
                </div>
              </div>
              <ShimmerButton
                onClick={handleLogout}
                variant="danger"
                className="w-full h-11 rounded-xl"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </ShimmerButton>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden lg:overflow-hidden overflow-auto pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-[60px] border-b border-slate-200 bg-white/80 backdrop-blur-md items-center justify-between px-8 flex-shrink-0 z-10">
          <div className="font-syne text-lg font-bold text-slate-800">
            {/* Title dynamically from location if needed */}
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white border-2 border-white shadow-md">
              <UserIcon size={16} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
