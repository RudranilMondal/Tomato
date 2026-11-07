import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { X, ShieldCheck, Check, Smartphone, CreditCard, Banknote } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { placeOrder, isPlacingOrder, orderError, cartTotal, appliedCoupon } = useTomattto();
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const discountAmount = appliedCoupon
    ? Math.min(appliedCoupon.maxDiscount, (cartTotal * appliedCoupon.discountPercentage) / 100)
    : 0;
  const deliveryFee = appliedCoupon?.code === 'FREESHIP' ? 0 : 35;
  const platformFee = 5;
  const taxAmount = Math.round(cartTotal * 0.05);
  const tipAmount = 30;
  const finalPayable = cartTotal - discountAmount + deliveryFee + platformFee + taxAmount + tipAmount;

  const handlePay = async () => {
    if (isProcessing || isPlacingOrder) return;
    setIsProcessing(true);
    const success = await placeOrder(selectedMethod);
    setIsProcessing(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          padding: '20px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Choose Payment Method</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              100% Secure • Razorpay Encrypted
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-muted)',
              color: 'var(--color-text-main)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Payment Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {/* UPI */}
          <div
            onClick={() => setSelectedMethod('upi')}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: selectedMethod === 'upi' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: selectedMethod === 'upi' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(46, 204, 113, 0.15)',
                  color: '#27AE60',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Smartphone size={18} />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>Instant UPI</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Google Pay, PhonePe, Paytm, Cred</span>
              </div>
            </div>

            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: `2px solid ${selectedMethod === 'upi' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedMethod === 'upi' && (
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              )}
            </div>
          </div>

          {/* Cards */}
          <div
            onClick={() => setSelectedMethod('card')}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: selectedMethod === 'card' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: selectedMethod === 'card' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(52, 152, 219, 0.15)',
                  color: '#2980B9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CreditCard size={18} />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>Credit & Debit Cards</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Visa, MasterCard, Rupay, Amex</span>
              </div>
            </div>

            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: `2px solid ${selectedMethod === 'card' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedMethod === 'card' && (
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              )}
            </div>
          </div>

          {/* COD */}
          <div
            onClick={() => setSelectedMethod('cod')}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: selectedMethod === 'cod' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: selectedMethod === 'cod' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(230, 126, 34, 0.15)',
                  color: '#D35400',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Banknote size={18} />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>Cash on Delivery (COD)</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Pay cash or UPI at delivery doorstep</span>
              </div>
            </div>

            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: `2px solid ${selectedMethod === 'cod' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedMethod === 'cod' && (
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              )}
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            marginBottom: '14px'
          }}
        >
          <ShieldCheck size={14} color="#27AE60" />
          <span>PCI-DSS 256-bit encrypted checkout</span>
        </div>

        {orderError && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              border: '1px solid rgba(231, 76, 60, 0.3)',
              color: '#C0392B',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '12px',
              textAlign: 'center'
            }}
          >
            {orderError}
          </div>
        )}
        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={isProcessing || isPlacingOrder}
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
            boxShadow: 'var(--shadow-glow)',
            opacity: isProcessing ? 0.7 : 1
          }}
        >
          {(isProcessing || isPlacingOrder) ? (
            <span>Authorising Payment...</span>
          ) : (
            <span>Pay ₹{finalPayable} & Place Order</span>
          )}
        </button>
      </div>
    </div>
  );
};
