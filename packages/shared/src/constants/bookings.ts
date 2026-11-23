import { z } from 'zod';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  REJECTED = 'REJECTED'
}

export const BOOKING_TIME_SLOTS = [
  '11:00 AM',
  '11:45 AM',
  '12:30 PM',
  '01:15 PM',
  '02:30 PM',
  '03:15 PM',
  '04:00 PM',
  '04:45 PM',
  '05:15 PM'
] as const;

export const PublicBookingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').trim(),
  phone: z.string().min(8, 'Valid phone number is required').trim(),
  email: z.string().email('Valid email address is required').trim(),
  continent: z.string().min(2, 'Continent is required'),
  countryId: z.string().min(1, 'Destination country is required'),
  countryName: z.string().min(1, 'Country name is required'),
  programId: z.string().optional().nullable(),
  programName: z.string().min(2, 'Visa program or category is required').trim(),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  preferredTime: z.string().min(2, 'Preferred time slot is required'),
  additionalMessage: z.string().optional().default(''),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to the privacy policy to book an appointment'
  })
});

export const UpdateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  assignedStaffId: z.string().optional().nullable(),
  rescheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  rescheduledTime: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  cancellationReason: z.string().optional().nullable()
});
