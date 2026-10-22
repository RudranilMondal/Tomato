import React from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Moon
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, setCustomerScreen, isDarkMode, toggleDarkMode } = useTomattto();

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <button
          onClick={() => setCustomerScreen('home')}
          style={{
            padding: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface-muted)',
            display: 'flex',
            color: 'var(--color-text-main)'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <h3 style={{ fontSize: '15px', fontWeight: 800 }}>My Account</h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="no-scrollbar">
        {/* User Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--color-primary)'
            }}
          >
            <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800 }}>{user.name}</h4>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{user.phone}</p>
            <span
              style={{
                display: 'inline-block',
                marginTop: '4px',
                fontSize: '10px',
                fontWeight: 800,
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-light)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              🍅 Tomattto Gold Member
            </span>
          </div>
        </div>

        {/* Menu list */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            marginBottom: '16px'
          }}
        >
          {[
            {
              icon: <MapPin size={18} color="var(--color-primary)" />,
              title: 'Saved Addresses',
              subtitle: '2 saved addresses (Home, Work)',
              action: () => {}
            },
            {
              icon: <CreditCard size={18} color="#27AE60" />,
              title: 'Tomattto Credits & Wallet',
              subtitle: '₹150 balance available',
              action: () => {}
            },
            {
              icon: <Moon size={18} color="#9B59B6" />,
              title: 'Dark Mode',
              subtitle: isDarkMode ? 'Enabled' : 'Disabled',
              action: toggleDarkMode
            },
            {
              icon: <Bell size={18} color="#E67E22" />,
              title: 'Notifications',
              subtitle: 'Offers, order alerts & updates',
              action: () => {}
            },
            {
              icon: <HelpCircle size={18} color="#3498DB" />,
              title: 'Help & 24x7 Support',
              subtitle: 'FAQs, chat with support team',
              action: () => {}
            }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: idx < 4 ? '1px solid var(--color-border-subtle)' : 'none',
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>{item.title}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{item.subtitle}</span>
              </div>
              <ChevronRight size={16} color="var(--color-text-muted)" />
            </div>
          ))}
        </div>

        {/* Version info */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Tomattto v1.0.0 (Phase 1 Demo Build)
          </span>
        </div>
      </div>
    </div>
  );
};
