export const BRAND = {
  name: 'THE VISA GATE',
  tagline: 'YOUR JOURNEY. OUR GUIDANCE.',
  colors: {
    primaryNavy: '#102440',
    secondaryNavy: '#172B4D',
    premiumGold: '#D6B66E',
    white: '#FFFFFF',
    background: '#F4F6FA',
    lightGrey: '#E9EDF3',
    successGreen: '#16856A',
    warningAmber: '#D99A30',
    errorRed: '#DC4545'
  }
} as const;

export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT'
}

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export enum StepStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  ON_HOLD = 'ON_HOLD',
  SKIPPED = 'SKIPPED'
}

export enum DocumentStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  RECEIVED = 'RECEIVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  CORRECTION_REQUIRED = 'CORRECTION_REQUIRED',
  RESUBMITTED = 'RESUBMITTED',
  EXPIRED = 'EXPIRED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  REVERSED = 'REVERSED'
}

export const PERMISSIONS = {
  // Clients
  CLIENTS_VIEW: 'clients:view',
  CLIENTS_CREATE: 'clients:create',
  CLIENTS_EDIT: 'clients:edit',
  CLIENTS_DELETE: 'clients:delete',

  // Applications
  APPLICATIONS_VIEW: 'applications:view',
  APPLICATIONS_CREATE: 'applications:create',
  APPLICATIONS_EDIT: 'applications:edit',
  APPLICATIONS_ASSIGN: 'applications:assign',
  APPLICATIONS_DELETE: 'applications:delete',

  // Workflows & Steps
  WORKFLOWS_MANAGE: 'workflows:manage',
  STEPS_UPDATE: 'steps:update',

  // Documents
  DOCUMENTS_VIEW: 'documents:view',
  DOCUMENTS_UPLOAD: 'documents:upload',
  DOCUMENTS_VERIFY: 'documents:verify',
  DOCUMENTS_DOWNLOAD: 'documents:download',

  // Payments
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_CREATE: 'payments:create',
  PAYMENTS_REVERSE: 'payments:reverse',

  // Staff & Administration
  STAFF_MANAGE: 'staff:manage',
  REPORTS_VIEW: 'reports:view',
  AUDIT_VIEW: 'audit:view',
  SETTINGS_MANAGE: 'settings:manage'
} as const;
