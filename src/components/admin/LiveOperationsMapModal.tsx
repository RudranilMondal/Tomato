import React from 'react';
import { X, MapPin, Bike, Navigation, Activity, Flame } from 'lucide-react';

interface LiveOperationsMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveOperationsMapModal: React.FC<LiveOperationsMapModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const zones = [
    { name: 'Indiranagar Hub', orders: 18, riders: 14, surge: '1.2x', x: '58%', y: '38%', color: '#FF4B3A' },
    { name: 'Koramangala 5th Block', orders: 24, riders: 19, surge: '1.5x (High)', x: '45%', y: '65%', color: '#E74C3C' },
    { name: 'HSR Layout Sector 4', orders: 12, riders: 9, surge: '1.0x', x: '72%', y: '75%', color: '#2ECC71' },
    { name: 'MG Road Central', orders: 15, riders: 11, surge: '1.1x', x: '35%', y: '32%', color: '#F39C12' }
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '800px',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#1E1E24',
            color: '#FFFFFF',
            padding: '16px 24px',
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
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Activity size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Bengaluru Central Live Operations Map</h3>
              <p style={{ fontSize: '11px', color: '#A5A5B2' }}>Real-time fleet distribution, order clusters & surge zones</p>
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

        {/* Map Visual Area */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#1C1C24',
            backgroundImage: `radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Simulated Map Road Grid Lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.25 }}>
            <line x1="0" y1="180" x2="800" y2="180" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="0" y1="360" x2="800" y2="360" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="280" y1="0" x2="280" y2="600" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="540" y1="0" x2="540" y2="600" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="45%" cy="50%" r="180" stroke="var(--color-primary)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          </svg>

          {/* Zones Markers with Pulse Rings */}
          {zones.map((zone, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: zone.x,
                top: zone.y,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: zone.color,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 24px ${zone.color}`,
                  animation: 'pulseGlow 2s infinite'
                }}
              >
                <Flame size={20} />
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(30, 30, 36, 0.95)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '8px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: 'var(--shadow-sm)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 800, display: 'block' }}>{zone.name}</span>
                <span style={{ fontSize: '10px', color: '#A5A5B2' }}>
                  {zone.orders} orders • {zone.riders} riders • Surge: <b style={{ color: zone.color }}>{zone.surge}</b>
                </span>
              </div>
            </div>
          ))}

          {/* Floating Live Fleet Summary Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              backgroundColor: 'rgba(30, 30, 36, 0.92)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              color: '#FFFFFF'
            }}
          >
            <div>
              <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Total Active Fleet</span>
              <h4 style={{ fontSize: '16px', fontWeight: 800 }}>53 Online Riders</h4>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Live Unassigned Orders</span>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-veg)' }}>0 (100% Dispatched)</h4>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Avg City ETA</span>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#FFB400' }}>21.4 mins</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
