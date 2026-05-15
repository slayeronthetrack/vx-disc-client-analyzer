/**
 * Validation Schemas
 * Zod schemas for input validation
 */

import { z } from 'zod';

// ============================================
// COMPANY VALIDATION
// ============================================

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100, 'Company name is too long'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), {
      message: 'Slug cannot start or end with a hyphen',
    }),
  logo_url: z.string().url('Invalid logo URL').optional().nullable(),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')
    .optional()
    .default('#F97316'),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format')
    .optional()
    .nullable(),
  font_family: z.string().optional().default('Inter'),
  custom_welcome_message: z.string().max(500, 'Welcome message is too long').optional().nullable(),
  background_image_url: z.string().url('Invalid background image URL').optional().nullable(),
  email_template: z.string().optional().nullable(),
  contact_person: z.string().min(1, 'Contact person is required').max(100, 'Contact person name is too long'),
  contact_email: z.string().email('Invalid email address'),
  max_tests: z.number().int().min(0, 'Max tests must be 0 or greater').optional().default(100),
  active: z.boolean().optional().default(true),
});

export const createCompanyWithAdminSchema = createCompanySchema.extend({
  admin_access: z.object({
    admin_full_name: z.string().min(1, 'Administrator name is required').max(100, 'Administrator name is too long'),
    admin_email: z.string().email('Invalid administrator email address'),
    admin_password: z.string().min(8, 'Temporary password must be at least 8 characters'),
  }),
});

export const updateCompanySchema = createCompanySchema.partial();

export const companyFiltersSchema = z.object({
  search: z.string().optional(),
  active: z.boolean().optional(),
  nearLimit: z.boolean().optional(),
  atLimit: z.boolean().optional(),
  sortBy: z.enum(['name', 'created_at', 'total_tests']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

// ============================================
// COMPANY TEST VALIDATION
// ============================================

export const employeeDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20, 'Phone number is too long').optional(),
  position: z.string().min(1, 'Position is required').max(100, 'Position is too long'),
  department: z.string().max(100, 'Department name is too long').optional(),
});

export const startTestSchema = z.object({
  company_id: z.string().uuid('Invalid company ID'),
  employee_data: employeeDataSchema,
});

export const submitTestSchema = z.object({
  company_id: z.string().uuid('Invalid company ID'),
  employee_data: employeeDataSchema,
  answers: z.array(
    z.object({
      questionId: z.number().int(),
      selectedOptions: z.array(z.enum(['D', 'I', 'S', 'C'])),
    })
  ).min(1, 'At least one answer is required'),
  questions: z.array(z.any()).min(1, 'Questions are required'),
  started_at: z.string().datetime().optional(),
});

export const companyTestFiltersSchema = z.object({
  search: z.string().optional(),
  dominant_profile: z.enum(['D', 'I', 'S', 'C', 'all']).optional(),
  department: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'ABANDONED']).optional(),
  sortBy: z.enum(['created_at', 'name', 'email']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate and parse data with a Zod schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  
  return result.data;
}

/**
 * Format slug: lowercase, replace spaces with hyphens, remove special chars
 */
export function formatSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .slice(0, 50); // Max 50 characters
}
