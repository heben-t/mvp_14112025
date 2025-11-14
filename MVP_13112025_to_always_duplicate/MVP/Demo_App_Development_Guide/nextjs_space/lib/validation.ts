import { z } from 'zod';

export const startupOnboardingSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(1, 'Industry is required'),
  stage: z.string().min(1, 'Stage is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  foundedYear: z.number().min(1900).max(new Date().getFullYear()),
  teamSize: z.number().min(1, 'Team size must be at least 1'),
  location: z.string().min(1, 'Location is required'),
  logo: z.string().optional(),
});

export const investorOnboardingSchema = z.object({
  investmentFocus: z.string().min(10, 'Investment focus must be at least 10 characters'),
  accreditationStatus: z.enum(['accredited', 'non-accredited']),
  accreditationDocument: z.string().optional(),
  linkedinProfile: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
});

export const investorPreferencesSchema = z.object({
  minROIThreshold: z.number().min(0).max(100),
  preferredStages: z.string().min(1, 'At least one stage is required'),
  sectorFilters: z.string().min(1, 'At least one sector is required'),
  geographicPreferences: z.string().optional(),
});

export const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  industry: z.string().min(1, 'Industry is required'),
  stage: z.string().min(1, 'Stage is required'),
  fundraisingGoal: z.number().min(10000, 'Minimum goal is $10,000'),
  minInvestment: z.number().min(100, 'Minimum investment is $100'),
  maxInvestment: z.number().min(1000, 'Maximum investment is $1,000'),
  equityOffered: z.number().min(0.1).max(100, 'Equity must be between 0.1% and 100%'),
  deadline: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Deadline must be in the future',
  }),
  vslUrl: z.string().url('Invalid video URL').optional().or(z.literal('')),
  pitchDeck: z.string().optional(),
  useOfFunds: z.string().min(50, 'Use of funds must be at least 50 characters'),
  risks: z.string().min(50, 'Risks must be at least 50 characters'),
  teamInfo: z.string().min(50, 'Team info must be at least 50 characters'),
});

export const investmentSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),
  amount: z.number().min(100, 'Minimum investment is $100'),
});

export const subscriptionCheckoutSchema = z.object({
  planId: z.enum(['investor_basic', 'investor_pro', 'startup']),
});

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _error: 'Validation failed' } };
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 10000);
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  Object.keys(sanitized).forEach((key) => {
    const k = key as keyof T;
    if (typeof sanitized[k] === 'string') {
      sanitized[k] = sanitizeInput(sanitized[k] as string) as T[keyof T];
    }
  });
  return sanitized;
}
