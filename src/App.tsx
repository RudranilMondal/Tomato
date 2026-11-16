import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTomattto } from './context/TomatttoContext';
import { DeviceFrame } from './components/DeviceFrame';
import { CustomerApp } from './components/customer/CustomerApp';
import { PartnerApp } from './components/partner/PartnerApp';
import { RiderApp } from './components/rider/RiderApp';
import { AdminApp } from './components/admin/AdminApp';
import { EcosystemQuadView } from './components/EcosystemQuadView';
import { EcosystemDock } from './components/EcosystemDock';
import { DemoWalkthroughBar } from './components/DemoWalkthroughBar';

/**
 * RouteSync ensures the global TomatttoContext `appMode` state stays in
 * perfect harmony with the active browser URL route.
 */
const RouteSync: React.FC = () => {
  const location = useLocation();
  const { setAppMode } = useTomattto();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith('/partner') || path.startsWith('/restaurant')) {
      setAppMode('partner');
    } else if (path.startsWith('/rider') || path.startsWith('/delivery')) {
      setAppMode('rider');
    } else if (path.startsWith('/admin')) {
      setAppMode('admin');
    } else if (path.startsWith('/ecosystem') || path.startsWith('/quad')) {
      setAppMode('quad_view');
    } else {
      setAppMode('customer');
    }
  }, [location.pathname, setAppMode]);

  return null;
};

export const AppContent: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg)',
        position: 'relative'
      }}
    >
      {/* Route Synchronization Helper */}
      <RouteSync />

      {/* Modern Floating Desktop Ecosystem Switcher (Hidden on Mobile) */}
      <EcosystemDock />

      {/* Main Routed Viewport */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <Routes>
          {/* Customer Interface (Clean, mobile-ready at root) */}
          <Route
            path="/"
            element={
              <DeviceFrame>
                <CustomerApp />
              </DeviceFrame>
            }
          />
          <Route path="/customer" element={<Navigate to="/" replace />} />

          {/* Restaurant Partner Dashboard */}
          <Route path="/partner" element={<PartnerApp />} />
          <Route path="/restaurant" element={<Navigate to="/partner" replace />} />

          {/* Delivery Rider Partner App */}
          <Route
            path="/rider"
            element={
              <DeviceFrame>
                <RiderApp />
              </DeviceFrame>
            }
          />
          <Route path="/delivery" element={<Navigate to="/rider" replace />} />

          {/* Super Admin & Operations Panel */}
          <Route path="/admin" element={<AdminApp />} />

          {/* 360° Live Ecosystem Quad View */}
          <Route path="/ecosystem" element={<EcosystemQuadView />} />
          <Route path="/quad" element={<Navigate to="/ecosystem" replace />} />

          {/* Fallback to Customer App */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Guided Interactive Demo Bar (Active only when demo is initiated) */}
      <DemoWalkthroughBar />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
