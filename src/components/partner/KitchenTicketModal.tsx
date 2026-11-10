import React, { useState } from 'react';
import { Order } from '../../types';
import { X, Printer, CheckCircle2, Clock, MapPin, User, AlertTriangle, ChefHat, Bike, ShieldAlert, CreditCard } from 'lucide-react';

interface KitchenTicketModalProps {
  order: Order | null;
  onClose: () => void;
  onAcceptOrder?: (orderId: string, prepMins?: number) => void;
  onStartPreparing?: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
  onRejectOrder?: (orderId: string) => void;
}

export const KitchenTicketModal: React.FC<KitchenTicketModalProps> = ({
  order,
  onClose,
  onAcceptOrder,
  onStartPreparing,
  onMarkReady,
  onRejectOrder
}) => {
  const [selectedPrepMins, setSelectedPrepMins] = useState<number>(order?.estimatedPrepMinutes || 20);

  if (!order) return null;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return { bg: 'rgba(231, 76, 60, 0.15)', text: '#E74C3C', border: '#E74C3C', label: 'NEW ORDER' };
      case 'accepted':
        return { bg: 'rgba(52, 152, 219, 0.15)', text: '#2980B9', border: '#3498DB', label: 'ACCEPTED' };
      case 'preparing':
        return { bg: 'rgba(230, 126, 34, 0.15)', text: '#D35400', border: '#E67E22', label: 'IN PREPARATION' };
      case 'ready':
      case 'rider_assigned':
        return { bg: 'rgba(46, 204, 113, 0.15)', text: 'var(--color-veg)', border: 'var(--color-veg)', label: 'READY FOR PICKUP' };
      case 'picked_up':
      case 'out_for_delivery':
        return { bg: 'rgba(155, 89, 182, 0.15)', text: '#8E44AD', border: '#9B59B6', label: 'OUT FOR DELIVERY' };
      case 'delivered':
        return { bg: 'rgba(46, 204, 113, 0.12)', text: '#27AE60', border: '#27AE60', label: 'DELIVERED' };
      case 'rejected':
      case 'cancelled':
        return { bg: 'rgba(127, 140, 141, 0.15)', text: '#7F8C8D', border: '#95A5A6', label: status.toUpperCase() };
      default:
        return { bg: 'var(--color-surface-muted)', text: 'var(--color-text-main)', border: 'var(--color-border)', label: status };
    }
  };

  const statusStyle = getStatusColor(order.status);

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
          maxWidth: '520px',
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
                {order.items.reduce((s, i) => s + i.quantity, 0)} ITEMS
              </span>
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 900, marginTop: '2px' }}>#{order.id}</h3>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              cursor: 'pointer'
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
              border: '1px solid var(--color-border)',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="var(--color-text-muted)" />
              <span>Placed: <b>{order.createdAt}</b></span>
              {order.estimatedPrepMinutes && (
                <span style={{ color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                  • Prep: <b>{order.estimatedPrepMinutes}m</b>
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                backgroundColor: statusStyle.bg,
                color: statusStyle.text,
                border: `1px solid ${statusStyle.border}`,
                padding: '3px 10px',
                borderRadius: '6px'
              }}
            >
              {statusStyle.label}
            </span>
          </div>

          {/* Customer & Delivery Info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={15} color="var(--color-primary)" />
                <span style={{ fontWeight: 700 }}>{order.customerName}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>({order.customerPhone})</span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  backgroundColor: 'var(--color-surface-muted)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}
              >
                {order.deliveryAddress.label || 'Home'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <MapPin size={15} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                <span>{order.deliveryAddress.addressLine}</span>
                {order.deliveryAddress.landmark && (
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Landmark: {order.deliveryAddress.landmark}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Special Cooking Instructions Alert */}
          {order.specialCookingInstructions && (
            <div
              style={{
                backgroundColor: '#FFF9E6',
                border: '1.5px solid #FFB400',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <AlertTriangle size={18} color="#D35400" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#D35400', letterSpacing: '0.5px' }}>
                  CHEF INSTRUCTIONS / DIETARY ADVICE:
                </span>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1E1E24', marginTop: '2px' }}>
                  "{order.specialCookingInstructions}"
                </p>
              </div>
            </div>
          )}

          {/* Rejection / Cancellation Notice if applicable */}
          {(order.status === 'rejected' || order.status === 'cancelled') && (
            <div
              style={{
                backgroundColor: 'rgba(231, 76, 60, 0.08)',
                border: '1.5px solid #E74C3C',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <ShieldAlert size={18} color="#E74C3C" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#E74C3C' }}>
                  {order.status === 'rejected' ? 'ORDER REJECTED' : 'ORDER CANCELLED'}:
                </span>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '2px' }}>
                  Reason: {order.rejectionReason || order.cancellationReason || 'Standard operational cancellation'}
                </p>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Payment status: <b>{order.paymentStatus || 'refunded'}</b>
                </span>
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
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{item.menuItem.name}</h4>
                        {item.selectedVariant && (
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                            Variant: <b>{item.selectedVariant.name}</b>
                          </span>
                        )}
                      </div>
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
                          Item Note: "{item.specialInstruction}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Rider Info (if present) */}
          {order.rider && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(52, 152, 219, 0.08)',
                border: '1px solid rgba(52, 152, 219, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  <Bike size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Assigned Delivery Rider
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800 }}>
                    {order.rider.name} • {order.rider.vehicleNumber}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Rider Phone</span>
                <b>{order.rider.phone}</b>
              </div>
            </div>
          )}

          {/* Payment & Pickup OTP Summary */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-muted)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block', fontWeight: 700 }}>
                RIDER PICKUP CODE
              </span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '1.5px' }}>
                {order.pickupOtp}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} color="var(--color-text-muted)" />
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>
                  {order.paymentMethod.toUpperCase()} • {order.paymentStatus ? order.paymentStatus.toUpperCase() : 'CAPTURED'}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 900 }}>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Status-Aware Lifecycle Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            {/* If Placed: Accept (with prep time select) and Reject */}
            {order.status === 'placed' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>Estimated Prep Time:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[15, 20, 30, 45].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setSelectedPrepMins(mins)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: selectedPrepMins === mins ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                          color: selectedPrepMins === mins ? '#FFFFFF' : 'var(--color-text-main)',
                          border: `1px solid ${selectedPrepMins === mins ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          cursor: 'pointer'
                        }}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {onRejectOrder && (
                    <button
                      onClick={() => {
                        onRejectOrder(order.id);
                        onClose();
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'transparent',
                        color: '#E74C3C',
                        border: '1.5px solid #E74C3C',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Reject Order
                    </button>
                  )}

                  {onAcceptOrder && (
                    <button
                      onClick={() => {
                        onAcceptOrder(order.id, selectedPrepMins);
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
                        boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Accept Order ({selectedPrepMins} mins)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* If Accepted: Start Preparing Button */}
            {order.status === 'accepted' && onStartPreparing && (
              <button
                onClick={() => {
                  onStartPreparing(order.id);
                  onClose();
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#E67E22',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(230, 126, 34, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <ChefHat size={16} />
                <span>Start Preparing in Kitchen</span>
              </button>
            )}

            {/* If Preparing: Mark Ready for Pickup Button */}
            {order.status === 'preparing' && (
              <button
                onClick={() => {
                  onMarkReady(order.id);
                  onClose();
                }}
                style={{
                  width: '100%',
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
                  boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Mark Food Ready for Pickup</span>
              </button>
            )}

            {/* Secondary: Print Thermal Ticket */}
            <button
              onClick={() => {
                alert(`Printing thermal KOT slip for #${order.id}... Sent to thermal ticket printer.`);
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-text-main)',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: '1px solid var(--color-border)',
                cursor: 'pointer'
              }}
            >
              <Printer size={16} />
              <span>Print Thermal KOT Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
