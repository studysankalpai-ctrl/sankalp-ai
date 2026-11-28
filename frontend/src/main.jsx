import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register PWA Service Worker for Mobile App Installation & Offline Caching
if ('serviceWorker' in navigator) {
  const registerSw = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[SANKALP AI PWA] Service Worker active:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SANKALP AI PWA] Service Worker registration failed:', err);
      });
  };

  if (document.readyState === 'complete') {
    registerSw();
  } else {
    window.addEventListener('load', registerSw);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
