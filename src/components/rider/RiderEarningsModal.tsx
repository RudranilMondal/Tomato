import React from 'react';
import { X, DollarSign, TrendingUp, CheckCircle2, ArrowDownLeft, ShieldCheck, Award } from 'lucide-react';
import { RiderTier } from '../../types';

interface RiderEarningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  earningsToday: number;
  tripsToday: number;
  riderTier?: RiderTier;
}

export const RiderEarningsModal: React.FC<RiderEarningsModalProps> = ({
  isOpen,
  onClose,
  earningsToday,
  tripsToday,
  riderTier = 'bronze'
}) => {
  if (!isOpen) return null;

  const tierBonus = riderTier === 'gold' ? 30 : riderTier === 'silver' ? 15 : 0;
  const multiplier = riderTier === 'gold' ? '1.10x' : riderTier === 'silver' ? '1.05x' : '1.00x';

  const trips = [
    { id: 'TRIP-901', rest: 'Behrouz Biryani', fare: 65, tip: 30, surge: 15, time: '17:15', status: 'Delivered' },
    { id: 'TRIP-894', rest: 'Toscano Pizzeria', fare: 55, tip: 20, surge: 10, time: '16:05', status: 'Delivered' },
    { id: 'TRIP-882', rest: 'Burger Seigneur', fare: 70, tip: 0, surge: 25, time: '14:40', status: 'Delivered' },
    { id: 'TRIP-870', rest: 'Meghana Foods', fare: 60, tip: 15, surge: 10, time: '13:10', status: 'Delivered' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 150,
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
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Rider Earnings & Payouts</h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Daily settlements to Bank Account (KA-8921)
            </p>
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

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Earnings Card */}
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #1E1E24 0%, #2ECC71 130%)',
              color: '#FFFFFF',
              padding: '20px',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  TODAY'S TOTAL PAYOUT
                </span>
                <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '4px' }}>₹{earningsToday}</h2>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}
              >
                <Award size={13} color="#FFD700" />
                <span>{riderTier} ({multiplier})</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <div>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>Base Pay</span>
                <span style={{ fontSize: '13px', fontWeight: 800, display: 'block' }}>₹{tripsToday * 40}</span>
              </div>
              <div>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>Surge</span>
                <span style={{ fontSize: '13px', fontWeight: 800, display: 'block' }}>₹{tripsToday * 15}</span>
              </div>
              <div>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>Tier Bonus</span>
                <span style={{ fontSize: '13px', fontWeight: 800, display: 'block', color: '#6EE7B7' }}>+₹{tripsToday * tierBonus}</span>
              </div>
              <div>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>Tips</span>
                <span style={{ fontSize: '13px', fontWeight: 800, display: 'block', color: '#FFD700' }}>₹60</span>
              </div>
            </div>
          </div>

          {/* Trip Passbook */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '10px' }}>
              Today's Trips ({tripsToday} completed)
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800 }}>{trip.rest}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-veg)', fontWeight: 700 }}>
                        ✓ {trip.status}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {trip.time} • Base ₹{trip.fare} + Surge ₹{trip.surge} {trip.tip > 0 ? `+ Tip ₹${trip.tip}` : ''}
                    </span>
                  </div>

                  <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--color-veg)' }}>
                    ₹{trip.fare + trip.surge + trip.tip}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
