import React from 'react';
import { useTomattto } from './context/TomatttoContext';
import { NavigationHeader } from './components/NavigationHeader';
import { DeviceFrame } from './components/DeviceFrame';
import { CustomerApp } from './components/customer/CustomerApp';
import { PartnerApp } from './components/partner/PartnerApp';
import { RiderApp } from './components/rider/RiderApp';
import { AdminApp } from './components/admin/AdminApp';
import { DemoWalkthroughBar } from './components/DemoWalkthroughBar';

export const AppContent: React.FC = () => {
  const { appMode } = useTomattto();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Universal Ecosystem Header */}
      <NavigationHeader />

      {/* Main View Port */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {appMode === 'customer' && (
          <DeviceFrame>
            <CustomerApp />
          </DeviceFrame>
        )}

        {appMode === 'partner' && <PartnerApp />}

        {appMode === 'rider' && (
          <DeviceFrame>
            <RiderApp />
          </DeviceFrame>
        )}

        {appMode === 'admin' && <AdminApp />}
      </main>

      {/* 5-Minute Guided Demo floating assistant */}
      <DemoWalkthroughBar />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
