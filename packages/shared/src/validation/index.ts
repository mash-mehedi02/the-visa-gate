import { z } from 'zod';
import {
  RoleName,
  ApplicationStatus,
  StepStatus,
  DocumentStatus,
  PaymentMethod,
  PaymentStatus
} from '../constants';

export const LoginSchema = z.object({
  identifier: z.string().min(3, 'Username, Employee ID or Passport number is required').trim(),
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().optional()
});

export const MfaVerifySchema = z.object({
  mfaToken: z.string().min(10, 'MFA Token is required'),
  code: z.string().length(6, 'MFA Code must be 6 digits')
});

export const ForgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Passport number or official email is required').trim(),
  phoneLastDigits: z.string().min(4, 'Last digits of phone number are required').optional()
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

export const CreateClientSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').trim(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD'),
  nidNumber: z.string().min(10, 'NID number must be at least 10 characters').trim(),
  passportNumber: z.string().min(6, 'Passport number must be at least 6 characters').trim().toUpperCase(),
  phone: z.string().min(8, 'Valid phone number is required').trim(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  avatarUrl: z.string().optional(),
  emergencyContact: z.string().optional(),
  temporaryPassword: z.string().min(8).optional(),
  // CRM & Referral Tracking Fields
  referredByStaffId: z.string().optional().nullable(),
  assignedProcessingStaffId: z.string().optional().nullable(),
  clientSource: z.string().optional().default('DIRECT'), // DIRECT, FACEBOOK, REFERRAL, WALK_IN, WEBSITE
  referralDate: z.string().optional().nullable(),
  referralNotes: z.string().optional().nullable()
});

export const UpdateClientSchema = CreateClientSchema.partial().omit({ passportNumber: true }).extend({
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const CreateApplicationSchema = z.object({
  applicationCode: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  countryId: z.string().min(1, 'Country is required'),
  visaCategoryId: z.string().min(1, 'Visa category/program is required'),
  workflowTemplateId: z.string().optional().nullable(),
  assignedStaffIds: z.array(z.string()).optional(),
  applicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  internalNotes: z.string().optional().nullable()
});

export const UpdateApplicationSchema = z.object({
  applicationCode: z.string().optional(),
  countryId: z.string().optional(),
  visaCategoryId: z.string().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  assignedStaffIds: z.array(z.string()).optional(),
  applicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  internalNotes: z.string().optional().nullable()
});

export const CreateStepSchema = z.object({
  stepName: z.string().min(2, 'Step name is required').trim(),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().min(1).optional(),
  status: z.nativeEnum(StepStatus).optional(),
  scheduledDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  assignedStaffId: z.string().optional().nullable(),
  clientInstructions: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  isPublishedToClient: z.boolean().default(true)
});

export const UpdateStepSchema = z.object({
  stepName: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  status: z.nativeEnum(StepStatus).optional(),
  scheduledDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  completedDate: z.string().optional().nullable(),
  assignedStaffId: z.string().optional().nullable(),
  clientInstructions: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  isPublishedToClient: z.boolean().optional()
});

export const UpdateDocumentStatusSchema = z.object({
  status: z.nativeEnum(DocumentStatus),
  verificationNotes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
});

export const CreatePaymentSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  amount: z.number().positive('Amount must be greater than zero'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionReference: z.string().optional(),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Payment date must be YYYY-MM-DD'),
  internalNotes: z.string().optional()
});

export const ReversePaymentSchema = z.object({
  reason: z.string().min(5, 'Reversal reason is required').trim()
});

export const CreateStaffSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').trim(),
  email: z.string().email('Valid email is required').trim(),
  phone: z.string().min(8, 'Phone number is required').trim(),
  designation: z.string().min(2, 'Designation is required').trim(),
  employeeId: z.string().min(2, 'Employee ID is required').trim().toUpperCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  permissions: z.array(z.string()).default([])
});

export const ContactInquirySchema = z.object({
  fullName: z.string().min(2, 'Full name is required').trim(),
  phone: z.string().min(8, 'Phone number is required').trim(),
  email: z.string().email('Valid email is required').trim(),
  destinationCountry: z.string().min(2, 'Destination country is required').trim(),
  visaType: z.string().min(2, 'Visa type is required').trim(),
  message: z.string().min(10, 'Message must be at least 10 characters').trim()
});
