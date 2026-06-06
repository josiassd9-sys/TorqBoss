import { initializeApp } from 'firebase/app';

import {
  getAuth,
  onAuthStateChanged
} from 'firebase/auth';

import type { User } from 'firebase/auth';

import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  increment,
  arrayUnion
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';

import { debugLog, debugError } from '../debug';

debugLog('INICIANDO FIREBASE');

let app;

try {

  app = initializeApp(firebaseConfig);

  debugLog('FIREBASE INITIALIZE OK');

} catch (err: any) {

  debugError(`FIREBASE INIT ERROR: ${err?.message}`);

  throw err;
}

// experimentalForceLongPolling: o WebChannel/streaming padrão do Firestore costuma
// ser bloqueado dentro da WebView do Android ("client is offline"); long-polling resolve.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const auth = getAuth(app);

debugLog('AUTH E FIRESTORE OK');

export {
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  increment,
  arrayUnion
};

export type { User };
