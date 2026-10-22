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
  MenuItemAddon
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
  user: UserProfile;
  selectedAddress: string;
  setSelectedAddress: (addr: string) => void;

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
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(COUPONS[0]); // default 50% promo for excitement
  const [user] = useState<UserProfile>(INITIAL_USER);
  const [selectedAddress, setSelectedAddress] = useState<string>(INITIAL_USER.addresses[0].line);

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
        user,
        selectedAddress,
        setSelectedAddress,
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
