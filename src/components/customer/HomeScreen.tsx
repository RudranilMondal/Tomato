import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { CUISINES } from '../../data/mockData';
import { Restaurant } from '../../types';
import {
  MapPin,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  Sparkles,
  ShoppingBag,
  Heart
} from 'lucide-react';

interface HomeScreenProps {
  onOpenLocation: () => void;
  onOpenSearch: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenLocation, onOpenSearch }) => {
  const {
    restaurants,
    setSelectedRestaurant,
    setCustomerScreen,
    selectedAddress,
    cartTotal,
    itemCount,
    user
  } = useTomattto();

  // Filters
  const [activeFilter, setActiveFilter] = useState<'all' | 'veg' | 'rating' | 'fast' | 'offers'>('all');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const banners = [
    {
      id: 1,
      tag: 'MEGA DEAL',
      title: '50% OFF up to ₹100',
      subtitle: 'Use code TOMATTTO50 on your favorite meals',
      bg: 'linear-gradient(135deg, #FF4B3A 0%, #FF8A65 100%)',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      tag: 'TOMATTTO GOLD',
      title: 'Free Delivery Always',
      subtitle: 'Zero delivery fee on all orders above ₹249',
      bg: 'linear-gradient(135deg, #1E1E24 0%, #3A3A48 100%)',
      img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      tag: 'GOURMET FEST',
      title: 'Artisanal Dining Deals',
      subtitle: 'Hand-tossed Neapolitan pizzas & handcrafted bakes',
      bg: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)',
      img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80'
    }
  ];

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((r) => {
    if (selectedCuisine && !r.cuisines.some((c) => c.toLowerCase() === selectedCuisine.toLowerCase())) {
      return false;
    }
    if (activeFilter === 'veg' && !r.isPureVeg) return false;
    if (activeFilter === 'rating' && r.rating < 4.5) return false;
    if (activeFilter === 'fast' && r.prepTimeMinutes > 22) return false;
    if (activeFilter === 'offers' && !r.offerText) return false;
    return true;
  });

  const handleSelectRestaurant = (r: Restaurant) => {
    setSelectedRestaurant(r);
    setCustomerScreen('restaurant');
  };

  return (
    <div style={{ flex: 1, paddingBottom: itemCount > 0 ? '70px' : '20px' }}>
      {/* Top Sticky Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'var(--color-surface)',
          padding: '12px 16px 8px',
          borderBottom: '1px solid var(--color-border-subtle)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Location Picker */}
          <div
            onClick={onOpenLocation}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', maxWidth: '78%' }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <MapPin size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>Home</span>
                <ChevronDown size={14} color="var(--color-text-muted)" />
              </div>
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {selectedAddress}
              </p>
            </div>
          </div>

          {/* User Avatar */}
          <div
            onClick={() => setCustomerScreen('profile')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '2px solid var(--color-border)'
            }}
          >
            <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        {/* Search Bar Trigger */}
        <div
          onClick={onOpenSearch}
          style={{
            marginTop: '12px',
            backgroundColor: 'var(--color-surface-muted)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            border: '1px solid var(--color-border-subtle)'
          }}
        >
          <Search size={18} color="var(--color-text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', flex: 1 }}>
            Search "biryani", "pizza", "burgers"...
          </span>
          <div
            style={{
              width: '1px',
              height: '16px',
              backgroundColor: 'var(--color-border)'
            }}
          />
          <SlidersHorizontal size={15} color="var(--color-primary)" />
        </div>
      </div>

      {/* Main Scrollable Body */}
      <div style={{ padding: '14px 16px' }}>
        {/* Promotional Carousel */}
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <div
            style={{
              background: banners[activeBannerIndex].bg,
              borderRadius: 'var(--radius-lg)',
              padding: '16px 18px',
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              minHeight: '125px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                backgroundColor: 'rgba(255,255,255,0.25)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-block',
                width: 'fit-content',
                letterSpacing: '0.06em',
                marginBottom: '6px'
              }}
            >
              {banners[activeBannerIndex].tag}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.2 }}>
              {banners[activeBannerIndex].title}
            </h3>
            <p style={{ fontSize: '11px', opacity: 0.9, marginTop: '3px', maxWidth: '65%' }}>
              {banners[activeBannerIndex].subtitle}
            </p>

            <img
              src={banners[activeBannerIndex].img}
              alt="Promo"
              style={{
                position: 'absolute',
                right: '-10px',
                bottom: '-10px',
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255,255,255,0.4)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }}
            />
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
            {banners.map((_, i) => (
              <div
                key={i}
                onClick={() => setActiveBannerIndex(i)}
                style={{
                  width: i === activeBannerIndex ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: i === activeBannerIndex ? 'var(--color-primary)' : 'var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Cuisine Pills Horizontal Rail */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Explore Cuisines</h3>
            {selectedCuisine && (
              <button
                onClick={() => setSelectedCuisine(null)}
                style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}
              >
                Clear
              </button>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '4px'
            }}
            className="no-scrollbar"
          >
            {CUISINES.map((cuisine) => {
              const isSelected = selectedCuisine === cuisine.name;
              return (
                <div
                  key={cuisine.id}
                  onClick={() => setSelectedCuisine(isSelected ? null : cuisine.name)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                      padding: '2px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img
                      src={cuisine.iconUrl}
                      alt={cuisine.name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)'
                    }}
                  >
                    {cuisine.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            marginBottom: '18px',
            paddingBottom: '2px'
          }}
          className="no-scrollbar"
        >
          {[
            { id: 'all', label: 'All' },
            { id: 'veg', label: '🌱 Pure Veg' },
            { id: 'rating', label: '⭐ Rating 4.5+' },
            { id: 'fast', label: '⚡ Under 25 mins' },
            { id: 'offers', label: '🏷️ Deals & Offers' }
          ].map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-main)',
                  border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  boxShadow: isActive ? '0 2px 8px var(--color-primary-glow)' : 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Restaurant Cards Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
              {selectedCuisine ? `${selectedCuisine} Spots` : 'Top Restaurants Near You'}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {filteredRestaurants.length} places
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => handleSelectRestaurant(restaurant)}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {/* Cover Image with Badges */}
                <div style={{ position: 'relative', height: '160px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={restaurant.coverImage}
                    alt={restaurant.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)'
                    }}
                  />

                  {/* Rating Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: '#27AE60',
                        color: '#FFFFFF',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <span>{restaurant.rating}</span>
                      <Star size={10} fill="#FFFFFF" />
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#1E1E24' }}>
                      ({(restaurant.ratingCount / 1000).toFixed(1)}k+)
                    </span>
                  </div>

                  {/* Prep time & Distance Pill */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '12px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    <Clock size={11} />
                    <span>{restaurant.prepTimeMinutes} mins • {restaurant.distanceKm} km</span>
                  </div>

                  {/* Wishlist Heart */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.4)',
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

                {/* Restaurant Info */}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{restaurant.name}</h4>
                      {restaurant.isPureVeg && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            backgroundColor: 'var(--color-veg-bg)',
                            color: 'var(--color-veg)',
                            padding: '2px 5px',
                            borderRadius: '4px'
                          }}
                        >
                          PURE VEG
                        </span>
                      )}
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      marginTop: '3px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {restaurant.cuisines.join(' • ')} • ₹{restaurant.costForTwo} for two
                  </p>

                  {/* Offer Banner Tag */}
                  {restaurant.offerText && (
                    <div
                      style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px dashed var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--color-primary)'
                      }}
                    >
                      <Sparkles size={12} />
                      <span>{restaurant.offerText}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Cart Bar (if items in cart) */}
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
              <div style={{ fontSize: '10px', opacity: 0.9 }}>Extra charges may apply</div>
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
