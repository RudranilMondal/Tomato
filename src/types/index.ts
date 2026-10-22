export type AppMode = 'customer' | 'partner' | 'rider' | 'admin';

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
  | 'delivered';

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
