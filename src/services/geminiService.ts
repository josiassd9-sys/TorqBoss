// src/services/geminiService.ts
// Proxy service that calls the server-side Gemini API

let onCreditConsumed: (amount: number) => void = () => {};
let currentCredits = 0;
let usingCustomKey = false;

export const geminiService = {
  setApiKey: (key: string) => {
    // Key management is handled server-side via environment variables
    // But we still allow passing it for custom keys from settings
    usingCustomKey = !!key;
    fetch('/api/gemini/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    }).catch(console.error);
  },

  setGlobalSettings: (settings: any) => {
    if (settings.aiCredits !== undefined) {
      currentCredits = settings.aiCredits;
    }
    fetch('/api/gemini/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings })
    }).catch(console.error);
  },

  onCreditConsumed: (callback: (amount: number) => void) => {
    onCreditConsumed = callback;
  },

  getCooldownRemaining: () => geminiService.call('getCooldownRemaining'),

  // Generic caller for any method in the service
  call: async (method: string, ...args: any[]): Promise<any> => {
    // Verificação de créditos antes da chamada (se não for chave própria)
    if (!usingCustomKey && currentCredits <= 0 && method !== 'validateApiKey' && method !== 'getCooldownRemaining') {
      throw new Error("SALDO INSUFICIENTE: Seus créditos de IA acabaram. Recarregue na aba 'Carteira' ou adicione sua própria Chave API para continuar usando as funções automáticas.");
    }

    let body;
    
    // Deep sanitizer to ensure no React events or DOM elements are sent
    const sanitize = (val: any): any => {
      if (val === null || val === undefined) return val;
      if (typeof val !== 'object') return val;
      
      const seen = new WeakSet();
      
      const clean = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (seen.has(obj)) return '[Circular]';
        seen.add(obj);

        // Errors
        if (obj instanceof Error) return { message: obj.message, name: obj.name };
        // HTML Elements
        if (obj instanceof HTMLElement || (obj.constructor && obj.constructor.name.includes('Element'))) return `[DOM: ${obj.tagName || 'Node'}]`;
        // React events
        if (obj.nativeEvent || (obj.constructor && obj.constructor.name === 'SyntheticBaseEvent')) return '[React Event]';
        
        if (Array.isArray(obj)) return obj.map(clean);
        
        const result: any = {};
        for (const key of Object.keys(obj)) {
          // Skip internal React properties
          if (key.startsWith('__react') || key === '$$typeof' || key === '_owner') continue;
          
          try {
            const value = obj[key];
            result[key] = clean(value);
          } catch (e) {
            result[key] = '[Inaccessible]';
          }
        }
        return result;
      };

      try {
        return clean(val);
      } catch (e) {
        return '[Serialization Failed]';
      }
    };

    try {
      const sanitizedArgs = args.map(sanitize);
      body = JSON.stringify({ method, args: sanitizedArgs });
    } catch (e) {
      console.warn('Critical sanitization failure for AI call:', e);
      body = JSON.stringify({ method, args: ['[Critical Failure]'] });
    }

    const response = await fetch('/api/gemini/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown API error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    // Consumir crédito no client-side se for bem sucedido
    if (!usingCustomKey && method !== 'validateApiKey' && method !== 'getCooldownRemaining') {
      onCreditConsumed(1);
    }

    return response.json();
  },

  // Facade methods to match the previous interface
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
