import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication is cookie-only: the server sets an httpOnly session cookie on
// sign-in and the browser sends it with every request (withCredentials).
// No token is ever kept in localStorage, sessionStorage or page state, so a
// cross-site scripting flaw cannot steal a session token from storage.
api.interceptors.request.use((config) => {
  // When sending FormData, let the browser calculate and set the exact multipart boundary
  if (config.data instanceof FormData && config.headers) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }
  return config;
});

// Intercept responses to handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error.response?.data || error);
  }
);

/* ------------------------------------------------------------------ */
/* Shared helpers, validation and constants for the admin console      */
/* ------------------------------------------------------------------ */

/** Bangladeshi mobile: +8801XXXXXXXXX, 8801XXXXXXXXX or 01XXXXXXXXX. */
export const BD_PHONE_REGEX = /^(\+?880|0)1[3-9]\d{8}$/;

export const isValidBdPhone = (phone: string): boolean =>
  BD_PHONE_REGEX.test(phone.trim());

/** Keep this exact wording wherever a processing duration is shown. */
export const ESTIMATE_NOTICE =
  'Processing times are estimates — outcomes depend on the relevant authorities.';

/** The api interceptor rejects with the response body, so errors arrive
 *  as `{ message, ... }` (or a plain Error). Normalise to a message. */
export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { message?: unknown; error?: unknown };
    if (typeof e.message === 'string' && e.message.trim()) return e.message;
    if (typeof e.error === 'string' && e.error.trim()) return e.error;
  }
  if (err instanceof Error && err.message) return err.message;
  return 'Something went wrong. Please try again.';
}

/**
 * Passport numbers, NID numbers, emails and phone numbers must never be
 * echoed back in an error banner (and never appear in a URL). Strip any
 * supplied secret value out of a server message before it is displayed.
 */
export function sanitizeErrorMessage(message: string, secrets: Array<string | undefined | null>): string {
  let clean = message;
  for (const secret of secrets) {
    if (secret && secret.trim().length >= 4 && clean.includes(secret.trim())) {
      clean = clean.split(secret.trim()).join('[hidden]');
    }
  }
  return clean;
}

/** Mask an identifier for display: first 2 + bullets + last 2 characters. */
export function maskIdentifier(value?: string | null): string {
  if (!value) return '—';
  const v = String(value);
  if (v.length <= 4) return '••••';
  return `${v.slice(0, 2)}••••${v.slice(-2)}`;
}

/** Documents: the same 15 MB limit and allow-list the server enforces. */
export const MAX_DOCUMENT_FILE_SIZE = 15 * 1024 * 1024;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx'];

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EXECUTABLE_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jar',
  '.scr', '.pif', '.dll', '.com', '.msi', '.apk',
];

export const isImageFile = (file: File): boolean =>
  IMAGE_MIME_TYPES.includes(file.type) || /\.(jpe?g|png|webp|gif)$/i.test(file.name);

/**
 * Client-side mirror of the server upload rules. Returns a human-readable
 * error, or null when the file is acceptable. The server re-checks
 * everything (including magic bytes), so this is a fast early rejection,
 * not a security boundary.
 */
export function validateDocumentFile(file: File): string | null {
  const lowerName = file.name.toLowerCase();
  const parts = lowerName.split('.');
  // Reject executables even when disguised with a double extension
  // (e.g. "passport.pdf.exe") or an allowed-looking trailing extension.
  if (parts.length > 2) {
    const hidden = `.${parts[parts.length - 2]}`;
    if (EXECUTABLE_EXTENSIONS.includes(hidden)) {
      return 'This file looks like an executable hidden behind a document extension and was blocked.';
    }
  }
  const ext = lowerName.includes('.') ? lowerName.slice(lowerName.lastIndexOf('.')) : '';
  if (EXECUTABLE_EXTENSIONS.includes(ext)) {
    return 'Executable and script files are not allowed. Please upload a PDF, image or Word document.';
  }
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type) && !ALLOWED_DOCUMENT_EXTENSIONS.includes(ext)) {
    return 'Only PDF, JPG, PNG, WEBP and DOC/DOCX files are allowed.';
  }
  if (file.size > MAX_DOCUMENT_FILE_SIZE) {
    return 'This file is larger than the 15 MB limit. Please upload a smaller file.';
  }
  if (file.size === 0) {
    return 'This file appears to be empty.';
  }
  return null;
}

/** Every api call returns the response envelope; `payload` unwraps its `data`. */
const payload = <T,>(res: unknown): T => (res as { data: T })?.data as T;

/* ------------------------------------------------------------------ */
/* Typed inputs                                                        */
/* ------------------------------------------------------------------ */

export interface CreateClientInput {
  fullName: string;
  dateOfBirth: string;
  nidNumber: string;
  passportNumber: string;
  phone: string;
  email?: string;
  address?: string;
  avatarUrl?: string;
  emergencyContact?: string;
  referredByStaffId?: string;
  assignedProcessingStaffId?: string;
  clientSource?: string;
  referralDate?: string;
  referralNotes?: string;
}

export interface CreateStaffInput {
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  employeeId: string;
  password: string;
  permissions: string[];
  /** Requested on create; the server must honour it for the first sign-in. */
  mustChangePassword?: boolean;
}

export interface CreateApplicationInput {
  clientId: string;
  countryId: string;
  visaCategoryId: string;
  workflowTemplateId?: string;
  assignedStaffIds?: string[];
  applicationDate?: string;
  status?: string;
  applicationCode?: string;
  internalNotes?: string;
}

export interface DocumentUploadInput {
  applicationId?: string;
  clientId: string;
  documentTypeId: string;
  documentTypeName?: string;
  status?: string;
  internalNotes?: string;
  verificationNotes?: string;
}

export interface UploadedImage {
  secureUrl: string;
  publicId?: string;
}

export interface SignedDocumentUrl {
  signedUrl: string;
  expiresAt: string;
}

/* ------------------------------------------------------------------ */
/* Clients                                                             */
/* ------------------------------------------------------------------ */

export const listClients = (params: Record<string, string | number> = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return api.get(`/clients${query ? `?${query}` : ''}`).then(payload);
};

export const getClient = (id: string) => api.get(`/clients/${id}`).then(payload);

export const createClient = (input: CreateClientInput) =>
  api.post('/clients', input).then(payload);

export const updateClient = (id: string, patch: Record<string, unknown>) =>
  api.patch(`/clients/${id}`, patch).then(payload);

export const deleteClient = (id: string) => api.delete(`/clients/${id}`).then(payload);

/* ------------------------------------------------------------------ */
/* Profile pictures (Cloudinary)                                       */
/*                                                                     */
/* ASSUMED ENDPOINT — POST /api/uploads/image does not exist on this   */
/* branch yet. The backend is adding it; expected contract: multipart  */
/* form with field `image`, returning `{ data: { secureUrl,           */
/* publicId } }` (snake_case `secure_url` / `public_id` also accepted).*/
/* ------------------------------------------------------------------ */

export const uploadImage = async (file: File): Promise<UploadedImage> => {
  const form = new FormData();
  form.append('image', file);
  const data: any = await api.post('/uploads/image', form).then(payload);
  const secureUrl = data?.secureUrl || data?.secure_url || data?.url;
  if (!secureUrl) {
    throw new Error('Image upload did not return a file URL. Please try again.');
  }
  return { secureUrl, publicId: data?.publicId || data?.public_id };
};

/** Upload a profile picture to Cloudinary, then save its URL on the client. */
export const uploadProfilePic = async (clientId: string, file: File): Promise<string> => {
  const image = await uploadImage(file);
  await updateClient(clientId, { avatarUrl: image.secureUrl });
  return image.secureUrl;
};

/* ------------------------------------------------------------------ */
/* Applications & workflow steps                                       */
/* ------------------------------------------------------------------ */

export const listApplications = (params: Record<string, string> = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/applications${query ? `?${query}` : ''}`).then(payload);
};

export const getApplication = (id: string) => api.get(`/applications/${id}`).then(payload);

export const createApplication = (input: CreateApplicationInput) =>
  api.post('/applications', input).then(payload);

export const listWorkflowTemplates = () => api.get('/workflows/templates').then(payload);

export const createWorkflowTemplate = (input: Record<string, unknown>) =>
  api.post('/workflows/templates', input).then(payload);

export const updateWorkflowTemplate = (id: string, patch: Record<string, unknown>) =>
  api.put(`/workflows/templates/${id}`, patch).then(payload);

export const deleteWorkflowTemplate = (id: string) =>
  api.delete(`/workflows/templates/${id}`).then(payload);

/**
 * Advance (or move back) a step's status. The server writes a STEP_UPDATED
 * audit entry and a step-history record for every status change.
 */
export const updateStepStatus = (stepId: string, status: string) =>
  api.patch(`/workflows/steps/${stepId}`, { status }).then(payload);

/** Full step edit (name, dates, assignee, notes, visibility, status). */
export const updateStep = (stepId: string, patch: Record<string, unknown>) =>
  api.patch(`/workflows/steps/${stepId}`, patch).then(payload);

export const deleteStep = (stepId: string) =>
  api.delete(`/workflows/steps/${stepId}`).then(payload);

export const addApplicationStep = (applicationId: string, step: Record<string, unknown>) =>
  api.post(`/workflows/applications/${applicationId}/steps`, step).then(payload);

export const reorderApplicationSteps = (applicationId: string, stepIds: string[]) =>
  api.post(`/workflows/applications/${applicationId}/steps/reorder`, { stepIds }).then(payload);

/* ------------------------------------------------------------------ */
/* Countries — visibility on the public website                        */
/*                                                                     */
/* The public country list only includes countries whose `isActive`    */
/* is not false, so toggling `isActive` is what hides/shows a country  */
/* on the website today. `showOnWebsite` is sent alongside it so the   */
/* field is persisted as soon as the backend adds it; until then the    */
/* server ignores that key and `isActive` does the work.               */
/* ------------------------------------------------------------------ */

export const listCountries = (params: Record<string, string> = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/countries${query ? `?${query}` : ''}`).then(payload);
};

export const toggleCountryVisibility = (id: string, showOnWebsite: boolean) =>
  api
    .patch(`/countries/${id}`, { isActive: showOnWebsite, showOnWebsite })
    .then(payload);

export const listWorldCountries = () => api.get('/countries/world-list').then(payload);

export const createCountry = (input: Record<string, unknown>) =>
  api.post('/countries', input).then(payload);

export const updateCountry = (id: string, patch: Record<string, unknown>) =>
  api.patch(`/countries/${id}`, patch).then(payload);

export const deleteCountry = (id: string) => api.delete(`/countries/${id}`).then(payload);

export const createProgram = (input: Record<string, unknown>) =>
  api.post('/countries/programs', input).then(payload);

export const updateProgram = (id: string, patch: Record<string, unknown>) =>
  api.patch(`/countries/programs/${id}`, patch).then(payload);

export const deleteProgram = (id: string) => api.delete(`/countries/programs/${id}`).then(payload);

/* ------------------------------------------------------------------ */
/* Staff                                                               */
/*                                                                     */
/* ASSUMED ENDPOINT — DELETE /api/staff/:id does not exist on this     */
/* branch yet (only PATCH /staff/:id for updates). The backend is      */
/* adding staff create/delete endpoints; deleteStaff calls the most    */
/* likely REST shape. Until it lands, deletes fail with a clear        */
/* server error instead of a fake success.                             */
/* ------------------------------------------------------------------ */

export const listStaff = () => api.get('/staff').then(payload);

export const getStaff = (id: string) => api.get(`/staff/${id}`).then(payload);

export const getStaffReferralReport = () => api.get('/staff/reports/referrals').then(payload);

export const createStaff = (input: CreateStaffInput) =>
  api.post('/staff', input).then(payload);

export const deleteStaff = (id: string) => api.delete(`/staff/${id}`).then(payload);

export const toggleStaffActive = (id: string, isActive: boolean) =>
  api.patch(`/staff/${id}`, { isActive }).then(payload);

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/*                                                                     */
/* Images go through the Cloudinary upload endpoint and the document   */
/* record is then created with the returned hosted URL; every other    */
/* file type uses the existing secure vault upload (multipart `file`). */
/* ASSUMED CONTRACT — the `fileUrl` + `originalName` + `mimeType` +   */
/* `fileSize` fields on POST /documents/upload for a Cloudinary-hosted */
/* image do not exist on this branch yet. The backend is wiring        */
/* document upload to Cloudinary; if it lands a different shape, this  */
/* one function is the only place that needs to change.                */
/* ------------------------------------------------------------------ */

export const listDocumentTypes = () => api.get('/documents/types').then(payload);

export const listDocumentsByApplication = (applicationId: string) =>
  api.get(`/documents/application/${applicationId}`).then(payload);

export const listDocumentsByClient = (clientId: string) =>
  api.get(`/documents/client/${clientId}`).then(payload);

export const uploadDocument = async (file: File, meta: DocumentUploadInput) => {
  if (isImageFile(file)) {
    const image = await uploadImage(file);
    const form = new FormData();
    form.append('fileUrl', image.secureUrl);
    form.append('originalName', file.name);
    form.append('mimeType', file.type || 'image/jpeg');
    form.append('fileSize', String(file.size));
    if (image.publicId) form.append('publicId', image.publicId);
    if (meta.applicationId) form.append('applicationId', meta.applicationId);
    form.append('clientId', meta.clientId);
    form.append('documentTypeId', meta.documentTypeId);
    form.append('documentTypeName', meta.documentTypeName || 'Document');
    if (meta.status) form.append('status', meta.status);
    if (meta.internalNotes) form.append('internalNotes', meta.internalNotes);
    if (meta.verificationNotes) form.append('verificationNotes', meta.verificationNotes);
    return api.post('/documents/upload', form).then(payload);
  }

  const form = new FormData();
  form.append('file', file);
  if (meta.applicationId) form.append('applicationId', meta.applicationId);
  form.append('clientId', meta.clientId);
  form.append('documentTypeId', meta.documentTypeId);
  form.append('documentTypeName', meta.documentTypeName || 'Document');
  if (meta.status) form.append('status', meta.status);
  if (meta.internalNotes) form.append('internalNotes', meta.internalNotes);
  if (meta.verificationNotes) form.append('verificationNotes', meta.verificationNotes);
  return api.post('/documents/upload', form).then(payload);
};

export const replaceDocument = (id: string, file: File, internalNotes?: string) => {
  const form = new FormData();
  form.append('file', file);
  if (internalNotes) form.append('internalNotes', internalNotes);
  return api.post(`/documents/${id}/replace`, form).then(payload);
};

export const updateDocumentStatus = (
  id: string,
  patch: { status: string; verificationNotes?: string | null; internalNotes?: string | null }
) => api.patch(`/documents/${id}/status`, patch).then(payload);

export const deleteDocument = (id: string) => api.delete(`/documents/${id}`).then(payload);

export const getDocumentSignedUrl = (id: string): Promise<SignedDocumentUrl> =>
  api.get(`/documents/${id}/signed-url`).then(payload);

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export const getDashboardReport = () => api.get('/reports/dashboard').then(payload);
