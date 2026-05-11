import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  ImageIcon,
  Menu,
  X,
  LogOut,
  Settings as SettingsIcon,
  RefreshCw,
} from "lucide-react";

const navigation = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/blog", icon: FileText, label: "Blog" },
  { to: "/blog/new", icon: PlusCircle, label: "New Post" },
  { to: "/case-studies", icon: FileText, label: "Case Studies" },
  { to: "/case-studies/new", icon: PlusCircle, label: "New Case Study" },
  { to: "/settings", icon: SettingsIcon, label: "Settings" },
];

export const syncBus = {
  listeners: new Set(),
  emit(data) {
    this.listeners.forEach((fn) => fn(data));
  },
  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },
};

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [syncAlert, setSyncAlert] = useState(null);
  const navigate = useNavigate();

  // Sync status polling
  useEffect(() => {
    let active = true;
    async function checkSync() {
      try {
        const res = await fetch("/api/webhook");
        if (!res.ok) return;
        const data = await res.json();

        if (data.lastPush && data.lastPush.at && active) {
          const lastNotified = localStorage.getItem("last-notified-push");
          if (!lastNotified || new Date(data.lastPush.at) > new Date(lastNotified)) {
            setSyncAlert({
              type: "info",
              message: "Content synced — new push detected from GitHub",
            });
            localStorage.setItem("last-notified-push", data.lastPush.at);
          }
        }
      } catch {
        // Silently ignore
      }
    }

    checkSync();
    const interval = setInterval(checkSync, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Dismiss alert
  useEffect(() => {
    if (syncAlert) {
      const timer = setTimeout(() => setSyncAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [syncAlert]);

  const toggle = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem("wif_access_token");
    navigate("/", { replace: true });
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">WIF Admin</span>
          </div>
          <button
            onClick={toggle}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="mt-6 px-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? "text-indigo-600" : "text-gray-400"
                    }`}
                  />
                  {item.label}
                </>
              )}
            </Link>
          ))}
        </nav>

        {/* Sync indicator in sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <RefreshCw className="w-3 h-3" />
            <span>Synced</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              WIF Content Platform
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:inline">
              Admin Panel
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Sync alert banner */}
        {syncAlert && (
          <div
            className={`px-6 py-2 text-sm flex items-center gap-2 ${
              syncAlert.type === "info"
                ? "bg-blue-50 text-blue-700 border-b border-blue-200"
                : syncAlert.type === "success"
                ? "bg-green-50 text-green-700 border-b border-green-200"
                : "bg-amber-50 text-amber-700 border-b border-amber-200"
            }`}
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{syncAlert.message}</span>
            <button
              onClick={() => setSyncAlert(null)}
              className="ml-auto text-current hover:opacity-70"
            >
              ✕
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">{children || <Outlet />}</div>
        </main>
      </div>
    </div>
  );
}