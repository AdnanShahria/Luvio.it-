// ============================================
// Luvio Platform — Shared Constants
// ============================================

// --- Job Categories ---
export const JOB_CATEGORIES = [
  { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { id: 'repair', label: 'Repair & Maintenance', icon: '🔧' },
  { id: 'moving', label: 'Moving & Delivery', icon: '📦' },
  { id: 'gardening', label: 'Gardening & Landscaping', icon: '🌿' },
  { id: 'tutoring', label: 'Tutoring & Lessons', icon: '📚' },
  { id: 'petcare', label: 'Pet Care', icon: '🐾' },
  { id: 'tech', label: 'Tech Support', icon: '💻' },
  { id: 'beauty', label: 'Beauty & Wellness', icon: '💅' },
  { id: 'events', label: 'Events & Entertainment', icon: '🎉' },
  { id: 'errands', label: 'Errands & Tasks', icon: '🏃' },
  { id: 'cooking', label: 'Cooking & Catering', icon: '🍳' },
  { id: 'other', label: 'Other', icon: '📋' },
] as const;

// --- Marketplace Categories ---
export const MARKETPLACE_CATEGORIES = [
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'furniture', label: 'Furniture', icon: '🛋️' },
  { id: 'clothing', label: 'Clothing & Accessories', icon: '👗' },
  { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
  { id: 'home', label: 'Home & Garden', icon: '🏡' },
  { id: 'sports', label: 'Sports & Outdoors', icon: '⚽' },
  { id: 'books', label: 'Books & Media', icon: '📖' },
  { id: 'kids', label: 'Kids & Baby', icon: '🧸' },
  { id: 'other', label: 'Other', icon: '📋' },
] as const;

// --- Currencies ---
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
] as const;

// --- Supported Languages ---
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', rtl: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', rtl: false },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', rtl: false },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', rtl: false },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', rtl: false },
] as const;

// --- API Constants ---
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGES_PER_JOB = 10;
export const MAX_IMAGES_PER_LISTING = 5;
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
