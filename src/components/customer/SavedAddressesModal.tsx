import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { X, MapPin, Plus, Trash2, Home, Briefcase, Compass, Check } from 'lucide-react';

interface SavedAddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedAddressesModal: React.FC<SavedAddressesModalProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber.trim() || !areaStreet.trim()) return;
    const fullLine = `${flatNumber.trim()}, ${areaStreet.trim()}${landmark ? ` (Near ${landmark.trim()})` : ''}`;
    addAddress(selectedTag, fullLine);
    setFlatNumber('');
    setAreaStreet('');
    setLandmark('');
    setIsAddingNew(false);
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
          maxHeight: '85%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease',
          overflowY: 'auto'
        }}
        className="no-scrollbar"
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
              {isAddingNew ? 'Add New Address' : 'My Saved Addresses'}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Manage delivery locations for quick 1-tap ordering
            </p>
          </div>

          <button
            onClick={() => {
              if (isAddingNew) setIsAddingNew(false);
              else onClose();
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

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isAddingNew ? (
            <>
              <button
                onClick={() => setIsAddingNew(true)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: '1px dashed var(--color-primary)'
                }}
              >
                <Plus size={16} />
                <span>Add New Delivery Address</span>
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {userAddresses.map((addr) => {
                  const isSelected = selectedAddress === addr.line;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr.line);
                        setDefaultAddress(addr.id);
                      }}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: 'pointer'
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
                          <span style={{ fontSize: '14px', fontWeight: 800 }}>{addr.label}</span>
                          {addr.isDefault && (
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: 800,
                                backgroundColor: 'var(--color-veg-bg)',
                                color: 'var(--color-veg)',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                          {addr.line}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {userAddresses.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAddress(addr.id);
                            }}
                            style={{
                              padding: '6px',
                              borderRadius: '4px',
                              color: 'var(--color-text-muted)',
                              display: 'flex'
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        {isSelected && (
                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-primary)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Check size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Tag Location
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
                  Flat / House Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. B-402, Oakwood Apartments"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    fontSize: '13px',
                    color: 'var(--color-text-main)'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Area / Street *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5th Block, Koramangala"
                  value={areaStreet}
                  onChange={(e) => setAreaStreet(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
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
                  placeholder="e.g. Opposite Forum Mall"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
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
                    fontSize: '13px'
                  }}
                >
                  Save Address
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
