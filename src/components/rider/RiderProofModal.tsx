import React, { useState } from 'react';
import { X, Camera, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface RiderProofModalProps {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onConfirmDelivery: (proofUrl?: string) => void;
}

export const RiderProofModal: React.FC<RiderProofModalProps> = ({
  isOpen,
  orderId,
  onClose,
  onConfirmDelivery
}) => {
  const [photoSnapped, setPhotoSnapped] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('Left safely at apartment door');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '440px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Proof of Delivery</h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Order #{orderId}</p>
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

        {/* Camera Snap Frame */}
        <div
          onClick={() => setPhotoSnapped(!photoSnapped)}
          style={{
            height: '180px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: photoSnapped ? '#000000' : 'var(--color-surface-muted)',
            border: '2px dashed var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '16px'
          }}
        >
          {photoSnapped ? (
            <>
              <img
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80"
                alt="Delivery proof"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Check size={12} color="var(--color-veg)" />
                <span>Photo Captured • Tap to retake</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px'
                }}
              >
                <Camera size={24} />
              </div>
              <h5 style={{ fontSize: '13px', fontWeight: 800 }}>Tap to Capture Drop Photo</h5>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Shows parcel placed safely at door/gate
              </p>
            </div>
          )}
        </div>

        {/* Quick Delivery Notes */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
            Drop-off Location Note
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              'Left safely at apartment door',
              'Handed to customer directly',
              'Left with building security desk',
              'Placed on entryway shoe rack'
            ].map((n, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDeliveryNote(n)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: deliveryNote === n ? 'var(--color-veg-bg)' : 'var(--color-surface-muted)',
                  color: deliveryNote === n ? 'var(--color-veg)' : 'var(--color-text-main)',
                  border: deliveryNote === n ? '1px solid var(--color-veg)' : '1px solid var(--color-border)'
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
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
            onClick={() => {
              onConfirmDelivery(photoSnapped ? 'mock_photo_url' : undefined);
              onClose();
            }}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-veg)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
            }}
          >
            <Check size={16} />
            <span>Confirm Drop-off</span>
          </button>
        </div>
      </div>
    </div>
  );
};
