import { RoleName, ApplicationStatus, StepStatus, DocumentStatus, PaymentMethod, PaymentStatus } from '@thevisagate/shared';
import { encryptSensitiveData, maskSensitiveIdentifier, hashPassword } from '../utils/crypto';
import { prisma } from '../prisma';
import fs from 'fs';
import path from 'path';

export interface MemoryRole {
  id: string;
  name: RoleName;
  description: string;
}

export interface MemoryUser {
  id: string;
  identifier: string;
  email: string | null;
  passwordHash: string;
  roleId: string;
  role: RoleName;
  isActive: boolean;
  mustChangePassword: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryClient {
  id: string;
  userId: string;
  clientCode: string;
  fullName: string;
  dateOfBirth: string;
  nidEncrypted: string;
  nidMasked: string;
  passportEncrypted: string;
  passportMasked: string;
  phone: string;
  email: string | null;
  address: string | null;
  avatarUrl: string | null;
  emergencyContact: string | null;
  // Referral & CRM fields
  referredByStaffId: string | null;
  assignedProcessingStaffId: string | null;
  clientSource: string;
  referralDate: string | null;
  referralNotes: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryStaff {
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  designation: string;
  phone: string;
  email: string;
  permissions: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryCountry {
  id: string;
  name: string;
  code: string;
  continent: string;
  flagEmoji: string;
  description: string;
  isFeatured: boolean;
  displayOrder: number;
  currency?: string;
  capital?: string;
  isActive: boolean;
}

export interface MemoryVisaProgram {
  id: string;
  countryId: string;
  programName: string;
  visaCategory: string;
  description: string;
  eligibility: string;
  requiredDocuments: string[];
  serviceInformation: string;
  startDate: string | null;
  endDate: string | null;
  programStatus: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';
  bookingEnabled: boolean;
  displayOrder: number;
  defaultProcessingDays: number;
  consultationFee: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryBooking {
  id: string;
  bookingCode: string;
  fullName: string;
  phone: string;
  email: string;
  continent: string;
  countryId: string;
  countryName: string;
  programId: string | null;
  programName: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // e.g. "11:00 AM"
  additionalMessage: string;
  privacyConsent: boolean;
  status: 'PENDING' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'REJECTED';
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  internalNotes: string | null;
  cancellationReason: string | null;
  rescheduledDate: string | null;
  rescheduledTime: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryVisaCategory {
  id: string;
  countryId: string;
  name: string;
  code: string;
  description: string;
  defaultProcessingDays: number;
  isActive: boolean;
}

export interface MemoryWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  countryId: string | null;
  visaCategoryId: string | null;
  isActive: boolean;
  steps: {
    id: string;
    stepName: string;
    description: string;
    sortOrder: number;
    estimatedDays: number;
    clientInstructions: string;
  }[];
}

export interface MemoryApplicationStep {
  id: string;
  applicationId: string;
  stepName: string;
  description: string;
  sortOrder: number;
  status: StepStatus;
  scheduledDate: string | null;
  deadline: string | null;
  completedDate: string | null;
  assignedStaffId: string | null;
  assignedStaffName?: string | null;
  clientInstructions: string | null;
  internalNotes: string | null;
  isPublishedToClient: boolean;
  completedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryStepHistory {
  id: string;
  applicationStepId: string;
  previousStatus: StepStatus;
  newStatus: StepStatus;
  changedById: string | null;
  changeNotes: string | null;
  createdAt: Date;
}

export interface MemoryDocument {
  id: string;
  applicationId: string;
  clientId: string;
  documentTypeId: string;
  documentTypeName: string;
  fileName: string;
  originalName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  verificationNotes: string | null;
  internalNotes?: string | null;
  verifiedById: string | null;
  verifiedAt: Date | null;
  uploadedById: string | null;
  replacedAt?: Date | null;
  replacedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryPayment {
  id: string;
  receiptNumber: string;
  applicationId: string;
  clientId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string | null;
  paymentDate: string;
  status: PaymentStatus;
  internalNotes: string | null;
  recordedById: string;
  createdAt: Date;
  updatedAt: Date;
  adjustments: {
    id: string;
    paymentId: string;
    adjustmentType: string;
    amount: number;
    reason: string;
    createdById: string;
    createdAt: Date;
  }[];
}

export interface MemoryApplication {
  id: string;
  applicationCode: string;
  clientId: string;
  countryId: string;
  visaCategoryId: string;
  status: ApplicationStatus;
  applicationDate: string;
  internalNotes: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignedStaffIds: string[];
}

export interface MemoryAuditLog {
  id: string;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface MemoryNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: Date;
}

class UnifiedDataStore {
  private isPostgresConnected = false;

  // In-memory tables
  public roles: MemoryRole[] = [];
  public users: MemoryUser[] = [];
  public clients: MemoryClient[] = [];
  public staff: MemoryStaff[] = [];
  public countries: MemoryCountry[] = [];
  public visaPrograms: MemoryVisaProgram[] = [];
  public visaCategories: MemoryVisaCategory[] = [];
  public bookings: MemoryBooking[] = [];
  public workflowTemplates: MemoryWorkflowTemplate[] = [];
  public applications: MemoryApplication[] = [];
  public applicationSteps: MemoryApplicationStep[] = [];
  public stepHistory: MemoryStepHistory[] = [];
  public documents: MemoryDocument[] = [];
  public payments: MemoryPayment[] = [];
  public auditLogs: MemoryAuditLog[] = [];
  public notifications: MemoryNotification[] = [];

  // Security, Sessions & MFA Tracking
  public revokedSessions: Set<string> = new Set();
  public mfaChallenges: Map<string, { userId: string; code: string; expiresAt: Date; attempts: number }> = new Map();
  public passwordResetTokens: Map<string, { userId: string; token: string; expiresAt: Date }> = new Map();

  /**
   * Codes that have been delivered but not yet collected, keyed by the
   * one-time challenge token. The token itself is the only credential
   * required to collect the code, and each entry is single-use.
   */
  public pendingVerificationCodes: Map<string, { code: string; expiresAt: Date; consumed: boolean }> = new Map();

  // File storage path for persistent storage
  private storageDir = path.resolve(process.cwd(), 'data');
  private storageFile = path.resolve(process.cwd(), 'data', 'db.json');

  constructor() {
    // 1. Synchronously seed static catalog (countries, programs, categories, templates)
    this.seedStaticCatalog();
    // 2. Synchronously seed baseline records (users with bcrypt hashes, staff, clients, sample app)
    this.seedBaselineData();
    // 3. Load persisted database from disk and merge on top
    this.loadFromDisk();
    // 4. Save merged, healthy state back to disk
    this.saveToDisk();
  }

  public saveToDisk() {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }
      const data = {
        users: this.users,
        clients: this.clients,
        staff: this.staff,
        countries: this.countries,
        visaPrograms: this.visaPrograms,
        visaCategories: this.visaCategories,
        bookings: this.bookings,
        workflowTemplates: this.workflowTemplates,
        applications: this.applications,
        applicationSteps: this.applicationSteps,
        stepHistory: this.stepHistory,
        documents: this.documents,
        payments: this.payments,
        auditLogs: this.auditLogs,
      };
      fs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore] Failed to save database to disk:', err);
    }
  }

  /**
   * Synchronously seed all static catalog data (countries, programs, visa categories, workflow templates).
   * Always called first in constructor so loadFromDisk() has a complete seed to merge against.
   */
  public seedStaticCatalog() {
    this.roles = [
      { id: 'role-admin', name: RoleName.ADMIN, description: 'System Administrator' },
      { id: 'role-staff', name: RoleName.STAFF, description: 'Operations Staff' },
      { id: 'role-client', name: RoleName.CLIENT, description: 'Client Read-only' },
    ];

    // â”€â”€ Full World Country List (ISO 3166-1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        this.countries = [
      { id: 'country-mys', name: 'Malaysia', code: 'MYS', continent: 'Asia', flagEmoji: '🇲🇾', description: 'Prime destination for construction, manufacturing, plantation, hospitality calling visas, and EMGS university programs.', isFeatured: true, displayOrder: 1, currency: 'MYR', capital: 'Kuala Lumpur', isActive: true },
      { id: 'country-cyp', name: 'Cyprus', code: 'CYP', continent: 'Europe', flagEmoji: '🇨🇾', description: 'European island nation offering accredited Ministry of Labour work contracts and college degrees.', isFeatured: true, displayOrder: 2, currency: 'EUR', capital: 'Nicosia', isActive: true },
      { id: 'country-blr', name: 'Belarus', code: 'BLR', continent: 'Europe', flagEmoji: '🇧🇾', description: 'Eastern European industrial center with direct ministerial employment approval tracking and academic programs.', isFeatured: true, displayOrder: 3, currency: 'BYN', capital: 'Minsk', isActive: true },
      { id: 'country-rou', name: 'Romania', code: 'ROU', continent: 'Europe', flagEmoji: '🇷🇴', description: 'Schengen European destination for construction, logistics, manufacturing, and hospitality work permits.', isFeatured: true, displayOrder: 4, currency: 'RON', capital: 'Bucharest', isActive: true },
      { id: 'country-sau', name: 'Saudi Arabia', code: 'SAU', continent: 'Asia', flagEmoji: '🇸🇦', description: 'Major destination for professional, medical, technical, and skilled labor visas through Musaned.', isFeatured: true, displayOrder: 5, currency: 'SAR', capital: 'Riyadh', isActive: true },
      { id: 'country-can', name: 'Canada', code: 'CAN', continent: 'North America', flagEmoji: '🇨🇦', description: 'Express Entry (FSWP, CEC), Provincial Nominee Programs (PNP), LMIA work permits, and study permits.', isFeatured: true, displayOrder: 6, currency: 'CAD', capital: 'Ottawa', isActive: true },
      { id: 'country-gbr', name: 'United Kingdom (UK)', code: 'GBR', continent: 'Europe', flagEmoji: '🇬🇧', description: 'Global education destination and healthcare/skilled worker sponsorship (CoS) programs.', isFeatured: true, displayOrder: 7, currency: 'GBP', capital: 'London', isActive: true },
      { id: 'country-aus', name: 'Australia', code: 'AUS', continent: 'Oceania', flagEmoji: '🇦🇺', description: 'Subclass 500 Student Visa, Subclass 482 Temporary Skill Shortage, and General Skilled Migration.', isFeatured: true, displayOrder: 8, currency: 'AUD', capital: 'Canberra', isActive: true },
      { id: 'country-bih', name: 'Bosnia and Herzegovina', code: 'BIH', continent: 'Europe', flagEmoji: '🇧🇦', description: 'Bosnia and Herzegovina offers employment opportunities in construction, manufacturing and services sectors.', isFeatured: true, displayOrder: 10, currency: 'BAM', capital: 'Sarajevo', isActive: true },
      { id: 'country-egy', name: 'Egypt', code: 'EGY', continent: 'Africa', flagEmoji: '🇪🇬', description: 'Historical education and cultural trade gateway with medical university programs and commercial entry.', isFeatured: false, displayOrder: 9, currency: 'EGP', capital: 'Cairo', isActive: true },
      { id: 'country-bra', name: 'Brazil', code: 'BRA', continent: 'South America', flagEmoji: '🇧🇷', description: "South America's primary economic hub offering digital nomad visas, business permits, and student visas.", isFeatured: false, displayOrder: 13, currency: 'BRL', capital: 'Brasília', isActive: true },
      { id: 'country-srb', name: 'Serbia', code: 'SRB', continent: 'Europe', flagEmoji: '🇷🇸', description: 'Southeast European destination offering official employment and work permit pathways for construction, manufacturing, and skilled services sectors.', isFeatured: false, displayOrder: 11, currency: 'RSD', capital: 'Belgrade', isActive: true },
      { id: 'country-mkd', name: 'North Macedonia', code: 'MKD', continent: 'Europe', flagEmoji: '🇲🇰', description: 'Southeast European destination with official employment authorization and work permit routes for manufacturing, construction, and hospitality sectors.', isFeatured: false, displayOrder: 12, currency: 'MKD', capital: 'Skopje', isActive: true },
    ];

    // Seed default visa programs
    this.visaPrograms = [
      { id: 'prog-mys-calling', countryId: 'country-mys', programName: 'Manufacturing & Plantation Calling Visa (Direct Quota)', visaCategory: 'Work Permit', description: 'Official Malaysian Immigration calling visa processing for industrial manufacturing, agriculture, and construction sectors.', eligibility: 'Age 21-40. Medically fit under GAMCA/FOMEMA standards. Valid passport with minimum 2 years validity.', requiredDocuments: ['Valid Passport', 'National ID (NID)', 'GAMCA Medical Fitness Slip', 'Police Clearance Certificate', 'Passport-size Photos'], serviceInformation: 'File submitted to Ministry of Human Resources (KSM) and Immigration Department of Malaysia (JIM). Complete end-to-end guidance.', startDate: '2026-01-01', endDate: '2026-12-31', programStatus: 'ACTIVE', bookingEnabled: true, displayOrder: 1, defaultProcessingDays: 60, consultationFee: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prog-mys-emgs', countryId: 'country-mys', programName: 'Higher Education Student Visa (EMGS Pathway)', visaCategory: 'Student Visa', description: 'Comprehensive academic pathway assistance for bachelor, masters, and vocational diploma programs in Malaysian universities.', eligibility: 'HSC / A-Level or Bachelor graduate with minimum 55% marks. IELTS 5.5+ or MOI accepted for select universities.', requiredDocuments: ['Academic Certificates & Transcripts', 'Passport Copies', 'Health Declaration Form', 'Offer Letter from Institution', 'Passport Photos'], serviceInformation: 'Assistance with university admission, EMGS Visa Approval Letter (eVAL), and Single Entry Visa (SEV) stamping.', startDate: '2026-01-01', endDate: '2026-12-31', programStatus: 'ACTIVE', bookingEnabled: true, displayOrder: 2, defaultProcessingDays: 45, consultationFee: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prog-cyp-hospitality', countryId: 'country-cyp', programName: 'Cyprus Hospitality & Culinary Employment Entry', visaCategory: 'Work Permit', description: 'Authenticated legal employment contracts in hospitality, hotel management, culinary, and technical services.', eligibility: 'Age 20-38. Clear police record. Prior experience in hospitality or culinary services preferred.', requiredDocuments: ['Police Clearance Certificate (MOFA attested)', 'Medical Screening Certificate', 'Passport Copies', 'Experience Certificates'], serviceInformation: 'Ministry of Labour approval authenticated through Civil Registry and Migration Department of Cyprus.', startDate: '2026-01-01', endDate: '2026-12-31', programStatus: 'ACTIVE', bookingEnabled: true, displayOrder: 1, defaultProcessingDays: 75, consultationFee: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prog-rou-schengen', countryId: 'country-rou', programName: 'Romania General Labor & Construction Schengen Permit', visaCategory: 'Work Permit', description: 'General Inspectorate for Immigration (IGI) authenticated work permits for warehouse, logistics, and building construction.', eligibility: 'Age 20-45. Fit for physical work. Clean criminal record attested by foreign ministry.', requiredDocuments: ['Passport (min 2 years validity)', 'Police Clearance Certificate', 'Medical Examination Report', 'Biometric Photos'], serviceInformation: 'Official Work Authorization (Aviz de Munca) issued in Romania followed by National Long-Stay D/AM Visa application.', startDate: '2026-01-01', endDate: '2026-12-31', programStatus: 'ACTIVE', bookingEnabled: true, displayOrder: 1, defaultProcessingDays: 90, consultationFee: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prog-can-student', countryId: 'country-can', programName: 'Canada University Study Permit & Post-Graduation Work Pathway', visaCategory: 'Student Visa', description: 'Direct admission to Designated Learning Institutions (DLI) with Post-Graduation Work Permit (PGWP) eligibility.', eligibility: 'High School / Bachelor with IELTS 6.0+ (minimum 6.0 each band). Verifiable tuition fee and living expenses funding.', requiredDocuments: ['Letters of Acceptance (LOA) from DLI', 'Proof of Financial Support / GIC', 'Statement of Purpose (SOP)', 'Academic Transcripts'], serviceInformation: 'Immigration, Refugees and Citizenship Canada (IRCC) compliant file preparation, financial portfolio audit, and biometrics tracking.', startDate: '2026-01-01', endDate: '2026-12-31', programStatus: 'ACTIVE', bookingEnabled: true, displayOrder: 1, defaultProcessingDays: 60, consultationFee: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prog-gbr-cos', countryId: 'country-gbr', programName: 'UK Higher Education (Tier 4 / Student Route) & Skilled Worker', visaCategory: 'Student Visa', description: 'CAS-sponsored university applications across top British institutions with graduate route post-study work visa rights.', eligibility: 'Minimum 60% in previous education. UKVI IELTS or accepted English test. Proof of maintenance funds for 28 days.', requiredDocuments: ['CAS Statement from Licensed Sponsor', 'Bank Solvency & 28-day Statement', 'TB Test Certificate', 'Academic Documents'], serviceInformation: 'Full UK Visas and Immigration (UKVI) online portal management, document checklist audit, and VFS Global appointment booking.', startDate: '2026-01-01', endDate: '2026-12-31', programStatus: 'ACTIVE', bookingEnabled: true, displayOrder: 1, defaultProcessingDays: 30, consultationFee: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prog-bih-wp', countryId: 'country-bih', programName: 'Bosnia Work Permit (Employment Visa)', visaCategory: 'Work Permit', description: 'Official Bosnia employment and work authorization permit for construction, manufacturing, and services sectors.', eligibility: 'Age 20-45. Valid passport with minimum 2 years validity. Clean police clearance.', requiredDocuments: ['Passport Copy', 'Police Clearance Certificate', 'Medical Fitness Certificate', 'Passport Photos'], serviceInformation: 'Ministry of Security & Employment Bureau accredited work authorization.', startDate: '2026-01-01', endDate: '2026-12-31', programStatus: 'ACTIVE', bookingEnabled: true, displayOrder: 1, defaultProcessingDays: 45, consultationFee: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prog-srb-wp', countryId: 'country-srb', programName: 'Serbia Work Permit (Employment Visa)', visaCategory: 'Work Permit', description: 'Official Serbia employment and work authorization permit for construction, manufacturing, and skilled services sectors.', eligibility: 'Age 20-45. Valid passport with minimum 2 years validity. Clean police clearance.', requiredDocuments: ['Passport Copy', 'Police Clearance Certificate', 'Medical Fitness Certificate', 'Passport Photos'], serviceInformation: 'Ministry of Interior single permit and employment bureau accredited work authorization.', startDate: '2026-01-01', endDate: '2026-12-31', programStatus: 'ACTIVE', bookingEnabled: true, displayOrder: 1, defaultProcessingDays: 120, consultationFee: 0, createdAt: new Date(), updatedAt: new Date() },
      { id: 'prog-mkd-wp', countryId: 'country-mkd', programName: 'North Macedonia Work Permit (Employment Visa)', visaCategory: 'Work Permit', description: 'Official North Macedonia employment authorization and work permit for manufacturing, construction, and hospitality sectors.', eligibility: 'Age 20-45. Valid passport with minimum 2 years validity. Clean police clearance.', requiredDocuments: ['Passport Copy', 'Police Clearance Certificate', 'Medical Fitness Certificate', 'Passport Photos'], serviceInformation: 'Ministry of Labour and Social Policy accredited work authorization and residence permit.', startDate: '2026-01-01', endDate: '2026-12-31', programStatus: 'ACTIVE', bookingEnabled: true, displayOrder: 1, defaultProcessingDays: 120, consultationFee: 0, createdAt: new Date(), updatedAt: new Date() },
    ];

    // Seed default visa categories
    this.visaCategories = [
      { id: 'cat-mys-wp', countryId: 'country-mys', name: 'Work Permit (Calling Visa)', code: 'WP', description: 'Official Malaysian Immigration calling visa for manufacturing and services.', defaultProcessingDays: 60, isActive: true },
      { id: 'cat-mys-st', countryId: 'country-mys', name: 'Student Visa (EMGS)', code: 'ST', description: 'Higher education visa approved through Education Malaysia Global Services.', defaultProcessingDays: 45, isActive: true },
      { id: 'cat-cyp-wp', countryId: 'country-cyp', name: 'Employment Entry Visa', code: 'WP', description: 'Work contract permit authenticated by Cyprus Ministry of Labour.', defaultProcessingDays: 75, isActive: true },
      { id: 'cat-blr-wp', countryId: 'country-blr', name: 'Official Work Permit', code: 'WP', description: 'Belarus Ministry of Internal Affairs official work invitation and permit.', defaultProcessingDays: 60, isActive: true },
      { id: 'cat-bih-wp', countryId: 'country-bih', name: 'Work Permit (Employment Visa)', code: 'WP', description: 'Official Bosnia employment and work permit.', defaultProcessingDays: 45, isActive: true },
      { id: 'cat-srb-wp', countryId: 'country-srb', name: 'Work Permit (Employment Visa)', code: 'WP', description: 'Official Serbia employment and work permit.', defaultProcessingDays: 120, isActive: true },
      { id: 'cat-mkd-wp', countryId: 'country-mkd', name: 'Work Permit (Employment Visa)', code: 'WP', description: 'Official North Macedonia employment and work permit.', defaultProcessingDays: 120, isActive: true },
    ];

    // Seed default workflow templates
    this.workflowTemplates = [
      { id: 'wf-mys-wp', name: 'Malaysia Work Permit Standard Procedure', description: 'Professional 9-step Work Permit Visa workflow for the Malaysia calling visa and work permit - 120 days (approx. 4 months) from document preparation to pre-departure clearance.', countryId: 'country-mys', visaCategoryId: 'cat-mys-wp', isActive: true, steps: [{ id: 'ws-mys-1', stepName: 'Document Preparation and Verification', description: 'We collect and verify your passport, photographs and supporting documents.', sortOrder: 1, estimatedDays: 2, clientInstructions: 'Please submit your passport, recent photographs and all supporting documents for verification.' }, { id: 'ws-mys-2', stepName: 'Work Permit Application', description: 'Your complete permit file is filed with the relevant work permit authority.', sortOrder: 2, estimatedDays: 25, clientInstructions: 'Your application has been submitted and is now under authority review.' }, { id: 'ws-mys-3', stepName: 'Offer Letter Verification and Employment Agreement', description: 'We validate the employer offer letter and register the signed employment contract.', sortOrder: 3, estimatedDays: 10, clientInstructions: 'Please share the signed offer letter and employment contract for verification.' }, { id: 'ws-mys-4', stepName: 'Document Attestation', description: 'Required documents are attested and certified by the responsible ministry.', sortOrder: 4, estimatedDays: 2, clientInstructions: 'Your documents are being attested by the relevant ministry.' }, { id: 'ws-mys-5', stepName: 'Visa Processing', description: 'Your visa file is under consular processing with the supporting documents.', sortOrder: 5, estimatedDays: 30, clientInstructions: 'Your file is with the consular desk for processing. No action is required from you.' }, { id: 'ws-mys-6', stepName: 'Embassy Appointment and Interview', description: 'You attend the embassy appointment and complete the visa interview.', sortOrder: 6, estimatedDays: 5, clientInstructions: 'Please attend your embassy appointment on the scheduled date and carry all original documents.' }, { id: 'ws-mys-7', stepName: 'BMET Registration and Training', description: 'BMET smart card registration, PLKS endorsement and mandatory worker training.', sortOrder: 7, estimatedDays: 15, clientInstructions: 'Your BMET registration and mandatory training are being arranged for you.' }, { id: 'ws-mys-8', stepName: 'Manpower Clearance and Pre-departure Preparation', description: 'Manpower clearance, flight booking and pre-departure travel briefing.', sortOrder: 8, estimatedDays: 10, clientInstructions: 'Your manpower clearance is approved. Travel arrangements are being finalised.' }, { id: 'ws-mys-9', stepName: 'Coordination, Additional Verification, and Contingency Buffer', description: 'Continuous case coordination, follow-up checks and a reserved buffer for external delays.', sortOrder: 9, estimatedDays: 21, clientInstructions: 'We are coordinating the remaining checks with the authorities and will keep you updated.' }] },
      { id: 'wf-cyp-wp', name: 'Cyprus Work Permit Procedure', description: 'Professional 9-step Work Permit Visa workflow for Cyprus - 120 days (approx. 4 months) from document preparation to pre-departure clearance.', countryId: 'country-cyp', visaCategoryId: 'cat-cyp-wp', isActive: true, steps: [{ id: 'ws-cyp-1', stepName: 'Document Preparation and Verification', description: 'We collect and verify your passport, photographs and supporting documents.', sortOrder: 1, estimatedDays: 2, clientInstructions: 'Please submit your passport, recent photographs and all supporting documents for verification.' }, { id: 'ws-cyp-2', stepName: 'Work Permit Application', description: 'Your complete permit file is filed with the relevant work permit authority.', sortOrder: 2, estimatedDays: 25, clientInstructions: 'Your application has been submitted and is now under authority review.' }, { id: 'ws-cyp-3', stepName: 'Offer Letter Verification and Employment Agreement', description: 'We validate the employer offer letter and register the signed employment contract.', sortOrder: 3, estimatedDays: 10, clientInstructions: 'Please share the signed offer letter and employment contract for verification.' }, { id: 'ws-cyp-4', stepName: 'Document Attestation', description: 'Required documents are attested and certified by the responsible ministry.', sortOrder: 4, estimatedDays: 2, clientInstructions: 'Your documents are being attested by the relevant ministry.' }, { id: 'ws-cyp-5', stepName: 'Visa Processing', description: 'Your visa file is under consular processing with the supporting documents.', sortOrder: 5, estimatedDays: 30, clientInstructions: 'Your file is with the consular desk for processing. No action is required from you.' }, { id: 'ws-cyp-6', stepName: 'Embassy Appointment and Interview', description: 'You attend the embassy appointment and complete the visa interview.', sortOrder: 6, estimatedDays: 5, clientInstructions: 'Please attend your embassy appointment on the scheduled date and carry all original documents.' }, { id: 'ws-cyp-7', stepName: 'BMET Registration and Training', description: 'Workforce registration, permit endorsement and mandatory worker training.', sortOrder: 7, estimatedDays: 15, clientInstructions: 'Your workforce registration and mandatory training are being arranged for you.' }, { id: 'ws-cyp-8', stepName: 'Manpower Clearance and Pre-departure Preparation', description: 'Employment clearance, flight booking and pre-departure travel briefing.', sortOrder: 8, estimatedDays: 10, clientInstructions: 'Your employment clearance is approved. Travel arrangements are being finalised.' }, { id: 'ws-cyp-9', stepName: 'Coordination, Additional Verification, and Contingency Buffer', description: 'Continuous case coordination, follow-up checks and a reserved buffer for external delays.', sortOrder: 9, estimatedDays: 21, clientInstructions: 'We are coordinating the remaining checks with the authorities and will keep you updated.' }] },
      { id: 'wf-blr-wp', name: 'Belarus Work Permit Procedure', description: 'Official 6-stage workflow for Belarusian work permit and consular employment visa.', countryId: 'country-blr', visaCategoryId: 'cat-blr-wp', isActive: true, steps: [{ id: 'ws-blr-1', stepName: 'Document Translation & Notarization', description: 'Russian translation and authorized notary authentication.', sortOrder: 1, estimatedDays: 3, clientInstructions: 'Civil documents translated into Russian and notarized.' }, { id: 'ws-blr-2', stepName: 'Citizenship & Migration Department Application', description: 'Lodged with regional Department of Citizenship and Migration in Belarus.', sortOrder: 2, estimatedDays: 21, clientInstructions: 'Application pending assessment with Department of Citizenship and Migration.' }, { id: 'ws-blr-3', stepName: 'Official Work Invitation Letter Issued', description: 'Issuance of official state invitation from Belarusian migration authorities.', sortOrder: 3, estimatedDays: 7, clientInstructions: 'Official invitation letter received from Belarus employer and government.' }, { id: 'ws-blr-4', stepName: 'Consular Visa Application Submission', description: 'Submission of application to Embassy of the Republic of Belarus.', sortOrder: 4, estimatedDays: 10, clientInstructions: 'Original invitation and medical certificate submitted for visa stamping.' }, { id: 'ws-blr-5', stepName: 'Visa Stamping & Mandatory Medical Insurance', description: 'Employment visa issued in passport with Belarus state insurance.', sortOrder: 5, estimatedDays: 5, clientInstructions: 'Visa successfully stamped in passport with mandatory travel insurance.' }, { id: 'ws-blr-6', stepName: 'Flight Handover & Employer Reception Protocol', description: 'Ticket booking and destination airport employer reception arrangement.', sortOrder: 6, estimatedDays: 3, clientInstructions: 'Flight handover completed. Airport reception protocol verified.' }] },
      { id: 'wf-bih-wp', name: 'Bosnia Work Permit Procedure', description: 'Professional 9-step Work Permit Visa workflow for Bosnia and Herzegovina - 120 days (approx. 4 months) from document preparation to pre-departure clearance.', countryId: 'country-bih', visaCategoryId: 'cat-bih-wp', isActive: true, steps: [
        { id: 'ws-bih-1', stepName: 'Document Preparation and Verification', description: 'We collect and verify your passport, photographs and supporting documents.', sortOrder: 1, estimatedDays: 2, clientInstructions: 'Please submit your passport, recent photographs and all supporting documents for verification.' },
        { id: 'ws-bih-2', stepName: 'Work Permit Application', description: 'Your complete permit file is filed with the relevant work permit authority.', sortOrder: 2, estimatedDays: 25, clientInstructions: 'Your application has been submitted and is now under authority review.' },
        { id: 'ws-bih-3', stepName: 'Offer Letter Verification and Employment Agreement', description: 'We validate the employer offer letter and register the signed employment contract.', sortOrder: 3, estimatedDays: 10, clientInstructions: 'Please share the signed offer letter and employment contract for verification.' },
        { id: 'ws-bih-4', stepName: 'Document Attestation', description: 'Required documents are attested and certified by the responsible ministry.', sortOrder: 4, estimatedDays: 2, clientInstructions: 'Your documents are being attested by the relevant ministry.' },
        { id: 'ws-bih-5', stepName: 'Visa Processing', description: 'Your visa file is under consular processing with the supporting documents.', sortOrder: 5, estimatedDays: 30, clientInstructions: 'Your file is with the consular desk for processing. No action is required from you.' },
        { id: 'ws-bih-6', stepName: 'Embassy Appointment and Interview', description: 'You attend the embassy appointment and complete the visa interview.', sortOrder: 6, estimatedDays: 5, clientInstructions: 'Please attend your embassy appointment on the scheduled date and carry all original documents.' },
        { id: 'ws-bih-7', stepName: 'BMET Registration and Training', description: 'Workforce registration, permit endorsement and mandatory worker training.', sortOrder: 7, estimatedDays: 15, clientInstructions: 'Your workforce registration and mandatory training are being arranged for you.' },
        { id: 'ws-bih-8', stepName: 'Manpower Clearance and Pre-departure Preparation', description: 'Employment clearance, flight booking and pre-departure travel briefing.', sortOrder: 8, estimatedDays: 10, clientInstructions: 'Your employment clearance is approved. Travel arrangements are being finalised.' },
        { id: 'ws-bih-9', stepName: 'Coordination, Additional Verification, and Contingency Buffer', description: 'Continuous case coordination, follow-up checks and a reserved buffer for external delays.', sortOrder: 9, estimatedDays: 21, clientInstructions: 'We are coordinating the remaining checks with the authorities and will keep you updated.' }
      ]},
      { id: 'wf-srb-wp', name: 'Serbia Work Permit Procedure', description: 'Professional 9-step Work Permit Visa workflow for Serbia - 120 days (approx. 4 months) from document preparation to pre-departure clearance.', countryId: 'country-srb', visaCategoryId: 'cat-srb-wp', isActive: true, steps: [{ id: 'ws-srb-1', stepName: 'Document Preparation and Verification', description: 'We collect and verify your passport, photographs and supporting documents.', sortOrder: 1, estimatedDays: 2, clientInstructions: 'Please submit your passport, recent photographs and all supporting documents for verification.' }, { id: 'ws-srb-2', stepName: 'Work Permit Application', description: 'Your complete permit file is filed with the relevant work permit authority.', sortOrder: 2, estimatedDays: 25, clientInstructions: 'Your application has been submitted and is now under authority review.' }, { id: 'ws-srb-3', stepName: 'Offer Letter Verification and Employment Agreement', description: 'We validate the employer offer letter and register the signed employment contract.', sortOrder: 3, estimatedDays: 10, clientInstructions: 'Please share the signed offer letter and employment contract for verification.' }, { id: 'ws-srb-4', stepName: 'Document Attestation', description: 'Required documents are attested and certified by the responsible ministry.', sortOrder: 4, estimatedDays: 2, clientInstructions: 'Your documents are being attested by the relevant ministry.' }, { id: 'ws-srb-5', stepName: 'Visa Processing', description: 'Your visa file is under consular processing with the supporting documents.', sortOrder: 5, estimatedDays: 30, clientInstructions: 'Your file is with the consular desk for processing. No action is required from you.' }, { id: 'ws-srb-6', stepName: 'Embassy Appointment and Interview', description: 'You attend the embassy appointment and complete the visa interview.', sortOrder: 6, estimatedDays: 5, clientInstructions: 'Please attend your embassy appointment on the scheduled date and carry all original documents.' }, { id: 'ws-srb-7', stepName: 'BMET Registration and Training', description: 'Workforce registration, permit endorsement and mandatory worker training.', sortOrder: 7, estimatedDays: 15, clientInstructions: 'Your workforce registration and mandatory training are being arranged for you.' }, { id: 'ws-srb-8', stepName: 'Manpower Clearance and Pre-departure Preparation', description: 'Employment clearance, flight booking and pre-departure travel briefing.', sortOrder: 8, estimatedDays: 10, clientInstructions: 'Your employment clearance is approved. Travel arrangements are being finalised.' }, { id: 'ws-srb-9', stepName: 'Coordination, Additional Verification, and Contingency Buffer', description: 'Continuous case coordination, follow-up checks and a reserved buffer for external delays.', sortOrder: 9, estimatedDays: 21, clientInstructions: 'We are coordinating the remaining checks with the authorities and will keep you updated.' }] },
      { id: 'wf-mkd-wp', name: 'North Macedonia Work Permit Procedure', description: 'Professional 9-step Work Permit Visa workflow for North Macedonia - 120 days (approx. 4 months) from document preparation to pre-departure clearance.', countryId: 'country-mkd', visaCategoryId: 'cat-mkd-wp', isActive: true, steps: [{ id: 'ws-mkd-1', stepName: 'Document Preparation and Verification', description: 'We collect and verify your passport, photographs and supporting documents.', sortOrder: 1, estimatedDays: 2, clientInstructions: 'Please submit your passport, recent photographs and all supporting documents for verification.' }, { id: 'ws-mkd-2', stepName: 'Work Permit Application', description: 'Your complete permit file is filed with the relevant work permit authority.', sortOrder: 2, estimatedDays: 25, clientInstructions: 'Your application has been submitted and is now under authority review.' }, { id: 'ws-mkd-3', stepName: 'Offer Letter Verification and Employment Agreement', description: 'We validate the employer offer letter and register the signed employment contract.', sortOrder: 3, estimatedDays: 10, clientInstructions: 'Please share the signed offer letter and employment contract for verification.' }, { id: 'ws-mkd-4', stepName: 'Document Attestation', description: 'Required documents are attested and certified by the responsible ministry.', sortOrder: 4, estimatedDays: 2, clientInstructions: 'Your documents are being attested by the relevant ministry.' }, { id: 'ws-mkd-5', stepName: 'Visa Processing', description: 'Your visa file is under consular processing with the supporting documents.', sortOrder: 5, estimatedDays: 30, clientInstructions: 'Your file is with the consular desk for processing. No action is required from you.' }, { id: 'ws-mkd-6', stepName: 'Embassy Appointment and Interview', description: 'You attend the embassy appointment and complete the visa interview.', sortOrder: 6, estimatedDays: 5, clientInstructions: 'Please attend your embassy appointment on the scheduled date and carry all original documents.' }, { id: 'ws-mkd-7', stepName: 'BMET Registration and Training', description: 'Workforce registration, permit endorsement and mandatory worker training.', sortOrder: 7, estimatedDays: 15, clientInstructions: 'Your workforce registration and mandatory training are being arranged for you.' }, { id: 'ws-mkd-8', stepName: 'Manpower Clearance and Pre-departure Preparation', description: 'Employment clearance, flight booking and pre-departure travel briefing.', sortOrder: 8, estimatedDays: 10, clientInstructions: 'Your employment clearance is approved. Travel arrangements are being finalised.' }, { id: 'ws-mkd-9', stepName: 'Coordination, Additional Verification, and Contingency Buffer', description: 'Continuous case coordination, follow-up checks and a reserved buffer for external delays.', sortOrder: 9, estimatedDays: 21, clientInstructions: 'We are coordinating the remaining checks with the authorities and will keep you updated.' }] },
      { id: 'wf-std-visa', name: 'Student Visa Global Workflow', description: 'Standard 6-step workflow for international higher education and student visas.', countryId: null, visaCategoryId: null, isActive: true, steps: [{ id: 'ws-std-1', stepName: 'Academic Profile Assessment & University Application', description: 'Evaluation of academic transcripts, IELTS/TOEFL and course selection.', sortOrder: 1, estimatedDays: 10, clientInstructions: 'Academic credentials evaluated. Submitting admission application.' }, { id: 'ws-std-2', stepName: 'Offer Letter & Acceptance Received', description: 'Conditional/Unconditional offer letter issued by university.', sortOrder: 2, estimatedDays: 14, clientInstructions: 'University offer letter received. Please review your enrollment terms.' }, { id: 'ws-std-3', stepName: 'Tuition Fee Deposit & Financial Solvency Verification', description: 'Tuition payment receipt and bank solvency documentation audit.', sortOrder: 3, estimatedDays: 7, clientInstructions: 'Tuition deposit confirmed and bank solvency documents audited.' }, { id: 'ws-std-4', stepName: 'Embassy Appointment & Biometrics Submission', description: 'Visa interview / CAS or I-20 documentation and biometric appointment.', sortOrder: 4, estimatedDays: 5, clientInstructions: 'Attend your scheduled biometric appointment at the consular visa centre.' }, { id: 'ws-std-5', stepName: 'Visa Decision & Passport Collection', description: 'Immigration officer decision and visa issuance.', sortOrder: 5, estimatedDays: 15, clientInstructions: 'Your student visa decision has been finalized. Passport ready for collection.' }, { id: 'ws-std-6', stepName: 'Pre-Departure Orientation & Air Ticket Booking', description: 'Accommodation guidance and student travel briefing.', sortOrder: 6, estimatedDays: 3, clientInstructions: 'Pre-departure orientation completed and campus arrival arrangements confirmed.' }] },
      { id: 'wf-tourist-visa', name: 'Tourist Visa Express Workflow', description: '5-step procedural pipeline for leisure, visitor and tourist visa applications.', countryId: null, visaCategoryId: null, isActive: true, steps: [{ id: 'ws-tr-1', stepName: 'Travel Itinerary & Document Collection', description: 'Flight booking reservation, hotel voucher, and tour itinerary.', sortOrder: 1, estimatedDays: 3, clientInstructions: 'Travel itinerary and accommodation vouchers prepared.' }, { id: 'ws-tr-2', stepName: 'Bank Solvency & Financial Verification', description: '6-month bank statement audit and solvency certification.', sortOrder: 2, estimatedDays: 4, clientInstructions: 'Financial statements and employment NOC verified.' }, { id: 'ws-tr-3', stepName: 'Embassy Appointment & Biometrics Submission', description: 'Lodge visa application and biometrics enrollment at visa application center.', sortOrder: 3, estimatedDays: 5, clientInstructions: 'Biometrics submitted at visa centre. Case in processing.' }, { id: 'ws-tr-4', stepName: 'Consular File Processing', description: 'Foreign ministry consular officer assessment and background review.', sortOrder: 4, estimatedDays: 10, clientInstructions: 'Application actively under review with embassy consular officers.' }, { id: 'ws-tr-5', stepName: 'Visa Stamping & Passport Return', description: 'Visa stamped on passport and secure return to client.', sortOrder: 5, estimatedDays: 3, clientInstructions: 'Visa sticker issued. Your passport is ready for secure pickup.' }] },
    ];

    console.log(`[DataStore] Static catalog seeded: ${this.countries.length} countries, ${this.visaPrograms.length} programs, ${this.workflowTemplates.length} templates.`);
  }

  public loadFromDisk() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const data = JSON.parse(raw);

        // For transactional data: SMART MERGE (seed baseline records preserved, disk updates & admin-created additions merged)
        if (data.users && Array.isArray(data.users) && data.users.length > 0) {
          const diskUserMap = new Map<string, any>(data.users.map((u: any) => [u.id, u]));
          this.users = this.users.map((u) => diskUserMap.get(u.id) || u);
          const currentIds = new Set(this.users.map((u) => u.id));
          for (const u of data.users) {
            if (!currentIds.has(u.id)) this.users.push(u);
          }
        }

        if (data.clients && Array.isArray(data.clients) && data.clients.length > 0) {
          const diskClientMap = new Map<string, any>(data.clients.map((c: any) => [c.id, c]));
          this.clients = this.clients.map((c) => diskClientMap.get(c.id) || c);
          const currentIds = new Set(this.clients.map((c) => c.id));
          for (const c of data.clients) {
            if (!currentIds.has(c.id)) this.clients.push(c);
          }
        }

        if (data.staff && Array.isArray(data.staff) && data.staff.length > 0) {
          const diskStaffMap = new Map<string, any>(data.staff.map((s: any) => [s.id, s]));
          this.staff = this.staff.map((s) => diskStaffMap.get(s.id) || s);
          const currentIds = new Set(this.staff.map((s) => s.id));
          for (const s of data.staff) {
            if (!currentIds.has(s.id)) this.staff.push(s);
          }
        }

        if (data.applications && Array.isArray(data.applications) && data.applications.length > 0) {
          const diskAppMap = new Map<string, any>(data.applications.map((a: any) => [a.id, a]));
          this.applications = this.applications.map((a) => diskAppMap.get(a.id) || a);
          const currentIds = new Set(this.applications.map((a) => a.id));
          for (const a of data.applications) {
            if (!currentIds.has(a.id)) this.applications.push(a);
          }
        }

        if (data.applicationSteps && Array.isArray(data.applicationSteps) && data.applicationSteps.length > 0) {
          const diskMap = new Map<string, any>(data.applicationSteps.map((s: any) => [s.id, s]));
          this.applicationSteps = this.applicationSteps.map((s) => diskMap.get(s.id) || s);
          const currentIds = new Set(this.applicationSteps.map((s) => s.id));
          for (const s of data.applicationSteps) {
            if (!currentIds.has(s.id)) this.applicationSteps.push(s);
          }
        }

        if (data.documents && Array.isArray(data.documents) && data.documents.length > 0) {
          const diskMap = new Map<string, any>(data.documents.map((d: any) => [d.id, d]));
          this.documents = this.documents.map((d) => diskMap.get(d.id) || d);
          const currentIds = new Set(this.documents.map((d) => d.id));
          for (const d of data.documents) {
            if (!currentIds.has(d.id)) this.documents.push(d);
          }
        }

        if (data.payments && Array.isArray(data.payments) && data.payments.length > 0) {
          const diskMap = new Map<string, any>(data.payments.map((p: any) => [p.id, p]));
          this.payments = this.payments.map((p) => diskMap.get(p.id) || p);
          const currentIds = new Set(this.payments.map((p) => p.id));
          for (const p of data.payments) {
            if (!currentIds.has(p.id)) this.payments.push(p);
          }
        }

        if (data.visaCategories && Array.isArray(data.visaCategories) && data.visaCategories.length > 0) {
          const diskMap = new Map<string, any>(data.visaCategories.map((c: any) => [c.id, c]));
          this.visaCategories = this.visaCategories.map((c) => diskMap.get(c.id) || c);
          const currentIds = new Set(this.visaCategories.map((c) => c.id));
          for (const c of data.visaCategories) {
            if (!currentIds.has(c.id)) this.visaCategories.push(c);
          }
        }

        if (data.stepHistory && Array.isArray(data.stepHistory)) this.stepHistory = data.stepHistory;
        if (data.bookings && Array.isArray(data.bookings)) this.bookings = data.bookings;
        if (data.auditLogs && Array.isArray(data.auditLogs)) this.auditLogs = data.auditLogs;

        // Catalog data: Persisted disk storage is source of truth (preserves deletions, additions, edits)
        if (data.countries && Array.isArray(data.countries) && data.countries.length > 0) {
          this.countries = data.countries;
        }

        if (data.visaPrograms && Array.isArray(data.visaPrograms) && data.visaPrograms.length > 0) {
          this.visaPrograms = data.visaPrograms;
        }

        if (data.workflowTemplates && Array.isArray(data.workflowTemplates) && data.workflowTemplates.length > 0) {
          this.workflowTemplates = data.workflowTemplates;
        }

        console.log(`[DataStore] Successfully loaded persistent database from disk. (${this.clients.length} clients, ${this.countries.length} countries, ${this.workflowTemplates.length} templates loaded)`);
      }
    } catch (err) {
      console.warn('[DataStore] Could not load persisted data from disk, using seed data:', err);
    }
  }

  async checkPostgres() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      this.isPostgresConnected = true;
      console.log('PostgreSQL connection established.');
    } catch {
      this.isPostgresConnected = false;
      console.log('PostgreSQL not running locally. Utilizing resilient embedded data store.');
    }
  }

  public get isPostgres(): boolean {
    return this.isPostgresConnected;
  }

  /**
   * Synchronously seed all baseline operational records (default users, staff profiles, clients, demo application).
   * Ensures essential system accounts and default demo records always exist without any async race condition.
   */
  public seedBaselineData() {
    // Roles
    this.roles = [
      { id: 'role-admin', name: RoleName.ADMIN, description: 'System Administrator' },
      { id: 'role-staff', name: RoleName.STAFF, description: 'Operations Staff' },
      { id: 'role-client', name: RoleName.CLIENT, description: 'Client Read-only' },
    ];

    // Precomputed bcrypt hashes for synchronous zero-delay startup
    // Mehedi@TVG
    const adminHash = '$2a$10$qwGh9pkksb.CmE.myDG.9Orju2Xj7uVxLASStwU1Rf4N.H78KSOF6';
    // AdminSecureGate2026!
    const legacyAdminHash = '$2a$10$aZk7jNwT.wW/sC1CanpW2ek.Eah/ES6H.zC.4IBepXlG2.mAO02g6';
    // StaffGate2026!
    const staffHash = '$2a$10$5ArF4FeJyyJkhmSTRPqA5eqG9tg4xsio7pMsjK/lPU4WxBwqsyK6m';
    // ClientPass2026!
    const clientHash = '$2a$10$fhKVuxav/DADYQ5CyV8v8usRTo/ulBbs6qrLO.PCuMMuwkbENSZdy';

    // Users
    this.users = [
      {
        id: 'usr-admin-1',
        identifier: 'MEHEDIHASAN110577@GMAIL.COM',
        email: 'mehedihasan110577@gmail.com',
        passwordHash: adminHash,
        roleId: 'role-admin',
        role: RoleName.ADMIN,
        isActive: true,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'usr-admin-legacy',
        identifier: 'ADMIN@THEVISAGATE.COM',
        email: 'admin@thevisagate.com',
        passwordHash: legacyAdminHash,
        roleId: 'role-admin',
        role: RoleName.ADMIN,
        isActive: true,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'usr-staff-1',
        identifier: 'STAFF@THEVISAGATE.COM',
        email: 'staff@thevisagate.com',
        passwordHash: staffHash,
        roleId: 'role-staff',
        role: RoleName.STAFF,
        isActive: true,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'usr-client-1',
        identifier: 'A12345678', // Passport number as username
        email: 'client.demo@example.com',
        passwordHash: clientHash,
        roleId: 'role-client',
        role: RoleName.CLIENT,
        isActive: true,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'usr-client-2',
        identifier: 'A17332519', // Registered client passport
        email: 'ariful.client@example.com',
        passwordHash: clientHash,
        roleId: 'role-client',
        role: RoleName.CLIENT,
        isActive: true,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Staff Profile
    this.staff = [
      {
        id: 'stf-1',
        userId: 'usr-staff-1',
        employeeId: 'EMP-001',
        fullName: 'Tanvir Hossain',
        designation: 'Senior Visa Processing Officer',
        phone: '+8801700112233',
        email: 'staff@thevisagate.com',
        permissions: ['clients:view', 'clients:create', 'clients:edit', 'applications:view', 'applications:create', 'applications:edit', 'steps:update', 'documents:view', 'documents:upload', 'documents:verify'],
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'stf-2',
        userId: 'usr-admin-1',
        employeeId: 'MEHEDI02',
        fullName: 'Mehedi Hasan',
        designation: 'Manager',
        phone: '01997518124',
        email: 'mehedihasan110577@gmail.com',
        permissions: ['clients:view', 'clients:create', 'clients:edit', 'clients:delete', 'applications:view', 'applications:create', 'applications:edit', 'applications:assign', 'applications:delete', 'workflows:manage', 'steps:update', 'documents:view', 'documents:upload', 'documents:verify', 'documents:download', 'payments:create', 'payments:reverse', 'staff:manage', 'reports:view', 'audit:view', 'settings:manage'],
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Client Profile
    const rawNid1 = '19951234567890123';
    const rawPassport1 = 'A12345678';
    const rawNid2 = '5114413775';
    const rawPassport2 = 'A17332519';

    this.clients = [
      {
        id: 'cli-1',
        userId: 'usr-client-1',
        clientCode: 'TVG-CL-1001',
        fullName: 'Mohammad Rafiqul Islam',
        dateOfBirth: '1995-05-15',
        nidEncrypted: encryptSensitiveData(rawNid1),
        nidMasked: maskSensitiveIdentifier(rawNid1),
        passportEncrypted: encryptSensitiveData(rawPassport1),
        passportMasked: maskSensitiveIdentifier(rawPassport1),
        phone: '+8801812345678',
        email: 'client.demo@example.com',
        address: 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300',
        emergencyContact: 'Brother: +8801711223344',
        referredByStaffId: 'stf-1',
        assignedProcessingStaffId: 'stf-1',
        clientSource: 'DIRECT_WALK_IN',
        referralDate: '2026-01-10',
        referralNotes: 'Walk-in client interested in Malaysia construction calling visa.',
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'cli-2',
        userId: 'usr-client-2',
        clientCode: 'TVG-CL-1002',
        fullName: 'MD ARIFUL ISLAM',
        dateOfBirth: '1996-08-20',
        nidEncrypted: encryptSensitiveData(rawNid2),
        nidMasked: maskSensitiveIdentifier(rawNid2),
        passportEncrypted: encryptSensitiveData(rawPassport2),
        passportMasked: maskSensitiveIdentifier(rawPassport2),
        phone: '01966784927',
        email: 'ariful.client@example.com',
        address: 'Dhaka, Bangladesh',
        avatarUrl: null,
        emergencyContact: 'Family: 01700000000',
        referredByStaffId: 'stf-2',
        assignedProcessingStaffId: 'stf-2',
        clientSource: 'DIRECT_WALK_IN',
        referralDate: '2026-11-15',
        referralNotes: 'Client registered for Bosnia Work Permit program.',
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Initial Sample Application
    this.applications = [
      {
        id: 'app-1',
        applicationCode: 'TVG-2026-0001',
        clientId: 'cli-1',
        countryId: 'country-mys',
        visaCategoryId: 'cat-mys-wp',
        status: ApplicationStatus.ACTIVE,
        applicationDate: new Date().toISOString().split('T')[0],
        internalNotes: 'Applicant has completed preliminary interview. Priority handling.',
        createdById: 'usr-admin-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedStaffIds: ['stf-1'],
      },
    ];

    // Application Steps for app-1
    this.applicationSteps = [
      {
        id: 'as-1',
        applicationId: 'app-1',
        stepName: 'Client Registration & File Opening',
        description: 'Initial file opening and identification verification',
        sortOrder: 1,
        status: StepStatus.COMPLETED,
        scheduledDate: '2026-11-01',
        deadline: '2026-11-03',
        completedDate: '2026-11-02',
        assignedStaffId: 'stf-1',
        assignedStaffName: 'Tanvir Hossain',
        clientInstructions: 'Your initial file has been opened and confirmed.',
        internalNotes: 'Client verified in person.',
        isPublishedToClient: true,
        completedById: 'usr-admin-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'as-2',
        applicationId: 'app-1',
        stepName: 'Document Verification & Attestation',
        description: 'Attestation of police clearance and academic papers',
        sortOrder: 2,
        status: StepStatus.COMPLETED,
        scheduledDate: '2026-11-03',
        deadline: '2026-11-08',
        completedDate: '2026-11-07',
        assignedStaffId: 'stf-1',
        assignedStaffName: 'Tanvir Hossain',
        clientInstructions: 'Police clearance and educational certificates verified and attested.',
        internalNotes: 'All paperwork received in good order.',
        isPublishedToClient: true,
        completedById: 'usr-staff-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'as-3',
        applicationId: 'app-1',
        stepName: 'Medical Examination (GAMCA/FOMEMA)',
        description: 'Screening at authorized medical center',
        sortOrder: 3,
        status: StepStatus.IN_PROGRESS,
        scheduledDate: '2026-11-15',
        deadline: '2026-11-18',
        completedDate: null,
        assignedStaffId: 'stf-1',
        assignedStaffName: 'Tanvir Hossain',
        clientInstructions: 'Please report to Medinova Diagnostic Center, Dhanmondi Branch on Nov 15 at 09:30 AM with your original passport and 4 lab photos.',
        internalNotes: 'Token generated for medical center.',
        isPublishedToClient: true,
        completedById: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'as-4',
        applicationId: 'app-1',
        stepName: 'Calling Visa Submission to Immigration',
        description: 'Submission to Malaysian Immigration Department',
        sortOrder: 4,
        status: StepStatus.NOT_STARTED,
        scheduledDate: '2026-11-20',
        deadline: '2026-12-15',
        completedDate: null,
        assignedStaffId: 'stf-1',
        assignedStaffName: 'Tanvir Hossain',
        clientInstructions: 'File will be transmitted to Malaysian Immigration for Calling Visa issuance.',
        internalNotes: null,
        isPublishedToClient: true,
        completedById: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'as-5',
        applicationId: 'app-1',
        stepName: 'Calling Visa Approval Received',
        description: 'Receipt of official Malaysian VDR approval',
        sortOrder: 5,
        status: StepStatus.NOT_STARTED,
        scheduledDate: null,
        deadline: null,
        completedDate: null,
        assignedStaffId: null,
        clientInstructions: 'Awaiting immigration authority approval.',
        internalNotes: null,
        isPublishedToClient: true,
        completedById: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'as-6',
        applicationId: 'app-1',
        stepName: 'High Commission Visa Stamping (VFS)',
        description: 'Submission to Malaysian High Commission for single-entry stamp',
        sortOrder: 6,
        status: StepStatus.NOT_STARTED,
        scheduledDate: null,
        deadline: null,
        completedDate: null,
        assignedStaffId: null,
        clientInstructions: 'Embassy submission will take place upon calling visa clearance.',
        internalNotes: null,
        isPublishedToClient: true,
        completedById: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'as-7',
        applicationId: 'app-1',
        stepName: 'BMET Smart Card Clearance & Flight Handover',
        description: 'Ministry BMET clearance card and flight booking',
        sortOrder: 7,
        status: StepStatus.NOT_STARTED,
        scheduledDate: null,
        deadline: null,
        completedDate: null,
        assignedStaffId: null,
        clientInstructions: 'Final briefing, BMET card delivery and ticket handover.',
        internalNotes: null,
        isPublishedToClient: true,
        completedById: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Documents for app-1
    this.documents = [
      {
        id: 'doc-1',
        applicationId: 'app-1',
        clientId: 'cli-1',
        documentTypeId: 'dt-1',
        documentTypeName: 'Passport Copy',
        fileName: 'passport_bio.pdf',
        originalName: 'Mohammad_Rafiqul_Passport.pdf',
        storagePath: 'mock_passport_bio.pdf',
        fileSize: 1420500,
        mimeType: 'application/pdf',
        status: DocumentStatus.VERIFIED,
        verificationNotes: 'Passport valid until 2031, pages clear.',
        internalNotes: 'Original verified at Dhaka Mirpur office.',
        verifiedById: 'usr-admin-1',
        verifiedAt: new Date('2026-11-03'),
        uploadedById: 'usr-admin-1',
        createdAt: new Date('2026-11-02'),
        updatedAt: new Date('2026-11-03'),
      },
      {
        id: 'doc-2',
        applicationId: 'app-1',
        clientId: 'cli-1',
        documentTypeId: 'dt-2',
        documentTypeName: 'NID Copy',
        fileName: 'nid_copy.pdf',
        originalName: 'Rafiqul_NID_SmartCard.pdf',
        storagePath: 'mock_nid_copy.pdf',
        fileSize: 890400,
        mimeType: 'application/pdf',
        status: DocumentStatus.VERIFIED,
        verificationNotes: 'Smart card verified against Election Commission server.',
        internalNotes: 'Checked against government database.',
        verifiedById: 'usr-staff-1',
        verifiedAt: new Date('2026-11-04'),
        uploadedById: 'usr-staff-1',
        createdAt: new Date('2026-11-02'),
        updatedAt: new Date('2026-11-04'),
      },
      {
        id: 'doc-3',
        applicationId: 'app-1',
        clientId: 'cli-1',
        documentTypeId: 'dt-3',
        documentTypeName: 'Photograph',
        fileName: 'photo_studio.jpg',
        originalName: 'Rafiqul_Studio_Photo.jpg',
        storagePath: 'mock_photo_studio.jpg',
        fileSize: 345000,
        mimeType: 'image/jpeg',
        status: DocumentStatus.VERIFIED,
        verificationNotes: 'White background, specifications match High Commission requirements.',
        internalNotes: 'Studio physical copy kept in locker.',
        verifiedById: 'usr-staff-1',
        verifiedAt: new Date('2026-11-05'),
        uploadedById: 'usr-staff-1',
        createdAt: new Date('2026-11-02'),
        updatedAt: new Date('2026-11-05'),
      },
      {
        id: 'doc-4',
        applicationId: 'app-1',
        clientId: 'cli-1',
        documentTypeId: 'dt-7',
        documentTypeName: 'Police Clearance',
        fileName: 'police_clearance.pdf',
        originalName: 'Police_Clearance_Dhaka.pdf',
        storagePath: 'mock_police_clearance.pdf',
        fileSize: 1120000,
        mimeType: 'application/pdf',
        status: DocumentStatus.VERIFIED,
        verificationNotes: 'Verified via QR code with Bangladesh Police database.',
        internalNotes: 'Digital QR validation passed.',
        verifiedById: 'usr-staff-1',
        verifiedAt: new Date('2026-11-07'),
        uploadedById: 'usr-staff-1',
        createdAt: new Date('2026-11-06'),
        updatedAt: new Date('2026-11-07'),
      },
      {
        id: 'doc-5',
        applicationId: 'app-1',
        clientId: 'cli-1',
        documentTypeId: 'dt-6',
        documentTypeName: 'Medical Report',
        fileName: 'medical_report.pdf',
        originalName: 'GAMCA_Fitness_Report.pdf',
        storagePath: 'mock_medical_report.pdf',
        fileSize: 1850000,
        mimeType: 'application/pdf',
        status: DocumentStatus.UNDER_REVIEW,
        verificationNotes: 'Awaiting lab blood diagnostic confirmation from accredited center.',
        internalNotes: 'Client visited Green Crescent medical center yesterday.',
        verifiedById: null,
        verifiedAt: null,
        uploadedById: 'usr-staff-1',
        createdAt: new Date('2026-11-07'),
        updatedAt: new Date('2026-11-07'),
      },
      {
        id: 'doc-6',
        applicationId: 'app-1',
        clientId: 'cli-1',
        documentTypeId: 'dt-8',
        documentTypeName: 'Bank Statement',
        fileName: 'bank_statement.pdf',
        originalName: 'Rafiqul_EBL_BankStatement.pdf',
        storagePath: 'mock_bank_statement.pdf',
        fileSize: 2210000,
        mimeType: 'application/pdf',
        status: DocumentStatus.RECEIVED,
        verificationNotes: 'Statement received from Eastern Bank Limited; solvency check pending.',
        internalNotes: 'Needs manager branch verification stamp check.',
        verifiedById: null,
        verifiedAt: null,
        uploadedById: 'usr-staff-1',
        createdAt: new Date('2026-11-08'),
        updatedAt: new Date('2026-11-08'),
      },
    ];

    // Payments
    this.payments = [
      {
        id: 'pay-1',
        receiptNumber: 'TVG-REC-2026-0001',
        applicationId: 'app-1',
        clientId: 'cli-1',
        amount: 50000,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        transactionReference: 'EBL-TRX-893021',
        paymentDate: '2026-11-02',
        status: PaymentStatus.RECEIVED,
        internalNotes: 'First installment / File processing fee received via Eastern Bank Ltd.',
        recordedById: 'usr-admin-1',
        createdAt: new Date('2026-11-02'),
        updatedAt: new Date('2026-11-02'),
        adjustments: [],
      },
    ];

    // Audit Logs
    this.auditLogs = [
      {
        id: 'aud-1',
        userId: 'usr-admin-1',
        userName: 'admin@thevisagate.com',
        userRole: 'ADMIN',
        action: 'CLIENT_CREATED',
        entityType: 'CLIENT',
        entityId: 'cli-1',
        details: { clientCode: 'TVG-CL-1001', fullName: 'Mohammad Rafiqul Islam' },
        ipAddress: '127.0.0.1',
        userAgent: 'Internal System Bootstrap',
        createdAt: new Date('2026-11-01T10:00:00Z'),
      },
      {
        id: 'aud-2',
        userId: 'usr-admin-1',
        userName: 'admin@thevisagate.com',
        userRole: 'ADMIN',
        action: 'APPLICATION_CREATED',
        entityType: 'APPLICATION',
        entityId: 'app-1',
        details: { applicationCode: 'TVG-2026-0001', country: 'Malaysia', visaCategory: 'Work Permit' },
        ipAddress: '127.0.0.1',
        userAgent: 'Internal System Bootstrap',
        createdAt: new Date('2026-11-01T10:15:00Z'),
      },
    ];

    // Notifications
    this.notifications = [
      {
        id: 'notif-1',
        userId: 'usr-client-1',
        title: 'Upcoming Medical Examination',
        message: 'Your medical examination is scheduled for Nov 15, 2026 at Medinova Diagnostic Center.',
        type: 'INFO',
        isRead: false,
        linkUrl: '/client/portal',
        createdAt: new Date(),
      },
      {
        id: 'notif-2',
        userId: 'usr-admin-1',
        title: 'New Client Application Registered',
        message: 'Application TVG-2026-0001 created for Mohammad Rafiqul Islam.',
        type: 'SUCCESS',
        isRead: true,
        linkUrl: '/admin/applications',
        createdAt: new Date(),
      },
    ];
  }

  public async seedInMemory() {
    this.seedBaselineData();
    this.saveToDisk();
  }

  /**
   * Bi-directional synchronization with Firebase Firestore for Offered Countries and Visa Programs
   */
  public async syncWithFirebase() {
    try {
      console.log('[DataStore] Checking Firebase Firestore sync for Offered Countries and Visa Programs...');
      const { FirebaseDatabaseService } = await import('../services/firebase.service');

      // 1. Countries
      const firestoreCountries = await FirebaseDatabaseService.getOfferedCountries();
      if (firestoreCountries && firestoreCountries.length > 0) {
        console.log(`[DataStore] Loaded ${firestoreCountries.length} offered countries from Firestore.`);
        this.countries = firestoreCountries;
      } else {
        console.log(`[DataStore] Firestore countries collection is empty. Seeding ${this.countries.length} baseline countries to Firestore...`);
        for (const c of this.countries) {
          await FirebaseDatabaseService.syncCountry(c);
        }
      }

      // 2. Visa Programs
      const firestorePrograms = await FirebaseDatabaseService.getVisaPrograms();
      if (firestorePrograms && firestorePrograms.length > 0) {
        console.log(`[DataStore] Loaded ${firestorePrograms.length} visa programs from Firestore.`);
        this.visaPrograms = firestorePrograms;
      } else {
        console.log(`[DataStore] Firestore visa_programs collection is empty. Seeding ${this.visaPrograms.length} baseline programs to Firestore...`);
        for (const p of this.visaPrograms) {
          await FirebaseDatabaseService.syncVisaProgram(p);
        }
      }

      this.saveToDisk();
      console.log(`[DataStore] Firebase sync completed. Catalog: ${this.countries.length} countries, ${this.visaPrograms.length} programs.`);
    } catch (err) {
      console.warn('[DataStore] Firebase sync non-blocking fallback (using disk db.json):', err);
    }
  }
}

export const store = new UnifiedDataStore();
