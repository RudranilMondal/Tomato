import React, { useState, useEffect } from 'react';
import { useTomattto } from '../context/TomatttoContext';
import { Wifi, Battery } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const { isPhoneFrame } = useTomattto();
  const [time, setTime] = useState('9:41');
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 540);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 540);
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

  if (!isPhoneFrame || isMobileScreen) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: isMobileScreen ? '100%' : '480px',
          margin: '0 auto',
          minHeight: 'calc(100vh - 65px)',
          backgroundColor: 'var(--color-surface)',
          boxShadow: isMobileScreen ? 'none' : 'var(--shadow-md)',
          position: 'relative'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '28px 16px 40px',
        backgroundColor: 'var(--color-bg)',
        minHeight: 'calc(100vh - 65px)'
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
              <span style={{ fontSize: '13px' }}>🍅</span>
              <span style={{ fontSize: '10px', color: '#FF4B3A', fontWeight: 700 }}>Tomattto</span>
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
