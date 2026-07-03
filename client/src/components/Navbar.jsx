import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, GraduationCap, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'EXPERT':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo / Brand */}
          <div className="flex">
            <Link to="/" className="flex flex-shrink-0 items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Mentora
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </div>

          {/* Desktop User Info & Actions */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* User role and name */}
                <div className="flex items-center space-x-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">{user.name}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition shadow-sm bg-white cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-200 bg-white">
          <div className="space-y-1 pb-3 pt-2 px-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="border-t border-slate-200 pb-3 pt-4 px-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-medium text-slate-800">{user.name}</div>
                    <div className="text-sm font-medium text-slate-500 flex items-center space-x-1">
                      <span>{user.email}</span>
                      <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1 rounded border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl border border-slate-200 px-4 py-2.5 text-base font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center rounded-xl border border-slate-200 px-4 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center rounded-xl bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
