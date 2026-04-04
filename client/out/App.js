import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { InventoryProvider } from "./context/InventoryContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import InventoryPage from "./pages/InventoryPage";
import OffersPage from "./pages/OffersPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import SuppliersPage from "./pages/SuppliersPage";
import BillingPage from "./pages/BillingPage";
import KhataPage from "./pages/KhataPage";
import Layout from "./components/Layout";
const Protected = ({ children }) => {
  const { user, initializing } = useAuth();
  if (initializing) return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" } }, "Loading...");
  return user ? children : /* @__PURE__ */ React.createElement(Navigate, { to: "/login", replace: true });
};
export default function App() {
  return /* @__PURE__ */ React.createElement(AuthProvider, null, /* @__PURE__ */ React.createElement(InventoryProvider, null, /* @__PURE__ */ React.createElement(BrowserRouter, { future: { v7_startTransition: true, v7_relativeSplitPath: true } }, /* @__PURE__ */ React.createElement(Routes, null, /* @__PURE__ */ React.createElement(Route, { path: "/login", element: /* @__PURE__ */ React.createElement(LoginPage, null) }), /* @__PURE__ */ React.createElement(Route, { path: "/register", element: /* @__PURE__ */ React.createElement(RegisterPage, null) }), /* @__PURE__ */ React.createElement(
    Route,
    {
      path: "/",
      element: /* @__PURE__ */ React.createElement(Protected, null, /* @__PURE__ */ React.createElement(Layout, null))
    },
    /* @__PURE__ */ React.createElement(Route, { index: true, element: /* @__PURE__ */ React.createElement(DashboardPage, null) }),
    /* @__PURE__ */ React.createElement(Route, { path: "chat", element: /* @__PURE__ */ React.createElement(ChatPage, null) }),
    /* @__PURE__ */ React.createElement(Route, { path: "inventory", element: /* @__PURE__ */ React.createElement(InventoryPage, null) }),
    /* @__PURE__ */ React.createElement(Route, { path: "billing", element: /* @__PURE__ */ React.createElement(BillingPage, null) }),
    /* @__PURE__ */ React.createElement(Route, { path: "khata", element: /* @__PURE__ */ React.createElement(KhataPage, null) }),
    /* @__PURE__ */ React.createElement(Route, { path: "offers", element: /* @__PURE__ */ React.createElement(OffersPage, null) }),
    /* @__PURE__ */ React.createElement(Route, { path: "reports", element: /* @__PURE__ */ React.createElement(ReportsPage, null) }),
    /* @__PURE__ */ React.createElement(Route, { path: "settings", element: /* @__PURE__ */ React.createElement(SettingsPage, null) }),
    /* @__PURE__ */ React.createElement(Route, { path: "suppliers", element: /* @__PURE__ */ React.createElement(SuppliersPage, null) })
  )))));
}
