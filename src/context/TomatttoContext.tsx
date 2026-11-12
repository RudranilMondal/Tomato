import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  AppMode,
  Restaurant,
  MenuItem,
  CartItem,
  Coupon,
  Order,
  OrderStatus,
  UserProfile,
  MenuItemVariant,
  MenuItemAddon,
  WalletTransaction,
  NotificationItem,
  OrderReview,
  ChatMessage,
  RiderOnboardingStatus,
  RiderOnboardingApplication,
  RiderKycDocuments,
  RiderBankDetails,
  RiderDeliveryStep,
  CompletedTrip
} from '../types';
import { RESTAURANTS, COUPONS, INITIAL_USER, SAMPLE_RIDER, INITIAL_PARTNER_ORDERS, INITIAL_RIDER_TRIPS } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { DemoRiderUser, DEMO_OTP_CODE } from '../lib/demoAuth';

export type CustomerScreen =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'location'
  | 'home'
  | 'search'
  | 'restaurant'
  | 'cart'
  | 'payment'
  | 'order_success'
  | 'order_tracking'
  | 'orders_history'
  | 'profile';

interface TomatttoContextType {
  // App Shell
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean) => void;

  // Customer State
  customerScreen: CustomerScreen;
  setCustomerScreen: (screen: CustomerScreen) => void;
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (r: Restaurant | null) => void;
  customizingItem: MenuItem | null;
  setCustomizingItem: (item: MenuItem | null) => void;
  cart: CartItem[];
  addToCart: (
    item: MenuItem,
    variant?: MenuItemVariant,
    addons?: MenuItemAddon[],
    instruction?: string
  ) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  allOrders: Order[];
  // Auth
  isLoggedIn: boolean;
  loginUser: (details?: { name?: string; phone?: string; email?: string; address?: string }) => void;
  logoutUser: () => void;
  user: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  // Supabase Auth & Shared Session
  supabaseSession: Session | null;
  supabaseUser: User | null;
  demoRiderUser: DemoRiderUser | null;
  setDemoRiderUser: (user: DemoRiderUser | null) => void;
  activeRiderApplicant: { id: string; phone: string; fullName?: string; isDemo?: boolean } | null;
  isSupabaseLoading: boolean;
  signOutSupabase: () => Promise<void>;
  initializeRiderProfile: (userId: string, phone: string, fullName?: string) => Promise<boolean>;
  selectedAddress: string;
  setSelectedAddress: (addr: string) => void;
  userAddresses: UserProfile['addresses'];
  addAddress: (label: 'Home' | 'Work' | 'Other', line: string) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Favorites
  favorites: string[];
  toggleFavorite: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;

  // Wallet & Credits
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  topUpWallet: (amount: number) => void;
  creditRefund: (amount: number, reason: string) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Reviews
  reviews: OrderReview[];
  submitOrderReview: (
    orderId: string,
    restaurantRating: number,
    riderRating: number,
    tags: string[],
    comment: string
  ) => void;
  getOrderReview: (orderId: string) => OrderReview | undefined;

  // Chat
  riderMessages: ChatMessage[];
  sendRiderMessage: (text: string) => void;
  supportMessages: ChatMessage[];
  sendSupportMessage: (text: string) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCuisine: string | null;
  setSelectedCuisine: (c: string | null) => void;
  vegOnlyFilter: boolean;
  setVegOnlyFilter: (v: boolean) => void;

  // Order Placement & Lifecycle
  isPlacingOrder: boolean;
  orderError: string | null;
  placeOrder: (paymentMethod: 'upi' | 'card' | 'cod') => Promise<boolean>;

  // Partner State
  incomingOrder: Order | null;
  partnerOrders: Order[];
  partnerAcceptOrder: (orderId: string, prepMins?: number) => { success: boolean; error?: string };
  partnerStartPreparing: (orderId: string) => { success: boolean; error?: string };
  partnerMarkReady: (orderId: string) => { success: boolean; error?: string };
  partnerRejectOrder: (orderId: string, reason?: string) => { success: boolean; error?: string };
  partnerCancelOrder: (orderId: string, reason?: string) => { success: boolean; error?: string };
  menuStockMap: Record<string, boolean>;
  toggleItemStock: (itemId: string) => void;
  addMenuItem: (
    restaurantId: string,
    categoryId: string,
    item: Omit<MenuItem, 'id' | 'restaurantId' | 'categoryId'>
  ) => void;
  updateMenuItem: (
    restaurantId: string,
    categoryId: string,
    itemId: string,
    updates: Partial<MenuItem>
  ) => void;

  // Admin CMS & Partner Operations
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateRestaurantCommission: (restaurantId: string, newRate: number) => void;
  toggleRestaurantStatus: (restaurantId: string) => void;
  updateRestaurantDetails: (restaurantId: string, updates: Partial<Restaurant>) => void;
  deleteMenuItem: (restaurantId: string, categoryId: string, itemId: string) => void;

  // Rider State
  isRiderOnline: boolean;
  setIsRiderOnline: (val: boolean) => void;
  riderDeliveryRequest: Order | null;
  activeRiderOrder: Order | null;
  availableRiderOrders: Order[];
  riderStep: RiderDeliveryStep;
  setRiderStep: (step: RiderDeliveryStep) => void;
  riderAcceptDelivery: (orderId?: string) => { success: boolean; error?: string };
  riderRejectDelivery: (orderId?: string) => { success: boolean; error?: string };
  riderArriveAtRestaurant: () => { success: boolean; error?: string };
  riderVerifyPickup: (otp?: string) => { success: boolean; error?: string };
  riderArriveAtCustomer: () => { success: boolean; error?: string };
  riderCompleteDelivery: (otp: string) => { success: boolean; error?: string };
  riderEarningsToday: number;
  riderTripsToday: number;
  completedRiderTrips: CompletedTrip[];

  // Rider Onboarding & KYC
  riderOnboardingStatus: RiderOnboardingStatus;
  setRiderOnboardingStatus: (status: RiderOnboardingStatus) => void;
  persistedRiderApp: any | null;
  fetchUserRiderApplication: (userId?: string) => Promise<any>;
  allRiderApplications: RiderOnboardingApplication[];
  submitRiderOnboarding: (app: Omit<RiderOnboardingApplication, 'id' | 'status' | 'submittedAt'> & { id?: string }) => void;
  approveRiderKyc: (appId: string) => void;
  rejectRiderKyc: (appId: string, reason: string) => void;
  requestResubmissionRiderKyc: (appId: string, reason: string) => void;
  loginDemoRider: () => void;
  resetRiderOnboarding: () => void;

  // Simulation Helpers
  triggerSimulatedCustomerOrder: () => void;
  triggerSimulatedDeliveryRequest: () => void;

  // Guided Demo Walkthrough
  demoStep: number;
  isDemoActive: boolean;
  startDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  stopDemo: () => void;
}

const TomatttoContext = createContext<TomatttoContextType | undefined>(undefined);

export const TomatttoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Shell
  const [appMode, setAppMode] = useState<AppMode>('customer');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  // Customer
  const [customerScreen, setCustomerScreen] = useState<CustomerScreen>('home');
  const [restaurants, setRestaurants] = useState<Restaurant[]>(RESTAURANTS);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(COUPONS[0]);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null); // default 50% promo for excitement
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [userAddresses, setUserAddresses] = useState(INITIAL_USER.addresses);
  const [selectedAddress, setSelectedAddress] = useState<string>(INITIAL_USER.addresses[0].line);

  // Supabase Auth & Session Synchronization
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [demoRiderUser, setDemoRiderUser] = useState<DemoRiderUser | null>(null);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState<boolean>(true);

  const activeRiderApplicant = supabaseUser
    ? { id: supabaseUser.id, phone: supabaseUser.phone || '', fullName: undefined, isDemo: false }
    : demoRiderUser
    ? { id: demoRiderUser.id, phone: demoRiderUser.phone, fullName: demoRiderUser.fullName, isDemo: true }
    : null;

  useEffect(() => {
    if (!supabase) {
      setIsSupabaseLoading(false);
      return;
    }

    let isMounted = true;

    // In @supabase/supabase-js v2, onAuthStateChange immediately evaluates stored session
    // and fires INITIAL_SESSION/SIGNED_IN/SIGNED_OUT reliably without racing with getSession().
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);
      setIsSupabaseLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOutSupabase = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }
    setSupabaseSession(null);
    setSupabaseUser(null);
    setDemoRiderUser(null);
    setRiderOnboardingStatus('not_started');
  };

  const initializeRiderProfile = async (
    userId: string,
    phone: string,
    fullName?: string
  ): Promise<boolean> => {
    if (!supabase) {
      console.error('initializeRiderProfile: Supabase client is not available.');
      return false;
    }

    try {
      // 1. Query for an existing profile by the authenticated user's ID
      const { data: existingById, error: fetchByIdErr } = await supabase
        .from('profiles')
        .select('id, role, full_name, phone')
        .eq('id', userId)
        .maybeSingle();

      // Distinguish a genuine "not found" (which returns data=null, error=null in maybeSingle)
      // from RLS/network/query errors.
      if (fetchByIdErr) {
        console.error('initializeRiderProfile: Database query error checking user profile:', fetchByIdErr);
        return false;
      }

      // If a profile already exists for this authenticated user ID, do not overwrite; succeed safely.
      if (existingById) {
        return true;
      }

      // 2. Pre-emptively verify if this phone number is already registered under another profile ID
      const { data: existingByPhone, error: fetchByPhoneErr } = await supabase
        .from('profiles')
        .select('id, phone')
        .eq('phone', phone)
        .maybeSingle();

      if (fetchByPhoneErr) {
        console.error('initializeRiderProfile: Database query error checking phone uniqueness:', fetchByPhoneErr);
        return false;
      }

      if (existingByPhone && existingByPhone.id !== userId) {
        console.error(
          `initializeRiderProfile: Phone number ${phone} is already linked to another account (${existingByPhone.id}). Rejecting duplicate association.`
        );
        return false;
      }

      // 3. Safely create profile with default 'customer' role.
      // Database trigger trg_protect_profile_fields guarantees role='customer' and validates auth.uid() = id.
      const { error: insertErr } = await supabase.from('profiles').insert({
        id: userId,
        phone: phone,
        full_name: fullName || 'Delivery Applicant',
        role: 'customer',
        is_active: true
      });

      if (insertErr) {
        if (insertErr.code === '23505') {
          console.error(
            `initializeRiderProfile: Unique constraint violation (23505) inserting profile for phone ${phone}:`,
            insertErr.message
          );
        } else {
          console.error('initializeRiderProfile: Failed to insert applicant profile:', insertErr);
        }
        return false;
      }

      return true;
    } catch (err) {
      console.error('initializeRiderProfile: Unexpected exception during profile initialization:', err);
      return false;
    }
  };

  const loginUser = (details?: { name?: string; phone?: string; email?: string; address?: string }) => {
    if (details) {
      setUser((prev) => ({
        ...prev,
        name: details.name !== undefined ? details.name : prev.name,
        phone: details.phone !== undefined ? details.phone : prev.phone,
        email: details.email !== undefined ? details.email : prev.email
      }));

      if (details.address) {
        const newAddr = {
          id: `addr-${Date.now()}`,
          label: 'Home' as const,
          line: details.address,
          isDefault: true
        };
        setSelectedAddress(details.address);
        setUserAddresses((prev) => [newAddr, ...prev.map((a) => ({ ...a, isDefault: false }))]);
        setUser((prev) => ({
          ...prev,
          addresses: [newAddr, ...prev.addresses.map((a) => ({ ...a, isDefault: false }))]
        }));
      }
    }
    setIsLoggedIn(true);
    setCustomerScreen('home');
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    // Clear user identity so next login does not retain stale name/email
    setUser((prev) => ({
      ...prev,
      id: `usr-${Date.now()}`,
      name: '',
      phone: '',
      email: ''
    }));
    setCustomerScreen('auth');
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setSupabaseSession(null);
    setSupabaseUser(null);
    setDemoRiderUser(null);
    setRiderOnboardingStatus('not_started');
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const addCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => [newCoupon, ...prev]);
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  // Address management
  const addAddress = (label: 'Home' | 'Work' | 'Other', line: string) => {
    const newAddr = {
      id: `addr-${Date.now()}`,
      label,
      line,
      isDefault: userAddresses.length === 0
    };
    setUserAddresses((prev) => [newAddr, ...prev]);
    setSelectedAddress(line);
  };
  const deleteAddress = (id: string) => {
    setUserAddresses((prev) => prev.filter((a) => a.id !== id));
  };
  const setDefaultAddress = (id: string) => {
    setUserAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    const found = userAddresses.find((a) => a.id === id);
    if (found) setSelectedAddress(found.line);
  };

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(['rest-1', 'rest-3']);
  const toggleFavorite = (restaurantId: string) => {
    setFavorites((prev) =>
      prev.includes(restaurantId) ? prev.filter((id) => id !== restaurantId) : [...prev, restaurantId]
    );
  };
  const isFavorite = (restaurantId: string) => favorites.includes(restaurantId);

  // Wallet & Credits
  const [walletBalance, setWalletBalance] = useState<number>(150);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([
    { id: 'tx-1', type: 'credit', amount: 100, title: 'Welcome Bonus Credited', date: 'Yesterday, 8:30 PM' },
    { id: 'tx-2', type: 'credit', amount: 50, title: 'Cashback on Order #TOM-9128', date: '3 days ago' }
  ]);
  const topUpWallet = (amount: number) => {
    setWalletBalance((prev) => prev + amount);
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'credit',
      amount,
      title: 'Wallet Top-up via UPI',
      date: 'Just now'
    };
    setWalletTransactions((prev) => [newTx, ...prev]);
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const creditRefund = (amount: number, reason: string) => {
    setWalletBalance((prev) => prev + amount);
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'credit',
      amount,
      title: `Refund: ${reason}`,
      date: 'Just now'
    };
    setWalletTransactions((prev) => [newTx, ...prev]);

    // Add customer notification
    const refundNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `💰 ₹${amount} Refund Credited`,
      message: `Your refund for "${reason}" has been instantly credited to your Tomattto Wallet.`,
      time: 'Just now',
      read: false,
      type: 'order'
    };
    setNotifications((prev) => [refundNotif, ...prev]);

    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
  };

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: '⚡ 50% Flash Offer Active!',
      message: 'Use code TOMATTTO50 on biryanis, burgers, and gourmet feasts today.',
      time: '10 mins ago',
      read: false,
      type: 'offer'
    },
    {
      id: 'notif-2',
      title: '🛵 Vikram Singh is on the way',
      message: 'Your royal dum biryani has been safely picked up from Behrouz Biryani.',
      time: '45 mins ago',
      read: false,
      type: 'order'
    },
    {
      id: 'notif-3',
      title: '🎉 ₹150 Tomattto Cash in your wallet',
      message: 'Enjoy seamless 1-click checkout with zero payment failures.',
      time: '1 day ago',
      read: true,
      type: 'system'
    }
  ]);
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Reviews
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const submitOrderReview = (
    orderId: string,
    restaurantRating: number,
    riderRating: number,
    tags: string[],
    comment: string
  ) => {
    const newReview: OrderReview = {
      orderId,
      restaurantRating,
      riderRating,
      tags,
      comment,
      createdAt: 'Just now'
    };
    setReviews((prev) => [newReview, ...prev.filter((r) => r.orderId !== orderId)]);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
  };
  const getOrderReview = (orderId: string) => reviews.find((r) => r.orderId === orderId);

  // Rider Chat
  const [riderMessages, setRiderMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'rider',
      text: 'Hi Souvik! I am on my way with your order from Behrouz Biryani. 🛵',
      time: '17:15'
    }
  ]);
  const sendRiderMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setRiderMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let replyText = 'Sure thing! I will take care of it.';
      const lower = text.toLowerCase();
      if (lower.includes('gate') || lower.includes('security')) {
        replyText = 'Understood! Handing it over to the security desk with your name.';
      } else if (lower.includes('call') || lower.includes('reach')) {
        replyText = 'Will give you a ring as soon as I pull up downstairs!';
      } else if (lower.includes('door') || lower.includes('ring')) {
        replyText = 'Got it! Will leave by the door and ring the bell once.';
      } else {
        replyText = 'Received your instructions! Reaching in about 8-10 minutes.';
      }
      const riderReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'rider',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setRiderMessages((prev) => [...prev, riderReply]);
    }, 1200);
  };

  // Support Chat
  const [supportMessages, setSupportMessages] = useState<ChatMessage[]>([
    {
      id: 's-1',
      sender: 'support',
      text: 'Hello Souvik! Welcome to Tomattto 24x7 priority support. How can I assist you today?',
      time: 'Just now'
    }
  ]);
  const sendSupportMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `sup-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSupportMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let reply = 'I am looking into this right now for you.';
      const lower = text.toLowerCase();
      if (lower.includes('order') || lower.includes('track') || lower.includes('where')) {
        reply = 'Your active order is in progress with live GPS tracking enabled. Vikram Singh is delivering at top speed!';
      } else if (lower.includes('refund') || lower.includes('cancel')) {
        reply = 'Orders can be cancelled before kitchen confirmation for an instant 100% refund to your Tomattto Wallet.';
      } else if (lower.includes('coupon') || lower.includes('discount')) {
        reply = 'You can apply code TOMATTTO50 at checkout for 50% discount up to ₹100 on all top restaurants!';
      } else {
        reply = 'Thanks for reaching out! Our concierge team has noted your query and will resolve it promptly.';
      }
      const botMsg: ChatMessage = {
        id: `sup-${Date.now() + 1}`,
        sender: 'support',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSupportMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [vegOnlyFilter, setVegOnlyFilter] = useState(false);

  // Orders
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Partner
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [partnerOrders, setPartnerOrders] = useState<Order[]>(INITIAL_PARTNER_ORDERS);
  const [menuStockMap, setMenuStockMap] = useState<Record<string, boolean>>({});

  // Rider
  const [isRiderOnline, setIsRiderOnline] = useState<boolean>(true);
  const [riderDeliveryRequest, setRiderDeliveryRequest] = useState<Order | null>(null);
  const [activeRiderOrder, setActiveRiderOrder] = useState<Order | null>(null);
  const [riderStep, setRiderStep] = useState<RiderDeliveryStep>('heading_to_restaurant');
  const [riderEarningsToday, setRiderEarningsToday] = useState<number>(390);
  const [riderTripsToday, setRiderTripsToday] = useState<number>(6);
  const [dismissedDeliveryIds, setDismissedDeliveryIds] = useState<string[]>([]);
  const [completedRiderTrips, setCompletedRiderTrips] = useState<CompletedTrip[]>(INITIAL_RIDER_TRIPS);

  // Rider Onboarding & KYC Applications
  const [riderOnboardingStatus, setRiderOnboardingStatus] = useState<RiderOnboardingStatus>('not_started');
  const [persistedRiderApp, setPersistedRiderApp] = useState<any | null>(null);

  const fetchUserRiderApplication = async (userId?: string) => {
    const targetUid = userId || supabaseUser?.id;
    if (!supabase || !targetUid) return null;
    try {
      let { data, error } = await supabase
        .from('rider_applications')
        .select('*, rider_documents(*), rider_payout_details(*)')
        .eq('user_id', targetUid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.message?.includes('rider_payout_details')) {
        const retry = await supabase
          .from('rider_applications')
          .select('*, rider_documents(*)')
          .eq('user_id', targetUid)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        data = retry.data;
        error = retry.error;
      }

      if (!error && data) {
        setPersistedRiderApp(data);
        if (data.status === 'draft') {
          setRiderOnboardingStatus('draft');
        } else if (data.status === 'submitted' || data.status === 'in_review') {
          setRiderOnboardingStatus('under_review');
        } else if (data.status === 'action_required') {
          setRiderOnboardingStatus('action_required');
        } else if (data.status === 'rejected') {
          setRiderOnboardingStatus('rejected');
        } else if (data.status === 'approved' || data.status === 'verified') {
          setRiderOnboardingStatus('approved');
        }

        // Keep allRiderApplications list in sync with persisted data
        if (data.full_name && data.phone) {
          const mappedApp: RiderOnboardingApplication = {
            id: data.id || data.application_ref,
            applicationRef: data.application_ref,
            fullName: data.full_name,
            phone: data.phone,
            email: data.email || undefined,
            city: data.city,
            state: data.metadata?.state || '',
            district: data.metadata?.district || '',
            pincode: data.metadata?.pincode || '',
            residentialAddress: data.metadata?.residential_address || '',
            profilePhoto: data.metadata?.profile_photo || '',
            bloodGroup: data.metadata?.blood_group || 'O+',
            gender: data.metadata?.gender || 'Male',
            dob: data.metadata?.dob || '1998-01-01',
            vehicleType: data.vehicle_type || 'Motorcycle',
            vehicleNumber: data.vehicle_number || '',
            vehicleModel: data.metadata?.vehicle_model || '',
            drivingLicenseNumber: data.driving_license_number || '',
            emergencyContactName: data.emergency_contact_name || '',
            emergencyContactPhone: data.emergency_contact_phone || '',
            status:
              data.status === 'approved' || data.status === 'verified'
                ? 'approved'
                : data.status === 'rejected'
                ? 'rejected'
                : data.status === 'action_required'
                ? 'action_required'
                : 'under_review',
            submittedAt: data.submitted_at ? new Date(data.submitted_at).toLocaleDateString() : 'Recent',
            documents: (data.metadata?.documents || {}) as any,
            bankDetails: {
              accountHolderName: data.full_name,
              bankName: '',
              accountNumber: '',
              ifscCode: '',
              upiId: ''
            }
          };
          setAllRiderApplications((prev) => {
            const filtered = prev.filter((a) => a.applicationRef !== mappedApp.applicationRef && a.phone !== mappedApp.phone);
            return [mappedApp, ...filtered];
          });
        }

        return data;
      }
    } catch (err) {
      console.error('Error fetching rider application from Supabase:', err);
    }
    return null;
  };

  useEffect(() => {
    if (supabaseUser) {
      fetchUserRiderApplication(supabaseUser.id);
    } else if (demoRiderUser) {
      setRiderOnboardingStatus('approved');
    } else {
      setPersistedRiderApp(null);
      setRiderOnboardingStatus('not_started');
    }
  }, [supabaseUser, demoRiderUser]);

  const [allRiderApplications, setAllRiderApplications] = useState<RiderOnboardingApplication[]>([
    {
      id: 'APP-RDR-8921',
      fullName: 'Vikram Singh',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      phone: '+91 98451 92831',
      email: 'vikram.singh@example.com',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560008',
      residentialAddress: '14/B, 2nd Cross, Old Airport Road, Kodihalli, Bengaluru',
      bloodGroup: 'O+',
      gender: 'Male',
      dob: '1998-05-14',
      documents: {
        aadhaarFront: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        aadhaarBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        panFront: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        panBack: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
        drivingLicenseFront: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        drivingLicenseBack: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        vehicleRc: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
        bankProof: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80'
      },
      bankDetails: {
        accountHolderName: 'Vikram Singh',
        bankName: 'HDFC Bank Indiranagar',
        accountNumber: '50100482914821',
        ifscCode: 'HDFC0000140',
        upiId: 'vikram.singh@okhdfcbank'
      },
      status: 'approved',
      submittedAt: 'Today, 9:30 AM'
    }
  ]);

  // Demo Walkthrough
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Cart operations
  const addToCart = (
    item: MenuItem,
    variant?: MenuItemVariant,
    addons: MenuItemAddon[] = [],
    instruction?: string
  ) => {
    const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = (variant ? variant.price : item.discountPrice || item.price) + addonsTotal;
    const cartItemId = `${item.id}-${variant?.id || 'def'}-${addons.map((a) => a.id).sort().join('-')}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.id === cartItemId
            ? { ...i, quantity: i.quantity + 1, itemTotal: (i.quantity + 1) * unitPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          menuItem: item,
          quantity: 1,
          selectedVariant: variant,
          selectedAddons: addons,
          specialInstruction: instruction,
          itemTotal: unitPrice
        }
      ];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === cartItemId) {
            const newQty = i.quantity + delta;
            const unitPrice = i.itemTotal / i.quantity;
            return newQty > 0 ? { ...i, quantity: newQty, itemTotal: newQty * unitPrice } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.itemTotal, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const applyCoupon = (code: string): boolean => {
    const found = COUPONS.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (found) {
      setAppliedCoupon(found);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Place Order
  const placeOrder = async (paymentMethod: 'upi' | 'card' | 'cod'): Promise<boolean> => {
    if (!selectedRestaurant || cart.length === 0 || isPlacingOrder) return false;

    setIsPlacingOrder(true);
    setOrderError(null);

    try {
      // Check if Supabase client is configured with real credentials
      if (supabase) {
        // Prepare payload strictly with item IDs, quantities, variants, and addons (NO trusted prices)
        const rpcItems = cart.map((item) => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          variant_id: item.selectedVariant?.id || null,
          addons: (item.selectedAddons || []).map((a) => ({ id: a.id }))
        }));

        const rpcPayload = {
          p_restaurant_id: selectedRestaurant.id,
          p_delivery_address: {
            street: selectedAddress || '100ft Road, Indiranagar',
            city: 'Bengaluru',
            pincode: '560038',
            label: 'Home'
          },
          p_items: rpcItems,
          p_payment_method: paymentMethod,
          p_coupon_code: appliedCoupon ? appliedCoupon.code : null,
          p_tip_amount: 30.00,
          p_delivery_instructions: null,
          p_special_cooking_instructions: null
        };

        const { data, error } = await supabase.rpc('create_order', rpcPayload);

        if (error) {
          console.error('Supabase create_order RPC error:', error);
          setOrderError(error.message || 'Failed to place order securely.');
          setIsPlacingOrder(false);
          return false;
        }

        if (data) {
          // Construct authoritative order from the DB response
          const serverOrder: Order = {
            id: data.order_id || `TOM-${Math.floor(100000 + Math.random() * 900000)}`,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            customerName: user.name,
            customerPhone: user.phone,
            restaurant: selectedRestaurant,
            items: [...cart],
            status: (data.status || 'placed') as OrderStatus,
            itemTotal: Number(data.item_total ?? cartTotal),
            deliveryFee: Number(data.delivery_fee ?? 35),
            platformFee: Number(data.platform_fee ?? 5),
            taxAmount: Number(data.tax_amount ?? Math.round(cartTotal * 0.05)),
            discountAmount: Number(data.discount_amount ?? 0),
            tipAmount: Number(data.tip_amount ?? 30),
            totalAmount: Number(data.total_amount ?? cartTotal),
            appliedCoupon: appliedCoupon || undefined,
            paymentMethod,
            deliveryAddress: {
              label: 'Home',
              addressLine: selectedAddress
            },
            rider: SAMPLE_RIDER,
            pickupOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
            deliveryOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
            estimatedDeliveryTime: '30-35 mins'
          };

          setCurrentOrder(serverOrder);
          setAllOrders((prev) => [serverOrder, ...prev]);
          setIncomingOrder(serverOrder);
          setPartnerOrders((prev) => [serverOrder, ...prev]);
          clearCart();

          try {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          } catch {}

          setCustomerScreen('order_success');
          setIsPlacingOrder(false);
          return true;
        }
      }

      // Fallback for offline demo mode when Supabase credentials are placeholder
      const discountAmount = appliedCoupon
        ? Math.min(appliedCoupon.maxDiscount, (cartTotal * appliedCoupon.discountPercentage) / 100)
        : 0;
      const deliveryFee = appliedCoupon?.code === 'FREESHIP' ? 0 : 35;
      const platformFee = 5;
      const taxAmount = Math.round(cartTotal * 0.05);
      const tipAmount = 30;
      const totalAmount = cartTotal - discountAmount + deliveryFee + platformFee + taxAmount + tipAmount;

      const demoOrder: Order = {
        id: `TOM-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customerName: user.name,
        customerPhone: user.phone,
        restaurant: selectedRestaurant,
        items: [...cart],
        status: 'placed',
        itemTotal: cartTotal,
        deliveryFee,
        platformFee,
        taxAmount,
        discountAmount,
        tipAmount,
        totalAmount,
        appliedCoupon: appliedCoupon || undefined,
        paymentMethod,
        deliveryAddress: {
          label: 'Home',
          addressLine: selectedAddress
        },
        rider: SAMPLE_RIDER,
        pickupOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
        deliveryOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
        estimatedDeliveryTime: '24 mins'
      };

      setCurrentOrder(demoOrder);
      setAllOrders((prev) => [demoOrder, ...prev]);
      setIncomingOrder(demoOrder);
      setPartnerOrders((prev) => [demoOrder, ...prev]);
      clearCart();

      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch {}

      setCustomerScreen('order_success');
      setIsPlacingOrder(false);
      return true;
    } catch (err: any) {
      console.error('Error during checkout:', err);
      setOrderError(err.message || 'An unexpected error occurred.');
      setIsPlacingOrder(false);
      return false;
    }
  };

  // Partner Actions
  const partnerAcceptOrder = (orderId: string, prepMins: number = 20): { success: boolean; error?: string } => {
    const targetOrder = partnerOrders.find((o) => o.id === orderId) || (incomingOrder?.id === orderId ? incomingOrder : null);
    if (!targetOrder) {
      return { success: false, error: `Order #${orderId} was not found.` };
    }

    if (targetOrder.status === 'rejected' || targetOrder.status === 'cancelled') {
      return {
        success: false,
        error: `Cannot accept Order #${orderId} because it is already ${targetOrder.status}.`
      };
    }

    if (targetOrder.status !== 'placed') {
      return {
        success: false,
        error: `Order #${orderId} has already progressed past incoming state (current status: ${targetOrder.status}).`
      };
    }

    const updatedOrder: Order = {
      ...targetOrder,
      status: 'accepted',
      estimatedPrepMinutes: prepMins
    };

    setPartnerOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    if (incomingOrder?.id === orderId) {
      setIncomingOrder(null);
    }

    if (currentOrder?.id === orderId) {
      setCurrentOrder(updatedOrder);
    }

    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    return { success: true };
  };

  const partnerStartPreparing = (orderId: string): { success: boolean; error?: string } => {
    const targetOrder = partnerOrders.find((o) => o.id === orderId) || (incomingOrder?.id === orderId ? incomingOrder : null);
    if (!targetOrder) {
      return { success: false, error: `Order #${orderId} was not found.` };
    }

    if (targetOrder.status === 'rejected' || targetOrder.status === 'cancelled') {
      return {
        success: false,
        error: `Cannot cook Order #${orderId} because it is ${targetOrder.status}.`
      };
    }

    if (targetOrder.status === 'preparing') {
      return { success: false, error: `Order #${orderId} is already actively being prepared in kitchen.` };
    }

    if (targetOrder.status === 'ready' || targetOrder.status === 'delivered') {
      return {
        success: false,
        error: `Order #${orderId} is already cooked and marked as ${targetOrder.status}.`
      };
    }

    const updatedOrder: Order = {
      ...targetOrder,
      status: 'preparing'
    };

    setPartnerOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    if (incomingOrder?.id === orderId) {
      setIncomingOrder(null);
    }

    if (currentOrder?.id === orderId) {
      setCurrentOrder(updatedOrder);
    }

    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    // Notify rider app of active delivery request
    setRiderDeliveryRequest(updatedOrder);

    return { success: true };
  };

  const partnerMarkReady = (orderId: string): { success: boolean; error?: string } => {
    const targetOrder = partnerOrders.find((o) => o.id === orderId);
    if (!targetOrder) {
      return { success: false, error: `Order #${orderId} was not found.` };
    }

    if (targetOrder.status === 'rejected' || targetOrder.status === 'cancelled') {
      return {
        success: false,
        error: `Cannot mark Order #${orderId} as ready because it is ${targetOrder.status}.`
      };
    }

    if (targetOrder.status === 'placed' || targetOrder.status === 'accepted') {
      return {
        success: false,
        error: `Cannot mark Order #${orderId} ready before preparation has started. Please click "Start Preparing" first.`
      };
    }

    if (targetOrder.status === 'ready') {
      return { success: false, error: `Order #${orderId} is already packed and marked ready for pickup.` };
    }

    if (targetOrder.status === 'delivered' || targetOrder.status === 'picked_up' || targetOrder.status === 'out_for_delivery') {
      return { success: false, error: `Order #${orderId} has already departed the restaurant.` };
    }

    const updatedOrder: Order = {
      ...targetOrder,
      status: 'ready'
    };

    setPartnerOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    if (currentOrder?.id === orderId) {
      setCurrentOrder(updatedOrder);
    }

    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    return { success: true };
  };

  const partnerRejectOrder = (orderId: string, reason?: string): { success: boolean; error?: string } => {
    const targetOrder = partnerOrders.find((o) => o.id === orderId) || (incomingOrder?.id === orderId ? incomingOrder : null);
    if (!targetOrder) {
      return { success: false, error: `Order #${orderId} was not found.` };
    }

    if (targetOrder.status === 'ready' || targetOrder.status === 'delivered' || targetOrder.status === 'picked_up' || targetOrder.status === 'out_for_delivery') {
      return {
        success: false,
        error: `Cannot reject Order #${orderId} because food has already been prepared or dispatched.`
      };
    }

    if (targetOrder.status === 'rejected') {
      return { success: false, error: `Order #${orderId} is already rejected.` };
    }

    const selectedReason = reason || 'Kitchen at peak capacity';
    const updatedOrder: Order = {
      ...targetOrder,
      status: 'rejected',
      rejectionReason: selectedReason,
      paymentStatus: 'refunded'
    };

    setPartnerOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    if (incomingOrder?.id === orderId) {
      setIncomingOrder(null);
    }

    if (currentOrder?.id === orderId) {
      setCurrentOrder(updatedOrder);
    }

    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    return { success: true };
  };

  const partnerCancelOrder = (orderId: string, reason?: string): { success: boolean; error?: string } => {
    const targetOrder = partnerOrders.find((o) => o.id === orderId);
    if (!targetOrder) {
      return { success: false, error: `Order #${orderId} was not found.` };
    }

    if (targetOrder.status === 'delivered') {
      return { success: false, error: `Cannot cancel Order #${orderId} because it is already delivered.` };
    }

    const selectedReason = reason || 'Cancelled by restaurant';
    const updatedOrder: Order = {
      ...targetOrder,
      status: 'cancelled',
      cancellationReason: selectedReason,
      paymentStatus: 'refunded'
    };

    setPartnerOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    if (incomingOrder?.id === orderId) {
      setIncomingOrder(null);
    }

    if (currentOrder?.id === orderId) {
      setCurrentOrder(updatedOrder);
    }

    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    return { success: true };
  };

  const toggleItemStock = (itemId: string) => {
    setMenuStockMap((prev) => ({
      ...prev,
      [itemId]: prev[itemId] === undefined ? false : !prev[itemId]
    }));
  };

  const addMenuItem = (
    restaurantId: string,
    categoryId: string,
    itemData: Omit<MenuItem, 'id' | 'restaurantId' | 'categoryId'>
  ) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `dish-${Date.now()}`,
      restaurantId,
      categoryId
    };

    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id !== restaurantId) return r;
        return {
          ...r,
          categories: r.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              items: [newItem, ...c.items]
            };
          })
        };
      })
    );

    if (selectedRestaurant?.id === restaurantId) {
      setSelectedRestaurant((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          categories: prev.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              items: [newItem, ...c.items]
            };
          })
        };
      });
    }

    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const updateMenuItem = (
    restaurantId: string,
    categoryId: string,
    itemId: string,
    updates: Partial<MenuItem>
  ) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id !== restaurantId) return r;
        return {
          ...r,
          categories: r.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              items: c.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i))
            };
          })
        };
      })
    );

    if (selectedRestaurant?.id === restaurantId) {
      setSelectedRestaurant((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          categories: prev.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              items: c.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i))
            };
          })
        };
      });
    }
  };

  const updateRestaurantCommission = (restaurantId: string, newRate: number) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, commissionRate: newRate } : r))
    );
  };

  const toggleRestaurantStatus = (restaurantId: string) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id !== restaurantId) return r;
        const nextStatus = r.status === 'suspended' ? 'active' : 'suspended';
        return { ...r, status: nextStatus, isOpen: nextStatus === 'active' };
      })
    );
  };

  const updateRestaurantDetails = (restaurantId: string, updates: Partial<Restaurant>) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, ...updates } : r))
    );
    if (selectedRestaurant?.id === restaurantId) {
      setSelectedRestaurant((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteMenuItem = (restaurantId: string, categoryId: string, itemId: string) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id !== restaurantId) return r;
        return {
          ...r,
          categories: r.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              items: c.items.filter((i) => i.id !== itemId)
            };
          })
        };
      })
    );
    if (selectedRestaurant?.id === restaurantId) {
      setSelectedRestaurant((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          categories: prev.categories.map((c) => {
            if (c.id !== categoryId) return c;
            return {
              ...c,
              items: c.items.filter((i) => i.id !== itemId)
            };
          })
        };
      });
    }
  };

  // Available Deliveries for Rider
  const availableRiderOrders = useMemo(() => {
    if (activeRiderOrder) {
      // Rider already has an active delivery
      return [];
    }

    const list: Order[] = [];
    const seenIds = new Set<string>();

    if (riderDeliveryRequest && !dismissedDeliveryIds.includes(riderDeliveryRequest.id)) {
      list.push(riderDeliveryRequest);
      seenIds.add(riderDeliveryRequest.id);
    }

    // Orders marked as 'ready' (ready for pickup) or newly assigned in partnerOrders
    partnerOrders.forEach((o) => {
      if (
        (o.status === 'ready' || o.status === 'rider_assigned') &&
        !seenIds.has(o.id) &&
        !dismissedDeliveryIds.includes(o.id)
      ) {
        list.push(o);
        seenIds.add(o.id);
      }
    });

    allOrders.forEach((o) => {
      if (
        (o.status === 'ready' || o.status === 'rider_assigned') &&
        !seenIds.has(o.id) &&
        !dismissedDeliveryIds.includes(o.id)
      ) {
        list.push(o);
        seenIds.add(o.id);
      }
    });

    return list;
  }, [activeRiderOrder, riderDeliveryRequest, partnerOrders, allOrders, dismissedDeliveryIds]);

  // Rider Actions & Workflow
  const riderAcceptDelivery = (orderId?: string): { success: boolean; error?: string } => {
    if (riderOnboardingStatus !== 'approved') {
      return {
        success: false,
        error: 'Account verification required: Only approved delivery partners can accept orders.'
      };
    }

    if (activeRiderOrder) {
      return {
        success: false,
        error: `You already have active delivery #${activeRiderOrder.id} in progress. Complete it before accepting another order.`
      };
    }

    let targetOrder: Order | null = null;
    if (orderId) {
      targetOrder =
        availableRiderOrders.find((o) => o.id === orderId) ||
        partnerOrders.find((o) => o.id === orderId) ||
        allOrders.find((o) => o.id === orderId) ||
        null;
    } else {
      targetOrder = riderDeliveryRequest || availableRiderOrders[0] || null;
    }

    if (!targetOrder) {
      return { success: false, error: 'Order not found or no longer available for delivery.' };
    }

    if (
      targetOrder.status === 'picked_up' ||
      targetOrder.status === 'out_for_delivery' ||
      targetOrder.status === 'delivered'
    ) {
      return { success: false, error: `Order #${targetOrder.id} is already in transit or completed.` };
    }

    if (targetOrder.status === 'rejected' || targetOrder.status === 'cancelled') {
      return { success: false, error: `Order #${targetOrder.id} was cancelled by restaurant.` };
    }

    const assignedOrder: Order = {
      ...targetOrder,
      status: 'rider_assigned',
      rider: SAMPLE_RIDER
    };

    setActiveRiderOrder(assignedOrder);
    setRiderStep('heading_to_restaurant');

    if (riderDeliveryRequest?.id === assignedOrder.id) {
      setRiderDeliveryRequest(null);
    }

    // Sync partner orders, all orders, & customer current order
    setPartnerOrders((prev) =>
      prev.map((o) => (o.id === assignedOrder.id ? assignedOrder : o))
    );
    setAllOrders((prev) =>
      prev.map((o) => (o.id === assignedOrder.id ? assignedOrder : o))
    );
    if (currentOrder?.id === assignedOrder.id) {
      setCurrentOrder(assignedOrder);
    }

    return { success: true };
  };

  const riderRejectDelivery = (orderId?: string): { success: boolean; error?: string } => {
    if (orderId) {
      setDismissedDeliveryIds((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]));
      if (riderDeliveryRequest?.id === orderId) {
        setRiderDeliveryRequest(null);
      }
    } else {
      if (riderDeliveryRequest) {
        setDismissedDeliveryIds((prev) =>
          prev.includes(riderDeliveryRequest.id) ? prev : [...prev, riderDeliveryRequest.id]
        );
        setRiderDeliveryRequest(null);
      }
    }
    return { success: true };
  };

  const riderArriveAtRestaurant = (): { success: boolean; error?: string } => {
    if (!activeRiderOrder) {
      return { success: false, error: 'No active delivery order found.' };
    }
    if (riderStep !== 'heading_to_restaurant') {
      return { success: false, error: 'Rider is not en route to the restaurant.' };
    }
    setRiderStep('at_restaurant');
    return { success: true };
  };

  const riderVerifyPickup = (_otp?: string): { success: boolean; error?: string } => {
    if (!activeRiderOrder) {
      return { success: false, error: 'No active delivery order found.' };
    }

    if (
      activeRiderOrder.status !== 'ready' &&
      activeRiderOrder.status !== 'rider_assigned'
    ) {
      return {
        success: false,
        error: `Order is currently in status "${activeRiderOrder.status}" and cannot be picked up.`
      };
    }

    const updated: Order = {
      ...activeRiderOrder,
      status: 'picked_up'
    };

    setActiveRiderOrder(updated);
    setRiderStep('out_for_delivery');

    setPartnerOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
    setAllOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
    if (currentOrder?.id === updated.id) {
      setCurrentOrder(updated);
    }

    return { success: true };
  };

  const riderArriveAtCustomer = (): { success: boolean; error?: string } => {
    if (!activeRiderOrder) {
      return { success: false, error: 'No active delivery order found.' };
    }
    if (riderStep !== 'out_for_delivery') {
      return { success: false, error: 'Food must be picked up before arriving at customer doorstep.' };
    }
    setRiderStep('at_customer');
    return { success: true };
  };

  const riderCompleteDelivery = (otp: string): { success: boolean; error?: string } => {
    if (!activeRiderOrder) {
      return { success: false, error: 'No active delivery order to complete.' };
    }

    const cleanOtp = otp.trim();
    // Validate against fixed demo OTP 123456 or customer order OTP
    const isValid = cleanOtp === DEMO_OTP_CODE || cleanOtp === activeRiderOrder.deliveryOtp;

    if (!isValid) {
      return {
        success: false,
        error: `Invalid delivery verification OTP. In development demo mode, enter OTP: ${DEMO_OTP_CODE}`
      };
    }

    const updated: Order = {
      ...activeRiderOrder,
      status: 'delivered'
    };

    const payout = 45 + (activeRiderOrder.tipAmount || 30) + 15; // base fare + tip + surge
    setRiderEarningsToday((prev) => prev + payout);
    setRiderTripsToday((prev) => prev + 1);

    const completedTrip: CompletedTrip = {
      id: `TRIP-${Date.now().toString().slice(-4)}`,
      orderNumber: activeRiderOrder.id,
      restaurantName: activeRiderOrder.restaurant.name,
      restaurantArea: activeRiderOrder.restaurant.address || 'Indiranagar 100ft Rd',
      customerName: activeRiderOrder.customerName,
      customerArea: activeRiderOrder.deliveryAddress.addressLine,
      distanceKm: 3.2,
      durationMins: 18,
      deliveryFee: 45,
      customerTip: activeRiderOrder.tipAmount || 30,
      surgeBonus: 15,
      totalPayout: payout,
      completedAt: 'Just now',
      status: 'Completed'
    };

    setCompletedRiderTrips((prev) => [completedTrip, ...prev]);
    setActiveRiderOrder(null);
    setRiderStep('heading_to_restaurant');

    setPartnerOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
    setAllOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
    if (currentOrder?.id === updated.id) {
      setCurrentOrder(updated);
    }

    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    } catch {}

    return { success: true };
  };

  const submitRiderOnboarding = (appData: Omit<RiderOnboardingApplication, 'id' | 'status' | 'submittedAt'> & { id?: string }) => {
    const existing = allRiderApplications.find(
      (a) => a.phone === appData.phone || (appData.applicationRef && a.applicationRef === appData.applicationRef)
    );
    const newApp: RiderOnboardingApplication = {
      ...appData,
      id: existing ? existing.id : (appData.id || `APP-RDR-${Math.floor(1000 + Math.random() * 9000)}`),
      applicationRef: appData.applicationRef || (existing?.applicationRef || `APP-RDR-${Math.floor(1000 + Math.random() * 9000)}`),
      status: 'under_review',
      submittedAt: 'Just now',
      timeline: [
        ...(existing?.timeline || []),
        { action: 'Application Submitted', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Awaiting administrator verification.' }
      ]
    };
    setAllRiderApplications((prev) => {
      const filtered = prev.filter((a) => a.id !== newApp.id);
      return [newApp, ...filtered];
    });
    setPersistedRiderApp({
      ...newApp,
      full_name: newApp.fullName,
      phone: newApp.phone,
      email: newApp.email,
      city: newApp.city,
      vehicle_type: newApp.vehicleType,
      vehicle_number: newApp.vehicleNumber,
      metadata: {
        state: newApp.state,
        district: newApp.district,
        pincode: newApp.pincode,
        profile_photo: newApp.profilePhoto,
        residential_address: newApp.residentialAddress,
        gender: newApp.gender,
        dob: newApp.dob,
        blood_group: newApp.bloodGroup,
        vehicle_model: newApp.vehicleModel
      }
    });

    // Asynchronously persist to Supabase if connected
    if (supabase && (supabaseUser?.id || activeRiderApplicant?.id)) {
      const targetUserId = supabaseUser?.id || activeRiderApplicant?.id;
        Promise.resolve(
          supabase
            .from('rider_applications')
            .upsert(
              {
                user_id: targetUserId,
                application_ref: newApp.applicationRef,
                full_name: newApp.fullName,
                phone: newApp.phone,
                email: newApp.email || null,
                city: newApp.city,
                vehicle_type: newApp.vehicleType,
                vehicle_number: newApp.vehicleNumber || 'Pending',
                driving_license_number: newApp.drivingLicenseNumber || null,
                emergency_contact_name: newApp.emergencyContactName || null,
                emergency_contact_phone: newApp.emergencyContactPhone || null,
                status: 'submitted',
                submitted_at: new Date().toISOString(),
                metadata: {
                  state: newApp.state,
                  district: newApp.district,
                  pincode: newApp.pincode,
                  profile_photo: newApp.profilePhoto,
                  residential_address: newApp.residentialAddress,
                  gender: newApp.gender,
                  dob: newApp.dob,
                  blood_group: newApp.bloodGroup,
                  vehicle_model: newApp.vehicleModel
                }
              },
              { onConflict: 'application_ref' }
            )
        )
          .then(({ error }: any) => {
            if (error) {
              console.warn('Supabase rider application persistence notice:', error.message);
            }
          })
          .catch(() => {});
    }

    setRiderOnboardingStatus('under_review');
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const approveRiderKyc = (appId: string) => {
    setAllRiderApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'approved',
              timeline: [
                ...(a.timeline || []),
                { action: 'Approved', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Application verified and rider account activated.', by: 'Fleet Administrator' }
              ]
            }
          : a
      )
    );
    setRiderOnboardingStatus('approved');
    setIsRiderOnline(false);
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
  };

  const rejectRiderKyc = (appId: string, reason: string) => {
    setAllRiderApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'rejected',
              rejectionReason: reason,
              timeline: [
                ...(a.timeline || []),
                { action: 'Rejected', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: reason, by: 'Fleet Administrator' }
              ]
            }
          : a
      )
    );
    setRiderOnboardingStatus('rejected');
  };

  const requestResubmissionRiderKyc = (appId: string, reason: string) => {
    setAllRiderApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'action_required',
              rejectionReason: reason,
              resubmissionNote: reason,
              timeline: [
                ...(a.timeline || []),
                { action: 'Resubmission Requested', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: reason, by: 'Fleet Administrator' }
              ]
            }
          : a
      )
    );
    setRiderOnboardingStatus('action_required');
  };

  const loginDemoRider = () => {
    setDemoRiderUser({
      id: 'rdr-701',
      phone: '+91 98234 56789',
      fullName: 'Vikram Singh',
      role: 'rider',
      isDemo: true,
      createdAt: new Date().toISOString()
    });
    setRiderOnboardingStatus('approved');
    setIsRiderOnline(false);
  };

  const resetRiderOnboarding = () => {
    setRiderOnboardingStatus('not_started');
  };

  const triggerSimulatedCustomerOrder = () => {
    const dish = restaurants[0].categories[0].items[0];
    const demoOrder: Order = {
      id: `TOM-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Priya Sharma',
      customerPhone: '+91 98450 99881',
      restaurant: restaurants[0],
      items: [
        {
          id: `sim-item-${Date.now()}`,
          menuItem: dish,
          quantity: 2,
          itemTotal: dish.price * 2
        }
      ],
      itemTotal: dish.price * 2,
      totalAmount: dish.price * 2 + 55,
      deliveryFee: 40,
      platformFee: 5,
      taxAmount: 10,
      tipAmount: 20,
      discountAmount: 0,
      paymentMethod: 'upi',
      status: 'placed',
      createdAt: 'Just now',
      deliveryAddress: {
        label: 'Home',
        addressLine: 'Indiranagar 100ft Rd, 2nd Stage, Bengaluru'
      },
      pickupOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      deliveryOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      estimatedDeliveryTime: '22 mins'
    };
    setIncomingOrder(demoOrder);
    setPartnerOrders((prev) => [demoOrder, ...prev]);
    setAllOrders((prev) => [demoOrder, ...prev]);
  };

  const triggerSimulatedDeliveryRequest = () => {
    const dish = restaurants[0].categories[0].items[0];
    const demoReq: Order = {
      id: `TOM-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Aarav Nair',
      customerPhone: '+91 98201 44321',
      restaurant: restaurants[0],
      items: [
        {
          id: `req-item-${Date.now()}`,
          menuItem: dish,
          quantity: 1,
          itemTotal: dish.price
        }
      ],
      itemTotal: dish.price,
      totalAmount: dish.price + 65,
      deliveryFee: 45,
      platformFee: 5,
      taxAmount: 15,
      tipAmount: 30,
      discountAmount: 0,
      paymentMethod: 'upi',
      status: 'preparing',
      deliveryOtp: '7412',
      pickupOtp: '8910',
      createdAt: 'Just now',
      deliveryAddress: {
        label: 'Apartment',
        addressLine: 'Sobha Cinnamon, Harlur Road, Bengaluru'
      },
      estimatedDeliveryTime: '26 mins'
    };
    setRiderDeliveryRequest(demoReq);
  };

  // Demo walkthrough steps
  const DEMO_FLOW: {
    appMode: AppMode;
    customerScreen?: CustomerScreen;
    action?: () => void;
  }[] = [
    {
      appMode: 'customer',
      customerScreen: 'splash'
    },
    {
      appMode: 'customer',
      customerScreen: 'home'
    },
    {
      appMode: 'customer',
      customerScreen: 'search'
    },
    {
      appMode: 'customer',
      customerScreen: 'restaurant',
      action: () => {
        setSelectedRestaurant(RESTAURANTS[0]); // Behrouz Biryani
      }
    },
    {
      appMode: 'customer',
      customerScreen: 'cart',
      action: () => {
        // Pre-fill mouth-watering cart if empty
        if (cart.length === 0) {
          addToCart(RESTAURANTS[0].categories[0].items[0]); // Dum Gosht Biryani
          addToCart(RESTAURANTS[0].categories[0].items[1]); // Zaikedaar Paneer Biryani
        }
      }
    },
    {
      appMode: 'customer',
      customerScreen: 'order_tracking',
      action: () => {
        if (!currentOrder) {
          placeOrder('upi');
        }
      }
    },
    {
      appMode: 'partner',
      action: () => {
        // Partner app view
      }
    },
    {
      appMode: 'rider',
      action: () => {
        // Rider app view
      }
    },
    {
      appMode: 'admin',
      action: () => {
        // Admin operations view
      }
    }
  ];

  const startDemo = () => {
    setIsDemoActive(true);
    setDemoStep(1);
    applyDemoStep(1);
  };

  const applyDemoStep = (stepNumber: number) => {
    const config = DEMO_FLOW[stepNumber - 1];
    if (config) {
      setAppMode(config.appMode);
      if (config.customerScreen) {
        setCustomerScreen(config.customerScreen);
      }
      if (config.action) {
        config.action();
      }
    }
  };

  const nextDemoStep = () => {
    const next = demoStep + 1;
    if (next <= DEMO_FLOW.length) {
      setDemoStep(next);
      applyDemoStep(next);
    } else {
      stopDemo();
    }
  };

  const prevDemoStep = () => {
    const prev = demoStep - 1;
    if (prev >= 1) {
      setDemoStep(prev);
      applyDemoStep(prev);
    }
  };

  const stopDemo = () => {
    setIsDemoActive(false);
    setDemoStep(0);
  };

  return (
    <TomatttoContext.Provider
      value={{
        appMode,
        setAppMode,
        isDarkMode,
        toggleDarkMode,
        isPhoneFrame,
        setIsPhoneFrame,
        customerScreen,
        setCustomerScreen,
        restaurants,
        selectedRestaurant,
        setSelectedRestaurant,
        customizingItem,
        setCustomizingItem,
        cart,
        addToCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        currentOrder,
        setCurrentOrder,
        allOrders,
        isLoggedIn,
        loginUser,
        logoutUser,
        user,
        updateUserProfile,
        supabaseSession,
        supabaseUser,
        demoRiderUser,
        setDemoRiderUser,
        activeRiderApplicant,
        isSupabaseLoading,
        signOutSupabase,
        initializeRiderProfile,
        selectedAddress,
        setSelectedAddress,
        userAddresses,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        favorites,
        toggleFavorite,
        isFavorite,
        walletBalance,
        walletTransactions,
        topUpWallet,
        creditRefund,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        reviews,
        submitOrderReview,
        getOrderReview,
        riderMessages,
        sendRiderMessage,
        supportMessages,
        sendSupportMessage,
        searchQuery,
        setSearchQuery,
        selectedCuisine,
        setSelectedCuisine,
        vegOnlyFilter,
        setVegOnlyFilter,
        placeOrder,
        isPlacingOrder,
        orderError,
        incomingOrder,
        partnerOrders,
        partnerAcceptOrder,
        partnerStartPreparing,
        partnerMarkReady,
        partnerRejectOrder,
        partnerCancelOrder,
        menuStockMap,
        toggleItemStock,
        addMenuItem,
        updateMenuItem,
        coupons,
        addCoupon,
        updateRestaurantCommission,
        toggleRestaurantStatus,
        updateRestaurantDetails,
        deleteMenuItem,
        isRiderOnline,
        setIsRiderOnline,
        riderDeliveryRequest,
        activeRiderOrder,
        availableRiderOrders,
        riderStep,
        setRiderStep,
        riderAcceptDelivery,
        riderRejectDelivery,
        riderArriveAtRestaurant,
        riderVerifyPickup,
        riderArriveAtCustomer,
        riderCompleteDelivery,
        riderEarningsToday,
        riderTripsToday,
        completedRiderTrips,
        riderOnboardingStatus,
        setRiderOnboardingStatus,
        persistedRiderApp,
        fetchUserRiderApplication,
        allRiderApplications,
        submitRiderOnboarding,
        approveRiderKyc,
        rejectRiderKyc,
        requestResubmissionRiderKyc,
        loginDemoRider,
        resetRiderOnboarding,
        triggerSimulatedCustomerOrder,
        triggerSimulatedDeliveryRequest,
        demoStep,
        isDemoActive,
        startDemo,
        nextDemoStep,
        prevDemoStep,
        stopDemo
      }}
    >
      {children}
    </TomatttoContext.Provider>
  );
};

export const useTomattto = () => {
  const context = useContext(TomatttoContext);
  if (!context) {
    throw new Error('useTomattto must be used within a TomatttoProvider');
  }
  return context;
};
