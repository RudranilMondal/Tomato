import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TomatttoProvider } from './context/TomatttoContext';
import './lib/firebase';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <TomatttoProvider>
      <App />
    </TomatttoProvider>
  </React.StrictMode>
);
