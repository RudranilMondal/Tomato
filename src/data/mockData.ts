import { Restaurant, Cuisine, Coupon, UserProfile, RiderInfo, Order, CompletedTrip } from '../types';

export const CUISINES: Cuisine[] = [
  { id: '1', name: 'Biryani', iconUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '2', name: 'Pizza', iconUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '3', name: 'Burgers', iconUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '4', name: 'North Indian', iconUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '5', name: 'South Indian', iconUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '6', name: 'Chinese', iconUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '7', name: 'Desserts', iconUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '8', name: 'Healthy', iconUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80', isPopular: true },
  { id: '9', name: 'Rolls & Wraps', iconUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&auto=format&fit=crop&q=80' },
  { id: '10', name: 'Coffee & Shakes', iconUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200&auto=format&fit=crop&q=80' }
];

export const COUPONS: Coupon[] = [
  {
    code: 'G1BITES50',
    title: '50% OFF',
    description: 'Get 50% discount up to ₹100 on your feast',
    discountPercentage: 50,
    maxDiscount: 100,
    minOrderValue: 199
  },
  {
    code: 'FREESHIP',
    title: 'FREE DELIVERY',
    description: 'Zero delivery charges on orders above ₹249',
    discountPercentage: 100,
    maxDiscount: 35,
    minOrderValue: 249
  },
  {
    code: 'GOURMET20',
    title: 'FLAT 20% OFF',
    description: '20% off on premium dining up to ₹150',
    discountPercentage: 20,
    maxDiscount: 150,
    minOrderValue: 399
  },
  {
    code: 'WELCOME',
    title: 'WELCOME BONUS',
    description: 'Flat ₹75 off for all fresh G1 Bites foodies',
    discountPercentage: 30,
    maxDiscount: 75,
    minOrderValue: 149
  }
];

export const GUEST_USER: UserProfile = {
  id: '',
  name: '',
  phone: '',
  email: '',
  avatarUrl: '',
  addresses: []
};

// Initial user defaults to guest profile; populated dynamically upon authentication
export const INITIAL_USER: UserProfile = GUEST_USER;

// Default rider template when unassigned
export const SAMPLE_RIDER: RiderInfo = {
  id: '',
  name: 'Delivery Partner',
  phone: '',
  photoUrl: '',
  rating: 5.0,
  vehicleNumber: 'Registered Vehicle',
  lat: 0,
  lng: 0
};

// Clean operational datasets populated dynamically from Supabase
export const INITIAL_RIDER_TRIPS: CompletedTrip[] = [];
export const RESTAURANTS: Restaurant[] = [];
export const INITIAL_PARTNER_ORDERS: Order[] = [];
