import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { MenuItemVariant, MenuItemAddon } from '../../types';
import { X, Plus, Check } from 'lucide-react';

export const DishCustomizerModal: React.FC = () => {
  const { customizingItem, setCustomizingItem, addToCart } = useTomattto();

  if (!customizingItem) return null;

  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | undefined>(
    customizingItem.variants && customizingItem.variants.length > 0 ? customizingItem.variants[0] : undefined
  );
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [instructions, setInstructions] = useState('');

  const toggleAddon = (addon: MenuItemAddon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const basePrice = selectedVariant
    ? selectedVariant.price
    : customizingItem.discountPrice || customizingItem.price;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const finalPrice = basePrice + addonsTotal;

  const handleConfirm = () => {
    addToCart(customizingItem, selectedVariant, selectedAddons, instructions);
    setCustomizingItem(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={() => setCustomizingItem(null)}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          padding: '20px 20px calc(16px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '85vh',
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-border)',
          borderBottom: 'none',
          animation: 'slideUp 0.25s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Dish Name & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span
              style={{
                width: '16px',
                height: '16px',
                border: `2px solid ${customizingItem.dietary === 'veg' ? 'var(--color-veg)' : 'var(--color-nonveg)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '3px',
                marginTop: '3px'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: customizingItem.dietary === 'veg' ? 'var(--color-veg)' : 'var(--color-nonveg)'
                }}
              />
            </span>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{customizingItem.name}</h3>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
                ₹{finalPrice}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCustomizingItem(null)}
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

        {/* Scrollable Customization Options */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }} className="no-scrollbar">
          {/* Variants Selector */}
          {customizingItem.variants && customizingItem.variants.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Choose Portion Size
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Required • 1 Option</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customizingItem.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <div
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: isSelected ? 700 : 500 }}>
                        {variant.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>₹{variant.price}</span>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isSelected && (
                            <div
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-primary)'
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons Selector */}
          {customizingItem.addons && customizingItem.addons.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Add Extra Goodness
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Optional</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customizingItem.addons.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: isSelected ? 700 : 500 }}>
                        {addon.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>+₹{addon.price}</span>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isSelected && <Check size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Cooking Instructions */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
              Special Cooking Instructions
            </span>
            <input
              type="text"
              placeholder="e.g. Less spicy, extra onions, no cutlery..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-muted)',
                fontSize: '13px',
                color: 'var(--color-text-main)',
                border: '1px solid var(--color-border)'
              }}
            />
          </div>
        </div>

        {/* Bottom CTA Button */}
        <button
          onClick={handleConfirm}
          style={{
            marginTop: '10px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <span>Add Item</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>₹{finalPrice}</span>
            <Plus size={16} />
          </span>
        </button>
      </div>
    </div>
  );
};
