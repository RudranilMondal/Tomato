import React, { useState, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { CUISINES } from '../../data/mockData';
import { Restaurant } from '../../types';
import { NotificationsModal } from './NotificationsModal';
import { CravingRouletteModal } from './CravingRouletteModal';
import { FilterSortModal, FilterOptions, DEFAULT_FILTERS, countActiveFilters } from './FilterSortModal';
import {
  MapPin,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  Sparkles,
  ShoppingBag,
  Heart,
  Bell,
  Flame,
  X,
  RotateCcw
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
    user,
    unreadNotificationCount,
    favorites,
    toggleFavorite,
    isFavorite,
    isLoggedIn
  } = useTomattto();

  // Filters state
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(DEFAULT_FILTERS);

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

  // Fix #2 — Auto-advance promotional banner every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Comprehensive multi-criteria filtering engine
  const filteredRestaurants = restaurants
    .filter((r) => {
      // 1. Horizontal Cuisine Rail
      if (selectedCuisine && !r.cuisines.some((c) => c.toLowerCase() === selectedCuisine.toLowerCase())) {
        return false;
      }

      // 2. Multi-Select Cuisines from Modal
      if (
        filterOptions.cuisines.length > 0 &&
        !filterOptions.cuisines.some((c) => r.cuisines.some((rc) => rc.toLowerCase() === c.toLowerCase()))
      ) {
        return false;
      }

      // 3. Dietary Preferences
      if (filterOptions.pureVegOnly && !r.isPureVeg) return false;
      if (
        filterOptions.dietary.includes('veg') &&
        !r.isPureVeg &&
        !r.categories.some((cat) => cat.items.some((i) => i.dietary === 'veg'))
      ) {
        return false;
      }
      if (filterOptions.dietary.includes('non_veg') && r.isPureVeg) {
        return false;
      }

      // 4. Rating
      if (filterOptions.minRating && r.rating < filterOptions.minRating) return false;

      // 5. Delivery Time
      if (filterOptions.maxTime && r.prepTimeMinutes > filterOptions.maxTime) return false;

      // 6. Offers & Discounts
      if (filterOptions.offersOnly && !r.offerText) return false;
      if (filterOptions.offerTypes.length > 0) {
        const matchesOffer = filterOptions.offerTypes.some((type) => {
          if (!r.offerText) return false;
          if (type === 'flat50') return r.offerText.includes('50%');
          if (type === 'flat20') return r.offerText.includes('20%');
          if (type === 'freeDelivery') return r.offerText.toLowerCase().includes('free');
          if (type === 'bogo') return r.offerText.toLowerCase().includes('buy 1 get 1');
          return true;
        });
        if (!matchesOffer) return false;
      }

      // 7. Price Brackets
      if (filterOptions.costBracket === 'budget' && r.costForTwo > 350) return false;
      if (filterOptions.costBracket === 'mid' && (r.costForTwo < 350 || r.costForTwo > 650)) return false;
      if (filterOptions.costBracket === 'premium' && r.costForTwo < 650) return false;

      // 8. Restaurant Features
      if (filterOptions.onlyFavorites && !isFavorite(r.id)) return false;
      if (filterOptions.openOnly && !r.isOpen) return false;
      if (filterOptions.hasBestsellers && !r.categories.some((c) => c.items.some((i) => i.isBestseller))) return false;

      return true;
    })
    .sort((a, b) => {
      if (filterOptions.sortBy === 'rating') return b.rating - a.rating;
      if (filterOptions.sortBy === 'time') return a.prepTimeMinutes - b.prepTimeMinutes;
      if (filterOptions.sortBy === 'cost_asc') return a.costForTwo - b.costForTwo;
      if (filterOptions.sortBy === 'cost_desc') return b.costForTwo - a.costForTwo;
      if (filterOptions.sortBy === 'popularity') return b.ratingCount - a.ratingCount;
      if (filterOptions.sortBy === 'discount') {
        const discountA = a.offerText?.includes('50%') ? 50 : a.offerText?.includes('20%') ? 20 : 0;
        const discountB = b.offerText?.includes('50%') ? 50 : b.offerText?.includes('20%') ? 20 : 0;
        return discountB - discountA;
      }
      return 0; // recommended default
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

          {/* Right Header Actions: Notification Bell + Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsNotificationsOpen(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotificationCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    border: '1.5px solid var(--color-surface)'
                  }}
                />
              )}
            </button>

            {/* User Avatar or Log In button */}
            {isLoggedIn ? (
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
                title="View Profile & Settings"
              >
                <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <button
                onClick={() => setCustomerScreen('auth')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                Log In
              </button>
            )}
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFilterModalOpen(true);
            }}
            style={{
              background: countActiveFilters(filterOptions) > 0 ? 'var(--color-primary-light)' : 'none',
              border: countActiveFilters(filterOptions) > 0 ? '1px solid var(--color-primary)' : 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Open Filters & Sort"
          >
            <SlidersHorizontal size={16} />
            {countActiveFilters(filterOptions) > 0 && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '1px 5px',
                  lineHeight: 1
                }}
              >
                {countActiveFilters(filterOptions)}
              </span>
            )}
          </button>
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
              justifyContent: 'center',
              animation: 'banner-fade-in 0.35s ease'
            }}
            key={activeBannerIndex}
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

        {/* Surprise Craving Roulette Strip - Sleek, Uncluttered & Original Interactive Widget */}
        <div
          className="craving-card"
          onClick={() => setIsRouletteOpen(true)}
          style={{
            background: 'radial-gradient(ellipse at 88% 50%, rgba(255, 75, 58, 0.18) 0%, rgba(255, 180, 0, 0.08) 45%, transparent 75%), #141116',
            borderRadius: '20px',
            padding: '16px 20px',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'rgba(255, 75, 58, 0.45)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 75, 58, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
          }}
        >
          {/* Subtle Ambient Vignette */}
          <div
            style={{
              position: 'absolute',
              top: '-35px',
              left: '-25px',
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 75, 58, 0.22) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          {/* Left Text Hierarchy - Clean, Spacious, Zero Clutter */}
          <div style={{ minWidth: 0, flex: 1, zIndex: 1 }}>
            {/* Elegant Micro-Overline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#FFB800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={11} color="#FFB800" />
                <span>Craving Roulette</span>
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.25)' }}>•</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#2ECC71',
                  letterSpacing: '0.03em'
                }}
              >
                Win up to 30% off
              </span>
            </div>

            {/* Confident Headline */}
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Can't decide what to eat?
            </h3>

            {/* Clear, Inviting Subtitle */}
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.65)',
                margin: '4px 0 0',
                lineHeight: 1.35,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Spin the wheel to pick your meal & unlock deals
            </p>
          </div>

          {/* Right Interactive Mini Roulette Wheel - Original & Playful */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0,
              zIndex: 1
            }}
          >
            <div style={{ position: 'relative', width: '62px', height: '62px', flexShrink: 0 }}>
              {/* Downward indicator golden triangle */}
              <div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: '7px solid #FFD700',
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
                  zIndex: 4
                }}
              />

              {/* Spinning Food Wheel Disc */}
              <div
                className="mini-wheel-disc"
                style={{
                  width: '62px',
                  height: '62px',
                  borderRadius: '50%',
                  background: 'conic-gradient(#FF4B3A 0deg 90deg, #F39C12 90deg 180deg, #2ECC71 180deg 270deg, #8E44AD 270deg 360deg)',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.4), inset 0 0 0 2px rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* 4 Real Mini Food Medallions */}
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format&fit=crop&q=80"
                  alt="Pizza"
                  style={{ position: 'absolute', top: '5px', width: '15px', height: '15px', borderRadius: '50%', objectFit: 'cover', border: '1.2px solid #FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                />
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80"
                  alt="Burger"
                  style={{ position: 'absolute', right: '5px', width: '15px', height: '15px', borderRadius: '50%', objectFit: 'cover', border: '1.2px solid #FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                />
                <img
                  src="https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&auto=format&fit=crop&q=80"
                  alt="Noodles"
                  style={{ position: 'absolute', bottom: '5px', width: '15px', height: '15px', borderRadius: '50%', objectFit: 'cover', border: '1.2px solid #FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                />
                <img
                  src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&auto=format&fit=crop&q=80"
                  alt="Biryani"
                  style={{ position: 'absolute', left: '5px', width: '15px', height: '15px', borderRadius: '50%', objectFit: 'cover', border: '1.2px solid #FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                />

                {/* Center Glowing "SPIN" Coin */}
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF2D6 100%)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '8px',
                    color: '#181116',
                    letterSpacing: '0.04em',
                    zIndex: 3,
                    border: '1.5px solid #FFD700'
                  }}
                >
                  SPIN
                </div>
              </div>
            </div>
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

        {/* Multi-Select Quick Filters Rail */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            marginBottom: countActiveFilters(filterOptions) > 0 ? '10px' : '18px',
            paddingBottom: '2px'
          }}
          className="no-scrollbar"
        >
          {/* Main Filter Modal Button Chip */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 800,
              backgroundColor: countActiveFilters(filterOptions) > 0 ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: countActiveFilters(filterOptions) > 0 ? 'var(--color-primary)' : 'var(--color-text-main)',
              border: `1.5px solid ${countActiveFilters(filterOptions) > 0 ? 'var(--color-primary)' : 'var(--color-border)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <SlidersHorizontal size={13} color="var(--color-primary)" />
            <span>Filters</span>
            {countActiveFilters(filterOptions) > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 800,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {countActiveFilters(filterOptions)}
              </span>
            )}
          </button>

          {/* Quick Filter Multi-Select Chips */}
          {[
            {
              id: 'all',
              label: 'All',
              isActive: countActiveFilters(filterOptions) === 0,
              onClick: () => setFilterOptions(DEFAULT_FILTERS)
            },
            {
              id: 'veg',
              label: '🌱 Pure Veg',
              isActive: filterOptions.pureVegOnly,
              onClick: () => setFilterOptions((prev) => ({ ...prev, pureVegOnly: !prev.pureVegOnly }))
            },
            {
              id: 'fast',
              label: '⚡ Under 30 mins',
              isActive: filterOptions.maxTime === 30,
              onClick: () => setFilterOptions((prev) => ({ ...prev, maxTime: prev.maxTime === 30 ? undefined : 30 }))
            },
            {
              id: 'rating',
              label: '⭐ Rating 4.5+',
              isActive: filterOptions.minRating === 4.5,
              onClick: () => setFilterOptions((prev) => ({ ...prev, minRating: prev.minRating === 4.5 ? undefined : 4.5 }))
            },
            {
              id: 'offers',
              label: '🏷️ Deals & Offers',
              isActive: filterOptions.offersOnly,
              onClick: () => setFilterOptions((prev) => ({ ...prev, offersOnly: !prev.offersOnly }))
            },
            {
              id: 'budget',
              label: '💰 Under ₹350',
              isActive: filterOptions.costBracket === 'budget',
              onClick: () =>
                setFilterOptions((prev) => ({
                  ...prev,
                  costBracket: prev.costBracket === 'budget' ? 'all' : 'budget'
                }))
            },
            {
              id: 'favorites',
              label: `❤️ Favorites (${favorites.length})`,
              isActive: filterOptions.onlyFavorites,
              onClick: () => setFilterOptions((prev) => ({ ...prev, onlyFavorites: !prev.onlyFavorites }))
            },
            {
              id: 'bestsellers',
              label: '🔥 Bestsellers',
              isActive: filterOptions.hasBestsellers,
              onClick: () => setFilterOptions((prev) => ({ ...prev, hasBestsellers: !prev.hasBestsellers }))
            }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={chip.onClick}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: chip.isActive ? 800 : 500,
                backgroundColor: chip.isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                color: chip.isActive ? '#FFFFFF' : 'var(--color-text-main)',
                border: chip.isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                boxShadow: chip.isActive ? '0 2px 8px var(--color-primary-glow)' : 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Active Removable Filters Row (when any filters active) */}
        {countActiveFilters(filterOptions) > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              marginBottom: '16px',
              paddingBottom: '2px'
            }}
            className="no-scrollbar"
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              Active:
            </span>

            {filterOptions.pureVegOnly && (
              <span
                onClick={() => setFilterOptions((prev) => ({ ...prev, pureVegOnly: false }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-veg-bg)',
                  color: 'var(--color-veg)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>Pure Veg</span>
                <X size={11} />
              </span>
            )}

            {filterOptions.minRating && (
              <span
                onClick={() => setFilterOptions((prev) => ({ ...prev, minRating: undefined }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>⭐ {filterOptions.minRating}+</span>
                <X size={11} />
              </span>
            )}

            {filterOptions.maxTime && (
              <span
                onClick={() => setFilterOptions((prev) => ({ ...prev, maxTime: undefined }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>⚡ &lt;{filterOptions.maxTime}m</span>
                <X size={11} />
              </span>
            )}

            {filterOptions.offersOnly && (
              <span
                onClick={() => setFilterOptions((prev) => ({ ...prev, offersOnly: false }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>Deals</span>
                <X size={11} />
              </span>
            )}

            {filterOptions.costBracket && filterOptions.costBracket !== 'all' && (
              <span
                onClick={() => setFilterOptions((prev) => ({ ...prev, costBracket: 'all' }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>{filterOptions.costBracket === 'budget' ? 'Under ₹350' : filterOptions.costBracket}</span>
                <X size={11} />
              </span>
            )}

            {filterOptions.onlyFavorites && (
              <span
                onClick={() => setFilterOptions((prev) => ({ ...prev, onlyFavorites: false }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>Favorites</span>
                <X size={11} />
              </span>
            )}

            {filterOptions.hasBestsellers && (
              <span
                onClick={() => setFilterOptions((prev) => ({ ...prev, hasBestsellers: false }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>Bestsellers</span>
                <X size={11} />
              </span>
            )}

            {filterOptions.cuisines.map((c) => (
              <span
                key={c}
                onClick={() =>
                  setFilterOptions((prev) => ({
                    ...prev,
                    cuisines: prev.cuisines.filter((item) => item !== c)
                  }))
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-surface-muted)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-main)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>{c}</span>
                <X size={11} />
              </span>
            ))}

            <button
              onClick={() => setFilterOptions(DEFAULT_FILTERS)}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                padding: '2px 6px',
                marginLeft: '4px'
              }}
            >
              Clear All
            </button>
          </div>
        )}

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
            {filteredRestaurants.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '40px 24px',
                  textAlign: 'center',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    margin: '0 auto 14px'
                  }}
                >
                  🍽️
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                  No restaurants match your filters
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px', maxWidth: '280px', margin: '6px auto 0', lineHeight: 1.4 }}>
                  Try removing or relaxing some of your filters to see more delicious food spots nearby.
                </p>
                <button
                  onClick={() => setFilterOptions(DEFAULT_FILTERS)}
                  style={{
                    marginTop: '18px',
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-glow)'
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              filteredRestaurants.map((restaurant) => (
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
                        toggleFavorite(restaurant.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '12px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isFavorite(restaurant.id) ? '#FFFFFF' : 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(4px)',
                        color: isFavorite(restaurant.id) ? 'var(--color-primary)' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isFavorite(restaurant.id) ? '0 4px 12px rgba(255, 75, 58, 0.4)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Heart
                        size={16}
                        fill={isFavorite(restaurant.id) ? 'var(--color-primary)' : 'none'}
                        color={isFavorite(restaurant.id) ? 'var(--color-primary)' : '#FFFFFF'}
                      />
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
              ))
            )}
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

      {/* Notifications Drawer Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Surprise Craving Roulette Modal */}
      <CravingRouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
      />

      {/* Comprehensive Filter and Sort Sheet */}
      <FilterSortModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        currentFilters={filterOptions}
        onApply={(opts) => setFilterOptions(opts)}
        onReset={() => setFilterOptions(DEFAULT_FILTERS)}
        restaurants={restaurants}
        favorites={favorites}
      />
    </div>
  );
};
