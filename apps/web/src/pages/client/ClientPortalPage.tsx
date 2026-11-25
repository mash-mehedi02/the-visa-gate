import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Compass,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  FileQuestion
} from 'lucide-react';
import { StepStatus, DocumentStatus } from '@thevisagate/shared';
import { OFFICE } from '../../components/common/ContactStrip';
import { EstimateNotice } from '../../components/common/EstimateNotice';
import { NotificationBell } from '../../components/common/NotificationBell';

export const ClientPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [progressDetails, setProgressDetails] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealSensitive, setRevealSensitive] = useState(false);

  const fetchClientData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const profileRes: any = await api.get('/client/profile');
      if (profileRes.data) setProfile(profileRes.data);

      const appsRes: any = await api.get('/client/applications');
      const apps = appsRes.data || [];
      setApplications(apps);

      if (apps.length > 0) {
        const firstApp = apps[0];
        setSelectedAppId(firstApp.id);

        const [progRes, docsRes]: [any, any] = await Promise.all([
          api.get(`/client/applications/${firstApp.id}/progress`),
          api.get(`/client/documents?applicationId=${firstApp.id}`),
        ]);
        if (progRes.data) setProgressDetails(progRes.data);
        if (docsRes.data) setDocuments(docsRes.data);
      } else {
        setProgressDetails(null);
        setDocuments([]);
      }
    } catch (err: any) {
      setError(
        err?.message ||
          'We could not load your application data. Please try again, or contact our office if the problem continues.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const handleSelectApplication = async (appId: string) => {
    setSelectedAppId(appId);
    setLoading(true);
    setError(null);
    try {
      const [progRes, docsRes]: [any, any] = await Promise.all([
        api.get(`/client/applications/${appId}/progress`),
        api.get(`/client/documents?applicationId=${appId}`),
      ]);
      if (progRes.data) setProgressDetails(progRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
    } catch (err: any) {
      setError(
        err?.message || 'We could not load that case. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getDocStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.VERIFIED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        );
      case DocumentStatus.RECEIVED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" /> Received
          </span>
        );
      case DocumentStatus.UNDER_REVIEW:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
      case DocumentStatus.CORRECTION_REQUIRED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
            <AlertCircle className="w-3 h-3" /> Correction Required
          </span>
        );
      case DocumentStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case DocumentStatus.RESUBMITTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <Clock className="w-3 h-3" /> Resubmitted
          </span>
        );
      case DocumentStatus.EXPIRED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
            <Clock className="w-3 h-3" /> Expired
          </span>
        );
      case DocumentStatus.NOT_SUBMITTED:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
            Pending Submission
          </span>
        );
    }
  };

  const getStepStatusIndicator = (status: StepStatus) => {
    const label = status.replace('_', ' ');
    switch (status) {
      case StepStatus.COMPLETED:
        return (
          <div
            className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm"
            title="Completed"
            role="img"
            aria-label="Completed"
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case StepStatus.IN_PROGRESS:
        return (
          <div
            className="w-8 h-8 rounded-full bg-brand-gold text-brand-navy font-bold flex items-center justify-center shrink-0 ring-4 ring-brand-gold/20"
            title="In Progress"
            role="img"
            aria-label="In Progress"
          >
            <Clock className="w-4 h-4" />
          </div>
        );
      case StepStatus.PENDING:
        return (
          <div
            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm"
            title="Pending"
            role="img"
            aria-label="Pending"
          >
            <Clock className="w-4 h-4" />
          </div>
        );
      case StepStatus.DELAYED:
        return (
          <div
            className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm"
            title="Delayed"
            role="img"
            aria-label="Delayed"
          >
            <AlertCircle className="w-4 h-4" />
          </div>
        );
      case StepStatus.SKIPPED:
        return (
          <div
            className="w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0"
            title="Skipped"
            role="img"
            aria-label="Skipped"
          >
            <span className="text-[10px] font-bold">—</span>
          </div>
        );
      case StepStatus.ON_HOLD:
        return (
          <div
            className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0"
            title="On Hold"
            role="img"
            aria-label="On Hold"
          >
            <AlertCircle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-semibold text-xs flex items-center justify-center shrink-0 border border-slate-200"
            title="Not Started"
            role="img"
            aria-label="Not Started"
          >
            •
          </div>
        );
    }
  };

  /* ---------------- Loading state ---------------- */
  if (loading && !profile) {
    return (
      <div className="py-20 text-center space-y-3" role="status" aria-live="polite">
        <Compass className="w-10 h-10 text-brand-gold mx-auto animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading your visa progress…</p>
      </div>
    );
  }

  /* ---------------- Error state ---------------- */
  if (error && !profile) {
    return (
      <div className="py-12 text-center space-y-4" role="alert">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-brand-navy tracking-tight">We could not load your case</h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">{error}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => fetchClientData()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-brand-navy text-white text-sm font-bold hover:bg-brand-navy-light transition-colors min-h-[48px]"
          >
            <RefreshCw className="w-4 h-4 text-brand-gold" />
            <span>Try again</span>
          </button>
          <a
            href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 text-brand-navy text-sm font-bold hover:bg-white transition-colors min-h-[48px]"
          >
            <Phone className="w-4 h-4 text-brand-gold-dark" />
            <span>Call {OFFICE.hotline}</span>
          </a>
        </div>
      </div>
    );
  }

  const activeApplication = applications.find((a) => a.id === selectedAppId);

  return (
    <div className="space-y-4 font-sans">
      {/* Inline error banner for refresh failures (profile still loaded) */}
      {error && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <span className="grow">{error}</span>
          <button
            type="button"
            onClick={() => fetchClientData()}
            className="shrink-0 font-bold underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Application Switcher (only shown if multiple cases) */}
      {applications.length > 1 && (
        <nav aria-label="Your visa cases" className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Cases ({applications.length}):
          </span>
          {applications.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => handleSelectApplication(app.id)}
              aria-current={selectedAppId === app.id ? 'true' : undefined}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-2 min-h-[36px] ${
                selectedAppId === app.id
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="whitespace-nowrap">
                {app.destinationCountry} ({app.visaCategory})
              </span>
              <span className="text-[10px] font-mono opacity-80">{app.applicationCode}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Top Row: Profile Card (left) + Active Case & Next Procedure (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* 1. Compact Client Identity Card */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Avatar (read-only) */}
              <div className="relative shrink-0">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-14 h-14 rounded-xl object-cover border border-brand-gold/40 shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-brand-navy text-brand-gold font-bold text-xl flex items-center justify-center shadow-xs">
                    {profile?.fullName?.[0] || 'C'}
                  </div>
                )}
                <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold border-2 border-white">
                  Verified
                </span>
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-bold text-brand-navy tracking-tight truncate">
                  {profile?.fullName || user?.name}
                </h1>
                <p className="text-xs text-brand-gold-dark font-semibold tracking-wide">
                  Client ID: {profile?.clientCode || '—'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRevealSensitive(!revealSensitive)}
              aria-pressed={revealSensitive}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shrink-0 min-h-[36px]"
            >
              {revealSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{revealSensitive ? 'Hide IDs' : 'Show IDs'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-100 min-w-0">
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Passport</span>
              <span className="text-slate-800 font-mono font-bold text-xs truncate block mt-0.5">
                {revealSensitive
                  ? profile?.passportMasked || user?.identifier
                  : profile?.passportMasked?.replace(/[A-Z0-9]/g, '•') || '••••••••'}
              </span>
            </div>

            <div className="bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-100 min-w-0">
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">National ID</span>
              <span className="text-slate-800 font-mono font-bold text-xs truncate block mt-0.5">
                {revealSensitive ? profile?.nidMasked || '—' : '••••••••••'}
              </span>
            </div>

            <div className="bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-100 min-w-0">
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Date of Birth</span>
              <span className="text-slate-800 font-semibold text-xs truncate block mt-0.5">
                {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-snug">
            Encrypted &amp; masked for your privacy. Only you and your assigned case officer can view this page.
          </p>
        </section>

        {/* 2. Active Case Banner + Next Procedure Highlight */}
        {activeApplication ? (
          <section className="lg:col-span-7 flex flex-col gap-3">
            {/* Active Case Summary */}
            <div className="bg-brand-navy text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-white/10 space-y-3">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] text-brand-gold uppercase tracking-widest font-bold block">
                    Active Visa Case • {activeApplication.applicationCode}
                  </span>
                  <h2 className="text-base sm:text-xl font-bold tracking-tight text-white break-words mt-0.5">
                    {progressDetails?.destinationCountry || activeApplication.destinationCountry} —{' '}
                    {progressDetails?.visaCategory || activeApplication.visaCategory}
                  </h2>
                </div>

                <span className="px-3 py-1 rounded-full bg-brand-gold text-brand-navy font-extrabold text-[11px] uppercase tracking-wider shrink-0">
                  {activeApplication.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center gap-3 text-xs font-medium mb-1 text-slate-300">
                  <span>Overall Progress</span>
                  <span className="text-brand-gold font-bold font-mono">
                    {activeApplication.completedSteps}/{activeApplication.totalSteps} steps ({activeApplication.progressPercent}%)
                  </span>
                </div>
                <div
                  className="w-full h-2 bg-white/10 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={activeApplication.progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Overall application progress"
                >
                  <div
                    className="h-full bg-gradient-to-r from-brand-gold to-brand-gold-light rounded-full transition-all duration-500"
                    style={{ width: `${activeApplication.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Next Required Procedure (Compact Strip) */}
            <div className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl border border-brand-gold/40 p-4 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-gold text-brand-navy flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Clock className="w-4 h-4 stroke-[2.5]" />
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-navy bg-brand-gold/25 px-2 py-0.5 rounded">
                    Next Required Procedure
                  </span>
                  <span className="text-[11px] font-semibold text-brand-navy bg-white px-2.5 py-0.5 rounded-md border border-brand-gold/30 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-brand-gold-dark" />
                    <span>
                      {progressDetails?.nextProcedure?.scheduledDate ? (
                        <strong className="font-mono">{progressDetails.nextProcedure.scheduledDate}</strong>
                      ) : (
                        <span className="text-amber-700 italic">To Be Scheduled</span>
                      )}
                    </span>
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-brand-navy tracking-tight">
                  {progressDetails?.nextProcedure?.stepName ||
                    'Your next procedure will be published here by The Visa Gate team.'}
                </h3>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {progressDetails?.nextProcedure?.instructions ||
                    'Our processing team is currently working on your file. We will publish the appointment or submission date as soon as it is confirmed.'}
                </p>

                {progressDetails?.nextProcedure?.deadline && (
                  <p className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Deadline: {progressDetails.nextProcedure.deadline}</span>
                  </p>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 text-center flex flex-col items-center justify-center space-y-2.5 shadow-xs">
            <FileQuestion className="w-9 h-9 text-slate-300" />
            <h2 className="text-base font-bold text-brand-navy tracking-tight">No active visa case yet</h2>
            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              Once our team opens your file, your case, steps and document status will appear here.
            </p>
            <a
              href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-gold" />
              <span>Call {OFFICE.hotline}</span>
            </a>
          </section>
        )}
      </div>

      {/* Main Content Row: Step Timeline (left 7 cols) + Documents & Contact (right 5 cols) */}
      {activeApplication && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* 3. Compact Step Timeline */}
          <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-brand-navy tracking-tight">
                  Application Progress Timeline
                </h2>
                <p className="text-[11px] text-slate-500">
                  Stages of your visa processing, updated by your case officer.
                </p>
              </div>
            </div>

            {progressDetails?.steps?.length > 0 ? (
              <ol className="space-y-2.5 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-slate-200">
                {progressDetails.steps.map((step: any, idx: number) => {
                  const isCompleted = step.status === StepStatus.COMPLETED;
                  const isInProgress = step.status === StepStatus.IN_PROGRESS;
                  const isDelayed = step.status === StepStatus.DELAYED;
                  const isPending = step.status === StepStatus.PENDING;
                  const isSkipped = step.status === StepStatus.SKIPPED;

                  return (
                    <li key={step.id || idx} className="relative flex items-start gap-3">
                      {getStepStatusIndicator(step.status)}

                      <div
                        className={`flex-1 px-3.5 py-2.5 rounded-xl border transition-all min-w-0 ${
                          isInProgress
                            ? 'bg-brand-gold/5 border-brand-gold/50 shadow-xs'
                            : isCompleted
                            ? 'bg-slate-50/80 border-slate-200'
                            : isDelayed
                            ? 'bg-rose-50/50 border-rose-200'
                            : 'bg-white border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-brand-navy tracking-tight truncate">
                            {step.sortOrder}. {step.stepName}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isInProgress
                                ? 'bg-brand-gold text-brand-navy'
                                : isDelayed
                                ? 'bg-rose-100 text-rose-800'
                                : isPending
                                ? 'bg-blue-100 text-blue-800'
                                : isSkipped
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {step.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                              {step.completedDate ? (
                                <strong className="text-emerald-700">Completed ({step.completedDate})</strong>
                              ) : step.scheduledDate ? (
                                <strong className="text-brand-navy">{step.scheduledDate}</strong>
                              ) : (
                                <span className="text-amber-800 italic font-sans font-medium">To Be Scheduled</span>
                              )}
                            </span>
                          </span>
                          {step.deadline && (
                            <span className="text-rose-600 font-semibold">• Deadline: {step.deadline}</span>
                          )}
                        </div>

                        {step.instructions && (
                          <p className="mt-1.5 text-[11px] text-brand-navy/90 bg-brand-gold/10 border border-brand-gold/25 rounded-lg px-2.5 py-1.5 leading-snug">
                            <strong className="text-brand-gold-dark uppercase text-[9px] tracking-wider mr-1.5">Action:</strong>
                            {step.instructions}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Your step-by-step timeline is being prepared.
              </p>
            )}

            <EstimateNotice compact />
          </section>

          {/* Right Column: Submitted Documents + Compact Case Officer Contact */}
          <div className="lg:col-span-5 space-y-4">
            {/* 4. Submitted Documents */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-brand-navy tracking-tight">
                  Submitted Documents
                </h2>
                <p className="text-[11px] text-slate-500">
                  Verification status of your submitted papers (read-only).
                </p>
              </div>

              {documents.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {documents.map((doc: any) => (
                    <li
                      key={doc.id}
                      className="py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck2 className="w-4 h-4 text-brand-navy shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{doc.documentName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {doc.verifiedDate || doc.submittedDate || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">{getDocStatusBadge(doc.status)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 text-center py-5 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No documents recorded against this case yet.
                </p>
              )}
            </section>

            {/* 5. Compact Case Officer Contact */}
            <section className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-gold-dark" />
                  <h2 className="text-sm font-bold text-brand-navy tracking-tight">Need to speak to us?</h2>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Sat–Thu, 11 AM–6 PM</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-brand-gold/60 hover:bg-brand-bg transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-brand-bg text-brand-navy flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Hotline</span>
                    <span className="block text-xs font-bold text-brand-navy truncate">{OFFICE.hotline}</span>
                  </span>
                </a>

                <a
                  href={`mailto:${OFFICE.email}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-brand-gold/60 hover:bg-brand-bg transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-brand-bg text-brand-navy flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Email</span>
                    <span className="block text-xs font-bold text-brand-navy truncate">{OFFICE.email}</span>
                  </span>
                </a>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs">
                <MapPin className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-semibold text-brand-navy block leading-snug">{OFFICE.addressLine2}</span>
                  <span className="text-[11px] text-slate-500">{OFFICE.landmark}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-snug flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-brand-gold-dark shrink-0" />
                <span>
                  Quote your <strong className="text-brand-navy">Client ID ({profile?.clientCode || '—'})</strong> when calling.
                </span>
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
