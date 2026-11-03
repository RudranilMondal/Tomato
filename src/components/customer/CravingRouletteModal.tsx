import React, { useState, useRef } from 'react';
import { X, Sparkles, Utensils, ArrowRight, RotateCw, Trophy, Flame } from 'lucide-react';
import { useTomattto } from '../../context/TomatttoContext';
import confetti from 'canvas-confetti';

interface CravingRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RouletteItem {
  id: string;
  name: string;
  emoji: string;
  imageUrl: string;
  color: string;
  restaurantId: string;
  restaurantName: string;
  tagline: string;
  discountCode: string;
}

const ROULETTE_ITEMS: RouletteItem[] = [
  {
    id: 'biryani',
    name: 'Dum Handi Biryani',
    emoji: '🍚',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
    color: '#D83A2E',
    restaurantId: 'rest-1',
    restaurantName: 'Meghana Foods',
    tagline: 'Aromatic basmati rice layered with spiced tender meat',
    discountCode: 'CRAVEBIRYANI25'
  },
  {
    id: 'pizza',
    name: 'Truffle Mushroom Pizza',
    emoji: '🍕',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
    color: '#E67E22',
    restaurantId: 'rest-3',
    restaurantName: 'Toscano Pizzeria',
    tagline: 'Wood-fired crust with wild portobello and mozzarella',
    discountCode: 'CRAVEPIZZA20'
  },
  {
    id: 'burger',
    name: 'Double Smash Burger',
    emoji: '🍔',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
    color: '#F39C12',
    restaurantId: 'rest-4',
    restaurantName: 'Truffles Urban Diner',
    tagline: 'Juicy smashed patties, caramelized onion and cheddar',
    discountCode: 'SMASHBURGER15'
  },
  {
    id: 'dosa',
    name: 'Crispy Ghee Masala Dosa',
    emoji: '🥞',
    imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=400&auto=format&fit=crop&q=80',
    color: '#27AE60',
    restaurantId: 'rest-6',
    restaurantName: 'MTR 1924',
    tagline: 'Golden roasted fermented crepe with spiced potato mash',
    discountCode: 'DOSACRAVE30'
  },
  {
    id: 'momos',
    name: 'Darjeeling Steamed Momos',
    emoji: '🥟',
    imageUrl: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400&auto=format&fit=crop&q=80',
    color: '#2980B9',
    restaurantId: 'rest-5',
    restaurantName: 'Siam & Tibet Kitchen',
    tagline: 'Delicate handmade dumplings with fiery scallion dip',
    discountCode: 'MOMOFEST20'
  },
  {
    id: 'noodles',
    name: 'Sizzling Hakka Noodles',
    emoji: '🍜',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80',
    color: '#8E44AD',
    restaurantId: 'rest-2',
    restaurantName: 'Mainland China Hub',
    tagline: 'Wok-tossed noodles with crunchy veggies and chili garlic',
    discountCode: 'WOKLOVE20'
  },
  {
    id: 'butter_chicken',
    name: 'Murgh Makhani & Naan',
    emoji: '🍗',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80',
    color: '#D35400',
    restaurantId: 'rest-1',
    restaurantName: 'Punjab Grill',
    tagline: 'Tandoori chicken simmered in rich satin tomato butter gravy',
    discountCode: 'MAKHANI25'
  },
  {
    id: 'dessert',
    name: 'Dark Belgian Waffle',
    emoji: '🧇',
    imageUrl: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&auto=format&fit=crop&q=80',
    color: '#C0392B',
    restaurantId: 'rest-4',
    restaurantName: 'The Belgian Waffle Co.',
    tagline: 'Freshly baked waffle drenched in warm melted Belgian chocolate',
    discountCode: 'SWEETCRAVE20'
  }
];

export const CravingRouletteModal: React.FC<CravingRouletteModalProps> = ({ isOpen, onClose }) => {
  const { setSelectedRestaurant, restaurants, setCustomerScreen, applyCoupon } = useTomattto();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [winningItem, setWinningItem] = useState<RouletteItem | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Synthesize realistic ticker clicks via Web Audio API
  const playTickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio fallback
    }
  };

  const playWinFanfare = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.1);
        osc.stop(audioCtx.currentTime + idx * 0.1 + 0.3);
      });
    } catch (e) {
      // Fallback
    }
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setWinningItem(null);
    setIsSpinning(true);

    // Pick a random winner index (0 to 7)
    const winnerIndex = Math.floor(Math.random() * ROULETTE_ITEMS.length);
    const itemSliceAngle = 360 / ROULETTE_ITEMS.length; // 45 degrees

    // Top pointer is at 12 o'clock (0°).
    // Each slice idx center is initially at: (idx + 0.5) * itemSliceAngle clockwise from 12 o'clock.
    // When wheel rotates by finalAngle, slice center is at (center + finalAngle) % 360.
    // For slice center to stop at 12 o'clock (0°):
    // (center + finalAngle) % 360 = 0 => (finalAngle % 360) = (360 - center % 360) % 360.
    const targetSliceCenter = (winnerIndex + 0.5) * itemSliceAngle;
    const targetMod = (360 - (targetSliceCenter % 360)) % 360;
    const currentMod = ((rotationAngle % 360) + 360) % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    const randomExtraSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full spins
    const finalAngle = rotationAngle + (360 * randomExtraSpins) + delta;

    // Play ticking simulation
    let ticks = 0;
    const tickInterval = setInterval(() => {
      ticks++;
      playTickSound();
      if (ticks > 26) clearInterval(tickInterval);
    }, 120);

    setRotationAngle(finalAngle);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const chosen = ROULETTE_ITEMS[winnerIndex];
      setWinningItem(chosen);
      playWinFanfare();

      confetti({
        particleCount: 100,
        spread: 85,
        origin: { y: 0.55 }
      });
    }, 4200);
  };

  const handleOrderWinner = (item: RouletteItem) => {
    // Find restaurant or fallback to first
    const rest = restaurants.find((r) => r.id === item.restaurantId) || restaurants[0];
    setSelectedRestaurant(rest);
    applyCoupon(item.discountCode);
    setCustomerScreen('restaurant');
    onClose();
  };

  const sliceAngle = 360 / ROULETTE_ITEMS.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 3000,
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
          backgroundColor: '#16161E',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255, 75, 58, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Top Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(255,75,58,0.15) 0%, rgba(243,156,18,0.15) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px var(--color-primary-glow)'
              }}
            >
              <Flame size={20} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
                Craving Roulette 🎰
              </h3>
              <p style={{ fontSize: '11px', color: '#A5A5B2', margin: 0 }}>
                Can't decide? Let food fate choose & unlock secret discounts!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#A5A5B2',
              display: 'flex',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Roulette Wheel Stage */}
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Neon & Gold Pointer Needle on Top */}
          <div
            style={{
              position: 'relative',
              zIndex: 30,
              marginBottom: '-16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderTop: '26px solid #FF4B3A',
                filter: 'drop-shadow(0 4px 12px rgba(255,75,58,0.85)) drop-shadow(0 0 3px #FFD700)',
                transform: isSpinning ? 'rotate(-6deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease'
              }}
            />
            {/* Golden Rivet on Needle */}
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#FFD700',
                border: '2px solid #FFFFFF',
                marginTop: '-28px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                zIndex: 31
              }}
            />
          </div>

          {/* SVG Rotating Wheel */}
          <div
            ref={wheelRef}
            style={{
              width: '290px',
              height: '290px',
              borderRadius: '50%',
              position: 'relative',
              boxShadow: '0 0 0 6px #1E1E28, 0 0 0 10px rgba(255, 75, 58, 0.4), 0 0 0 12px #FFD700, 0 16px 40px rgba(0,0,0,0.75)',
              transform: `rotate(${rotationAngle}deg)`,
              transition: isSpinning ? 'transform 4.2s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
            }}
          >
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', borderRadius: '50%' }}>
              <defs>
                <filter id="medallion-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.7"/>
                </filter>
                <linearGradient id="hub-metallic" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2A2433" />
                  <stop offset="50%" stopColor="#17141E" />
                  <stop offset="100%" stopColor="#0E0C13" />
                </linearGradient>

                {ROULETTE_ITEMS.map((item, idx) => {
                  const midAngle = ((idx + 0.5) * sliceAngle - 90) * (Math.PI / 180);
                  const dishX = 50 + 32.5 * Math.cos(midAngle);
                  const dishY = 50 + 32.5 * Math.sin(midAngle);
                  return (
                    <React.Fragment key={item.id}>
                      <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={item.color} />
                        <stop offset="65%" stopColor={item.color} stopOpacity="0.88" />
                        <stop offset="100%" stopColor="#14111A" />
                      </linearGradient>
                      <clipPath id={`clip-dish-${idx}`}>
                        <circle cx={dishX} cy={dishY} r="7.4" />
                      </clipPath>
                    </React.Fragment>
                  );
                })}
              </defs>

              {ROULETTE_ITEMS.map((item, idx) => {
                const startAngle = (idx * sliceAngle - 90) * (Math.PI / 180);
                const endAngle = ((idx + 1) * sliceAngle - 90) * (Math.PI / 180);
                const x1 = 50 + 50 * Math.cos(startAngle);
                const y1 = 50 + 50 * Math.sin(startAngle);
                const x2 = 50 + 50 * Math.cos(endAngle);
                const y2 = 50 + 50 * Math.sin(endAngle);
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                // Calculate dish position
                const midAngle = ((idx + 0.5) * sliceAngle - 90) * (Math.PI / 180);
                const dishX = 50 + 32.5 * Math.cos(midAngle);
                const dishY = 50 + 32.5 * Math.sin(midAngle);

                // Outer border rivet coordinates
                const studX = 50 + 47.5 * Math.cos(startAngle);
                const studY = 50 + 47.5 * Math.sin(startAngle);

                return (
                  <g key={item.id}>
                    {/* Wedge Segment */}
                    <path
                      d={pathData}
                      fill={`url(#grad-${idx})`}
                      stroke="#14111A"
                      strokeWidth="0.8"
                    />

                    {/* Thin Spoke Line */}
                    <line x1="50" y1="50" x2={x1} y2={y1} stroke="rgba(255,255,255,0.22)" strokeWidth="0.5" />

                    {/* Outer Gold Stud at Divider */}
                    <circle cx={studX} cy={studY} r="1.3" fill="#FFD700" stroke="#16161E" strokeWidth="0.4" />

                    {/* Food Dish Medallion - Golden Plate Rim */}
                    <circle
                      cx={dishX}
                      cy={dishY}
                      r="8.3"
                      fill="#FFFFFF"
                      stroke="#FFD700"
                      strokeWidth="0.8"
                      filter="url(#medallion-shadow)"
                    />

                    {/* Fallback Color Circle & Emoji */}
                    <circle cx={dishX} cy={dishY} r="7.4" fill={item.color} />
                    <text
                      x={dishX}
                      y={dishY + 2.2}
                      fontSize="6"
                      dominantBaseline="middle"
                      textAnchor="middle"
                    >
                      {item.emoji}
                    </text>

                    {/* High-Resolution Original Food Photo */}
                    <image
                      href={item.imageUrl}
                      x={dishX - 7.4}
                      y={dishY - 7.4}
                      width="14.8"
                      height="14.8"
                      clipPath={`url(#clip-dish-${idx})`}
                      preserveAspectRatio="xMidYMid slice"
                    />

                    {/* Inner Plate Glass Highlight */}
                    <circle
                      cx={dishX}
                      cy={dishY}
                      r="7.4"
                      fill="none"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="0.5"
                      pointerEvents="none"
                    />
                  </g>
                );
              })}

              {/* Outer Golden Rim Circle */}
              <circle cx="50" cy="50" r="49.2" fill="none" stroke="#FFD700" strokeWidth="0.6" strokeOpacity="0.85" />

              {/* Wheel Center Hub */}
              <circle cx="50" cy="50" r="14.5" fill="url(#hub-metallic)" stroke="#FFD700" strokeWidth="1.3" filter="url(#medallion-shadow)" />
              <circle cx="50" cy="50" r="11" fill="#FF4B3A" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.6" />
              <text x="50" y="49" fontSize="3.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.4">
                TOMATTTO
              </text>
              <text x="50" y="53.5" fontSize="2.8" fontWeight="800" fill="#FFE5B4" textAnchor="middle" letterSpacing="0.6">
                ★ SPIN ★
              </text>
            </svg>
          </div>

          {/* Spin Trigger Button */}
          <div style={{ marginTop: '22px', width: '100%', maxWidth: '300px' }}>
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: 'var(--radius-full)',
                background: isSpinning
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(135deg, #FF4B3A 0%, #FF8A65 100%)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 900,
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                boxShadow: isSpinning ? 'none' : '0 8px 24px var(--color-primary-glow)',
                transform: isSpinning ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              <RotateCw size={17} style={{ animation: isSpinning ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isSpinning ? 'SPINNING THE CRAVINGS...' : 'SPIN THE WHEEL NOW!'}</span>
            </button>
          </div>

          {/* Winner Reveal Card */}
          {winningItem && (
            <div
              style={{
                marginTop: '20px',
                width: '100%',
                backgroundColor: 'rgba(255, 75, 58, 0.12)',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--color-primary)',
                padding: '16px',
                textAlign: 'center',
                animation: 'scaleIn 0.3s ease-out'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 800,
                  marginBottom: '10px',
                  boxShadow: '0 2px 8px var(--color-primary-glow)'
                }}
              >
                <Trophy size={13} />
                <span>YOU UNLOCKED A SECRET DEAL!</span>
              </div>

              {/* Real Food Photo Medallion */}
              <div style={{ position: 'relative', width: '84px', height: '84px', margin: '4px auto 10px' }}>
                <img
                  src={winningItem.imageUrl}
                  alt={winningItem.name}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #FFD700',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 75, 58, 0.4)'
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    fontSize: '22px',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                  }}
                >
                  {winningItem.emoji}
                </span>
              </div>

              <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 2px' }}>
                {winningItem.name}
              </h4>
              <p style={{ fontSize: '12px', color: '#FF7058', fontWeight: 700, margin: '0 0 4px' }}>
                {winningItem.restaurantName}
              </p>
              <p style={{ fontSize: '11px', color: '#C0BAC6', margin: '0 0 12px', lineHeight: 1.35, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto' }}>
                {winningItem.tagline}
              </p>

              <div
                style={{
                  backgroundColor: 'rgba(0,0,0,0.35)',
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px dashed rgba(255,255,255,0.25)'
                }}
              >
                <span style={{ fontSize: '11px', color: '#A5A5B2' }}>Promo Applied Automatically:</span>
                <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--color-veg)' }}>
                  {winningItem.discountCode} (25% OFF)
                </span>
              </div>

              <button
                onClick={() => handleOrderWinner(winningItem)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-veg)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(46, 204, 113, 0.45)'
                }}
              >
                <span>Order This Dish with Discount</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
