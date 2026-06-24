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
      isSecureContext: window.isSecureContext,
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

type ConsoleEntry = {
  time: string;
  level: 'log' | 'warn' | 'error';
  message: string;
};

type ConnectivityEntry = {
  time: string;
  label: string;
  target: string;
  ok: boolean;
  status: number | null;
  latencyMs: number;
  classification: 'http' | 'timeout' | 'network' | 'fetch-error';
  detail: string;
  responseType?: string;
  finalUrl?: string;
  statusOk?: boolean;
  headersPreview?: string;
  bodyPreview?: string;
};

type EnvironmentSnapshot = {
  time: string;
  platform: string;
  userAgent: string;
  origin: string;
  onLine: boolean;
  isSecureContext: boolean;
};

export const DebugCenter: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [report, setReport] = React.useState<any>(null);
  const [copied, setCopied] = React.useState(false);

  const [gisMonitor, setGisMonitor] = React.useState<any[]>([]);
  const [runtimeErrors, setRuntimeErrors] = React.useState<string[]>([]);
  const [loadedScripts, setLoadedScripts] = React.useState<any[]>([]);
  const [consoleLogs, setConsoleLogs] = React.useState<ConsoleEntry[]>([]);
  const [connectivityLogs, setConnectivityLogs] = React.useState<ConnectivityEntry[]>([]);
  const [isTestingConnectivity, setIsTestingConnectivity] = React.useState(false);
  const [envSnapshot, setEnvSnapshot] = React.useState<EnvironmentSnapshot>({
    time: new Date().toISOString().substring(11, 19),
    platform: Capacitor.getPlatform(),
    userAgent: navigator.userAgent,
    origin: window.location.origin,
    onLine: navigator.onLine,
    isSecureContext: window.isSecureContext,
  });

  // Console interceptor — captura log, warn e error em tempo real
  React.useEffect(() => {
    const fmt = (...args: any[]) =>
      args
        .map((a) => {
          if (typeof a === 'object') {
            try { return JSON.stringify(a); } catch { return String(a); }
          }
          return String(a);
        })
        .join(' ');

    const _log = console.log.bind(console);
    const _warn = console.warn.bind(console);
    const _error = console.error.bind(console);

    console.log = (...args) => {
      _log(...args);
      setConsoleLogs((prev) => [
        { time: new Date().toISOString().substring(11, 19), level: 'log', message: fmt(...args) },
        ...prev.slice(0, 199),
      ]);
    };
    console.warn = (...args) => {
      _warn(...args);
      setConsoleLogs((prev) => [
        { time: new Date().toISOString().substring(11, 19), level: 'warn', message: fmt(...args) },
        ...prev.slice(0, 199),
      ]);
    };
    console.error = (...args) => {
      _error(...args);
      setConsoleLogs((prev) => [
        { time: new Date().toISOString().substring(11, 19), level: 'error', message: fmt(...args) },
        ...prev.slice(0, 199),
      ]);
    };

    return () => {
      console.log = _log;
      console.warn = _warn;
      console.error = _error;
    };
  }, []);

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

  // Ambiente WebView/Segurança — atualização contínua para diagnosticar camada da falha
  React.useEffect(() => {
    const updateEnv = () => {
      setEnvSnapshot({
        time: new Date().toISOString().substring(11, 19),
        platform: Capacitor.getPlatform(),
        userAgent: navigator.userAgent,
        origin: window.location.origin,
        onLine: navigator.onLine,
        isSecureContext: window.isSecureContext,
      });
    };

    updateEnv();
    const interval = setInterval(updateEnv, 3000);
    window.addEventListener('online', updateEnv);
    window.addEventListener('offline', updateEnv);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updateEnv);
      window.removeEventListener('offline', updateEnv);
    };
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

  const runConnectivityProbe = async () => {
    const cloudRunUrl = 'https://ais-dev-exgrcbouh4ydginh4gncxc-510605507081.us-west2.run.app/api/gemini/call';
    
    setIsTestingConnectivity(true);
    const startedAt = Date.now();
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 10000);

    try {
      console.log(`[CLOUD_RUN_TEST] Iniciando teste do endpoint: ${cloudRunUrl}`);
      
      const response = await fetch(cloudRunUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        signal: controller.signal,
      });

      const elapsed = Date.now() - startedAt;
      console.log(`[CLOUD_RUN_TEST] Resposta recebida em ${elapsed}ms`);
      console.log(`[CLOUD_RUN_TEST] Status: ${response.status}`);
      console.log(`[CLOUD_RUN_TEST] OK: ${response.ok}`);
      console.log(`[CLOUD_RUN_TEST] URL final: ${response.url}`);
      console.log(`[CLOUD_RUN_TEST] Type: ${response.type}`);

      let bodyPreview = '(vazio)';
      try {
        const text = await response.text();
        bodyPreview = text.substring(0, 300);
        console.log(`[CLOUD_RUN_TEST] Body: ${bodyPreview}`);
      } catch (e) {
        console.log(`[CLOUD_RUN_TEST] Falha ao ler body: ${String(e)}`);
      }

      let headersPreview = '{}';
      try {
        const headersObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
        headersPreview = JSON.stringify(headersObj);
        console.log(`[CLOUD_RUN_TEST] Headers: ${headersPreview}`);
      } catch (e) {
        console.log(`[CLOUD_RUN_TEST] Falha ao serializar headers: ${String(e)}`);
      }

      setConnectivityLogs((prev) => [
        {
          time: new Date().toISOString().substring(11, 19),
          label: 'Cloud Run /api/gemini/call',
          target: cloudRunUrl,
          ok: true,
          status: response.status,
          statusOk: response.ok,
          latencyMs: elapsed,
          classification: 'http',
          detail: `HTTP ${response.status}`,
          responseType: response.type,
          finalUrl: response.url,
          headersPreview,
          bodyPreview,
        },
        ...prev.slice(0, 99),
      ]);
    } catch (error: any) {
      const elapsed = Date.now() - startedAt;
      const isAbort = error?.name === 'AbortError';
      const errorMsg = error?.message ? String(error.message) : String(error || 'Erro desconhecido');
      const errorName = error?.name ? String(error.name) : 'Unknown';
      const message = errorMsg.substring(0, 500);

      console.log(`[CLOUD_RUN_TEST] ERRO - ${errorName}`);
      console.log(`[CLOUD_RUN_TEST] Mensagem: ${message}`);
      console.log(`[CLOUD_RUN_TEST] Tempo: ${elapsed}ms`);

      const classification: ConnectivityEntry['classification'] =
        isAbort ? 'timeout' :
        message.toLowerCase().includes('failed to fetch') ? 'network' :
        'fetch-error';

      setConnectivityLogs((prev) => [
        {
          time: new Date().toISOString().substring(11, 19),
          label: 'Cloud Run /api/gemini/call',
          target: cloudRunUrl,
          ok: false,
          status: null,
          latencyMs: elapsed,
          classification,
          detail: `${errorName}: ${message}`,
          statusOk: false,
          finalUrl: cloudRunUrl,
        },
        ...prev.slice(0, 99),
      ]);
    } finally {
      clearTimeout(timeoutHandle);
      setIsTestingConnectivity(false);
    }
  };

  const copyConnectivityDiagnosis = async () => {
    const lines = [
      `Diagnostico Automatico (${connectivityDiagnosis.confidence})`,
      connectivityDiagnosis.summary,
      ...connectivityDiagnosis.findings.map((f) => `- ${f}`),
      '',
      `Ambiente: platform=${envSnapshot.platform} | onLine=${String(envSnapshot.onLine)} | isSecureContext=${String(envSnapshot.isSecureContext)}`,
      `Origin: ${envSnapshot.origin}`,
      `UserAgent: ${envSnapshot.userAgent}`,
    ];
    const text = lines.join('\n');

    try {
      await navigator.clipboard.writeText(text);
      alert('Diagnostico copiado!');
    } catch {
      alert(text);
    }
  };

  const connectivityDiagnosis = React.useMemo(() => {
    if (connectivityLogs.length === 0) {
      return {
        tone: 'neutral' as const,
        confidence: 'n/a',
        summary: 'Clique em "Testar Cloud Run Endpoint" para gerar diagnostico automatico.',
        findings: ['Sem amostras do Cloud Run ainda.'],
      };
    }

    const latest = connectivityLogs[0]; // Sempre o mais recente

    if (!envSnapshot.onLine) {
      return {
        tone: 'error' as const,
        confidence: 'alta',
        summary: 'Dispositivo offline no momento da captura.',
        findings: ['navigator.onLine = false.', 'Verifique Wi-Fi/4G antes de repetir os testes.'],
      };
    }

    if (!envSnapshot.isSecureContext) {
      return {
        tone: 'warning' as const,
        confidence: 'media',
        summary: 'Contexto de seguranca nao confirmado (isSecureContext=false).',
        findings: [
          'WebView pode impor restricoes extras para chamadas HTTPS.',
          'Validar origem final e politica de WebView/Capacitor no Android.',
        ],
      };
    }

    if (latest.status !== null) {
      if (latest.status === 404) {
        return {
          tone: 'error' as const,
          confidence: 'alta',
          summary: 'Cloud Run respondeu 404: rota nao encontrada.',
          findings: ['O endpoint /api/gemini/call pode nao existir nesse deploy.', 'Verificar rotas no Cloud Run.'],
        };
      }
      if (latest.status === 401 || latest.status === 403) {
        return {
          tone: 'warning' as const,
          confidence: 'alta',
          summary: `Cloud Run respondeu ${latest.status}: autenticacao ou permissao negada.`,
          findings: ['A rede e TLS estao funcionando.', 'Revisar autenticacao e IAM do servico Cloud Run.'],
        };
      }
      if (latest.status >= 500) {
        return {
          tone: 'error' as const,
          confidence: 'alta',
          summary: `Cloud Run respondeu ${latest.status}: erro interno do servidor.`,
          findings: ['A chamada chegou no servico.', 'Inspecionar logs do Cloud Run para stacktrace.'],
        };
      }
      if (latest.status >= 200 && latest.status < 300) {
        return {
          tone: 'success' as const,
          confidence: 'alta',
          summary: `Cloud Run respondeu ${latest.status}: sucesso.`,
          findings: ['Conectividade esta funcionando corretamente.', 'Investigar logica de negocio e payload.'],
        };
      }
      return {
        tone: 'warning' as const,
        confidence: 'media',
        summary: `Cloud Run respondeu ${latest.status}.`,
        findings: ['Analisar status HTTP especifico para entender a resposta.'],
      };
    }

    if (latest.classification === 'timeout') {
      return {
        tone: 'error' as const,
        confidence: 'alta',
        summary: 'Timeout na conexao ao Cloud Run (timeout 10s).',
        findings: ['O endpoint pode estar indisponivel ou muito lento.', 'Verificar status/saude do Cloud Run.'],
      };
    }

    if (latest.classification === 'network') {
      return {
        tone: 'error' as const,
        confidence: 'alta',
        summary: 'Failed to fetch: falha de rede ou TLS no Cloud Run.',
        findings: [
          'O endpoint pode estar bloqueado, ou ha problema de certificado.',
          'Testar a URL no navegador desktop para comparar.',
        ],
      };
    }

    return {
      tone: 'error' as const,
      confidence: 'media',
      summary: `Erro ${latest.classification}: ${latest.detail}`,
      findings: ['Verifique a mensagem de erro acima para mais detalhes.'],
    };
  }, [connectivityLogs, envSnapshot]);

  return (
    <div className="space-y-4">
      {/* Logs de Conexão & API */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm text-green-400">Logs de Conexão &amp; API (Tempo Real)</h3>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const text = consoleLogs
                  .map((e) => `[${e.time}] ${e.level.toUpperCase()} ${e.message}`)
                  .join('\n');
                try {
                  await navigator.clipboard.writeText(text);
                  alert('Logs copiados!');
                } catch {
                  alert(text || 'Nenhum log para copiar.');
                }
              }}
              disabled={consoleLogs.length === 0}
              className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-[10px] font-bold hover:bg-gray-500 disabled:opacity-40"
            >
              Copiar
            </button>
            <button
              onClick={() => setConsoleLogs([])}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-[10px] font-bold hover:bg-gray-600"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={runConnectivityProbe}
            disabled={isTestingConnectivity}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-500 disabled:opacity-50"
          >
            {isTestingConnectivity ? 'Testando Cloud Run...' : 'Testar Cloud Run Endpoint'}
          </button>
          <button
            onClick={() => setConnectivityLogs([])}
            className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded text-[10px] font-bold hover:bg-gray-600"
          >
            Limpar Testes
          </button>
        </div>

        <div className="text-[10px] font-mono space-y-1 mb-3 border border-gray-700 rounded p-2 bg-gray-950">
          <div className="text-cyan-300 font-bold">Ambiente WebView / Segurança</div>
          <div className="text-gray-300">[{envSnapshot.time}] Capacitor.getPlatform() = {envSnapshot.platform}</div>
          <div className="text-gray-300 break-all">navigator.userAgent = {envSnapshot.userAgent}</div>
          <div className="text-gray-300 break-all">window.location.origin = {envSnapshot.origin}</div>
          <div className={envSnapshot.onLine ? 'text-emerald-300' : 'text-red-300'}>navigator.onLine = {String(envSnapshot.onLine)}</div>
          <div className={envSnapshot.isSecureContext ? 'text-emerald-300 font-bold' : 'text-red-300 font-bold'}>
            window.isSecureContext = {String(envSnapshot.isSecureContext)}
          </div>
        </div>

        <div className="text-[10px] font-mono space-y-1 max-h-44 overflow-auto mb-3 border border-gray-700 rounded p-2 bg-gray-950">
          {connectivityLogs.length === 0 ? (
            <div className="text-gray-500">Nenhum teste do Cloud Run executado ainda. Clique em "Testar Cloud Run Endpoint" acima.</div>
          ) : (
            connectivityLogs.map((e, i) => (
              <div key={i} className={e.ok ? 'text-emerald-300' : 'text-red-300'}>
                [{e.time}] {e.ok ? 'OK' : 'FALHA'} | {e.classification.toUpperCase()} | {e.latencyMs}ms | {e.label}
                <div className="text-gray-400 break-all">{e.target}</div>
                <div className="text-gray-400 break-all">
                  {e.detail}
                  {e.status !== null ? ` | status=${e.status}` : ''}
                  {typeof e.statusOk === 'boolean' ? ` | ok=${String(e.statusOk)}` : ''}
                  {e.responseType ? ` | type=${e.responseType}` : ''}
                </div>
                {e.finalUrl && <div className="text-gray-500 break-all">finalUrl={e.finalUrl}</div>}
                {e.headersPreview && <div className="text-gray-500 break-all">headers={e.headersPreview}</div>}
                {e.bodyPreview && <div className="text-gray-500 break-all">body={e.bodyPreview || '(vazio)'}</div>}
              </div>
            ))
          )}
        </div>

        <div
          className={`text-[10px] font-mono space-y-1 mb-3 border rounded p-2 ${
            connectivityDiagnosis.tone === 'success'
              ? 'border-emerald-700 bg-emerald-950 text-emerald-200'
              : connectivityDiagnosis.tone === 'warning'
              ? 'border-yellow-700 bg-yellow-950 text-yellow-200'
              : connectivityDiagnosis.tone === 'error'
              ? 'border-red-700 bg-red-950 text-red-200'
              : 'border-gray-700 bg-gray-950 text-gray-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold">Diagnostico Automatico ({connectivityDiagnosis.confidence})</div>
            <button
              onClick={copyConnectivityDiagnosis}
              className="px-2 py-1 rounded bg-gray-800 text-gray-100 text-[10px] font-bold hover:bg-gray-700"
            >
              Copiar Diagnostico
            </button>
          </div>
          <div className="break-all">{connectivityDiagnosis.summary}</div>
          {connectivityDiagnosis.findings.map((f, idx) => (
            <div key={idx} className="break-all">- {f}</div>
          ))}
        </div>

        <div className="text-[10px] font-mono space-y-0.5 max-h-72 overflow-auto">
          {consoleLogs.length === 0 ? (
            <div className="text-gray-500">Nenhum log ainda. Interaja com o app para ver os logs aqui.</div>
          ) : (
            consoleLogs.map((e, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap break-all ${
                  e.level === 'error' ? 'text-red-400' :
                  e.level === 'warn'  ? 'text-yellow-400' :
                                        'text-green-300'
                }`}
              >
                <span className="text-gray-500">[{e.time}]</span>{' '}
                <span className={`font-black uppercase ${
                  e.level === 'error' ? 'text-red-500' :
                  e.level === 'warn'  ? 'text-yellow-500' :
                                        'text-blue-400'
                }`}>{e.level}</span>{' '}
                {e.message}
              </div>
            ))
          )}
        </div>
      </div>

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
