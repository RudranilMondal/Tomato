import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTomattto } from './context/TomatttoContext';
import { DeviceFrame } from './components/DeviceFrame';
import { CustomerApp } from './components/customer/CustomerApp';
import { EcosystemDock } from './components/EcosystemDock';
import { DemoWalkthroughBar } from './components/DemoWalkthroughBar';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';
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
const PrivacyPolicyPage = lazy(() =>
  import('./components/legal/LegalPages').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const AccountDeletionPage = lazy(() =>
  import('./components/legal/LegalPages').then((m) => ({ default: m.AccountDeletionPage }))
);
const TermsPage = lazy(() =>
  import('./components/legal/LegalPages').then((m) => ({ default: m.TermsPage }))
);
const SupportPage = lazy(() =>
  import('./components/legal/LegalPages').then((m) => ({ default: m.SupportPage }))
);
const GoogleMobileAuthBridge = lazy(() =>
  import('./components/auth/GoogleMobileAuthBridge').then((m) => ({
    default: m.GoogleMobileAuthBridge
  }))
);

const LEGAL_PATHS = new Set([
  '/privacy-policy',
  '/privacy',
  '/delete-account',
  '/account-deletion',
  '/terms',
  '/support',
  '/contact',
  '/google-mobile-auth'
]);

const LOCKED_PORTAL = (import.meta.env.VITE_APP_PORTAL || '').toLowerCase() as
  | ''
  | 'customer'
  | 'partner'
  | 'rider'
  | 'admin';

/**
 * RouteSync ensures the global TomatttoContext `appMode` state stays in
 * perfect harmony with the active browser URL route.
 */
const RouteSync: React.FC = () => {
  const location = useLocation();
  const { setAppMode } = useTomattto();

  useEffect(() => {
    if (LOCKED_PORTAL) {
      setAppMode(LOCKED_PORTAL);
      return;
    }
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

const PortalRoot: React.FC = () => {
  if (LOCKED_PORTAL === 'partner') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Restaurant Partner Dashboard">
        <Suspense fallback={<RouteLoadingFallback label="Loading Partner Dashboard..." />}>
          <PartnerApp />
        </Suspense>
      </ErrorBoundary>
    );
  }
  if (LOCKED_PORTAL === 'rider') {
    return (
      <DeviceFrame>
        <ErrorBoundary fallbackTitle="Unable to load Delivery Rider Portal">
          <Suspense fallback={<RouteLoadingFallback label="Loading Rider Portal..." />}>
            <RiderApp />
          </Suspense>
        </ErrorBoundary>
      </DeviceFrame>
    );
  }
  if (LOCKED_PORTAL === 'admin') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Admin Operations Console">
        <Suspense fallback={<RouteLoadingFallback label="Loading Admin Console..." />}>
          <AdminApp />
        </Suspense>
      </ErrorBoundary>
    );
  }
  return (
    <DeviceFrame>
      <CustomerApp />
    </DeviceFrame>
  );
};

export const AppContent: React.FC = () => {
  const location = useLocation();
  const isLegalRoute = LEGAL_PATHS.has(location.pathname.toLowerCase());

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

      {/* Modern Floating Desktop Ecosystem Switcher (Hidden on Mobile, Legal Pages & Locked Portals) */}
      {!LOCKED_PORTAL && !isLegalRoute && <EcosystemDock />}

      {/* Main Routed Viewport */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <Routes>
          {/* Customer / Locked Portal Interface */}
          <Route path="/" element={<PortalRoot />} />
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

          {/* Google Play & Legal Compliance Pages */}
          <Route
            path="/privacy-policy"
            element={
              <Suspense fallback={<RouteLoadingFallback label="Loading Privacy Policy..." />}>
                <PrivacyPolicyPage />
              </Suspense>
            }
          />
          <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
          <Route
            path="/delete-account"
            element={
              <Suspense fallback={<RouteLoadingFallback label="Loading Account Deletion..." />}>
                <AccountDeletionPage />
              </Suspense>
            }
          />
          <Route path="/account-deletion" element={<Navigate to="/delete-account" replace />} />
          <Route
            path="/terms"
            element={
              <Suspense fallback={<RouteLoadingFallback label="Loading Terms of Service..." />}>
                <TermsPage />
              </Suspense>
            }
          />
          <Route
            path="/support"
            element={
              <Suspense fallback={<RouteLoadingFallback label="Loading Support & Contact..." />}>
                <SupportPage />
              </Suspense>
            }
          />
          <Route path="/contact" element={<Navigate to="/support" replace />} />
          <Route
            path="/google-mobile-auth"
            element={
              <Suspense fallback={<RouteLoadingFallback label="Connecting to Google..." />}>
                <GoogleMobileAuthBridge />
              </Suspense>
            }
          />

          {/* Fallback to Customer App */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Guided Interactive Demo Bar (Active only when demo is initiated) */}
      <DemoWalkthroughBar />

      {/* Portal-Specific PWA Install Prompt (Hidden when running inside PWA or Native APK) */}
      {!LOCKED_PORTAL && <PwaInstallPrompt />}
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
