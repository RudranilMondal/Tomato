import React from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { MapPin, X, Navigation, Check } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { user, selectedAddress, setSelectedAddress } = useTomattto();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
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
          padding: '20px',
          maxHeight: '85%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Choose Delivery Location</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Select where you want your food delivered</p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-muted)',
              color: 'var(--color-text-main)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Simulated Map Visual */}
        <div
          style={{
            height: '130px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#E5E3DF',
            backgroundImage: `radial-gradient(#C4C2BE 1.5px, transparent 1.5px), radial-gradient(#C4C2BE 1.5px, #E5E3DF 1.5px)`,
            backgroundSize: '24px 24px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '16px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Animated Map Pin */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'floatRide 2s infinite ease-in-out'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px var(--color-primary-glow)'
              }}
            >
              <MapPin size={22} />
            </div>
            <div
              style={{
                width: '12px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.25)',
                marginTop: '4px'
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 700,
              color: '#1E1E24',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Navigation size={12} color="#FF4B3A" />
            <span>Bengaluru Central • 100ft Rd</span>
          </div>
        </div>

        {/* Saved Addresses List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            Saved Addresses
          </span>
          {user.addresses.map((addr) => {
            const isSelected = selectedAddress === addr.line;
            return (
              <div
                key={addr.id}
                onClick={() => {
                  setSelectedAddress(addr.line);
                  onClose();
                }}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                    color: isSelected ? '#FFFFFF' : 'var(--color-primary)',
                    display: 'flex'
                  }}
                >
                  <MapPin size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>{addr.label}</span>
                    {addr.isDefault && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: 'var(--color-border)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        Default
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    {addr.line}
                  </p>
                </div>
                {isSelected && (
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={12} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Location GPS Button */}
        <button
          onClick={() => {
            setSelectedAddress('Current GPS Location: 100ft Road, Indiranagar, Bengaluru');
            onClose();
          }}
          style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-muted)',
            color: 'var(--color-primary)',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: '1px dashed var(--color-primary)'
          }}
        >
          <Navigation size={15} />
          <span>Use Current GPS Location</span>
        </button>
      </div>
    </div>
  );
};
