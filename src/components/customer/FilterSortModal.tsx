import React, { useState, useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Star,
  Clock,
  Sparkles,
  Check,
  Utensils,
  Tag,
  DollarSign,
  Heart,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Restaurant } from '../../types';

export interface FilterOptions {
  sortBy: 'recommended' | 'rating' | 'time' | 'cost_asc' | 'cost_desc' | 'popularity' | 'discount';
  maxTime?: number; // 20, 30, 45 mins
  costBracket?: 'budget' | 'mid' | 'premium' | 'all';
  pureVegOnly: boolean;
  offersOnly: boolean;
  minRating?: number; // 3.5, 4.0, 4.2, 4.5, 4.7
  cuisines: string[]; // multi-select
  dietary: string[]; // multi-select: 'veg', 'non_veg', 'vegan', 'high_protein', 'jain'
  offerTypes: string[]; // 'flat50', 'flat20', 'freeDelivery', 'bogo'
  onlyFavorites: boolean;
  openOnly: boolean;
  hasBestsellers: boolean;
}

export const DEFAULT_FILTERS: FilterOptions = {
  sortBy: 'recommended',
  pureVegOnly: false,
  offersOnly: false,
  costBracket: 'all',
  cuisines: [],
  dietary: [],
  offerTypes: [],
  onlyFavorites: false,
  openOnly: false,
  hasBestsellers: false
};

export const countActiveFilters = (f: FilterOptions): number => {
  let count = 0;
  if (f.sortBy !== 'recommended') count++;
  if (f.pureVegOnly) count++;
  if (f.offersOnly) count++;
  if (f.costBracket && f.costBracket !== 'all') count++;
  if (f.maxTime) count++;
  if (f.minRating) count++;
  if (f.cuisines?.length) count += f.cuisines.length;
  if (f.dietary?.length) count += f.dietary.length;
  if (f.offerTypes?.length) count += f.offerTypes.length;
  if (f.onlyFavorites) count++;
  if (f.openOnly) count++;
  if (f.hasBestsellers) count++;
  return count;
};

interface FilterSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
  onReset: () => void;
  restaurants: Restaurant[];
  favorites?: string[];
}

export const FilterSortModal: React.FC<FilterSortModalProps> = ({
  isOpen,
  onClose,
  currentFilters,
  onApply,
  onReset,
  restaurants,
  favorites = []
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [activeTab, setActiveTab] = useState<
    'sort' | 'cuisines' | 'dietary' | 'time' | 'price' | 'rating' | 'offers' | 'features'
  >('sort');
  const [mouseDownOnBackdrop, setMouseDownOnBackdrop] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  // Safe backdrop close
  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setMouseDownOnBackdrop(true);
    else setMouseDownOnBackdrop(false);
  };
  const handleBackdropMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseDownOnBackdrop && e.target === e.currentTarget) onClose();
    setMouseDownOnBackdrop(false);
  };

  // Toggle multi-select items in arrays
  const toggleArrayItem = (key: 'cuisines' | 'dietary' | 'offerTypes', item: string) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
      return { ...prev, [key]: updated };
    });
  };

  // Live matching restaurant count calculator
  const matchingCount = restaurants.filter((r) => {
    if (filters.cuisines.length > 0 && !filters.cuisines.some((c) => r.cuisines.some((rc) => rc.toLowerCase() === c.toLowerCase()))) {
      return false;
    }
    if (filters.pureVegOnly && !r.isPureVeg) return false;
    if (filters.dietary.includes('veg') && !r.isPureVeg && !r.categories.some((cat) => cat.items.some((i) => i.dietary === 'veg'))) {
      return false;
    }
    if (filters.dietary.includes('non_veg') && r.isPureVeg) return false;
    if (filters.minRating && r.rating < filters.minRating) return false;
    if (filters.maxTime && r.prepTimeMinutes > filters.maxTime) return false;
    if (filters.offersOnly && !r.offerText) return false;
    if (filters.offerTypes.length > 0) {
      const matchesOffer = filters.offerTypes.some((type) => {
        if (!r.offerText) return false;
        if (type === 'flat50') return r.offerText.includes('50%');
        if (type === 'flat20') return r.offerText.includes('20%');
        if (type === 'freeDelivery') return r.offerText.toLowerCase().includes('free');
        if (type === 'bogo') return r.offerText.toLowerCase().includes('buy 1 get 1');
        return true;
      });
      if (!matchesOffer) return false;
    }
    if (filters.costBracket === 'budget' && r.costForTwo > 350) return false;
    if (filters.costBracket === 'mid' && (r.costForTwo < 350 || r.costForTwo > 650)) return false;
    if (filters.costBracket === 'premium' && r.costForTwo < 650) return false;
    if (filters.onlyFavorites && !favorites.includes(r.id)) return false;
    if (filters.openOnly && !r.isOpen) return false;
    if (filters.hasBestsellers && !r.categories.some((c) => c.items.some((i) => i.isBestseller))) return false;
    return true;
  }).length;

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    onReset();
    onClose();
  };

  const TABS = [
    { id: 'sort', label: 'Sort By', count: filters.sortBy !== 'recommended' ? 1 : 0 },
    { id: 'cuisines', label: 'Cuisines', count: filters.cuisines.length },
    { id: 'dietary', label: 'Dietary', count: (filters.pureVegOnly ? 1 : 0) + filters.dietary.length },
    { id: 'time', label: 'Delivery Time', count: filters.maxTime ? 1 : 0 },
    { id: 'price', label: 'Price & Cost', count: filters.costBracket && filters.costBracket !== 'all' ? 1 : 0 },
    { id: 'rating', label: 'Rating', count: filters.minRating ? 1 : 0 },
    { id: 'offers', label: 'Offers & Deals', count: (filters.offersOnly ? 1 : 0) + filters.offerTypes.length },
    { id: 'features', label: 'Restaurant Type', count: (filters.onlyFavorites ? 1 : 0) + (filters.openOnly ? 1 : 0) + (filters.hasBestsellers ? 1 : 0) }
  ];

  const CUISINE_OPTIONS = [
    'Biryani',
    'Pizza',
    'Burgers',
    'North Indian',
    'South Indian',
    'Chinese',
    'Desserts',
    'Healthy',
    'Mughlai',
    'Italian',
    'American',
    'Coffee & Shakes',
    'Salads',
    'Bakery',
    'Tandoor'
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 2600,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '84vh',
          backgroundColor: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.25s ease'
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>Filters</h3>
              {countActiveFilters(filters) > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {countActiveFilters(filters)}
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
              Find exactly what you're craving
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleReset}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px'
              }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface-muted)',
                display: 'flex',
                color: 'var(--color-text-muted)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Two-Pane Body: Left Category Nav + Right Options Panel */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Navigation Tabs */}
          <div
            style={{
              width: '135px',
              backgroundColor: 'var(--color-surface-muted)',
              borderRight: '1px solid var(--color-border)',
              overflowY: 'auto'
            }}
            className="no-scrollbar"
          >
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '14px 12px',
                    fontSize: '12px',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                    backgroundColor: isSelected ? 'var(--color-surface)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ lineHeight: 1.2 }}>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        flexShrink: 0
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Options Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }} className="no-scrollbar">
            {/* 1. SORT BY */}
            {activeTab === 'sort' && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px', color: 'var(--color-text-main)' }}>
                  Sort Results By
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'recommended', label: '⭐ Recommended (Default)' },
                    { id: 'rating', label: '🌟 Rating: High to Low' },
                    { id: 'time', label: '⚡ Delivery Time: Low to High' },
                    { id: 'cost_asc', label: '₹ Cost: Low to High' },
                    { id: 'cost_desc', label: '₹₹ Cost: High to Low' },
                    { id: 'popularity', label: '🔥 Most Popular' },
                    { id: 'discount', label: '🏷️ Discount: High to Low' }
                  ].map((opt) => {
                    const isSelected = filters.sortBy === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setFilters({ ...filters, sortBy: opt.id as any })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'transparent'}`,
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                          fontSize: '13px',
                          fontWeight: isSelected ? 800 : 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check size={16} color="var(--color-primary)" strokeWidth={3} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. CUISINES (MULTI-SELECT) */}
            {activeTab === 'cuisines' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, margin: 0 }}>Select Cuisines</h4>
                  {filters.cuisines.length > 0 && (
                    <button
                      onClick={() => setFilters({ ...filters, cuisines: [] })}
                      style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Clear ({filters.cuisines.length})
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CUISINE_OPTIONS.map((c) => {
                    const isSelected = filters.cuisines.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleArrayItem('cuisines', c)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '12px',
                          fontWeight: isSelected ? 800 : 600,
                          backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                          color: isSelected ? '#FFFFFF' : 'var(--color-text-main)',
                          border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: isSelected ? '0 2px 8px var(--color-primary-glow)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. DIETARY PREFERENCES */}
            {activeTab === 'dietary' && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Dietary Options</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Pure Veg Switch */}
                  <div
                    onClick={() => setFilters({ ...filters, pureVegOnly: !filters.pureVegOnly })}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: filters.pureVegOnly ? 'var(--color-veg-bg)' : 'var(--color-surface-muted)',
                      border: `1.5px solid ${filters.pureVegOnly ? 'var(--color-veg)' : 'var(--color-border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                        🌱 Pure Veg Restaurants Only
                      </span>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                        Shows only 100% vegetarian outlets
                      </p>
                    </div>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: `2px solid ${filters.pureVegOnly ? 'var(--color-veg)' : 'var(--color-border)'}`,
                        backgroundColor: filters.pureVegOnly ? 'var(--color-veg)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {filters.pureVegOnly && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                  </div>

                  {[
                    { id: 'veg', label: '🥗 Vegetarian Dishes Included' },
                    { id: 'non_veg', label: '🍗 Non-Vegetarian Available' },
                    { id: 'vegan', label: '🥑 Vegan & Plant-Based' },
                    { id: 'high_protein', label: '💪 High Protein & Fitness Bowls' }
                  ].map((item) => {
                    const isSelected = filters.dietary.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleArrayItem('dietary', item.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                          {item.label}
                        </span>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. DELIVERY TIME */}
            {activeTab === 'time' && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Maximum Delivery Time</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Any Delivery Time', value: undefined },
                    { label: '⚡ Super Fast (Under 20 mins)', value: 20 },
                    { label: '⚡ Under 25 mins', value: 25 },
                    { label: '⚡ Under 30 mins', value: 30 },
                    { label: '⚡ Under 45 mins', value: 45 }
                  ].map((t, idx) => {
                    const isSelected = filters.maxTime === t.value;
                    return (
                      <div
                        key={idx}
                        onClick={() => setFilters({ ...filters, maxTime: t.value })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'transparent'}`,
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                          fontSize: '13px',
                          fontWeight: isSelected ? 800 : 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <span>{t.label}</span>
                        {isSelected && <Check size={16} strokeWidth={3} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. PRICE & COST FOR TWO */}
            {activeTab === 'price' && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Average Cost For Two</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'all', title: 'Any Cost', subtitle: 'Show all price ranges' },
                    { id: 'budget', title: '₹ Budget (Under ₹350)', subtitle: 'Great everyday meals & quick bites' },
                    { id: 'mid', title: '₹₹ Mid-Range (₹350 - ₹650)', subtitle: 'Popular dining & hearty combos' },
                    { id: 'premium', title: '₹₹₹ Premium (₹650+)', subtitle: 'Gourmet, woodfired & artisanal cuisine' }
                  ].map((c) => {
                    const isSelected = (filters.costBracket || 'all') === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setFilters({ ...filters, costBracket: c.id as any })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'transparent'}`,
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                            {c.title}
                          </span>
                          {isSelected && <Check size={16} color="var(--color-primary)" strokeWidth={3} />}
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                          {c.subtitle}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. RATING */}
            {activeTab === 'rating' && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Minimum Customer Rating</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Any Rating', value: undefined },
                    { label: '⭐ 4.5+ (Foodie Fan Favorites)', value: 4.5 },
                    { label: '⭐ 4.2+ (Very Good)', value: 4.2 },
                    { label: '⭐ 4.0+ (Popular & Reliable)', value: 4.0 },
                    { label: '⭐ 3.5+ (Standard)', value: 3.5 }
                  ].map((r, idx) => {
                    const isSelected = filters.minRating === r.value;
                    return (
                      <div
                        key={idx}
                        onClick={() => setFilters({ ...filters, minRating: r.value })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'transparent'}`,
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)',
                          fontSize: '13px',
                          fontWeight: isSelected ? 800 : 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <span>{r.label}</span>
                        {isSelected && <Check size={16} strokeWidth={3} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. OFFERS & DISCOUNTS */}
            {activeTab === 'offers' && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Offers & Promos</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* General Offers Toggle */}
                  <div
                    onClick={() => setFilters({ ...filters, offersOnly: !filters.offersOnly })}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: filters.offersOnly ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                      border: `1.5px solid ${filters.offersOnly ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                        🏷️ All Active Deals & Offers
                      </span>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                        Shows places with coupons, discounts or perks
                      </p>
                    </div>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: `2px solid ${filters.offersOnly ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        backgroundColor: filters.offersOnly ? 'var(--color-primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {filters.offersOnly && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                  </div>

                  {[
                    { id: 'flat50', label: '🔥 Flat 50% OFF (Mega Deals)' },
                    { id: 'flat20', label: '✨ Flat 20% OFF or more' },
                    { id: 'freeDelivery', label: '🛵 Free Delivery Offers' },
                    { id: 'bogo', label: '🎁 Buy 1 Get 1 Free Deals' }
                  ].map((offer) => {
                    const isSelected = filters.offerTypes.includes(offer.id);
                    return (
                      <div
                        key={offer.id}
                        onClick={() => toggleArrayItem('offerTypes', offer.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                          {offer.label}
                        </span>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. RESTAURANT FEATURES */}
            {activeTab === 'features' && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Restaurant Features</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    {
                      key: 'onlyFavorites' as const,
                      title: '❤️ My Favorite Places',
                      desc: `Shows only your saved bookmarked spots (${favorites.length})`
                    },
                    {
                      key: 'hasBestsellers' as const,
                      title: '🔥 Has Bestseller Dishes',
                      desc: 'Places featuring crowd-favorite iconic items'
                    },
                    {
                      key: 'openOnly' as const,
                      title: '🟢 Currently Open Only',
                      desc: 'Accepting instant orders right now'
                    }
                  ].map((feat) => {
                    const isSelected = !!filters[feat.key];
                    return (
                      <div
                        key={feat.key}
                        onClick={() => setFilters({ ...filters, [feat.key]: !isSelected })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                            {feat.title}
                          </span>
                          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                            {feat.desc}
                          </p>
                        </div>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer: Clear All + Apply Results with Dynamic Count */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-muted)',
              color: 'var(--color-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              border: '1px solid var(--color-border)',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>

          <button
            type="button"
            onClick={handleApply}
            style={{
              flex: 1,
              padding: '13px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <span>Show {matchingCount} {matchingCount === 1 ? 'Restaurant' : 'Restaurants'}</span>
            <CheckCircle2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
