import React from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

/**
 * DebugCenter — "caixa-preta" embutida no APK.
 * Diagnostica por que o Google Identity Services (GIS) pode não carregar
 * dentro da WebView do Android, sem depender de Logcat/Android Studio.
 */

const g = () => (window as any).google;

function buildReport(user: User | null) {
  return {
    timestamp: new Date().toISOString(),

    location: {
      href: window.location.href,
      origin: window.location.origin,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
    },

    document: {
      readyState: document.readyState,
      title: document.title,
      bodyExists: !!document.body,
      headExists: !!document.head,
    },

    capacitor: {
      isNativePlatform: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
    },

    navigator: {
      onLine: navigator.onLine,
      userAgent: navigator.userAgent,
    },

    googleGIS: {
      windowGoogleExists: !!g(),
      accountsExists: !!g()?.accounts,
      idExists: !!g()?.accounts?.id,
      oauth2Exists: !!g()?.accounts?.oauth2,
      initializeType: typeof g()?.accounts?.id?.initialize,
      promptType: typeof g()?.accounts?.id?.prompt,
      renderButtonType: typeof g()?.accounts?.id?.renderButton,
    },

    scripts: Array.from(document.scripts).map((s) => ({
      src: s.src || '(inline)',
      async: s.async,
      defer: s.defer,
    })),

    firebase: {
      currentUser: user
        ? {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            providerIds: user.providerData?.map((p) => p.providerId),
          }
        : null,
      tokenInfo: {
        accessTokenExists: !!(auth.currentUser as any)?.stsTokenManager?.accessToken,
        refreshTokenExists: !!(auth.currentUser as any)?.stsTokenManager?.refreshToken,
      },
    },
  };
}

export const DebugCenter: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [report, setReport] = React.useState<any>(null);
  const [copied, setCopied] = React.useState(false);

  const [gisMonitor, setGisMonitor] = React.useState<any[]>([]);
  const [runtimeErrors, setRuntimeErrors] = React.useState<string[]>([]);
  const [loadedScripts, setLoadedScripts] = React.useState<any[]>([]);

  // Usuário Firebase
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // GIS Monitor — fotografa o estado do window.google a cada 2s
  React.useEffect(() => {
    const tick = () => {
      setGisMonitor((prev) => [
        {
          time: new Date().toISOString().substring(11, 19),
          windowGoogle: typeof g() !== 'undefined' && !!g(),
          accounts: !!g()?.accounts,
          id: !!g()?.accounts?.id,
          initialize: typeof g()?.accounts?.id?.initialize,
          prompt: typeof g()?.accounts?.id?.prompt,
          renderButton: typeof g()?.accounts?.id?.renderButton,
        },
        ...prev.slice(0, 50),
      ]);
    };
    tick();
    const interval = setInterval(tick, 2000);
    return () => clearInterval(interval);
  }, []);

  // Runtime Errors — captura window.onerror e unhandledrejection
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setRuntimeErrors((prev) => [
        `[${new Date().toISOString().substring(11, 19)}] WINDOW_ERROR\n` +
          `MESSAGE=${event.message}\n` +
          `SOURCE=${event.filename}\nLINE=${event.lineno}:${event.colno}\n` +
          `STACK=\n${event.error?.stack || 'SEM STACK'}`,
        ...prev.slice(0, 100),
      ]);
    };
    const handlePromise = (event: PromiseRejectionEvent) => {
      setRuntimeErrors((prev) => [
        `[${new Date().toISOString().substring(11, 19)}] PROMISE_ERROR\n` +
          `${String(event.reason)}\n` +
          `STACK=\n${(event.reason as any)?.stack || 'SEM STACK'}`,
        ...prev.slice(0, 100),
      ]);
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromise);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handlePromise);
    };
  }, []);

  // Loaded Scripts — atualiza a cada 3s
  React.useEffect(() => {
    const update = () =>
      setLoadedScripts(
        Array.from(document.scripts).map((s) => ({
          src: s.src || '(inline)',
          async: s.async,
          defer: s.defer,
        }))
      );
    update();
    const interval = setInterval(update, 3000);
    return () => clearInterval(interval);
  }, []);

  const runDiagnostic = () => {
    setReport(buildReport(user));
    setCopied(false);
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopied(true);
    } catch {
      // Fallback: alert para ambientes sem clipboard (WebView)
      alert(JSON.stringify(report, null, 2));
    }
  };

  return (
    <div className="space-y-4">
      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={runDiagnostic}
          className="px-3 py-2 bg-brand-primary text-white rounded-lg text-xs font-bold"
        >
          Executar Diagnóstico
        </button>
        {report && (
          <button
            onClick={copyReport}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg text-xs font-bold"
          >
            {copied ? 'Copiado ✔' : 'Copiar JSON'}
          </button>
        )}
      </div>

      {/* Relatório JSON */}
      {report && (
        <pre className="bg-gray-900 text-green-300 text-[10px] font-mono p-3 rounded-xl max-h-72 overflow-auto whitespace-pre-wrap">
          {JSON.stringify(report, null, 2)}
        </pre>
      )}

      {/* GIS Monitor */}
      <div className="bg-gray-50 border rounded-xl p-3">
        <h3 className="font-bold text-sm mb-2">Google GIS Monitor</h3>
        <div className="text-[10px] font-mono space-y-1 max-h-64 overflow-auto">
          {gisMonitor.map((e, i) => (
            <div key={i}>
              [{e.time}] Google={String(e.windowGoogle)} | Accounts=
              {String(e.accounts)} | ID={String(e.id)} | Init={String(e.initialize)} |
              Prompt={String(e.prompt)} | RenderButton={String(e.renderButton)}
            </div>
          ))}
        </div>
      </div>

      {/* Runtime Errors */}
      <div className="bg-red-50 border rounded-xl p-3">
        <h3 className="font-bold text-sm mb-2">Runtime Errors</h3>
        <div className="text-[10px] font-mono space-y-3 max-h-72 overflow-auto">
          {runtimeErrors.length === 0 ? (
            <div>Nenhum erro capturado</div>
          ) : (
            runtimeErrors.map((e, i) => (
              <pre key={i} className="whitespace-pre-wrap border-b pb-2">
                {e}
              </pre>
            ))
          )}
        </div>
      </div>

      {/* Loaded Scripts */}
      <div className="bg-blue-50 border rounded-xl p-3">
        <h3 className="font-bold text-sm mb-2">Loaded Scripts</h3>
        <div className="text-[10px] font-mono space-y-1 max-h-64 overflow-auto">
          {loadedScripts.map((s, i) => (
            <div key={i}>
              {s.src} {s.async ? '[async]' : ''} {s.defer ? '[defer]' : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugCenter;
