let logs: string[] = [];
let isIntercepting = false;

// Salva refs originais para depuração limpa e prevenção de recursão infinita
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;
const originalInfo = console.info;

function addLog(type: string, message: string) {
  const time = new Date().toLocaleTimeString();
  const line = `[${time}] [${type}] ${message}`;
  
  // Limita o armazenamento em memória na fila para no máximo 800 itens
  logs.push(line);
  if (logs.length > 800) {
    logs.shift();
  }

  // Escreve no console nativo real do navegador usando nossa referência salva
  originalLog.call(console, line);

  // Despacha um evento personalizado para components em React escutarem atualizações
  window.dispatchEvent(new CustomEvent('debug-logs-updated', { detail: logs }));

  const debugElement = document.getElementById('debug-overlay-content');
  if (debugElement) {
    debugElement.innerText = logs.join('\n\n');
  }
}

export function getDebugLogs(): string[] {
  return logs;
}

export function clearDebugLogs() {
  logs = [];
  window.dispatchEvent(new CustomEvent('debug-logs-updated', { detail: logs }));
  const debugElement = document.getElementById('debug-overlay-content');
  if (debugElement) {
    debugElement.innerText = '';
  }
}

export function toggleDebugOverlay(show: boolean) {
  const overlay = document.getElementById('debug-overlay');
  if (overlay) {
    overlay.style.display = show ? 'block' : 'none';
  }
}

export interface StorageMetrics {
  totalItems: number;
  usedBytes: number;
  usedKB: string;
  items: { key: string; bytes: number; kb: string }[];
}

export function getLocalStorageMetrics(): StorageMetrics {
  let totalBytes = 0;
  const items: { key: string; bytes: number; kb: string }[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      // 2 bytes por caractere (padrão UTF-16 em strings JS)
      const bytes = (key.length + value.length) * 2;
      totalBytes += bytes;
      items.push({
        key,
        bytes,
        kb: (bytes / 1024).toFixed(3)
      });
    }
  }
  
  return {
    totalItems: localStorage.length,
    usedBytes: totalBytes,
    usedKB: (totalBytes / 1024).toFixed(2),
    items: items.sort((a, b) => b.bytes - a.bytes)
  };
}

export function setupConsoleInterceptors() {
  if (isIntercepting) return;
  isIntercepting = true;

  console.log = function (...args: any[]) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    // Ignora pings barulhentos do Vite HMR ou conexões WebSocket locais
    if (message.includes('[vite]') || message.includes('WebSocket')) {
      originalLog.apply(console, args);
      return;
    }
    originalLog.apply(console, args);
    addLog('LOG', message);
  };

  console.warn = function (...args: any[]) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    if (message.toLowerCase().includes('[vite]') || message.toLowerCase().includes('websocket')) {
      originalWarn.apply(console, args);
      return;
    }
    originalWarn.apply(console, args);
    addLog('WARN', message);
  };

  console.error = function (...args: any[]) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    // Ignora erros barulhentos do Vite HMR ou conexões WebSocket locais que falham por estarem desativadas
    if (message.toLowerCase().includes('[vite]') || message.toLowerCase().includes('websocket')) {
      originalError.apply(console, args);
      return;
    }
    originalError.apply(console, args);
    addLog('ERROR', message);
  };

  console.info = function (...args: any[]) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    originalInfo.apply(console, args);
    addLog('INFO', message);
  };
}

export function initDebugOverlay() {
  // Verifica se o overlay já existe
  if (document.getElementById('debug-overlay')) return;

  // Ativa automaticamente o interceptador de console universal
  setupConsoleInterceptors();

  // Escuta status de conectividade de rede
  window.addEventListener('online', () => {
    addLog('NETWORK', 'Status de rede alterado: CONECTADO (ONLINE)');
  });
  window.addEventListener('offline', () => {
    addLog('NETWORK', 'Status de rede alterado: DESCONECTADO (OFFLINE)');
  });

  // Registra velocidade de carregamento da página assim que ela é carregada
  window.addEventListener('load', () => {
    try {
      const timing = window.performance.timing;
      if (timing) {
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        if (loadTime > 0) {
          addLog('PERF', `Tempo de carregamento total da página: ${loadTime}ms`);
        }
      }
    } catch {
      // Ignora falhas silenciosamente caso timing não seja suportado em ambientes sandbox
    }
  });

  const overlay = document.createElement('div');
  overlay.id = 'debug-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'black';
  overlay.style.color = '#00ff00';
  overlay.style.zIndex = '999999';
  overlay.style.fontSize = '12px';
  overlay.style.overflow = 'auto';
  overlay.style.padding = '10px';
  overlay.style.fontFamily = 'monospace';

  // Ocultamos na abertura inicial por padrão
  overlay.style.display = 'none';

  overlay.innerHTML = `
    <div style="margin-bottom:10px; display:flex; gap:10px; position: sticky; top: 0; background: black; padding: 10px 0; border-b: 1px solid #333; z-index: 1000000;">
      <button id="copy-debug-btn" style="background: #222; border: 1px solid #00ff00; color: #00ff00; padding: 5px 10px; cursor: pointer; font-weight: bold; border-radius: 4px;">
        COPIAR DEBUG
      </button>

      <button id="hide-debug-btn" style="background: #222; border: 1px solid #ff0000; color: #ff0000; padding: 5px 10px; cursor: pointer; font-weight: bold; border-radius: 4px;">
        FECHAR
      </button>
    </div>

    <pre id="debug-overlay-content" style="white-space: pre-wrap; word-wrap: break-word;">
Inicializando logs interceptados...
    </pre>
  `;

  document.body.appendChild(overlay);

  const copyBtn = document.getElementById('copy-debug-btn');
  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(logs.join('\n\n'));
      alert('Debug copiado!');
    } catch {
      alert('Falha ao copiar');
    }
  });

  const hideBtn = document.getElementById('hide-debug-btn');
  hideBtn?.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  window.onerror = function (message, source, lineno, colno, error) {
    addLog(
      'WINDOW_ERROR',
      `${String(message)}\n${source}:${lineno}:${colno}\n${error?.stack || 'Sem stack'}`
    );
    return false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason || '');
    const stackStr = String(event.reason?.stack || '');
    const isViteOrWS = 
      reasonStr.toLowerCase().includes('websocket') || 
      reasonStr.toLowerCase().includes('[vite]') ||
      stackStr.toLowerCase().includes('websocket') ||
      stackStr.toLowerCase().includes('[vite]');

    if (isViteOrWS) {
      // Previna que esse erro inofensivo vá para o console de erros do navegador/iframe e cause alertas de erro no painel
      event.preventDefault();
      originalLog.call(console, `[Debug Ignored Benign WS/HMR Promise Error]: ${reasonStr}`);
      return;
    }

    addLog(
      'PROMISE_ERROR',
      `${reasonStr}\n${stackStr || 'Sem stack'}`
    );
  });

  addLog('INFO', 'Console de depuração e interceptador universal inicializados com sucesso!');
}

export function debugLog(message: any) {
  addLog(
    'LOG',
    typeof message === 'string'
      ? message
      : JSON.stringify(message)
  );
}

export function debugError(message: any) {
  addLog(
    'ERROR',
    typeof message === 'string'
      ? message
      : JSON.stringify(message)
  );
}