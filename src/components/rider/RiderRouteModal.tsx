import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { X, Navigation, MapPin, Bike, Compass, AlertCircle } from 'lucide-react';

interface RiderRouteModalProps {
  isOpen: boolean;
  order: Order | null;
  step: 'heading_to_restaurant' | 'pickup_otp' | 'out_for_delivery' | 'delivered';
  onClose: () => void;
}

export const RiderRouteModal: React.FC<RiderRouteModalProps> = ({
  isOpen,
  order,
  step,
  onClose
}) => {
  const [riderProgress, setRiderProgress] = useState(25);

  useEffect(() => {
    let interval: any;
    if (isOpen) {
      interval = setInterval(() => {
        setRiderProgress((prev) => (prev >= 85 ? 20 : prev + 3));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const isGoingToRest = step === 'heading_to_restaurant' || step === 'pickup_otp';
  const targetLocation = isGoingToRest ? order.restaurant.name : order.deliveryAddress.addressLine;

  const turns = isGoingToRest
    ? [
        { dist: '250m', text: 'Turn left onto 100ft Road' },
        { dist: '800m', text: 'Continue straight past Indiranagar Metro' },
        { dist: '50m', text: 'Arrive at Behrouz Biryani (on right)' }
      ]
    : [
        { dist: '400m', text: 'Head south on 12th Main Road' },
        { dist: '1.2km', text: 'Turn right towards Sunset Heights' },
        { dist: '100m', text: 'Destination ahead at security gate' }
      ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          height: '85%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease'
        }}
      >
        {/* Navigation Header */}
        <div
          style={{
            backgroundColor: '#1E1E24',
            color: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Navigation size={18} />
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#A5A5B2', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {isGoingToRest ? 'PICKUP ROUTE NAVIGATION' : 'CUSTOMER DROP ROUTE'}
              </span>
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginTop: '2px' }}>
                {isGoingToRest ? order.restaurant.name : 'Customer Delivery Point'}
              </h4>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Turn-by-Turn Top Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-veg)',
            color: '#FFFFFF',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Compass size={24} />
            <div>
              <span style={{ fontSize: '11px', opacity: 0.9 }}>NEXT TURN IN {turns[0].dist}</span>
              <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{turns[0].text}</h4>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '16px', fontWeight: 900 }}>34 km/h</span>
            <span style={{ fontSize: '10px', opacity: 0.85, display: 'block' }}>GPS Speed</span>
          </div>
        </div>

        {/* Simulated Route Visual Canvas */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#E5E3DF',
            backgroundImage: `radial-gradient(#C4C2BE 1.5px, transparent 1.5px), radial-gradient(#C4C2BE 1.5px, #E5E3DF 1.5px)`,
            backgroundSize: '24px 24px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* SVG Route Line */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <path
              d="M 60 220 Q 150 160 200 130 T 360 80"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="6"
              strokeDasharray="8 6"
            />
          </svg>

          {/* Restaurant Origin Marker */}
          <div
            style={{
              position: 'absolute',
              left: '50px',
              bottom: '90px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1E1E24',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              🏪
            </div>
            <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', marginTop: '4px' }}>
              Pickup
            </span>
          </div>

          {/* Customer Destination Marker */}
          <div
            style={{
              position: 'absolute',
              right: '40px',
              top: '50px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-veg)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              🏠
            </div>
            <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', marginTop: '4px' }}>
              Drop-off
            </span>
          </div>

          {/* Animated Rider Icon Traveling */}
          <div
            style={{
              position: 'absolute',
              left: `${riderProgress}%`,
              top: `${190 - riderProgress * 1.2}px`,
              transition: 'all 0.8s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px var(--color-primary-glow)'
              }}
            >
              <Bike size={22} />
            </div>
            <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: 'rgba(0,0,0,0.8)', color: '#FFFFFF', padding: '1px 5px', borderRadius: '3px', marginTop: '2px' }}>
              Vikram (You)
            </span>
          </div>
        </div>

        {/* Turn Step List */}
        <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
            Turn-by-turn route steps
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {turns.map((t, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <span style={{ width: '45px', fontWeight: 700, color: 'var(--color-primary)' }}>{t.dist}</span>
                <span style={{ color: 'var(--color-text-main)' }}>{t.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            style={{
              marginTop: '14px',
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-muted)',
              color: 'var(--color-text-main)',
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            Close Navigation
          </button>
        </div>
      </div>
    </div>
  );
};
