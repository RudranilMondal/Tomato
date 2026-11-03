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
  ShieldCheck,
  Utensils,
  MessageSquare,
  Camera,
  CheckCircle2,
  Layers,
  ChevronDown,
  Leaf,
  X,
  BookOpen
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
    itemCount,
    toggleFavorite,
    isFavorite
  } = useTomattto();

  const [activeMainTab, setActiveMainTab] = useState<'menu' | 'reviews'>('menu');
  const [activeCategory, setActiveCategory] = useState<string>(
    selectedRestaurant?.categories[0]?.id || ''
  );
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isVegOnly, setIsVegOnly] = useState(false);

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
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.35)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              transition: 'all 0.18s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)')}
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
              onClick={() => toggleFavorite(selectedRestaurant.id)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isFavorite(selectedRestaurant.id) ? '#FFFFFF' : 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                color: isFavorite(selectedRestaurant.id) ? 'var(--color-primary)' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isFavorite(selectedRestaurant.id) ? '0 4px 12px rgba(255, 75, 58, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Heart
                size={16}
                fill={isFavorite(selectedRestaurant.id) ? 'var(--color-primary)' : 'none'}
                color={isFavorite(selectedRestaurant.id) ? 'var(--color-primary)' : '#FFFFFF'}
              />
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
          padding: '10px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px 12px',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                backgroundColor: '#27AE60',
                color: '#FFFFFF',
                padding: '2px 6px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <Clock size={12} />
            <span>{selectedRestaurant.prepTimeMinutes} mins</span>
          </div>

          {/* Cost */}
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            ₹{selectedRestaurant.costForTwo} for two
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-veg)' }}>
          <ShieldCheck size={13} />
          <span style={{ fontWeight: 700 }}>FSSAI Verified</span>
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

      {/* Main Mode Toggle: Menu vs Reviews & Photos */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--color-surface-muted)',
          padding: '4px 16px',
          borderBottom: '1px solid var(--color-border)',
          gap: '8px'
        }}
      >
        <button
          onClick={() => setActiveMainTab('menu')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: activeMainTab === 'menu' ? 800 : 600,
            backgroundColor: activeMainTab === 'menu' ? 'var(--color-surface)' : 'transparent',
            color: activeMainTab === 'menu' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            boxShadow: activeMainTab === 'menu' ? 'var(--shadow-sm)' : 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Utensils size={14} />
          <span>Menu</span>
        </button>

        <button
          onClick={() => setActiveMainTab('reviews')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: activeMainTab === 'reviews' ? 800 : 600,
            backgroundColor: activeMainTab === 'reviews' ? 'var(--color-surface)' : 'transparent',
            color: activeMainTab === 'reviews' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            boxShadow: activeMainTab === 'reviews' ? 'var(--shadow-sm)' : 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <MessageSquare size={14} />
          <span>Reviews & Photos ({selectedRestaurant.rating} ★)</span>
        </button>
      </div>

      {/* Conditional: Menu or Reviews View */}
      {activeMainTab === 'menu' ? (
        <>
          {/* Sticky Categories Navigation Rail */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 30,
              backgroundColor: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              overflowX: 'auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
            className="no-scrollbar"
          >
            {/* Quick Categories Overview Trigger */}
            <button
              onClick={() => setIsCategoryDrawerOpen(true)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                cursor: 'pointer'
              }}
              title="View all categories in one place"
            >
              <Layers size={13} />
              <span>All Categories ({selectedRestaurant.categories.length})</span>
              <ChevronDown size={13} />
            </button>

            {/* Veg Only Toggle Pill */}
            <button
              onClick={() => setIsVegOnly(!isVegOnly)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isVegOnly ? 'var(--color-veg)' : 'var(--color-surface-muted)',
                color: isVegOnly ? '#FFFFFF' : 'var(--color-text-main)',
                border: `1px solid ${isVegOnly ? 'var(--color-veg)' : 'var(--color-border)'}`,
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                cursor: 'pointer'
              }}
            >
              <Leaf size={12} color={isVegOnly ? '#FFFFFF' : 'var(--color-veg)'} />
              <span>Veg Only</span>
            </button>

            {/* Individual Category Pills */}
            {selectedRestaurant.categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              const itemsInCat = isVegOnly
                ? cat.items.filter((i) => i.dietary === 'veg')
                : cat.items;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const el = document.getElementById(`cat-section-${cat.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: isActive ? 800 : 500,
                    backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-main)',
                    border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.name} ({itemsInCat.length})
                </button>
              );
            })}
          </div>

          {/* Menu Items List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', paddingBottom: itemCount > 0 ? '110px' : '75px' }} className="no-scrollbar">
            {selectedRestaurant.categories.map((cat) => {
              const visibleItems = isVegOnly
                ? cat.items.filter((i) => i.dietary === 'veg')
                : cat.items;

              if (visibleItems.length === 0) return null;

              return (
                <div key={cat.id} id={`cat-section-${cat.id}`} style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px', color: 'var(--color-text-main)' }}>
                    {cat.name} ({visibleItems.length})
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {visibleItems.map((item) => {
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
                            gap: '12px'
                          }}
                        >
                          {/* Left Details */}
                          <div style={{ flex: 1, minWidth: 0 }}>
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

                            <h4 style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.3, color: 'var(--color-text-main)' }}>
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
                                marginTop: '4px',
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
                          <div style={{ position: 'relative', width: '96px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                            <div
                              style={{
                                width: '96px',
                                height: '88px',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'var(--color-surface-muted)'
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
                                width: '84px',
                                backgroundColor: 'var(--color-surface)',
                                borderRadius: 'var(--radius-sm)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                                border: '1.5px solid var(--color-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '4px 6px',
                                zIndex: 10
                              }}
                            >
                              {qtyInCart > 0 && cartItemId ? (
                                <>
                                  <button
                                    onClick={() => updateQuantity(cartItemId, -1)}
                                    style={{ color: 'var(--color-primary)', display: 'flex', padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                  >
                                    <Minus size={13} />
                                  </button>
                                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-primary)' }}>
                                    {qtyInCart}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(cartItemId, 1)}
                                    style={{ color: 'var(--color-primary)', display: 'flex', padding: '2px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                  >
                                    <Plus size={13} />
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
                                    textAlign: 'center',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '2px 0'
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
                                  marginTop: '15px',
                                  fontWeight: 700
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
              );
            })}
          </div>

          {/* Floating Mobile Categories Menu Pill */}
          <div
            style={{
              position: 'fixed',
              bottom: itemCount > 0 ? '78px' : '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 40
            }}
          >
            <button
              onClick={() => setIsCategoryDrawerOpen(true)}
              style={{
                backgroundColor: '#1E1E24',
                color: '#FFFFFF',
                padding: '9px 18px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 800,
                boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <BookOpen size={14} color="var(--color-primary)" />
              <span>MENU • {selectedRestaurant.categories.reduce((s, c) => s + (isVegOnly ? c.items.filter(i => i.dietary === 'veg').length : c.items.length), 0)} DISHES</span>
            </button>
          </div>
    </>
  ) : (
        /* Reviews & Photos Tab View */
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: itemCount > 0 ? '80px' : '20px' }} className="no-scrollbar">
          {/* Overall Rating Score Card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-muted)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '30px', fontWeight: 900, lineHeight: 1 }}>{selectedRestaurant.rating}</span>
                <div>
                  <div style={{ display: 'flex', gap: '2px', color: '#F39C12' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill="#F39C12" />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Based on {selectedRestaurant.ratingCount.toLocaleString()} verified orders
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-veg)', fontWeight: 700, marginTop: '6px' }}>
                ✓ 96% of foodies recommended this restaurant
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  backgroundColor: 'var(--color-veg-bg)',
                  color: 'var(--color-veg)',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                TOP RATED
              </span>
            </div>
          </div>

          {/* Customer Food Photos Strip */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Camera size={15} color="var(--color-primary)" />
              <h4 style={{ fontSize: '14px', fontWeight: 800 }}>Customer Food Photos (48)</h4>
            </div>

            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
              {[
                'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=300&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&auto=format&fit=crop&q=80'
              ].map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '100px',
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <img src={img} alt={`Food photo ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Verified Customer Reviews Feed */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>
              Recent Reviews from Verified Foodies
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                {
                  name: 'Ananya Roy',
                  rating: 5,
                  time: 'Yesterday',
                  dish: 'Dum Gosht Biryani',
                  comment: 'Heavenly aroma! The meat literally melted in my mouth, authentic dum style spices. Packaging was neat and spill-proof.'
                },
                {
                  name: 'Karthik Nair',
                  rating: 5,
                  time: '2 days ago',
                  dish: 'Murgh Makhani Biryani',
                  comment: 'Fastest delivery in Indiranagar! The rider Vikram was polite and reached in 21 minutes. Food was steaming hot.'
                },
                {
                  name: 'Sneha Patel',
                  rating: 4,
                  time: 'Last week',
                  dish: 'Paneer Biryani & Gulab Jamun',
                  comment: 'Very tasty paneer cubes, good portion size for two people. Loved the warm Gulab Jamun compliment!'
                }
              ].map((rev, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800 }}>{rev.name}</span>
                        <CheckCircle2 size={12} color="var(--color-veg)" />
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{rev.time}</span>
                    </div>

                    <div
                      style={{
                        backgroundColor: '#27AE60',
                        color: '#FFFFFF',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <span>{rev.rating}</span>
                      <Star size={10} fill="#FFFFFF" />
                    </div>
                  </div>

                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--color-primary)',
                      backgroundColor: 'var(--color-primary-light)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '6px'
                    }}
                  >
                    Ordered: {rev.dish}
                  </span>

                  <p style={{ fontSize: '12px', color: 'var(--color-text-main)', lineHeight: 1.4, margin: 0 }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
