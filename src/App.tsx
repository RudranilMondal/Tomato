import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTomattto } from './context/TomatttoContext';
import { DeviceFrame } from './components/DeviceFrame';
import { CustomerApp } from './components/customer/CustomerApp';
import { EcosystemDock } from './components/EcosystemDock';
import { DemoWalkthroughBar } from './components/DemoWalkthroughBar';
import { RouteLoadingFallback, ErrorBoundary } from './components/common/LoadingFallback';

// Route-level code-splitting for dedicated non-customer application portals
const PartnerApp = lazy(() =>
  import('./components/partner/PartnerApp').then((m) => ({ default: m.PartnerApp }))
);
const RiderApp = lazy(() =>
  import('./components/rider/RiderApp').then((m) => ({ default: m.RiderApp }))
);
const AdminApp = lazy(() =>
  import('./components/admin/AdminApp').then((m) => ({ default: m.AdminApp }))
);
const EcosystemQuadView = lazy(() =>
  import('./components/EcosystemQuadView').then((m) => ({ default: m.EcosystemQuadView }))
);

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
          <Route
            path="/partner"
            element={
              <ErrorBoundary fallbackTitle="Unable to load Restaurant Partner Dashboard">
                <Suspense fallback={<RouteLoadingFallback label="Loading Partner Dashboard..." />}>
                  <PartnerApp />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route path="/restaurant" element={<Navigate to="/partner" replace />} />

          {/* Delivery Rider Partner App */}
          <Route
            path="/rider"
            element={
              <DeviceFrame>
                <ErrorBoundary fallbackTitle="Unable to load Delivery Rider Portal">
                  <Suspense fallback={<RouteLoadingFallback label="Loading Rider Portal..." />}>
                    <RiderApp />
                  </Suspense>
                </ErrorBoundary>
              </DeviceFrame>
            }
          />
          <Route path="/delivery" element={<Navigate to="/rider" replace />} />

          {/* Super Admin & Operations Panel */}
          <Route
            path="/admin"
            element={
              <ErrorBoundary fallbackTitle="Unable to load Admin Operations Console">
                <Suspense fallback={<RouteLoadingFallback label="Loading Admin Console..." />}>
                  <AdminApp />
                </Suspense>
              </ErrorBoundary>
            }
          />

          {/* 360° Live Ecosystem Quad View */}
          <Route
            path="/ecosystem"
            element={
              <ErrorBoundary fallbackTitle="Unable to load Ecosystem Quad View">
                <Suspense fallback={<RouteLoadingFallback label="Initializing Quad-View Simulation..." />}>
                  <EcosystemQuadView />
                </Suspense>
              </ErrorBoundary>
            }
          />
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
