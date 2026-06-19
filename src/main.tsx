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

async function testConnectivity() {
  try {
    console.log('[NET TEST] google');
    const r1 = await fetch('https://www.google.com');
    console.log('[NET TEST GOOGLE]', r1.status);
  } catch (e: any) {
    console.log('[NET TEST GOOGLE ERROR]', e?.message);
  }

  try {
    console.log('[NET TEST] cloudrun');
    const r2 = await fetch('https://ais-dev-exgrcbouh4ydginh4gncxc-510605507081.us-west2.run.app');
    console.log('[NET TEST CLOUDRUN]', r2.status);
  } catch (e: any) {
    console.log('[NET TEST CLOUDRUN ERROR]', e?.message);
  }
}

void testConnectivity();

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    </ErrorBoundary>
  </StrictMode>,
);

debugLog('REACT RENDER EXECUTADO');