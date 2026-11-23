import { z } from 'zod';

export enum ContinentName {
  ASIA = 'Asia',
  EUROPE = 'Europe',
  AFRICA = 'Africa',
  NORTH_AMERICA = 'North America',
  SOUTH_AMERICA = 'South America',
  OCEANIA = 'Oceania'
}

export enum ProgramStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED'
}

export const CreateCountrySchema = z.object({
  name: z.string().min(2, 'Country name is required').trim(),
  code: z.string().min(2, 'ISO Code is required').max(3).toUpperCase().trim(),
  continent: z.nativeEnum(ContinentName),
  flagEmoji: z.string().optional().default('🌐'),
  description: z.string().optional().default(''),
  displayOrder: z.number().int().optional().default(0),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  currency: z.string().optional(),
  capital: z.string().optional()
});

export const UpdateCountrySchema = CreateCountrySchema.partial();

export const CreateVisaProgramSchema = z.object({
  countryId: z.string().min(1, 'Country ID is required'),
  programName: z.string().min(2, 'Program name is required').trim(),
  visaCategory: z.string().min(2, 'Visa category is required').trim(), // Work Permit, Student, Tourist, Residency
  description: z.string().min(5, 'Description is required').trim(),
  eligibility: z.string().optional().default(''),
  requiredDocuments: z.array(z.string()).optional().default([]),
  serviceInformation: z.string().optional().default(''),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  programStatus: z.nativeEnum(ProgramStatus).default(ProgramStatus.ACTIVE),
  bookingEnabled: z.boolean().default(true),
  displayOrder: z.number().int().optional().default(0),
  defaultProcessingDays: z.number().int().optional().default(30),
  consultationFee: z.number().optional().default(0)
});

export const UpdateVisaProgramSchema = CreateVisaProgramSchema.partial().omit({ countryId: true });
