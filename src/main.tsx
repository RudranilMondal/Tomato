import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { TomatttoProvider } from './context/TomatttoContext';
import './lib/firebase';
import './index.css';

if ('serviceWorker' in navigator && !(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore SW registration errors in unsupported environments
    });
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <TomatttoProvider>
        <App />
      </TomatttoProvider>
    </BrowserRouter>
  </React.StrictMode>
);
