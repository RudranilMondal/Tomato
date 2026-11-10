import React, { useState, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { DEMO_OTP_CODE } from '../../lib/demoAuth';
import { RiderRouteModal } from './RiderRouteModal';
import { RiderProofModal } from './RiderProofModal';
import { RiderEarningsModal } from './RiderEarningsModal';
import { RiderSosModal } from './RiderSosModal';
import { RiderTripsModal } from './RiderTripsModal';
import { RiderKycModal } from './RiderKycModal';
import { RiderProfileModal } from './RiderProfileModal';
import { RiderOnboardingWizard } from './RiderOnboardingWizard';
import { RiderAuthModal } from './RiderAuthModal';
import {
  Bike,
  Power,
  Navigation,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Star,
  ArrowRight,
  ShieldAlert,
  Camera,
  Map,
  FileCheck,
  ClipboardList,
  Flame,
  Zap,
  Award,
  Fuel,
  Sparkles,
  UserCheck,
  RefreshCw,
  User,
  UserPlus,
  AlertCircle,
  AlertTriangle,
  Store,
  Check,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

export const RiderApp: React.FC = () => {
  const {
    isRiderOnline,
    setIsRiderOnline,
    riderDeliveryRequest,
    activeRiderOrder,
    availableRiderOrders,
    riderStep,
    riderAcceptDelivery,
    riderRejectDelivery,
    riderArriveAtRestaurant,
    riderVerifyPickup,
    riderArriveAtCustomer,
    riderCompleteDelivery,
    riderEarningsToday,
    riderTripsToday,
    completedRiderTrips,
    triggerSimulatedDeliveryRequest,
    currentOrder,
    riderOnboardingStatus,
    resetRiderOnboarding,
    supabaseSession,
    supabaseUser,
    activeRiderApplicant,
    demoRiderUser,
    signOutSupabase
  } = useTomattto();

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isEarningsModalOpen, setIsEarningsModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isTripsModalOpen, setIsTripsModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isOnboardingPreview, setIsOnboardingPreview] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const order = activeRiderOrder || riderDeliveryRequest || currentOrder;

  const formatDeliveryAddress = (addr: any): string => {
    if (!addr) return 'Customer Address';
    if (typeof addr === 'string') return addr;
    return `${addr.addressLine || ''}${addr.landmark ? `, ${addr.landmark}` : ''}${addr.label ? ` (${addr.label})` : ''}`;
  };

  const getOrderPayout = (ord: any) => {
    const base = 45;
    const dist = 15;
    const surge = 15;
    const tip = typeof ord?.tipAmount === 'number' ? ord.tipAmount : 30;
    return base + dist + surge + tip;
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAccept = (orderId?: string) => {
    const res = riderAcceptDelivery(orderId);
    if (res.success) {
      setToast({ type: 'success', message: 'Delivery accepted! Step 1: Heading to restaurant.' });
      setOtpError('');
      setEnteredOtp('');
    } else {
      setToast({ type: 'error', message: res.error || 'Failed to accept delivery.' });
    }
  };

  const handleReject = (orderId?: string) => {
    riderRejectDelivery(orderId);
    setToast({ type: 'info', message: 'Delivery passed.' });
  };

  const handleArriveAtRestaurant = () => {
    const res = riderArriveAtRestaurant();
    if (res.success) {
      setToast({ type: 'success', message: 'Arrived at kitchen! Step 2: Show pickup OTP to chef and collect bag.' });
    } else {
      setToast({ type: 'error', message: res.error || 'Failed to update arrival.' });
    }
  };

  const handleVerifyPickup = () => {
    const res = riderVerifyPickup();
    if (res.success) {
      setToast({ type: 'success', message: 'Food picked up! Step 3: Out for delivery to customer.' });
    } else {
      setToast({ type: 'error', message: res.error || 'Failed to confirm pickup.' });
    }
  };

  const handleArriveAtCustomer = () => {
    const res = riderArriveAtCustomer();
    if (res.success) {
      setToast({ type: 'success', message: 'Arrived at customer doorstep! Step 4: Collect delivery OTP.' });
    } else {
      setToast({ type: 'error', message: res.error || 'Failed to update arrival.' });
    }
  };

  const handleCompleteDelivery = () => {
    if (!enteredOtp.trim()) {
      setOtpError(`Please enter the customer OTP or development demo OTP: ${DEMO_OTP_CODE}`);
      return;
    }

    const res = riderCompleteDelivery(enteredOtp);
    if (res.success) {
      setEnteredOtp('');
      setOtpError('');
      setToast({ type: 'success', message: 'Delivery completed successfully! Payout credited to today’s earnings.' });
    } else {
      setOtpError(res.error || `Invalid delivery OTP. In demo mode, use: ${DEMO_OTP_CODE}`);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Rider Header */}
      <div
        style={{
          backgroundColor: '#1E1E24',
          color: '#FFFFFF',
          padding: '16px 16px 14px 16px',
          boxShadow: 'var(--shadow-sm)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Top Profile & Status Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          {/* Left: Avatar & Rider Details */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              minWidth: 0,
              flex: 1
            }}
            title="Click to view full Rider Profile & KYC details"
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                flexShrink: 0
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                alt="Vikram"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                <h4
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  Vikram Singh
                </h4>
                <span
                  style={{
                    backgroundColor: 'rgba(243, 156, 18, 0.15)',
                    color: '#F39C12',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    flexShrink: 0
                  }}
                >
                  <span>4.9</span>
                  <Star size={9} fill="#F39C12" />
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#9CA3AF',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    letterSpacing: '0.4px',
                    flexShrink: 0
                  }}
                >
                  DEMO
                </span>
              </div>
              <p
                style={{
                  fontSize: '11px',
                  color: '#9CA3AF',
                  margin: '2px 0 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                KA 03 EN 4592 • Honda Shine
              </p>
            </div>
          </div>

          {/* Right: Compact Utility Actions (SOS + Shift Status) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* SOS Emergency button */}
            <button
              onClick={() => setIsSosModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '6px 9px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(231, 76, 60, 0.15)',
                color: '#FF6B6B',
                border: '1px solid rgba(231, 76, 60, 0.3)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Emergency SOS"
            >
              <ShieldAlert size={12} />
              <span>SOS</span>
            </button>

            {/* Shift Toggle */}
            <button
              onClick={() => setIsRiderOnline(!isRiderOnline)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 11px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isRiderOnline ? 'var(--color-veg)' : 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: isRiderOnline ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Power size={12} />
              <span>{isRiderOnline ? 'ON DUTY' : 'OFFLINE'}</span>
            </button>
          </div>
        </div>

        {/* Dedicated Partner Application Banner */}
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={() => {
              if (!activeRiderApplicant && !supabaseSession) {
                setIsAuthModalOpen(true);
              } else {
                setIsOnboardingOpen(true);
              }
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor:
                riderOnboardingStatus === 'approved'
                  ? 'rgba(46, 204, 113, 0.12)'
                  : riderOnboardingStatus === 'under_review'
                  ? 'rgba(243, 156, 18, 0.12)'
                  : riderOnboardingStatus === 'rejected'
                  ? 'rgba(231, 76, 60, 0.12)'
                  : 'rgba(255, 75, 58, 0.12)',
              color:
                riderOnboardingStatus === 'approved'
                  ? 'var(--color-veg, #2ECC71)'
                  : riderOnboardingStatus === 'under_review'
                  ? '#F39C12'
                  : riderOnboardingStatus === 'rejected'
                  ? '#FF6B6B'
                  : 'var(--color-primary)',
              border: `1px solid ${
                riderOnboardingStatus === 'approved'
                  ? 'rgba(46, 204, 113, 0.35)'
                  : riderOnboardingStatus === 'under_review'
                  ? 'rgba(243, 156, 18, 0.3)'
                  : riderOnboardingStatus === 'rejected'
                  ? 'rgba(231, 76, 60, 0.3)'
                  : 'rgba(255, 75, 58, 0.25)'
              }`,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {riderOnboardingStatus === 'approved' ? (
                <CheckCircle2 size={16} />
              ) : riderOnboardingStatus === 'under_review' ? (
                <Clock size={15} />
              ) : riderOnboardingStatus === 'rejected' ? (
                <ShieldAlert size={15} />
              ) : (
                <UserPlus size={15} />
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.2 }}>
                  {riderOnboardingStatus === 'approved'
                    ? 'Delivery Partner Account Active ✓'
                    : riderOnboardingStatus === 'under_review'
                    ? 'Application In Review'
                    : riderOnboardingStatus === 'rejected'
                    ? 'KYC Verification Action Required'
                    : activeRiderApplicant
                    ? 'Continue Delivery Partner Onboarding'
                    : 'Apply as Delivery Partner'}
                </div>
                <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '1px' }}>
                  {riderOnboardingStatus === 'approved'
                    ? 'Fleet approved • Tap to view credentials or update profile'
                    : riderOnboardingStatus === 'under_review'
                    ? 'Fleet Ops is validating your documents'
                    : riderOnboardingStatus === 'rejected'
                    ? 'Tap to re-upload documents & resubmit'
                    : activeRiderApplicant
                    ? `Authenticated (${activeRiderApplicant.fullName || activeRiderApplicant.phone}) • Tap to continue`
                    : 'Earn up to ₹35,000/month + incentives'}
                </div>
              </div>
            </div>
            <ArrowRight size={14} color="#9CA3AF" />
          </button>

          {/* Active Session Indicator (Supports both real Supabase & isolated Demo Auth) */}
          {(supabaseSession || activeRiderApplicant) && (
            <div
              style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                backgroundColor: 'rgba(46, 204, 113, 0.08)',
                border: '1px solid rgba(46, 204, 113, 0.2)',
                borderRadius: 'var(--radius-sm, 6px)',
                fontSize: '11px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-veg, #2ECC71)'
                }}
              >
                <CheckCircle2 size={13} />
                <span style={{ fontWeight: 600 }}>
                  {activeRiderApplicant?.isDemo ? 'Demo Auth:' : 'Auth Session:'}{' '}
                  {activeRiderApplicant?.phone || supabaseUser?.phone || 'Logged In'}
                </span>
                {activeRiderApplicant?.isDemo && (
                  <span
                    style={{
                      fontSize: '9px',
                      backgroundColor: 'rgba(243, 156, 18, 0.15)',
                      color: '#F39C12',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      fontWeight: 700
                    }}
                  >
                    DEV SIMULATED
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={signOutSupabase}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
                title="Sign out / Clear active rider applicant session"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Stats Section: Two Visually Balanced Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            marginTop: '12px'
          }}
        >
          {/* Earnings Card */}
          <div
            onClick={() => setIsEarningsModalOpen(true)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'background-color 0.15s ease'
            }}
            title="Click to view detailed earnings passbook"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>Today's Earnings</span>
              <DollarSign size={13} color="var(--color-veg)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-veg)' }}>
                ₹{riderEarningsToday}
              </span>
              <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Passbook ➔</span>
            </div>
          </div>

          {/* Trips Completed Card */}
          <div
            onClick={() => setIsTripsModalOpen(true)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'background-color 0.15s ease'
            }}
            title="Click to view completed delivery trips"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>Trips Completed</span>
              <Bike size={13} color="var(--color-primary)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                {riderTripsToday} <span style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF' }}>orders</span>
              </span>
              <span style={{ fontSize: '10px', color: '#9CA3AF' }}>History ➔</span>
            </div>
          </div>
        </div>

        {/* Navigation Action Pills: Equal Width Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginTop: '10px'
          }}
        >
          <button
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 4px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.15s ease'
            }}
          >
            <User size={13} color="#9CA3AF" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setIsTripsModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 4px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.15s ease'
            }}
          >
            <ClipboardList size={13} color="#9CA3AF" />
            <span>Trips</span>
          </button>

          <button
            onClick={() => setIsKycModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 4px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.15s ease'
            }}
          >
            <FileCheck size={13} color="#9CA3AF" />
            <span>KYC & Docs</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="no-scrollbar">
        {/* Feedback Toast Notification */}
        {toast && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: toast.type === 'success' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
              border: `1px solid ${toast.type === 'success' ? 'var(--color-veg)' : '#E74C3C'}`,
              color: toast.type === 'success' ? '#2ECC71' : '#E74C3C',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Duty Status Warning when Offline */}
        {!isRiderOnline && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(231, 76, 60, 0.12)',
                  color: '#E74C3C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Power size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-text)' }}>You are currently Offline</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Go online to receive nearby pickup orders and start earning.
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsRiderOnline(true)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-veg)',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Go Online
            </button>
          </div>
        )}

        {/* State 1: Active Delivery in Progress */}
        {activeRiderOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            {/* Multi-step Header */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      ACTIVE ORDER #{activeRiderOrder.id}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      • {activeRiderOrder.items.reduce((s, i) => s + i.quantity, 0)} items
                    </span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '6px' }}>
                    {riderStep === 'heading_to_restaurant' && 'Step 1: Heading to Kitchen'}
                    {riderStep === 'at_restaurant' && 'Step 2: Collect & Pack Order'}
                    {riderStep === 'out_for_delivery' && 'Step 3: Delivering to Customer'}
                    {riderStep === 'at_customer' && 'Step 4: Customer Handover & OTP'}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Estimated Payout</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-veg)' }}>
                    ₹{getOrderPayout(activeRiderOrder)}
                  </div>
                </div>
              </div>

              {/* Stepper Dots */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { step: 'heading_to_restaurant', label: '1. Kitchen' },
                  { step: 'at_restaurant', label: '2. Pickup' },
                  { step: 'out_for_delivery', label: '3. En Route' },
                  { step: 'at_customer', label: '4. Drop' }
                ].map((s, idx) => {
                  const stepOrder = ['heading_to_restaurant', 'at_restaurant', 'out_for_delivery', 'at_customer'];
                  const currentIndex = stepOrder.indexOf(riderStep);
                  const thisIndex = idx;
                  const isDone = thisIndex < currentIndex;
                  const isCurrent = thisIndex === currentIndex;

                  return (
                    <div key={s.step} style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: isDone || isCurrent ? 'var(--color-veg)' : 'var(--color-surface-muted)',
                          marginBottom: '4px',
                          transition: 'background-color 0.3s ease'
                        }}
                      />
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: isCurrent ? 800 : 600,
                          color: isCurrent ? 'var(--color-text)' : 'var(--color-text-muted)'
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Turn-by-Turn GPS Navigation Prompt */}
            <div
              style={{
                backgroundColor: '#1E1E24',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}
              >
                {riderStep === 'heading_to_restaurant' || riderStep === 'out_for_delivery' ? '↱' : '📍'}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', color: '#A5A5B2' }}>
                  {riderStep === 'heading_to_restaurant' ? 'To Restaurant: 1.4 km • 4 mins away' : 'To Customer: 2.8 km • 8 mins away'}
                </span>
                <h5 style={{ fontSize: '14px', fontWeight: 800, margin: '2px 0' }}>
                  {riderStep === 'heading_to_restaurant'
                    ? activeRiderOrder.restaurant.name
                    : formatDeliveryAddress(activeRiderOrder.deliveryAddress)}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--color-veg)', fontWeight: 700 }}>
                  Live Navigation • Turn right onto 100ft Road
                </span>
              </div>

              <button
                onClick={() => setIsRouteModalOpen(true)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255,255,255,0.12)',
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
                <Map size={13} />
                <span>Map</span>
              </button>
            </div>

            {/* Step 1 Details & Action: Heading to Restaurant */}
            {riderStep === 'heading_to_restaurant' && (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div>
                  <h5 style={{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Store size={16} color="var(--color-primary)" />
                    <span>Restaurant Pickup Location</span>
                  </h5>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>
                    {activeRiderOrder.restaurant.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {activeRiderOrder.restaurant.address || 'Indiranagar 100ft Road, Bengaluru'}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-surface-muted)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Items to Collect ({activeRiderOrder.items.length}):</div>
                  {activeRiderOrder.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                      <span>{it.quantity}x {it.menuItem?.name || 'Item'}</span>
                      <span>₹{it.itemTotal || (it.menuItem?.price ? it.menuItem.price * it.quantity : 0)}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleArriveAtRestaurant}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-glow)'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Confirm Arrival at Restaurant</span>
                </button>
              </div>
            )}

            {/* Step 2 Details & Action: At Restaurant */}
            {riderStep === 'at_restaurant' && (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(235, 87, 87, 0.08)',
                    border: '1px dashed var(--color-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    Kitchen Pickup Token
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '2px', margin: '4px 0' }}>
                    #{activeRiderOrder.pickupOtp || activeRiderOrder.id.slice(-4)}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Show this pickup token to the chef or kitchen staff to collect the sealed package.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-surface-muted)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: '6px' }}>Order Package Checklist:</div>
                  {activeRiderOrder.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-veg)' }} />
                        <span>{it.quantity}x {it.menuItem?.name || 'Item'}</span>
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Verified ✓</span>
                    </div>
                  ))}
                </div>

                {(activeRiderOrder.deliveryInstructions || activeRiderOrder.specialCookingInstructions) && (
                  <div style={{ fontSize: '11px', color: '#F39C12', padding: '8px 10px', backgroundColor: 'rgba(243, 156, 18, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                    <b>Chef note:</b> {activeRiderOrder.specialCookingInstructions || activeRiderOrder.deliveryInstructions}
                  </div>
                )}

                <button
                  onClick={handleVerifyPickup}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-veg)',
                    color: '#FFFFFF',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Confirm Pickup (Food Collected & Packed)</span>
                </button>
              </div>
            )}

            {/* Step 3 Details & Action: Out for Delivery */}
            {riderStep === 'out_for_delivery' && (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div>
                  <h5 style={{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} color="var(--color-veg)" />
                    <span>Customer Delivery Address</span>
                  </h5>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>
                    {activeRiderOrder.customerName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {formatDeliveryAddress(activeRiderOrder.deliveryAddress)}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-surface-muted)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Customer Phone: </span>
                    <span style={{ fontWeight: 700 }}>{activeRiderOrder.customerPhone || '+91 98765 43210'}</span>
                  </div>
                  <a
                    href={`tel:${activeRiderOrder.customerPhone || '+919876543210'}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(52, 152, 219, 0.15)',
                      color: '#3498DB',
                      fontSize: '11px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={12} />
                    <span>Call</span>
                  </a>
                </div>

                {(activeRiderOrder.deliveryInstructions || activeRiderOrder.specialCookingInstructions) && (
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', padding: '8px 10px', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-sm)' }}>
                    <b>Drop note:</b> {activeRiderOrder.deliveryInstructions || activeRiderOrder.specialCookingInstructions}
                  </div>
                )}

                <button
                  onClick={handleArriveAtCustomer}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-glow)'
                  }}
                >
                  <MapPin size={16} />
                  <span>Confirm Arrival at Customer Doorstep</span>
                </button>
              </div>
            )}

            {/* Step 4 Details & Action: At Customer Doorstep (OTP Verification) */}
            {riderStep === 'at_customer' && (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div>
                  <h5 style={{ fontSize: '14px', fontWeight: 800 }}>Customer Handover & Delivery OTP</h5>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Collect the 4-digit customer delivery OTP upon handing over the package.
                  </p>
                </div>

                {/* Simulated / Demo OTP Notice */}
                <div
                  style={{
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    border: '1px solid rgba(52, 152, 219, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    fontSize: '11px',
                    color: '#2980B9'
                  }}
                >
                  <div style={{ fontWeight: 800, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} />
                    <span>Development Demo — OTP Verification Simulated</span>
                  </div>
                  <div>
                    Customer OTP is <b>{activeRiderOrder.deliveryOtp}</b> or standard demo OTP: <b>{DEMO_OTP_CODE}</b>.
                  </div>
                  <button
                    onClick={() => {
                      setEnteredOtp(DEMO_OTP_CODE);
                      setOtpError('');
                    }}
                    style={{
                      marginTop: '6px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#3498DB',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Quick-Fill Demo OTP ({DEMO_OTP_CODE})
                  </button>
                </div>

                {/* OTP Input Field */}
                <div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder={`Enter OTP (${DEMO_OTP_CODE})`}
                      value={enteredOtp}
                      onChange={(e) => {
                        setEnteredOtp(e.target.value);
                        if (otpError) setOtpError('');
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--color-surface-muted)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        fontSize: '14px',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        border: otpError ? '1px solid #E74C3C' : '1px solid var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                    />
                    <button
                      onClick={() => setIsProofModalOpen(true)}
                      title="Optional: Add Photo Proof of Delivery"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface-muted)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Camera size={16} />
                    </button>
                  </div>

                  {otpError && (
                    <div style={{ fontSize: '11px', color: '#E74C3C', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} />
                      <span>{otpError}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCompleteDelivery}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-veg)',
                    color: '#FFFFFF',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Verify OTP & Complete Delivery ✓</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* State 2: Available Orders Feed from Restaurant Partners */}
        {!activeRiderOrder && isRiderOnline && availableRiderOrders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={18} color="var(--color-primary)" />
                  <span>Orders Ready for Pickup ({availableRiderOrders.length})</span>
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Marked ready by restaurant kitchens in your current zone
                </p>
              </div>
            </div>

            {availableRiderOrders.map((ord) => {
              const isExpanded = expandedOrderId === ord.id;
              const payout = getOrderPayout(ord);
              const itemCount = ord.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={ord.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--color-primary)',
                    padding: '16px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            backgroundColor: 'rgba(235, 87, 87, 0.1)',
                            color: 'var(--color-primary)',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          READY FOR PICKUP
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          #{ord.id}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px' }}>
                        {ord.restaurant.name}
                      </h4>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: 900,
                          color: 'var(--color-veg)',
                          display: 'block'
                        }}
                      >
                        ₹{payout}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        Est. Payout
                      </span>
                    </div>
                  </div>

                  {/* Pickup & Drop Points */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', flexShrink: 0 }} />
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Pickup: <b>{ord.restaurant.address || 'Restaurant Hub'}</b> (1.4 km)
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-veg)', flexShrink: 0 }} />
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Drop: <b>{formatDeliveryAddress(ord.deliveryAddress)}</b> (2.8 km)
                      </span>
                    </div>
                  </div>

                  {/* Item preview toggle */}
                  <div style={{ marginBottom: '12px' }}>
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{itemCount} items: {ord.items.map(i => i.menuItem?.name || 'Item').join(', ')}</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          backgroundColor: 'var(--color-surface-muted)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px'
                        }}
                      >
                        {ord.items.map((i, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                            <span>{i.quantity}x {i.menuItem?.name || 'Item'}</span>
                            <span>₹{i.itemTotal || (i.menuItem?.price ? i.menuItem.price * i.quantity : 0)}</span>
                          </div>
                        ))}
                        {(ord.deliveryInstructions || ord.specialCookingInstructions) && (
                          <div style={{ marginTop: '4px', color: '#F39C12', fontStyle: 'italic' }}>
                            Note: {ord.deliveryInstructions || ord.specialCookingInstructions}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons: Pass vs Accept */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleReject(ord.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface-muted)',
                        color: 'var(--color-text-muted)',
                        fontSize: '13px',
                        fontWeight: 700,
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer'
                      }}
                    >
                      Pass
                    </button>

                    <button
                      onClick={() => handleAccept(ord.id)}
                      style={{
                        flex: 2,
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-veg)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 800,
                        boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Accept Order (₹{payout})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* State 3: Incoming Simulated Delivery Request Popup */}
        {riderDeliveryRequest && !activeRiderOrder && !availableRiderOrders.some(o => o.id === riderDeliveryRequest.id) && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--color-primary)',
              padding: '18px',
              boxShadow: 'var(--shadow-glow)',
              animation: 'pulseGlow 2s infinite',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  NEW DELIVERY REQUEST
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-veg)', marginTop: '6px' }}>
                  ₹{getOrderPayout(riderDeliveryRequest)} Payout
                </h3>
              </div>

              <span style={{ fontSize: '11px', fontWeight: 800, color: '#E74C3C' }}>
                Expires in 28s
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                <span>Pickup: <b>{riderDeliveryRequest.restaurant.name}</b> (1.4 km)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-veg)' }} />
                <span>Drop: <b>{formatDeliveryAddress(riderDeliveryRequest.deliveryAddress)}</b> (2.8 km)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleReject(riderDeliveryRequest.id)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-muted)',
                  color: 'var(--color-text-muted)',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer'
                }}
              >
                Pass
              </button>

              <button
                onClick={() => handleAccept(riderDeliveryRequest.id)}
                style={{
                  flex: 2,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-veg)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Accept Order (₹{getOrderPayout(riderDeliveryRequest)})
              </button>
            </div>
          </div>
        )}

        {/* State 4: Radar Idle & Activity Hub when not on active delivery */}
        {!activeRiderOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '20px' }}>
            {/* Live Radar Banner */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: isRiderOnline ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                    color: isRiderOnline ? 'var(--color-veg)' : '#E74C3C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: isRiderOnline ? 'pulseGlow 2s infinite' : 'none'
                  }}
                >
                  <Bike size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isRiderOnline ? 'var(--color-veg)' : '#E74C3C'
                      }}
                    />
                    <h4 style={{ fontSize: '14px', fontWeight: 800 }}>
                      {isRiderOnline ? 'Radar Searching...' : 'Offline Station'}
                    </h4>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {isRiderOnline
                      ? 'Indiranagar 100ft Rd Hub • Ready for restaurant orders'
                      : 'Duty switched off • Go online to start receiving deliveries'}
                  </p>
                </div>
              </div>

              {/* Instant Test Simulation Button */}
              <button
                onClick={triggerSimulatedDeliveryRequest}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px var(--color-primary-glow)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Zap size={13} fill="#FFFFFF" />
                <span>Simulate Order (₹85)</span>
              </button>
            </div>

            {/* Daily Incentive Milestone Card */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="#F39C12" />
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>Daily Peak Milestone</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-veg)' }}>
                  ₹350 Bonus Reward
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                <span>Completed: <b>{riderTripsToday} / 6 Trips</b></span>
                <span>{Math.max(0, 6 - riderTripsToday)} more to reach target</span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-surface-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (riderTripsToday / 6) * 100)}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-veg)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Live Demand Hotspots & Surge Bonuses */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>Bengaluru Demand Hotspots</span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 700 }}>LIVE GPS</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { zone: 'Indiranagar 100ft Rd', demand: 'Very High', surge: '+₹30 / trip', color: 'var(--color-primary)' },
                  { zone: 'Koramangala 5th Block', demand: 'High', surge: '+₹25 / trip', color: '#F39C12' },
                  { zone: 'MG Road / Brigade Metro', demand: 'Moderate', surge: '+₹15 / trip', color: '#3498DB' }
                ].map((spot, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '1px solid var(--color-border-subtle)',
                      fontSize: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{spot.zone}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        Demand: <b style={{ color: spot.color }}>{spot.demand}</b>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: 'rgba(46, 204, 113, 0.15)',
                        color: 'var(--color-veg)',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {spot.surge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Turn-by-Turn Route Navigation Map Modal */}
      <RiderRouteModal
        isOpen={isRouteModalOpen}
        order={order}
        step={riderStep}
        onClose={() => setIsRouteModalOpen(false)}
      />

      {/* Proof of Delivery Photo Modal */}
      {activeRiderOrder && (
        <RiderProofModal
          isOpen={isProofModalOpen}
          orderId={activeRiderOrder.id}
          onClose={() => setIsProofModalOpen(false)}
          onConfirmDelivery={() => {
            riderCompleteDelivery(activeRiderOrder.deliveryOtp);
          }}
        />
      )}

      {/* Rider Earnings Passbook Modal */}
      <RiderEarningsModal
        isOpen={isEarningsModalOpen}
        onClose={() => setIsEarningsModalOpen(false)}
        earningsToday={riderEarningsToday}
        tripsToday={riderTripsToday}
      />

      {/* Emergency SOS Modal */}
      <RiderSosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
      />

      {/* Trips Log Modal */}
      <RiderTripsModal
        isOpen={isTripsModalOpen}
        onClose={() => setIsTripsModalOpen(false)}
        tripsToday={riderTripsToday}
        earningsToday={riderEarningsToday}
        completedTrips={completedRiderTrips}
      />

      {/* KYC & Verified Documents Modal */}
      <RiderKycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
      />

      {/* Comprehensive Rider Profile Modal */}
      <RiderProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Supabase Phone OTP Authentication Modal for Delivery Partners */}
      <RiderAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setIsOnboardingPreview(false);
          setIsOnboardingOpen(true);
        }}
        onDevPreview={() => {
          setIsAuthModalOpen(false);
          setIsOnboardingPreview(true);
          setIsOnboardingOpen(true);
        }}
      />
    </div>
  );
};
