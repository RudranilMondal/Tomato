import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { X, ShieldCheck, Check, Smartphone, CreditCard, Banknote, Sparkles, Lock } from 'lucide-react';
import { openRazorpayCheckout } from '../../lib/razorpay';
import { PRICING_CONFIG } from '../../config/pricing';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const {
    placeOrder,
    isPlacingOrder,
    orderError,
    cartTotal,
    appliedCoupon,
    user,
    selectedRestaurant,
    isLoggedIn,
    selectedTip,
    setCustomerScreen
  } = useTomattto();
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  if (!isLoggedIn) {
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
            padding: '24px 20px',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'var(--color-primary)'
            }}
          >
            <Lock size={24} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Login Required</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '8px 0 20px', lineHeight: 1.5 }}>
            You must log in to your account before confirming payment and placing this order.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                setCustomerScreen('auth');
              }}
              style={{
                flex: 1.5,
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow)',
                border: 'none'
              }}
            >
              Log In / Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isTestOneRupee = import.meta.env.VITE_RAZORPAY_TEST_ONE_RUPEE === 'true';
  const hasRazorpayKey = Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID);

  const discountAmount = appliedCoupon
    ? Math.min(appliedCoupon.maxDiscount, (cartTotal * appliedCoupon.discountPercentage) / 100)
    : 0;
  const deliveryFee = appliedCoupon?.code === 'FREESHIP' ? 0 : PRICING_CONFIG.CUSTOMER_DELIVERY_FEE;
  const platformFee = PRICING_CONFIG.CUSTOMER_PLATFORM_FEE;
  const taxAmount = Math.round(cartTotal * 0.05);
  const tipAmount = selectedTip || 0;
  const finalPayable = cartTotal - discountAmount + deliveryFee + platformFee + taxAmount + tipAmount;

  const handlePay = async () => {
    if (isProcessing || isPlacingOrder) return;
    setPaymentError(null);
    setIsProcessing(true);

    try {
      if (selectedMethod !== 'cod' && hasRazorpayKey) {
        await openRazorpayCheckout({
          amountInRupees: finalPayable,
          intent: 'customer_order',
          restaurantName: selectedRestaurant?.name,
          customerName: user?.name,
          customerPhone: user?.phone,
        });
      }

      const success = await placeOrder(selectedMethod, tipAmount);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      if (err?.message !== 'PAYMENT_CANCELLED') {
        setPaymentError(err?.message || 'Payment processing failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="Tomattto" style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'contain' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Choose Payment Method</h3>
            </div>
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

        {/* Transparent Bill Breakdown Summary */}
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-surface-muted)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '14px',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
            <span>Item Total</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>₹{cartTotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
            <span>Delivery Partner Fee</span>
            {deliveryFee === 0 ? (
              <span style={{ color: 'var(--color-veg)', fontWeight: 700 }}>FREE</span>
            ) : (
              <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>₹{deliveryFee}</span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
            <span>Platform Fee</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>₹{platformFee}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
            <span>Taxes & Restaurant Charges</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>₹{taxAmount}</span>
          </div>
          {tipAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Delivery Partner Tip</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>₹{tipAmount}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-veg)' }}>
              <span>Coupon Discount</span>
              <span style={{ fontWeight: 700 }}>-₹{discountAmount}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px solid var(--color-border)', paddingTop: '4px', marginTop: '2px', fontSize: '13px' }}>
            <span>TO PAY</span>
            <span style={{ color: 'var(--color-primary)' }}>₹{finalPayable}</span>
          </div>
        </div>

        {/* Security badge & Test mode notice */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '14px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--color-text-muted)'
            }}
          >
            <ShieldCheck size={14} color="#27AE60" />
            <span>PCI-DSS 256-bit encrypted checkout</span>
          </div>
          {isTestOneRupee && selectedMethod !== 'cod' && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#27AE60',
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                padding: '2px 8px',
                borderRadius: '12px'
              }}
            >
              <Sparkles size={11} />
              <span>Razorpay Sandbox: Passes ₹1 (100p) for live test checkout</span>
            </div>
          )}
        </div>

        {(paymentError || orderError) && (
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
            {paymentError || orderError}
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
