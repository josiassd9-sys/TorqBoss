import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider, signInWithPopup, onAuthStateChanged, User, doc, getDoc, setDoc, onSnapshot, increment, arrayUnion } from '../lib/firebase';

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
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      
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
            setIsPro(false);
          } else {
            const data = userDoc.data();
            setCredits(data.aiCredits || 0);
            setIsPro(data.isProMember || false);
          }

          // Real-time listener for credits
          const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setCredits(data.aiCredits || 0);
              setIsPro(data.isProMember || false);
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
        setIsPro(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
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
