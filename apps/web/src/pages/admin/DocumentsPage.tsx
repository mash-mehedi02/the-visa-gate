import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  FileCheck2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Filter,
  Plus,
  X,
  FileText,
  Trash2,
  RefreshCw,
  Link2,
  Eye,
  ShieldCheck,
  Search,
  Check,
  Copy,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { DocumentStatus } from '@thevisagate/shared';

export const DocumentsPage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Upload modal state
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAppId, setUploadAppId] = useState('');
  const [uploadDocTypeId, setUploadDocTypeId] = useState('');
  const [uploadStatus, setUploadStatus] = useState<DocumentStatus>(DocumentStatus.RECEIVED);
  const [uploadInternalNotes, setUploadInternalNotes] = useState('');
  const [uploadVerificationNotes, setUploadVerificationNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  // Status edit modal
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [editStatus, setEditStatus] = useState<DocumentStatus>(DocumentStatus.VERIFIED);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Replace file modal
  const [replaceDoc, setReplaceDoc] = useState<any>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replaceNotes, setReplaceNotes] = useState('');
  const [replacing, setReplacing] = useState(false);

  // Signed access link modal
  const [signedLinkModal, setSignedLinkModal] = useState<{ doc: any; url: string; expiresAt: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Delete modal
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [appsRes, typesRes, clientsRes]: [any, any, any] = await Promise.all([
        api.get('/applications'),
        api.get('/documents/types'),
        api.get('/clients?limit=100').catch(() => ({ data: { clients: [] } })),
      ]);

      if (appsRes.data && appsRes.data.length > 0) {
        setApplications(appsRes.data);
        setSelectedAppId(appsRes.data[0].id);
        setUploadAppId(appsRes.data[0].id);
        const docsRes: any = await api.get(`/documents/application/${appsRes.data[0].id}`);
        if (docsRes.data) setDocuments(docsRes.data);
      }
      if (typesRes.data) setDocTypes(typesRes.data);
      if (clientsRes.data?.clients) setClients(clientsRes.data.clients);
    } catch (err) {
      console.error('Failed to load initial document vault data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const handleSelectApp = async (appId: string) => {
    setSelectedAppId(appId);
    setUploadAppId(appId);
    try {
      setLoading(true);
      const res: any = await api.get(`/documents/application/${appId}`);
      if (res.data) setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadDocTypeId || !uploadAppId) {
      alert('Please select a file, application case, and document category.');
      return;
    }

    setUploading(true);
    try {
      const selectedType = docTypes.find((t) => t.id === uploadDocTypeId);
      const currentApp = applications.find((a) => a.id === uploadAppId);

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('applicationId', uploadAppId);
      formData.append('clientId', currentApp?.clientId || '');
      formData.append('documentTypeId', uploadDocTypeId);
      formData.append('documentTypeName', selectedType?.name || 'Document');
      formData.append('status', uploadStatus);
      if (uploadInternalNotes) formData.append('internalNotes', uploadInternalNotes);
      if (uploadVerificationNotes) formData.append('verificationNotes', uploadVerificationNotes);

      await api.post('/documents/upload', formData);

      setUploadModal(false);
      setUploadFile(null);
      setUploadDocTypeId('');
      setUploadInternalNotes('');
      setUploadVerificationNotes('');
      setUploadStatus(DocumentStatus.RECEIVED);
      handleSelectApp(uploadAppId);
    } catch (err: any) {
      alert(err.message || 'Upload failed due to security or validation restriction.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    setSavingStatus(true);
    try {
      await api.patch(`/documents/${editingDoc.id}/status`, {
        status: editStatus,
        verificationNotes,
        internalNotes,
      });
      setEditingDoc(null);
      handleSelectApp(selectedAppId);
    } catch (err: any) {
      alert(err.message || 'Failed to update verification status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleQuickStatus = async (doc: any, newStatus: DocumentStatus, defaultNote = '') => {
    try {
      await api.patch(`/documents/${doc.id}/status`, {
        status: newStatus,
        verificationNotes: defaultNote || doc.verificationNotes,
      });
      handleSelectApp(selectedAppId);
    } catch (err: any) {
      alert(err.message || 'Failed to apply status change');
    }
  };

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceDoc || !replacementFile) return;

    setReplacing(true);
    try {
      const formData = new FormData();
      formData.append('file', replacementFile);
      if (replaceNotes) formData.append('internalNotes', replaceNotes);

      await api.post(`/documents/${replaceDoc.id}/replace`, formData);

      setReplaceDoc(null);
      setReplacementFile(null);
      setReplaceNotes('');
      handleSelectApp(selectedAppId);
    } catch (err: any) {
      alert(err.message || 'Replacement failed');
    } finally {
      setReplacing(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await api.delete(`/documents/${docId}`);
      setDeletingDocId(null);
      handleSelectApp(selectedAppId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

  const handleGenerateSignedLink = async (doc: any) => {
    try {
      const res: any = await api.get(`/documents/${doc.id}/signed-url`);
      if (res.data) {
        const fullUrl = `${window.location.origin}${res.data.signedUrl}`;
        setSignedLinkModal({
          doc,
          url: fullUrl,
          expiresAt: res.data.expiresAt,
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate signed download link');
    }
  };

  const handleDirectDownload = async (doc: any) => {
    try {
      // Direct stream download using browser window or blob trigger
      window.open(`/api/v1/documents/${doc.id}/download`, '_blank');
    } catch (err: any) {
      alert(err.message || 'Download stream failed');
    }
  };

  const getDocStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.VERIFIED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3" /> Verified</span>;
      case DocumentStatus.RECEIVED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800"><Clock className="w-3 h-3" /> Received</span>;
      case DocumentStatus.UNDER_REVIEW:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><Clock className="w-3 h-3" /> Under Review</span>;
      case DocumentStatus.CORRECTION_REQUIRED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3" /> Correction Req.</span>;
      case DocumentStatus.REJECTED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800"><AlertCircle className="w-3 h-3" /> Rejected</span>;
      case DocumentStatus.RESUBMITTED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800"><RefreshCw className="w-3 h-3" /> Resubmitted</span>;
      case DocumentStatus.EXPIRED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700"><Clock className="w-3 h-3" /> Expired</span>;
      case DocumentStatus.NOT_SUBMITTED:
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">Not Submitted</span>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const currentApp = applications.find((a) => a.id === selectedAppId);

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.documentTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Vault Stats
  const totalCount = documents.length;
  const verifiedCount = documents.filter((d) => d.status === DocumentStatus.VERIFIED).length;
  const reviewCount = documents.filter((d) => d.status === DocumentStatus.UNDER_REVIEW).length;
  const correctionCount = documents.filter((d) => d.status === DocumentStatus.CORRECTION_REQUIRED).length;
  const rejectedCount = documents.filter((d) => d.status === DocumentStatus.REJECTED).length;

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy font-serif">Document Vault & Verification</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin/Staff private document storage, compliance verification, and short-lived signed access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setUploadAppId(selectedAppId);
              setUploadModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-navy text-white font-bold text-xs hover:bg-brand-navy-light transition-all shadow-xs"
          >
            <Upload className="w-4 h-4 text-brand-gold stroke-[2.5]" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total in Case</p>
          <p className="text-xl font-bold text-brand-navy mt-1">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200/80 p-3.5 shadow-xs bg-emerald-50/20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Verified</p>
          <p className="text-xl font-bold text-emerald-800 mt-1">{verifiedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200/80 p-3.5 shadow-xs bg-amber-50/20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Under Review</p>
          <p className="text-xl font-bold text-amber-800 mt-1">{reviewCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-200/80 p-3.5 shadow-xs bg-orange-50/20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700">Correction Req.</p>
          <p className="text-xl font-bold text-orange-800 mt-1">{correctionCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-rose-200/80 p-3.5 shadow-xs bg-rose-50/20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Rejected</p>
          <p className="text-xl font-bold text-rose-800 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Case File Selector & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-700 flex-shrink-0">Application Case:</span>
            <select
              value={selectedAppId}
              onChange={(e) => handleSelectApp(e.target.value)}
              className="w-full sm:max-w-md px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-gold bg-slate-50"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.applicationCode} • {app.clientName} ({app.countryName})
                </option>
              ))}
            </select>
          </div>

          {currentApp && (
            <div className="text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 flex items-center gap-2">
              <span>Client:</span>
              <strong className="text-brand-navy">{currentApp.clientName}</strong>
              <span className="text-slate-400 font-mono text-[11px]">({currentApp.clientCode})</span>
              <span className="text-slate-300">|</span>
              <span>Country: <strong className="text-slate-800">{currentApp.countryName}</strong></span>
            </div>
          )}
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by file or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-brand-navy"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Status:</span>
            {['ALL', DocumentStatus.VERIFIED, DocumentStatus.UNDER_REVIEW, DocumentStatus.RECEIVED, DocumentStatus.CORRECTION_REQUIRED, DocumentStatus.REJECTED].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-brand-navy text-brand-gold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="table-scroll">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Document Category</th>
                <th className="py-3 px-4">File Details</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Compliance / Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="animate-spin w-6 h-6 border-2 border-brand-navy border-t-transparent rounded-full mx-auto mb-2" />
                    Loading vault documents...
                  </td>
                </tr>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Category */}
                    <td className="py-3.5 px-4 font-bold text-brand-navy">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-navy/5 text-brand-navy flex items-center justify-center flex-shrink-0">
                          <FileCheck2 className="w-4 h-4 text-brand-gold-dark" />
                        </div>
                        <div>
                          <span>{doc.documentTypeName}</span>
                          {doc.replacedAt && (
                            <span className="block text-[10px] text-purple-600 font-semibold font-mono">
                              Replaced on {new Date(doc.replacedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* File info */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] text-slate-700 font-semibold block truncate max-w-xs">
                          {doc.originalName}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span>{doc.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                          <span>•</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {getDocStatusBadge(doc.status)}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {doc.verificationNotes && (
                        <div className="text-slate-600 truncate text-[11px]">
                          <strong className="text-slate-700">Remarks:</strong> {doc.verificationNotes}
                        </div>
                      )}
                      {doc.internalNotes && (
                        <div className="text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 mt-0.5 inline-block text-[10px] font-medium border border-amber-200/50">
                          <strong>Staff Note:</strong> {doc.internalNotes}
                        </div>
                      )}
                      {!doc.verificationNotes && !doc.internalNotes && (
                        <span className="text-slate-400 italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* Direct Download Stream */}
                        <button
                          onClick={() => handleDirectDownload(doc)}
                          title="Download Decrypted File"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-navy hover:bg-slate-100"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Short-Lived Signed Access Link */}
                        <button
                          onClick={() => handleGenerateSignedLink(doc)}
                          title="Generate Short-Lived Signed Link (15m)"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-gold-dark hover:bg-amber-50"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Replace Document */}
                        <button
                          onClick={() => {
                            setReplaceDoc(doc);
                            setReplacementFile(null);
                            setReplaceNotes('');
                          }}
                          title="Replace Document File"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-purple-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Update Status Modal */}
                        <button
                          onClick={() => {
                            setEditingDoc(doc);
                            setEditStatus(doc.status);
                            setVerificationNotes(doc.verificationNotes || '');
                            setInternalNotes(doc.internalNotes || '');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-brand-navy text-white text-[11px] font-bold hover:bg-brand-navy-light"
                        >
                          Verify
                        </button>

                        {/* Delete Document */}
                        <button
                          onClick={() => setDeletingDocId(doc.id)}
                          title="Delete from Vault"
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No documents matching the criteria found in this case vault.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* UPLOAD DOCUMENT MODAL                                         */}
      {/* ============================================================ */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-navy font-serif">Upload Document to Vault</h3>
                <p className="text-[11px] text-slate-500">Stored in encrypted private storage with security scan.</p>
              </div>
              <button onClick={() => setUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* Select Application Case */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Application Case *</label>
                <select
                  required
                  value={uploadAppId}
                  onChange={(e) => setUploadAppId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 font-semibold focus:border-brand-navy"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.applicationCode} • {app.clientName} ({app.countryName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Category (10 exact categories) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Category *</label>
                <select
                  required
                  value={uploadDocTypeId}
                  onChange={(e) => setUploadDocTypeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 font-semibold focus:border-brand-navy"
                >
                  <option value="">-- Select Category --</option>
                  {docTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.isRequired ? '• (Mandatory)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Initial Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Verification Status</label>
                <select
                  value={uploadStatus}
                  onChange={(e) => setUploadStatus(e.target.value as DocumentStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 font-semibold focus:border-brand-navy"
                >
                  <option value={DocumentStatus.RECEIVED}>RECEIVED</option>
                  <option value={DocumentStatus.UNDER_REVIEW}>UNDER REVIEW</option>
                  <option value={DocumentStatus.VERIFIED}>VERIFIED</option>
                  <option value={DocumentStatus.CORRECTION_REQUIRED}>CORRECTION REQUIRED</option>
                </select>
              </div>

              {/* File Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select File * (PDF, JPG, PNG, DOCX • Max 15MB)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-navy file:text-white hover:file:bg-brand-navy-light cursor-pointer"
                />
              </div>

              {/* Verification Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Compliance / Verification Notes</label>
                <input
                  type="text"
                  value={uploadVerificationNotes}
                  onChange={(e) => setUploadVerificationNotes(e.target.value)}
                  placeholder="e.g. Scanned copy verified against passport authority."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-brand-navy"
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Staff Notes (Private)</label>
                <input
                  type="text"
                  value={uploadInternalNotes}
                  onChange={(e) => setUploadInternalNotes(e.target.value)}
                  placeholder="Internal notes visible strictly to staff and administrators"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-brand-navy"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadModal(false)}
                  className="px-3 py-1.5 rounded-lg border font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 rounded-lg bg-brand-navy text-white font-bold hover:bg-brand-navy-light disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Scanning & Storing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Upload to Vault</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VERIFY / UPDATE STATUS MODAL                                  */}
      {/* ============================================================ */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-navy font-serif">
                  Compliance Check: {editingDoc.documentTypeName}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">{editingDoc.originalName}</p>
              </div>
              <button onClick={() => setEditingDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
              {/* Quick Status Buttons */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Quick Actions</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditStatus(DocumentStatus.VERIFIED);
                      if (!verificationNotes) setVerificationNotes('Approved: Document meets all high commission requirements.');
                    }}
                    className={`p-2 rounded-lg text-center font-bold text-[11px] border transition-all ${
                      editStatus === DocumentStatus.VERIFIED
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditStatus(DocumentStatus.CORRECTION_REQUIRED);
                      if (!verificationNotes) setVerificationNotes('Correction needed: Please submit a clearer scan or updated copy.');
                    }}
                    className={`p-2 rounded-lg text-center font-bold text-[11px] border transition-all ${
                      editStatus === DocumentStatus.CORRECTION_REQUIRED
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'border-orange-200 text-orange-800 bg-orange-50 hover:bg-orange-100'
                    }`}
                  >
                    Request Fix
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditStatus(DocumentStatus.REJECTED);
                      if (!verificationNotes) setVerificationNotes('Rejected: Document failed verification criteria or is invalid.');
                    }}
                    className={`p-2 rounded-lg text-center font-bold text-[11px] border transition-all ${
                      editStatus === DocumentStatus.REJECTED
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'border-rose-200 text-rose-800 bg-rose-50 hover:bg-rose-100'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Set Specific Status *</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as DocumentStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 focus:border-brand-navy"
                >
                  <option value={DocumentStatus.VERIFIED}>VERIFIED (Approved)</option>
                  <option value={DocumentStatus.UNDER_REVIEW}>UNDER REVIEW</option>
                  <option value={DocumentStatus.RECEIVED}>RECEIVED</option>
                  <option value={DocumentStatus.CORRECTION_REQUIRED}>CORRECTION REQUIRED</option>
                  <option value={DocumentStatus.REJECTED}>REJECTED</option>
                  <option value={DocumentStatus.RESUBMITTED}>RESUBMITTED</option>
                  <option value={DocumentStatus.EXPIRED}>EXPIRED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Verification / Compliance Remarks</label>
                <textarea
                  rows={2}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Official notes regarding the document verification..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Staff Notes (Confidential)</label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Confidential remarks for internal staff..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:border-brand-navy"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-3 py-1.5 rounded-lg border font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="px-4 py-1.5 rounded-lg bg-brand-navy text-white font-bold hover:bg-brand-navy-light"
                >
                  {savingStatus ? 'Updating...' : 'Save Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* REPLACE FILE MODAL                                            */}
      {/* ============================================================ */}
      {replaceDoc && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-navy font-serif">
                  Replace File: {replaceDoc.documentTypeName}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">Current: {replaceDoc.originalName}</p>
              </div>
              <button onClick={() => setReplaceDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-purple-900 text-[11px]">
                Replacing this file will update the physical vault storage and set the document status to <strong>RESUBMITTED</strong>.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Upload Replacement File * (PDF, JPG, PNG, DOCX)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setReplacementFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-navy file:text-white hover:file:bg-brand-navy-light cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Replacement Reason / Internal Notes</label>
                <textarea
                  rows={2}
                  value={replaceNotes}
                  onChange={(e) => setReplaceNotes(e.target.value)}
                  placeholder="e.g. Client submitted updated attested copy from foreign ministry."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReplaceDoc(null)}
                  className="px-3 py-1.5 rounded-lg border font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replacing || !replacementFile}
                  className="px-4 py-1.5 rounded-lg bg-purple-700 text-white font-bold hover:bg-purple-800 disabled:opacity-50"
                >
                  {replacing ? 'Uploading...' : 'Confirm Replacement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SHORT-LIVED SIGNED ACCESS LINK MODAL                          */}
      {/* ============================================================ */}
      {signedLinkModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-gold-dark" />
                <h3 className="text-base font-bold text-brand-navy font-serif">
                  Short-Lived Signed Access Link
                </h3>
              </div>
              <button onClick={() => setSignedLinkModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                This temporary link is signed with HMAC-SHA256 and will automatically expire in <strong>15 minutes</strong>. It allows authorized viewers to inspect the document without revealing internal storage paths.
              </p>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                <input
                  type="text"
                  readOnly
                  value={signedLinkModal.url}
                  className="w-full bg-transparent font-mono text-[11px] text-slate-700 outline-none select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(signedLinkModal.url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-md bg-brand-navy text-brand-gold font-bold text-xs flex-shrink-0 inline-flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Expires at: {new Date(signedLinkModal.expiresAt).toLocaleTimeString()}</span>
                <a
                  href={signedLinkModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-navy font-bold hover:underline inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-brand-gold-dark" />
                  Open in New Tab
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSignedLinkModal(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DELETE CONFIRMATION MODAL                                    */}
      {/* ============================================================ */}
      {deletingDocId && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-rose-600 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete Vault Document?</span>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this document from the secure vault? This action will be recorded in the security audit ledger.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeletingDocId(null)}
                className="px-3 py-1.5 rounded-lg border font-bold text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingDocId)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
