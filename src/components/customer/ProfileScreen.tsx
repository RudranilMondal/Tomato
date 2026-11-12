import React, { useState } from 'react';
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
  Moon,
  Heart,
  Gift,
  Tag,
  Edit3,
  Bike
} from 'lucide-react';
import { SavedAddressesModal } from './SavedAddressesModal';
import { WalletModal } from './WalletModal';
import { NotificationsModal } from './NotificationsModal';
import { SupportModal } from './SupportModal';
import { OffersModal } from './OffersModal';
import { ReferEarnModal } from './ReferEarnModal';
import { EditProfileModal } from './EditProfileModal';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    userAddresses,
    walletBalance,
    favorites,
    setCustomerScreen,
    isDarkMode,
    toggleDarkMode,
    isLoggedIn,
    logoutUser,
    setAppMode
  } = useTomattto();

  const [isSavedAddressesOpen, setIsSavedAddressesOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [isReferEarnOpen, setIsReferEarnOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const menuItems = [
    {
      icon: <MapPin size={18} color="var(--color-primary)" />,
      title: 'Saved Addresses',
      subtitle: `${userAddresses.length} saved addresses (${userAddresses.map((a) => a.label).join(', ')})`,
      action: () => setIsSavedAddressesOpen(true)
    },
    {
      icon: <Tag size={18} color="#FF4B3A" />,
      title: 'Offers, Coupons & Promos',
      subtitle: 'Exclusive discounts, coupon codes & rebates',
      action: () => setIsOffersOpen(true)
    },
    {
      icon: <Gift size={18} color="#E67E22" />,
      title: 'Refer & Earn',
      subtitle: 'Invite friends & get ₹100 instant wallet credits',
      action: () => setIsReferEarnOpen(true)
    },
    {
      icon: <CreditCard size={18} color="#27AE60" />,
      title: 'Tomattto Credits & Wallet',
      subtitle: `₹${walletBalance} available balance • Top-up & passbook`,
      action: () => setIsWalletOpen(true)
    },
    {
      icon: <Heart size={18} color="#E74C3C" />,
      title: 'Favorite Restaurants',
      subtitle: `${favorites.length} curated favorite food spots`,
      action: () => setCustomerScreen('home')
    },
    {
      icon: <Moon size={18} color="#9B59B6" />,
      title: 'Dark Mode',
      subtitle: isDarkMode ? 'Enabled (Midnight mode)' : 'Disabled (Warm mode)',
      action: toggleDarkMode
    },
    {
      icon: <Bell size={18} color="#E67E22" />,
      title: 'Notification Center',
      subtitle: 'Flash deals, order updates & alerts',
      action: () => setIsNotificationsOpen(true)
    },
    {
      icon: <HelpCircle size={18} color="#3498DB" />,
      title: 'Help & 24x7 Concierge Support',
      subtitle: 'FAQs, refund policy & live AI chat',
      action: () => setIsSupportOpen(true)
    },
    {
      icon: <Bike size={18} color="var(--color-primary)" />,
      title: 'Become a Delivery Partner',
      subtitle: 'Earn up to ₹35,000/month with flexible shifts & insurance',
      action: () => setAppMode('rider')
    },
    {
      icon: <LogOut size={18} color="var(--color-primary)" />,
      title: 'Log Out',
      subtitle: 'Sign out of your Tomattto account',
      action: () => setIsLogoutModalOpen(true),
      isDanger: true
    }
  ];

  if (!isLoggedIn) {
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
          <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Account</h3>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 24px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              marginBottom: '18px',
              boxShadow: '0 8px 24px var(--color-primary-glow)'
            }}
          >
            🔒
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Log in to view account
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px', maxWidth: '260px', lineHeight: 1.5 }}>
            Access saved addresses, track live orders, unlock Tomattto Gold benefits and coupons!
          </p>

          <button
            onClick={() => setCustomerScreen('auth')}
            style={{
              marginTop: '24px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              padding: '14px 32px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: '15px',
              boxShadow: 'var(--shadow-glow)',
              width: '100%',
              maxWidth: '260px',
              cursor: 'pointer'
            }}
          >
            Log In / Sign Up
          </button>

          <button
            onClick={() => setCustomerScreen('home')}
            style={{
              marginTop: '14px',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              cursor: 'pointer'
            }}
          >
            Explore Restaurants as Guest
          </button>
        </div>
      </div>
    );
  }

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

          <button
            onClick={() => setIsEditProfileOpen(true)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-muted)',
              color: 'var(--color-text-main)',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid var(--color-border)',
              cursor: 'pointer'
            }}
            title="Edit Profile Info"
          >
            <Edit3 size={13} color="var(--color-primary)" />
            <span>Edit</span>
          </button>
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
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: idx < menuItems.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
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
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'block',
                    color: item.isDanger ? 'var(--color-primary)' : 'var(--color-text-main)'
                  }}
                >
                  {item.title}
                </span>
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

      {/* Sub-modals */}
      <SavedAddressesModal
        isOpen={isSavedAddressesOpen}
        onClose={() => setIsSavedAddressesOpen(false)}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <OffersModal
        isOpen={isOffersOpen}
        onClose={() => setIsOffersOpen(false)}
      />

      <ReferEarnModal
        isOpen={isReferEarnOpen}
        onClose={() => setIsReferEarnOpen(false)}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Logout Confirmation Bottom Sheet Modal */}
      {isLogoutModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '430px',
              padding: '24px 20px',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.25s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 75, 58, 0.12)',
                  color: 'var(--color-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}
              >
                <LogOut size={26} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                Log out of Tomattto?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                You will need to sign in again to place food orders and view order history.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-muted)',
                  color: 'var(--color-text-main)',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  logoutUser();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '14px',
                  boxShadow: 'var(--shadow-glow)',
                  cursor: 'pointer'
                }}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
