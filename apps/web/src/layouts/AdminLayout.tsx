import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  Globe2,
  Workflow,
  FileCheck2,
  UserCheck,
  CreditCard,
  ScrollText,
  LogOut,
  Menu,
  X,
  Compass,
  Bell,
  ChevronDown,
  Shield,
  ExternalLink
} from 'lucide-react';
import { RoleName } from '@thevisagate/shared';
import { NotificationBell } from '../components/common/NotificationBell';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === RoleName.ADMIN;

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Clients', path: '/admin/clients', icon: Users },
    { name: 'Applications', path: '/admin/applications', icon: Briefcase },
    ...(isAdmin
      ? [
          { name: 'Countries & Visas', path: '/admin/countries', icon: Globe2 },
          { name: 'Workflow Templates', path: '/admin/workflows', icon: Workflow },
        ]
      : []),
    { name: 'Document Vault', path: '/admin/documents', icon: FileCheck2 },
    { name: 'Payments Ledger', path: '/admin/payments', icon: CreditCard },
    ...(isAdmin
      ? [
          { name: 'Staff Management', path: '/admin/staff', icon: UserCheck },
          { name: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 bg-brand-navy/70 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Console navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-brand-navy text-slate-300 flex flex-col transition-transform duration-300 lg:w-64 lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="min-h-[72px] px-5 py-3 flex items-center justify-between gap-2 border-b border-white/10">
          <Link to="/admin/dashboard" className="flex flex-col gap-1.5 group">
            <div className="bg-white px-3 py-1.5 rounded-lg shadow-xs border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src="/the-visa-gate-logo.png" alt="The Visa Gate" className="h-8 w-auto max-w-[150px] object-contain" />
            </div>
            <span className="text-[9px] tracking-widest text-brand-gold uppercase font-semibold block px-0.5">
              {isAdmin ? 'ADMIN CONSOLE' : 'STAFF WORKSPACE'}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
            className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Operations & Control
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-gold text-brand-navy font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-brand-navy' : 'text-brand-gold'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            External Links
          </div>
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5"
          >
            <span>Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/10 bg-brand-navy-light/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-gold font-bold flex items-center justify-center text-xs border border-brand-gold/30">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">{user?.name}</p>
                <span className="inline-block text-[10px] text-brand-gold uppercase tracking-wider font-semibold">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-white/5 text-slate-300 text-xs font-medium hover:bg-red-500/20 hover:text-red-300 transition-colors border border-white/5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <a href="#console-main" className="skip-link">
          Skip to main content
        </a>

        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
              <span className="text-brand-navy font-semibold">Management Console</span>
              <span>/</span>
              <span className="capitalize truncate">
                {location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden xs:flex items-center gap-2 bg-brand-bg px-3 py-1 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-brand-success" />
              <span className="text-xs font-semibold text-slate-700">Secure Session</span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <NotificationBell />

            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-brand-navy leading-none">{user?.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{user?.identifier}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-navy text-brand-gold font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main id="console-main" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
