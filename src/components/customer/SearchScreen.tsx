import React, { useState, useEffect } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { Restaurant, MenuItem } from '../../types';
import { Search, ArrowLeft, X, Star, Clock, Sparkles, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';
import { DietaryBadge } from '../common/DietaryBadge';

interface SearchScreenProps {
  autoStartVoice?: boolean;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ autoStartVoice = false }) => {
  const {
    restaurants,
    setSelectedRestaurant,
    setCustomizingItem,
    setCustomerScreen,
    addToCart,
    dietaryFilter,
    setDietaryFilter
  } = useTomattto();

  const [query, setQuery] = useState('');

  const {
    isListening,
    isSupported,
    transcript,
    errorMessage,
    startListening,
    stopListening
  } = useVoiceSearch((finalText) => {
    if (finalText) {
      setQuery(finalText);
    }
  });

  useEffect(() => {
    if (autoStartVoice) {
      startListening();
    }
  }, [autoStartVoice, startListening]);

  // Keep search input updated live as interim results arrive
  useEffect(() => {
    if (isListening && transcript) {
      setQuery(transcript);
    }
  }, [isListening, transcript]);

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

        if (dietaryFilter === 'veg') {
          if (!r.isPureVeg && !r.categories.some((cat) => cat.items.some((i) => i.dietary === 'veg'))) {
            return false;
          }
        } else if (dietaryFilter === 'non_veg') {
          if (r.isPureVeg || !r.categories.some((cat) => cat.items.some((i) => i.dietary === 'non_veg'))) {
            return false;
          }
        }

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
            if (dietaryFilter === 'veg' && item.dietary !== 'veg') return;
            if (dietaryFilter === 'non_veg' && item.dietary === 'veg') return;
            matchingDishes.push({ restaurant: r, item });
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
                display: 'flex',
                border: 'none',
                cursor: 'pointer'
              }}
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}

          {/* Voice Search Microphone Button */}
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            style={{
              padding: '5px',
              borderRadius: '50%',
              backgroundColor: isListening ? 'var(--color-primary)' : 'transparent',
              color: isListening ? '#FFFFFF' : 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isListening ? '0 0 12px var(--color-primary)' : 'none',
              animation: isListening ? 'pulse 1.2s infinite' : 'none'
            }}
            title={isListening ? 'Stop listening' : 'Search by voice'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        </div>
      </div>

      {/* Voice Listening Active Strip */}
      {isListening && (
        <div
          style={{
            backgroundColor: 'rgba(255, 75, 58, 0.1)',
            borderBottom: '1px solid rgba(255, 75, 58, 0.25)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                display: 'inline-block',
                boxShadow: '0 0 8px var(--color-primary)'
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>
              Listening... Speak dish or restaurant name now
            </span>
          </div>

          <button
            onClick={stopListening}
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Voice Search Error Notice */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            borderBottom: '1px solid rgba(231, 76, 60, 0.2)',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--color-nonveg)'
          }}
        >
          <AlertCircle size={14} />
          <span style={{ flex: 1 }}>{errorMessage}</span>
        </div>
      )}

      {/* Indian Standard Veg / Non-Veg Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <button
          onClick={() => setDietaryFilter('all')}
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: dietaryFilter === 'all' ? 800 : 500,
            backgroundColor: dietaryFilter === 'all' ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
            color: dietaryFilter === 'all' ? 'var(--color-primary)' : 'var(--color-text-main)',
            border: dietaryFilter === 'all' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer'
          }}
        >
          <DietaryBadge type="all" size={11} />
          <span>All Items</span>
        </button>

        <button
          onClick={() => setDietaryFilter('veg')}
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: dietaryFilter === 'veg' ? 800 : 500,
            backgroundColor: dietaryFilter === 'veg' ? 'rgba(46, 204, 113, 0.12)' : 'var(--color-surface-muted)',
            color: dietaryFilter === 'veg' ? 'var(--color-veg)' : 'var(--color-text-main)',
            border: dietaryFilter === 'veg' ? '1.5px solid var(--color-veg)' : '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer'
          }}
        >
          <DietaryBadge type="veg" size={11} />
          <span>Pure Veg</span>
        </button>

        <button
          onClick={() => setDietaryFilter('non_veg')}
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: dietaryFilter === 'non_veg' ? 800 : 500,
            backgroundColor: dietaryFilter === 'non_veg' ? 'rgba(231, 76, 60, 0.12)' : 'var(--color-surface-muted)',
            color: dietaryFilter === 'non_veg' ? 'var(--color-nonveg)' : 'var(--color-text-main)',
            border: dietaryFilter === 'non_veg' ? '1.5px solid var(--color-nonveg)' : '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer'
          }}
        >
          <DietaryBadge type="non_veg" size={11} />
          <span>Non-Veg</span>
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
                          {(r.cuisines || []).join(' • ')}
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
