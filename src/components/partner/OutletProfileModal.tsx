import React, { useState } from 'react';
import { X, Store, ShieldCheck, Clock, MapPin, Building, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { Restaurant } from '../../types';

interface OutletProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
}

export const OutletProfileModal: React.FC<OutletProfileModalProps> = ({ isOpen, onClose, restaurant }) => {
  const [isBusyMode, setIsBusyMode] = useState(false);
  const [openingTime, setOpeningTime] = useState('11:00 AM');
  const [closingTime, setClosingTime] = useState('11:30 PM');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 2500,
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
          maxWidth: '520px',
          maxHeight: '88vh',
          backgroundColor: '#1E1E24',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
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
            backgroundColor: '#262630'
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
              <Store size={18} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Outlet Profile & KYC</h3>
              <p style={{ fontSize: '11px', color: '#A5A5B2', margin: 0 }}>
                FSSAI License, Operating Timings & Payout Account
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#A5A5B2',
              display: 'flex',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="no-scrollbar">
          {/* Outlet Banner Card */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '16px'
            }}
          >
            <div style={{ width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
              <img src={restaurant.coverImage} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{restaurant.name}</h4>
                <CheckCircle2 size={15} color="#2ECC71" />
              </div>
              <p style={{ fontSize: '12px', color: '#A5A5B2', margin: '2px 0 6px' }}>{restaurant.tagline}</p>
              <span style={{ fontSize: '11px', color: '#F1C40F', fontWeight: 700 }}>
                ⭐ {restaurant.rating} ({restaurant.ratingCount.toLocaleString()} ratings)
              </span>
            </div>
          </div>

          {/* Busy Mode Toggle */}
          <div
            style={{
              backgroundColor: isBusyMode ? 'rgba(231, 76, 60, 0.15)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${isBusyMode ? '#E74C3C' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px'
            }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 800, display: 'block' }}>
                Kitchen Busy Mode
              </span>
              <span style={{ fontSize: '11px', color: '#A5A5B2' }}>
                {isBusyMode
                  ? 'Pauses incoming orders for 30 mins to avoid kitchen overload'
                  : 'Accepting normal orders with 22-26 min prep time'}
              </span>
            </div>

            <button
              onClick={() => setIsBusyMode(!isBusyMode)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isBusyMode ? '#E74C3C' : 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {isBusyMode ? 'Busy (Paused)' : 'Normal'}
            </button>
          </div>

          {/* KYC Badges Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            {/* FSSAI License */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2ECC71', marginBottom: '4px' }}>
                <ShieldCheck size={16} />
                <span style={{ fontSize: '11px', fontWeight: 800 }}>FSSAI CERTIFIED</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, display: 'block' }}>Lic: 11221334000542</span>
              <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Valid thru: 31 Dec 2028</span>
            </div>

            {/* GSTIN */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3498DB', marginBottom: '4px' }}>
                <Building size={16} />
                <span style={{ fontSize: '11px', fontWeight: 800 }}>GST REGISTERED</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, display: 'block' }}>29AABCT1337M1Z4</span>
              <span style={{ fontSize: '10px', color: '#A5A5B2' }}>Karnataka State Central</span>
            </div>
          </div>

          {/* Operating Timings */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Clock size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '12px', fontWeight: 800 }}>Daily Operating Hours</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: '#A5A5B2', display: 'block' }}>Opens At</span>
                <input
                  type="text"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '12px', fontWeight: 700 }}
                />
              </div>
              <span style={{ color: '#A5A5B2', marginTop: '14px' }}>➔</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: '#A5A5B2', display: 'block' }}>Closes At</span>
                <input
                  type="text"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '12px', fontWeight: 700 }}
                />
              </div>
            </div>
          </div>

          {/* Bank Settlement Account */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <CreditCard size={16} color="#2ECC71" />
              <span style={{ fontSize: '12px', fontWeight: 800 }}>Weekly Settlement Bank Account</span>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 2px' }}>
              HDFC Bank • A/C: ••••••••••4821
            </p>
            <p style={{ fontSize: '11px', color: '#A5A5B2', margin: 0 }}>
              IFSC: HDFC0000128 • Auto-settled every Monday 6:00 AM
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
