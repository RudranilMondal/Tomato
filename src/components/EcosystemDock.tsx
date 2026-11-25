import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTomattto } from '../context/TomatttoContext';
import {
  Smartphone,
  Store,
  Bike,
  LayoutDashboard,
  LayoutGrid,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export const EcosystemDock: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isDarkMode,
    toggleDarkMode,
    isPhoneFrame,
    setIsPhoneFrame,
    incomingOrder,
    riderDeliveryRequest,
    isDemoActive,
    startDemo
  } = useTomattto();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Determine current active route
  const currentPath = location.pathname.toLowerCase();
  const isCustomer = currentPath === '/' || currentPath === '/customer';
  const isPartner = currentPath.startsWith('/partner') || currentPath.startsWith('/restaurant');
  const isRider = currentPath.startsWith('/rider') || currentPath.startsWith('/delivery');
  const isAdmin = currentPath.startsWith('/admin');
  const isQuad = currentPath.startsWith('/ecosystem') || currentPath.startsWith('/quad');

  const interfaces = [
    {
      id: 'customer',
      label: 'Customer',
      path: '/',
      active: isCustomer,
      icon: <Smartphone size={15} />
    },
    {
      id: 'partner',
      label: 'Partner',
      path: '/partner',
      active: isPartner,
      icon: <Store size={15} />,
      badge: incomingOrder ? '1' : undefined
    },
    {
      id: 'rider',
      label: 'Rider',
      path: '/rider',
      active: isRider,
      icon: <Bike size={15} />,
      badge: riderDeliveryRequest ? '1' : undefined
    },
    {
      id: 'admin',
      label: 'Admin',
      path: '/admin',
      active: isAdmin,
      icon: <LayoutDashboard size={15} />
    },
    {
      id: 'quad',
      label: '360° Live',
      path: '/ecosystem',
      active: isQuad,
      icon: <LayoutGrid size={15} />
    }
  ];

  return (
    <aside
      className="hide-on-mobile"
      aria-label="Ecosystem Switcher"
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '6px'
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 6px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {/* Tomattto Logo / Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface-muted)',
            color: 'var(--color-text-main)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
          title={isCollapsed ? 'Expand Ecosystem Switcher' : 'Collapse Ecosystem Switcher'}
        >
          <img src="/logo.png" alt="Tomattto" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} />
          <span style={{ color: 'var(--color-primary)', letterSpacing: '-0.02em', fontWeight: 800 }}>Tomattto</span>
          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {!isCollapsed && (
          <>
            <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--color-border)', margin: '0 2px' }} />

            {/* Interface route switcher tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {interfaces.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11.5px',
                    fontWeight: item.active ? 800 : 600,
                    backgroundColor: item.active ? 'var(--color-primary)' : 'transparent',
                    color: item.active ? '#FFFFFF' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: item.active ? '0 3px 10px rgba(255, 75, 58, 0.35)' : 'none'
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        backgroundColor: '#FF3B30',
                        color: '#FFFFFF',
                        fontSize: '9px',
                        fontWeight: 900,
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px solid var(--color-surface)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--color-border)', margin: '0 2px' }} />

            {/* Action Buttons: Dark Mode, Phone Frame, Demo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {/* Phone Frame Toggle (active on customer/rider routes) */}
              {(isCustomer || isRider) && (
                <button
                  onClick={() => setIsPhoneFrame(!isPhoneFrame)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isPhoneFrame ? 'var(--color-primary-light)' : 'transparent',
                    color: isPhoneFrame ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    cursor: 'pointer'
                  }}
                  title={isPhoneFrame ? 'Disable Phone Mockup Frame' : 'Enable iPhone Mockup Frame'}
                >
                  <Monitor size={14} />
                </button>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer'
                }}
                title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {isDarkMode ? <Sun size={14} color="#FFB400" /> : <Moon size={14} />}
              </button>

              {/* 5-Min Demo Trigger */}
              <button
                onClick={startDemo}
                style={{
                  padding: '5px 9px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isDemoActive ? 'var(--color-primary-light)' : 'var(--color-surface-muted)',
                  color: isDemoActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
                title="Start Guided Interactive Demo"
              >
                <Sparkles size={12} color="var(--color-primary)" />
                <span>Demo</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

