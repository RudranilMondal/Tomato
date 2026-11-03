import React, { useState, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Clock,
  ShieldCheck,
  Bike,
  Home,
  Store,
  ChevronDown,
  ChevronUp,
  Star,
  FileText
} from 'lucide-react';
import { RiderChatModal } from './RiderChatModal';
import { RiderCallModal } from './RiderCallModal';
import { OrderReviewModal } from './OrderReviewModal';
import { InvoiceModal } from './InvoiceModal';

export const OrderTrackingScreen: React.FC = () => {
  const { currentOrder, setCustomerScreen } = useTomattto();
  const [riderProgress, setRiderProgress] = useState(30); // percentage along route
  const [showItems, setShowItems] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Animate mock rider moving smoothly along the route
  useEffect(() => {
    const interval = setInterval(() => {
      setRiderProgress((prev) => {
        if (prev >= 90) return 20; // loop simulation
        return prev + 2;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentOrder) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>No active order to track</p>
        <button onClick={() => setCustomerScreen('home')} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
          Back to Home
        </button>
      </div>
    );
  }

  // Derive active step based on order status
  const steps = [
    { id: 'placed', label: 'Order Placed', time: currentOrder.createdAt },
    { id: 'accepted', label: 'Restaurant Confirmed', time: 'Just now' },
    { id: 'preparing', label: 'Chef Preparing Food', time: 'In progress' },
    { id: 'picked_up', label: 'Rider on the Way', time: 'ETA 15m' },
    { id: 'delivered', label: 'Delivered', time: 'Pending' }
  ];

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setCustomerScreen('home')}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-muted)',
              color: 'var(--color-text-main)',
              display: 'flex'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Live Tracking</h3>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Order {currentOrder.id}
            </span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-veg-bg)',
            color: 'var(--color-veg)',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)'
          }}
        >
          LIVE
        </div>
      </div>

      {/* Simulated Live GPS Map Container */}
      <div
        style={{
          height: '240px',
          backgroundColor: '#E7E5E0',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        {/* Map Grid Roads Pattern */}
        <svg
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="road-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D7D3CB" strokeWidth="6" />
              <path d="M 30 0 L 30 60 M 0 30 L 60 30" fill="none" stroke="#E0DDD6" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#road-grid)" />

          {/* Delivery Route Polyline */}
          <path
            d="M 50 180 Q 150 160 200 110 T 330 60"
            fill="none"
            stroke="#FF4B3A"
            strokeWidth="5"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
        </svg>

        {/* Restaurant Pin (Start of route) */}
        <div
          style={{
            position: 'absolute',
            left: '40px',
            top: '160px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#1E1E24',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '2px solid #FFFFFF'
            }}
          >
            <Store size={16} />
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#FFFFFF',
              padding: '2px 6px',
              borderRadius: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              marginTop: '4px',
              color: '#1E1E24',
              whiteSpace: 'nowrap'
            }}
          >
            {currentOrder.restaurant.name.slice(0, 14)}
          </span>
        </div>

        {/* Customer Home Pin (Destination of route) */}
        <div
          style={{
            position: 'absolute',
            left: '310px',
            top: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-veg)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(46, 204, 113, 0.4)',
              border: '2px solid #FFFFFF'
            }}
          >
            <Home size={16} />
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#FFFFFF',
              padding: '2px 6px',
              borderRadius: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              marginTop: '4px',
              color: '#1E1E24'
            }}
          >
            Your Home
          </span>
        </div>

        {/* Moving Rider Pin */}
        <div
          style={{
            position: 'absolute',
            left: `${40 + (riderProgress / 100) * 270}px`,
            top: `${160 - (riderProgress / 100) * 110}px`,
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          {/* Animated Rider Badge */}
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
              boxShadow: '0 6px 16px var(--color-primary-glow)',
              border: '3px solid #FFFFFF',
              animation: 'pulseGlow 2s infinite'
            }}
          >
            <Bike size={20} />
          </div>

          <div
            style={{
              backgroundColor: '#1E1E24',
              color: '#FFFFFF',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '9px',
              fontWeight: 700,
              marginTop: '4px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}
          >
            Vikram • 1.2 km away
          </div>
        </div>

        {/* Floating ETA Card on Map */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)',
            zIndex: 20
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--color-primary)" />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E1E24', display: 'block' }}>
                Arriving in 18-22 mins
              </span>
              <span style={{ fontSize: '11px', color: '#737380' }}>
                On time • Traffic is normal
              </span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-primary-light)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--color-primary)'
            }}
          >
            OTP: {currentOrder.deliveryOtp}
          </div>
        </div>
      </div>

      {/* Scrollable Status Details */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }} className="no-scrollbar">
        {/* Rider Profile Card */}
        {currentOrder.rider && (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid var(--color-border)'
                }}
              >
                <img
                  src={currentOrder.rider.photoUrl}
                  alt={currentOrder.rider.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{currentOrder.rider.name}</h4>
                  <span
                    style={{
                      backgroundColor: 'var(--color-rating-bg)',
                      color: '#D35400',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <span>{currentOrder.rider.rating}</span>
                    <Star size={9} fill="#D35400" />
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Your Delivery Partner • {currentOrder.rider.vehicleNumber}
                </p>
              </div>
            </div>

            {/* Call / Chat Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsCallOpen(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-veg-bg)',
                  color: 'var(--color-veg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Call Rider"
              >
                <Phone size={16} />
              </button>

              <button
                onClick={() => setIsChatOpen(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Chat with Rider"
              >
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Rate Order & Food Banner Action */}
        <div
          onClick={() => setIsReviewOpen(true)}
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-muted) 100%)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⭐</span>
            <div>
              <h5 style={{ fontSize: '13px', fontWeight: 800 }}>Rate Your Feast & Rider</h5>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Share feedback for {currentOrder.restaurant.name}
              </span>
            </div>
          </div>

          <button
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700
            }}
          >
            Rate
          </button>
        </div>

        {/* Order Stepper Progress */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '16px'
          }}
        >
          <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '14px' }}>Order Status</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {steps.map((step, idx) => {
              const isPassed = idx <= 2;
              const isCurrent = idx === 2;

              return (
                <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: isPassed ? 'var(--color-veg)' : 'var(--color-border)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800
                      }}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        style={{
                          width: '2px',
                          height: '24px',
                          backgroundColor: isPassed ? 'var(--color-veg)' : 'var(--color-border)',
                          marginTop: '4px'
                        }}
                      />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: isCurrent ? 800 : 600,
                          color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-main)'
                        }}
                      >
                        {step.label}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {step.time}
                      </span>
                    </div>
                    {isCurrent && (
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        The kitchen is preparing your piping hot fresh meal.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsible Order Summary */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)'
          }}
        >
          <div
            onClick={() => setShowItems(!showItems)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 800 }}>
                {currentOrder.items.length} items • ₹{currentOrder.totalAmount}
              </span>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                Paid via {currentOrder.paymentMethod.toUpperCase()}
              </p>
            </div>
            {showItems ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {showItems && (
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-border-subtle)' }}>
              {currentOrder.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>{item.quantity}x {item.menuItem.name}</span>
                  <span style={{ fontWeight: 600 }}>₹{item.itemTotal}</span>
                </div>
              ))}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInvoiceOpen(true);
                }}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-muted)',
                  color: 'var(--color-text-main)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: '1px solid var(--color-border)'
                }}
              >
                <FileText size={13} color="var(--color-primary)" />
                <span>Download Official Tax Invoice</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rider Chat Modal */}
      <RiderChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onCallRider={() => {
          setIsChatOpen(false);
          setIsCallOpen(true);
        }}
      />

      {/* Simulated Live Call Screen */}
      <RiderCallModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
      />

      {/* Post-Order Rating & Review Sheet */}
      <OrderReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        orderId={currentOrder.id}
      />

      {/* Tax Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={currentOrder}
      />
    </div>
  );
};
