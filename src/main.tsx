import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

import './index.css';
import './i18n/config';

import { FirebaseProvider } from './contexts/FirebaseContext';

import { initDebugOverlay, debugLog } from './debug';

import { ErrorBoundary } from './ErrorBoundary';

initDebugOverlay();

debugLog('MAIN.TSX INICIADO');

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento ROOT não encontrado');
}

debugLog('ROOT ENCONTRADO');

createRoot(rootElement).render(
  <ErrorBoundary>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </ErrorBoundary>
);

debugLog('REACT RENDER EXECUTADO');
