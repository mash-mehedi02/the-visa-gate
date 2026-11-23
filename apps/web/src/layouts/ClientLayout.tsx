import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldCheck, Phone } from 'lucide-react';
import { OFFICE } from '../components/common/ContactStrip';
import { NotificationBell } from '../components/common/NotificationBell';

export const ClientLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login?portal=client');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <a href="#client-main" className="skip-link">
        Skip to main content
      </a>

      {/* Client Portal Header */}
      <header className="sticky top-0 z-40 bg-brand-navy text-white shadow-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3">
          {/* Official Brand Logo */}
          <Link to="/client/portal" className="flex items-center gap-2.5 group min-w-0">
            <div className="bg-white px-3 py-1.5 rounded-xl shadow-xs border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src="/the-visa-gate-logo.png"
                alt="The Visa Gate"
                className="h-8 sm:h-9 w-auto max-w-[130px] sm:max-w-[160px] object-contain"
              />
            </div>
            <span className="hidden xs:inline-block text-[9px] tracking-widest text-brand-gold uppercase font-semibold px-2 py-1 rounded bg-white/5 border border-white/10 shrink-0">
              Client Portal
            </span>
          </Link>

          {/* User Badge & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white truncate max-w-[180px]">{user?.name}</span>
              <span className="text-[10px] text-brand-gold font-mono">
                Passport: {user?.clientProfile?.passportMasked || user?.identifier}
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center border border-brand-gold/30 shrink-0">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
            </div>

            <NotificationBell />

            <a
              href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
              aria-label={`Call The Visa Gate hotline ${OFFICE.hotline}`}
              className="flex items-center justify-center w-9 h-9 rounded-md bg-white/5 text-slate-300 hover:text-brand-gold hover:bg-white/10 transition-colors border border-white/10"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out of the client portal"
              className="flex items-center justify-center w-9 h-9 rounded-md bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-300 transition-colors border border-white/10"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile identity strip */}
        <div className="xs:hidden bg-brand-navy-light border-t border-white/10 px-4 py-1.5">
          <p className="text-[11px] text-slate-300 truncate">
            <span className="text-white font-semibold">{user?.name}</span>
            <span className="mx-1.5 text-slate-500">•</span>
            <span className="font-mono text-brand-gold">
              Passport: {user?.clientProfile?.passportMasked || user?.identifier}
            </span>
          </p>
        </div>
      </header>

      {/* Main View Area (Max width optimized for readability) */}
      <main id="client-main" className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Client Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1.5">
          <p className="font-medium text-slate-700">THE VISA GATE — CLIENT APPLICATION TRACKING</p>
          <p>
            Need assistance with your scheduled procedure? Contact your assigned case officer or call{' '}
            <a href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`} className="text-brand-navy font-semibold hover:underline">
              {OFFICE.hotline}
            </a>{' '}
            (Sat – Thu, 11 AM – 6 PM).
          </p>
          <p className="text-[11px] text-slate-400">
            <Link to="/privacy" className="hover:text-slate-600 underline underline-offset-2">
              Privacy
            </Link>
            {' · '}
            <Link to="/terms" className="hover:text-slate-600 underline underline-offset-2">
              Terms
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};
