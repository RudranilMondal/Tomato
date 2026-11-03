import React from 'react';
import { X, ShieldAlert, Phone, Ambulance, LifeBuoy } from 'lucide-react';

interface RiderSosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiderSosModal: React.FC<RiderSosModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 160,
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
          maxWidth: '420px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(231, 76, 60, 0.15)',
                color: '#E74C3C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#E74C3C' }}>Emergency SOS</h3>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>24x7 Tomattto Rider Safety Protocol</p>
            </div>
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

        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
          Tapping below shares your real-time GPS location with our dedicated Emergency Response Team and local emergency authorities.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <button
            onClick={() => {
              alert('Dialing Tomattto 24x7 Rider Emergency Hotline (1800-TOM-HELP)... Real-time GPS dispatched.');
              onClose();
            }}
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#E74C3C',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(231, 76, 60, 0.4)'
            }}
          >
            <Phone size={18} />
            <span>Call Rider Emergency Team</span>
          </button>

          <button
            onClick={() => {
              alert('Dialing Police (112)... SOS broadcast sent to fleet marshals.');
              onClose();
            }}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-muted)',
              color: 'var(--color-text-main)',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: '1px solid var(--color-border)'
            }}
          >
            <Ambulance size={16} />
            <span>National Emergency (112)</span>
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          Cancel & Return
        </button>
      </div>
    </div>
  );
};
