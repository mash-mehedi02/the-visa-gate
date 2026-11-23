import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  Briefcase,
  Search,
  Plus,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  ArrowRight,
  Workflow,
  Edit2,
  ChevronRight,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Trash2,
  Eye,
  EyeOff,
  History,
  UserCheck
} from 'lucide-react';
import { ApplicationStatus, StepStatus } from '@thevisagate/shared';

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [addStepModal, setAddStepModal] = useState(false);
  const [editStepModal, setEditStepModal] = useState<any | null>(null);
  const [historyModalStep, setHistoryModalStep] = useState<any | null>(null);

  // Aux data for creation & assignment
  const [clients, setClients] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Form states for creation
  const [createForm, setCreateForm] = useState({
    applicationCode: '',
    clientId: '',
    countryId: '',
    visaCategoryId: '',
    assignedStaffIds: [] as string[],
    applicationDate: new Date().toISOString().split('T')[0],
    status: ApplicationStatus.ACTIVE,
    workflowTemplateId: '',
    internalNotes: '',
  });

  // Form states for adding custom step
  const [stepForm, setStepForm] = useState({
    stepName: '',
    description: '',
    scheduledDate: '',
    deadline: '',
    assignedStaffId: '',
    clientInstructions: '',
    internalNotes: '',
    isPublishedToClient: true,
  });

  // Form states for editing existing step
  const [editForm, setEditForm] = useState({
    stepName: '',
    description: '',
    status: StepStatus.NOT_STARTED,
    scheduledDate: '',
    deadline: '',
    assignedStaffId: '',
    clientInstructions: '',
    internalNotes: '',
    isPublishedToClient: true,
  });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const url = `/applications?search=${encodeURIComponent(searchTerm)}${statusFilter ? `&status=${statusFilter}` : ''}`;
      const res: any = await api.get(url);
      if (res.data) setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [searchTerm, statusFilter]);

  const openCreateModal = async () => {
    try {
      const [cliRes, cntRes, tmplRes, stfRes]: [any, any, any, any] = await Promise.all([
        api.get('/clients?limit=100'),
        api.get('/countries'),
        api.get('/workflows/templates'),
        api.get('/staff'),
      ]);
      const clientList = Array.isArray(cliRes.data)
        ? cliRes.data
        : cliRes.data?.clients && Array.isArray(cliRes.data.clients)
        ? cliRes.data.clients
        : [];
      setClients(clientList);
      if (Array.isArray(cntRes.data)) setCountries(cntRes.data);
      if (Array.isArray(tmplRes.data)) setTemplates(tmplRes.data);
      if (Array.isArray(stfRes.data)) setStaffList(stfRes.data);
      setCreateModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        clientId: createForm.clientId,
        countryId: createForm.countryId,
        visaCategoryId: createForm.visaCategoryId,
        assignedStaffIds: createForm.assignedStaffIds,
        applicationDate: createForm.applicationDate,
        status: createForm.status,
        workflowTemplateId: createForm.workflowTemplateId || undefined,
        internalNotes: createForm.internalNotes || undefined,
      };
      if (createForm.applicationCode.trim()) {
        payload.applicationCode = createForm.applicationCode.trim();
      }

      await api.post('/applications', payload);
      setCreateModalOpen(false);
      setCreateForm({
        applicationCode: '',
        clientId: '',
        countryId: '',
        visaCategoryId: '',
        assignedStaffIds: [],
        applicationDate: new Date().toISOString().split('T')[0],
        status: ApplicationStatus.ACTIVE,
        workflowTemplateId: '',
        internalNotes: '',
      });
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to create application');
    }
  };

  const inspectCase = async (appId: string) => {
    try {
      const [res, stfRes]: [any, any] = await Promise.all([
        api.get(`/applications/${appId}`),
        api.get('/staff'),
      ]);
      if (res.data) setSelectedCase(res.data);
      if (stfRes.data) setStaffList(stfRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStepStatus = async (stepId: string, newStatus: StepStatus) => {
    try {
      await api.patch(`/workflows/steps/${stepId}`, { status: newStatus });
      if (selectedCase) {
        inspectCase(selectedCase.id);
      }
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to update step status');
    }
  };

  const openEditStepModal = (step: any) => {
    setEditStepModal(step);
    setEditForm({
      stepName: step.stepName || '',
      description: step.description || '',
      status: step.status || StepStatus.NOT_STARTED,
      scheduledDate: step.scheduledDate || '',
      deadline: step.deadline || '',
      assignedStaffId: step.assignedStaffId || '',
      clientInstructions: step.clientInstructions || '',
      internalNotes: step.internalNotes || '',
      isPublishedToClient: step.isPublishedToClient ?? true,
    });
  };

  const handleSaveEditStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStepModal) return;
    try {
      await api.patch(`/workflows/steps/${editStepModal.id}`, {
        stepName: editForm.stepName,
        description: editForm.description,
        status: editForm.status,
        scheduledDate: editForm.scheduledDate || null,
        deadline: editForm.deadline || null,
        assignedStaffId: editForm.assignedStaffId || null,
        clientInstructions: editForm.clientInstructions || null,
        internalNotes: editForm.internalNotes || null,
        isPublishedToClient: editForm.isPublishedToClient,
      });
      setEditStepModal(null);
      if (selectedCase) {
        inspectCase(selectedCase.id);
      }
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to save step changes');
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this processing step? This will remove it from the applicant timeline.')) return;
    try {
      await api.delete(`/workflows/steps/${stepId}`);
      if (selectedCase) {
        inspectCase(selectedCase.id);
      }
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Failed to delete step');
    }
  };

  const handleMoveStep = async (stepIndex: number, direction: 'up' | 'down') => {
    if (!selectedCase || !selectedCase.steps) return;
    const steps = [...selectedCase.steps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    // Swap elements
    const temp = steps[stepIndex];
    steps[stepIndex] = steps[targetIndex];
    steps[targetIndex] = temp;

    const orderedIds = steps.map((s) => s.id);
    try {
      await api.post(`/workflows/applications/${selectedCase.id}/steps/reorder`, { stepIds: orderedIds });
      inspectCase(selectedCase.id);
    } catch (err: any) {
      alert(err.message || 'Failed to reorder steps');
    }
  };

  const handleAddCustomStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      await api.post(`/workflows/applications/${selectedCase.id}/steps`, {
        stepName: stepForm.stepName,
        description: stepForm.description,
        scheduledDate: stepForm.scheduledDate || null,
        deadline: stepForm.deadline || null,
        assignedStaffId: stepForm.assignedStaffId || null,
        clientInstructions: stepForm.clientInstructions || null,
        internalNotes: stepForm.internalNotes || null,
        sortOrder: (selectedCase.steps?.length || 0) + 1,
        isPublishedToClient: stepForm.isPublishedToClient,
      });
      setAddStepModal(false);
      setStepForm({
        stepName: '',
        description: '',
        scheduledDate: '',
        deadline: '',
        assignedStaffId: '',
        clientInstructions: '',
        internalNotes: '',
        isPublishedToClient: true,
      });
      inspectCase(selectedCase.id);
    } catch (err: any) {
      alert(err.message || 'Failed to add step');
    }
  };

  const selectedCountry = countries.find((c) => c.id === createForm.countryId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy font-serif">Visa Application Cases</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active immigration cases, customized procedural workflows, and milestone tracking.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-gold text-brand-navy font-bold text-xs hover:bg-brand-gold-light transition-all shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Application Case</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by application code (TVG-2026-...), applicant name, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <option value="">All Statuses</option>
            {Object.values(ApplicationStatus).map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="table-scroll">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Case Code</th>
                <th className="py-3 px-6">Applicant Name</th>
                <th className="py-3 px-6">Destination & Visa</th>
                <th className="py-3 px-6">Current Step</th>
                <th className="py-3 px-6">Progress</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6 font-mono font-bold text-brand-navy">
                      {app.applicationCode}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {app.clientName}
                      <span className="block text-[10px] text-slate-400 font-mono">{app.clientPassportMasked}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-semibold text-brand-navy block">{app.countryName}</span>
                      <span className="text-[11px] text-slate-500">{app.visaCategoryName}</span>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-700">
                      {app.currentStep}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-brand-navy font-mono">
                        {app.completedSteps} / {app.totalSteps}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => inspectCase(app.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-semibold transition-colors"
                      >
                        <Workflow className="w-3.5 h-3.5 text-brand-gold" />
                        <span>Manage Steps</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No applications found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Application Modal (Full 9 Fields) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-bold text-brand-navy font-serif">Open New Visa Application Case</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register file, assign case officer, and deploy procedural workflow.</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              {/* Field 1: Application Code & Application Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Application Code <span className="text-slate-400 font-normal">(Leave blank for TVG-2026-XXXX)</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.applicationCode}
                    onChange={(e) => setCreateForm({ ...createForm, applicationCode: e.target.value })}
                    placeholder="e.g. TVG-2026-0002"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Application Date *</label>
                  <input
                    type="date"
                    required
                    value={createForm.applicationDate}
                    onChange={(e) => setCreateForm({ ...createForm, applicationDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Field 2: Client */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Registered Client *</label>
                <select
                  required
                  value={createForm.clientId}
                  onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">-- Choose registered applicant --</option>
                  {Array.isArray(clients) && clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.clientCode} • Passport: {c.passportMasked} • Phone: {c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3 & 4: Country & Visa Program */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination Country *</label>
                  <select
                    required
                    value={createForm.countryId}
                    onChange={(e) => setCreateForm({ ...createForm, countryId: e.target.value, visaCategoryId: '' })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">-- Select Country --</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Visa Category / Program *</label>
                  <select
                    required
                    disabled={!createForm.countryId}
                    value={createForm.visaCategoryId}
                    onChange={(e) => setCreateForm({ ...createForm, visaCategoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white disabled:opacity-50"
                  >
                    <option value="">-- Select Visa Program --</option>
                    {(() => {
                      const allOpts = [
                        ...(selectedCountry?.categories || []),
                        ...(selectedCountry?.programs?.map((p: any) => ({
                          id: p.id,
                          name: p.programName || p.name,
                        })) || []),
                      ];
                      const map = new Map();
                      allOpts.forEach((item: any) => {
                        if (item && item.id && !map.has(item.id)) {
                          map.set(item.id, item);
                        }
                      });
                      const unique = Array.from(map.values());
                      if (unique.length === 0 && createForm.countryId) {
                        return <option disabled value="">(No visa programs created for this country yet)</option>;
                      }
                      return unique.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name || cat.programName}</option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              {/* Field 5: Assigned Staff */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Case Officer (Staff)</label>
                <select
                  value={createForm.assignedStaffIds[0] || ''}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      assignedStaffIds: e.target.value ? [e.target.value] : [],
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">-- Assign Dedicated Processing Staff --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.designation} • ID: {s.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 6: Current Status & Workflow Template */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Status *</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as ApplicationStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value={ApplicationStatus.ACTIVE}>ACTIVE</option>
                    <option value={ApplicationStatus.DRAFT}>DRAFT</option>
                    <option value={ApplicationStatus.ON_HOLD}>ON HOLD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Workflow Template</label>
                  <select
                    value={createForm.workflowTemplateId}
                    onChange={(e) => setCreateForm({ ...createForm, workflowTemplateId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">-- Blank Custom Workflow --</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.totalSteps || t.steps?.length} steps · {typeof t.totalDays === 'number' ? `${t.totalDays} days` : '—'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 7: Internal Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Case Notes</label>
                <textarea
                  rows={2}
                  value={createForm.internalNotes}
                  onChange={(e) => setCreateForm({ ...createForm, internalNotes: e.target.value })}
                  placeholder="Intake remarks, specific client requirements, or priority instructions..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-brand-navy text-white font-bold hover:bg-brand-navy-light shadow-xs"
                >
                  Open Application Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Management & Dynamic Workflow Inspector Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base text-brand-navy">
                    {selectedCase.applicationCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                    {selectedCase.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Lodge Date: {selectedCase.applicationDate}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-brand-navy font-serif mt-1">
                  {selectedCase.client?.fullName} — {selectedCase.country?.name} ({selectedCase.visaCategory?.name})
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>Client Code: <strong className="text-brand-navy">{selectedCase.client?.clientCode}</strong></span>
                  <span>•</span>
                  <span>Passport: <strong className="text-brand-navy font-mono">{selectedCase.client?.passportMasked}</strong></span>
                  <span>•</span>
                  <span>Phone: <strong className="text-brand-navy">{selectedCase.client?.phone}</strong></span>
                </div>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps Workflow Engine Management */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-brand-gold" />
                    <span>Dynamic Procedural Workflow ({selectedCase.steps.length} Steps)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Reorder steps, set scheduled dates, modify statuses, edit client notices, or delete unused milestones.
                  </p>
                </div>

                <button
                  onClick={() => setAddStepModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold text-brand-navy font-bold text-xs hover:bg-brand-gold-light shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Custom Step</span>
                </button>
              </div>

              {/* Steps List */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {selectedCase.steps.map((step: any, index: number) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all hover:border-slate-300"
                  >
                    {/* Left: Reorder & Number */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex flex-col items-center gap-0.5 pt-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveStep(index, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-brand-navy disabled:opacity-20 hover:bg-slate-200"
                          title="Move step up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 h-6 rounded-full bg-brand-navy text-brand-gold font-bold flex items-center justify-center text-[10px] shadow-xs">
                          {step.sortOrder}
                        </span>
                        <button
                          type="button"
                          disabled={index === selectedCase.steps.length - 1}
                          onClick={() => handleMoveStep(index, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-brand-navy disabled:opacity-20 hover:bg-slate-200"
                          title="Move step down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-brand-navy text-sm">{step.stepName}</span>
                          {step.isPublishedToClient ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                              <Eye className="w-3 h-3" /> Client Visible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-200 text-slate-600">
                              <EyeOff className="w-3 h-3" /> Internal Only
                            </span>
                          )}
                        </div>

                        {/* Scheduled Date & Deadline */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span>
                            📅 Scheduled:{' '}
                            {step.scheduledDate ? (
                              <strong className="text-brand-navy">{step.scheduledDate}</strong>
                            ) : (
                              <span className="text-amber-800 italic font-sans">To Be Scheduled</span>
                            )}
                          </span>
                          {step.deadline && (
                            <span>• Deadline: <strong className="text-rose-600">{step.deadline}</strong></span>
                          )}
                          {step.completedDate && (
                            <span>• Done: <strong className="text-emerald-700">{step.completedDate}</strong></span>
                          )}
                        </div>

                        {/* Client Instructions */}
                        {step.clientInstructions && (
                          <div className="text-[11px] text-brand-navy bg-brand-gold/10 p-2 rounded-lg border border-brand-gold/30">
                            <span className="font-bold text-[10px] uppercase text-brand-gold-dark block">Client Notice:</span>
                            {step.clientInstructions}
                          </div>
                        )}

                        {/* Internal Notes */}
                        {step.internalNotes && (
                          <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                            <span className="font-bold text-[10px] uppercase text-slate-400 block">Internal Staff Note:</span>
                            {step.internalNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Status selector & Action Buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <select
                        value={step.status}
                        onChange={(e) => handleUpdateStepStatus(step.id, e.target.value as StepStatus)}
                        className={`px-3 py-1.5 rounded-lg border font-bold text-xs ${
                          step.status === StepStatus.COMPLETED
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : step.status === StepStatus.IN_PROGRESS
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : step.status === StepStatus.DELAYED
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : step.status === StepStatus.PENDING
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : step.status === StepStatus.SKIPPED
                            ? 'bg-slate-200 text-slate-600 border-slate-300'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value={StepStatus.NOT_STARTED}>Not Started</option>
                        <option value={StepStatus.IN_PROGRESS}>In Progress</option>
                        <option value={StepStatus.PENDING}>Pending</option>
                        <option value={StepStatus.COMPLETED}>Completed</option>
                        <option value={StepStatus.DELAYED}>Delayed</option>
                        <option value={StepStatus.SKIPPED}>Skipped</option>
                        <option value={StepStatus.ON_HOLD}>On Hold</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => openEditStepModal(step)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-brand-navy hover:bg-slate-100"
                        title="Edit step details & dates"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                        title="Delete unused step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-6 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light shadow-xs"
              >
                Close Case Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Step Modal */}
      {editStepModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-brand-navy font-serif">Edit Processing Step</h4>
              <button onClick={() => setEditStepModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStep} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Step Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.stepName}
                  onChange={(e) => setEditForm({ ...editForm, stepName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as StepStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value={StepStatus.NOT_STARTED}>Not Started</option>
                    <option value={StepStatus.IN_PROGRESS}>In Progress</option>
                    <option value={StepStatus.PENDING}>Pending</option>
                    <option value={StepStatus.COMPLETED}>Completed</option>
                    <option value={StepStatus.DELAYED}>Delayed</option>
                    <option value={StepStatus.SKIPPED}>Skipped</option>
                    <option value={StepStatus.ON_HOLD}>On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Case Officer</label>
                  <select
                    value={editForm.assignedStaffId}
                    onChange={(e) => setEditForm({ ...editForm, assignedStaffId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">-- No specific staff --</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.designation})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={editForm.scheduledDate}
                    onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={editForm.deadline}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Client Instructions (Displayed on Client Portal)
                </label>
                <textarea
                  rows={2}
                  value={editForm.clientInstructions}
                  onChange={(e) => setEditForm({ ...editForm, clientInstructions: e.target.value })}
                  placeholder="Instructions for applicant to follow..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Internal Notes (Visible only to Admin & Staff)
                </label>
                <textarea
                  rows={2}
                  value={editForm.internalNotes}
                  onChange={(e) => setEditForm({ ...editForm, internalNotes: e.target.value })}
                  placeholder="Private internal case tracking notes..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsPublished"
                  checked={editForm.isPublishedToClient}
                  onChange={(e) => setEditForm({ ...editForm, isPublishedToClient: e.target.checked })}
                  className="rounded border-slate-300 text-brand-navy focus:ring-brand-gold"
                />
                <label htmlFor="editIsPublished" className="font-semibold text-slate-700">
                  Publish step to Client Portal (Uncheck to keep hidden internally)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditStepModal(null)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-navy text-white font-bold hover:bg-brand-navy-light"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Step Modal */}
      {addStepModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-brand-navy font-serif">Add Custom Processing Step</h4>
              <button onClick={() => setAddStepModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomStep} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Step Name *</label>
                <input
                  type="text"
                  required
                  value={stepForm.stepName}
                  onChange={(e) => setStepForm({ ...stepForm, stepName: e.target.value })}
                  placeholder="e.g. Police Clearance Attestation Re-submission"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={stepForm.scheduledDate}
                    onChange={(e) => setStepForm({ ...stepForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={stepForm.deadline}
                    onChange={(e) => setStepForm({ ...stepForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Staff</label>
                <select
                  value={stepForm.assignedStaffId}
                  onChange={(e) => setStepForm({ ...stepForm, assignedStaffId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">-- No specific staff --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Client Instructions (Displayed on Client Portal)
                </label>
                <textarea
                  rows={2}
                  value={stepForm.clientInstructions}
                  onChange={(e) => setStepForm({ ...stepForm, clientInstructions: e.target.value })}
                  placeholder="Instructions displayed to applicant..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Internal Notes (Staff Only)
                </label>
                <textarea
                  rows={2}
                  value={stepForm.internalNotes}
                  onChange={(e) => setStepForm({ ...stepForm, internalNotes: e.target.value })}
                  placeholder="Private internal case remarks..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="addIsPublished"
                  checked={stepForm.isPublishedToClient}
                  onChange={(e) => setStepForm({ ...stepForm, isPublishedToClient: e.target.checked })}
                  className="rounded border-slate-300 text-brand-navy focus:ring-brand-gold"
                />
                <label htmlFor="addIsPublished" className="font-semibold text-slate-700">
                  Publish step to Client Portal
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddStepModal(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-navy text-white font-bold"
                >
                  Append Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};