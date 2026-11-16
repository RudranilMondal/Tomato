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

import {
  UtensilsCrossed,
  Search,
  ShoppingBag,
  Clock,
  User,
  ArrowRight
} from 'lucide-react';

export const CustomerApp: React.FC = () => {
  const { customerScreen, setCustomerScreen, itemCount, cartTotal, selectedRestaurant } = useTomattto();

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
    {
      id: 'home',
      label: 'Delivery',
      icon: (active: boolean) => <UtensilsCrossed size={19} strokeWidth={active ? 2.5 : 2} />
    },
    {
      id: 'search',
      label: 'Search',
      icon: (active: boolean) => <Search size={19} strokeWidth={active ? 2.5 : 2} />
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: (active: boolean) => <ShoppingBag size={19} strokeWidth={active ? 2.5 : 2} />,
      badge: itemCount
    },
    {
      id: 'orders_history',
      label: 'Orders',
      icon: (active: boolean) => <Clock size={19} strokeWidth={active ? 2.5 : 2} />
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (active: boolean) => <User size={19} strokeWidth={active ? 2.5 : 2} />
    }
  ];

  const showBottomNav =
    customerScreen === 'home' ||
    customerScreen === 'search' ||
    customerScreen === 'orders_history' ||
    customerScreen === 'profile';

  const showFloatingCart =
    itemCount > 0 &&
    (customerScreen === 'home' || customerScreen === 'search' || customerScreen === 'restaurant');

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        minHeight: '100%',
        backgroundColor: 'var(--color-bg)',
        overflow: 'hidden'
      }}
    >
      {/* Active Screen Scrollable View */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain'
        }}
        className="no-scrollbar"
      >
        {renderActiveScreen()}
      </div>

      {/* Floating Mini Cart Strip (Native Zomato-style Quick Cart) */}
      {showFloatingCart && (
        <div
          onClick={() => setCustomerScreen('cart')}
          style={{
            margin: showBottomNav ? '0 12px 10px 12px' : '0 12px max(14px, env(safe-area-inset-bottom)) 12px',
            background: 'linear-gradient(135deg, #FF4B3A 0%, #E03A2A 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(255, 75, 58, 0.4)',
            cursor: 'pointer',
            animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 42,
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px',
                border: '1.5px solid rgba(255, 255, 255, 0.35)'
              }}
            >
              {itemCount}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                ₹{cartTotal}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  opacity: 0.9,
                  maxWidth: '170px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {selectedRestaurant ? selectedRestaurant.name : 'View added items'}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 800,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            <span>View Cart</span>
            <ArrowRight size={14} />
          </div>
        </div>
      )}

      {/* Redesigned Production-Ready Mobile Bottom Navigation Dock */}
      {showBottomNav && (
        <nav
          aria-label="Bottom Navigation"
          style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '6px 8px max(10px, env(safe-area-inset-bottom)) 8px',
            zIndex: 45,
            flexShrink: 0
          }}
        >
          {navTabs.map((tab) => {
            const isActive = customerScreen === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setCustomerScreen(tab.id as any)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  position: 'relative',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  minWidth: '58px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {tab.icon(isActive)}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-9px',
                        backgroundColor: 'var(--color-primary)',
                        color: '#FFFFFF',
                        fontSize: '9.5px',
                        fontWeight: 900,
                        minWidth: '18px',
                        height: '18px',
                        padding: '0 4px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid var(--color-surface)',
                        boxShadow: '0 2px 6px rgba(255, 75, 58, 0.4)'
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: isActive ? 800 : 600,
                    letterSpacing: '-0.01em',
                    lineHeight: 1
                  }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      animation: 'nav-dot-pop 0.25s ease forwards'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Floating Customer Modals */}
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
