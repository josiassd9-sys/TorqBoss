let logs: string[] = [];

function addLog(type: string, message: string) {

  const time = new Date().toLocaleTimeString();

  const line = `[${time}] [${type}] ${message}`;

  logs.push(line);

  console.log(line);

  const debugElement =
    document.getElementById('debug-overlay-content');

  if (debugElement) {

    debugElement.innerText =
      logs.join('\n\n');
  }
}

export function initDebugOverlay() {

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

  overlay.innerHTML = `
    <div style="margin-bottom:10px; display:flex; gap:10px;">
      <button id="copy-debug-btn">
        COPIAR DEBUG
      </button>

      <button id="hide-debug-btn">
        FECHAR
      </button>
    </div>

    <pre id="debug-overlay-content">
Inicializando debug...
    </pre>
  `;

  document.body.appendChild(overlay);

  const copyBtn =
    document.getElementById('copy-debug-btn');

  copyBtn?.addEventListener('click', async () => {

    try {

      await navigator.clipboard.writeText(
        logs.join('\n\n')
      );

      alert('Debug copiado!');

    } catch {

      alert('Falha ao copiar');
    }
  });

  const hideBtn =
    document.getElementById('hide-debug-btn');

  hideBtn?.addEventListener('click', () => {

    overlay.style.display = 'none';
  });

  window.onerror = function (
    message,
    source,
    lineno,
    colno,
    error
  ) {

    addLog(
      'WINDOW_ERROR',
      `${String(message)}
${source}:${lineno}:${colno}
${error?.stack || 'Sem stack'}`
    );

    return false;
  };

  window.addEventListener(
    'unhandledrejection',
    (event) => {

      addLog(
        'PROMISE_ERROR',
        `${String(event.reason)}
${event.reason?.stack || 'Sem stack'}`
      );
    }
  );

  addLog('INFO', 'Debug iniciado');
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