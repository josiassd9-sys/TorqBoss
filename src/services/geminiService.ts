// src/services/geminiService.ts
// Proxy service that calls the server-side Gemini API

import { Capacitor } from '@capacitor/core';

// ===================== CONFIGURAÇÃO PARA APP HÍBRIDO =====================

// Detecta se está rodando no Capacitor (app nativo Android)
const isNativeApp = Capacitor.isNativePlatform();

// URL base — prioriza variável de ambiente injetada no build (VITE_API_BASE),
// fallback para a URL de produção hardcoded (app nativo) ou origem atual (web dev).
const API_BASE = (
  import.meta.env.VITE_API_BASE ||
  (isNativeApp
    ? 'https://torqboss-140585498523.southamerica-east1.run.app'
    : window.location.origin)
).replace(/\/+$/, '');

console.log(`[IA] init | native=${isNativeApp} | origin=${window.location.origin} | api=${API_BASE}`);

const getApiUrl = (endpoint: string): string => {
  if (!API_BASE || API_BASE.includes('undefined')) {
    throw new Error('[IA] API_BASE inválido - request abortado');
  }
  return `${API_BASE}${endpoint}`;
};

let onCreditConsumed: (amount: number) => void = () => {};
let currentCredits = 0;
let usingCustomKey = false;
let isProMember = false;
let currentApiKey = '';
let lastAiContext = '';
let lastUrlDebugSignature = '';

const formatAiContext = (method: string, credits: number): string => {
  const details = [
    `key=${usingCustomKey}`,
    `pro=${isProMember}`,
    `creditos=${credits}`
  ].join(' | ');

  if (details === lastAiContext) {
    return `[IA] ${method}`;
  }

  lastAiContext = details;
  return `[IA] ${method} | ${details}`;
};

const summarizeAiError = (error: any): string => {
  const message = String(error?.message || error || 'Erro desconhecido');
  if (message.includes('REDIRECT_BLOQUEADO')) {
    return 'Redirect bloqueado (possivel cookie-check/IAP no Cloud Run)';
  }
  if (message.includes('HTML em vez de JSON') || message.includes("Unexpected token '<'")) {
    return "Unexpected token '<' (HTML recebido)";
  }
  if (message.includes('Failed to fetch')) {
    return 'Failed to fetch (rede/CORS/autenticacao do endpoint)';
  }
  return message.replace(/\s+/g, ' ').trim();
};

export const geminiService = {
  setApiKey: (key: string) => {
    currentApiKey = key || '';
    usingCustomKey = !!key;
    lastAiContext = '';
    console.log(`[IA] chave API | ativa=${usingCustomKey}`);
    fetch(getApiUrl('/api/gemini/settings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    }).catch(console.error);
  },

  setGlobalSettings: (settings: any) => {
    if (settings.aiCredits !== undefined) {
      currentCredits = settings.aiCredits;
    }
    if (settings.isProMember !== undefined) {
      isProMember = !!settings.isProMember;
    }
    lastAiContext = '';
    fetch(getApiUrl('/api/gemini/settings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings })
    }).catch(console.error);
  },

  onCreditConsumed: (callback: (amount: number) => void) => {
    onCreditConsumed = callback;
  },

  getCooldownRemaining: () => geminiService.call('getCooldownRemaining'),

  call: async (method: string, ...args: any[]): Promise<any> => {
    const credits = currentCredits;

    const skipCheck = usingCustomKey || isProMember || method === 'validateApiKey' || method === 'getCooldownRemaining';
    if (!skipCheck && credits <= 0) {
      throw new Error("SALDO INSUFICIENTE: Seus créditos de IA acabaram. Recarregue na aba 'Carteira' ou adicione sua própria Chave API.");
    }

    console.log(formatAiContext(method, credits));

    let body;
    
    const sanitize = (val: any): any => {
      if (val === null || val === undefined) return val;
      if (typeof val !== 'object') return val;
      
      const seen = new WeakSet();
      const clean = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (seen.has(obj)) return '[Circular]';
        seen.add(obj);

        if (obj instanceof Error) return { message: obj.message, name: obj.name };
        if (obj instanceof HTMLElement || (obj.constructor && obj.constructor.name.includes('Element'))) return `[DOM: ${obj.tagName || 'Node'}]`;
        if (obj.nativeEvent || (obj.constructor && obj.constructor.name === 'SyntheticBaseEvent')) return '[React Event]';
        
        if (Array.isArray(obj)) return obj.map(clean);
        
        const result: any = {};
        for (const key of Object.keys(obj)) {
          if (key.startsWith('__react') || key === '$$typeof' || key === '_owner') continue;
          try {
            result[key] = clean(obj[key]);
          } catch (e) {
            result[key] = '[Inaccessible]';
          }
        }
        return result;
      };
      return clean(val);
    };

    try {
      const sanitizedArgs = args.map(sanitize);
      body = JSON.stringify({ method, args: sanitizedArgs });
    } catch (e) {
      body = JSON.stringify({ method, args: ['[Serialization Error]'] });
    }

    try {
      const finalUrl = `${API_BASE}/api/gemini/call`;
      const urlDebugSignature = `${isNativeApp}|${window.location.origin}|${API_BASE}|${finalUrl}`;
      if (urlDebugSignature !== lastUrlDebugSignature) {
        lastUrlDebugSignature = urlDebugSignature;
        console.log(`[IA URL] native=${isNativeApp} | origin=${window.location.origin} | base=${API_BASE}`);
        console.log(`[IA URL] final=${finalUrl}`);
      }

      console.log('[IA FETCH] iniciando');
      const response = await fetch(getApiUrl('/api/gemini/call'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        redirect: 'manual'
      });

      console.log('[IA HTTP] status=', response.status);
      console.log('[IA HTTP] ok=', response.ok);
      console.log('[IA HTTP] redirected=', response.redirected);
      console.log('[IA HTTP] type=', response.type);
      console.log('[IA HTTP] url=', response.url);
      console.log('[IA HTTP] content-type=', response.headers.get('content-type'));
      console.log('[IA HTTP] location=', response.headers.get('location'));

      try {
        const bodyText = await response.clone().text();
        console.log('[IA HTTP] body=', bodyText.substring(0, 200));
      } catch {
        console.log('[IA HTTP] body= [indisponivel para este tipo de resposta]');
      }

      const isRedirectStatus = response.status >= 300 && response.status < 400;
      if (response.type === 'opaqueredirect' || isRedirectStatus || response.redirected) {
        throw new Error(
          'REDIRECT_BLOQUEADO: Backend respondeu com redirect em vez de JSON. Verifique Cloud Run (IAP/cookie-check/autenticacao) e mantenha o endpoint /api/gemini/call sem redirecionamento.'
        );
      }

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Backend retornou HTML em vez de JSON');
        }
        const error = await response.json().catch(() => ({ error: 'Unknown API error' }));
        throw new Error(error.error || `API error: ${response.status}`);
      }

      if (!usingCustomKey && method !== 'validateApiKey' && method !== 'getCooldownRemaining') {
        onCreditConsumed(1);
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend retornou HTML em vez de JSON');
      }
      let result: any;
      try {
        const text = await response.text();
        result = JSON.parse(text);
      } catch (error) {
        console.log('[IA] ERRO JSON (HTML recebido)');
        throw error;
      }
      console.log('[IA] OK');
      return result;
    } catch (error: any) {
      console.log('[IA FETCH ERROR NAME]', error?.name);
      console.log('[IA FETCH ERROR MESSAGE]', error?.message);
      console.log('[IA FETCH ERROR CAUSE]', error?.cause);
      console.log('[IA FETCH ERROR STACK]', error?.stack?.split('\n')[0]);
      console.log(`[IA] ERRO: ${summarizeAiError(error)}`);
      throw error;
    }
  },

  // === Facade methods (não mexer) ===
  detectRegionalDefaults: (locale: string, timezone: string) => geminiService.call('detectRegionalDefaults', locale, timezone),
  researchPart: (partName: string, vehicleModel: string) => geminiService.call('researchPart', partName, vehicleModel),
  searchVehicleLogo: (brandName: string) => geminiService.call('searchVehicleLogo', brandName),
  searchVehicleImage: (vehicleModel: string) => geminiService.call('searchVehicleImage', vehicleModel),
  searchVehicleByPlate: (plate: string, apiKey?: string, deviceToken?: string, host?: string, countryId?: string) => 
    geminiService.call('searchVehicleByPlate', plate, apiKey, deviceToken, host, countryId),
  parseRawVehicleData: (text: string) => geminiService.call('parseRawVehicleData', text),
  estimatePartPrice: (partName: string, vehicleModel: string) => geminiService.call('estimatePartPrice', partName, vehicleModel),
  simulateMaintenance: (vehicleModel: string, mileage: number) => geminiService.call('simulateMaintenance', vehicleModel, mileage),
  simulateMaintenanceFromManual: (vehicleModel: string, mileage: number, manualContext?: any) => 
    geminiService.call('simulateMaintenanceFromManual', vehicleModel, mileage, manualContext),
  getVehicleManualInfo: (vehicleModel: string) => geminiService.call('getVehicleManualInfo', vehicleModel),
  extractVehicleManualFromPdf: (pdfBase64: string, vehicleModel: string) => geminiService.call('extractVehicleManualFromPdf', pdfBase64, vehicleModel),
  extractTechnicalInfoFromPDF: (pdfBase64: string, vehicleModel: string) => geminiService.call('extractTechnicalInfoFromPDF', pdfBase64, vehicleModel),
  chatWithManual: (question: string, context: string, vehicleModel: string) => geminiService.call('chatWithManual', question, context, vehicleModel),
  analyzeVehicleHealth: (vehicle: any) => geminiService.call('analyzeVehicleHealth', vehicle),
  predictMaintenance: (vehicle: any) => geminiService.call('predictMaintenance', vehicle),
  resaleValueAnalysis: (vehicle: any, fipeValue: number) => geminiService.call('resaleValueAnalysis', vehicle, fipeValue),
  analyzeTCO: (vehicle: any, totalFuelCost: number, totalServiceCost: number) => geminiService.call('analyzeTCO', vehicle, totalFuelCost, totalServiceCost),
  generateDigitalPassport: (vehicle: any) => geminiService.call('generateDigitalPassport', vehicle),
  analyzeTireProfile: (brand: string, model: string, currentUsageProfile: string) => geminiService.call('analyzeTireProfile', brand, model, currentUsageProfile),
  getFuelInsight: (avgConsumption: string, vehicle: any) => geminiService.call('getFuelInsight', avgConsumption, vehicle),
  diagnoseSymptom: (vehicle: any, symptom: string) => geminiService.call('diagnoseSymptom', vehicle, symptom),
  getVerificationGuide: (vehicle: any, symptom: string, causeName: string) => geminiService.call('getVerificationGuide', vehicle, symptom, causeName),
  fetchFipeValue: (vehicleName: string, model: string, year: string) => geminiService.call('fetchFipeValue', vehicleName, model, year),
  callAI: (prompt: string, jsonMode?: boolean, useGoogleSearch?: boolean, skipHistory?: boolean) => 
    geminiService.call('callAI', prompt, jsonMode, useGoogleSearch, skipHistory),
  clearHistory: () => geminiService.call('clearHistory'),
  validateApiKey: (key: string) => geminiService.call('validateApiKey', key),
};