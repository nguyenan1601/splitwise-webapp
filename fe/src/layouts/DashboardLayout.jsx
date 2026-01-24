import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Tổng quan", path: "/dashboard" },
    { icon: Users, label: "Nhóm", path: "/groups" },
    { icon: User, label: "Hồ sơ", path: "/dashboard/profile" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src="/chiti-icon.png"
              alt="Chiti"
              className="h-8 w-8 rounded-lg"
            />
            <span className="font-bold text-slate-900">Chiti</span>
          </Link>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <img
                  src="/chiti-icon.png"
                  alt="Chiti"
                  className="h-8 w-8 rounded-lg"
                />
                <span className="font-bold text-slate-900">Chiti</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary-50 text-primary-600"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-slate-200">
        {/* Logo */}
        <div className="flex items-center gap-2 p-6 border-b border-slate-200">
          <img
            src="/chiti-icon.png"
            alt="Chiti"
            className="h-10 w-10 rounded-xl"
          />
          <span className="text-xl font-bold text-slate-900">Chiti</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-primary-50 text-primary-600 font-medium"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User & Actions */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.user_metadata?.name || user?.email}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 ${
                isActive(item.path) ? "text-primary-600" : "text-slate-500"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
          <Link
            to="/groups/create"
            className="flex flex-col items-center gap-1 px-4 py-2 text-primary-600"
          >
            <div className="p-1.5 bg-primary-500 rounded-full">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs">Tạo mới</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export { DashboardLayout };
