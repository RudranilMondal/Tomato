import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import {
  MapPin,
  X,
  Navigation,
  Check,
  Plus,
  Trash2,
  Home,
  Briefcase,
  Compass
} from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const {
    userAddresses,
    selectedAddress,
    setSelectedAddress,
    addAddress,
    deleteAddress,
    setDefaultAddress
  } = useTomattto();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedTag, setSelectedTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [flatNumber, setFlatNumber] = useState('');
  const [areaStreet, setAreaStreet] = useState('');
  const [landmark, setLandmark] = useState('');

  // Interactive mock map pin coordinates
  const mockHotspots = [
    { label: 'Indiranagar 100ft Rd', address: '100ft Road, Indiranagar, Bengaluru' },
    { label: 'Koramangala 5th Block', address: '80ft Road, 5th Block, Koramangala, Bengaluru' },
    { label: 'HSR Layout Sector 4', address: '17th Cross, Sector 4, HSR Layout, Bengaluru' },
    { label: 'MG Road Central', address: 'Church Street, Off MG Road, Bengaluru' }
  ];

  if (!isOpen) return null;

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber.trim() || !areaStreet.trim()) return;

    const fullLine = `${flatNumber.trim()}, ${areaStreet.trim()}${landmark ? ` (Near ${landmark.trim()})` : ''}`;
    addAddress(selectedTag, fullLine);
    setFlatNumber('');
    setAreaStreet('');
    setLandmark('');
    setIsAddingNew(false);
    onClose();
  };

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
          maxHeight: '90%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease',
          overflowY: 'auto'
        }}
        className="no-scrollbar"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
              {isAddingNew ? 'Add Delivery Address' : 'Choose Delivery Location'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {isAddingNew ? 'Enter address details for accurate drop-off' : 'Select where you want your food delivered'}
            </p>
          </div>
          <button
            onClick={() => {
              if (isAddingNew) {
                setIsAddingNew(false);
              } else {
                onClose();
              }
            }}
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

        {!isAddingNew ? (
          <>
            {/* Interactive Mock Map Pin Visualizer */}
            <div
              style={{
                height: '140px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#E5E3DF',
                backgroundImage: `radial-gradient(#C4C2BE 1.5px, transparent 1.5px), radial-gradient(#C4C2BE 1.5px, #E5E3DF 1.5px)`,
                backgroundSize: '24px 24px',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '16px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px'
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

              {/* Quick Area Chips on Map */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  maxWidth: '96%',
                  padding: '2px 4px'
                }}
                className="no-scrollbar"
              >
                {mockHotspots.map((spot, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedAddress(spot.address);
                      onClose();
                    }}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#1E1E24',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Navigation size={10} color="#FF4B3A" />
                    <span>{spot.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Addresses List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Saved Addresses ({userAddresses.length})
                </span>
                <button
                  onClick={() => setIsAddingNew(true)}
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} />
                  <span>Add New</span>
                </button>
              </div>

              {userAddresses.map((addr) => {
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
                      {addr.label === 'Home' ? (
                        <Home size={18} />
                      ) : addr.label === 'Work' ? (
                        <Briefcase size={18} />
                      ) : (
                        <MapPin size={18} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{addr.label}</span>
                        {addr.isDefault && (
                          <span
                            style={{
                              fontSize: '9px',
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {userAddresses.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAddress(addr.id);
                          }}
                          style={{
                            padding: '4px',
                            color: 'var(--color-text-muted)',
                            borderRadius: '4px',
                            display: 'flex'
                          }}
                          title="Delete address"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

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
                  </div>
                );
              })}
            </div>

            {/* Current Location GPS Button */}
            <button
              onClick={() => {
                setSelectedAddress('100ft Road, Indiranagar, Bengaluru (Current GPS)');
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
          </>
        ) : (
          /* Add New Address Form */
          <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Save As
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['Home', 'Work', 'Other'] as const).map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedTag === tag ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: selectedTag === tag ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      color: selectedTag === tag ? 'var(--color-primary)' : 'var(--color-text-main)',
                      fontWeight: 700,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {tag === 'Home' ? <Home size={14} /> : tag === 'Work' ? <Briefcase size={14} /> : <Compass size={14} />}
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Flat / House / Building Number *
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 301, Tower B, Green Glen"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  fontSize: '13px',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Street / Area / Locality *
              </label>
              <input
                type="text"
                placeholder="e.g. 12th Main, HAL 2nd Stage, Indiranagar"
                value={areaStreet}
                onChange={(e) => setAreaStreet(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  fontSize: '13px',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Landmark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Opposite Sony Center / Near Metro"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  fontSize: '13px',
                  color: 'var(--color-text-main)'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-muted)',
                  color: 'var(--color-text-main)',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                Save & Select Address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
