import React from 'react';
import { useTomattto } from '../context/TomatttoContext';
import { AppMode } from '../types';
import {
  Smartphone,
  Store,
  Bike,
  LayoutDashboard,
  Moon,
  Sun,
  Play,
  Monitor,
  LayoutGrid
} from 'lucide-react';

export const NavigationHeader: React.FC = () => {
  const {
    appMode,
    setAppMode,
    isDarkMode,
    toggleDarkMode,
    isPhoneFrame,
    setIsPhoneFrame,
    incomingOrder,
    riderDeliveryRequest,
    isDemoActive,
    startDemo
  } = useTomattto();

  const [isMobileScreen, setIsMobileScreen] = React.useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems: { mode: AppMode; label: string; shortLabel: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      mode: 'customer',
      label: 'Customer App',
      shortLabel: 'Customer',
      icon: <Smartphone size={16} />
    },
    {
      mode: 'partner',
      label: 'Restaurant Partner',
      shortLabel: 'Partner',
      icon: <Store size={16} />,
      badge: incomingOrder ? 1 : undefined
    },
    {
      mode: 'rider',
      label: 'Delivery Rider',
      shortLabel: 'Rider',
      icon: <Bike size={16} />,
      badge: riderDeliveryRequest ? 1 : undefined
    },
    {
      mode: 'admin',
      label: 'Admin Panel',
      shortLabel: 'Admin',
      icon: <LayoutDashboard size={16} />
    },
    {
      mode: 'quad_view',
      label: 'Ecosystem 360°',
      shortLabel: '360°',
      icon: <LayoutGrid size={16} />,
      badge: 'LIVE'
    }
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: isMobileScreen ? '8px 12px' : '10px 20px',
        display: 'flex',
        flexWrap: isMobileScreen ? 'wrap' : 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobileScreen ? '8px' : '16px',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
          onClick={() => setAppMode('customer')}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px var(--color-primary-glow)'
            }}
          >
            🍅
          </div>
          <div>
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--color-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}
            >
              Tomattto
            </h1>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-text-muted)'
              }}
            >
              Phase 1 Prototype
            </span>
          </div>
        </div>
      </div>

      {/* Center App Switcher Tabs */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface-muted)',
          padding: '3px',
          borderRadius: 'var(--radius-full)',
          gap: '3px',
          border: '1px solid var(--color-border-subtle)',
          overflowX: 'auto',
          maxWidth: '100%',
          flexShrink: 1,
          order: isMobileScreen ? 3 : 2,
          width: isMobileScreen ? '100%' : 'auto',
          justifyContent: isMobileScreen ? 'flex-start' : 'center'
        }}
      >
        {navItems.map((item) => {
          const isActive = appMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => setAppMode(item.mode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: isMobileScreen ? '6px 10px' : '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: isMobileScreen ? '12px' : '13px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FFFFFF' : 'var(--color-text-main)',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px var(--color-primary-glow)' : 'none',
                position: 'relative',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {item.icon}
              <span>{isMobileScreen ? item.shortLabel : item.label}</span>
              {item.badge && (
                <span
                  style={{
                    backgroundColor: isActive ? '#FFFFFF' : 'var(--color-primary)',
                    color: isActive ? 'var(--color-primary)' : '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 5px',
                    borderRadius: '10px',
                    lineHeight: 1
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls: Guided Demo, Frame Toggle, Dark Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', order: isMobileScreen ? 2 : 3 }}>
        {/* 5-Min Guided Demo Button */}
        <button
          onClick={startDemo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: isDemoActive ? 'var(--color-primary-light)' : 'var(--color-surface)',
            color: 'var(--color-primary)',
            border: '1.5px solid var(--color-primary)',
            padding: isMobileScreen ? '6px 10px' : '7px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Play size={13} fill="currentColor" />
          <span>{isMobileScreen ? 'Demo' : '5-Min Client Demo'}</span>
        </button>

        {/* Mobile Device Frame Toggle (visible in customer & rider app) */}
        {(appMode === 'customer' || appMode === 'rider') && (
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            title={isPhoneFrame ? 'Switch to Full Width' : 'Switch to iPhone Frame'}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isPhoneFrame ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
              color: isPhoneFrame ? 'var(--color-primary)' : 'var(--color-text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isPhoneFrame ? <Smartphone size={18} /> : <Monitor size={18} />}
          </button>
        )}

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-surface-muted)',
            color: 'var(--color-text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
