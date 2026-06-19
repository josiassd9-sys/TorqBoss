import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
// Recursos do Firebase Auth (Web SDK):
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { debugError } from '../debug';

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

  // ==================== AUTH ====================
  login: () => Promise<void>;
  logout: () => Promise<void>;

  loginWithEmailPassword: (
    email: string,
    password: string
  ) => Promise<void>;

  // ==================== PLANOS / CRÉDITOS ====================
  credits: number;
  isPro: boolean;

  consumeCredit: () => Promise<void>;

  addCredits: (
    amount: number,
    description: string
  ) => Promise<void>;

  upgradeToPro: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  const compact = `[FIREBASE] ERRO: ${message.replace(/\s+/g, ' ').trim()} | op=${operationType}${path ? ` | path=${path}` : ''}`;
  console.error(compact);
  throw new Error(compact);
}

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [isPro, setIsPro] = useState(() => {
    try {
      const saved = localStorage.getItem('automaster_ai_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.settings?.isDeveloperOverridePro) {
          return true;
        }
      }
    } catch (_) { }
    return false;
  });
  const lastAuthSummaryRef = useRef('');

  const logAuthSummary = (label: 'login OK' | 'snapshot' | 'logout', nextIsPro: boolean, nextCredits: number) => {
    const summary = `${label}|${nextIsPro}|${nextCredits}`;
    if (summary === lastAuthSummaryRef.current) return;
    lastAuthSummaryRef.current = summary;
    console.log(`[AUTH] ${label} | PRO=${nextIsPro} | créditos=${nextCredits}`);
  };

  useEffect(() => {
  // Persistência automática do Firebase: mantém o usuário logado após fechar o app.
  setPersistence(auth, browserLocalPersistence).catch(console.error);

  const handleDevProChange = () => {
    try {
      const saved = localStorage.getItem('automaster_ai_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        setIsPro(!!parsed?.settings?.isDeveloperOverridePro);
      }
    } catch (_) { }
  };

  window.addEventListener('torqboss-developer-pro-changed', handleDevProChange);
  return () => window.removeEventListener('torqboss-developer-pro-changed', handleDevProChange);
}, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      const checkDevOverride = () => {
        try {
          const saved = localStorage.getItem('automaster_ai_data');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.settings?.isDeveloperOverridePro) {
              return true;
            }
          }
        } catch (_) { }
        return false;
      };

      if (u) {
        const path = `users/${u.uid}`;
        try {
          const userDocRef = doc(db, 'users', u.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            const initialCredits = u.email === 'torqboss@gmail.com' ? 500 : 100;
            await setDoc(userDocRef, {
              uid: u.uid,
              aiCredits: initialCredits,
              isProMember: u.email === 'torqboss@gmail.com' ? true : false,
              transactionHistory: [{ id: 'init-' + Date.now(), date: new Date().toISOString(), amount: initialCredits, description: 'Bônus de Instalação (Cloud)', type: 'credit' }]
            });
            setCredits(initialCredits);
            const nextIsPro = u.email === 'torqboss@gmail.com' ? true : (checkDevOverride() ? true : false);
            setIsPro(nextIsPro);
            logAuthSummary('login OK', nextIsPro, initialCredits);
          } else {
            const data = userDoc.data();
            let userCredits = data.aiCredits !== undefined ? data.aiCredits : 0;
            let userIsPro = data.isProMember || false;

            if (u.email === 'torqboss@gmail.com') {
              userIsPro = true;
              if (userCredits <= 5) {
                userCredits = 500;
                await setDoc(userDocRef, {
                  aiCredits: 500,
                  isProMember: true,
                  transactionHistory: arrayUnion({ id: 'owner-refill-' + Date.now(), date: new Date().toISOString(), amount: 500, description: 'Auto-recarga Proprietário', type: 'credit' })
                }, { merge: true });
              }
            }

            setCredits(userCredits);
            const nextIsPro = userIsPro || checkDevOverride();
            setIsPro(nextIsPro);
            logAuthSummary('login OK', nextIsPro, userCredits);
          }

          // Real-time listener for credits
          const unsubscribeSnapshot = onSnapshot(userDocRef, async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              let snapshotCredits = data.aiCredits !== undefined ? data.aiCredits : 0;
              let snapshotIsPro = data.isProMember || false;

              if (u.email === 'torqboss@gmail.com') {
                snapshotIsPro = true;
                if (snapshotCredits <= 5) {
                  snapshotCredits = 500;
                  await setDoc(userDocRef, {
                    aiCredits: 500,
                    isProMember: true,
                    transactionHistory: arrayUnion({ id: 'owner-refill-snap-' + Date.now(), date: new Date().toISOString(), amount: 500, description: 'Auto-recarga Proprietário (Snap)', type: 'credit' })
                  }, { merge: true }).catch(console.error);
                }
              }

              setCredits(snapshotCredits);
              const nextIsPro = snapshotIsPro || checkDevOverride();
              setIsPro(nextIsPro);
              logAuthSummary('snapshot', nextIsPro, snapshotCredits);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, path);
          });

          return () => unsubscribeSnapshot();
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }
      } else {
        // LocalFirst mode: load credits from localStorage to keep AI functioning offline
        const localCreditsStr = localStorage.getItem('torqboss-local-credits');
        if (localCreditsStr === null) {
          localStorage.setItem('torqboss-local-credits', '100');
          setCredits(100);
        } else {
          setCredits(parseInt(localCreditsStr, 10) || 0);
        }
        setIsPro(checkDevOverride() ? true : false);
        lastAuthSummaryRef.current = '';
        console.log('[AUTH] logout');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async () => {
  try {
    // Login Google NATIVO via plugin Capacitor (funciona dentro da WebView,
    // ao contrário do GIS web que o Android bloqueia).
    // skipNativeAuth: true -> o plugin só obtém a credencial; quem autentica é o JS SDK abaixo.
    const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });

    const idToken = result.credential?.idToken;
    if (!idToken) {
      debugError('ID TOKEN GOOGLE AUSENTE');
      throw new Error('ID TOKEN GOOGLE AUSENTE');
    }

    // Troca o ID Token do Google por uma sessão no Firebase Web SDK.
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
    // onAuthStateChanged cuida do estado/persistência a partir daqui.
  } catch (error: any) {
    console.error(`[AUTH] ERRO: ${error?.message || String(error)}`);
    debugError(`[AUTH] ERRO: ${error?.message || String(error)}`);
    alert('ERRO GOOGLE:\n\n' + (error?.message || JSON.stringify(error, null, 2)));
  }
};

// ==================== NOVA FUNÇÃO PARA LOGIN COM EMAIL/SENHA ====================
const loginWithEmailPassword = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert(`✅ Login realizado com sucesso como: ${userCredential.user.email}`);
    // Opcional: forçar atualização do estado do usuário (se o auth state listener já estiver configurado)
  } catch (error: any) {
    console.error(`[AUTH] ERRO: ${error.code || 'login'} ${error.message || String(error)}`);
    debugError(`[AUTH] ERRO: ${error.code || 'login'} ${error.message || String(error)}`);
    alert(`❌ Falha no login com email/senha:\n\n${error.code}\n${error.message}`);
    // Propaga o erro para quem chamou a função, se necessário
    throw error;
  }
};
// ====================================================================

const logout = async () => {
  try {
    await FirebaseAuthentication.signOut().catch(() => { });
    await auth.signOut();
  } catch (error) {
    console.error(`[AUTH] ERRO: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const consumeCredit = async () => {
  if (!user) {
    const localCreditsStr = localStorage.getItem('torqboss-local-credits');
    const localCredits = localCreditsStr ? parseInt(localCreditsStr, 10) : 100;
    const newVal = Math.max(0, localCredits - 1);
    localStorage.setItem('torqboss-local-credits', String(newVal));
    setCredits(newVal);
    return;
  }
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      aiCredits: increment(-1),
      transactionHistory: arrayUnion({ id: 'use-' + Date.now(), date: new Date().toISOString(), amount: -1, description: 'Uso de IA', type: 'debit' })
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

const addCredits = async (amount: number, description: string) => {
  if (!user) {
    const localCreditsStr = localStorage.getItem('torqboss-local-credits');
    const localCredits = localCreditsStr ? parseInt(localCreditsStr, 10) : 100;
    const newVal = localCredits + amount;
    localStorage.setItem('torqboss-local-credits', String(newVal));
    setCredits(newVal);
    return;
  }
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      aiCredits: increment(amount),
      transactionHistory: arrayUnion({ id: 'add-' + Date.now(), date: new Date().toISOString(), amount, description, type: 'credit' })
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

  const upgradeToPro = async () => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        isProMember: true,
        transactionHistory: arrayUnion({ id: 'pro-' + Date.now(), date: new Date().toISOString(), amount: 0, description: 'Upgrade MEU CARRO PRO', type: 'credit' })
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, login, logout, credits, isPro, consumeCredit, addCredits, upgradeToPro, loginWithEmailPassword }}>
      {children}
    </FirebaseContext.Provider>
  );
};


export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

