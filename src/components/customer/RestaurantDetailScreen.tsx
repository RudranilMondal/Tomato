import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { MenuItem } from '../../types';
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  Clock,
  Sparkles,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck
} from 'lucide-react';

export const RestaurantDetailScreen: React.FC = () => {
  const {
    selectedRestaurant,
    setCustomerScreen,
    setCustomizingItem,
    addToCart,
    cart,
    updateQuantity,
    cartTotal,
    itemCount
  } = useTomattto();

  const [activeCategory, setActiveCategory] = useState<string>(
    selectedRestaurant?.categories[0]?.id || ''
  );

  if (!selectedRestaurant) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>No restaurant selected</p>
        <button
          onClick={() => setCustomerScreen('home')}
          style={{ marginTop: '12px', color: 'var(--color-primary)', fontWeight: 700 }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handleAddItem = (item: MenuItem) => {
    if ((item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0)) {
      setCustomizingItem(item);
    } else {
      addToCart(item);
    }
  };

  const getItemQuantityInCart = (itemId: string): number => {
    return cart
      .filter((ci) => ci.menuItem.id === itemId)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  const getCartItemId = (itemId: string): string | undefined => {
    return cart.find((ci) => ci.menuItem.id === itemId)?.id;
  };

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Hero Image Banner */}
      <div style={{ position: 'relative', height: '190px', width: '100%' }}>
        <img
          src={selectedRestaurant.coverImage}
          alt={selectedRestaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)'
          }}
        />

        {/* Top Header Buttons */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <button
            onClick={() => setCustomerScreen('home')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Share2 size={16} />
            </button>
            <button
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Heart size={16} />
            </button>
          </div>
        </div>

        {/* Floating Restaurant Title */}
        <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', color: '#FFFFFF' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
            {selectedRestaurant.name}
          </h2>
          <p style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px' }}>
            {selectedRestaurant.cuisines.join(' • ')} • {selectedRestaurant.address}
          </p>
        </div>
      </div>

      {/* Meta Specs Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                backgroundColor: '#27AE60',
                color: '#FFFFFF',
                padding: '2px 5px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <span>{selectedRestaurant.rating}</span>
              <Star size={10} fill="#FFFFFF" />
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              ({(selectedRestaurant.ratingCount / 1000).toFixed(1)}k+)
            </span>
          </div>

          {/* Prep time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <Clock size={13} />
            <span>{selectedRestaurant.prepTimeMinutes} mins</span>
          </div>

          {/* Cost */}
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            ₹{selectedRestaurant.costForTwo} for two
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-veg)' }}>
          <ShieldCheck size={14} />
          <span style={{ fontWeight: 700 }}>FSSAI Lic.</span>
        </div>
      </div>

      {/* Offer Banner */}
      {selectedRestaurant.offerText && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={13} />
          <span>{selectedRestaurant.offerText} with code TOMATTTO50</span>
        </div>
      )}

      {/* Sticky Categories Navigation Rail */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          gap: '8px',
          padding: '10px 16px',
          overflowX: 'auto'
        }}
        className="no-scrollbar"
      >
        {selectedRestaurant.categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                color: isActive ? '#FFFFFF' : 'var(--color-text-main)',
                border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              {cat.name} ({cat.items.length})
            </button>
          );
        })}
      </div>

      {/* Menu Items List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', paddingBottom: itemCount > 0 ? '80px' : '20px' }}>
        {selectedRestaurant.categories.map((cat) => (
          <div key={cat.id} style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px' }}>
              {cat.name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cat.items.map((item) => {
                const qtyInCart = getItemQuantityInCart(item.id);
                const cartItemId = getCartItemId(item.id);
                const hasCustomisation = (item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0);

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      paddingBottom: '16px',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      gap: '14px'
                    }}
                  >
                    {/* Left Details */}
                    <div style={{ flex: 1 }}>
                      {/* Dietary Tag */}
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          border: `1.5px solid ${item.dietary === 'veg' ? 'var(--color-veg)' : 'var(--color-nonveg)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '3px',
                          marginBottom: '4px'
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: item.dietary === 'veg' ? 'var(--color-veg)' : 'var(--color-nonveg)'
                          }}
                        />
                      </span>

                      {item.isBestseller && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            color: '#E67E22',
                            backgroundColor: '#FDF2E9',
                            padding: '2px 5px',
                            borderRadius: '3px',
                            display: 'inline-block',
                            marginBottom: '4px'
                          }}
                        >
                          ★ BESTSELLER
                        </span>
                      )}

                      <h4 style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.25 }}>
                        {item.name}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>
                          ₹{item.discountPrice || item.price}
                        </span>
                        {item.discountPrice && (
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                            ₹{item.price}
                          </span>
                        )}
                      </div>

                      <p
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          marginTop: '6px',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* Right Image & Add Button */}
                    <div style={{ position: 'relative', width: '105px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '105px',
                          height: '95px',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Add Button or Quantity Counter */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-10px',
                          width: '90px',
                          backgroundColor: 'var(--color-surface)',
                          borderRadius: 'var(--radius-sm)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          border: '1.5px solid var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 8px',
                          zIndex: 5
                        }}
                      >
                        {qtyInCart > 0 && cartItemId ? (
                          <>
                            <button
                              onClick={() => updateQuantity(cartItemId, -1)}
                              style={{ color: 'var(--color-primary)', display: 'flex' }}
                            >
                              <Minus size={14} />
                            </button>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary)' }}>
                              {qtyInCart}
                            </span>
                            <button
                              onClick={() => updateQuantity(cartItemId, 1)}
                              style={{ color: 'var(--color-primary)', display: 'flex' }}
                            >
                              <Plus size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleAddItem(item)}
                            style={{
                              width: '100%',
                              color: 'var(--color-primary)',
                              fontSize: '12px',
                              fontWeight: 800,
                              textAlign: 'center'
                            }}
                          >
                            ADD
                          </button>
                        )}
                      </div>

                      {hasCustomisation && (
                        <span
                          style={{
                            fontSize: '9px',
                            color: 'var(--color-text-muted)',
                            marginTop: '14px',
                            fontWeight: 600
                          }}
                        >
                          customisable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Cart Bar */}
      {itemCount > 0 && (
        <div
          onClick={() => setCustomerScreen('cart')}
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-glow)',
            cursor: 'pointer',
            animation: 'slideUp 0.25s ease',
            zIndex: 50
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px'
              }}
            >
              {itemCount}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800 }}>₹{cartTotal}</div>
              <div style={{ fontSize: '10px', opacity: 0.9 }}>Plus taxes & charges</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}>
            <span>View Cart</span>
            <ShoppingBag size={16} />
          </div>
        </div>
      )}
    </div>
  );
};
