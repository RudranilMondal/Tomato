import React from 'react';
import { Order } from '../../types';
import { X, Printer, CheckCircle2, Clock, MapPin, User, AlertTriangle } from 'lucide-react';

interface KitchenTicketModalProps {
  order: Order | null;
  onClose: () => void;
  onMarkReady: (orderId: string) => void;
}

export const KitchenTicketModal: React.FC<KitchenTicketModalProps> = ({
  order,
  onClose,
  onMarkReady
}) => {
  if (!order) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflowY: 'auto',
          animation: 'slideUp 0.25s ease'
        }}
        className="no-scrollbar"
      >
        {/* Header with KOT Receipt Style */}
        <div
          style={{
            backgroundColor: '#1E1E24',
            color: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-veg)' }}>
                KITCHEN ORDER TICKET (KOT)
              </span>
              <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                TOKEN #42
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginTop: '2px' }}>#{order.id}</h3>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Receipt Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Order Details Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-muted)',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="var(--color-text-muted)" />
              <span>Placed at: <b>{order.createdAt}</b></span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                backgroundColor: 'var(--color-veg-bg)',
                color: 'var(--color-veg)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              {order.status.toUpperCase()}
            </span>
          </div>

          {/* Customer & Delivery Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} color="var(--color-primary)" />
              <span>Customer: <b>{order.customerName}</b> ({order.customerPhone})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={14} color="var(--color-primary)" style={{ marginTop: '2px' }} />
              <span style={{ color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                {order.deliveryAddress.addressLine}
              </span>
            </div>
          </div>

          {/* Special Cooking Instructions Alert */}
          {order.specialCookingInstructions && (
            <div
              style={{
                backgroundColor: '#FFF9E6',
                border: '1.5px solid #FFB400',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <AlertTriangle size={16} color="#D35400" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#D35400' }}>
                  CHEF INSTRUCTIONS / ALLERGIES:
                </span>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#1E1E24', marginTop: '2px' }}>
                  "{order.specialCookingInstructions}"
                </p>
              </div>
            </div>
          )}

          {/* Itemized Order Checklist */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
              Items to Prepare ({order.items.reduce((s, i) => s + i.quantity, 0)} items)
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 800
                        }}
                      >
                        {item.quantity}x
                      </span>
                      <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{item.menuItem.name}</h4>
                    </div>

                    <span style={{ fontSize: '13px', fontWeight: 800 }}>₹{item.itemTotal}</span>
                  </div>

                  {/* Add-ons and special instruction */}
                  {((item.selectedAddons && item.selectedAddons.length > 0) || item.specialInstruction) && (
                    <div style={{ marginTop: '8px', paddingLeft: '32px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div>
                          Addons: <b>{item.selectedAddons.map((a) => a.name).join(', ')}</b>
                        </div>
                      )}
                      {item.specialInstruction && (
                        <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                          Note: "{item.specialInstruction}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal and Pickup OTP */}
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-muted)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                RIDER PICKUP CODE
              </span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '1px' }}>
                {order.pickupOtp}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                TOTAL AMOUNT
              </span>
              <span style={{ fontSize: '18px', fontWeight: 900 }}>₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={() => {
                alert(`Printing KOT slip for #${order.id}... Sent to thermal printer.`);
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-text-main)',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: '1px solid var(--color-border)'
              }}
            >
              <Printer size={16} />
              <span>Print KOT</span>
            </button>

            {order.status !== 'ready' && order.status !== 'delivered' && (
              <button
                onClick={() => {
                  onMarkReady(order.id);
                  onClose();
                }}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-veg)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Mark Food Ready</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
