import {
  RoleName,
  ApplicationStatus,
  StepStatus,
  DocumentStatus,
  PaymentMethod,
  PaymentStatus
} from '../constants';

export interface UserSummary {
  id: string;
  email: string | null;
  identifier: string; // Passport number for client, email/username for staff/admin
  role: RoleName;
  name: string;
  avatarUrl?: string | null;
  isActive: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
  clientCode: string;
  fullName: string;
  dateOfBirth: string;
  nidMasked: string;
  passportMasked: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  emergencyContact?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffProfile {
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  designation: string;
  phone: string;
  email: string;
  permissions: string[];
  isActive: boolean;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  flagEmoji?: string;
  isActive: boolean;
  categoriesCount?: number;
}

export interface VisaCategory {
  id: string;
  countryId: string;
  countryName?: string;
  name: string;
  code: string;
  description?: string;
  defaultProcessingDays?: number;
  isActive: boolean;
}

export interface WorkflowTemplateStep {
  id: string;
  stepName: string;
  description?: string;
  sortOrder: number;
  estimatedDays?: number;
  clientInstructions?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  countryId?: string | null;
  visaCategoryId?: string | null;
  steps: WorkflowTemplateStep[];
  isActive: boolean;
  /** Number of processing steps in the template. */
  totalSteps?: number;
  /** Total estimated duration in days (sum of all step estimatedDays). */
  totalDays?: number;
}

export interface ApplicationStep {
  id: string;
  applicationId: string;
  stepName: string;
  description?: string;
  sortOrder: number;
  status: StepStatus;
  scheduledDate?: string | null;
  deadline?: string | null;
  completedDate?: string | null;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
  clientInstructions?: string | null;
  internalNotes?: string | null;
  isPublishedToClient: boolean;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentTypeId: string;
  documentTypeName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  verificationNotes?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  createdAt: string;
}

export interface ApplicationItem {
  id: string;
  applicationCode: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  clientPassportMasked?: string;
  countryId: string;
  countryName: string;
  visaCategoryId: string;
  visaCategoryName: string;
  status: ApplicationStatus;
  applicationDate: string;
  assignedStaff?: { id: string; name: string }[];
  steps?: ApplicationStep[];
  documents?: ApplicationDocument[];
  currentStep?: string;
  nextProcedure?: {
    stepName: string;
    scheduledDate?: string | null;
    deadline?: string | null;
    clientInstructions?: string | null;
    status: StepStatus;
  } | null;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  applicationId: string;
  applicationCode: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string | null;
  paymentDate: string;
  status: PaymentStatus;
  internalNotes?: string | null;
  recordedBy: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code?: string;
    details?: any;
  };
}
