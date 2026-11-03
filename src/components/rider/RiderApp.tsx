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
  User
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
    resetRiderOnboarding
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

  // If rider is not approved yet, display the full onboarding wizard & status screen
  if (riderOnboardingStatus !== 'approved') {
    return <RiderOnboardingWizard />;
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
          padding: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 'var(--radius-md)',
              transition: 'background-color 0.15s'
            }}
            title="Click to view full Rider Profile & KYC details"
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid var(--color-primary)',
                position: 'relative'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                alt="Vikram"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Vikram Singh</h4>
                <span
                  style={{
                    backgroundColor: 'var(--color-rating-bg)',
                    color: '#D35400',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <span>4.9</span>
                  <Star size={9} fill="#D35400" />
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    backgroundColor: 'rgba(255, 75, 58, 0.15)',
                    color: 'var(--color-primary)',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}
                >
                  Profile ➔
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#A5A5B2' }}>KA 03 EN 4592 • Honda Shine</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Test Onboarding Flow Toggle */}
            <button
              onClick={resetRiderOnboarding}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 75, 58, 0.15)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(255, 75, 58, 0.4)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
              title="Click to test the Rider Onboarding & KYC submission workflow"
            >
              <RefreshCw size={12} />
              <span>Test Onboarding</span>
            </button>

            {/* SOS Emergency button */}
            <button
              onClick={() => setIsSosModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                color: '#FF6B6B',
                border: '1.5px solid #FF6B6B',
                fontSize: '11px',
                fontWeight: 800
              }}
              title="Emergency SOS"
            >
              <ShieldAlert size={13} />
              <span>SOS</span>
            </button>

            {/* Shift Toggle */}
            <button
              onClick={() => setIsRiderOnline(!isRiderOnline)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isRiderOnline ? 'var(--color-veg)' : 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              <Power size={13} />
              <span>{isRiderOnline ? 'ON DUTY' : 'GO ONLINE'}</span>
            </button>
          </div>
        </div>

        {/* Daily Stats Bar (clickable to open passbook) */}
        <div
          onClick={() => setIsEarningsModalOpen(true)}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            marginTop: '14px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer'
          }}
        >
          <div>
            <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Today's Earnings (Tap for passbook)</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-veg)' }}>
              ₹{riderEarningsToday} ➔
            </div>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Trips Completed</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
              {riderTripsToday} deliveries
            </div>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 75, 58, 0.15)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              border: '1px solid rgba(255, 75, 58, 0.4)',
              cursor: 'pointer'
            }}
          >
            <User size={13} color="var(--color-primary)" />
            <span>Full Profile</span>
          </button>

          <button
            onClick={() => setIsTripsModalOpen(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}
          >
            <ClipboardList size={13} color="var(--color-primary)" />
            <span>Trips</span>
          </button>

          <button
            onClick={() => setIsKycModalOpen(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}
          >
            <FileCheck size={13} color="var(--color-veg)" />
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
    </div>
  );
};
