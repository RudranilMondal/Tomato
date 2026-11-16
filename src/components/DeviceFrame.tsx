import React, { useState, useEffect } from 'react';
import { useTomattto } from '../context/TomatttoContext';
import { Wifi, Battery } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const { isPhoneFrame } = useTomattto();
  const [time, setTime] = useState('9:41');
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // 1. True Mobile Screens (Pure 100% Edge-to-Edge Native Mobile View)
  if (isMobileScreen) {
    return (
      <div
        className="mobile-app-root"
        style={{
          width: '100%',
          minHeight: '100dvh',
          height: '100dvh',
          backgroundColor: 'var(--color-bg)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {children}
      </div>
    );
  }

  // 2. Desktop Without Phone Frame (Sleek Modern Centered Mobile Card)
  if (!isPhoneFrame) {
    return (
      <div
        style={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg)',
          padding: '24px 16px'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '430px',
            height: 'calc(100vh - 48px)',
            maxHeight: '896px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '28px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // 3. Desktop With Realistic iPhone Frame & Dynamic Island
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
        backgroundColor: 'var(--color-bg)',
        minHeight: '100vh'
      }}
    >
      {/* Outer Titanium Frame */}
      <div
        style={{
          width: '390px',
          height: '844px',
          backgroundColor: '#1E1E24',
          borderRadius: '54px',
          padding: '12px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Screen Bezel */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--color-surface)',
            borderRadius: '44px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: '2px solid rgba(0, 0, 0, 0.8)'
          }}
        >
          {/* Top Status Bar & Dynamic Island */}
          <div
            style={{
              height: '44px',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-surface)',
              position: 'relative',
              zIndex: 90,
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-main)',
              userSelect: 'none'
            }}
          >
            <span>{time}</span>

            {/* Dynamic Island Pill */}
            <div
              style={{
                position: 'absolute',
                top: '9px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '110px',
                height: '28px',
                backgroundColor: '#000000',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                cursor: 'pointer'
              }}
            >
              <img src="/logo.png" alt="G1Bites" style={{ width: '16px', height: '16px', borderRadius: '4px', objectFit: 'cover' }} />
              <span style={{ fontSize: '10.5px', color: '#FF4B3A', fontWeight: 800 }}>G1Bites</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700 }}>5G</span>
              <Wifi size={14} />
              <Battery size={16} />
            </div>
          </div>

          {/* Inner Content Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
            className="no-scrollbar"
          >
            {children}
          </div>

          {/* Bottom iOS Indicator Bar */}
          <div
            style={{
              height: '24px',
              backgroundColor: 'var(--color-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 90
            }}
          >
            <div
              style={{
                width: '130px',
                height: '4px',
                backgroundColor: 'var(--color-text-muted)',
                opacity: 0.4,
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
