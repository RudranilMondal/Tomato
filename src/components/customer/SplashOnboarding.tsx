import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { ChevronRight, ArrowRight, Zap, ShieldCheck, MapPin } from 'lucide-react';

export const SplashOnboarding: React.FC = () => {
  const { setCustomerScreen } = useTomattto();
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      badge: 'Lightning Fast',
      icon: <Zap size={28} color="#FF4B3A" />,
      title: 'Delicious Food Delivered in 20 Mins',
      desc: 'Craving Biryani, Pizza, or sweet treats? Order from 10,000+ top-rated local kitchens near you.',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80'
    },
    {
      badge: 'Live GPS Tracking',
      icon: <MapPin size={28} color="#2ECC71" />,
      title: 'Watch Your Order Every Step',
      desc: 'Real-time rider location, live kitchen status updates, and accurate arrival ETAs on interactive maps.',
      image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&auto=format&fit=crop&q=80'
    },
    {
      badge: 'Hygiene & Quality',
      icon: <ShieldCheck size={28} color="#FFB400" />,
      title: 'FSSAI Certified Top Restaurants',
      desc: 'Curated dining gems, strict quality standards, temperature checks, and contact-free safe dropoff.',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const current = slides[slide];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-surface)',
        padding: '24px 20px',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      {/* Top Header / Skip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🍅</span>
          <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-primary)' }}>
            Tomattto
          </span>
        </div>
        <button
          onClick={() => setCustomerScreen('home')}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-muted)'
          }}
        >
          Skip
        </button>
      </div>

      {/* Hero Food Visual */}
      <div
        style={{
          width: '100%',
          height: '240px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'var(--shadow-md)',
          margin: '20px 0'
        }}
      >
        <img
          src={current.image}
          alt={current.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#1E1E24'
          }}
        >
          {current.icon}
          <span>{current.badge}</span>
        </div>
      </div>

      {/* Slide Text Content */}
      <div style={{ textAlign: 'center', padding: '0 10px' }}>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--color-text-main)',
            marginBottom: '10px',
            lineHeight: 1.25
          }}
        >
          {current.title}
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5
          }}
        >
          {current.desc}
        </p>
      </div>

      {/* Carousel Dots & Action Button */}
      <div style={{ marginTop: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}
        >
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === slide ? '24px' : '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: i === slide ? 'var(--color-primary)' : 'var(--color-border)',
                transition: 'all 0.25s ease'
              }}
            />
          ))}
        </div>

        {slide < slides.length - 1 ? (
          <button
            onClick={() => setSlide((prev) => prev + 1)}
            style={{
              width: '100%',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setCustomerScreen('auth')}
              style={{
                width: '100%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '15px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-glow)',
                cursor: 'pointer'
              }}
            >
              <span>Get Started / Log In</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => setCustomerScreen('home')}
              style={{
                width: '100%',
                backgroundColor: 'var(--color-surface-muted)',
                color: 'var(--color-text-main)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid var(--color-border)',
                cursor: 'pointer'
              }}
            >
              Explore as Guest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
