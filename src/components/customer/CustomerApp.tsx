import React, { useState } from 'react';
import { useTomattto } from '../../context/TomatttoContext';
import { SplashOnboarding } from './SplashOnboarding';
import { HomeScreen } from './HomeScreen';
import { SearchScreen } from './SearchScreen';
import { RestaurantDetailScreen } from './RestaurantDetailScreen';
import { CartScreen } from './CartScreen';
import { OrderSuccessScreen } from './OrderSuccessScreen';
import { OrderTrackingScreen } from './OrderTrackingScreen';
import { OrdersHistoryScreen } from './OrdersHistoryScreen';
import { ProfileScreen } from './ProfileScreen';
import { AuthScreen } from './AuthScreen';
import { LocationModal } from './LocationModal';
import { DishCustomizerModal } from './DishCustomizerModal';
import { PaymentModal } from './PaymentModal';

import { Home, Search, ShoppingBag, Clock, User } from 'lucide-react';

export const CustomerApp: React.FC = () => {
  const { customerScreen, setCustomerScreen, itemCount } = useTomattto();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // If splash / onboarding screen or auth
  if (customerScreen === 'splash' || customerScreen === 'onboarding') {
    return <SplashOnboarding />;
  }

  if (customerScreen === 'auth') {
    return <AuthScreen />;
  }

  const renderActiveScreen = () => {
    switch (customerScreen) {
      case 'home':
        return (
          <HomeScreen
            onOpenLocation={() => setIsLocationModalOpen(true)}
            onOpenSearch={() => setCustomerScreen('search')}
          />
        );
      case 'search':
        return <SearchScreen />;
      case 'restaurant':
        return <RestaurantDetailScreen />;
      case 'cart':
        return <CartScreen onOpenPayment={() => setIsPaymentModalOpen(true)} />;
      case 'order_success':
        return <OrderSuccessScreen />;
      case 'order_tracking':
        return <OrderTrackingScreen />;
      case 'orders_history':
        return <OrdersHistoryScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <HomeScreen
            onOpenLocation={() => setIsLocationModalOpen(true)}
            onOpenSearch={() => setCustomerScreen('search')}
          />
        );
    }
  };

  const navTabs = [
    { id: 'home', label: 'Delivery', icon: <Home size={19} /> },
    { id: 'search', label: 'Search', icon: <Search size={19} /> },
    { id: 'cart', label: 'Cart', icon: <ShoppingBag size={19} />, badge: itemCount },
    { id: 'orders_history', label: 'Orders', icon: <Clock size={19} /> },
    { id: 'profile', label: 'Profile', icon: <User size={19} /> }
  ];

  const showBottomNav =
    customerScreen === 'home' ||
    customerScreen === 'search' ||
    customerScreen === 'orders_history' ||
    customerScreen === 'profile';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        backgroundColor: 'var(--color-bg)'
      }}
    >
      {/* Screen View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className="no-scrollbar">
        {renderActiveScreen()}
      </div>

      {/* Persistent Bottom Tab Bar */}
      {showBottomNav && (
        <div
          style={{
            height: '60px',
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 8px',
            zIndex: 45
          }}
        >
          {navTabs.map((tab) => {
            const isActive =
              (tab.id === 'home' && customerScreen === 'home') ||
              (tab.id === 'search' && customerScreen === 'search') ||
              (tab.id === 'orders_history' && customerScreen === 'orders_history') ||
              (tab.id === 'profile' && customerScreen === 'profile') ||
              (tab.id === 'cart' && (customerScreen as string) === 'cart');

            return (
              <button
                key={tab.id}
                onClick={() => setCustomerScreen(tab.id as any)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  position: 'relative',
                  padding: '6px 12px'
                }}
              >
                <div style={{ position: 'relative' }}>
                  {tab.icon}
                  {/* Fix #1 — Active indicator dot below icon */}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)',
                        animation: 'nav-dot-pop 0.25s ease forwards'
                      }}
                    />
                  )}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-8px',
                        backgroundColor: 'var(--color-primary)',
                        color: '#FFFFFF',
                        fontSize: '9px',
                        fontWeight: 800,
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', fontWeight: isActive ? 800 : 500 }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Modals */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <DishCustomizerModal />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
};
