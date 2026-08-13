import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';

window.addEventListener('unhandledrejection', (e) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled rejection:', e.reason);
});

window.addEventListener('error', (e) => {
  // eslint-disable-next-line no-console
  console.error('Window error:', e.error || e.message);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    <Toaster position="top-right" />
  </BrowserRouter>,
);
