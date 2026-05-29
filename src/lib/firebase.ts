import { initializeApp } from 'firebase/app';

import {
  getAuth,
  signInWithRedirect,
  getRedirectResult,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';

import type { User } from 'firebase/auth';

import {
  getFirestore,
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

export const db = getFirestore(app);

export const auth = getAuth(app);

debugLog('AUTH E FIRESTORE OK');

export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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