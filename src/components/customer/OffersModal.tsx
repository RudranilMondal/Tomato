import React, { useState } from 'react';
import { X, Tag, Sparkles, Check, Copy, AlertCircle, Percent } from 'lucide-react';
import { useTomattto } from '../../context/TomatttoContext';
import { Coupon } from '../../types';
import confetti from 'canvas-confetti';

interface OffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCouponApplied?: (coupon: Coupon) => void;
}

export const OffersModal: React.FC<OffersModalProps> = ({ isOpen, onClose, onCouponApplied }) => {
  const { coupons, applyCoupon, appliedCoupon, cartTotal } = useTomattto();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'percentage' | 'flat'>('all');

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApply = (coupon: Coupon) => {
    applyCoupon(coupon.code);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    if (onCouponApplied) {
      onCouponApplied(coupon);
    }
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const filteredCoupons = coupons.filter((c) => {
    if (selectedFilter === 'percentage') return c.discountPercentage > 0;
    if (selectedFilter === 'flat') return c.discountPercentage >= 40;
    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 2400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '88vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 18px',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Tag size={16} color="var(--color-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Promotions & Coupons</h3>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {coupons.length} active deals available for your feast
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-muted)',
              display: 'flex',
              color: 'var(--color-text-muted)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 18px',
            backgroundColor: 'var(--color-surface-muted)',
            borderBottom: '1px solid var(--color-border-subtle)'
          }}
        >
          {[
            { id: 'all', label: 'All Offers' },
            { id: 'percentage', label: '% Percentage' },
            { id: 'flat', label: '₹ Flat Off' }
          ].map((pill) => {
            const isActive = selectedFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setSelectedFilter(pill.id as any)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-main)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                  cursor: 'pointer'
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Coupons List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }} className="no-scrollbar">
          {/* Tomattto Gold Promo Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FFB400 0%, #E67E22 100%)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              color: '#FFFFFF',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Sparkles size={24} />
            <div>
              <span style={{ fontSize: '12px', fontWeight: 900, display: 'block' }}>
                Tomattto Gold Privilege Active
              </span>
              <span style={{ fontSize: '10px', opacity: 0.95 }}>
                Free delivery unlocked on all orders + extra ₹25 cash rebate!
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredCoupons.map((coupon) => {
              const isApplied = appliedCoupon?.code === coupon.code;
              const isEligible = cartTotal >= coupon.minOrderValue;

              return (
                <div
                  key={coupon.code}
                  style={{
                    backgroundColor: isApplied ? 'var(--color-primary-light)' : 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px dashed',
                    borderColor: isApplied ? 'var(--color-primary)' : 'var(--color-border)',
                    padding: '14px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 900,
                          letterSpacing: '0.04em',
                          color: 'var(--color-primary)',
                          backgroundColor: 'rgba(255, 75, 58, 0.1)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(255, 75, 58, 0.25)'
                        }}
                      >
                        {coupon.code}
                      </span>

                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: 'var(--color-veg)',
                          backgroundColor: 'var(--color-veg-bg)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)'
                        }}
                      >
                        {coupon.discountPercentage}% OFF
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-muted)',
                          color: copiedCode === coupon.code ? 'var(--color-veg)' : 'var(--color-text-muted)',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        {copiedCode === coupon.code ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedCode === coupon.code ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => handleApply(coupon)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isApplied ? 'var(--color-veg)' : 'var(--color-primary)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        {isApplied ? 'Applied ✓' : 'Apply'}
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', fontWeight: 600, marginTop: '8px', color: 'var(--color-text-main)' }}>
                    {coupon.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--color-border-subtle)',
                      fontSize: '10px',
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    <span>Min order: ₹{coupon.minOrderValue}</span>
                    {coupon.maxDiscount && <span>• Max discount: ₹{coupon.maxDiscount}</span>}
                    {!isEligible && cartTotal > 0 && (
                      <span style={{ color: '#E67E22', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <AlertCircle size={10} /> Add ₹{coupon.minOrderValue - cartTotal} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
