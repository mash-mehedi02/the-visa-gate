import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import {
  Workflow,
  Plus,
  CheckCircle2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Edit2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

const STEP_DEFAULTS = [
  {
    stepName: 'Client Registration & Document Intake',
    sortOrder: 1,
    estimatedDays: 3,
    clientInstructions:
      'File registered with The Visa Gate. Please submit all required original documents.',
  },
  {
    stepName: 'Document Verification & Authentication',
    sortOrder: 2,
    estimatedDays: 7,
    clientInstructions: 'Verification of original civil documents and notarization.',
  },
  {
    stepName: 'Medical Screening & Fitness Certificate',
    sortOrder: 3,
    estimatedDays: 5,
    clientInstructions: 'Attend scheduled diagnostic checkup at designated medical centre.',
  },
  {
    stepName: 'Government / Embassy Submission',
    sortOrder: 4,
    estimatedDays: 30,
    clientInstructions: 'Application file transmitted to the relevant government or embassy desk.',
  },
  {
    stepName: 'Approval / Calling Visa Issued',
    sortOrder: 5,
    estimatedDays: 5,
    clientInstructions: 'Official approval issued by immigration authorities.',
  },
  {
    stepName: 'Visa Stamping & Travel Preparation',
    sortOrder: 6,
    estimatedDays: 10,
    clientInstructions: 'Passport submitted to High Commission for visa stamping.',
  },
];

type TemplateStep = {
  stepName: string;
  description: string;
  sortOrder: number;
  estimatedDays: number;
  clientInstructions: string;
};

type FormState = {
  name: string;
  description: string;
  countryId: string;
  steps: TemplateStep[];
};

const DAYS_PER_MONTH = 30;

/** Fallback total so the UI always matches the sum of the listed step durations. */
const totalDaysOf = (t: any): number =>
  typeof t?.totalDays === 'number'
    ? t.totalDays
    : (t?.steps || []).reduce((sum: number, s: any) => sum + (Number(s.estimatedDays) || 0), 0);

const formatDuration = (days: number): string => {
  const safeDays = Number.isFinite(days) ? days : 0;
  const months = safeDays / DAYS_PER_MONTH;
  const monthsLabel = Number.isInteger(months) ? String(months) : months.toFixed(1);
  return `${safeDays} ${safeDays === 1 ? 'day' : 'days'} · ~${monthsLabel} ${
    monthsLabel === '1' ? 'month' : 'months'
  }`;
};

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  countryId: '',
  steps: STEP_DEFAULTS.map((s) => ({ ...s, description: '' })),
};

/** Normalised key used to detect a possible duplicate template for the same destination. */
const normalizeName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const WorkflowsAdminPage: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const [tmplRes, cntRes]: [any, any] = await Promise.all([
        api.get('/workflows/templates'),
        api.get('/countries'),
      ]);
      if (tmplRes.data) setTemplates(tmplRes.data);
      if (cntRes.data) setCountries(cntRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openCreate = () => {
    setEditingTemplate(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (t: any) => {
    setEditingTemplate(t);
    setForm({
      name: t.name,
      description: t.description || '',
      countryId: t.countryId || '',
      steps: (t.steps || []).map((s: any, idx: number) => ({
        stepName: s.stepName,
        description: s.description || '',
        sortOrder: s.sortOrder || idx + 1,
        estimatedDays: s.estimatedDays || 7,
        clientInstructions: s.clientInstructions || '',
      })),
    });
    setFormError(null);
    setModalOpen(true);
  };

  /**
   * A duplicate check guards against creating two templates for the same
   * destination, which would leave case officers choosing between duplicates.
   */
  const duplicateWarning = useMemo(() => {
    if (!form.name.trim()) return null;
    const key = normalizeName(form.name);
    const match = templates.find(
      (t) =>
        t.id !== editingTemplate?.id &&
        normalizeName(t.name) === key &&
        (t.countryId || '') === (form.countryId || '')
    );
    if (!match) return null;
    return (
      `A template named "${match.name}" already exists for this destination ` +
      `(${match.totalSteps || match.steps?.length || 0} steps, ${formatDuration(
        totalDaysOf(match)
      )}). Edit that template instead of creating a second one for the same route.`
    );
  }, [form.name, form.countryId, templates, editingTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError('Give the template a name so case officers can identify it.');
      return;
    }
    if (form.steps.some((s) => !s.stepName.trim())) {
      setFormError('Every step needs a name before the template can be saved.');
      return;
    }
    if (duplicateWarning && !editingTemplate) {
      setFormError(duplicateWarning);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        countryId: form.countryId || null,
        steps: form.steps.map((s, idx) => ({ ...s, sortOrder: idx + 1 })),
      };
      if (editingTemplate) {
        await api.put(`/workflows/templates/${editingTemplate.id}`, payload);
        setNotice('Template updated.');
      } else {
        await api.post('/workflows/templates', payload);
        setNotice('Template created.');
      }
      setModalOpen(false);
      fetchTemplates();
    } catch (err: any) {
      setFormError(err.message || 'We could not save this template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (t: any) => {
    try {
      await api.put(`/workflows/templates/${t.id}`, { isActive: !t.isActive });
      fetchTemplates();
    } catch (err: any) {
      setNotice(err.message || 'We could not change the template status.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/workflows/templates/${id}`);
      setDeleteConfirm(null);
      setNotice('Template deleted. Existing client cases keep the steps they already have.');
      fetchTemplates();
    } catch (err: any) {
      setNotice(err.message || 'We could not delete this template.');
    }
  };

  // Step management in form
  const updateStep = (idx: number, field: keyof TemplateStep, value: string | number) => {
    setForm((prev) => {
      const steps = [...prev.steps];
      steps[idx] = { ...steps[idx], [field]: value };
      return { ...prev, steps };
    });
  };

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          stepName: '',
          description: '',
          sortOrder: prev.steps.length + 1,
          estimatedDays: 7,
          clientInstructions: '',
        },
      ],
    }));
  };

  const removeStep = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx),
    }));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    setForm((prev) => {
      const steps = [...prev.steps];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= steps.length) return prev;
      [steps[idx], steps[newIdx]] = [steps[newIdx], steps[idx]];
      return { ...prev, steps };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
        <div className="animate-spin w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full" />
        <span className="sr-only">Loading workflow templates</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy font-serif">Workflow Templates Library</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard procedural templates automatically deployed when opening case files.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-navy text-white font-bold text-xs hover:bg-brand-navy-light shadow-xs min-h-[44px]"
        >
          <Plus className="w-4 h-4 text-brand-gold stroke-[2.5]" />
          <span>New Workflow Template</span>
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5"
        >
          <Info className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Templates', value: templates.length },
          { label: 'Active', value: templates.filter((t) => t.isActive !== false).length },
          {
            label: 'Total Steps',
            value: templates.reduce((s, t) => s + (t.totalSteps || t.steps?.length || 0), 0),
          },
          { label: 'Country-Specific', value: templates.filter((t) => t.countryId).length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200/80 p-4 text-center shadow-xs"
          >
            <p className="text-2xl font-bold text-brand-navy">{stat.value}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((t) => (
          <div
            key={t.id}
            className={`bg-white rounded-xl border shadow-xs space-y-4 overflow-hidden ${
              t.isActive === false ? 'border-slate-200/50 opacity-60' : 'border-slate-200/80'
            }`}
          >
            {/* Card Header */}
            <div className="p-5 pb-0">
              <div className="flex items-start justify-between mb-1 gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark font-mono">
                    {t.countryName || 'Global'}{' '}
                    {t.visaCategoryName ? `• ${t.visaCategoryName}` : ''}
                  </span>
                  <h3 className="text-base font-bold text-brand-navy mt-0.5 leading-tight">{t.name}</h3>
                </div>
                <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                      t.isActive === false
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {t.isActive === false ? 'Inactive' : 'Active'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-xs text-slate-700">
                    {t.totalSteps || t.steps?.length || 0} Steps
                  </span>
                </div>
              </div>

              {t.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-3">{t.description}</p>
              )}

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-brand-navy/5 border border-brand-navy/15 text-brand-navy font-bold text-xs">
                  Estimated: {formatDuration(totalDaysOf(t))}
                </span>
                <span className="text-xs text-slate-400">
                  Sum of all {t.totalSteps || t.steps?.length || 0} step durations
                </span>
              </div>
            </div>

            {/* Steps List */}
            <div className="px-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Sequential Steps:
              </span>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {(t.steps || []).map((s: any, idx: number) => (
                  <div
                    key={s.id || idx}
                    className="p-2 rounded bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-brand-navy text-brand-gold text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {s.sortOrder || idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 break-words">{s.stepName}</p>
                        {s.description && (
                          <p className="text-xs text-slate-500 leading-tight line-clamp-2 mt-0.5">
                            {s.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">~{s.estimatedDays || 7}d</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-4 pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => openEdit(t)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-brand-navy text-brand-navy font-bold text-xs hover:bg-brand-navy/5 min-h-[44px]"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleToggleActive(t)}
                title={t.isActive === false ? 'Activate template' : 'Deactivate template'}
                aria-label={t.isActive === false ? `Activate ${t.name}` : `Deactivate ${t.name}`}
                className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              >
                {t.isActive === false ? (
                  <ToggleLeft className="w-4 h-4" />
                ) : (
                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(t)}
                title="Delete template"
                aria-label={`Delete ${t.name}`}
                className="p-2 rounded-lg border border-rose-200 text-rose-400 hover:text-rose-600 hover:border-rose-300 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Workflow className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">No workflow templates found.</p>
            <p className="text-xs mt-1">Create your first template to get started.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete workflow template?"
        description={
          deleteConfirm
            ? `"${deleteConfirm.name}" will be removed from the template library.`
            : undefined
        }
        maxWidth="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2.5 rounded-lg border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-50 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDelete(deleteConfirm.id)}
              className="px-4 py-2.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 min-h-[44px]"
            >
              Delete Template
            </button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          This template will be permanently removed from the library. Active applications using this template keep the
          steps they already have — their timelines are not changed.
        </p>
      </Modal>

      {/* Create / Edit Template Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTemplate ? 'Edit workflow template' : 'Create workflow template'}
        description="Templates define the sequence and planned duration of a new case file."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          {formError && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs leading-relaxed"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="wf-name" className="field-label">
                Template name *
              </label>
              <input
                id="wf-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Cyprus Employment Visa Standard"
                className="field-input"
              />
            </div>

            <div>
              <label htmlFor="wf-country" className="field-label">
                Destination country
              </label>
              <select
                id="wf-country"
                value={form.countryId}
                onChange={(e) => setForm({ ...form, countryId: e.target.value })}
                className="field-input"
              >
                <option value="">-- Global / General --</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="wf-desc" className="field-label">
                Description
              </label>
              <input
                id="wf-desc"
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description of this workflow"
                className="field-input"
              />
            </div>
          </div>

          {/* Duplicate warning */}
          {duplicateWarning && editingTemplate && (
            <div
              role="status"
              className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-start gap-2.5 text-xs leading-relaxed"
            >
              <Info className="w-4 h-4 text-brand-gold-dark shrink-0 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Steps Editor */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="field-label mb-0">Processing steps ({form.steps.length})</span>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-brand-navy text-brand-navy font-bold text-xs hover:bg-brand-navy/5 min-h-[40px]"
              >
                <Plus className="w-3 h-3" /> Add Step
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {form.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-navy text-brand-gold text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      aria-label={`Step ${idx + 1} name`}
                      value={step.stepName}
                      onChange={(e) => updateStep(idx, 'stepName', e.target.value)}
                      placeholder="Step name *"
                      className="flex-1 min-w-0 px-2.5 py-2 rounded border border-slate-300 text-xs focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/40 font-semibold"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min={1}
                        max={365}
                        aria-label={`Step ${idx + 1} estimated days`}
                        value={step.estimatedDays}
                        onChange={(e) => updateStep(idx, 'estimatedDays', parseInt(e.target.value) || 7)}
                        title="Estimated days for this step"
                        className="w-14 px-2 py-2 rounded border border-slate-300 text-xs text-center focus:border-brand-gold focus:outline-none"
                      />
                      <span className="text-xs text-slate-400">days</span>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveStep(idx, -1)}
                        disabled={idx === 0}
                        aria-label={`Move step ${idx + 1} up`}
                        className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 min-h-[36px] min-w-[32px] flex items-center justify-center"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(idx, 1)}
                        disabled={idx === form.steps.length - 1}
                        aria-label={`Move step ${idx + 1} down`}
                        className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 min-h-[36px] min-w-[32px] flex items-center justify-center"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        aria-label={`Remove step ${idx + 1}`}
                        className="p-1.5 text-rose-400 hover:text-rose-600 ml-0.5 min-h-[36px] min-w-[32px] flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    aria-label={`Step ${idx + 1} description`}
                    value={step.description}
                    onChange={(e) => updateStep(idx, 'description', e.target.value)}
                    placeholder="Short client-friendly description of this step"
                    className="w-full px-2.5 py-2 rounded border border-slate-200 text-xs text-slate-600 focus:border-brand-gold focus:outline-none"
                  />
                  <input
                    type="text"
                    aria-label={`Step ${idx + 1} client instructions`}
                    value={step.clientInstructions}
                    onChange={(e) => updateStep(idx, 'clientInstructions', e.target.value)}
                    placeholder="Client instructions for this step (shown in client portal)"
                    className="w-full px-2.5 py-2 rounded border border-slate-200 text-xs text-slate-600 focus:border-brand-gold focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {form.steps.length === 0 && (
              <p className="text-center text-slate-400 py-4 text-xs italic">
                No steps added. Use &quot;Add Step&quot; above.
              </p>
            )}

            {form.steps.length > 0 && (
              <div className="mt-2 flex items-center justify-between gap-3 flex-wrap px-3 py-2 rounded-lg bg-brand-navy/5 border border-brand-navy/15">
                <span className="font-bold text-brand-navy text-xs">Total estimated duration</span>
                <span className="font-bold text-brand-navy text-xs">
                  {formatDuration(
                    form.steps.reduce((sum, s) => sum + (Number(s.estimatedDays) || 0), 0)
                  )}
                </span>
              </div>
            )}

            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              These durations are internal planning estimates for the steps we handle. They are not guaranteed
              processing times — the destination authority sets the actual timeline.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-lg border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-50 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-brand-navy text-white font-bold text-xs disabled:opacity-60 inline-flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              {saving ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-gold" />
              )}
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
