successfully downloaded text file (SHA: c6e4dc52a2f4abcf44002d0848a5d0b690707330)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  getMyProfile,
  getMyApplications,
  getApplicationProgress,
  listMyDocuments,
  downloadMyDocument,
  uploadMyProfilePic,
  validateProfilePic,
  type MyDocument,
} from '../../services/client-portal';
import { ProfilePic } from '../../components/common/ProfilePic';
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
  FileQuestion,
  Camera,
  Upload,
  Download,
  Eye as EyeIcon
} from 'lucide-react';
import { StepStatus, DocumentStatus } from '@thevisagate/shared';
import { OFFICE } from '../../components/common/ContactStrip';
import { EstimateNotice } from '../../components/common/EstimateNotice';
import { NotificationBell } from '../../components/common/NotificationBell';

export const ClientPortalPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [progressDetails, setProgressDetails] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealSensitive, setRevealSensitive] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const [docActionId, setDocActionId] = useState<string | null>(null);
  const [docActionKind, setDocActionKind] = useState<'view' | 'download' | null>(null);
  const [docActionError, setDocActionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Image only (JPEG/PNG/WebP), max 5MB — validated again in the service.
    const validationError = validateProfilePic(file);
    if (validationError) {
      setError(validationError);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploadingAvatar(true);
      setError(null);
      // Uploads to Cloudinary and saves the returned URL on the client's
      // own profile. Only the signed-in client's photo is ever changed.
      const { avatarUrl } = await uploadMyProfilePic(file);
      setProfile((prev: any) => ({ ...prev, avatarUrl }));
      // Refresh the signed-in user so the portal header photo updates too.
      await refreshUser().catch(() => {});
      setAvatarSuccess('Profile photo updated successfully!');
      setTimeout(() => setAvatarSuccess(null), 4000);
    } catch (err: any) {
      setError(
        err?.message ||
          'We could not upload your profile photo. Please try again, or contact the office if the problem continues.'
      );
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fileNameForDocument = (doc: MyDocument, blob?: Blob): string => {
    const base = (doc.documentName || 'document').replace(/[^A-Za-z0-9 _-]+/g, '').trim().replace(/\s+/g, '-') || 'document';
    const extByType: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    return `${base}${blob && extByType[blob.type] ? extByType[blob.type] : ''}`;
  };

  // View or download one of the client's OWN documents. The list endpoint
  // only ever returns this client's documents, and the download endpoint
  // is authenticated, so no other client's file can be opened from here.
  const openDocumentFile = async (doc: MyDocument, kind: 'view' | 'download') => {
    setDocActionError(null);
    setDocActionId(doc.id);
    setDocActionKind(kind);
    try {
      // Prefer a server-issued per-document URL when the API returns one.
      const directUrl = doc.viewUrl || doc.downloadUrl || doc.signedUrl;
      if (directUrl) {
        if (kind === 'view') {
          window.open(directUrl, '_blank', 'noopener,noreferrer');
        } else {
          const a = document.createElement('a');
          a.href = directUrl;
          a.download = fileNameForDocument(doc);
          a.rel = 'noopener';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        return;
      }
      const blob = await downloadMyDocument(doc.id);
      const url = URL.createObjectURL(blob);
      if (kind === 'view') {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileNameForDocument(doc, blob);
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setDocActionError(
        'We could not open that document. Please try again, or contact the office — your case officer can share a copy.'
      );
    } finally {
      setDocActionId(null);
      setDocActionKind(null);
    }
  };

  const fetchClientData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const profile = await getMyProfile();
      setProfile(profile);

      const apps = await getMyApplications();
      setApplications(apps);

      if (apps.length > 0) {
        const firstApp = apps[0];
        setSelectedAppId(firstApp.id);

        const [progress, docs] = await Promise.all([
          getApplicationProgress(firstApp.id),
          listMyDocuments(firstApp.id),
        ]);
        setProgressDetails(progress);
        setDocuments(docs);
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
      const [progress, docs] = await Promise.all([
        getApplicationProgress(appId),
        listMyDocuments(appId),
      ]);
      setProgressDetails(progress);
      setDocuments(docs);
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
            <span className="text-xs font-bold">—</span>
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
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-semibold text-xs flex items-center justify-center shrink-0 border border-slate-200"
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
          <h1 className="text-lg font-bold text-brand-navy font-serif">We could not load your case</h1>
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
    <div className="space-y-8">
      {/* Inline error banner for refresh failures (profile still loaded) */}
      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
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

      {/* 1. Client Identity & Profile Card */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-8 shadow-xs">
        {avatarSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{avatarSuccess}</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
          {/* Avatar with Upload Option */}
          <div className="relative shrink-0 group">
            <ProfilePic src={profile?.avatarUrl} name={profile?.fullName} size="md" shape="square" />

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarSelect}
            />

            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload new profile photo"
              title="Upload new profile photo (JPG, PNG, WebP up to 5MB)"
              className="absolute -bottom-2 -left-2 p-1.5 rounded-full bg-brand-navy text-brand-gold hover:bg-brand-navy-light transition-all border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-brand-gold disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              {uploadingAvatar ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>

            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold border-2 border-white shadow-xs">
              Verified
            </span>
          </div>

          {/* Bio details */}
          <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-brand-navy font-serif break-words">
                  {profile?.fullName || user?.name}
                </h1>
                <p className="text-xs text-brand-gold-dark font-bold tracking-wider mt-0.5">
                  Client ID: {profile?.clientCode || '—'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRevealSensitive(!revealSensitive)}
                aria-pressed={revealSensitive}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors shrink-0 min-h-[44px]"
              >
                {revealSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{revealSensitive ? 'Hide identifiers' : 'Show identifiers'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-xs uppercase font-bold">Passport Number</span>
                <span className="text-slate-800 font-mono font-bold text-sm break-all">
                  {revealSensitive
                    ? profile?.passportMasked || '—'
                    : profile?.passportMasked?.replace(/[A-Z0-9]/g, '•') || '••••••••'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-xs uppercase font-bold">National ID (NID)</span>
                <span className="text-slate-800 font-mono font-bold text-sm break-all">
                  {revealSensitive ? profile?.nidMasked || '—' : '••••••••••••'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 block text-xs uppercase font-bold">Date of Birth</span>
                <span className="text-slate-800 font-medium text-sm">
                  {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed pt-1">
              Your identifiers are stored encrypted and shown masked. Only you and your assigned case officer can see
              this page.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Application Switcher */}
      {applications.length > 1 && (
        <nav aria-label="Your visa cases" className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Your visa cases ({applications.length})
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {applications.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => handleSelectApplication(app.id)}
                aria-current={selectedAppId === app.id ? 'true' : undefined}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 min-h-[44px] ${
                  selectedAppId === app.id
                    ? 'bg-brand-navy text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="whitespace-nowrap">
                  {app.destinationCountry} ({app.visaCategory})
                </span>
                <span className="text-xs font-mono opacity-80">{app.applicationCode}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* 3. Active Case Banner */}
      {activeApplication ? (
        <section className="bg-brand-navy text-white rounded-2xl p-5 sm:p-7 shadow-md border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="min-w-0">
                <span className="text-xs text-brand-gold uppercase tracking-widest font-bold block">
                  Active Visa Case • {activeApplication.applicationCode}
                </span>
                <h2 className="text-lg sm:text-2xl font-bold font-serif text-white break-words">
                  {progressDetails?.destinationCountry || activeApplication.destinationCountry} —{' '}
                  {progressDetails?.visaCategory || activeApplication.visaCategory}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3.5 py-1.5 rounded-full bg-brand-gold text-brand-navy font-black text-xs uppercase tracking-wider shadow-xs">
                {activeApplication.status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between items-center gap-3 text-xs font-semibold mb-1.5 text-slate-300 flex-wrap">
              <span>Overall Progress</span>
              <span className="text-brand-gold font-bold font-mono">
                {activeApplication.completedSteps} of {activeApplication.totalSteps} steps completed (
                {activeApplication.progressPercent}%)
              </span>
            </div>
            <div
              className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden"
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
        </section>
      ) : (
        <section className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-3 shadow-xs">
          <FileQuestion className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-brand-navy font-serif">No active visa case yet</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Once our team opens your file, your case, its steps and your document status will appear here. Contact the
            office if you are expecting a case to be linked to your passport number.
          </p>
          <a
            href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-brand-navy text-white text-sm font-bold hover:bg-brand-navy-light transition-colors mt-2 min-h-[48px]"
          >
            <Phone className="w-4 h-4 text-brand-gold" />
            <span>Call {OFFICE.hotline}</span>
          </a>
        </section>
      )}

      {/* 4. Next Procedure Highlight */}
      {activeApplication && (
        <section className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl border-2 border-brand-gold/40 p-5 sm:p-8 shadow-xs">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-brand-gold text-brand-navy flex items-center justify-center shrink-0 shadow-md">
              <Clock className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-brand-navy bg-brand-gold/20 px-2.5 py-0.5 rounded">
                  Next Required Procedure
                </span>
                <span className="text-xs font-bold text-brand-navy bg-white px-3 py-1 rounded-md border border-brand-gold/30 flex items-center gap-1.5 shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold-dark" />
                  <span>
                    Scheduled Date:{' '}
                    {progressDetails?.nextProcedure?.scheduledDate ? (
                      <strong className="text-brand-navy font-mono">
                        {progressDetails.nextProcedure.scheduledDate}
                      </strong>
                    ) : (
                      <span className="text-amber-700 italic font-medium">To Be Scheduled</span>
                    )}
                  </span>
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-brand-navy font-serif">
                {progressDetails?.nextProcedure?.stepName ||
                  'Your next procedure will be published here by The Visa Gate team.'}
              </h3>

              <p className="text-sm text-slate-700 leading-relaxed bg-white/70 p-4 rounded-xl border border-brand-gold/20">
                {progressDetails?.nextProcedure?.instructions ||
                  'Our processing team is currently working on your file. We will publish the appointment or submission date as soon as it is confirmed.'}
              </p>

              {progressDetails?.nextProcedure?.deadline && (
                <p className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Deadline for this step: {progressDetails.nextProcedure.deadline}</span>
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. Step Timeline */}
      {activeApplication && (
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-brand-navy font-serif">
              Application Progress Timeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The stages of your visa processing, in order. Each step is updated by your case officer.
            </p>
          </div>

          {progressDetails?.steps?.length > 0 ? (
            <ol className="space-y-5 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-slate-200">
              {progressDetails.steps.map((step: any, idx: number) => {
                const isCompleted = step.status === StepStatus.COMPLETED;
                const isInProgress = step.status === StepStatus.IN_PROGRESS;
                const isDelayed = step.status === StepStatus.DELAYED;
                const isPending = step.status === StepStatus.PENDING;
                const isSkipped = step.status === StepStatus.SKIPPED;

                return (
                  <li key={step.id || idx} className="relative flex items-start gap-3 sm:gap-4">
                    {getStepStatusIndicator(step.status)}

                    <div
                      className={`flex-1 p-4 rounded-xl border transition-all min-w-0 ${
                        isInProgress
                          ? 'bg-brand-gold/5 border-brand-gold/50 shadow-xs'
                          : isCompleted
                          ? 'bg-slate-50 border-slate-200'
                          : isDelayed
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
                        <h3 className="text-sm sm:text-base font-bold text-brand-navy">
                          {step.sortOrder}. {step.stepName}
                        </h3>
                        <span
                          className={`self-start text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
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

                      {/* Dates */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Date:{' '}
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
                        <div className="mt-2.5 p-2.5 rounded-lg bg-brand-gold/10 border border-brand-gold/25 text-xs text-brand-navy">
                          <span className="font-bold block text-xs uppercase tracking-wider text-brand-gold-dark mb-0.5">
                            What you need to do
                          </span>
                          <p className="leading-relaxed">{step.instructions}</p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Your step-by-step timeline is being prepared. It will appear here once your case officer publishes it.
            </p>
          )}

          <EstimateNotice compact />
        </section>
      )}

      {/* 6. Submitted Documents */}
      {activeApplication && (
        <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-brand-navy font-serif">
              Submitted Documents &amp; Verification Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Only the documents on your own file are listed here. Select View to open a copy, or Download to save
              it — your files are not stored in your browser.
            </p>
          </div>

          {docActionError && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{docActionError}</span>
            </div>
          )}

          {documents.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="table-scroll hidden sm:block">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <caption className="sr-only">
                    Documents you have submitted and their current verification status
                  </caption>
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-y border-slate-200">
                    <tr>
                      <th scope="col" className="py-3 px-4">
                        Document Name
                      </th>
                      <th scope="col" className="py-3 px-4">
                        Verification Status
                      </th>
                      <th scope="col" className="py-3 px-4">
                        Last Updated
                      </th>
                      <th scope="col" className="py-3 px-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <span className="flex items-center gap-2">
                            <FileCheck2 className="w-4 h-4 text-brand-navy shrink-0" />
                            <span>{doc.documentName}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">{getDocStatusBadge(doc.status)}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {doc.verifiedDate || doc.submittedDate || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDocumentFile(doc, 'view')}
                              disabled={docActionId === doc.id}
                              aria-label={`View ${doc.documentName}`}
                              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-brand-navy hover:bg-slate-50 disabled:opacity-50 min-h-[44px]"
                            >
                              <EyeIcon className="w-3.5 h-3.5" />
                              <span>{docActionId === doc.id && docActionKind === 'view' ? 'Opening…' : 'View'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openDocumentFile(doc, 'download')}
                              disabled={docActionId === doc.id}
                              aria-label={`Download ${doc.documentName}`}
                              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light disabled:opacity-50 min-h-[44px]"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>
                                {docActionId === doc.id && docActionKind === 'download' ? 'Saving…' : 'Download'}
                              </span>
                            </button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <ul className="sm:hidden space-y-2.5">
                {documents.map((doc: any) => (
                  <li
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <span className="flex items-center gap-2 font-semibold text-slate-800 text-xs">
                      <FileCheck2 className="w-4 h-4 text-brand-navy shrink-0" />
                      <span>{doc.documentName}</span>
                    </span>
                    <span className="flex items-center justify-between gap-3 flex-wrap">
                      {getDocStatusBadge(doc.status)}
                      <span className="text-xs text-slate-500 font-mono">
                        {doc.verifiedDate || doc.submittedDate || '—'}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openDocumentFile(doc, 'view')}
                        disabled={docActionId === doc.id}
                        aria-label={`View ${doc.documentName}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold text-brand-navy disabled:opacity-50 min-h-[44px]"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                        <span>{docActionId === doc.id && docActionKind === 'view' ? 'Opening…' : 'View'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDocumentFile(doc, 'download')}
                        disabled={docActionId === doc.id}
                        aria-label={`Download ${doc.documentName}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold disabled:opacity-50 min-h-[44px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {docActionId === doc.id && docActionKind === 'download' ? 'Saving…' : 'Download'}
                        </span>
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No documents have been recorded against this case yet. Your case officer will publish each document here
              as it is received.
            </p>
          )}
        </section>
      )}

      {/* 7. Contact Your Case Officer */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-brand-gold-dark" />
            <h2 className="text-lg font-bold text-brand-navy font-serif">Need to speak to us?</h2>
          </div>
          <p className="text-xs text-slate-500">Sat – Thu, 11:00 AM – 6:00 PM</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href={`tel:${OFFICE.hotline.replace(/\s/g, '')}`}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-brand-gold/60 hover:bg-brand-bg transition-colors min-h-[64px]"
          >
            <span className="w-9 h-9 rounded-lg bg-brand-bg text-brand-navy flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Call hotline</span>
              <span className="block text-sm font-bold text-brand-navy">{OFFICE.hotline}</span>
            </span>
          </a>

          <a
            href={`mailto:${OFFICE.email}`}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-brand-gold/60 hover:bg-brand-bg transition-colors min-h-[64px]"
          >
            <span className="w-9 h-9 rounded-lg bg-brand-bg text-brand-navy flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email</span>
              <span className="block text-sm font-bold text-brand-navy break-all">{OFFICE.email}</span>
            </span>
          </a>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 min-h-[64px]">
            <span className="w-9 h-9 rounded-lg bg-brand-bg text-brand-navy flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Visit office</span>
              <span className="block text-xs font-semibold text-brand-navy leading-snug">
                {OFFICE.addressLine2}
                <span className="block font-normal text-slate-500 mt-0.5">{OFFICE.landmark}</span>
              </span>
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed mt-4 flex items-start gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-brand-gold-dark shrink-0 mt-0.5" />
          <span>
            When you call, please quote your <strong className="text-brand-navy">Client ID</strong> (
            {profile?.clientCode || '—'}) so we can pull your file immediately.
          </span>
        </p>
      </section>
    </div>
  );
};
