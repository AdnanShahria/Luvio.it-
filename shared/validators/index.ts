import { z } from 'zod';

// --- Auth Validators ---

export const emailSchema = z.string().email('Invalid email address').max(255);

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must be at most 128 characters');

export const phoneSchema = z.string().regex(/^\+[1-9]\d{6,14}$/, 'Invalid phone number format (include country code)');

export const registerSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  phoneCountryCode: z.string().min(2).max(5).optional(),
  password: passwordSchema,
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone number is required',
});

export const loginSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  password: z.string().min(1, 'Password is required'),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone number is required',
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

export const requestOtpSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const setNewPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// --- Job Validators ---

export const createJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  images: z.array(z.string().url()).max(10, 'Maximum 10 images'),
  budget: z.number().positive('Budget must be positive').max(1000000),
  currency: z.string().length(3, 'Currency must be a 3-letter code'),
  paymentMode: z.enum(['escrow', 'cash', 'wallet']),
  category: z.string().min(1),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  locationName: z.string().max(200).optional(),
});

export const createBidSchema = z.object({
  amount: z.number().positive('Bid amount must be positive'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

// --- Listing Validators ---

export const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  images: z.array(z.string().url()).min(1, 'At least 1 image required').max(5, 'Maximum 5 images'),
  price: z.number().min(0).max(1000000).nullable(),
  currency: z.string().length(3).optional(),
  category: z.string().min(1),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']),
  type: z.enum(['sell', 'giveaway']),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  locationName: z.string().max(200).optional(),
});

// --- Profile Validators ---

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatarUrl: z.string().url().optional(),
  locale: z.string().min(2).max(10).optional(),
  currency: z.string().length(3).optional(),
  role: z.enum(['customer', 'worker', 'seller']).optional(),
});

// --- Review Validators ---

export const createReviewSchema = z.object({
  revieweeId: z.string().min(1),
  jobId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

// --- Report Validators ---

export const createReportSchema = z.object({
  targetType: z.enum(['user', 'job', 'listing', 'message']),
  targetId: z.string().min(1),
  reason: z.string().min(10, 'Please provide a detailed reason').max(1000),
});

// --- Pagination Validators ---

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export all types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type CreateBidInput = z.infer<typeof createBidSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
