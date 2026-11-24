import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Globe2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowUpDown,
  Filter,
  Eye,
  Settings,
  Calendar,
  ShieldCheck,
  FileText,
  Trash2,
  Edit2,
  Search,
  Database,
  Cloud
} from 'lucide-react';
import { ContinentName, ProgramStatus } from '@thevisagate/shared';

interface WorldCountryRef {
  name: string;
  code: string;
  continent: string;
  flagEmoji: string;
  currency: string;
  capital: string;
}

export const CountriesAdminPage: React.FC = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [worldList, setWorldList] = useState<WorldCountryRef[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [continentFilter, setContinentFilter] = useState('ALL');

  // Modals
  const [countryModal, setCountryModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any | null>(null);
  const [programModal, setProgramModal] = useState<any | null>(null); // Country object or null
  const [editingProgram, setEditingProgram] = useState<any | null>(null);

  // Delete confirmations
  const [deletingCountry, setDeletingCountry] = useState<any | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [countryForm, setCountryForm] = useState({
    name: '',
    code: '',
    continent: 'Asia',
    flagEmoji: '🌐',
    description: '',
    isFeatured: false,
    displayOrder: 1,
    currency: '',
    capital: '',
    isActive: true,
  });

  const [programForm, setProgramForm] = useState({
    countryId: '',
    programName: '',
    visaCategory: 'Work Permit',
    description: '',
    eligibility: '',
    requiredDocuments: '',
    serviceInformation: '',
    startDate: '',
    endDate: '',
    programStatus: 'ACTIVE',
    bookingEnabled: true,
    displayOrder: 1,
    defaultProcessingDays: 60,
  });

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/countries?activeOnly=false');
      if (res.data) setCountries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorldList = async () => {
    try {
      const res: any = await api.get('/countries/world-list');
      if (res.data) setWorldList(res.data);
    } catch (err) {
      console.error('Failed to load world country list', err);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchWorldList();
  }, []);

  const handleSelectWorldCountry = (code: string) => {
    const selected = worldList.find((w) => w.code === code);
    if (selected) {
      setCountryForm((prev) => ({
        ...prev,
        name: selected.name,
        code: selected.code,
        continent: selected.continent,
        flagEmoji: selected.flagEmoji,
        currency: selected.currency,
        capital: selected.capital,
        description: prev.description || `Official visa pathways, work permits, and educational programs for ${selected.name}.`,
      }));
    }
  };

  const handleSaveCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingCountry) {
        await api.patch(`/countries/${editingCountry.id}`, countryForm);
      } else {
        await api.post('/countries', countryForm);
      }
      setCountryModal(false);
      setEditingCountry(null);
      await fetchCountries();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save country');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCountryConfirm = async () => {
    if (!deletingCountry) return;
    setActionLoading(true);
    try {
      await api.delete(`/countries/${deletingCountry.id}`);
      setDeletingCountry(null);
      await fetchCountries();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete country');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCountryFeatured = async (country: any) => {
    try {
      await api.patch(`/countries/${country.id}`, { isFeatured: !country.isFeatured });
      fetchCountries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCountryActive = async (country: any) => {
    try {
      await api.patch(`/countries/${country.id}`, { isActive: !country.isActive });
      fetchCountries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...programForm,
        requiredDocuments: programForm.requiredDocuments
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
      };

      if (editingProgram) {
        await api.patch(`/countries/programs/${editingProgram.id}`, payload);
      } else {
        await api.post('/countries/programs', payload);
      }

      setProgramModal(null);
      setEditingProgram(null);
      await fetchCountries();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to save visa program');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProgramConfirm = async () => {
    if (!deletingProgram) return;
    setActionLoading(true);
    try {
      await api.delete(`/countries/programs/${deletingProgram.id}`);
      setDeletingProgram(null);
      await fetchCountries();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete visa program');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered countries
  const filteredCountries = countries.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.programs && c.programs.some((p: any) => p.programName.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesContinent =
      continentFilter === 'ALL' || c.continent.toLowerCase() === continentFilter.toLowerCase();

    return matchesSearch && matchesContinent;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-serif">
              Offered Destinations & Visa CMS
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-3 h-3 text-emerald-600" />
              Firebase Firestore Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish, edit, and manage active destination countries and programs offered by The Visa Gate. Synchronized with Firebase and disk persistence.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCountry(null);
            setCountryForm({
              name: '',
              code: '',
              continent: 'Asia',
              flagEmoji: '🌐',
              description: '',
              isFeatured: false,
              displayOrder: countries.length + 1,
              currency: '',
              capital: '',
              isActive: true,
            });
            setCountryModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-navy text-white font-bold text-xs hover:bg-brand-navy-light shadow-md transition-colors"
        >
          <Plus className="w-4 h-4 text-brand-gold stroke-[2.5]" />
          <span>Add Destination Country</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search offered destinations or programs (e.g. Bosnia, Romania, Calling Visa)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-navy"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs">
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Continent:
          </span>
          {['ALL', 'Asia', 'Europe', 'North America', 'Oceania', 'Africa', 'South America'].map((cont) => (
            <button
              key={cont}
              onClick={() => setContinentFilter(cont)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold whitespace-nowrap transition-colors ${
                continentFilter === cont
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cont === 'ALL' ? 'All' : cont}
            </button>
          ))}
        </div>
      </div>

      {/* Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredCountries.length}</strong> of <strong>{countries.length}</strong> active offered destination posts
        </span>
        <span className="text-xs text-slate-400">
          World reference catalog (195 countries) accessible in dropdown
        </span>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-16 text-slate-400 text-xs">
            Loading destinations directory from Firebase...
          </div>
        ) : filteredCountries.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <Globe2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No matching offered destinations found</h3>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or add a new destination country.</p>
          </div>
        ) : (
          filteredCountries.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-brand-navy font-serif">{c.name}</h3>
                        <span className="text-xs font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">{c.code}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">Continent: {c.continent} {c.capital ? `• Capital: ${c.capital}` : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleCountryFeatured(c)}
                      title={c.isFeatured ? 'Featured on Homepage' : 'Mark as Featured'}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        c.isFeatured ? 'bg-brand-gold/20 text-brand-navy font-bold' : 'text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-brand-gold" />
                    </button>

                    <button
                      onClick={() => handleToggleCountryActive(c)}
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        c.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>

                    <button
                      onClick={() => setDeletingCountry(c)}
                      title="Delete Country Post"
                      className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description || 'No custom description entered.'}
                </p>

                {/* Programs List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Active Visa Programs ({c.programs?.length || 0}):</span>
                    <button
                      onClick={() => {
                        setProgramForm({
                          countryId: c.id,
                          programName: '',
                          visaCategory: 'Work Permit',
                          description: '',
                          eligibility: '',
                          requiredDocuments: '',
                          serviceInformation: '',
                          startDate: '',
                          endDate: '',
                          programStatus: 'ACTIVE',
                          bookingEnabled: true,
                          displayOrder: (c.programs?.length || 0) + 1,
                          defaultProcessingDays: 60,
                        });
                        setEditingProgram(null);
                        setProgramModal(c);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:text-brand-gold-dark"
                    >
                      <Plus className="w-3 h-3 text-brand-gold" />
                      <span>Add Program</span>
                    </button>
                  </div>

                  {c.programs && c.programs.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {c.programs.map((p: any) => (
                        <div key={p.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs group hover:bg-slate-100 transition-colors">
                          <div className="flex-1 mr-2">
                            <strong className="block text-brand-navy font-semibold">{p.programName}</strong>
                            <span className="text-xs text-slate-500">
                              {p.visaCategory} • Status: <strong className="uppercase">{p.programStatus}</strong> • Avg: {p.defaultProcessingDays || 30} days
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              p.bookingEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {p.bookingEnabled ? 'Bookable' : 'Booking Paused'}
                            </span>

                            <button
                              onClick={() => {
                                setEditingProgram(p);
                                setProgramForm({
                                  countryId: c.id,
                                  programName: p.programName || p.name,
                                  visaCategory: p.visaCategory || 'Work Permit',
                                  description: p.description || '',
                                  eligibility: p.eligibility || '',
                                  requiredDocuments: Array.isArray(p.requiredDocuments) ? p.requiredDocuments.join(', ') : (p.requiredDocuments || ''),
                                  serviceInformation: p.serviceInformation || '',
                                  startDate: p.startDate ? p.startDate.split('T')[0] : '',
                                  endDate: p.endDate ? p.endDate.split('T')[0] : '',
                                  programStatus: p.programStatus || 'ACTIVE',
                                  bookingEnabled: p.bookingEnabled !== false,
                                  displayOrder: p.displayOrder || 1,
                                  defaultProcessingDays: p.defaultProcessingDays || 60,
                                });
                                setProgramModal(c);
                              }}
                              title="Edit Program"
                              className="p-1 rounded text-slate-400 hover:text-brand-navy hover:bg-slate-200"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingProgram(p)}
                              title="Delete Program"
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-1">No dynamic visa programs registered yet. Click &apos;Add Program&apos; above.</p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Order: {c.displayOrder}</span>
                <button
                  onClick={() => {
                    setEditingCountry(c);
                    setCountryForm({
                      name: c.name,
                      code: c.code,
                      continent: c.continent || 'Asia',
                      flagEmoji: c.flagEmoji || '🌐',
                      description: c.description || '',
                      isFeatured: c.isFeatured || false,
                      displayOrder: c.displayOrder || 1,
                      currency: c.currency || '',
                      capital: c.capital || '',
                      isActive: c.isActive !== false,
                    });
                    setCountryModal(true);
                  }}
                  className="text-xs font-semibold text-brand-navy hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Country Settings</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Country Confirmation Modal */}
      {deletingCountry && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Delete {deletingCountry.name}?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this offered country post? This action will permanently remove <strong>{deletingCountry.name}</strong> ({deletingCountry.code}) and all its associated visa programs from both Firebase Firestore and system storage.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setDeletingCountry(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteCountryConfirm}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-md flex items-center gap-1.5"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Program Confirmation Modal */}
      {deletingProgram && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-100">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Delete Visa Program?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete the program <strong>{deletingProgram.programName || deletingProgram.name}</strong>? This program will be removed from Firebase Firestore and client booking catalogs.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setDeletingProgram(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteProgramConfirm}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-md flex items-center gap-1.5"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Country Modal */}
      {countryModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-navy font-serif">
                  {editingCountry ? `Edit Destination: ${editingCountry.name}` : 'Create New Destination Country Post'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pick from the 195 world country reference or customize fields directly.
                </p>
              </div>
              <button onClick={() => setCountryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCountry} className="space-y-4 text-xs">
              {/* Quick Dropdown: 195 World Countries */}
              {!editingCountry && (
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
                  <label className="block font-bold text-brand-navy">
                    ⚡ Auto-Fill from Global Reference (195 World Countries)
                  </label>
                  <select
                    onChange={(e) => handleSelectWorldCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium text-xs text-slate-800"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      -- Choose Country from World List (Auto-fills Code, Continent, Flag, etc.) --
                    </option>
                    {worldList.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name} ({w.code} • {w.continent})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country Name *</label>
                  <input
                    type="text"
                    required
                    value={countryForm.name}
                    onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                    placeholder="e.g. Bosnia and Herzegovina"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ISO 3166-1 Alpha-3 Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={countryForm.code}
                    onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. BIH"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Continent Grouping *</label>
                  <select
                    value={countryForm.continent}
                    onChange={(e) => setCountryForm({ ...countryForm, continent: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                    <option value="Oceania">Oceania</option>
                    <option value="Africa">Africa</option>
                    <option value="South America">South America</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    value={countryForm.flagEmoji}
                    onChange={(e) => setCountryForm({ ...countryForm, flagEmoji: e.target.value })}
                    placeholder="e.g. 🇧🇦"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capital City</label>
                  <input
                    type="text"
                    value={countryForm.capital}
                    onChange={(e) => setCountryForm({ ...countryForm, capital: e.target.value })}
                    placeholder="e.g. Sarajevo"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Currency Code</label>
                  <input
                    type="text"
                    value={countryForm.currency}
                    onChange={(e) => setCountryForm({ ...countryForm, currency: e.target.value.toUpperCase() })}
                    placeholder="e.g. BAM"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Overview & Opportunities</label>
                <textarea
                  rows={3}
                  value={countryForm.description}
                  onChange={(e) => setCountryForm({ ...countryForm, description: e.target.value })}
                  placeholder="Legal employment sectors, calling visa quota details, and universities..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={countryForm.isFeatured}
                    onChange={(e) => setCountryForm({ ...countryForm, isFeatured: e.target.checked })}
                    className="rounded border-slate-300 text-brand-gold focus:ring-brand-gold"
                  />
                  <span className="font-semibold text-slate-700">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={countryForm.isActive}
                    onChange={(e) => setCountryForm({ ...countryForm, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-brand-gold focus:ring-brand-gold"
                  />
                  <span className="font-semibold text-slate-700">Active in Directory</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCountryModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg bg-brand-navy text-white font-bold hover:bg-brand-navy-light shadow-md transition-colors"
                >
                  {actionLoading ? 'Saving...' : 'Save Country'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Visa Program Modal */}
      {programModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-navy font-serif">
                  {editingProgram ? `Edit Program: ${editingProgram.programName || editingProgram.name}` : `Add Dynamic Visa Program for ${programModal.name}`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Creates an independent bookable immigration or education pathway stored in Firebase Firestore.
                </p>
              </div>
              <button onClick={() => setProgramModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Program Name *</label>
                  <input
                    type="text"
                    required
                    value={programForm.programName}
                    onChange={(e) => setProgramForm({ ...programForm, programName: e.target.value })}
                    placeholder="e.g. General Construction Calling Visa"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Visa Category *</label>
                  <select
                    value={programForm.visaCategory}
                    onChange={(e) => setProgramForm({ ...programForm, visaCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Work Permit">Work Permit / Calling Visa</option>
                    <option value="Student Visa">Student Visa / Higher Education</option>
                    <option value="Tourist Visa">Tourist / Business Visa</option>
                    <option value="Residency">Permanent Residency / Investor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Pathway Details *</label>
                <textarea
                  rows={2}
                  required
                  value={programForm.description}
                  onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                  placeholder="Government authorization desks, sectors, and job titles..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  value={programForm.eligibility}
                  onChange={(e) => setProgramForm({ ...programForm, eligibility: e.target.value })}
                  placeholder="e.g. Age 20-40, clear police clearance, GAMCA fit..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Documents (Comma-separated)</label>
                <input
                  type="text"
                  value={programForm.requiredDocuments}
                  onChange={(e) => setProgramForm({ ...programForm, requiredDocuments: e.target.value })}
                  placeholder="Passport, NID, Medical Fitness, Police Clearance..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Program Status</label>
                  <select
                    value={programForm.programStatus}
                    onChange={(e) => setProgramForm({ ...programForm, programStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white uppercase font-bold"
                  >
                    <option value="ACTIVE">Active (Live)</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="PAUSED">Paused</option>
                    <option value="CLOSED">Closed</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avg. Processing Days</label>
                  <input
                    type="number"
                    value={programForm.defaultProcessingDays}
                    onChange={(e) => setProgramForm({ ...programForm, defaultProcessingDays: parseInt(e.target.value, 10) || 30 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={programForm.bookingEnabled}
                  onChange={(e) => setProgramForm({ ...programForm, bookingEnabled: e.target.checked })}
                  className="rounded border-slate-300 text-brand-gold focus:ring-brand-gold"
                />
                <span className="font-semibold text-slate-700">Enable Direct Consultation Booking</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProgramModal(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg bg-brand-navy text-white font-bold hover:bg-brand-navy-light shadow-md transition-colors"
                >
                  {actionLoading ? 'Saving...' : editingProgram ? 'Save Changes' : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
