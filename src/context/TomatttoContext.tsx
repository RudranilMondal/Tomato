import React, { createContext, useContext, useState, useEffect } from 'react';
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
  RiderBankDetails
} from '../types';
import { RESTAURANTS, COUPONS, INITIAL_USER, SAMPLE_RIDER } from '../data/mockData';

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
  placeOrder: (paymentMethod: 'upi' | 'card' | 'cod') => void;

  // Partner State
  incomingOrder: Order | null;
  partnerOrders: Order[];
  partnerAcceptOrder: (orderId: string, prepMins?: number) => void;
  partnerRejectOrder: (orderId: string) => void;
  partnerMarkReady: (orderId: string) => void;
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
  riderStep: 'heading_to_restaurant' | 'pickup_otp' | 'out_for_delivery' | 'delivered';
  riderAcceptDelivery: () => void;
  riderRejectDelivery: () => void;
  riderVerifyPickup: (otp: string) => boolean;
  riderCompleteDelivery: (otp: string) => boolean;
  riderEarningsToday: number;
  riderTripsToday: number;

  // Rider Onboarding & KYC
  riderOnboardingStatus: RiderOnboardingStatus;
  setRiderOnboardingStatus: (status: RiderOnboardingStatus) => void;
  allRiderApplications: RiderOnboardingApplication[];
  submitRiderOnboarding: (app: Omit<RiderOnboardingApplication, 'id' | 'status' | 'submittedAt'>) => void;
  approveRiderKyc: (appId: string) => void;
  rejectRiderKyc: (appId: string, reason: string) => void;
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
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(COUPONS[0]); // default 50% promo for excitement
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [userAddresses, setUserAddresses] = useState(INITIAL_USER.addresses);
  const [selectedAddress, setSelectedAddress] = useState<string>(INITIAL_USER.addresses[0].line);

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
  const [partnerOrders, setPartnerOrders] = useState<Order[]>([]);
  const [menuStockMap, setMenuStockMap] = useState<Record<string, boolean>>({});

  // Rider
  const [isRiderOnline, setIsRiderOnline] = useState<boolean>(true);
  const [riderDeliveryRequest, setRiderDeliveryRequest] = useState<Order | null>(null);
  const [activeRiderOrder, setActiveRiderOrder] = useState<Order | null>(null);
  const [riderStep, setRiderStep] = useState<'heading_to_restaurant' | 'pickup_otp' | 'out_for_delivery' | 'delivered'>('heading_to_restaurant');
  const [riderEarningsToday, setRiderEarningsToday] = useState<number>(390);
  const [riderTripsToday, setRiderTripsToday] = useState<number>(6);

  // Rider Onboarding & KYC Applications
  const [riderOnboardingStatus, setRiderOnboardingStatus] = useState<RiderOnboardingStatus>('approved');
  const [allRiderApplications, setAllRiderApplications] = useState<RiderOnboardingApplication[]>([
    {
      id: 'APP-RDR-8921',
      fullName: 'Vikram Singh',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      phone: '+91 98451 92831',
      email: 'vikram.singh@example.com',
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
        drivingLicenseBack: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
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
  const placeOrder = (paymentMethod: 'upi' | 'card' | 'cod') => {
    if (!selectedRestaurant || cart.length === 0) return;

    const discountAmount = appliedCoupon
      ? Math.min(appliedCoupon.maxDiscount, (cartTotal * appliedCoupon.discountPercentage) / 100)
      : 0;
    const deliveryFee = appliedCoupon?.code === 'FREESHIP' ? 0 : 35;
    const platformFee = 5;
    const taxAmount = Math.round(cartTotal * 0.05);
    const tipAmount = 30;
    const totalAmount = cartTotal - discountAmount + deliveryFee + platformFee + taxAmount + tipAmount;

    const newOrder: Order = {
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

    setCurrentOrder(newOrder);
    setAllOrders((prev) => [newOrder, ...prev]);
    setIncomingOrder(newOrder); // Dispatches directly to Restaurant Partner App!
    setPartnerOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setCustomerScreen('order_success');
  };

  // Partner Actions
  const partnerAcceptOrder = (orderId: string, prepMins: number = 20) => {
    setPartnerOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'preparing' as OrderStatus } : o))
    );
    if (incomingOrder?.id === orderId) {
      const updated = { ...incomingOrder, status: 'preparing' as OrderStatus };
      setIncomingOrder(null);
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updated);
      }
      // Notify rider app of delivery request!
      setRiderDeliveryRequest(updated);
    }
  };

  const partnerRejectOrder = (orderId: string) => {
    setIncomingOrder(null);
    setPartnerOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const partnerMarkReady = (orderId: string) => {
    setPartnerOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'ready' as OrderStatus } : o))
    );
    if (currentOrder?.id === orderId) {
      setCurrentOrder((prev) => (prev ? { ...prev, status: 'ready' } : null));
    }
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

  // Rider Actions
  const riderAcceptDelivery = () => {
    if (!riderDeliveryRequest) return;
    const order = { ...riderDeliveryRequest, status: 'rider_assigned' as OrderStatus };
    setActiveRiderOrder(order);
    setRiderDeliveryRequest(null);
    setRiderStep('heading_to_restaurant');
    if (currentOrder?.id === order.id) {
      setCurrentOrder(order);
    }
  };

  const riderRejectDelivery = () => {
    setRiderDeliveryRequest(null);
  };

  const riderVerifyPickup = (_otp: string) => {
    if (!activeRiderOrder) return false;
    const updated = { ...activeRiderOrder, status: 'picked_up' as OrderStatus };
    setActiveRiderOrder(updated);
    setRiderStep('out_for_delivery');
    if (currentOrder?.id === updated.id) {
      setCurrentOrder(updated);
    }
    return true;
  };

  const riderCompleteDelivery = (_otp: string) => {
    if (!activeRiderOrder) return false;
    const updated = { ...activeRiderOrder, status: 'delivered' as OrderStatus };
    setActiveRiderOrder(null);
    setRiderStep('delivered');
    setRiderEarningsToday((prev) => prev + 65);
    setRiderTripsToday((prev) => prev + 1);
    if (currentOrder?.id === updated.id) {
      setCurrentOrder(updated);
    }
    return true;
  };

  const submitRiderOnboarding = (appData: Omit<RiderOnboardingApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApp: RiderOnboardingApplication = {
      ...appData,
      id: `APP-RDR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'under_review',
      submittedAt: 'Just now'
    };
    setAllRiderApplications((prev) => [newApp, ...prev]);
    setRiderOnboardingStatus('under_review');
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const approveRiderKyc = (appId: string) => {
    setAllRiderApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'approved' } : a))
    );
    setRiderOnboardingStatus('approved');
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
  };

  const rejectRiderKyc = (appId: string, reason: string) => {
    setAllRiderApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'rejected', rejectionReason: reason } : a))
    );
    setRiderOnboardingStatus('rejected');
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
        incomingOrder,
        partnerOrders,
        partnerAcceptOrder,
        partnerRejectOrder,
        partnerMarkReady,
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
        riderStep,
        riderAcceptDelivery,
        riderRejectDelivery,
        riderVerifyPickup,
        riderCompleteDelivery,
        riderEarningsToday,
        riderTripsToday,
        riderOnboardingStatus,
        setRiderOnboardingStatus,
        allRiderApplications,
        submitRiderOnboarding,
        approveRiderKyc,
        rejectRiderKyc,
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
