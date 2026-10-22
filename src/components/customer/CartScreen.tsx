import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { COUPONS } from '../../data/mockData';
import {
  ArrowLeft,
  Plus,
  Minus,
  Sparkles,
  Check,
  Tag,
  ShieldCheck,
  Trash2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface CartScreenProps {
  onOpenPayment: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onOpenPayment }) => {
  const {
    selectedRestaurant,
    cart,
    updateQuantity,
    clearCart,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setCustomerScreen,
    selectedAddress
  } = useTomattto();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [tip, setTip] = useState<number>(30);
  const [deliveryInstruction, setDeliveryInstruction] = useState<string>('Leave at door');

  if (cart.length === 0 || !selectedRestaurant) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            marginBottom: '16px'
          }}
        >
          🛒
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Your cart is empty</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px', maxWidth: '260px' }}>
          Good food is always waiting for you. Discover top restaurants and add delicious meals!
        </p>
        <button
          onClick={() => setCustomerScreen('home')}
          style={{
            marginTop: '20px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          Explore Food
        </button>
      </div>
    );
  }

  // Bill calculations
  const discountAmount = appliedCoupon
    ? Math.min(appliedCoupon.maxDiscount, (cartTotal * appliedCoupon.discountPercentage) / 100)
    : 0;
  const deliveryFee = appliedCoupon?.code === 'FREESHIP' ? 0 : 35;
  const platformFee = 5;
  const taxAmount = Math.round(cartTotal * 0.05);
  const toPayTotal = cartTotal - discountAmount + deliveryFee + platformFee + taxAmount + tip;

  const handleApplyCoupon = (code: string) => {
    setCouponError('');
    const success = applyCoupon(code);
    if (!success) {
      setCouponError('Invalid coupon code. Try TOMATTTO50');
    }
  };

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
            onClick={() => setCustomerScreen('restaurant')}
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
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>{selectedRestaurant.name}</h3>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Delivery to Indiranagar
            </span>
          </div>
        </div>

        <button
          onClick={clearCart}
          title="Clear Cart"
          style={{
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-muted)'
          }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Delivery ETA Strip */}
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: 'var(--color-surface-elevated)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--color-text-main)'
        }}
      >
        <Clock size={14} color="var(--color-primary)" />
        <span>Standard Delivery in <b>22-26 mins</b></span>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }} className="no-scrollbar">
        {/* Cart Items List Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '14px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cart.map((cartItem) => (
              <div
                key={cartItem.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--color-border-subtle)'
                }}
              >
                <div style={{ flex: 1, paddingRight: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        border: `1.5px solid ${cartItem.menuItem.dietary === 'veg' ? 'var(--color-veg)' : 'var(--color-nonveg)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '2px'
                      }}
                    >
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: cartItem.menuItem.dietary === 'veg' ? 'var(--color-veg)' : 'var(--color-nonveg)'
                        }}
                      />
                    </span>
                    <h5 style={{ fontSize: '13px', fontWeight: 700 }}>{cartItem.menuItem.name}</h5>
                  </div>

                  {cartItem.selectedVariant && (
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '18px', marginTop: '2px' }}>
                      Size: {cartItem.selectedVariant.name}
                    </div>
                  )}

                  {cartItem.selectedAddons && cartItem.selectedAddons.length > 0 && (
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginLeft: '18px', marginTop: '1px' }}>
                      Add-ons: {cartItem.selectedAddons.map((a) => a.name).join(', ')}
                    </div>
                  )}

                  <div style={{ fontSize: '12px', fontWeight: 700, marginLeft: '18px', marginTop: '4px' }}>
                    ₹{cartItem.itemTotal}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-muted)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '3px 8px',
                    gap: '10px'
                  }}
                >
                  <button
                    onClick={() => updateQuantity(cartItem.id, -1)}
                    style={{ color: 'var(--color-primary)', display: 'flex' }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(cartItem.id, 1)}
                    style={{ color: 'var(--color-primary)', display: 'flex' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCustomerScreen('restaurant')}
            style={{
              marginTop: '12px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={14} />
            <span>Add more items</span>
          </button>
        </div>

        {/* Coupons & Offers Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Tag size={16} color="var(--color-primary)" />
            <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Coupons & Offers</h4>
          </div>

          {appliedCoupon ? (
            <div
              style={{
                backgroundColor: 'var(--color-veg-bg)',
                border: '1px dashed var(--color-veg)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-veg)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Check size={14} />
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-veg)' }}>
                    '{appliedCoupon.code}' Applied!
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-main)', marginTop: '1px' }}>
                    You are saving ₹{discountAmount} on this order
                  </p>
                </div>
              </div>

              <button
                onClick={removeCoupon}
                style={{ fontSize: '12px', fontWeight: 700, color: '#E74C3C' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter Promo Code"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--color-surface-muted)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: '1px solid var(--color-border)'
                  }}
                />
                <button
                  onClick={() => handleApplyCoupon(couponCodeInput)}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <p style={{ fontSize: '11px', color: '#E74C3C', marginBottom: '8px' }}>{couponError}</p>
              )}

              {/* Quick Coupon Pills */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }} className="no-scrollbar">
                {COUPONS.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleApplyCoupon(c.code)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '1px dashed var(--color-primary)',
                      color: 'var(--color-primary)',
                      fontSize: '11px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Sparkles size={11} />
                    <span>{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tip Delivery Partner */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Say Thanks with a Tip</h4>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>100% goes to your rider</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {[20, 30, 50].map((amt) => {
              const isSelected = tip === amt;
              return (
                <button
                  key={amt}
                  onClick={() => setTip(isSelected ? 0 : amt)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                    border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  ₹{amt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Delivery Instructions Chips */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '14px'
          }}
        >
          <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>Delivery Instructions</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['Leave at door', 'Avoid calling', "Don't ring bell", 'Pet at home'].map((instruction) => {
              const isSelected = deliveryInstruction === instruction;
              return (
                <button
                  key={instruction}
                  onClick={() => setDeliveryInstruction(isSelected ? '' : instruction)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                    border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)'
                  }}
                >
                  {instruction}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bill Summary Breakdown */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: '16px'
          }}
        >
          <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>Bill Details</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Item Total</span>
              <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>₹{cartTotal}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Delivery Partner Fee</span>
              {deliveryFee === 0 ? (
                <span style={{ color: 'var(--color-veg)', fontWeight: 700 }}>FREE</span>
              ) : (
                <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>₹{deliveryFee}</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Platform Fee</span>
              <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>₹{platformFee}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Taxes & Restaurant Charges (5%)</span>
              <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>₹{taxAmount}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-veg)', fontWeight: 700 }}>
                <span>Coupon Discount</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            {tip > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Delivery Partner Tip</span>
                <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>₹{tip}</span>
              </div>
            )}

            <div
              style={{
                marginTop: '6px',
                paddingTop: '8px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '15px',
                fontWeight: 800
              }}
            >
              <span>TO PAY</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{toPayTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Checkout Footer */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700 }}>
            Total Amount
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>
            ₹{toPayTotal}
          </div>
        </div>

        <button
          onClick={onOpenPayment}
          style={{
            flex: 1,
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            padding: '13px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <span>Select Payment</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
