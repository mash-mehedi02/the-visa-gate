import { api } from './api';

/**
 * Client-portal API calls for The Visa Gate.
 *
 * Cookie-only auth: the server sets an httpOnly session cookie on sign-in
 * and the browser sends it with every request (withCredentials, see
 * services/api.ts). No token is ever kept in localStorage, sessionStorage
 * or page state, and no Bearer header is sent here.
 *
 * Privacy: every endpoint below is scoped by the server to the
 * authenticated client. The portal only ever receives the signed-in
 * client's own profile, applications and documents — never another
 * client's records. Identifiers arrive masked from the server; the UI
 * must never unmask them beyond what the server already returns.
 *
 * ---------------------------------------------------------------------------
 * ASSUMED BACKEND CONTRACTS (not yet on branch admin-firebase-cloudinary
 * when this file was written — no docs/firebase-cloudinary.md exists yet,
 * and the branch head is still the review commit 4f32a755). The backend
 * agent is adding these; reconcile before relying on them in production:
 *
 * 1. POST /api/v1/uploads/image — Cloudinary signed image upload.
 *    Assumed request: multipart FormData with the file under field "file".
 *    Assumed response envelope: { success, data: { url, secureUrl,
 *    publicId } }. The secure Cloudinary URL is used as the avatar URL.
 *
 * 2. POST /api/v1/client/avatar accepting JSON { avatarUrl } — the
 *    current endpoint only accepts a multipart "avatar" file and stores
 *    it on local disk. This client now sends the Cloudinary URL instead,
 *    so the server must store that URL on the client record (the
 *    Firebase/Cloudinary migration). If the server still expects a file,
 *    this call fails and the UI shows an honest error (no silent local
 *    fallback, so images are never stored outside Cloudinary).
 *
 * 3. GET /api/v1/client/documents/:id/download — authenticated download
 *    of the signed-in client's own document. Assumed to stream the file
 *    (or 302 to a short-lived signed URL) and to reject documents that
 *    do not belong to the caller. The list endpoint
 *    GET /api/v1/client/documents already exists and returns only
 *    { id, documentName, status, submittedDate, verifiedDate } — no file
 *    URL — so view/download go through this endpoint. If the backend
 *    later returns a per-document viewUrl/downloadUrl/signedUrl in the
 *    list response, the portal page prefers that URL.
 * ---------------------------------------------------------------------------
 */

export interface ClientProfile {
  fullName: string;
  clientCode: string;
  dateOfBirth?: string | null;
  nidMasked?: string | null;
  passportMasked?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
}

export interface PortalApplication {
  id: string;
  applicationCode: string;
  destinationCountry: string;
  countryFlag?: string;
  visaCategory: string;
  status: string;
  applicationDate?: string;
  progressPercent: number;
  totalSteps: number;
  completedSteps: number;
  nextProcedure?: {
    stepName: string;
    status: string;
    scheduledDate?: string | null;
    deadline?: string | null;
    instructions?: string;
  } | null;
}

export interface ApplicationProgress {
  applicationCode: string;
  destinationCountry?: string;
  countryFlag?: string;
  visaCategory?: string;
  status: string;
  applicationDate?: string;
  steps: Array<{
    id: string;
    stepName: string;
    description?: string;
    sortOrder: number;
    status: string;
    scheduledDate?: string | null;
    deadline?: string | null;
    completedDate?: string | null;
    instructions?: string | null;
  }>;
  nextProcedure?: {
    stepName: string;
    status: string;
    scheduledDate?: string | null;
    deadline?: string | null;
    instructions?: string | null;
  } | null;
}

export interface MyDocument {
  id: string;
  documentName: string;
  status: string;
  submittedDate?: string | null;
  verifiedDate?: string | null;
  /** Optional per-document URLs, if the backend starts returning them. */
  viewUrl?: string | null;
  downloadUrl?: string | null;
  signedUrl?: string | null;
}

export interface PublicCountry {
  id: string;
  name: string;
  code: string;
  continent?: string;
  flagEmoji?: string;
  description?: string;
  /** Admin website-visibility flag (added by the Firebase/Cloudinary work). */
  showOnWebsite?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  [key: string]: unknown;
}

/** Profile photos: JPEG, PNG or WebP only, max 5 MB. */
export const PROFILE_PIC_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_PIC_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function validateProfilePic(file: File): string | null {
  if (!(PROFILE_PIC_TYPES as readonly string[]).includes(file.type)) {
    return 'Please select a JPG, PNG or WebP image.';
  }
  if (file.size > PROFILE_PIC_MAX_BYTES) {
    return 'Image must be under 5MB.';
  }
  return null;
}

/** The signed-in client's own profile (masked identifiers, avatar URL). */
export async function getMyProfile(): Promise<ClientProfile> {
  const res: any = await api.get('/client/profile');
  return res.data as ClientProfile;
}

/** The signed-in client's own applications, with progress summary. */
export async function getMyApplications(): Promise<PortalApplication[]> {
  const res: any = await api.get('/client/applications');
  return (res.data || []) as PortalApplication[];
}

/** Published progress timeline for one of the client's own applications. */
export async function getApplicationProgress(applicationId: string): Promise<ApplicationProgress> {
  const res: any = await api.get(`/client/applications/${applicationId}/progress`);
  return res.data as ApplicationProgress;
}

/**
 * The signed-in client's own documents (optionally for one application).
 * The server filters by the authenticated user, so this can never return
 * another client's files.
 */
export async function listMyDocuments(applicationId?: string): Promise<MyDocument[]> {
  const query = applicationId ? `?applicationId=${encodeURIComponent(applicationId)}` : '';
  const res: any = await api.get(`/client/documents${query}`);
  return (res.data || []) as MyDocument[];
}

/**
 * Download one of the client's own documents as a Blob.
 * Assumed endpoint — see the contract note at the top of this file.
 */
export async function downloadMyDocument(documentId: string): Promise<Blob> {
  const blob: any = await api.get(`/client/documents/${encodeURIComponent(documentId)}/download`, {
    responseType: 'blob',
  });
  if (!(blob instanceof Blob)) {
    throw new Error('The document could not be downloaded.');
  }
  return blob as Blob;
}

/** Open one of the client's own documents in a new tab (blob object URL). */
export async function viewMyDocument(documentId: string): Promise<string> {
  const blob = await downloadMyDocument(documentId);
  return URL.createObjectURL(blob);
}

export interface ImageUploadResult {
  url: string;
  publicId?: string | null;
}

/**
 * Upload an image to Cloudinary through the signed-upload endpoint.
 * Assumed endpoint + field name — see the contract note at the top.
 */
export async function uploadImageToCloudinary(file: File): Promise<ImageUploadResult> {
  const validationError = validateProfilePic(file);
  if (validationError) throw new Error(validationError);

  const fd = new FormData();
  fd.append('file', file);
  const res: any = await api.post('/uploads/image', fd);
  const data = res.data || {};
  const url = data.secureUrl || data.url;
  if (!url) {
    throw new Error('The image upload did not return a file URL. Please try again.');
  }
  return { url, publicId: data.publicId ?? null };
}

/**
 * Upload the signed-in client's profile photo via Cloudinary, then save
 * the returned Cloudinary URL on the client record. The photo is only
 * ever saved against the authenticated client's own profile.
 * Assumed server behaviour — see the contract note at the top of this file.
 */
export async function uploadMyProfilePic(file: File): Promise<{ avatarUrl: string }> {
  const { url } = await uploadImageToCloudinary(file);
  const res: any = await api.post('/client/avatar', { avatarUrl: url });
  return { avatarUrl: (res.data && res.data.avatarUrl) || url };
}

/**
 * Shared website-visibility rule for public country lists.
 * Admin-controlled flag `showOnWebsite` wins when the API returns it;
 * until then (the field does not exist on the review branch yet) fall
 * back to the existing `isActive` flag. A country is shown only when
 * the controlling flag says so — never show a country the admin hid.
 */
export function isCountryVisibleOnWebsite(country: PublicCountry): boolean {
  if (country.showOnWebsite !== undefined && country.showOnWebsite !== null) {
    return country.showOnWebsite === true;
  }
  return country.isActive !== false;
}

/** Public country directory, filtered to countries visible on the website. */
export async function listVisibleCountries(params?: Record<string, string>): Promise<PublicCountry[]> {
  const query = new URLSearchParams(params || {}).toString();
  const res: any = await api.get(`/countries${query ? `?${query}` : ''}`);
  const countries = (res.data || []) as PublicCountry[];
  return countries.filter(isCountryVisibleOnWebsite);
}
