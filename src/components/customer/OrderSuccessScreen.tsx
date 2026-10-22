import React from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';

export const OrderSuccessScreen: React.FC = () => {
  const { currentOrder, setCustomerScreen } = useTomattto();

  if (!currentOrder) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>No active order</p>
        <button onClick={() => setCustomerScreen('home')} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '36px 20px 24px',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      {/* Top Graphic */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-veg-bg)',
            color: 'var(--color-veg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 10px 25px rgba(46, 204, 113, 0.25)'
          }}
        >
          <CheckCircle2 size={54} />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-main)' }}>
          Order Placed!
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
          Your order has reached <b>{currentOrder.restaurant.name}</b>
        </p>

        <span
          style={{
            marginTop: '12px',
            backgroundColor: 'var(--color-surface-muted)',
            border: '1px solid var(--color-border)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-text-muted)'
          }}
        >
          Order ID: {currentOrder.id}
        </span>
      </div>

      {/* ETA & Info Card */}
      <div
        style={{
          width: '100%',
          backgroundColor: 'var(--color-surface-muted)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          border: '1px solid var(--color-border)',
          margin: '24px 0',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Clock size={18} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
              Estimated Delivery
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800 }}>
              24-28 mins
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border-subtle)' }}>
          <MapPin size={16} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
              Delivering to
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main)', lineHeight: 1.3 }}>
              {currentOrder.deliveryAddress.addressLine}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={() => setCustomerScreen('order_tracking')}
          style={{
            width: '100%',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <span>Track Live Order</span>
          <ArrowRight size={18} />
        </button>

        <button
          onClick={() => setCustomerScreen('home')}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
            padding: '10px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
