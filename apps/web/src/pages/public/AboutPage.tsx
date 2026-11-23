import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Scale, ShieldCheck, ArrowRight, MapPin, Phone } from 'lucide-react';
import { OFFICE } from '../../components/common/ContactStrip';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Banner */}
      <section className="bg-brand-navy text-white py-14 sm:py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
            About Our Organisation
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white">
            Integrity, Guidance &amp; Global Mobility
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The Visa Gate is a private consultancy that helps individuals and corporate clients prepare, file and track
            visa applications across a range of destinations.
          </p>
        </div>
      </section>

      {/* Who we are — with an explicit "what we are not" statement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-lg bg-brand-navy flex items-center justify-center text-brand-gold">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy font-serif">Our mission</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              To give clients a clear, verifiable path through a complicated immigration process — with an honest
              eligibility assessment up front, correct documentation, and visible progress at every stage.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-lg bg-brand-navy flex items-center justify-center text-brand-gold">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy font-serif">Our approach</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every file is handled by a named case officer. You see the same information we do — the current step, its
              scheduled date and the status of each document — so nothing happens behind the scenes.
            </p>
          </div>
        </div>
      </section>

      {/* What we are and are not — trust section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-brand-navy text-white rounded-2xl p-6 sm:p-9 border border-white/10">
          <div className="flex items-center gap-2.5 mb-4">
            <Scale className="w-5 h-5 text-brand-gold" />
            <h2 className="text-xl font-bold font-serif">What we are — and what we are not</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold mb-3">We are</h3>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li>· A private visa consultancy operating from our Dhaka office</li>
                <li>· Your appointed representative for document preparation and filing</li>
                <li>· A case management system that keeps you informed of every milestone</li>
                <li>· Counselors who will tell you honestly when a route is unrealistic</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">We are not</h3>
              <ul className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <li>· A government body, embassy or immigration authority</li>
                <li>· A visa issuer — approval rests entirely with the destination authority</li>
                <li>· Able to guarantee a decision, a processing time or a job offer</li>
                <li>· Connected to, or acting on behalf of, any government agency</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-12 border border-slate-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy font-serif text-center mb-8">
            What working with us looks like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                n: '01',
                t: 'Clear eligibility advice',
                d: 'We assess your profile against the actual requirements and explain which options are open to you.',
              },
              {
                n: '02',
                t: 'Verified documentation',
                d: 'Every paper is checked for correctness and expiry before it is filed anywhere.',
              },
              {
                n: '03',
                t: 'Full procedural visibility',
                d: 'You follow each stage, its dates and your document status in the client portal.',
              },
              {
                n: '04',
                t: 'Accountable handling',
                d: 'A named case officer owns your file, with a recorded audit trail of every action taken.',
              },
            ].map((v) => (
              <div key={v.n} className="space-y-2">
                <div className="text-brand-gold font-bold text-lg font-serif">{v.n}</div>
                <h3 className="text-sm font-bold text-brand-navy">{v.t}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office & contact */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <ShieldCheck className="w-5 h-5 text-brand-gold-dark" />
            <h2 className="text-xl font-bold text-brand-navy font-serif">Where to find us</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Office</span>
                <span className="block text-xs text-slate-700 leading-relaxed mt-0.5">
                  {OFFICE.addressLine1}
                  <br />
                  {OFFICE.addressLine2}
                  <br />
                  <span className="text-brand-gold-dark">{OFFICE.landmark}</span>
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Hotline</span>
                <a
                  href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
                  className="block text-xs font-bold text-brand-navy mt-0.5 hover:underline"
                >
                  {OFFICE.hotline}
                </a>
                <span className="block text-xs text-slate-600 font-mono">{OFFICE.hotlineAlt}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Opening hours</span>
                <span className="block text-xs text-slate-700 mt-0.5 leading-relaxed">{OFFICE.hours}</span>
                <span className="block text-xs text-red-600 mt-0.5">{OFFICE.fridayNote}</span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-navy text-white font-bold text-sm hover:bg-brand-navy-light transition-colors min-h-[48px]"
            >
              <span>Book a Consultation</span>
              <ArrowRight className="w-4 h-4 text-brand-gold" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-slate-300 text-brand-navy font-bold text-sm hover:bg-slate-50 transition-colors min-h-[48px]"
            >
              <span>See How the Process Works</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
