import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { OFFICE } from '../components/common/ContactStrip';
import {
  Phone,
  Mail,
  Clock,
  Menu,
  X,
  User,
  Globe,
  Lock
} from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever navigation happens.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Visa Services', path: '/services' },
    { name: 'Countries', path: '/countries' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-slate-800">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Top Corporate Notice Bar */}
      <div className="bg-brand-navy-light text-slate-300 text-xs py-2 px-4 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center space-x-6 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-gold" />
              <a href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                Hotline: {OFFICE.hotline}
              </a>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-gold" />
              <a href={`mailto:${OFFICE.email}`} className="hover:text-white transition-colors">
                {OFFICE.email}
              </a>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-gold" />
              <span>Sat – Thu: 11:00 AM – 6:00 PM</span>
            </span>
          </div>
          <div className="flex items-center space-x-4 shrink-0">
            <span className="text-slate-400">Dhaka, Bangladesh</span>
            <span className="text-brand-gold/80 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              English (EN)
            </span>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-50 bg-brand-navy text-white shadow-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          <BrandLogo variant="header" />

          {/* Desktop Nav Items */}
          <nav aria-label="Primary" className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-brand-gold bg-white/5 font-semibold'
                    : 'text-slate-200 hover:text-brand-gold hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/login?portal=client"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-brand-gold text-brand-navy font-semibold text-sm hover:bg-brand-gold-light transition-all shadow-sm shadow-brand-gold/20 min-h-[44px]"
            >
              <User className="w-4 h-4" />
              <span>Client Portal</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              className="p-2.5 rounded-md text-slate-300 hover:text-white hover:bg-brand-navy-light min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="md:hidden bg-brand-navy-light border-b border-white/10 px-4 pt-2 pb-6 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'text-brand-gold bg-white/10 font-bold'
                    : 'text-slate-200 hover:text-brand-gold'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10">
              <Link
                to="/login?portal=client"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-brand-gold text-brand-navy font-bold text-sm min-h-[48px]"
              >
                <User className="w-4 h-4" />
                <span>Client Portal (Track Visa)</span>
              </Link>

              <Link
                to="/admin-access"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-md border border-white/20 text-slate-200 font-bold text-sm min-h-[48px]"
              >
                <Lock className="w-4 h-4" />
                <span>Staff &amp; Admin Sign In</span>
              </Link>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300">
                <a
                  href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 py-1 hover:text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-gold" />
                  <span>
                    Hotline: <strong className="text-white">{OFFICE.hotline}</strong>
                  </span>
                </a>
                <a
                  href={`mailto:${OFFICE.email}`}
                  className="flex items-center gap-2 py-1 hover:text-white transition-colors break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{OFFICE.email}</span>
                </a>
                <p className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-brand-gold mt-0.5" />
                  <span>Sat – Thu, 11:00 AM – 6:00 PM</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Corporate Footer */}
      <footer className="bg-brand-navy text-slate-300 pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            {/* Col 1: Brand & Bio */}
            <div className="lg:col-span-2 space-y-4">
              <BrandLogo variant="footer" />
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm pt-2">
                Professional visa consultancy and application assistance to help individuals and corporate clients move
                confidently toward international career and educational opportunities.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                We provide consultation, document guidance and application tracking. We do not issue visas, and we do
                not guarantee approval — every decision rests with the relevant immigration authority or embassy.
              </p>
            </div>

            {/* Col 2: Services */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 border-l-2 border-brand-gold pl-2">
                Visa Services
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/services" className="hover:text-brand-gold transition-colors">All Visa Services</Link></li>
                <li><Link to="/services/work-permit" className="hover:text-brand-gold transition-colors">Work Permit Visas</Link></li>
                <li><Link to="/services/student-visa" className="hover:text-brand-gold transition-colors">Student Visas</Link></li>
                <li><Link to="/services/tourist-visa" className="hover:text-brand-gold transition-colors">Tourist &amp; Business</Link></li>
                <li><Link to="/services/europe-visa" className="hover:text-brand-gold transition-colors">Europe &amp; Schengen</Link></li>
                <li><Link to="/services/malaysia-visa" className="hover:text-brand-gold transition-colors">Malaysia Processing</Link></li>
              </ul>
            </div>

            {/* Col 3: Key Links */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 border-l-2 border-brand-gold pl-2">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/about" className="hover:text-brand-gold transition-colors">About Our Agency</Link></li>
                <li><Link to="/countries" className="hover:text-brand-gold transition-colors">Destinations</Link></li>
                <li><Link to="/how-it-works" className="hover:text-brand-gold transition-colors">Consultancy Workflow</Link></li>
                <li><Link to="/faq" className="hover:text-brand-gold transition-colors">Help &amp; FAQs</Link></li>
                <li><Link to="/contact" className="hover:text-brand-gold transition-colors">Contact Office</Link></li>
                <li><Link to="/login?portal=client" className="hover:text-brand-gold transition-colors">Client Portal</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 border-l-2 border-brand-gold pl-2">
                Corporate Office
              </h4>
              <div className="space-y-3 text-sm text-slate-300">
                <p className="flex items-start gap-2">
                  <span className="text-brand-gold font-bold">Address:</span>
                  <span>
                    {OFFICE.addressLine1}, {OFFICE.addressLine2}
                    <span className="block text-[11px] text-slate-400 mt-0.5">{OFFICE.landmark}</span>
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-brand-gold font-bold">Email:</span>
                  <a href={`mailto:${OFFICE.email}`} className="hover:text-brand-gold transition-colors break-all">
                    {OFFICE.email}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-brand-gold font-bold">Hotline:</span>
                  <a href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`} className="hover:text-brand-gold transition-colors">
                    {OFFICE.hotline}
                  </a>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-brand-gold font-bold">Hours:</span>
                  <span>
                    {OFFICE.hours}
                    <span className="block text-[11px] text-slate-400 mt-0.5">{OFFICE.fridayNote}</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} THE VISA GATE. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
