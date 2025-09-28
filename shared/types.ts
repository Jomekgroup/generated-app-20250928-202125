export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
// CLEANCONNECT APPLICATION TYPES
export type UserRole = 'client' | 'cleaner' | 'admin';
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  passwordHash: string; // For backend use
  idImageUrl?: string;
}
export interface CleanerProfile extends User {
  role: 'cleaner';
  bio: string;
  location: string;
  state?: string;
  city?: string;
  rating: number;
  reviewsCount: number;
  services: Service[];
  isPremium?: boolean;
  workGallery?: string[];
  cleanerType: 'individual' | 'company';
  companyName?: string;
  specialties?: string[];
  companyRegistrationUrl?: string;
  featuredUntil?: string; // ISO 8601 date string
  subscriptionExpiresAt?: string; // ISO 8601 date string
  premiumPaymentStatus?: 'pending' | 'approved' | 'declined';
  featuredPaymentStatus?: 'pending' | 'approved' | 'declined';
}
export type Service = {
  id: string;
  cleanerId: string;
  name: string;
  description: string;
  price: number;
  priceUnit: 'per_hour' | 'flat_rate';
};
export type Booking = {
  id: string;
  clientId: string;
  cleanerId: string;
  serviceId: string;
  bookingDate: string; // ISO 8601 date string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'accepted' | 'declined' | 'awaiting_approval' | 'approved' | 'disputed';
  address: string;
  totalCost: number;
  reviewId?: string;
};
export type Review = {
  id: string;
  bookingId: string;
  clientId: string;
  cleanerId: string;
  authorName: string;
  authorAvatarUrl?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // ISO 8601 date string
};
export type Payment = {
  id: string;
  cleanerId: string;
  cleanerName: string;
  amount: number;
  type: 'premium' | 'featured';
  status: 'pending' | 'approved' | 'declined';
  createdAt: string; // ISO 8601
};