import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
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
  ArrowRight
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
    currentOrder
  } = useTomattto();

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid var(--color-primary)'
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
              </div>
              <span style={{ fontSize: '11px', color: '#A5A5B2' }}>KA 03 EN 4592 • Honda Shine</span>
            </div>
          </div>

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

        {/* Daily Stats Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            marginTop: '14px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div>
            <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Today's Earnings</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-veg)' }}>
              ₹{riderEarningsToday}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Trips Completed</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
              {riderTripsToday} deliveries
            </div>
          </div>
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
              <div>
                <span style={{ fontSize: '12px', color: '#A5A5B2' }}>In 250 metres</span>
                <h5 style={{ fontSize: '15px', fontWeight: 800 }}>Turn right onto 100ft Road</h5>
                <span style={{ fontSize: '11px', color: 'var(--color-veg)', fontWeight: 700 }}>
                  Fastest route • 4 mins away
                </span>
              </div>
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

        {/* Idle State when no order active */}
        {!activeRiderOrder && !riderDeliveryRequest && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-veg-bg)',
                color: 'var(--color-veg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Bike size={32} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              You're Online & Searching
            </h4>
            <p style={{ fontSize: '12px', marginTop: '6px', maxWidth: '240px', margin: '6px auto 0' }}>
              Stationed near Indiranagar high-demand zone. Orders will ring here automatically!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
