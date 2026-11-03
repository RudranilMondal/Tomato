import React, { useState, useEffect } from 'react';
import { X, User, Check, Sparkles } from 'lucide-react';
import { useTomattto } from '../../context/TomatttoContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useTomattto();
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [mouseDownOnBackdrop, setMouseDownOnBackdrop] = useState(false);

  // Synchronize state whenever modal opens or user profile updates
  useEffect(() => {
    if (isOpen) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl);
      setSavedSuccess(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Safe backdrop click handlers: only close if BOTH mousedown & mouseup originated on the backdrop
  // This prevents closing the modal when selecting text by dragging the mouse across inputs
  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setMouseDownOnBackdrop(true);
    } else {
      setMouseDownOnBackdrop(false);
    }
  };

  const handleBackdropMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mouseDownOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
    setMouseDownOnBackdrop(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || user.name,
      phone: phone.trim() || user.phone,
      email: email.trim() || user.email,
      avatarUrl
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 2600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
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
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Edit Profile</h3>
          </div>

          <button
            type="button"
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

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Avatar Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--color-primary)',
                boxShadow: '0 4px 14px var(--color-primary-glow)'
              }}
            >
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Select Profile Avatar:
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
              {AVATAR_PRESETS.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setAvatarUrl(url)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2px solid ${avatarUrl === url ? 'var(--color-primary)' : 'transparent'}`,
                    opacity: avatarUrl === url ? 1 : 0.6,
                    transform: avatarUrl === url ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <img src={url} alt={`Preset ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter your name"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-muted)',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-text-main)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Mobile Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              placeholder="Enter your phone number"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                outline: 'none'
              }}
            />
          </div>

          {/* Email Address */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              placeholder="Enter your email address"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                outline: 'none'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              marginTop: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: savedSuccess ? 'var(--color-veg)' : 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            {savedSuccess ? <Check size={16} /> : <Sparkles size={15} />}
            <span>{savedSuccess ? 'Profile Updated ✓' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
