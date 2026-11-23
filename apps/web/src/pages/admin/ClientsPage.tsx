import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  KeyRound,
  FileText,
  Phone,
  Mail,
  Download,
  Filter,
  ArrowUpDown,
  Building2,
  Calendar,
  UserCheck,
  ShieldAlert,
  Archive,
  RefreshCw,
  Compass,
  Edit,
  Trash2,
  Upload,
  Camera,
  FileCheck2,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { RoleName, DocumentStatus } from '@thevisagate/shared';

export const ClientsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === RoleName.ADMIN;

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [credentialsModal, setCredentialsModal] = useState<any>(null);

  // Edit Client Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({
    fullName: '',
    dateOfBirth: '',
    nidNumber: '',
    phone: '',
    email: '',
    address: '',
    avatarUrl: '',
    emergencyContact: '',
    referredByStaffId: '',
    assignedProcessingStaffId: '',
    clientSource: 'DIRECT',
    referralDate: '',
    referralNotes: '',
    isActive: true,
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // 2-Step Secure Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Document Upload for Client State
  const [docUploadModal, setDocUploadModal] = useState(false);
  const [docUploadClientId, setDocUploadClientId] = useState<string>('');
  const [docUploadClientName, setDocUploadClientName] = useState<string>('');
  const [docUploadFile, setDocUploadFile] = useState<File | null>(null);
  const [docUploadTypeId, setDocUploadTypeId] = useState<string>('dt-1');
  const [docUploadStatus, setDocUploadStatus] = useState<DocumentStatus>(DocumentStatus.RECEIVED);
  const [docUploadNotes, setDocUploadNotes] = useState<string>('');
  const [docUploading, setDocUploading] = useState(false);

  // Client Documents View State
  const [clientDocsModal, setClientDocsModal] = useState(false);
  const [activeClientDocs, setActiveClientDocs] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [referredByFilter, setReferredByFilter] = useState('');
  const [assignedStaffFilter, setAssignedStaffFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState('');
  const [clientSourceFilter, setClientSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'fullName' | 'referralDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Auxiliary data for dropdowns
  const [staffList, setStaffList] = useState<any[]>([]);
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [docTypes, setDocTypes] = useState<any[]>([]);

  // Form State for New Registration
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    nidNumber: '',
    passportNumber: '',
    phone: '',
    email: '',
    address: '',
    avatarUrl: '',
    emergencyContact: '',
    referredByStaffId: '',
    assignedProcessingStaffId: '',
    clientSource: 'DIRECT',
    referralDate: new Date().toISOString().split('T')[0],
    referralNotes: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Auxiliary Dropdown Data
  useEffect(() => {
    const fetchAuxData = async () => {
      try {
        const [staffRes, countryRes, docTypesRes]: any = await Promise.all([
          api.get('/staff'),
          api.get('/countries'),
          api.get('/documents/types'),
        ]);
        if (staffRes.data) setStaffList(staffRes.data);
        if (countryRes.data) setCountriesList(countryRes.data);
        if (docTypesRes.data) setDocTypes(docTypesRes.data);
      } catch (err) {
        console.error('Failed to load auxiliary data', err);
      }
    };
    fetchAuxData();
  }, []);

  // Fetch Clients with Advanced Filters
  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (referredByFilter) params.append('referredByStaffId', referredByFilter);
      if (assignedStaffFilter) params.append('assignedStaffId', assignedStaffFilter);
      if (countryFilter) params.append('countryId', countryFilter);
      if (clientStatusFilter) params.append('clientStatus', clientStatusFilter);
      if (clientSourceFilter) params.append('clientSource', clientSourceFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', page.toString());
      params.append('limit', '10');

      const res: any = await api.get(`/clients?${params.toString()}`);
      if (res.data) {
        setClients(res.data.clients || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, referredByFilter, assignedStaffFilter, countryFilter, clientStatusFilter, clientSourceFilter, sortBy, sortOrder, page]);

  // Handle Register Client
  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res: any = await api.post('/clients', formData);
      setModalOpen(false);
      setCredentialsModal(res.data.temporaryCredentials);
      setFormData({
        fullName: '',
        dateOfBirth: '',
        nidNumber: '',
        passportNumber: '',
        phone: '',
        email: '',
        address: '',
        avatarUrl: '',
        emergencyContact: '',
        referredByStaffId: '',
        assignedProcessingStaffId: '',
        clientSource: 'DIRECT',
        referralDate: new Date().toISOString().split('T')[0],
        referralNotes: '',
      });
      fetchClients();
    } catch (err: any) {
      setFormError(err.message || 'Failed to register client profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // Inspect Client
  const handleViewClient = async (clientId: string) => {
    try {
      const res: any = await api.get(`/clients/${clientId}`);
      setSelectedClient(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = async (c: any) => {
    try {
      const res: any = await api.get(`/clients/${c.id}`);
      const client = res.data.client;
      setEditingClient(client);
      setEditFormData({
        fullName: client.fullName || '',
        dateOfBirth: client.dateOfBirth || '',
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || '',
        avatarUrl: client.avatarUrl || '',
        emergencyContact: client.emergencyContact || '',
        referredByStaffId: client.referredByStaffId || '',
        assignedProcessingStaffId: client.assignedProcessingStaffId || '',
        clientSource: client.clientSource || 'DIRECT',
        referralDate: client.referralDate || '',
        referralNotes: client.referralNotes || '',
        isActive: client.isActive !== false,
      });
      setEditError(null);
      setEditModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to load client details for editing.');
    }
  };

  // Submit Edit Client
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSubmitting(true);

    try {
      const payload: any = { ...editFormData };
      await api.patch(`/clients/${editingClient.id}`, payload);
      setEditModalOpen(false);
      fetchClients();
      if (selectedClient && selectedClient.client.id === editingClient.id) {
        handleViewClient(editingClient.id);
      }
    } catch (err: any) {
      setEditError(err.message || 'Failed to update client.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open 2-Step Delete Modal
  const handleOpenDelete = (c: any) => {
    setClientToDelete(c);
    setDeleteConfirmText('');
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    if (deleteConfirmText.trim().toUpperCase() !== clientToDelete.clientCode.toUpperCase()) {
      setDeleteError(`Please type '${clientToDelete.clientCode}' exactly to confirm.`);
      return;
    }

    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await api.delete(`/clients/${clientToDelete.id}`);
      setDeleteModalOpen(false);
      setClientToDelete(null);
      if (selectedClient && selectedClient.client.id === clientToDelete.id) {
        setSelectedClient(null);
      }
      fetchClients();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete client.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Open Document Upload for Client
  const handleOpenDocUpload = (c: any) => {
    setDocUploadClientId(c.id);
    setDocUploadClientName(c.fullName);
    setDocUploadFile(null);
    setDocUploadTypeId(docTypes.length > 0 ? docTypes[0].id : 'dt-1');
    setDocUploadStatus(DocumentStatus.RECEIVED);
    setDocUploadNotes('');
    setDocUploadModal(true);
  };

  // Submit Document Upload
  const handleUploadClientDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docUploadFile) {
      alert('Please select a document file.');
      return;
    }

    setDocUploading(true);
    try {
      const selectedType = docTypes.find((t) => t.id === docUploadTypeId);
      const fd = new FormData();
      fd.append('file', docUploadFile);
      fd.append('clientId', docUploadClientId);
      fd.append('documentTypeId', docUploadTypeId);
      fd.append('documentTypeName', selectedType?.name || 'Document');
      fd.append('status', docUploadStatus);
      if (docUploadNotes) fd.append('internalNotes', docUploadNotes);

      await api.post('/documents/upload', fd);

      setDocUploadModal(false);
      fetchClients();
      if (clientDocsModal && selectedClient?.client.id === docUploadClientId) {
        handleViewClientDocs(docUploadClientId, docUploadClientName);
      }
      alert('Document uploaded successfully to client vault!');
    } catch (err: any) {
      alert(err.message || 'Document upload failed.');
    } finally {
      setDocUploading(false);
    }
  };

  // View Client Documents Modal
  const handleViewClientDocs = async (clientId: string, clientName: string) => {
    setDocUploadClientId(clientId);
    setDocUploadClientName(clientName);
    setLoadingDocs(true);
    setClientDocsModal(true);
    try {
      const res: any = await api.get(`/documents/client/${clientId}`);
      setActiveClientDocs(res.data || []);
    } catch (err: any) {
      alert(err.message || 'Failed to load client documents.');
    } finally {
      setLoadingDocs(false);
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (clientId: string, currentActive: boolean) => {
    try {
      await api.patch(`/clients/${clientId}`, { isActive: !currentActive });
      fetchClients();
      if (selectedClient && selectedClient.client.id === clientId) {
        handleViewClient(clientId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (referredByFilter) params.append('referredByStaffId', referredByFilter);
    if (assignedStaffFilter) params.append('assignedStaffId', assignedStaffFilter);
    if (countryFilter) params.append('countryId', countryFilter);
    if (clientStatusFilter) params.append('clientStatus', clientStatusFilter);
    if (clientSourceFilter) params.append('clientSource', clientSourceFilter);

    window.open(`${api.defaults.baseURL}/clients/export/csv?${params.toString()}`, '_blank');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setReferredByFilter('');
    setAssignedStaffFilter('');
    setCountryFilter('');
    setClientStatusFilter('');
    setClientSourceFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy font-serif">
            Client & Referral Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Secure client directory, NID/Passport encryption, photo/document vault, and referral tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-brand-gold" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            <span>Register New Client</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-navy">
            <Filter className="w-4 h-4 text-brand-gold" />
            <span>Filter Directory ({totalCount} Clients Total)</span>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs text-brand-gold hover:text-brand-navy font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Name, Code, Phone, Passport..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          <select
            value={referredByFilter}
            onChange={(e) => setReferredByFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <option value="">Referred By Staff (All)</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.employeeId})
              </option>
            ))}
          </select>

          <select
            value={assignedStaffFilter}
            onChange={(e) => setAssignedStaffFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <option value="">Assigned Officer (All)</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>

          <select
            value={clientStatusFilter}
            onChange={(e) => setClientStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <option value="">Account Status (All)</option>
            <option value="active">Active Accounts</option>
            <option value="deactivated">Deactivated Accounts</option>
            <option value="archived">Archived Records</option>
          </select>

          <select
            value={clientSourceFilter}
            onChange={(e) => setClientSourceFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <option value="">Source (All)</option>
            <option value="DIRECT">Direct Office Visit</option>
            <option value="FACEBOOK">Facebook Campaign</option>
            <option value="STAFF_AGENT">Staff / Agent Referral</option>
            <option value="WEBSITE">Website Lead</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="table-scroll">
          <table className="w-full text-left border-collapse text-xs min-w-[860px]">
            <thead>
              <tr className="bg-brand-navy text-white text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-6">Client Info</th>
                <th className="py-3 px-6">Encrypted Credentials</th>
                <th className="py-3 px-6">Referral Attribution</th>
                <th className="py-3 px-6">Processing Officer</th>
                <th className="py-3 px-6">Cases</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading clients directory...
                  </td>
                </tr>
              ) : clients.length > 0 ? (
                clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-brand-gold/40 shadow-xs"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-brand-navy/10 text-brand-navy font-bold flex items-center justify-center text-xs">
                            {c.fullName[0]?.toUpperCase() || 'C'}
                          </div>
                        )}
                        <div>
                          <strong className="text-brand-navy text-sm font-serif block leading-snug">
                            {c.fullName}
                          </strong>
                          <span className="text-[10px] text-brand-gold-dark font-mono font-bold block">
                            {c.clientCode}
                          </span>
                          <span className="text-[11px] text-slate-500">{c.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-6 font-mono text-[11px] space-y-0.5">
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] block">Passport (Username)</span>
                        <strong className="text-brand-navy">{c.passportMasked}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 uppercase text-[9px] block">National ID</span>
                        <span className="text-slate-600">{c.nidMasked}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      {c.referredByStaffName ? (
                        <div className="flex items-center gap-1.5 text-xs text-brand-navy font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-brand-gold" />
                          <span>{c.referredByStaffName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Direct Lead</span>
                      )}
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Source: {c.clientSource} ({c.referralDate || 'N/A'})
                      </span>
                    </td>

                    <td className="py-3.5 px-6">
                      {c.assignedProcessingStaffName ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                          {c.assignedProcessingStaffName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-6 font-semibold text-brand-navy">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-gold/15 text-brand-navy font-bold text-xs">
                        <FileText className="w-3 h-3 text-brand-gold" />
                        {c.applicationsCount} File{c.applicationsCount !== 1 ? 's' : ''}
                      </span>
                    </td>

                    <td className="py-3.5 px-6">
                      {c.isArchived ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700">
                          Archived
                        </span>
                      ) : c.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
                          Deactivated
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Inspect Profile */}
                        <button
                          onClick={() => handleViewClient(c.id)}
                          title="Inspect Client Profile"
                          className="p-1.5 rounded bg-slate-100 hover:bg-brand-navy hover:text-white text-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* View & Upload Documents */}
                        <button
                          onClick={() => handleViewClientDocs(c.id, c.fullName)}
                          title="View Documents Vault"
                          className="p-1.5 rounded bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 transition-colors"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenDocUpload(c)}
                          title="Upload New Document"
                          className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Client */}
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Client Information"
                          className="p-1.5 rounded bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Active */}
                        <button
                          onClick={() => handleToggleActive(c.id, c.isActive)}
                          title={c.isActive ? 'Deactivate account' : 'Activate account'}
                          className={`p-1.5 rounded transition-colors ${
                            c.isActive ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>

                        {/* 2-Step Secure Delete (Admin Only) */}
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenDelete(c)}
                            title="Delete Client Permanently (2-Step)"
                            className="p-1.5 rounded bg-red-50 hover:bg-red-600 hover:text-white text-red-700 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No client records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 1. Register Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-brand-navy font-serif">
                  Register New Client & Referral CRM
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Encrypts NID/Passport, configures separate referral attribution and processing assignment.
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Mohammad Rafiqul Islam"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Passport Number (Username) *</label>
                  <input
                    type="text"
                    required
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. A12345678"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-brand-gold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth * (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">National ID (NID) Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.nidNumber}
                    onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                    placeholder="10-17 Digit Smart / Classic NID"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1XXXXXXXXX"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Profile Photo / Avatar URL</label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Info</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="e.g. Brother: +88017XXXXXXXX"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
              </div>

              {/* Referral & Delegation Settings */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
                <span className="text-xs font-bold text-brand-navy uppercase block tracking-wider">
                  Referral & Case Delegation Settings
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Referred By Staff (Who brought the client?)
                    </label>
                    <select
                      value={formData.referredByStaffId}
                      onChange={(e) => setFormData({ ...formData, referredByStaffId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                    >
                      <option value="">Direct / Company Lead</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assigned Processing Staff (Who handles files?)
                    </label>
                    <select
                      value={formData.assignedProcessingStaffId}
                      onChange={(e) => setFormData({ ...formData, assignedProcessingStaffId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Client Source</label>
                    <select
                      value={formData.clientSource}
                      onChange={(e) => setFormData({ ...formData, clientSource: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                    >
                      <option value="DIRECT">Direct Walk-in</option>
                      <option value="FACEBOOK">Facebook Campaign</option>
                      <option value="STAFF_AGENT">Staff / Agent Referral</option>
                      <option value="WEBSITE">Website Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Referral Date</label>
                    <input
                      type="date"
                      value={formData.referralDate}
                      onChange={(e) => setFormData({ ...formData, referralDate: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address / Notes</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Address, district or internal registration notes..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Client Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-brand-navy font-serif">
                  Edit Client Profile: {editingClient?.fullName}
                </h3>
                <span className="text-xs font-mono text-brand-gold-dark font-bold">
                  {editingClient?.clientCode} • {editingClient?.passportMasked}
                </span>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    required
                    value={editFormData.dateOfBirth}
                    onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Permanent Legal Identifiers (Fixed & Immutable) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5 text-brand-gold-dark" />
                    Permanent Legal Identifiers (Fixed & Immutable)
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    Cannot be changed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passport Number (Unique Username)</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={editingClient?.passportMasked || '••••••••'}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-700 font-mono text-xs cursor-not-allowed select-all"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">National ID (NID) Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={editingClient?.nidMasked || '•••••••••••••'}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100/80 text-slate-700 font-mono text-xs cursor-not-allowed select-all"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  Passport and NID numbers are fixed legal credentials linked to client portal authentication and official immigration filings. They cannot be modified after registration.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Profile Photo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={editFormData.avatarUrl}
                      onChange={(e) => setEditFormData({ ...editFormData, avatarUrl: e.target.value })}
                      placeholder="https://... or upload image"
                      className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shrink-0">
                      <Camera className="w-3.5 h-3.5 text-brand-gold-dark" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !editingClient) return;
                          try {
                            const fd = new FormData();
                            fd.append('avatar', file);
                            const res: any = await api.post(`/clients/${editingClient.id}/avatar`, fd);
                            if (res.data?.avatarUrl) {
                              setEditFormData((prev: any) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
                            }
                          } catch (err: any) {
                            alert(err?.message || 'Failed to upload image');
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Referred By Staff</label>
                  <select
                    value={editFormData.referredByStaffId || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, referredByStaffId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="">Direct / Company Lead</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Processing Staff</label>
                  <select
                    value={editFormData.assignedProcessingStaffId || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, assignedProcessingStaffId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-6 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light disabled:opacity-50"
                >
                  {editSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Two-Step Secure Delete Confirmation Modal */}
      {deleteModalOpen && clientToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-red-200 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto border-4 border-red-50">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-red-700 font-serif">Two-Step Permanent Delete</h3>
              <p className="text-xs text-slate-600 mt-1">
                You are about to permanently delete client <strong>{clientToDelete.fullName}</strong>.
              </p>
            </div>

            <div className="bg-red-50/70 p-3.5 rounded-xl border border-red-200 text-left text-xs text-red-800 space-y-1">
              <p className="font-semibold">⚠️ Warning:</p>
              <p>This action will erase the client's login account, documents, and application history. This cannot be undone.</p>
            </div>

            <div className="text-left space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Type <span className="font-mono text-red-600 font-extrabold">{clientToDelete.clientCode}</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={clientToDelete.clientCode}
                className="w-full px-3.5 py-2.5 rounded-lg border border-red-300 text-xs font-mono uppercase text-center font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {deleteError && (
              <div className="p-2.5 rounded bg-red-100 text-red-700 text-xs font-medium">
                {deleteError}
              </div>
            )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSubmitting || deleteConfirmText.trim().toUpperCase() !== clientToDelete.clientCode.toUpperCase()}
                onClick={handleConfirmDelete}
                className="py-2.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-40 transition-colors shadow-sm"
              >
                {deleteSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Client Documents Vault Modal */}
      {clientDocsModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-navy font-serif">
                  Document Vault: {docUploadClientName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified scans, NID/Passport copies, and application documents.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setClientDocsModal(false);
                    setDocUploadModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light"
                >
                  <Upload className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Upload Document</span>
                </button>
                <button onClick={() => setClientDocsModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingDocs ? (
                <p className="text-center py-10 text-slate-400 text-xs">Loading documents...</p>
              ) : activeClientDocs.length > 0 ? (
                activeClientDocs.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-navy/10 text-brand-navy flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-brand-navy block">
                          {doc.documentTypeName}
                        </strong>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {doc.originalName} • {(doc.fileSize / 1024).toFixed(1)} KB
                        </span>
                        {doc.internalNotes && (
                          <p className="text-[10px] text-slate-600 mt-0.5 italic">
                            Note: {doc.internalNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {doc.status}
                      </span>
                      <a
                        href={`/api/v1/documents/${doc.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-gold text-brand-navy shadow-xs"
                        title="Download / View Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <FileCheck2 className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">No documents uploaded for this client yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Document Upload Modal */}
      {docUploadModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-navy font-serif">
                  Upload Document: {docUploadClientName}
                </h3>
                <p className="text-xs text-slate-500">
                  Secure upload with malware scanning and encryption.
                </p>
              </div>
              <button onClick={() => setDocUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadClientDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Category *
                </label>
                <select
                  value={docUploadTypeId}
                  onChange={(e) => setDocUploadTypeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                >
                  {docTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select File (PDF, PNG, JPG, DOCX - Max 15MB) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg,.docx"
                  onChange={(e) => setDocUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-navy file:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Status
                </label>
                <select
                  value={docUploadStatus}
                  onChange={(e) => setDocUploadStatus(e.target.value as DocumentStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
                >
                  <option value={DocumentStatus.RECEIVED}>Received</option>
                  <option value={DocumentStatus.UNDER_REVIEW}>Under Review</option>
                  <option value={DocumentStatus.VERIFIED}>Verified / Approved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Internal Staff Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={docUploadNotes}
                  onChange={(e) => setDocUploadNotes(e.target.value)}
                  placeholder="e.g. Verified original copy with physical signature"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDocUploadModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={docUploading || !docUploadFile}
                  className="px-5 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light disabled:opacity-50"
                >
                  {docUploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Credentials Modal */}
      {credentialsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-brand-navy">Client Registered Successfully</h3>
              <p className="text-xs text-slate-500 mt-1">
                Client can track application using their Passport Number and National ID.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left font-mono text-xs space-y-2">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Username / Passport</span>
                <strong className="text-brand-navy text-sm">{credentialsModal.identifier}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Default Backup Pass</span>
                <strong className="text-brand-gold-dark text-sm">{credentialsModal.temporaryPassword}</strong>
              </div>
            </div>

            <button
              onClick={() => setCredentialsModal(null)}
              className="w-full py-2.5 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light"
            >
              Done & Return to Directory
            </button>
          </div>
        </div>
      )}

      {/* Detailed Client Inspect Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 sm:p-8 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                {selectedClient.client.avatarUrl ? (
                  <img
                    src={selectedClient.client.avatarUrl}
                    alt={selectedClient.client.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-brand-gold"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-navy text-brand-gold font-bold flex items-center justify-center text-base">
                    {selectedClient.client.fullName[0]?.toUpperCase() || 'C'}
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider block">
                    Client Profile
                  </span>
                  <h3 className="text-xl font-bold text-brand-navy">{selectedClient.client.fullName}</h3>
                  <span className="text-xs font-mono text-slate-500">{selectedClient.client.clientCode}</span>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  handleOpenEdit(selectedClient.client);
                }}
                className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => {
                  handleViewClientDocs(selectedClient.client.id, selectedClient.client.fullName);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-light flex items-center justify-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-brand-gold" />
                <span>Documents Vault</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    handleOpenDelete(selectedClient.client);
                  }}
                  className="py-2 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Passport Number</span>
                  <strong className="text-brand-navy font-mono text-sm">{selectedClient.client.passportMasked}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">National ID (NID)</span>
                  <strong className="text-slate-700 font-mono text-sm">{selectedClient.client.nidMasked}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Phone / WhatsApp</span>
                  <span className="text-slate-700">{selectedClient.client.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Date of Birth</span>
                  <span className="text-slate-700">{selectedClient.client.dateOfBirth}</span>
                </div>
              </div>

              {/* CRM Info */}
              <div className="p-4 bg-brand-bg rounded-xl border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-brand-navy uppercase block tracking-wider">
                  CRM & Referral Tracking
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Referred By</span>
                    <strong className="text-brand-navy">{selectedClient.client.referredByStaffName || 'Direct'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Processing Officer</span>
                    <strong className="text-brand-navy">{selectedClient.client.assignedProcessingStaffName || 'Unassigned'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Client Source</span>
                    <span className="text-slate-700">{selectedClient.client.clientSource}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Referral Date</span>
                    <span className="text-slate-700">{selectedClient.client.referralDate || 'N/A'}</span>
                  </div>
                </div>
                {selectedClient.client.referralNotes && (
                  <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                    <strong>Note:</strong> {selectedClient.client.referralNotes}
                  </p>
                )}
              </div>

              {/* Applications History */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold text-brand-navy flex items-center justify-between">
                  <span>Application History</span>
                  <span className="text-xs text-brand-gold font-normal">
                    {selectedClient.applications.length} Case{selectedClient.applications.length !== 1 ? 's' : ''}
                  </span>
                </h4>

                {selectedClient.applications.length > 0 ? (
                  selectedClient.applications.map((app: any) => (
                    <div key={app.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-gold/60 transition-colors bg-white space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-brand-navy font-mono text-xs">{app.applicationCode}</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-gold/20 text-brand-navy uppercase">
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {app.countryName} • {app.visaCategoryName}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>Steps: {app.completedSteps} / {app.totalSteps} Completed</span>
                        <span>Docs: {app.verifiedDocuments} / {app.totalDocuments} Verified</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No applications initiated yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
