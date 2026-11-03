import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface RejectOrderModalProps {
  isOpen: boolean;
  orderId: string | null;
  onClose: () => void;
  onConfirmReject: (orderId: string, reason: string) => void;
}

export const RejectOrderModal: React.FC<RejectOrderModalProps> = ({
  isOpen,
  orderId,
  onClose,
  onConfirmReject
}) => {
  const [selectedReason, setSelectedReason] = useState('Kitchen at peak capacity');

  const reasons = [
    'Kitchen at peak capacity (Order surge)',
    'Key ingredients / dishes out of stock',
    'Outlet closing soon for the day',
    'Delivery address is outside serviceable radius',
    'Technical / operational issue'
  ];

  if (!isOpen || !orderId) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
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
          maxWidth: '440px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} color="#E74C3C" />
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Reject Order #{orderId}?</h3>
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

        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
          Please select a cancellation reason. The customer will be immediately notified and issued a 100% refund.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {reasons.map((r, i) => {
            const isSelected = selectedReason === r;
            return (
              <div
                key={i}
                onClick={() => setSelectedReason(r)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1.5px solid #E74C3C' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'rgba(231, 76, 60, 0.08)' : 'var(--color-surface-muted)',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: isSelected ? '5px solid #E74C3C' : '2px solid var(--color-border)',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <span>{r}</span>
              </div>
            );
          })}
        </div>

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
            Keep Order
          </button>
          <button
            onClick={() => {
              onConfirmReject(orderId, selectedReason);
              onClose();
            }}
            style={{
              flex: 1.5,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#E74C3C',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13px'
            }}
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};
