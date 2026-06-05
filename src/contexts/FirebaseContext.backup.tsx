import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { debugLog, debugError } from '../debug';
import { devopsBus } from '../components/devops/eventBus';

import {
  auth,
  db,
  onAuthStateChanged,
  User,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  increment,
  arrayUnion
} from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirebaseContextType {
  user: User | null;
  loading: boolean;

  login: () => Promise<void>;
  logout: () => Promise<void>;

  loginWithEmailPassword: (email: string, password: string) => Promise<void>;

  credits: number;
  isPro: boolean;

  consumeCredit: () => Promise<void>;
  addCredits: (amount: number, description: string) => Promise<void>;
  upgradeToPro: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error:', error);
  throw error;
}

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const loginInProgressRef = React.useRef(false);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [isPro, setIsPro] = useState(false);

  const checkDevOverride = () => {
    try {
      const saved = localStorage.getItem('automaster_ai_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!parsed?.settings?.isDeveloperOverridePro;
      }
    } catch (_) { }
    return false;
  };

  // ================= AUTH LISTENER =================
  useEffect(() => {
    setLoading(true);

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // ================= FIRESTORE USER SYNC =================
  useEffect(() => {
    if (!user) {
      setCredits(0);
      setIsPro(checkDevOverride());
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);

    const loadUser = async () => {
      try {
        const userDoc = await getDoc(userDocRef);

        const devOverride = checkDevOverride();

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            aiCredits: 10,
            isProMember: false,
            transactionHistory: [
              {
                id: 'init-' + Date.now(),
                date: new Date().toISOString(),
                amount: 10,
                description: 'Bônus de Instalação (Cloud)',
                type: 'credit'
              }
            ]
          });

          setCredits(10);
          setIsPro(devOverride);
        } else {
          const data = userDoc.data();
          setCredits(data.aiCredits || 0);
          setIsPro(devOverride ? true : (data.isProMember || false));
        }

        const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setCredits(data.aiCredits || 0);
            setIsPro(checkDevOverride() ? true : (data.isProMember || false));
          }
        });

        return unsubscribeSnapshot;

      } catch (error) {
        console.error(error);
      }
    };

    loadUser();
  }, [user]);

  // ================= LOGIN GOOGLE (GIS) =================
  const login = async () => {
    if (loginInProgressRef.current) return;

    loginInProgressRef.current = true;

    try {
      debugLog('INICIANDO LOGIN GOOGLE (GIS)');

      const google = (window as any).google;

      alert(
        'WINDOW.GOOGLE = ' + (!!google) +
        '\n\nREADY = ' + document.readyState +
        '\n\nURL = ' + window.location.href
      );

      if (!google) {

        const scripts = Array.from(document.scripts)
          .map((s: any) => s.src)
          .join('\n');

        alert(
          'GIS NAO CARREGADO\n\n' +
          scripts
        );

        throw new Error('GIS NAO CARREGADO');
      }

      const response: any = await new Promise((resolve, reject) => {
        google.accounts.id.initialize({
          client_id: '456343787433-bl4ee0bb3b5snacsgu47i3ok94gbgg2s.apps.googleusercontent.com',
          callback: resolve
        });

        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('LOGIN CANCELADO'));
          }
        });
      });

      const idToken = response?.credential;

      if (!idToken) throw new Error('ID TOKEN NAO ENCONTRADO');

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);

      debugLog('LOGIN FIREBASE OK');
      alert('LOGIN GOOGLE REALIZADO COM SUCESSO');

    } catch (error) {
      console.error(error);
      debugError(JSON.stringify(error));
      alert('ERRO LOGIN GOOGLE');
    } finally {
      loginInProgressRef.current = false;
    }
  };

  // ================= LOGIN EMAIL =================
  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      debugLog('LOGIN EMAIL OK');
      console.log(userCredential.user);
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    await auth.signOut();
  };

  // ================= CREDITOS =================
  const consumeCredit = async () => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, {
      aiCredits: increment(-1),
      transactionHistory: arrayUnion({
        id: 'use-' + Date.now(),
        date: new Date().toISOString(),
        amount: -1,
        description: 'Uso de IA',
        type: 'debit'
      })
    }, { merge: true });
  };

  const addCredits = async (amount: number, description: string) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);

    await setDoc(ref, {
      aiCredits: increment(amount),
      transactionHistory: arrayUnion({
        id: 'add-' + Date.now(),
        date: new Date().toISOString(),
        amount,
        description,
        type: 'credit'
      })
    }, { merge: true });
  };

  const upgradeToPro = async () => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);

    await setDoc(ref, {
      isProMember: true,
      transactionHistory: arrayUnion({
        id: 'pro-' + Date.now(),
        date: new Date().toISOString(),
        amount: 0,
        description: 'Upgrade PRO',
        type: 'credit'
      })
    }, { merge: true });
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        loginWithEmailPassword,
        credits,
        isPro,
        consumeCredit,
        addCredits,
        upgradeToPro
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within provider');
  return context;
};