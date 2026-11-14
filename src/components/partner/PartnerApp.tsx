import React, { useState, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { Order } from '../../types';
import { AddDishModal } from './AddDishModal';
import { KitchenTicketModal } from './KitchenTicketModal';
import { RejectOrderModal } from './RejectOrderModal';
import { OutletProfileModal } from './OutletProfileModal';
import { RestaurantOnboardingWizard } from './RestaurantOnboardingWizard';
import { PartnerApplicationStatus } from './PartnerApplicationStatus';
import { UnifiedAuthModal } from '../auth/UnifiedAuthModal';
import {
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  Utensils,
  DollarSign,
  TrendingUp,
  Power,
  ChevronRight,
  X,
  Plus,
  FileText,
  MessageSquare,
  Send,
  Star,
  Zap,
  Sparkles,
  ChefHat,
  Users,
  ToggleLeft,
  ToggleRight,
  BarChart2,
  Tag,
  Percent,
  ArrowUpRight,
  Flame,
  Award,
  Search,
  LayoutGrid,
  ListFilter,
  Bike,
  ShieldAlert,
  CreditCard,
  MapPin,
  User,
  Check,
  LogIn,
  LogOut,
  Building,
  ChevronDown
} from 'lucide-react';

export const PartnerApp: React.FC = () => {
  const {
    selectedRestaurant,
    restaurants,
    incomingOrder,
    partnerOrders,
    partnerAcceptOrder,
    partnerStartPreparing,
    partnerMarkReady,
    partnerRejectOrder,
    partnerCancelOrder,
    menuStockMap,
    toggleItemStock,
    triggerSimulatedCustomerOrder,
    partnerSession,
    loginPartner,
    logoutPartner,
    switchPartnerRestaurant,
    partnerRestaurants,
    selectedPartnerRestaurant,
    allRestaurantApplications
  } = useTomattto();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'earnings' | 'reviews' | 'marketing' | 'analytics' | 'application_status'>('orders');
  const [isOnline, setIsOnline] = useState(true);
  const [isRushMode, setIsRushMode] = useState(false);
  const [isAutoAccept, setIsAutoAccept] = useState(false);
  const [isSoundAlert, setIsSoundAlert] = useState(true);
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOutletDropdownOpen, setIsOutletDropdownOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  // Phase 1: Order Dashboard Controls State
  const [orderFilter, setOrderFilter] = useState<'all' | 'placed' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'rejected'>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [incomingPrepMins, setIncomingPrepMins] = useState(20);
  const [cardPrepMins, setCardPrepMins] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAcceptOrder = (orderId: string, prepMins: number = 20) => {
    const res = partnerAcceptOrder(orderId, prepMins);
    if (res.success) {
      setToast({ type: 'success', message: `Order #${orderId} accepted! Estimated prep set to ${prepMins} mins.` });
    } else {
      setToast({ type: 'error', message: res.error || 'Failed to accept order.' });
    }
  };

  const handleStartPreparing = (orderId: string) => {
    const res = partnerStartPreparing(orderId);
    if (res.success) {
      setToast({ type: 'success', message: `Order #${orderId} sent to kitchen line! Preparation started.` });
    } else {
      setToast({ type: 'error', message: res.error || 'Failed to start cooking.' });
    }
  };

  const handleMarkReady = (orderId: string) => {
    const res = partnerMarkReady(orderId);
    if (res.success) {
      setToast({ type: 'success', message: `Order #${orderId} marked ready! Packaging sealed & pickup OTP active.` });
    } else {
      setToast({ type: 'error', message: res.error || 'Failed to mark order ready.' });
    }
  };

  const handleRejectConfirm = (orderId: string, reason: string) => {
    const res = partnerRejectOrder(orderId, reason);
    if (res.success) {
      setToast({ type: 'success', message: `Order #${orderId} rejected (${reason}). Customer notified and refund issued.` });
    } else {
      setToast({ type: 'error', message: res.error || 'Failed to reject order.' });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Marketing campaigns state
  const [campaigns, setCampaigns] = useState([
    {
      id: 'cmp-1',
      title: 'Flat ₹75 OFF on Dum Biryanis',
      minOrder: 299,
      status: 'Active',
      ordersGenerated: 42,
      gmvGenerated: 16800,
      badgeColor: 'var(--color-veg)'
    },
    {
      id: 'cmp-2',
      title: 'Free Thums Up / Mint Chaas on combos',
      minOrder: 399,
      status: 'Active',
      ordersGenerated: 28,
      gmvGenerated: 12400,
      badgeColor: 'var(--color-primary)'
    }
  ]);
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoMin, setNewPromoMin] = useState('349');

  // Partner reviews & replies state
  const [merchantReplies, setMerchantReplies] = useState<Record<string, string>>({
    'rev-1': 'Thank you Ananya! We slow-cook our gosht for 4 hours. Glad you loved the dum aroma!'
  });
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});

  const restaurant = selectedPartnerRestaurant || selectedRestaurant || restaurants[0];

  // Sound chime when incoming order arrives
  useEffect(() => {
    if (incomingOrder) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      } catch {
        // audio context not allowed before interaction
      }
    }
  }, [incomingOrder]);

  // If user opens the Become a Restaurant Partner Onboarding Wizard
  if (isOnboardingOpen) {
    return <RestaurantOnboardingWizard onBack={() => setIsOnboardingOpen(false)} />;
  }

  // 1. Unauthenticated or Not Registered: Render Partner Portal Gateway
  if (!partnerSession || partnerSession.status === 'not_registered') {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#0F0F12',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          color: '#FFFFFF'
        }}
      >
        <div style={{ maxWidth: '880px', width: '100%' }}>
          {/* Header & Logo */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: 'var(--color-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                marginBottom: '16px',
                boxShadow: '0 8px 24px rgba(255, 75, 58, 0.4)'
              }}
            >
              🏪
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
              Tomattto Merchant Partner Portal
            </h1>
            <p style={{ fontSize: '15px', color: '#9CA3AF', margin: 0, maxWidth: '580px', marginInline: 'auto', lineHeight: 1.5 }}>
              Manage your live kitchen tickets, menu availability, multi-outlet analytics, and daily earnings on India’s fastest food delivery network.
            </p>
          </div>

          {/* Two Distinguishable Options: Existing Partner Login vs Become a Partner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobileScreen ? '1fr' : '1fr 1fr',
              gap: '24px',
              marginBottom: '32px'
            }}
          >
            {/* Card 1: Existing Restaurant Partner Login */}
            <div
              style={{
                backgroundColor: '#18181D',
                borderRadius: '20px',
                border: '2px solid rgba(255, 75, 58, 0.4)',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(255, 75, 58, 0.15)',
                  color: 'var(--color-primary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '100px',
                  textTransform: 'uppercase'
                }}
              >
                Registered Outlets
              </div>

              <div>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 75, 58, 0.15)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px'
                  }}
                >
                  <LogIn size={26} />
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>
                  Existing Restaurant Partner Login
                </h2>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px', lineHeight: 1.5 }}>
                  Already registered your kitchen with Tomattto? Log in with your registered phone number, OTP, email, or Google to manage your store directly.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D1D5DB' }}>
                    <CheckCircle2 size={15} color="var(--color-veg)" />
                    <span>Real-time Live Order Receiving & Kitchen Prep</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D1D5DB' }}>
                    <CheckCircle2 size={15} color="var(--color-veg)" />
                    <span>Menu Price, Addon, & Out-of-Stock Controls</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D1D5DB' }}>
                    <CheckCircle2 size={15} color="var(--color-veg)" />
                    <span>Multi-Outlet Switcher & Daily Financial Payouts</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(255, 75, 58, 0.35)'
                  }}
                >
                  <LogIn size={16} />
                  <span>Log In to Partner Portal</span>
                </button>
              </div>
            </div>

            {/* Card 2: Become a Restaurant Partner */}
            <div
              style={{
                backgroundColor: '#18181D',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(46, 204, 113, 0.15)',
                  color: 'var(--color-veg)',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '100px',
                  textTransform: 'uppercase'
                }}
              >
                New Partner
              </div>

              <div>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(46, 204, 113, 0.15)',
                    color: 'var(--color-veg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px'
                  }}
                >
                  <ChefHat size={26} />
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px' }}>
                  Become a Restaurant Partner
                </h2>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px', lineHeight: 1.5 }}>
                  Expand your business reach. Partner with Tomattto to receive online orders, leverage our high-speed delivery fleet, and grow your brand.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D1D5DB' }}>
                    <CheckCircle2 size={15} color="var(--color-veg)" />
                    <span>Simple 4-Step Registration with Digital FSSAI & PAN</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D1D5DB' }}>
                    <CheckCircle2 size={15} color="var(--color-veg)" />
                    <span>Transparent Commission & Weekly / Daily Bank Settlements</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#D1D5DB' }}>
                    <CheckCircle2 size={15} color="var(--color-veg)" />
                    <span>Free Dedicated Merchant Partner Manager Support</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(true)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={16} />
                  <span>Register New Restaurant</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Demo Access Bar */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              backgroundColor: '#141418',
              border: '1px dashed rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>⚡</span>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                  Development Demo Shortcut:
                </span>
                <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '6px' }}>
                  Log in immediately as verified multi-outlet partner Behrouz Biryani & Truffles.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                loginPartner({
                  user: {
                    id: 'demo-partner-behrouz',
                    fullName: 'Faasos Hospitality Ltd',
                    phone: '+91 98765 43210'
                  },
                  status: 'approved',
                  restaurant: restaurants[0],
                  restaurants: restaurants.slice(0, 3)
                });
                setToast({ type: 'success', message: 'Logged in as Approved Merchant Partner (Behrouz Biryani)' });
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Demo Partner One-Click Login ➔
            </button>
          </div>
        </div>

        <UnifiedAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          role="restaurant_owner"
          onSuccess={() => {
            setIsAuthModalOpen(false);
          }}
        />
      </div>
    );
  }

  // 2. Pending Application Status View
  if (partnerSession.status === 'pending') {
    const app = partnerSession.application || allRestaurantApplications[0];
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#0F0F12',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 20px',
          color: '#FFFFFF'
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#18181D',
            borderRadius: '20px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '32px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}
          >
            <Clock size={32} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', margin: '0 0 8px' }}>
            Application Under Review
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.5 }}>
            Thank you for applying to partner with Tomattto. Your documents and FSSAI credentials are currently being verified by our compliance team.
          </p>

          <div style={{ backgroundColor: '#101014', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#9CA3AF' }}>Application Reference:</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{app?.applicationRef || 'TOM-REST-9481'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#9CA3AF' }}>Restaurant Name:</span>
              <span style={{ fontWeight: 700 }}>{app?.restaurantName || 'Royal Biryani & Kebabs'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
              <span style={{ color: '#9CA3AF' }}>Review SLA:</span>
              <span style={{ fontWeight: 700, color: '#F59E0B' }}>24 - 48 Business Hours</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActiveTab('application_status')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Detailed Status Timeline
            </button>
            <button
              onClick={logoutPartner}
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Action Required / Needs Resubmission
  if (partnerSession.status === 'action_required') {
    const app = partnerSession.application || allRestaurantApplications[0];
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#0F0F12',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 20px',
          color: '#FFFFFF'
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#18181D',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '32px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}
          >
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', margin: '0 0 8px' }}>
            Action Required on Application
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
            Our compliance team reviewed your application and noted items that need clarification or resubmission before clearance.
          </p>

          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: '#F87171', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
              Reviewer Comments:
            </div>
            <div style={{ fontSize: '13px', color: '#FFFFFF', lineHeight: 1.5 }}>
              {app?.rejectionReason || 'Please upload a clear scanned copy of your FSSAI certificate. The previously submitted photo was blurry or obscured at the license number section.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Update Documents & Resubmit
            </button>
            <button
              onClick={logoutPartner}
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: '#9CA3AF',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Rejected Application View
  if (partnerSession.status === 'rejected') {
    const app = partnerSession.application || allRestaurantApplications[0];
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#0F0F12',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 20px',
          color: '#FFFFFF'
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#18181D',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '32px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', margin: '0 0 8px' }}>
            Application Not Approved
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
            We regret to inform you that your restaurant partner onboarding application could not be approved at this time.
          </p>

          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: '#F87171', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
              Rejection Reason:
            </div>
            <div style={{ fontSize: '13px', color: '#FFFFFF', lineHeight: 1.5 }}>
              {app?.rejectionReason || 'FSSAI License registration details could not be validated against national regulatory registries.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Re-apply with New Documents
            </button>
            <button
              onClick={logoutPartner}
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: '#9CA3AF',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Suspended Outlet View
  if (partnerSession.status === 'suspended') {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#0F0F12',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 20px',
          color: '#FFFFFF'
        }}
      >
        <div
          style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#18181D',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '32px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px' }}>
            Outlet Account Suspended
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 24px', lineHeight: 1.5 }}>
            This restaurant account has been temporarily suspended due to compliance, license expiry, or policy audit review.
          </p>

          <button
            onClick={logoutPartner}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Log Out & Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        paddingBottom: '30px'
      }}
    >
      {/* Partner Header */}
      <div
        style={{
          backgroundColor: '#1E1E24',
          color: '#FFFFFF',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px'
              }}
            >
              🏪
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>{restaurant.name}</h3>
                <span
                  style={{
                    backgroundColor: isOnline ? 'var(--color-veg)' : '#737380',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {isOnline ? 'ACCEPTING ORDERS' : 'OFFLINE'}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#A5A5B2', marginTop: '2px' }}>
                Restaurant Partner Terminal • ID: REST-7029
              </p>
            </div>
          </div>

          {/* Right Header Buttons: Outlet Switcher, Become Partner, KYC Profile, Online Toggle & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {partnerRestaurants.length > 1 && (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsOutletDropdownOpen(!isOutletDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Switch Outlets"
                >
                  <Building size={13} color="var(--color-primary)" />
                  <span>Outlets ({partnerRestaurants.length})</span>
                  <ChevronDown size={12} />
                </button>

                {isOutletDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '6px',
                      backgroundColor: '#1E1E24',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '6px',
                      minWidth: '220px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      zIndex: 1000
                    }}
                  >
                    <div style={{ fontSize: '10px', color: '#9CA3AF', padding: '6px 8px', fontWeight: 700, textTransform: 'uppercase' }}>
                      Your Outlets
                    </div>
                    {partnerRestaurants.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          switchPartnerRestaurant(r.id);
                          setIsOutletDropdownOpen(false);
                          setToast({ type: 'success', message: `Switched active outlet to ${r.name}` });
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          backgroundColor: r.id === restaurant.id ? 'rgba(255, 75, 58, 0.15)' : 'transparent',
                          color: r.id === restaurant.id ? 'var(--color-primary)' : '#FFFFFF',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: r.id === restaurant.id ? 800 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{r.name}</span>
                        {r.id === restaurant.id && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsOnboardingOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px var(--color-primary-glow)'
              }}
              title="Register a new restaurant or outlet with Tomattto"
            >
              <Plus size={13} />
              <span>Become a Partner</span>
            </button>

            <button
              onClick={() => setActiveTab('application_status')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeTab === 'application_status' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer'
              }}
              title="Track Application Status"
            >
              <FileText size={13} color={activeTab === 'application_status' ? '#FFFFFF' : '#60A5FA'} />
              <span>Application Status</span>
            </button>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer'
              }}
              title="View FSSAI & Operating Timings"
            >
              <Store size={13} color="var(--color-primary)" />
              <span>KYC & Profile</span>
            </button>

            {/* Online Toggle Switch */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isOnline ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: isOnline ? 'var(--color-veg)' : '#FFFFFF',
                border: `1.5px solid ${isOnline ? 'var(--color-veg)' : 'rgba(255,255,255,0.2)'}`,
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              <Power size={14} />
              <span>{isOnline ? 'Online' : 'Go Online'}</span>
            </button>

            {/* Logout Partner Button */}
            <button
              onClick={logoutPartner}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#F87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Sign out of Partner Terminal"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginTop: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '12px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div>
            <span style={{ fontSize: '10px', color: '#A5A5B2', display: 'block' }}>Today's Orders</span>
            <span style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF' }}>
              {partnerOrders.length + 18}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#A5A5B2', display: 'block' }}>Revenue (Gross)</span>
            <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-veg)' }}>
              ₹12,480
            </span>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#A5A5B2', display: 'block' }}>Avg Prep Time</span>
            <span style={{ fontSize: '17px', fontWeight: 800, color: '#FFB400' }}>
              19 mins
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px',
            overflowX: 'auto',
            paddingBottom: '2px'
          }}
        >
          {[
            { id: 'orders', label: 'Live Orders', icon: <Utensils size={14} /> },
            { id: 'menu', label: 'Menu & Stock', icon: <Store size={14} /> },
            { id: 'marketing', label: 'Promotions & Ads', icon: <Tag size={14} /> },
            { id: 'analytics', label: 'Live Analytics', icon: <BarChart2 size={14} /> },
            { id: 'earnings', label: 'Payouts', icon: <DollarSign size={14} /> },
            { id: 'reviews', label: 'Reviews (4.7 ★)', icon: <MessageSquare size={14} /> },
            { id: 'application_status', label: 'Application Status', icon: <FileText size={14} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#FFFFFF' : '#A5A5B2',
                  fontSize: '12px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body */}
      <div style={{ flex: 1, padding: '20px', maxWidth: '1060px', margin: '0 auto', width: '100%' }}>
        {/* Operation Toast Notification */}
        {toast && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: toast.type === 'success' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
              border: `1.5px solid ${toast.type === 'success' ? 'var(--color-veg)' : '#E74C3C'}`,
              color: toast.type === 'success' ? 'var(--color-veg)' : '#E74C3C',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-md)',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'currentColor',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Incoming Order Alert Banner */}
        {incomingOrder && (
          <div
            style={{
              backgroundColor: 'var(--color-primary-light)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-glow)',
              animation: 'pulseGlow 2s infinite'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'floatRide 1s infinite'
                  }}
                >
                  <Bell size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--color-primary)' }}>
                    🔥 NEW ORDER RECEIVED! (#{incomingOrder.id})
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-main)', marginTop: '2px' }}>
                    Customer: <b>{incomingOrder.customerName}</b> ({incomingOrder.customerPhone}) • {incomingOrder.items.length} items • <b>₹{incomingOrder.totalAmount}</b> ({incomingOrder.paymentMethod.toUpperCase()})
                  </p>
                </div>
              </div>

              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--color-primary)' }}>
                Action Required
              </span>
            </div>

            {/* Special cooking notes / dietary warning if present */}
            {incomingOrder.specialCookingInstructions && (
              <div
                style={{
                  backgroundColor: '#FFF9E6',
                  border: '1px solid #FFB400',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  margin: '10px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px'
                }}
              >
                <AlertCircle size={15} color="#D35400" />
                <span style={{ fontWeight: 700, color: '#D35400' }}>Note:</span>
                <span style={{ color: '#1E1E24' }}>"{incomingOrder.specialCookingInstructions}"</span>
              </div>
            )}

            {/* Items inside incoming order */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                margin: '12px 0',
                border: '1px solid var(--color-border)'
              }}
            >
              {incomingOrder.items.map((i) => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <span>{i.quantity}x {i.menuItem.name} {i.selectedVariant ? `(${i.selectedVariant.name})` : ''}</span>
                  <span>₹{i.itemTotal}</span>
                </div>
              ))}
            </div>

            {/* Action buttons & Prep Time Selector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)' }}>Estimated Prep:</span>
                {[15, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setIncomingPrepMins(mins)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: incomingPrepMins === mins ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: incomingPrepMins === mins ? '#FFFFFF' : 'var(--color-text-main)',
                      border: `1px solid ${incomingPrepMins === mins ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setInspectedOrder(incomingOrder)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-main)',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  View KOT
                </button>

                <button
                  onClick={() => setRejectOrderId(incomingOrder.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    color: '#E74C3C',
                    border: '1.5px solid #E74C3C',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Reject Order
                </button>

                <button
                  onClick={() => handleAcceptOrder(incomingOrder.id, incomingPrepMins)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-veg)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Accept ({incomingPrepMins} mins)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Live Restaurant Partner Orders Dashboard */}
        {activeTab === 'orders' && (() => {
          const counts = {
            all: partnerOrders.length,
            placed: partnerOrders.filter((o) => o.status === 'placed').length,
            accepted: partnerOrders.filter((o) => o.status === 'accepted').length,
            preparing: partnerOrders.filter((o) => o.status === 'preparing').length,
            ready: partnerOrders.filter((o) => o.status === 'ready' || o.status === 'rider_assigned').length,
            delivered: partnerOrders.filter((o) => o.status === 'delivered' || o.status === 'picked_up' || o.status === 'out_for_delivery').length,
            rejected: partnerOrders.filter((o) => o.status === 'rejected' || o.status === 'cancelled').length
          };

          const filterOptions: { id: typeof orderFilter; label: string; count: number; badgeColor?: string }[] = [
            { id: 'all', label: 'All Orders', count: counts.all },
            { id: 'placed', label: 'New', count: counts.placed, badgeColor: '#E74C3C' },
            { id: 'accepted', label: 'Accepted', count: counts.accepted, badgeColor: '#2980B9' },
            { id: 'preparing', label: 'Preparing', count: counts.preparing, badgeColor: '#E67E22' },
            { id: 'ready', label: 'Ready for Pickup', count: counts.ready, badgeColor: 'var(--color-veg)' },
            { id: 'delivered', label: 'Completed', count: counts.delivered, badgeColor: '#27AE60' },
            { id: 'rejected', label: 'Rejected / Cancelled', count: counts.rejected, badgeColor: '#7F8C8D' }
          ];

          const getFilteredOrders = (statusCategory: typeof orderFilter) => {
            let list = partnerOrders;
            if (statusCategory === 'placed') list = list.filter((o) => o.status === 'placed');
            else if (statusCategory === 'accepted') list = list.filter((o) => o.status === 'accepted');
            else if (statusCategory === 'preparing') list = list.filter((o) => o.status === 'preparing');
            else if (statusCategory === 'ready') list = list.filter((o) => o.status === 'ready' || o.status === 'rider_assigned');
            else if (statusCategory === 'delivered') list = list.filter((o) => o.status === 'delivered' || o.status === 'picked_up' || o.status === 'out_for_delivery');
            else if (statusCategory === 'rejected') list = list.filter((o) => o.status === 'rejected' || o.status === 'cancelled');

            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase().trim();
              list = list.filter(
                (o) =>
                  o.id.toLowerCase().includes(q) ||
                  o.customerName.toLowerCase().includes(q) ||
                  o.customerPhone.toLowerCase().includes(q) ||
                  o.items.some((item) => item.menuItem.name.toLowerCase().includes(q))
              );
            }
            return list;
          };

          const renderCard = (order: Order) => {
            const prepMins = cardPrepMins[order.id] || order.estimatedPrepMinutes || 20;

            const getPill = (status: Order['status']) => {
              switch (status) {
                case 'placed':
                  return { label: 'NEW', bg: 'rgba(231, 76, 60, 0.15)', text: '#E74C3C', border: '#E74C3C' };
                case 'accepted':
                  return { label: 'ACCEPTED', bg: 'rgba(52, 152, 219, 0.15)', text: '#2980B9', border: '#3498DB' };
                case 'preparing':
                  return { label: 'COOKING', bg: 'rgba(230, 126, 34, 0.15)', text: '#D35400', border: '#E67E22' };
                case 'ready':
                case 'rider_assigned':
                  return { label: 'READY FOR PICKUP', bg: 'rgba(46, 204, 113, 0.15)', text: 'var(--color-veg)', border: 'var(--color-veg)' };
                case 'delivered':
                case 'picked_up':
                case 'out_for_delivery':
                  return { label: 'COMPLETED', bg: 'rgba(39, 174, 96, 0.12)', text: '#27AE60', border: '#27AE60' };
                case 'rejected':
                case 'cancelled':
                  return { label: status.toUpperCase(), bg: 'rgba(127, 140, 141, 0.15)', text: '#7F8C8D', border: '#95A5A6' };
                default:
                  return { label: status, bg: 'var(--color-surface-muted)', text: 'var(--color-text-main)', border: 'var(--color-border)' };
              }
            };

            const pill = getPill(order.status);

            return (
              <div
                key={order.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-surface)',
                  border: `1.5px solid ${order.status === 'placed' ? '#E74C3C' : 'var(--color-border)'}`,
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="var(--color-primary)" />
                      <span style={{ fontSize: '14px', fontWeight: 900 }}>#{order.id}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          backgroundColor: pill.bg,
                          color: pill.text,
                          border: `1px solid ${pill.border}`,
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {pill.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Placed: <b>{order.createdAt}</b> {order.estimatedPrepMinutes ? `• Prep Est: ${order.estimatedPrepMinutes}m` : ''}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--color-text-main)' }}>
                      ₹{order.totalAmount}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                      {order.paymentMethod.toUpperCase()} • {order.paymentStatus ? order.paymentStatus.toUpperCase() : 'CAPTURED'}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-muted)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    color: 'var(--color-text-main)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700 }}>{order.customerName}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{order.customerPhone}</span>
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                    {order.deliveryAddress.addressLine}
                  </div>
                </div>

                {/* Dietary / Chef Instructions Alert */}
                {order.specialCookingInstructions && (
                  <div
                    style={{
                      backgroundColor: '#FFF9E6',
                      border: '1px solid #FFB400',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <AlertCircle size={14} color="#D35400" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#D35400', fontWeight: 700 }}>Chef:</span>
                    <span style={{ color: '#1E1E24', fontWeight: 600 }}>"{order.specialCookingInstructions}"</span>
                  </div>
                )}

                {/* Rejection / Cancellation Reason if terminal */}
                {(order.status === 'rejected' || order.status === 'cancelled') && (
                  <div
                    style={{
                      backgroundColor: 'rgba(231, 76, 60, 0.08)',
                      border: '1px solid #E74C3C',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      fontSize: '11px',
                      color: '#E74C3C',
                      fontWeight: 600
                    }}
                  >
                    Reason: {order.rejectionReason || order.cancellationReason || 'Order cancelled'} (Refund: {order.paymentStatus || 'refunded'})
                  </div>
                )}

                {/* Item List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  {order.items.map((i) => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>
                        {i.quantity}x {i.menuItem.name} {i.selectedVariant ? `(${i.selectedVariant.name})` : ''}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>₹{i.itemTotal}</span>
                    </div>
                  ))}
                </div>

                {/* Assigned Rider Info (if present) */}
                {order.rider && (
                  <div
                    style={{
                      backgroundColor: 'rgba(52, 152, 219, 0.08)',
                      border: '1px solid rgba(52, 152, 219, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 10px',
                      fontSize: '11px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Bike size={14} color="var(--color-primary)" />
                      <span>Rider: <b>{order.rider.name}</b> ({order.rider.vehicleNumber})</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{order.rider.phone}</span>
                  </div>
                )}

                {/* Pickup OTP code box if Ready */}
                {(order.status === 'ready' || order.status === 'rider_assigned') && (
                  <div
                    style={{
                      backgroundColor: 'rgba(46, 204, 113, 0.1)',
                      border: '1px dashed var(--color-veg)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--color-veg)'
                    }}
                  >
                    📦 Bag Packed • Rider Pickup OTP: <span style={{ letterSpacing: '1px' }}>{order.pickupOtp}</span>
                  </div>
                )}

                {/* Strict Order Lifecycle Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  {/* Status = PLACED */}
                  {order.status === 'placed' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Set Prep:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[15, 20, 30, 45].map((mins) => (
                            <button
                              key={mins}
                              onClick={() => setCardPrepMins((prev) => ({ ...prev, [order.id]: mins }))}
                              style={{
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '10px',
                                fontWeight: 700,
                                backgroundColor: prepMins === mins ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                                color: prepMins === mins ? '#FFFFFF' : 'var(--color-text-main)',
                                border: `1px solid ${prepMins === mins ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                cursor: 'pointer'
                              }}
                            >
                              {mins}m
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setRejectOrderId(order.id)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'transparent',
                            color: '#E74C3C',
                            border: '1px solid #E74C3C',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAcceptOrder(order.id, prepMins)}
                          style={{
                            flex: 2,
                            padding: '8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-veg)',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 800,
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(46, 204, 113, 0.25)'
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Accept ({prepMins}m)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status = ACCEPTED */}
                  {order.status === 'accepted' && (
                    <button
                      onClick={() => handleStartPreparing(order.id)}
                      style={{
                        width: '100%',
                        padding: '9px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#E67E22',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 800,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(230, 126, 34, 0.25)'
                      }}
                    >
                      <ChefHat size={14} />
                      <span>Start Preparing in Kitchen</span>
                    </button>
                  )}

                  {/* Status = PREPARING */}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleMarkReady(order.id)}
                      style={{
                        width: '100%',
                        padding: '9px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-veg)',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 800,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(46, 204, 113, 0.25)'
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Ready for Pickup</span>
                    </button>
                  )}

                  {/* Secondary Details & KOT button */}
                  <button
                    onClick={() => setInspectedOrder(order)}
                    style={{
                      width: '100%',
                      padding: '7px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-muted)',
                      color: 'var(--color-text-main)',
                      border: '1px solid var(--color-border)',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <FileText size={13} />
                    <span>View Full KOT Ticket</span>
                  </button>
                </div>
              </div>
            );
          };

          const kanbanColumns: { id: typeof orderFilter; title: string; icon: string; orders: Order[]; color: string }[] = [
            { id: 'placed', title: 'New Orders', icon: '🔴', orders: getFilteredOrders('placed'), color: '#E74C3C' },
            { id: 'accepted', title: 'Accepted', icon: '🔵', orders: getFilteredOrders('accepted'), color: '#2980B9' },
            { id: 'preparing', title: 'Preparing in Kitchen', icon: '🍳', orders: getFilteredOrders('preparing'), color: '#E67E22' },
            { id: 'ready', title: 'Ready for Pickup', icon: '🛵', orders: getFilteredOrders('ready'), color: 'var(--color-veg)' },
            { id: 'delivered', title: 'Completed', icon: '✅', orders: getFilteredOrders('delivered'), color: '#27AE60' },
            { id: 'rejected', title: 'Rejected / Cancelled', icon: '⛔', orders: getFilteredOrders('rejected'), color: '#7F8C8D' }
          ];

          return (
            <div>
              {/* Top Operational Controls Bar */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  backgroundColor: 'var(--color-surface)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 900 }}>Kitchen Display System (KDS)</h3>
                    {counts.placed > 0 && (
                      <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#E74C3C', color: '#FFFFFF', padding: '2px 7px', borderRadius: '10px', animation: 'pulse 1.5s infinite' }}>
                        {counts.placed} NEW
                      </span>
                    )}
                    {isRushMode && (
                      <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#E74C3C', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px' }}>
                        🔥 RUSH MODE (+10m)
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Live lifecycle tracker • Unidirectional progression with strict verification
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {/* View Switcher */}
                  <div
                    style={{
                      display: 'flex',
                      backgroundColor: 'var(--color-surface-muted)',
                      padding: '3px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <button
                      onClick={() => setViewMode('kanban')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: viewMode === 'kanban' ? 'var(--color-surface)' : 'transparent',
                        color: viewMode === 'kanban' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: viewMode === 'kanban' ? 'var(--shadow-sm)' : 'none'
                      }}
                    >
                      <LayoutGrid size={13} />
                      <span>Kanban</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: viewMode === 'list' ? 'var(--color-surface)' : 'transparent',
                        color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none'
                      }}
                    >
                      <ListFilter size={13} />
                      <span>List View</span>
                    </button>
                  </div>

                  {/* Simulate Order Button */}
                  <button
                    onClick={triggerSimulatedCustomerOrder}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px var(--color-primary-glow)'
                    }}
                  >
                    <Zap size={13} fill="#FFFFFF" />
                    <span>Simulate Order</span>
                  </button>

                  {/* Rush Toggle */}
                  <button
                    onClick={() => setIsRushMode(!isRushMode)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isRushMode ? 'rgba(231, 76, 60, 0.15)' : 'var(--color-surface-muted)',
                      color: isRushMode ? '#E74C3C' : 'var(--color-text-main)',
                      border: `1px solid ${isRushMode ? '#E74C3C' : 'var(--color-border)'}`,
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Flame size={13} color={isRushMode ? '#E74C3C' : 'var(--color-text-muted)'} />
                    <span>{isRushMode ? 'Rush ON' : 'Rush Mode'}</span>
                  </button>
                </div>
              </div>

              {/* Status Tabs Filter Bar & Search */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '18px'
                }}
              >
                {/* Horizontal Filter Tabs */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '4px'
                  }}
                  className="no-scrollbar"
                >
                  {filterOptions.map((opt) => {
                    const isSelected = orderFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setOrderFilter(opt.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                          color: isSelected ? '#FFFFFF' : 'var(--color-text-main)',
                          border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                        }}
                      >
                        <span>{opt.label}</span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '10px',
                            backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : (opt.badgeColor ? `${opt.badgeColor}22` : 'var(--color-surface-muted)'),
                            color: isSelected ? '#FFFFFF' : (opt.badgeColor || 'var(--color-text-muted)')
                          }}
                        >
                          {opt.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--color-surface)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <Search size={16} color="var(--color-text-muted)" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders by ID (#TOM-...), customer name, phone, or dish..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-main)',
                      fontSize: '13px'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* View 1: Kanban Board View */}
              {viewMode === 'kanban' ? (
                <div>
                  {orderFilter === 'all' ? (
                    /* Full Multi-Column Kanban Board */
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                        gap: '16px',
                        alignItems: 'start'
                      }}
                    >
                      {kanbanColumns.map((col) => (
                        <div
                          key={col.id}
                          style={{
                            backgroundColor: 'var(--color-surface-muted)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '14px',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            minHeight: '260px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{col.icon}</span>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: col.color, textTransform: 'uppercase' }}>
                                {col.title}
                              </span>
                            </div>
                            <span
                              style={{
                                backgroundColor: 'var(--color-surface)',
                                color: col.color,
                                border: `1px solid ${col.color}`,
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '10px'
                              }}
                            >
                              {col.orders.length}
                            </span>
                          </div>

                          {col.orders.length === 0 ? (
                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '30px 10px' }}>
                              No orders in this stage
                            </p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {col.orders.map((o) => renderCard(o))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Single Filter Column Expanded */
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '16px'
                      }}
                    >
                      {getFilteredOrders(orderFilter).length === 0 ? (
                        <div
                          style={{
                            gridColumn: '1 / -1',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '40px 20px',
                            textAlign: 'center',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <FileText size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 10px' }} />
                          <h4 style={{ fontSize: '15px', fontWeight: 800 }}>No orders found</h4>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            There are no orders matching the selected filter or search query.
                          </p>
                        </div>
                      ) : (
                        getFilteredOrders(orderFilter).map((o) => renderCard(o))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* View 2: Detailed List View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {getFilteredOrders(orderFilter).length === 0 ? (
                    <div
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '40px 20px',
                        textAlign: 'center',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <FileText size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 10px' }} />
                      <h4 style={{ fontSize: '15px', fontWeight: 800 }}>No orders in this view</h4>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Try switching tabs or clearing your search keywords.
                      </p>
                    </div>
                  ) : (
                    getFilteredOrders(orderFilter).map((o) => renderCard(o))
                  )}
                </div>
              )}

              {/* Bottom Operational SLA & Staff Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                  marginTop: '24px'
                }}
              >
                {/* Active Station Staff */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ChefHat size={16} color="var(--color-primary)" />
                    <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Active Kitchen Shift Staff</h4>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { name: 'Chef Rakesh Pillai', role: 'Head Chef • Biryani & Dum Handi Station', status: 'Active Line', badge: '#27AE60' },
                      { name: 'Anita Sharma', role: 'Prep Cook • Tandoor & Starters', status: 'Active Line', badge: '#27AE60' },
                      { name: 'Suresh Rao', role: 'Packaging • Quality Check & Tamper Seal', status: 'Active Line', badge: '#27AE60' }
                    ].map((chef, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-muted)',
                          fontSize: '11px'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{chef.name}</div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>{chef.role}</div>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: chef.badge, backgroundColor: 'rgba(39, 174, 96, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>
                          {chef.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kitchen Performance SLA */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Award size={16} color="#F39C12" />
                    <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Kitchen Service Level Agreement (SLA)</h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-muted)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>On-Time Dispatch</span>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-veg)', marginTop: '2px' }}>98.4%</div>
                      <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>Under 20m threshold</span>
                    </div>

                    <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-muted)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Average Accept TAT</span>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '2px' }}>18 secs</div>
                      <span style={{ fontSize: '9px', color: 'var(--color-veg)' }}>Top 5% in Indiranagar</span>
                    </div>

                    <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-muted)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Kitchen Audit Score</span>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#F39C12', marginTop: '2px' }}>5.0 ★</div>
                      <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>FSSAI Grade A Hygiene</span>
                    </div>

                    <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-muted)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Wrong Item Rate</span>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-veg)', marginTop: '2px' }}>0.05%</div>
                      <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>Zero packaging leaks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tab 2: Menu Stock Manager */}
        {activeTab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Menu & Item Availability</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Toggle stock status instantly or publish brand-new recipes
                </p>
              </div>

              <button
                onClick={() => setIsAddDishOpen(true)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <Plus size={15} />
                <span>Add New Dish</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {restaurant.categories.map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>
                    {cat.name}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cat.items.map((item) => {
                      const inStock = menuStockMap[item.id] !== undefined ? menuStockMap[item.id] : item.isInStock;
                      return (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-surface-muted)',
                            border: '1px solid var(--color-border-subtle)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden' }}>
                              <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>{item.name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>₹{item.price}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleItemStock(item.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '11px',
                              fontWeight: 800,
                              backgroundColor: inStock ? 'var(--color-veg-bg)' : 'var(--color-surface)',
                              color: inStock ? 'var(--color-veg)' : 'var(--color-text-muted)',
                              border: `1.5px solid ${inStock ? 'var(--color-veg)' : 'var(--color-border)'}`
                            }}
                          >
                            {inStock ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Payouts */}
        {activeTab === 'earnings' && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--color-border)'
            }}
          >
            <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>Settlements & Payouts</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Automatic daily settlements directly into HDFC Bank Account (ending in 8912)
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-muted)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Pending Settlement (Today)</span>
                <h4 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-veg)', marginTop: '4px' }}>₹10,234</h4>
                <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Net of 18% Tomattto commission</p>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-muted)' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Last Payout Dispatched</span>
                <h4 style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>₹18,450</h4>
                <p style={{ fontSize: '10px', color: 'var(--color-veg)', marginTop: '2px' }}>✓ Settled yesterday at 11:30 PM</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Customer Reviews & Merchant Reply */}
        {activeTab === 'reviews' && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Customer Reviews & Ratings</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  View customer feedback on food quality, portions, and post merchant replies
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#27AE60', color: '#FFFFFF', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 800 }}>
                <span>4.7</span>
                <Star size={13} fill="#FFFFFF" />
                <span style={{ fontSize: '11px', opacity: 0.9 }}>(2,840 verified ratings)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  id: 'rev-1',
                  customer: 'Ananya Roy',
                  rating: 5,
                  time: 'Yesterday at 8:45 PM',
                  dish: 'Dum Gosht Biryani (Mutton)',
                  review: 'Heavenly aroma! The meat literally melted in my mouth, authentic dum style spices. Packaging was neat and spill-proof.'
                },
                {
                  id: 'rev-2',
                  customer: 'Karthik Nair',
                  rating: 5,
                  time: '2 days ago',
                  dish: 'Murgh Makhani Biryani + Kefta Kebab',
                  review: 'Fastest delivery in Indiranagar! Food was steaming hot and kebabs were succulent.'
                },
                {
                  id: 'rev-3',
                  customer: 'Sneha Patel',
                  rating: 4,
                  time: '3 days ago',
                  dish: 'Zaikedaar Paneer Biryani',
                  review: 'Very good flavor, fresh paneer. Would love slightly more salan gravy with the portion!'
                }
              ].map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    backgroundColor: 'var(--color-surface-muted)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800 }}>{rev.customer}</span>
                        <CheckCircle2 size={13} color="var(--color-veg)" />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{rev.time} • Ordered: {rev.dish}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '2px', color: '#F39C12' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="#F39C12" />
                      ))}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--color-text-main)', margin: '0 0 12px', lineHeight: 1.4 }}>
                    "{rev.review}"
                  </p>

                  {/* Merchant Reply if exists */}
                  {merchantReplies[rev.id] ? (
                    <div
                      style={{
                        backgroundColor: 'rgba(255, 75, 58, 0.08)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 12px',
                        borderLeft: '3px solid var(--color-primary)'
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>
                        Merchant Response:
                      </span>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-main)', margin: '2px 0 0' }}>
                        {merchantReplies[rev.id]}
                      </p>
                    </div>
                  ) : (
                    /* Reply Input Form */
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <input
                        type="text"
                        placeholder="Write a reply to this customer..."
                        value={replyInput[rev.id] || ''}
                        onChange={(e) => setReplyInput({ ...replyInput, [rev.id]: e.target.value })}
                        style={{
                          flex: 1,
                          padding: '7px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          fontSize: '12px',
                          color: 'var(--color-text-main)'
                        }}
                      />
                      <button
                        onClick={() => {
                          if (replyInput[rev.id]?.trim()) {
                            setMerchantReplies({
                              ...merchantReplies,
                              [rev.id]: replyInput[rev.id].trim()
                            });
                            setReplyInput({ ...replyInput, [rev.id]: '' });
                          }
                        }}
                        style={{
                          padding: '7px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Send size={12} />
                        <span>Reply</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Promotions & Marketing Campaigns */}
        {activeTab === 'marketing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Create Flash Discount Campaign</h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Fund exclusive discounts to drive rush-hour volume and attract new diners
                  </p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: 'rgba(255, 75, 58, 0.1)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                  Merchant Funded
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                    Campaign Title / Offer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FLAT 25% OFF on Biryanis"
                    value={newPromoTitle}
                    onChange={(e) => setNewPromoTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '1px solid var(--color-border)',
                      fontSize: '12px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="349"
                    value={newPromoMin}
                    onChange={(e) => setNewPromoMin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '1px solid var(--color-border)',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (newPromoTitle.trim()) {
                    setCampaigns([
                      ...campaigns,
                      {
                        id: `cmp-${Date.now()}`,
                        title: newPromoTitle.trim(),
                        minOrder: Number(newPromoMin) || 299,
                        status: 'Active',
                        ordersGenerated: 0,
                        gmvGenerated: 0,
                        badgeColor: 'var(--color-veg)'
                      }
                    ]);
                    setNewPromoTitle('');
                  }
                }}
                style={{
                  padding: '9px 18px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Plus size={14} />
                <span>Launch Campaign</span>
              </button>
            </div>

            {/* Active Campaigns List */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>Live Outlet Promotions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {campaigns.map((cmp) => (
                  <div
                    key={cmp.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '1px solid var(--color-border-subtle)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={14} color="var(--color-primary)" />
                        <span style={{ fontSize: '13px', fontWeight: 800 }}>{cmp.title}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Min order: ₹{cmp.minOrder} • Status: <b style={{ color: 'var(--color-veg)' }}>{cmp.status}</b>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>Orders Generated</span>
                        <b>{cmp.ordersGenerated} orders</b>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>GMV Driven</span>
                        <b style={{ color: 'var(--color-veg)' }}>₹{cmp.gmvGenerated.toLocaleString('en-IN')}</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Live Analytics & Kitchen Heatmaps */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Sales Hours Heatmap */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Order Volume by Hour (Peak Times)</h3>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Busiest window: Dinner 8:00 PM - 10:30 PM (Indiranagar Delivery Zone)
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-veg)' }}>
                  +24% vs Last Thursday
                </span>
              </div>

              {/* Bar visualization */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', alignItems: 'flex-end', height: '140px', paddingTop: '20px' }}>
                {[
                  { time: '12 PM', height: '55%', orders: 18 },
                  { time: '1 PM', height: '80%', orders: 32 },
                  { time: '2 PM', height: '65%', orders: 24 },
                  { time: '5 PM', height: '30%', orders: 10 },
                  { time: '7 PM', height: '70%', orders: 28 },
                  { time: '8 PM', height: '100%', orders: 46 },
                  { time: '9 PM', height: '90%', orders: 38 }
                ].map((bar, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{bar.orders}</span>
                    <div
                      style={{
                        width: '100%',
                        height: bar.height,
                        backgroundColor: bar.height === '100%' ? 'var(--color-primary)' : 'var(--color-primary-light)',
                        borderRadius: '4px',
                        border: '1px solid var(--color-primary)'
                      }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{bar.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Items Leaderboard & Quality Sentiment */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}
            >
              {/* Best Sellers */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>🏆 Top Selling Dishes Today</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { rank: 1, name: 'Dum Gosht Biryani (Mutton)', qty: 48, revenue: 23952 },
                    { rank: 2, name: 'Murgh Makhani Biryani', qty: 36, revenue: 14364 },
                    { rank: 3, name: 'Zaikedaar Paneer Biryani', qty: 28, revenue: 9772 },
                    { rank: 4, name: 'Kefta Chicken Kebab', qty: 22, revenue: 6578 }
                  ].map((dish) => (
                    <div
                      key={dish.rank}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-muted)',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {dish.rank}
                        </span>
                        <span style={{ fontWeight: 700 }}>{dish.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800 }}>{dish.qty} orders</span>
                        <div style={{ fontSize: '10px', color: 'var(--color-veg)' }}>₹{dish.revenue.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment Score */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>⭐ Customer Sentiment Metrics</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Taste & Authentic Spice Balance', score: '96% Positive', val: 96, color: 'var(--color-veg)' },
                    { label: 'Packaging & Zero Spillage', score: '94% Positive', val: 94, color: 'var(--color-veg)' },
                    { label: 'Food Temperature on Delivery', score: '92% Steaming Hot', val: 92, color: '#F39C12' },
                    { label: 'Portion Size Satisfaction', score: '89% Satisfied', val: 89, color: '#3498DB' }
                  ].map((s, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{s.label}</span>
                        <b style={{ color: s.color }}>{s.score}</b>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-surface-muted)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${s.val}%`, height: '100%', backgroundColor: s.color, borderRadius: '3px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Restaurant Partner Application Status (Demo / Tracking) */}
        {activeTab === 'application_status' && (
          <PartnerApplicationStatus
            onBack={() => setActiveTab('orders')}
            onOpenWizard={() => setIsOnboardingOpen(true)}
          />
        )}
      </div>

      {/* Add Dish Modal */}
      <AddDishModal
        isOpen={isAddDishOpen}
        onClose={() => setIsAddDishOpen(false)}
        categories={restaurant.categories}
        restaurantId={restaurant.id}
      />

      {/* Kitchen Ticket Inspector Modal */}
      <KitchenTicketModal
        order={inspectedOrder}
        onClose={() => setInspectedOrder(null)}
        onAcceptOrder={handleAcceptOrder}
        onStartPreparing={handleStartPreparing}
        onMarkReady={handleMarkReady}
        onRejectOrder={(id) => setRejectOrderId(id)}
      />

      {/* Reject Order Reason Modal */}
      <RejectOrderModal
        isOpen={rejectOrderId !== null}
        orderId={rejectOrderId}
        onClose={() => setRejectOrderId(null)}
        onConfirmReject={handleRejectConfirm}
      />

      {/* Outlet Profile & KYC Modal */}
      <OutletProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        restaurant={restaurant}
      />
    </div>
  );
};
