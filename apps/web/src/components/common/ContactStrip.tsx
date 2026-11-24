import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export const OFFICE = {
  hotline: '+880 1356-593534',
  hotlineAlt: '+880 1356-593535',
  email: 'thevisagate@gmail.com',
  addressLine1: 'Flat B4, 5th Floor (Lift 4), House 127, Road 03, Block A, Sector 12',
  addressLine2: 'Mirpur, Pallabi, Dhaka 1216',
  landmark: 'Near Pallabi Metro Rail Station & Lal Math',
  hours: 'Saturday – Thursday, 11:00 AM – 6:00 PM',
  fridayNote: 'Friday: closed for walk-in consultations',
};

/**
 * Compact, always-visible contact block used across public pages and the
 * client portal so a visitor always has a direct way to reach the agency.
 */
export const ContactStrip: React.FC<{ className?: string; tone?: 'light' | 'dark' }> = ({
  className = '',
  tone = 'light',
}) => {
  const isDark = tone === 'dark';
  const itemClass = `flex items-start gap-2.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`;
  const labelClass = `block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-brand-gold' : 'text-brand-gold-dark'}`;
  const valueClass = `block ${isDark ? 'text-white' : 'text-brand-navy'} font-semibold`;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 ${className}`}>
      <div className={itemClass}>
        <Phone className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
        <span>
          <span className={labelClass}>Hotline</span>
          <a href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`} className={`${valueClass} hover:underline`}>
            {OFFICE.hotline}
          </a>
          <span className="block text-xs text-slate-500">{OFFICE.hotlineAlt}</span>
        </span>
      </div>

      <div className={itemClass}>
        <Mail className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
        <span>
          <span className={labelClass}>Email</span>
          <a href={`mailto:${OFFICE.email}`} className={`${valueClass} hover:underline break-all`}>
            {OFFICE.email}
          </a>
        </span>
      </div>

      <div className={itemClass}>
        <MapPin className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
        <span>
          <span className={labelClass}>Office</span>
          <span className={`${valueClass} leading-relaxed`}>
            {OFFICE.addressLine1}
            <br />
            {OFFICE.addressLine2}
          </span>
        </span>
      </div>

      <div className={itemClass}>
        <Clock className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
        <span>
          <span className={labelClass}>Open</span>
          <span className={`${valueClass} leading-relaxed`}>{OFFICE.hours}</span>
        </span>
      </div>
    </div>
  );
};

/**
 * Inline call-to-action strip used near the bottom of public pages.
 */
export const ContactCTA: React.FC = () => (
  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="bg-brand-navy rounded-2xl p-6 sm:p-10 border border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/25 px-3 py-1 rounded-full">
            <MessageCircle className="w-3.5 h-3.5" />
            Talk to a counsellor
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            Not sure which visa route fits you?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Book a consultation and we will review your passport, education and work history, then explain the
            realistic options, the documents you will need, and what each stage involves.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6 space-y-4">
          <ContactStrip tone="dark" className="sm:grid-cols-1" />
          <Link
            to="/contact"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-gold text-brand-navy font-bold text-sm hover:bg-brand-gold-light transition-colors"
          >
            Schedule a Consultation
          </Link>
        </div>
      </div>
    </div>
  </section>
);
