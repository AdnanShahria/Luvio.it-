// ============================================
// Luvio Platform — Shared Type Definitions
// ============================================

// --- User & Auth ---
export type UserRole = 'customer' | 'worker' | 'seller';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  phoneCountryCode: string | null;
  passwordHash?: never; // Never expose to frontend
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  locale: string;
  currency: string;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// --- Jobs ---
export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type PaymentMode = 'escrow' | 'cash' | 'wallet';

export interface Job {
  id: string;
  posterId: string;
  poster?: PublicUser;
  title: string;
  description: string;
  images: string[];
  budget: number;
  currency: string;
  paymentMode: PaymentMode;
  category: string;
  locationLat: number | null;
  locationLng: number | null;
  locationName: string | null;
  status: JobStatus;
  bidCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  jobId: string;
  workerId: string;
  worker?: PublicUser;
  amount: number;
  message: string;
  status: BidStatus;
  createdAt: string;
}

// --- Marketplace Listings ---
export type ListingType = 'sell' | 'giveaway';
export type ListingStatus = 'active' | 'sold' | 'removed';
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export interface Listing {
  id: string;
  sellerId: string;
  seller?: PublicUser;
  title: string;
  description: string;
  images: string[];
  price: number | null;
  currency: string;
  category: string;
  condition: ListingCondition;
  type: ListingType;
  locationLat: number | null;
  locationLng: number | null;
  locationName: string | null;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

// --- Chat ---
export type ThreadType = 'job' | 'listing' | 'direct';

export interface ChatThread {
  id: string;
  type: ThreadType;
  referenceId: string | null;
  participants: PublicUser[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  sender?: PublicUser;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// --- Wallet & Transactions ---
export type TransactionType = 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release' | 'payment' | 'refund';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type EscrowStatus = 'held' | 'released' | 'disputed' | 'refunded';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  totalEarnings: number;
  totalWithdrawn: number;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}

// --- Notifications ---
export type NotificationType = 'bid_received' | 'bid_accepted' | 'job_completed' | 'new_message' | 'payment_received' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  data: Record<string, unknown> | null;
  createdAt: string;
}

// --- Reviews ---
export interface Review {
  id: string;
  reviewerId: string;
  reviewer?: PublicUser;
  revieweeId: string;
  reviewee?: PublicUser;
  jobId: string | null;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

// --- Premium ---
export type SubscriptionPlan = 'free' | 'premium' | 'business';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiresAt: string | null;
}

// --- API Response Envelope ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

// --- Pagination ---
export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// --- Reports & Safety ---
export type ReportTargetType = 'user' | 'job' | 'listing' | 'message';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}
