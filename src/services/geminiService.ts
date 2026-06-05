// src/services/geminiService.ts
// Proxy service that calls the server-side Gemini API

// ===================== CONFIGURAÇÃO PARA APP HÍBRIDO =====================

// Detecta se está rodando no Capacitor (app nativo Android)
const isNativeApp = window.location.protocol === 'capacitor:';

// URL de Produção (Backend na nuvem)
const PRODUCAO_API_URL = 'https://ais-dev-exgrcbouh4ydginh4gncxc-510605507081.us-west2.run.app';

// Base URL dinâmica
const API_BASE = isNativeApp ? PRODUCAO_API_URL : '';

let onCreditConsumed: (amount: number) => void = () => {};
let currentCredits = 0;
let usingCustomKey = false;
let _lastGlobalSettingsSerialized = '';
let _lastSettingsCallTs = 0;
let _syncLock = false;

// Hash apenas os campos críticos que devem disparar sync
const hashSettings = (settings: any) => {
  try {
    return JSON.stringify({
      aiCredits: settings?.aiCredits,
      isProMember: settings?.isProMember,
      theme: settings?.theme,
      language: settings?.language,
      geminiApiKey: settings?.geminiApiKey
    });
  } catch (e) {
    return '';
  }
};

export const geminiService = {
  setApiKey: (key: string) => {
    usingCustomKey = !!key;
    fetch(`${API_BASE}/api/gemini/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    }).catch(console.error);
  },

  setGlobalSettings: (settings: any) => {
    if (settings.aiCredits !== undefined) {
      currentCredits = settings.aiCredits;
    }

    // Porta de Sincronização: evita loops e chamadas concorrentes
    const hash = hashSettings(settings);
    const now = Date.now();

    // Proteger contra sincronizações idênticas ou muito próximas
    if (hash === _lastGlobalSettingsSerialized && now - _lastSettingsCallTs < 2000) {
      return;
    }

    // Proteger contra lock: uma única chamada por vez
    if (_syncLock) {
      return;
    }

    if (now - _lastSettingsCallTs < 300) {
      // chamadas muito próximas — ignorar
      return;
    }

    _syncLock = true;
    _lastGlobalSettingsSerialized = hash;
    _lastSettingsCallTs = now;

    fetch(`${API_BASE}/api/gemini/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings })
    }).catch(console.error).finally(() => {
      // Liberar lock após 800ms (tempo suficiente para backend processar)
      setTimeout(() => {
        _syncLock = false;
      }, 800);
    });
  },

  onCreditConsumed: (callback: (amount: number) => void) => {
    onCreditConsumed = callback;
  },

  getCooldownRemaining: () => geminiService.call('getCooldownRemaining'),

  call: async (method: string, ...args: any[]): Promise<any> => {
    if (!usingCustomKey && currentCredits <= 0 && method !== 'validateApiKey' && method !== 'getCooldownRemaining') {
      throw new Error("SALDO INSUFICIENTE: Seus créditos de IA acabaram. Recarregue na aba 'Carteira' ou adicione sua própria Chave API.");
    }

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

    const response = await fetch(`${API_BASE}/api/gemini/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown API error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    if (!usingCustomKey && method !== 'validateApiKey' && method !== 'getCooldownRemaining') {
      onCreditConsumed(1);
    }

    return response.json();
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
  fetchFipeValue: (vehicleName: string, model: string, year: string) => geminiService.call('fetchFipeValue', vehicleName, model, year),
  callAI: (prompt: string, jsonMode?: boolean, useGoogleSearch?: boolean, skipHistory?: boolean) => 
    geminiService.call('callAI', prompt, jsonMode, useGoogleSearch, skipHistory),
  clearHistory: () => geminiService.call('clearHistory'),
  validateApiKey: (key: string) => geminiService.call('validateApiKey', key),
};
