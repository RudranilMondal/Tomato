import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { Coupon } from '../../types';
import { X, Tag, Sparkles, Percent } from 'lucide-react';

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCouponModal: React.FC<CreateCouponModalProps> = ({ isOpen, onClose }) => {
  const { addCoupon } = useTomattto();

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('50');
  const [maxDiscount, setMaxDiscount] = useState('100');
  const [minOrderValue, setMinOrderValue] = useState('199');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;

    const newCoupon: Coupon = {
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim() || `Get ${discountPercentage}% discount up to ₹${maxDiscount}`,
      discountPercentage: parseInt(discountPercentage, 10) || 50,
      maxDiscount: parseInt(maxDiscount, 10) || 100,
      minOrderValue: parseInt(minOrderValue, 10) || 199
    };

    addCoupon(newCoupon);
    setCode('');
    setTitle('');
    setDescription('');
    onClose();
  };

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
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <Tag size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Create New Promo Coupon</h3>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Publish discount promo to live checkout</p>
            </div>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Coupon Code *
              </label>
              <input
                type="text"
                placeholder="e.g. FEAST50"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  color: 'var(--color-primary)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Badge Title *
              </label>
              <input
                type="text"
                placeholder="e.g. 50% OFF"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '13px',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Discount % *
              </label>
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                required
                min="5"
                max="100"
                style={{
                  width: '100%',
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '13px',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Max Cap (₹) *
              </label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                required
                min="10"
                style={{
                  width: '100%',
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '13px',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Min Order (₹) *
              </label>
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                required
                min="49"
                style={{
                  width: '100%',
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '13px',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Marketing Description
            </label>
            <input
              type="text"
              placeholder="e.g. Special weekend food festival discount up to ₹100"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                fontSize: '13px',
                color: 'var(--color-text-main)'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-text-main)',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Sparkles size={16} />
              <span>Publish Coupon</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
