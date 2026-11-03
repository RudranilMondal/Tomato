import React from 'react';
import { X, ShieldCheck, FileCheck, CheckCircle2, AlertCircle, Calendar, ExternalLink } from 'lucide-react';

interface RiderKycModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiderKycModal: React.FC<RiderKycModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const documents = [
    {
      title: 'Commercial Driving License (MCWG + LMV)',
      docNumber: 'DL-042018009412',
      status: 'Verified',
      validTill: '14 Nov 2032',
      badgeColor: 'var(--color-veg)',
      icon: '🚗'
    },
    {
      title: 'Vehicle Registration Certificate (RC)',
      docNumber: 'KA-03-EN-4592 (Honda Shine 125)',
      status: 'Verified',
      validTill: '22 Mar 2029',
      badgeColor: 'var(--color-veg)',
      icon: '🏍️'
    },
    {
      title: 'Aadhaar Card (UIDAI Verified)',
      docNumber: 'XXXX-XXXX-8924',
      status: 'Verified',
      validTill: 'Lifetime',
      badgeColor: 'var(--color-veg)',
      icon: '🪪'
    },
    {
      title: 'Two-Wheeler Comprehensive Insurance',
      docNumber: 'ICICI-LOMB-99201481',
      status: 'Verified',
      validTill: '18 Dec 2026',
      badgeColor: 'var(--color-veg)',
      icon: '🛡️'
    },
    {
      title: 'Police Verification & Background Check',
      docNumber: 'BKP-CRIM-CLR-2024-001',
      status: 'Clear & Active',
      validTill: 'Annual Renewal (Oct 2027)',
      badgeColor: 'var(--color-veg)',
      icon: '✅'
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          backgroundColor: '#1E1E24',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#17171C'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(46, 204, 113, 0.15)',
                color: 'var(--color-veg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Rider KYC & Compliance</h3>
              <p style={{ fontSize: '11px', color: 'var(--color-veg)' }}>
                ✓ Tier 1 Verified Delivery Partner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#A5A5B2'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Alert */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(46, 204, 113, 0.08)',
            borderBottom: '1px solid rgba(46, 204, 113, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <CheckCircle2 size={16} color="var(--color-veg)" />
          <span style={{ fontSize: '11px', color: '#D1D5DB' }}>
            All mandatory transport & identity documents are active and approved by Tomattto Fleet Ops.
          </span>
        </div>

        {/* Documents List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
          className="no-scrollbar"
        >
          {documents.map((doc, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '20px' }}>{doc.icon}</span>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{doc.title}</h4>
                  <div style={{ fontSize: '11px', color: '#A5A5B2', marginTop: '2px', fontFamily: 'monospace' }}>
                    {doc.docNumber}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8E8E93', marginTop: '3px' }}>
                    Valid until: {doc.validTill}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: 'rgba(46, 204, 113, 0.15)',
                  color: 'var(--color-veg)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                {doc.status}
              </span>
            </div>
          ))}

          {/* Emergency Contact & Insurance coverage */}
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              border: '1px dashed rgba(255,255,255,0.1)'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)' }}>
              ACCIDENTAL INSURANCE BENEFIT
            </span>
            <p style={{ fontSize: '11px', color: '#A5A5B2', marginTop: '4px' }}>
              Rider is covered up to ₹5,00,000 for on-duty medical and accidental events under Tomattto Shield Care policy #TS-99214.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#17171C',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              backgroundColor: 'var(--color-veg)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            Close & Continue Duty
          </button>
        </div>
      </div>
    </div>
  );
};
