import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Globe2,
  ArrowRight,
  Search,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { EstimateNotice } from '../../components/common/EstimateNotice';

export const CountriesPage: React.FC = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContinent, setActiveContinent] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<any | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const continents = [
    { label: 'All Continents', value: 'ALL' },
    { label: 'Asia', value: 'Asia' },
    { label: 'Europe', value: 'Europe' },
    { label: 'North America', value: 'North America' },
    { label: 'Oceania', value: 'Oceania' },
    { label: 'Africa', value: 'Africa' },
    { label: 'South America', value: 'South America' },
  ];

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeContinent !== 'ALL') params.append('continent', activeContinent);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res: any = await api.get(`/countries?${params.toString()}`);
      if (res.data) {
        setCountries(res.data);
        setFetchError(null);
      }
    } catch (err) {
      console.error(err);
      setFetchError(
        'We could not load the destination list. Please check your connection and try again, or call the hotline.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCountries();
    }, 250);
    return () => clearTimeout(delay);
  }, [activeContinent, searchTerm]);

  return (
    <div className="space-y-14 sm:space-y-16 pb-20">
      {/* Hero Section */}
      <section className="bg-brand-navy text-white py-14 sm:py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
            Global Destinations &amp; Programs
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white">
            Explore International Destinations
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Browse the visa pathways we currently handle — work permits, student visas and visit categories — with the
            documents and processing sequence for each.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-brand-gold/90 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
            <span>Consultancy &amp; Application Assistance • Decisions rest with each government authority</span>
          </div>
        </div>
      </section>

      {/* Main Directory & Filter Interface */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Filter Navigation Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <label htmlFor="country-search" className="sr-only">
                Search destinations by name or country code
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="country-search"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search country or code (e.g. Malaysia, MYS)"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <p className="text-xs text-slate-500" role="status" aria-live="polite">
              {loading ? 'Loading destinations…' : (
                <>
                  Showing <strong className="text-brand-navy">{countries.length}</strong> destination
                  {countries.length !== 1 ? 's' : ''}
                </>
              )}
            </p>
          </div>

          {/* Continent Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {continents.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setActiveContinent(c.value)}
                aria-pressed={activeContinent === c.value}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
                  activeContinent === c.value
                    ? 'bg-brand-navy text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Countries Grid */}
        {loading ? (
          <div role="status" className="py-24 text-center text-slate-500 text-sm">
            Loading international destinations…
          </div>
        ) : countries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {countries.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-brand-gold/80 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-brand-navy font-serif group-hover:text-brand-gold-dark transition-colors">
                          {c.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs font-mono text-slate-500 uppercase font-semibold">{c.code}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {c.continent}
                          </span>
                        </div>
                      </div>
                    </div>

                    {c.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-navy font-bold text-xs uppercase tracking-wider shrink-0">
                        <Sparkles className="w-2.5 h-2.5 text-brand-gold-dark" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {c.description || 'Visa consultancy support and legal documentation assistance.'}
                  </p>

                  {/* Programs */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-semibold text-slate-700">Available programs:</span>
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-brand-gold/15 text-brand-navy font-mono shrink-0">
                        {c.activeProgramsCount || 0} active
                      </span>
                    </div>

                    {c.programs && c.programs.length > 0 ? (
                      <div className="space-y-1">
                        {c.programs.slice(0, 2).map((p: any) => (
                          <div
                            key={p.id}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="text-brand-navy font-medium truncate">{p.programName}</span>
                            <span className="text-xs text-brand-gold-dark font-semibold shrink-0">
                              {p.visaCategory}
                            </span>
                          </div>
                        ))}
                        {c.programs.length > 2 && (
                          <span className="text-xs text-slate-500 block text-right font-medium">
                            +{c.programs.length - 2} more program{c.programs.length - 2 !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                        General consultation open
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCountry(c)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-gold-dark transition-colors min-h-[44px]"
                  >
                    <span>View programs</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <Link
                    to="/contact"
                    className="px-3.5 py-2.5 rounded-lg bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold transition-all shadow-xs min-h-[44px] inline-flex items-center"
                  >
                    Book Consultation
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div
            role="alert"
            className="bg-white rounded-2xl border border-red-200 p-10 sm:p-12 text-center text-slate-500 space-y-3"
          >
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-base font-bold text-brand-navy">We could not load destinations</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{fetchError}</p>
            <button
              type="button"
              onClick={fetchCountries}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-navy text-white text-xs font-bold min-h-[44px]"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 sm:p-12 text-center text-slate-500 space-y-3">
            <Globe2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-brand-navy">No destination countries match your search</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try a different keyword, or select “All Continents”. If your destination is not listed, contact us — we
              still handle many cases outside the published directory.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:text-brand-gold-dark mt-1"
            >
              <span>Ask about another destination</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* Country Detail Modal */}
      <Modal
        isOpen={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
        title={selectedCountry?.name || ''}
        description={
          selectedCountry
            ? `${selectedCountry.code} · ${selectedCountry.continent}${
                selectedCountry.capital ? ` · Capital: ${selectedCountry.capital}` : ''
              }`
            : undefined
        }
        maxWidth="2xl"
      >
        {selectedCountry && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <p className="text-sm text-slate-600 leading-relaxed">{selectedCountry.description}</p>
            </div>

            {/* Program Catalog */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-brand-navy flex items-center justify-between gap-3 flex-wrap">
                <span>
                  Active visa programs ({selectedCountry.programs?.length || 0})
                </span>
                <span className="text-xs text-brand-gold-dark font-medium">Consultancy &amp; filing support</span>
              </h4>

              {selectedCountry.programs && selectedCountry.programs.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {selectedCountry.programs.map((prog: any) => (
                    <div
                      key={prog.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <strong className="text-sm font-bold text-brand-navy">{prog.programName}</strong>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-brand-gold/20 text-brand-navy uppercase shrink-0">
                          {prog.visaCategory}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{prog.description}</p>

                      {prog.eligibility && (
                        <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                          <strong className="text-brand-navy block mb-0.5">Who this is for:</strong>
                          <span>{prog.eligibility}</span>
                        </div>
                      )}

                      {prog.requiredDocuments && prog.requiredDocuments.length > 0 && (
                        <div className="text-xs text-slate-600">
                          <strong className="text-brand-navy block mb-1">Typical documents:</strong>
                          <div className="flex flex-wrap gap-1">
                            {prog.requiredDocuments.map((doc: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-white border border-slate-200 text-xs"
                              >
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200/60 flex-wrap">
                        <span>
                          Our planning estimate:{' '}
                          <strong className="text-slate-700">~{prog.defaultProcessingDays} days</strong>
                        </span>
                        {prog.bookingEnabled ? (
                          <Link
                            to="/contact"
                            className="inline-flex items-center gap-1 text-brand-navy font-bold hover:text-brand-gold-dark"
                          >
                            <span>Discuss this program</span>
                            <ArrowRight className="w-3 h-3 text-brand-gold" />
                          </Link>
                        ) : (
                          <span className="text-slate-500 italic">Inquiry on special request</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
                  No active programs listed at this moment. You can still schedule a general eligibility
                  consultation.
                </div>
              )}
            </div>

            <EstimateNotice
              compact
              text="Program durations shown are our internal planning estimates. They are not guaranteed processing times — the destination authority sets the actual timeline and the final decision."
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
