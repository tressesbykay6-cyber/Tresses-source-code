export type ServiceCategory = 'Braids' | 'Wigs & Extensions' | 'Hair Treatments & Color' | 'Hair Styling' | 'Makeup' | 'Nails';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number; // in KSh
  durationMinutes: number;
  durationLabel: string;
  stylistName: string;
  stylistId: string;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  depositAmount: number; // in KSh
  numberOfStylists?: number;
}

export interface Stylist {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  specialties: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  portfolio: string[];
  availableDays: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // KSh
  rating: number;
  image: string;
  description: string;
  inStock: boolean;
  size?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: ServiceCategory | 'Videos';
  image: string;
  videoUrl?: string;
  likes: number;
  isBeforeAfter?: boolean;
  beforeImage?: string;
  afterImage?: string;
  stylistName: string;
}

export interface Review {
  id: string;
  clientName: string;
  rating: number;
  serviceBooked: string;
  date: string;
  quote: string;
  clientAvatar?: string;
  verified: boolean;
}

export interface Booking {
  id: string;
  service: Service;
  stylist?: Stylist;
  requestedStylistName?: string;
  date: string;
  timeSlot: string;
  depositPaid: number;
  totalPrice: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Verified' | 'Refunded';
  clientName: string;
  clientPhone: string;
  notes?: string;
  durationMinutes: number;
}

export interface LoyaltyAccount {
  clientName: string;
  phone: string;
  points: number;
  targetPoints: number;
  nextReward: string;
  tier: 'Gold Studio' | 'Platinum Studio' | 'VIP Diamond';
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  savedInspoIds: string[];
}
