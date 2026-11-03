import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { Restaurant, MenuItem } from '../../types';
import { Search, ArrowLeft, X, Star, Clock, Sparkles } from 'lucide-react';

export const SearchScreen: React.FC = () => {
  const {
    restaurants,
    setSelectedRestaurant,
    setCustomizingItem,
    setCustomerScreen,
    addToCart
  } = useTomattto();

  const [query, setQuery] = useState('');
  const [filterVegOnly, setFilterVegOnly] = useState(false);

  // Quick suggestions
  const SUGGESTIONS = ['Biryani', 'Pizza', 'Burgers', 'Butter Chicken', 'Dosa', 'Cheesecake', 'Noodles'];

  // Search logic across restaurants and their dishes
  const matchingRestaurants: Restaurant[] = query.trim()
    ? restaurants.filter((r) => {
        const matchesName = r.name.toLowerCase().includes(query.toLowerCase());
        const matchesCuisine = r.cuisines.some((c) => c.toLowerCase().includes(query.toLowerCase()));
        const matchesDish = r.categories.some((cat) =>
          cat.items.some((item) => item.name.toLowerCase().includes(query.toLowerCase()))
        );
        if (filterVegOnly && !r.isPureVeg) return false;
        return matchesName || matchesCuisine || matchesDish;
      })
    : [];

  // Matching individual dishes
  const matchingDishes: { restaurant: Restaurant; item: MenuItem }[] = [];
  if (query.trim()) {
    restaurants.forEach((r) => {
      r.categories.forEach((cat) => {
        cat.items.forEach((item) => {
          if (item.name.toLowerCase().includes(query.toLowerCase())) {
            if (!filterVegOnly || item.dietary === 'veg') {
              matchingDishes.push({ restaurant: r, item });
            }
          }
        });
      });
    });
  }

  const handleOpenRestaurant = (r: Restaurant) => {
    setSelectedRestaurant(r);
    setCustomerScreen('restaurant');
  };

  const handleAddDish = (r: Restaurant, item: MenuItem) => {
    setSelectedRestaurant(r);
    if ((item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0)) {
      setCustomizingItem(item);
    } else {
      addToCart(item);
    }
  };

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Search Input Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <button
          onClick={() => setCustomerScreen('home')}
          style={{
            padding: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-main)'
          }}
        >
          <ArrowLeft size={18} />
        </button>

        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--color-surface-muted)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Search size={16} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search for restaurants, dishes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              fontSize: '13px',
              color: 'var(--color-text-main)'
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                padding: '2px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
                display: 'flex'
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <button
          onClick={() => setFilterVegOnly(!filterVegOnly)}
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: filterVegOnly ? 700 : 500,
            backgroundColor: filterVegOnly ? 'var(--color-veg-bg)' : 'var(--color-surface-muted)',
            color: filterVegOnly ? 'var(--color-veg)' : 'var(--color-text-main)',
            border: filterVegOnly ? '1.5px solid var(--color-veg)' : '1px solid var(--color-border)'
          }}
        >
          🌱 Pure Veg Only
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }} className="no-scrollbar">
        {!query.trim() ? (
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
              Popular Searches
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-surface-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-main)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={12} color="var(--color-primary)" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Matching Dishes */}
            {matchingDishes.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>
                  Dishes Matching "{query}" ({matchingDishes.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {matchingDishes.slice(0, 4).map(({ restaurant, item }) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface-muted)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div
                        onClick={() => handleOpenRestaurant(restaurant)}
                        style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, cursor: 'pointer' }}
                      >
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            by {restaurant.name} • ₹{item.discountPrice || item.price}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddDish(restaurant, item)}
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1.5px solid var(--color-primary)',
                          color: 'var(--color-primary)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ADD
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Restaurants */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px' }}>
                Restaurants Matching "{query}" ({matchingRestaurants.length})
              </h4>
              {matchingRestaurants.length === 0 && matchingDishes.length === 0 ? (
                /* Fix #4 — Rich empty state with illustration + CTA */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 24px',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '2px dashed var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '38px',
                      marginBottom: '20px'
                    }}
                  >
                    😕
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    No results for "{query}"
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px', maxWidth: '240px', lineHeight: 1.5 }}>
                    We couldn't find any restaurants or dishes matching your search.
                  </p>
                  <button
                    onClick={() => setQuery('')}
                    style={{
                      marginTop: '20px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      padding: '10px 24px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '13px',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px var(--color-primary-glow)'
                    }}
                  >
                    Clear Search
                  </button>
                  <div style={{ marginTop: '24px', width: '100%' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Try instead
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                      {['Biryani', 'Pizza', 'Burgers', 'Dosa'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setQuery(tag)}
                          style={{
                            padding: '7px 14px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-surface-muted)',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--color-text-main)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {matchingRestaurants.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleOpenRestaurant(r)}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        gap: '12px',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={r.coverImage}
                          alt={r.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{r.name}</h4>
                          <span
                            style={{
                              backgroundColor: '#27AE60',
                              color: '#FFFFFF',
                              padding: '2px 5px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            <span>{r.rating}</span>
                            <Star size={9} fill="#FFFFFF" />
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {r.cuisines.join(' • ')}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={11} />
                            <span>{r.prepTimeMinutes} mins</span>
                          </span>
                          <span>•</span>
                          <span>₹{r.costForTwo} for two</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
