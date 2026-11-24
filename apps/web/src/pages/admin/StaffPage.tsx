import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  UserCheck,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Shield,
  Phone,
  Mail,
  KeyRound,
  TrendingUp,
  FileText,
  Users,
  Eye,
  BarChart3,
  Calendar,
  Award
} from 'lucide-react';
import { PERMISSIONS } from '@thevisagate/shared';

export const StaffPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'referral-report'>('directory');
  const [staff, setStaff] = useState<any[]>([]);
  const [referralReports, setReferralReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [inspectStaff, setInspectStaff] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    phone: string;
    designation: string;
    employeeId: string;
    password: string;
    permissions: string[];
  }>({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    employeeId: '',
    password: '',
    permissions: [
      PERMISSIONS.CLIENTS_VIEW,
      PERMISSIONS.CLIENTS_CREATE,
      PERMISSIONS.APPLICATIONS_VIEW,
      PERMISSIONS.STEPS_UPDATE,
      PERMISSIONS.DOCUMENTS_VIEW,
      PERMISSIONS.DOCUMENTS_UPLOAD,
      PERMISSIONS.DOCUMENTS_VERIFY,
    ],
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/staff');
      if (res.data) setStaff(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralReports = async () => {
    try {
      setReportLoading(true);
      const res: any = await api.get('/staff/reports/referrals');
      if (res.data) setReferralReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (activeTab === 'referral-report') {
      fetchReferralReports();
    }
  }, [activeTab]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await api.post('/staff', {
        ...formData,
        employeeId: formData.employeeId.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
      });
      setModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        designation: '',
        employeeId: '',
        password: '',
        permissions: [
          PERMISSIONS.CLIENTS_VIEW,
          PERMISSIONS.CLIENTS_CREATE,
          PERMISSIONS.APPLICATIONS_VIEW,
          PERMISSIONS.STEPS_UPDATE,
          PERMISSIONS.DOCUMENTS_VIEW,
          PERMISSIONS.DOCUMENTS_UPLOAD,
          PERMISSIONS.DOCUMENTS_VERIFY,
        ],
      });
      fetchStaff();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to create staff account';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (perm: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists ? prev.permissions.filter((p) => p !== perm) : [...prev.permissions, perm],
      };
    });
  };

  const handleInspect = async (staffId: string) => {
    try {
      const res: any = await api.get(`/staff/${staffId}`);
      setInspectStaff(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStaffActive = async (staffId: string, currentActive: boolean) => {
    try {
      await api.patch(`/staff/${staffId}`, { isActive: !currentActive });
      fetchStaff();
      if (inspectStaff && inspectStaff.staff.id === staffId) {
        handleInspect(staffId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-serif">
            Staff & Referral Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage officer permissions, track assigned client cases, and review referral conversion rates.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light transition-all shadow-md"
        >
          <Plus className="w-4 h-4 text-brand-gold" />
          <span>Add New Staff Account</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('directory')}
          className={`py-3 px-6 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'border-brand-gold text-brand-navy'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Directory ({staff.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('referral-report')}
          className={`py-3 px-6 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'referral-report'
              ? 'border-brand-gold text-brand-navy'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-brand-gold" />
          <span>Staff Referral CRM Reports</span>
        </button>
      </div>

      {/* TAB 1: Staff Directory */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
              Loading staff accounts...
            </div>
          ) : staff.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs hover:border-brand-gold/60 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-navy text-white uppercase tracking-wider">
                    {s.employeeId}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        s.isActive ? 'bg-brand-success' : 'bg-red-400'
                      }`}
                      title={s.isActive ? 'Active' : 'Deactivated'}
                    />
                    <span className="text-xs font-semibold text-slate-500">
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-brand-navy">{s.fullName}</h3>
                  <p className="text-xs text-brand-gold-dark font-medium">{s.designation}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.phone}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-xs text-slate-400 uppercase block">Referred</span>
                    <strong className="text-brand-navy font-bold">{s.referredClientsCount || 0}</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-xs text-slate-400 uppercase block">Assigned</span>
                    <strong className="text-brand-navy font-bold">{s.assignedClientsCount || 0}</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-xs text-slate-400 uppercase block">Active Apps</span>
                    <strong className="text-brand-gold-dark font-bold">{s.assignedApplicationsCount || 0}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStaffActive(s.id, s.isActive)}
                  className={`text-xs font-semibold ${
                    s.isActive ? 'text-red-600 hover:underline' : 'text-emerald-600 hover:underline'
                  }`}
                >
                  {s.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => handleInspect(s.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-navy hover:text-white text-slate-700 text-xs font-bold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Activity</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Staff Referral CRM Reports */}
      {activeTab === 'referral-report' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-brand-navy font-serif">Employee Referral Performance</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Conversion tracking from initial staff client referral to official visa submission and completion.
              </p>
            </div>
            <button
              onClick={fetchReferralReports}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              <span>Refresh Report</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="table-scroll">
              <table className="w-full text-left border-collapse text-xs min-w-[640px]">
                <thead>
                  <tr className="bg-brand-navy text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Staff Member</th>
                    <th className="py-3.5 px-6 text-center">Total Referred</th>
                    <th className="py-3.5 px-6 text-center">Converted Files</th>
                    <th className="py-3.5 px-6 text-center">Completed Visas</th>
                    <th className="py-3.5 px-6 text-center">Conversion Rate</th>
                    <th className="py-3.5 px-6">Top Destination Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Calculating referral metrics...
                      </td>
                    </tr>
                  ) : referralReports.length > 0 ? (
                    referralReports.map((r) => (
                      <tr key={r.staffId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <strong className="block text-brand-navy font-semibold text-sm">{r.staffName}</strong>
                          <span className="text-xs text-slate-400 font-mono">{r.employeeId} • {r.designation}</span>
                        </td>

                        <td className="py-4 px-6 text-center font-bold text-sm text-brand-navy">
                          {r.totalReferredClients}
                        </td>

                        <td className="py-4 px-6 text-center font-bold text-sm text-brand-gold-dark">
                          {r.convertedApplications}
                        </td>

                        <td className="py-4 px-6 text-center font-bold text-sm text-brand-success">
                          {r.completedApplications}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            r.conversionRatePercent >= 50
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.conversionRatePercent > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {r.conversionRatePercent}%
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(r.countryBreakdown).length > 0 ? (
                              Object.entries(r.countryBreakdown).map(([country, count]: any) => (
                                <span key={country} className="px-2 py-0.5 rounded bg-slate-100 text-xs font-medium text-slate-700">
                                  {country}: <strong>{count}</strong>
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic text-xs">No applications yet</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No referral data recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Staff Drawer */}
      {inspectStaff && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
                  Staff Inspector
                </span>
                <h3 className="text-xl font-bold text-brand-navy">{inspectStaff.staff.fullName}</h3>
                <span className="text-xs font-mono text-slate-500">
                  {inspectStaff.staff.employeeId} • {inspectStaff.staff.designation}
                </span>
              </div>
              <button onClick={() => setInspectStaff(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* Referred Clients List */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-brand-navy flex items-center justify-between">
                  <span>Referred Clients ({inspectStaff.referredClients.length})</span>
                  <span className="text-xs text-brand-gold">Referral Attribution</span>
                </h4>
                {inspectStaff.referredClients.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {inspectStaff.referredClients.map((c: any) => (
                      <div key={c.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <strong className="block text-brand-navy">{c.fullName}</strong>
                          <span className="text-xs text-slate-400 font-mono">
                            {c.clientCode} • Source: {c.clientSource} ({c.referralDate || 'N/A'})
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          c.hasCompleted ? 'bg-emerald-100 text-emerald-800' : c.hasConverted ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {c.hasCompleted ? 'Completed' : c.hasConverted ? 'In Progress' : 'No App'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No clients referred yet.</p>
                )}
              </div>

              {/* Assigned Processing Clients */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-brand-navy">
                  Assigned Processing Clients ({inspectStaff.assignedClients.length})
                </h4>
                {inspectStaff.assignedClients.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {inspectStaff.assignedClients.map((c: any) => (
                      <div key={c.id} className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <strong className="block text-brand-navy">{c.fullName}</strong>
                          <span className="text-xs text-slate-400">{c.phone}</span>
                        </div>
                        <span className="text-slate-600 font-mono text-xs">{c.clientCode}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No processing clients assigned.</p>
                )}
              </div>

              {/* Assigned Applications */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-brand-navy">
                  Assigned Application Files ({inspectStaff.assignedApplications.length})
                </h4>
                {inspectStaff.assignedApplications.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {inspectStaff.assignedApplications.map((app: any) => (
                      <div key={app.id} className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <strong className="block text-brand-navy font-mono">{app.applicationCode}</strong>
                          <span className="text-xs text-slate-500">{app.clientName} • {app.countryName}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-brand-gold/20 text-brand-navy">
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No application files assigned.</p>
                )}
              </div>

              {/* Recent Audit Activities */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-brand-navy">Recent Staff Activities</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {inspectStaff.activities.map((a: any, i: number) => (
                    <div key={i} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-mono text-brand-navy font-semibold">{a.action}</span>
                      <span className="text-slate-400 text-xs">{new Date(a.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-brand-navy font-serif">Add Staff / Case Officer</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-xs">Creation Failed</p>
                  <p className="text-xs leading-relaxed text-red-600">{formError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g. EMP-002"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Shakil Ahmed"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="shakil@thevisagate.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1XXXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Senior Case Officer"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Permissions Checkbox Grid */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 mb-2">Assign Operational Permissions:</label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {Object.entries(PERMISSIONS).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(val)}
                        onChange={() => togglePermission(val)}
                        className="rounded border-slate-300 text-brand-gold focus:ring-brand-gold"
                      />
                      <span className="font-mono text-xs text-slate-700">{val}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-brand-navy text-white font-bold hover:bg-brand-navy-light shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
