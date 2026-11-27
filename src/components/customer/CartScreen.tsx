import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { COUPONS } from '../../data/mockData';
import { PRICING_CONFIG } from '../../config/pricing';
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
  ArrowRight,
  Calendar,
  Lock
} from 'lucide-react';
import { OffersModal } from './OffersModal';
import { ScheduleOrderModal } from './ScheduleOrderModal';

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
    selectedAddress,
    isLoggedIn,
    selectedTip,
    setSelectedTip
  } = useTomattto();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [customTipValue, setCustomTipValue] = useState<string>('');
  const [isCustomTipActive, setIsCustomTipActive] = useState<boolean>(false);
  const [customTipError, setCustomTipError] = useState<string>('');
  const [deliveryInstruction, setDeliveryInstruction] = useState<string>('Leave at door');
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  // Fix #5 — track which cart item's quantity was just changed for pulse animation
  const [pulsedId, setPulsedId] = useState<string | null>(null);

  const handleQuantityChange = (cartItemId: string, delta: number) => {
    updateQuantity(cartItemId, delta);
    setPulsedId(cartItemId);
    setTimeout(() => setPulsedId(null), 200);
  };

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
  const deliveryFee = appliedCoupon?.code === 'FREESHIP' ? 0 : PRICING_CONFIG.CUSTOMER_DELIVERY_FEE;
  const platformFee = PRICING_CONFIG.CUSTOMER_PLATFORM_FEE;
  const taxAmount = Math.round(cartTotal * 0.05);
  const tip = selectedTip || 0;
  const toPayTotal = Math.max(0, cartTotal - discountAmount + deliveryFee + platformFee + taxAmount + tip);

  const handleApplyCoupon = (code: string) => {
    setCouponError('');
    const success = applyCoupon(code);
    if (!success) {
      setCouponError('Invalid coupon code. Try G1BITES50');
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

      {/* Delivery ETA & Schedule Strip */}
      <div
        onClick={() => setIsScheduleModalOpen(true)}
        style={{
          padding: '9px 16px',
          backgroundColor: scheduledTime ? 'rgba(255, 75, 58, 0.12)' : 'var(--color-surface-elevated)',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--color-text-main)',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {scheduledTime ? (
            <Calendar size={14} color="var(--color-primary)" />
          ) : (
            <Clock size={14} color="var(--color-primary)" />
          )}
          <span>
            {scheduledTime ? (
              <span>
                Scheduled for <b style={{ color: 'var(--color-primary)' }}>{scheduledTime}</b>
              </span>
            ) : (
              <span>
                Standard Delivery in <b>22-26 mins</b>
              </span>
            )}
          </span>
        </div>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-surface)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)'
          }}
        >
          {scheduledTime ? 'Change' : 'Schedule ➔'}
        </span>
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
                    onClick={() => handleQuantityChange(cartItem.id, -1)}
                    style={{ color: 'var(--color-primary)', display: 'flex' }}
                  >
                    <Minus size={13} />
                  </button>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--color-primary)',
                      display: 'inline-block',
                      transition: 'transform 0.15s ease',
                      transform: pulsedId === cartItem.id ? 'scale(1.4)' : 'scale(1)'
                    }}
                  >
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(cartItem.id, 1)}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} color="var(--color-primary)" />
              <h4 style={{ fontSize: '13px', fontWeight: 800 }}>Coupons & Offers</h4>
            </div>

            <button
              onClick={() => setIsOffersModalOpen(true)}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              View all offers
            </button>
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
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>100% goes directly to your rider</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            {PRICING_CONFIG.PREDEFINED_TIPS.map((amt) => {
              const isSelected = selectedTip === amt && !isCustomTipActive;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setIsCustomTipActive(false);
                    setCustomTipValue('');
                    setCustomTipError('');
                    setSelectedTip(isSelected ? 0 : amt);
                  }}
                  style={{
                    flex: '1 1 65px',
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                    border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected ? `✓ ₹${amt}` : `₹${amt}`}
                </button>
              );
            })}

            {/* Custom Tip Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const nextActive = !isCustomTipActive;
                setIsCustomTipActive(nextActive);
                setCustomTipError('');
                if (!nextActive && selectedTip > 0 && !PRICING_CONFIG.PREDEFINED_TIPS.includes(selectedTip as any)) {
                  setSelectedTip(0);
                  setCustomTipValue('');
                }
              }}
              style={{
                flex: '1 1 95px',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isCustomTipActive ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                border: isCustomTipActive ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                color: isCustomTipActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {isCustomTipActive && selectedTip > 0 && !PRICING_CONFIG.PREDEFINED_TIPS.includes(selectedTip as any)
                ? `✓ Custom ₹${selectedTip}`
                : isCustomTipActive
                ? 'Custom Tip'
                : '+ Custom Tip'}
            </button>
          </div>

          {/* Custom Tip Input Tray */}
          {isCustomTipActive && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--color-border)' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--color-text-muted)', fontSize: '13px' }}>₹</span>
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    step="1"
                    placeholder="Enter tip (e.g. 15, 45, 100)"
                    value={customTipValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomTipValue(val);
                      const num = parseInt(val, 10);
                      if (val === '') {
                        setCustomTipError('');
                        setSelectedTip(0);
                      } else if (isNaN(num) || num <= 0) {
                        setCustomTipError('Tip must be a positive amount');
                        setSelectedTip(0);
                      } else {
                        setCustomTipError('');
                        setSelectedTip(num);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 24px',
                      borderRadius: 'var(--radius-sm)',
                      border: customTipError ? '1px solid var(--color-nonveg)' : '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface-muted)',
                      color: 'var(--color-text-main)',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                </div>

                {selectedTip > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTip(0);
                      setCustomTipValue('');
                      setIsCustomTipActive(false);
                      setCustomTipError('');
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {customTipError ? (
                <span style={{ fontSize: '11px', color: 'var(--color-nonveg)', display: 'block', marginTop: '4px' }}>
                  {customTipError}
                </span>
              ) : selectedTip > 0 && isCustomTipActive ? (
                <span style={{ fontSize: '11px', color: 'var(--color-veg)', fontWeight: 700, display: 'block', marginTop: '4px' }}>
                  ✓ ₹{selectedTip} rider tip will be added to Grand Total
                </span>
              ) : null}
            </div>
          )}
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
              <span>Taxes & Restaurant Charges</span>
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

      {/* Guest Login Required Banner */}
      {!isLoggedIn && (
        <div
          style={{
            margin: '0 16px 10px 16px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(226, 55, 68, 0.08)',
            border: '1px solid rgba(226, 55, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={15} color="var(--color-primary)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Login required to place & confirm order
            </span>
          </div>
          <button
            onClick={() => setCustomerScreen('auth')}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Log In
          </button>
        </div>
      )}

      {/* Sticky Bottom Checkout Footer */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px max(14px, env(safe-area-inset-bottom)) 16px',
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          zIndex: 40
        }}
      >
        <div>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>
            TO PAY
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>
            ₹{toPayTotal}
          </div>
        </div>

        <button
          onClick={() => {
            if (!isLoggedIn) {
              setCustomerScreen('auth');
              return;
            }
            onOpenPayment();
          }}
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
            boxShadow: 'var(--shadow-glow)',
            cursor: 'pointer'
          }}
        >
          {!isLoggedIn ? (
            <>
              <Lock size={16} />
              <span>Login to Complete Order</span>
            </>
          ) : (
            <>
              <span>Select Payment</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* Offers & Coupons Explorer Modal */}
      <OffersModal
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
      />

      {/* Schedule Order Time Slot Modal */}
      <ScheduleOrderModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        selectedSchedule={scheduledTime}
        onSelectSchedule={(slot) => setScheduledTime(slot)}
      />
    </div>
  );
};
