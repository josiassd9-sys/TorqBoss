import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
// Importação direta dos recursos do pacote oficial do Firebase Auth:
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
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
  credits: number;
  isPro: boolean;
  consumeCredit: () => Promise<void>;
  addCredits: (amount: number, description: string) => Promise<void>;
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
    } catch (_) {}
    return false;
  });

    useEffect(() => {
    // 🛠️ INICIALIZAÇÃO CORRIGIDA: Agora com o ID Web Client real obtido do Google Cloud
    GoogleAuth.initialize({
      clientId: '718759502049-crb938h7svtdcl205kfu7a5m04ngllpv.apps.googleusercontent.com',
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
      } catch (_) {}
    };

    window.addEventListener('fleetx-developer-pro-changed', handleDevProChange);
    return () => window.removeEventListener('fleetx-developer-pro-changed', handleDevProChange);
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
        } catch (_) {}
        return false;
      };

      if (u) {
        const path = `users/${u.uid}`;
        try {
          const userDocRef = doc(db, 'users', u.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              uid: u.uid,
              aiCredits: 10,
              isProMember: false,
              transactionHistory: [{ id: 'init-' + Date.now(), date: new Date().toISOString(), amount: 10, description: 'Bônus de Instalação (Cloud)', type: 'credit' }]
            });
            setCredits(10);
            setIsPro(checkDevOverride() ? true : false);
          } else {
            const data = userDoc.data();
            setCredits(data.aiCredits || 0);
            setIsPro(checkDevOverride() ? true : (data.isProMember || false));
          }

          // Real-time listener for credits
          const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setCredits(data.aiCredits || 0);
              setIsPro(checkDevOverride() ? true : (data.isProMember || false));
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, path);
          });

          return () => unsubscribeSnapshot();
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }
      } else {
        setCredits(0);
        setIsPro(checkDevOverride() ? true : false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

      const login = async () => {
    try {
      // 1. Abre a gaveta nativa do Android com as contas do Google
      const googleUser = await GoogleAuth.signIn();
      console.log('GOOGLE CAPACITOR USER:', googleUser);

      // 2. Extrai de forma isolada o token de identidade necessário
      const idToken = googleUser.authentication.idToken;

      if (!idToken) {
        throw new Error('O plugin nativo não devolveu um idToken válido.');
      }

      // 3. Monta a credencial estrita para o Firebase Auth (Usando apenas o idToken)
      const credential = GoogleAuthProvider.credential(idToken);

      // 4. Autentica e vincula o usuário na nuvem do Firebase
      const userCredential = await signInWithCredential(auth, credential);
      console.log('Firebase login nativo efetuado:', userCredential.user);

      alert('Login Google efetuado e vinculado com sucesso!');

    } catch (error) {
      console.error('Google login error:', error);
      alert('Erro Login Google: ' + JSON.stringify(error));
    }
  };



  const logout = async () => {
    try {
      await GoogleAuth.signOut();
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const consumeCredit = async () => {
    if (!user) return;
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
    if (!user) return;
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
    <FirebaseContext.Provider value={{ user, loading, login, logout, credits, isPro, consumeCredit, addCredits, upgradeToPro }}>
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
