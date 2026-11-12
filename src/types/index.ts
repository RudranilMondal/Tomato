export type AppMode = 'customer' | 'partner' | 'rider' | 'admin' | 'quad_view';

export type DietaryType = 'veg' | 'non_veg' | 'egg';

export interface Cuisine {
  id: string;
  name: string;
  iconUrl: string;
  isPopular?: boolean;
}

export interface MenuItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  dietary: DietaryType;
  imageUrl: string;
  isBestseller?: boolean;
  isInStock: boolean;
  variants?: MenuItemVariant[];
  addons?: MenuItemAddon[];
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  coverImage: string;
  rating: number;
  ratingCount: number;
  prepTimeMinutes: number;
  costForTwo: number;
  isPureVeg: boolean;
  isOpen: boolean;
  address: string;
  distanceKm: number;
  cuisines: string[];
  offerText?: string;
  categories: MenuCategory[];
  commissionRate?: number;
  status?: 'active' | 'pending' | 'suspended';
}

export interface CartItem {
  id: string; // unique item id + customisation hash
  menuItem: MenuItem;
  quantity: number;
  selectedVariant?: MenuItemVariant;
  selectedAddons?: MenuItemAddon[];
  specialInstruction?: string;
  itemTotal: number;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountPercentage: number;
  maxDiscount: number;
  minOrderValue: number;
}

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'rider_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'rejected'
  | 'cancelled'
  | 'refunded';

export type RiderDeliveryStep =
  | 'heading_to_restaurant'
  | 'at_restaurant'
  | 'pickup_otp'
  | 'out_for_delivery'
  | 'at_customer'
  | 'delivered';

export interface CompletedTrip {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantArea: string;
  customerName: string;
  customerArea: string;
  distanceKm: number;
  durationMins: number;
  deliveryFee: number;
  customerTip: number;
  surgeBonus: number;
  totalPayout: number;
  completedAt: string;
  status: 'Completed';
}

export interface RiderInfo {
  id: string;
  name: string;
  phone: string;
  photoUrl: string;
  rating: number;
  vehicleNumber: string;
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  restaurant: Restaurant;
  items: CartItem[];
  status: OrderStatus;
  itemTotal: number;
  deliveryFee: number;
  platformFee: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;
  appliedCoupon?: Coupon;
  paymentMethod: 'upi' | 'card' | 'cod';
  paymentStatus?: 'pending' | 'captured' | 'failed' | 'refunded';
  deliveryAddress: {
    label: string;
    addressLine: string;
    landmark?: string;
  };
  deliveryInstructions?: string;
  specialCookingInstructions?: string;
  rider?: RiderInfo;
  pickupOtp: string;
  deliveryOtp: string;
  estimatedDeliveryTime: string;
  estimatedPrepMinutes?: number;
  rejectionReason?: string;
  cancellationReason?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  addresses: {
    id: string;
    label: 'Home' | 'Work' | 'Other';
    line: string;
    isDefault: boolean;
  }[];
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  title: string;
  date: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'offer' | 'order' | 'system';
}

export interface OrderReview {
  orderId: string;
  restaurantRating: number;
  riderRating: number;
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'rider' | 'support';
  text: string;
  time: string;
}

export type RiderOnboardingStatus =
  | 'not_started'
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'action_required';

export interface RiderKycDocuments {
  aadhaarFront: string | null;
  aadhaarBack: string | null;
  panFront: string | null;
  panBack: string | null;
  drivingLicenseFront: string | null;
  drivingLicenseBack: string | null;
  vehicleRc?: string | null;
  bankProof?: string | null;
}

export interface RiderBankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

export type RiderVehicleType =
  | 'Bicycle'
  | 'Motorcycle'
  | 'Scooter'
  | 'Electric Vehicle'
  | 'Bike';

export interface RiderOnboardingApplication {
  id: string;
  applicationRef?: string;
  fullName: string;
  profilePhoto: string;
  phone: string;
  email?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  vehicleType?: RiderVehicleType;
  vehicleNumber?: string;
  vehicleModel?: string;
  drivingLicenseNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  residentialAddress: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  documents: RiderKycDocuments;
  bankDetails: RiderBankDetails;
  status: RiderOnboardingStatus;
  submittedAt: string;
  rejectionReason?: string;
  resubmissionNote?: string;
  timeline?: { action: string; timestamp: string; note?: string; by?: string }[];
}

