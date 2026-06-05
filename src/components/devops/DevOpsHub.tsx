import React from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type Log = {
  time: string;
  type: 'auth' | 'system' | 'storage' | 'action';
  message: string;
};

export const DevOpsHub: React.FC = () => {
  const [user, setUser] = React.useState<any>(null);
  const [logs, setLogs] = React.useState<Log[]>([]);
  const [storageSnapshot, setStorageSnapshot] = React.useState<any>({});

  // 🔥 LIVE AUTH MONITOR
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);

      pushLog('auth', u ? `Login: ${u.email}` : 'Logout detectado');
    });

    return () => unsub();
  }, []);

  const pushLog = (type: Log['type'], message: string) => {
    setLogs((prev) => [
      {
        time: new Date().toISOString(),
        type,
        message
      },
      ...prev
    ]);
  };

  // 🔥 SNAPSHOT STORAGE
  const inspectStorage = () => {
    const data: any = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }

    setStorageSnapshot(data);
    pushLog('storage', 'Snapshot do localStorage capturado');
  };

  // 🔥 SYSTEM HEALTH CHECK
  const runHealthCheck = () => {
    pushLog('system', `Online: ${navigator.onLine}`);
    pushLog('system', `UserAgent: ${navigator.userAgent}`);

    const memory = (performance as any)?.memory;
    if (memory) {
      pushLog(
        'system',
        `Heap: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`
      );
    }
  };

  const copyFullDiagnostic = async () => {
    try {
      const diagnostic = {
        timestamp: new Date().toISOString(),

        user: user
          ? {
            uid: user.uid,
            email: user.email
          }
          : null,

        firebase: {
          loggedIn: !!user,
          currentUser: auth.currentUser
            ? {
              uid: auth.currentUser.uid,
              email: auth.currentUser.email
            }
            : null
        },

        browser: {
          online: navigator.onLine,
          userAgent: navigator.userAgent,
          language: navigator.language
        },

        storage: storageSnapshot,

        logs
      };

      await navigator.clipboard.writeText(
        JSON.stringify(diagnostic, null, 2)
      );

      pushLog('action', 'Diagnóstico completo copiado');
      alert('Diagnóstico copiado com sucesso');
    } catch (err: any) {
      pushLog(
        'action',
        `Falha ao copiar diagnóstico: ${err?.message}`
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-black text-white p-5 rounded-xl">
        <h2 className="text-xl font-black">🔥 DevOps Console</h2>
        <p className="text-xs opacity-70">
          Infra interna estilo Firebase Console
        </p>

        <div className="mt-2 text-xs">
          User: {user?.email || 'NOT LOGGED'}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2">
        <button onClick={inspectStorage} className="px-3 py-2 bg-blue-600 text-white rounded">
          Inspect Storage
        </button>

        <button onClick={runHealthCheck} className="px-3 py-2 bg-green-600 text-white rounded">
          Health Check
        </button>

        <button
          onClick={copyFullDiagnostic}
          className="px-3 py-2 bg-gray-800 text-white rounded"
        >
          Copy Diagnostic
        </button>

        <button
          onClick={() => setLogs([])}
          className="px-3 py-2 bg-red-600 text-white rounded"
        >
          Clear Logs
        </button>
      </div>

      {/* LIVE LOG STREAM */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-xl h-[300px] overflow-auto font-mono text-xs">
        {logs.map((log, i) => (
          <div key={i}>
            [{log.time}] [{log.type}] {log.message}
          </div>
        ))}
      </div>

      {/* STORAGE INSPECTOR */}
      <div className="bg-white border rounded-xl p-4">
        <h3 className="font-black mb-2">Storage Inspector</h3>

        <pre className="text-xs overflow-auto">
          {JSON.stringify(storageSnapshot, null, 2)}
        </pre>
      </div>

    </div>
  );
};
