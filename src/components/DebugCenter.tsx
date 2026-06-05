import React from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

type Report = {
  timestamp: string;
  firebase: any;
  browser: any;
  storage: any;
  system: any;
};

export const DebugCenter: React.FC = () => {
  const [output, setOutput] = React.useState<string>('');
  const collectSystemReport = () => {
    return {
      timestamp: new Date().toISOString(),

      firebase: {
        user: auth.currentUser ? {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          provider: auth.currentUser.providerData
        } : null
      },

      runtime: {
        nodeEnv: import.meta.env.MODE,
        version: 'TorqBoss Debug Center PRO v1'
      },

      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        online: navigator.onLine
      },

      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio
      },

      storage: {
        firebaseAuth: localStorage.getItem('firebase:authUser'),
        appData: localStorage.getItem('automaster_ai_data')
      }
    };
  };

  const [events, setEvents] = React.useState<string[]>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prev => [
        `[${new Date().toISOString()}] heartbeat OK`,
        ...prev.slice(0, 20)
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const [user, setUser] = React.useState<User | null>(null);
  const [authEvents, setAuthEvents] = React.useState<string[]>([]);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthEvents((prev) => [
        `[${new Date().toISOString()}] auth change: ${u?.email || 'null'}`,
        ...prev
      ]);
    });

    return () => unsub();
  }, []);

  const detectWebView = () => {
    const ua = navigator.userAgent;
    return /wv|WebView|Android.*Version\/\d/.test(ua);
  };

  const runDiagnostic = async () => {
    setRunning(true);

    try {
      const events: string[] = [];
      const logEvent = (msg: string) => {
        events.push(`[${new Date().toISOString()}] ${msg}`);
      };

      const storageTestKey = 'debug_storage_test';
      localStorage.setItem(storageTestKey, 'ok');
      const storageOk = localStorage.getItem(storageTestKey) === 'ok';
      localStorage.removeItem(storageTestKey);

      const report: Report = {
        timestamp: new Date().toISOString(),

        firebase: {
          currentUser: user
            ? {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              providerData: user.providerData,
              providerId: user.providerId
            }
            : null,
          authLoaded: auth?.currentUser !== undefined,
          authRaw: auth?.currentUser ?? null
        },

        browser: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          online: navigator.onLine,
          cookiesEnabled: navigator.cookieEnabled,
          platform: navigator.platform
        },

        storage: {
          localStorage: (() => {
            try {
              const testKey = 'debug_storage_test';
              localStorage.setItem(testKey, 'ok');
              const ok = localStorage.getItem(testKey) === 'ok';
              localStorage.removeItem(testKey);
              return ok;
            } catch {
              return false;
            }
          })(),

          sessionStorage: (() => {
            try {
              const testKey = 'debug_session_test';
              sessionStorage.setItem(testKey, 'ok');
              const ok = sessionStorage.getItem(testKey) === 'ok';
              sessionStorage.removeItem(testKey);
              return ok;
            } catch {
              return false;
            }
          })(),

          firebaseKey: (() => {
            try {
              const raw = localStorage.getItem('firebase:authUser');
              return raw ? 'EXISTS' : 'NULL';
            } catch {
              return 'ERROR';
            }
          })(),

          storageHealth: (() => {
            const checks = {
              local: (() => {
                try {
                  localStorage.setItem('__t', '1');
                  localStorage.removeItem('__t');
                  return true;
                } catch {
                  return false;
                }
              })(),
              session: (() => {
                try {
                  sessionStorage.setItem('__t', '1');
                  sessionStorage.removeItem('__t');
                  return true;
                } catch {
                  return false;
                }
              })()
            };

            return {
              score: (checks.local ? 1 : 0) + (checks.session ? 1 : 0),
              status:
                checks.local && checks.session ? 'HEALTHY'
                  : checks.local || checks.session ? 'DEGRADED'
                    : 'FAILED'
            };
          })()
        },

        system: {
          isWebView: detectWebView(),
          screen: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      };

      setOutput(JSON.stringify(report, null, 2));
    } catch (err: any) {
      setOutput(
        JSON.stringify(
          {
            error: err?.message,
            stack: err?.stack
          },
          null,
          2
        )
      );
    } finally {
      setRunning(false);
    }
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    alert('Debug copiado');
  };

  const downloadReport = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `debug_report_${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="text-xl font-black">🔥 Debug Center PRO</h2>
        <p className="text-sm text-gray-500">
          Diagnóstico completo do Firebase + WebView + Storage + Sistema
        </p>

        <div className="mt-2 text-xs text-gray-600">
          <strong>Auth atual:</strong> {user?.email || 'NÃO LOGADO'}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={runDiagnostic}
          className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold"
        >
          {running ? 'Rodando...' : 'Executar Diagnóstico'}
        </button>

        <button
          onClick={copyOutput}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white font-bold"
        >
          Copiar
        </button>

        <button
          onClick={downloadReport}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold"
        >
          Download
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">

        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
          <p className="text-xs font-bold">Firebase</p>
          <p className="text-xs">
            {auth.currentUser ? 'ONLINE' : 'OFFLINE'}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <p className="text-xs font-bold">Screen</p>
          <p className="text-xs">
            {window.innerWidth}x{window.innerHeight}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
          <p className="text-xs font-bold">Auth</p>
          <p className="text-xs">
            {auth.currentUser?.email || 'guest'}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <p className="text-xs font-bold">Status</p>
          <p className="text-xs">
            Debug Active
          </p>
        </div>

      </div>

      {/* OUTPUT */}
      <textarea
        value={output}
        readOnly
        className="w-full h-[420px] border rounded-lg p-4 font-mono text-xs"
      />

      {/* AUTH EVENTS */}
      <div className="bg-gray-50 border rounded-xl p-3">
        <h3 className="font-bold text-sm mb-2">Auth Events</h3>
        <div className="text-xs font-mono space-y-1 max-h-40 overflow-auto">
          {authEvents.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      </div>

    </div>
  );
};
