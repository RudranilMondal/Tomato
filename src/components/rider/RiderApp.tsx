import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
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
  UserPlus
} from 'lucide-react';

export const RiderApp: React.FC = () => {
  const {
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

  // If rider onboarding wizard is open, display the onboarding wizard & status screen
  if (isOnboardingOpen) {
    return (
      <RiderOnboardingWizard
        isPreviewMode={isOnboardingPreview}
        onBack={() => {
          setIsOnboardingOpen(false);
          setIsOnboardingPreview(false);
        }}
      />
    );
  }

  const order = activeRiderOrder || riderDeliveryRequest || currentOrder;

  const handleVerifyPickup = () => {
    riderVerifyPickup(enteredOtp || '1234');
    setEnteredOtp('');
    setOtpError('');
  };

  const handleCompleteDelivery = () => {
    riderCompleteDelivery(enteredOtp || '1234');
    setEnteredOtp('');
    setOtpError('');
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
        {/* State 1: Incoming Delivery Request Popup */}
        {riderDeliveryRequest && !activeRiderOrder && (
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
                  ₹65 Payout
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
                <span>Drop: <b>Indiranagar 100ft Rd</b> (2.8 km)</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={riderRejectDelivery}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-muted)',
                  color: 'var(--color-text-muted)',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                Pass
              </button>

              <button
                onClick={riderAcceptDelivery}
                style={{
                  flex: 2,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-veg)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
                }}
              >
                Accept Order (₹65)
              </button>
            </div>
          </div>
        )}

        {/* State 2: Active Delivery in progress */}
        {activeRiderOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Step indicator header */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Navigation size={18} color="var(--color-primary)" />
                <h4 style={{ fontSize: '15px', fontWeight: 800 }}>
                  {riderStep === 'heading_to_restaurant' && 'Step 1: Pick up Order'}
                  {riderStep === 'out_for_delivery' && 'Step 2: Deliver to Customer'}
                </h4>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {riderStep === 'heading_to_restaurant'
                  ? `Navigate to ${activeRiderOrder.restaurant.name}`
                  : `Delivering to ${activeRiderOrder.customerName}`}
              </p>
            </div>

            {/* Simulated Turn-by-Turn GPS Guidance Box */}
            <div
              style={{
                backgroundColor: '#1E1E24',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px'
                }}
              >
                ↱
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '12px', color: '#A5A5B2' }}>In 250 metres</span>
                <h5 style={{ fontSize: '15px', fontWeight: 800 }}>Turn right onto 100ft Road</h5>
                <span style={{ fontSize: '11px', color: 'var(--color-veg)', fontWeight: 700 }}>
                  Fastest route • 4 mins away
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
                  gap: '4px'
                }}
              >
                <Map size={13} />
                <span>Map</span>
              </button>
            </div>

            {/* OTP Verification Box */}
            {riderStep === 'heading_to_restaurant' ? (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--color-border)'
                }}
              >
                <h5 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '4px' }}>
                  Collect Order from Kitchen
                </h5>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                  Ask restaurant staff for order #{activeRiderOrder.id} and confirm pickup.
                </p>

                <button
                  onClick={handleVerifyPickup}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: 700
                  }}
                >
                  Confirm Pickup (Bag Collected)
                </button>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  border: '1px solid var(--color-border)'
                }}
              >
                <h5 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '4px' }}>
                  Delivery Confirmation
                </h5>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                  Collect 4-digit OTP from customer upon handover.
                </p>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder={`Customer OTP: ${activeRiderOrder.deliveryOtp}`}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--color-surface-muted)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      fontSize: '13px',
                      border: '1px solid var(--color-border)'
                    }}
                  />
                  <button
                    onClick={handleCompleteDelivery}
                    style={{
                      backgroundColor: 'var(--color-veg)',
                      color: '#FFFFFF',
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                  >
                    Delivered ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rich Idle State when searching for orders */}
        {!activeRiderOrder && !riderDeliveryRequest && (
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
                    backgroundColor: 'rgba(46, 204, 113, 0.15)',
                    color: 'var(--color-veg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulseGlow 2s infinite'
                  }}
                >
                  <Bike size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-veg)' }} />
                    <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Radar Searching...</h4>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Stationed at Indiranagar 100ft Rd Hub
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
                  boxShadow: '0 4px 12px var(--color-primary-glow)'
                }}
              >
                <Zap size={13} fill="#FFFFFF" />
                <span>Simulate Order (₹65)</span>
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
