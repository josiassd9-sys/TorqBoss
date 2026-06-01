import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
// Importação direta dos recursos do pacote oficial do Firebase Auth:
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { debugLog, debugError } from '../debug';
import { signInWithEmailAndPassword } from 'firebase/auth';

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
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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

  useEffect(() => {
  // 🛠️ INICIALIZAÇÃO CORRIGIDA: Agora com o ID Web Client real obtido do Google Cloud
  GoogleAuth.initialize({
    clientId: '456343787433-f6n6aa5i85o89rjbvvck9hurgtqi5o8f.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  }).catch(err => console.error('Erro na inicialização automática do Google Auth:', err));

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
            const initialCredits = u.email === 'josias.sd9@gmail.com' ? 500 : 100;
            await setDoc(userDocRef, {
              uid: u.uid,
              aiCredits: initialCredits,
              isProMember: u.email === 'josias.sd9@gmail.com' ? true : false,
              transactionHistory: [{ id: 'init-' + Date.now(), date: new Date().toISOString(), amount: initialCredits, description: 'Bônus de Instalação (Cloud)', type: 'credit' }]
            });
            setCredits(initialCredits);
            setIsPro(u.email === 'josias.sd9@gmail.com' ? true : (checkDevOverride() ? true : false));
          } else {
            const data = userDoc.data();
            let userCredits = data.aiCredits !== undefined ? data.aiCredits : 0;
            let userIsPro = data.isProMember || false;

            if (u.email === 'josias.sd9@gmail.com') {
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
            setIsPro(checkDevOverride() ? true : userIsPro);
          }

          // Real-time listener for credits
          const unsubscribeSnapshot = onSnapshot(userDocRef, async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              let snapshotCredits = data.aiCredits !== undefined ? data.aiCredits : 0;
              let snapshotIsPro = data.isProMember || false;

              if (u.email === 'josias.sd9@gmail.com') {
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
              setIsPro(checkDevOverride() ? true : snapshotIsPro);
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
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async () => {
  try {
    debugLog('INICIANDO LOGIN GOOGLE');
    await GoogleAuth.signOut().catch(() => { });
    debugLog('GOOGLE SIGNOUT OK');
    const googleUser: any = await GoogleAuth.signIn();
    debugLog('GOOGLE SIGNIN OK');
    console.log('GOOGLE USER:', googleUser);
    const idToken = googleUser.authentication?.idToken || googleUser.idToken;
    debugLog('TOKEN RECEBIDO');
    if (!idToken) {
      debugError('ID TOKEN NÃO ENCONTRADO');
      throw new Error('ID TOKEN NÃO ENCONTRADO');
    }
    const credential = GoogleAuthProvider.credential(idToken);
    debugLog('CREDENCIAL FIREBASE OK');
    const userCredential = await signInWithCredential(auth, credential);
    debugLog('LOGIN FIREBASE OK');
    console.log('Firebase login OK:', userCredential.user);
    alert('LOGIN GOOGLE REALIZADO COM SUCESSO');
  } catch (error: any) {
    console.error('ERRO GOOGLE LOGIN:', error);
    debugError('ERRO LOGIN GOOGLE:\n' + JSON.stringify(error, null, 2));
    alert('ERRO GOOGLE:\n\n' + JSON.stringify(error, null, 2));
  }
};

// ==================== NOVA FUNÇÃO PARA LOGIN COM EMAIL/SENHA ====================
const loginWithEmailPassword = async (email: string, password: string) => {

  console.log('BOTAO EMAIL CLICADO');

  try {
    debugLog(`TENTANDO LOGIN EMAIL/SENHA para: ${email}`);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    debugLog('LOGIN EMAIL/SENHA OK');
    console.log('Usuário logado com email/senha:', userCredential.user);
    alert(`✅ Login realizado com sucesso como: ${userCredential.user.email}`);
    // Opcional: forçar atualização do estado do usuário (se o auth state listener já estiver configurado)
  } catch (error: any) {
    console.error('ERRO EMAIL/SENHA:', error);
    debugError(`ERRO LOGIN EMAIL/SENHA:\nCódigo: ${error.code}\nMensagem: ${error.message}`);
    alert(`❌ Falha no login com email/senha:\n\n${error.code}\n${error.message}`);
    // Propaga o erro para quem chamou a função, se necessário
    throw error;
  }
};
// ====================================================================

const logout = async () => {
  try {
    await GoogleAuth.signOut();
    await auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const consumeCredit = async () => {
  if (!user) {
    const localCreditsStr = localStorage.getItem('torqboss-local-credits');
    const localCredits = localCreditsStr ? parseInt(localCreditsStr, 10) : 100;
    const newVal = Math.max(0, localCredits - 1);
    localStorage.setItem('torqboss-local-credits', String(newVal));
    setCredits(newVal);
    debugLog(`Crédito consumido offline. Novo saldo local: ${newVal}`);
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
    debugLog(`Crédito local recarregado (${amount}). Novo saldo local: ${newVal}`);
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

