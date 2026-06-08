import React from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { BlocksIcon } from 'lucide-react';

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
  const [gisMonitor, setGisMonitor] = React.useState<any[]>([]);
  const [runtimeErrors, setRuntimeErrors] = React.useState<any[]>([]);
  const [loadedScripts, setLoadedScripts] =
    React.useState<any[]>([]);


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

  React.useEffect(() => {

    const interval = setInterval(() => {

      setGisMonitor(prev => [

        {
          time: new Date().toISOString(),

          windowGoogle:
            typeof (window as any).google !== 'undefined',

          accounts:
            !!(window as any).google?.accounts,

          id:
            !!(window as any).google?.accounts?.id,

          initialize:
            typeof (window as any).google?.accounts?.id?.initialize,

          prompt:
            typeof (window as any).google?.accounts?.id?.prompt,

          renderButton:
            typeof (window as any).google?.accounts?.id?.renderButton

        },

        ...prev.slice(0, 50)

      ]);

    }, 2000);

    return () => clearInterval(interval);

  }, []);

  React.useEffect(() => {

    const handleError = (
      event: ErrorEvent
    ) => {

      setRuntimeErrors(prev => [

        {
          time: new Date().toISOString(),

          type: 'WINDOW_ERROR',

          message: event.message,

          source: event.filename,

          line: event.lineno,

          column: event.colno

        },

        ...prev.slice(0, 100)

      ]);

    };

    const handlePromise = (
      event: PromiseRejectionEvent
    ) => {

      setRuntimeErrors(prev => [

        {
          time: new Date().toISOString(),

          type: 'PROMISE_ERROR',

          message:
            String(event.reason)

        },

        ...prev.slice(0, 100)

      ]);

    };

    window.addEventListener(
      'error',
      handleError
    );

    window.addEventListener(
      'unhandledrejection',
      handlePromise
    );

    return () => {

      window.removeEventListener(
        'error',
        handleError
      );

      window.removeEventListener(
        'unhandledrejection',
        handlePromise
      );

    };

  }, []);

  React.useEffect(() => {

    const updateScripts = () => {

      const scripts =
        Array.from(document.scripts).map(
          s => ({
            src: s.src,
            async: s.async,
            defer: s.defer
          })
        );

      setLoadedScripts(scripts);

    };

    updateScripts();

    const interval =
      setInterval(updateScripts, 3000);

    return () =>
      clearInterval(interval);

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

      const report: Report & any = {
        timestamp: new Date().toISOString(),

        // ======================
        // FIREBASE
        // ======================
        firebase: {
          currentUser: user
            ? {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              providerData: user.providerData,
              providerId: user.providerId,
              providerIds: user.providerData?.map(
                p => p.providerId
              )
            }
            : null,

          authLoaded: auth?.currentUser !== undefined,

          authRaw: auth?.currentUser ?? null,

          tokenInfo: {
            accessTokenExists:
              !!(auth.currentUser as any)?.stsTokenManager?.accessToken,

            refreshTokenExists:
              !!(auth.currentUser as any)?.stsTokenManager?.refreshToken
          }
        },

        // ======================
        // GOOGLE GIS
        // ======================
        googleGIS: {
          windowGoogleExists: typeof (window as any).google !== 'undefined',

          googleObjectType: typeof (window as any).google,

          accountsExists:
            !!(window as any).google?.accounts,

          idExists:
            !!(window as any).google?.accounts?.id,

          oauth2Exists:
            !!(window as any).google?.accounts?.oauth2,

          initializeExists:
            typeof (window as any).google?.accounts?.id?.initialize,

          promptExists:
            typeof (window as any).google?.accounts?.id?.prompt,

          renderButtonExists:
            typeof (window as any).google?.accounts?.id?.renderButton
        },

        // ======================
        // SCRIPTS CARREGADOS
        // ======================
        scripts: Array.from(document.scripts).map((s) => ({
          src: s.src,

          async: s.async,

          defer: s.defer
        })),

        // ======================
        // DOM
        // ======================
        dom: {
          readyState: document.readyState,

          bodyExists: !!document.body,

          headExists: !!document.head,

          title: document.title
        },

        // ======================
        // WINDOW
        // ======================
        windowInfo: {
          href: window.location.href,

          origin: window.location.origin,

          protocol: window.location.protocol,

          hostname: window.location.hostname
        },

        capacitor: {
          isNativePlatform:
            Capacitor.isNativePlatform(),

          platform:
            Capacitor.getPlatform()
        },

        // ======================
        // BROWSER
        // ======================
        browser: {
          userAgent: navigator.userAgent,

          language: navigator.language,

          online: navigator.onLine,

          cookiesEnabled: navigator.cookieEnabled,

          platform: navigator.platform
        },

        // ======================
        // STORAGE
        // ======================
        storage: {
          localStorage: (() => {
            try {
              const testKey = 'debug_storage_test';

              localStorage.setItem(testKey, 'ok');

              const ok =
                localStorage.getItem(testKey) === 'ok';

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

              const ok =
                sessionStorage.getItem(testKey) === 'ok';

              sessionStorage.removeItem(testKey);

              return ok;
            } catch {
              return false;
            }
          })(),

          firebaseKey: (() => {
            try {
              const raw =
                localStorage.getItem('firebase:authUser');

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
              score:
                (checks.local ? 1 : 0) +
                (checks.session ? 1 : 0),

              status:
                checks.local && checks.session
                  ? 'HEALTHY'
                  : checks.local || checks.session
                    ? 'DEGRADED'
                    : 'FAILED'
            };
          })()
        },

        // ======================
        // SISTEMA
        // ======================
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
        <h3 className="font-bold text-sm mb-2">
          Auth Events
        </h3>

        <div className="text-xs font-mono space-y-1 max-h-40 overflow-auto">
          {authEvents.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      </div>

      {/* GOOGLE GIS MONITOR */}
      <div className="bg-gray-50 border rounded-xl p-3">
        <h3 className="font-bold text-sm mb-2">
          Google GIS Monitor
        </h3>

        <div className="text-xs font-mono space-y-1 max-h-64 overflow-auto">
          {gisMonitor.map((e, i) => (
            <div key={i}>
              [{e.time}]
              {' | '}Google={String(e.windowGoogle)}
              {' | '}Accounts={String(e.accounts)}
              {' | '}ID={String(e.id)}
              {' | '}Init={String(e.initialize)}
              {' | '}Prompt={String(e.prompt)}
              {' | '}RenderButton={String(e.renderButton)}
            </div>
          ))}
        </div>
      </div>

      {/* RUNTIME ERRORS */}
      <div className="bg-red-50 border rounded-xl p-3">
        <h3 className="font-bold text-sm mb-2">
          Runtime Errors
        </h3>

        <div className="text-xs font-mono space-y-1 max-h-64 overflow-auto">
          {runtimeErrors.map((e, i) => (
            <div key={i}>
              [{e.time}]
              {' | '}
              {e.type}
              {' | '}
              {e.message}
            </div>
          ))}
        </div>
      </div>

      {/* LOADED SCRIPTS */}
      <div className="bg-blue-50 border rounded-xl p-3">
        <h3 className="font-bold text-sm mb-2">
          Loaded Scripts
        </h3>

        <div className="text-xs font-mono max-h-64 overflow-auto">
          {loadedScripts.map((s, i) => (
            <div key={i}>
              {s.src || '(inline script)'}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DebugCenter;