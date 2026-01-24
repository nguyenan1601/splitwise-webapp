import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "../components/ui";

function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/chiti-icon.png"
                alt="Chiti"
                className="h-8 w-8 rounded-lg"
              />
              <span className="text-xl font-bold text-slate-900">Chiti</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button>Đăng ký</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 animate-slide-down">
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/chiti-icon.png"
                alt="Chiti"
                className="h-6 w-6 rounded-md"
              />
              <span className="font-semibold text-slate-900">Chiti</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2024 Chiti. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { PublicLayout };
