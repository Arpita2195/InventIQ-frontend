import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { notificationApi } from "../api";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

const navItems = [
  { to: "/", icon: "⬛", label: "Dashboard" },
  { to: "/chat", icon: "💬", label: "AI Chat" },
  { to: "/inventory", icon: "📦", label: "Inventory" },
  { to: "/suppliers", icon: "🚛", label: "Suppliers" },
  { to: "/offers", icon: "📣", label: "Offers" },
  { to: "/billing", icon: "🧾", label: "Billing" },
  { to: "/khata", icon: "📖", label: "Khata Book" },
  { to: "/reports", icon: "📊", label: "Reports" },
  { to: "/settings", icon: "⚙️", label: "Settings" },
];

const s = {
  shell: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "var(--bg)",
  },
  sidebar: {
    width: 230,
    background: "var(--bg2)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
  },
  logo: { padding: "24px 20px 16px", borderBottom: "1px solid var(--border)" },
  logoTitle: {
    fontFamily: "'Syne',sans-serif",
    fontWeight: 800,
    fontSize: 22,
    color: "var(--purple)",
    letterSpacing: "-0.5px",
  },
  logoSub: { fontSize: 11, color: "var(--muted2)", marginTop: 2 },
  nav: {
    flex: 1,
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflowY: "auto",
  },
  navLink: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? "var(--purple)" : "var(--muted)",
    background: active ? "var(--purple-xl)" : "transparent",
    border: active ? "1px solid #DDD6FE" : "1px solid transparent",
    transition: "all .15s",
    textDecoration: "none",
  }),
  navIcon: { fontSize: 16, width: 20, textAlign: "center" },
  bottom: { padding: "12px 10px", borderTop: "1px solid var(--border)" },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    background: "var(--bg3)",
    border: "1px solid var(--border)",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "var(--purple)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "white",
    flexShrink: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  shopName: {
    fontSize: 11,
    color: "var(--muted)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    marginTop: 6,
    width: "100%",
    padding: "8px",
    borderRadius: 8,
    background: "transparent",
    border: "1px solid var(--border)",
    color: "var(--muted)",
    fontSize: 13,
    transition: "all .15s",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  topbar: {
    height: 56,
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    background: "var(--bg2)",
    flexShrink: 0,
    zIndex: 10,
  },
  topbarTitle: {
    fontFamily: "'Syne',sans-serif",
    fontSize: 18,
    fontWeight: 700,
  },
  content: {
    flex: 1,
    overflow: "auto",
    padding: 24,
    background: "var(--bg)",
    WebkitOverflowScrolling: "touch",
  },
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredLogout, setHoveredLogout] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [toast, setToast] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationApi.getAll();
      // Check for new unread notifications to show toast
      const newUnread = data.filter(
        (n) => !n.read && !notifications.find((prev) => prev._id === n._id),
      );
      if (newUnread.length > 0) {
        setToast(`New Alert: ${newUnread[0].title}`);
        setTimeout(() => setToast(null), 5000);
      }
      setNotifications(data || []);
    } catch (e) {}
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    loadNotifications();
    const int = setInterval(loadNotifications, 30000);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(int);
    };
  }, []);

  const markRead = async () => {
    const unread = notifications.filter((n) => !n.read).map((n) => n._id);
    if (!unread.length) return;
    try {
      await notificationApi.markAsRead(unread);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Keyboard shortcuts
  useKeyboardShortcuts(
    {
      "Control+1": () => navigate("/"),
      "Control+2": () => navigate("/chat"),
      "Control+3": () => navigate("/inventory"),
      "Control+4": () => navigate("/billing"),
      "Control+5": () => navigate("/reports"),
      Escape: () => {
        setShowNotif(false);
        if (isMobile) setSidebarOpen(false);
      },
    },
    [navigate, isMobile],
  );
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "IQ";

  return (
    <div style={s.shell}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 100,
          }}
        />
      )}

      <aside
        style={{
          ...s.sidebar,
          position: isMobile ? "fixed" : "relative",
          zIndex: 101,
          left: sidebarOpen ? 0 : -230,
          transition: "left 0.3s ease",
        }}
      >
        <div style={s.logo}>
          <div style={s.logoTitle}>InventIQ</div>
          <div style={s.logoSub}>Apni Dukaan, Apna AI</div>
        </div>
        <nav style={s.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              style={({ isActive }) => s.navLink(isActive)}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <span style={s.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={s.bottom}>
          <div style={s.userCard}>
            <div style={s.avatar}>{initials}</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={s.userName}>{user?.name}</div>
              <div style={s.shopName}>{user?.shopName}</div>
            </div>
          </div>
          <button
            style={{
              ...s.logoutBtn,
              background: hoveredLogout ? "#FFF1F2" : "transparent",
              color: hoveredLogout ? "var(--coral)" : "var(--muted)",
            }}
            onMouseEnter={() => setHoveredLogout(true)}
            onMouseLeave={() => setHoveredLogout(false)}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.topbar}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ☰
              </button>
            )}
            <div style={s.topbarTitle}></div>
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => {
                if (!showNotif) loadNotifications();
                setShowNotif(!showNotif);
                markRead();
              }}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                position: "relative",
                padding: 8,
              }}
            >
              🔔
              {notifications.filter((n) => !n.read).length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "var(--coral)",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 10,
                    padding: "2px 6px",
                  }}
                >
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>

            {showNotif && (
              <div
                style={{
                  position: "absolute",
                  top: 50,
                  right: isMobile ? -70 : 0,
                  width: isMobile ? "calc(100vw - 100px)" : 360,
                  minWidth: isMobile ? 280 : 360,
                  maxWidth: 400,
                  background: "white",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  zIndex: 100,
                  maxHeight: 480,
                  overflow: "hidden",
                  animation: "fadeIn 0.2s ease",
                }}
              >
                <div
                  style={{
                    padding: 14,
                    borderBottom: "1px solid var(--border)",
                    fontWeight: 600,
                    fontSize: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Smart Alerts</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={async () => {
                        const allIds = notifications.map((n) => n._id);
                        await notificationApi.markAsRead(allIds);
                        setNotifications([]);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--purple)",
                        fontSize: 11,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "32px 20px",
                      textAlign: "center",
                      color: "var(--muted)",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                    <div>No alerts yet</div>
                    <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
                      We'll notify you when stock is low
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          if (n.type === "low_stock" && n.title.includes(":")) {
                            const itemName = n.title.split(":").pop().trim();
                            navigate(
                              `/inventory?s=${encodeURIComponent(itemName)}`,
                            );
                            setShowNotif(false);
                          }
                        }}
                        style={{
                          padding: 12,
                          borderBottom: "1px solid var(--border)",
                          background: n.read ? "white" : "var(--purple-xl)",
                          cursor:
                            n.type === "low_stock" ? "pointer" : "default",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text)",
                            marginBottom: 4,
                          }}
                        >
                          {n.title}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          {n.message}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--muted2)",
                            marginTop: 6,
                          }}
                        >
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div style={s.content}>
          <Outlet />
        </div>
      </main>

      {/* Simple Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--purple)",
            color: "white",
            padding: "12px 24px",
            borderRadius: 50,
            boxShadow: "0 8px 30px rgba(109,40,217,0.3)",
            zIndex: 1000,
            fontWeight: 500,
            animation: "slideUp 0.3s ease",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
