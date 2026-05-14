import { GoogleGenAI } from "@google/genai";
import { Part } from "../types";

let currentApiKey = process.env.GEMINI_API_KEY || '';

// ==================== FUNÇÃO AUXILIAR ====================
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') return JSON.stringify(error);
  return 'Erro desconhecido';
};

const parseAIJson = <T>(text: string): T | null => {
  const normalize = (payload: string): string => {
    return payload
      .replace(/\r?\n/g, ' ')
      .replace(/\u2018|\u2019|\u201C|\u201D/g, '"')
      .replace(/```(?:json)?\s*([\s\S]*?)```/gi, '$1')
      .replace(/(['"])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":')
      .replace(/,\s*([}\]])/g, '$1')
      .trim();
  };

  const extractJsonPayload = (payload: string): string => {
    const codeBlockMatch = payload.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch && codeBlockMatch[1]) return codeBlockMatch[1].trim();

    const firstObject = payload.indexOf('{');
    const lastObject = payload.lastIndexOf('}');
    const firstArray = payload.indexOf('[');
    const lastArray = payload.lastIndexOf(']');

    if (firstObject >= 0 && lastObject > firstObject) {
      return payload.slice(firstObject, lastObject + 1).trim();
    }

    if (firstArray >= 0 && lastArray > firstArray) {
      return payload.slice(firstArray, lastArray + 1).trim();
    }

    return payload;
  };

  const payload = extractJsonPayload(text);

  try {
    return JSON.parse(payload) as T;
  } catch {
    try {
      return JSON.parse(normalize(payload)) as T;
    } catch {
      return null;
    }
  }
};

const parsePriceValue = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(/,/, '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizePriceType = (value: unknown): 'unidade' | 'jogo' | 'kit' | 'litro' | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (normalized.includes('jogo')) return 'jogo';
  if (normalized.includes('kit')) return 'kit';
  if (normalized.includes('litro')) return 'litro';
  return 'unidade';
};

// ==================== SERVIÇO PRINCIPAL ====================
export const geminiService = {
  setApiKey: (key: string) => {
    currentApiKey = key;
  },

  getAI: () => {
    return new GoogleGenAI({ apiKey: currentApiKey });
  },

  // ==================== GENERATE CONTENT helper ====================
  generateContent: async (prompt: string): Promise<string> => {
    try {
      const ai = geminiService.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text || response.data || '';
    } catch (error: any) {
      console.error("Gemini GenerateContent Error:", error);
      const errorStr = JSON.stringify(error);
      if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("QUOTA_EXHAUSTED: Limite de IA excedido. Tente novamente em 1 minuto.");
      }
      throw error;
    }
  },

  // ==================== RESEARCH PART ====================
  researchPart: async (partName: string, vehicleModel: string): Promise<{ 
    isAmbiguous: boolean; 
    suggestions?: string[]; 
    part?: Partial<Part> 
  }> => {
    try {
      const ai = geminiService.getAI();
      const prompt = `Analise a seguinte peça automotiva: "${partName}" para o veículo "${vehicleModel}".
        Se o nome for genérico e existirem várias variações (ex: "vidro", "lâmpada", "parafuso", "pneu"), retorne isAmbiguous: true e uma lista de sugestões específicas.
        Se for uma peça específica, retorne isAmbiguous: false e os detalhes da peça.
        Use PORTUGUÊS (Brasil).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      const payload = response.text || response.data || '';
      if (!payload) return { isAmbiguous: false };
      return JSON.parse(payload);
    } catch (error) {
      console.error("Gemini Research Error:", error);
      throw error;
    }
  },

  // ==================== SEARCH VEHICLE IMAGE ====================
  searchVehicleImage: async (vehicleModel: string): Promise<string | null> => {
    try {
      const ai = geminiService.getAI();
      const prompt = `Encontre o link direto de uma foto oficial (lateral 3/4) do veículo: "${vehicleModel}". Retorne apenas um JSON com o campo "url".`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        }
      });

      const raw = response.text || response.data || '';
      const parsed = JSON.parse(raw);
      return parsed.url || null;
    } catch (error) {
      console.error("Gemini Image Search Error:", error);
      return null;
    }
  },

  // ==================== SEARCH VEHICLE BY PLATE API (OPTIONAL) ====================
  searchVehicleByPlateAPI: async (plate: string, apiKey?: string, deviceToken?: string): Promise<any | null> => {
    if (!plate || !apiKey) return null;
    try {
      const response = await fetch(`https://gateway.apibrasil.io/api/v2/vehicles/dados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(deviceToken ? { DeviceToken: deviceToken } : {}),
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({ placa: plate })
      });

      if (!response.ok) {
        console.warn('Plate API returned status', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Plate API Request Error:', error);
      return null;
    }
  },

  searchVehicleByPlateViaHost: async (plate: string, host?: string): Promise<{
    name?: string;
    model?: string;
    year?: string;
    fipeValue?: number;
    imageUrl?: string;
    brandLogoUrl?: string;
    success: boolean;
    message?: string;
  }> => {
    if (!plate || !host) {
      return { success: false, message: 'Host de API de placa não configurado' };
    }

    const baseUrl = host.trim().replace(/\/+$/, '');
    const parsePayload = (payload: any) => {
      if (!payload || typeof payload !== 'object') return null;
      const data = payload.veiculo || payload;
      const name = data.marca || data.brand || data.make || data.manufacturer || '';
      const model = data.modelo || data.model || '';
      const year = [data.ano || data.year, data.anoModelo || data.yearModel].filter(Boolean).join('/');
      if (!name && !model && !year) return null;
      return {
        name,
        model,
        year,
        imageUrl: data.foto || data.imageUrl || data.image,
        brandLogoUrl: data.logo || data.brandLogoUrl,
        success: true
      };
    };

    const requestOptions = async (url: string, options: RequestInit) => {
      try {
        const response = await fetch(url, options);
        if (!response.ok) return { ok: false, payload: null as any };
        const payload = await response.json();
        return { ok: true, payload };
      } catch (error) {
        console.warn('Plate host request failed:', error);
        return { ok: false, payload: null as any };
      }
    };

    const candidates = [
      { url: `${baseUrl}/api/plates/${plate}`, options: { method: 'GET', headers: { 'Content-Type': 'application/json' } } },
      { url: `${baseUrl}/consultar-placa`, options: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ placa: plate, plate }) } },
      { url: `${baseUrl}/plates`, options: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ placa: plate, plate }) } }
    ];

    for (const candidate of candidates) {
      const result = await requestOptions(candidate.url, candidate.options);
      if (!result.ok) continue;
      const parsed = parsePayload(result.payload);
      if (parsed) return parsed;
    }

    return { success: false, message: 'Não foi possível consultar o host de placa' };
  },

  searchVehicleByPlateSinesp: async (plate: string): Promise<{
    name?: string;
    model?: string;
    year?: string;
    fipeValue?: number;
    imageUrl?: string;
    brandLogoUrl?: string;
    success: boolean;
    message?: string;
  }> => {
    const endpoints = [
      {
        url: 'https://sinesp.cetsp.com.br/api/consultar-placa',
        method: 'POST',
        body: { placa: plate }
      },
      {
        url: 'https://plataforma.senatran.serpro.gov.br/sinesp-vinculador/api/consultar-placa',
        method: 'POST',
        body: { placa: plate }
      },
      {
        url: 'https://api.sinesp.godetran.com.br/api/v1/plates/search',
        method: 'POST',
        body: { plate }
      }
    ];

    const parseResponse = (data: any): any | null => {
      if (!data || typeof data !== 'object') return null;

      const vehicle = data.veiculo || data.vehicle || data.data || data;
      if (!vehicle) return null;

      const hasValidFields = vehicle.marca || vehicle.brand || vehicle.modelo || vehicle.model || vehicle.placa || vehicle.plate;
      if (!hasValidFields) return null;

      return {
        name: vehicle.marca || vehicle.brand || vehicle.make || '',
        model: vehicle.modelo || vehicle.model || '',
        year: vehicle.ano || vehicle.year || vehicle.anoModelo || vehicle.yearModel || '',
        imageUrl: vehicle.foto || vehicle.image || vehicle.imageUrl || undefined,
        brandLogoUrl: vehicle.logo || vehicle.brandLogoUrl || undefined,
        success: true
      };
    };

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body: JSON.stringify(endpoint.body)
        });

        console.log(`[SINESP] ${endpoint.url} - Status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log('[SINESP] Response:', data);

          const result = parseResponse(data);
          if (result) {
            return result;
          }

          if (data.mensagem) {
            console.log('[SINESP] Mensagem:', data.mensagem);
            return { success: false, message: data.mensagem };
          }
        } else {
          const text = await response.text().catch(() => '');
          console.warn(`[SINESP] Status ${response.status}: ${text.substring(0, 200)}`);
        }
      } catch (error) {
        console.warn(`[SINESP] Erro ao consultar ${endpoint.url}:`, error);
      }
    }

    return { success: false, message: 'Não foi possível consultar SINESP' };
  },

  // ==================== PARSE RAW VEHICLE DATA (Assisted Search) ====================
  parseRawVehicleData: async (text: string): Promise<any> => {
    try {
      const ai = geminiService.getAI();
      const prompt = `Extraia dados técnicos do veículo brasileiro deste texto: "${text}". 
        Retorne um JSON com: name, model, year, color, plate, success (boolean).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const payload = response.text || response.data || '';
      const parsed = JSON.parse(payload);
      return {
        ...parsed,
        success: parsed.success !== false && (!!parsed.name || !!parsed.model)
      };
    } catch (error: any) {
      console.error('Erro ao processar dados brutos:', error);
      return { success: false, error: 'Falha ao processar dados.' };
    }
  },

  // ==================== SEARCH VEHICLE BY PLATE ====================
  searchVehicleByPlate: async (plate: string, externalApiKey?: string, externalApiDeviceToken?: string, externalApiHost?: string): Promise<{
    name?: string;
    model?: string;
    year?: string;
    color?: string;
    fipeValue?: number;
    imageUrl?: string;
    brandLogoUrl?: string;
    success: boolean;
    message?: string;
  }> => {
    const formattedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!formattedPlate || formattedPlate.length !== 7) {
      return { success: false, message: 'Placa inválida' };
    }

    // 1. Tenta API Externa se configurada
    if (externalApiKey) {
      try {
        const apiResult = await geminiService.searchVehicleByPlateAPI(formattedPlate, externalApiKey, externalApiDeviceToken);
        const payload = apiResult?.veiculo || apiResult;
        if (payload?.placa || payload?.plate) {
          return {
            name: payload?.marca || payload?.brand || '',
            model: payload?.modelo || payload?.model || '',
            year: [payload?.ano || payload?.year, payload?.anoModelo || payload?.yearModel].filter(Boolean).join('/'),
            color: payload?.cor || payload?.color || '',
            fipeValue: parsePriceValue(payload?.valorFipe || payload?.fipeValue || payload?.price) ?? undefined,
            imageUrl: payload?.foto || payload?.imageUrl,
            brandLogoUrl: payload?.logo || payload?.brandLogoUrl,
            success: true
          };
        }
      } catch (e) {
        console.warn('Erro na API externa de placa, continuando para outras fontes...');
      }
    }

    // 2. Tenta Host Customizado se configurado
    if (externalApiHost) {
      const hostResult = await geminiService.searchVehicleByPlateViaHost(formattedPlate, externalApiHost);
      if (hostResult.success) {
        return hostResult as any;
      }
    }

    // 3. Tenta Fontes Públicas via Gemini com Web Search (A forma mais robusta)
    try {
      const ai = geminiService.getAI();
      const prompt = `Consulte os dados REAIS da placa brasileira "${formattedPlate}".
        Acesse sites de consulta de placa para verificar marca, modelo, ano e cor.
        Retorne um JSON com: name, model, year, color, success (boolean).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        }
      });

      const payload = response.text || response.data || '';
      const parsed = JSON.parse(payload);
      
      if (parsed && parsed.success !== false && (parsed.name || parsed.model)) {
        return {
          name: parsed.name || '',
          model: parsed.model || '',
          year: parsed.year || '',
          color: parsed.color || '',
          success: true
        };
      }
      return { success: false, message: 'Placa não encontrada.' };
    } catch (error: any) {
      console.error("Erro na busca avançada por placa:", error);
      return { success: false, message: "Erro ao acionar o Robô." };
    }
  },

  // ==================== ESTIMATE PART PRICE ====================
  estimatePartPrice: async (partName: string, vehicleModel: string): Promise<{ 
    estimatedPrice: number; 
    priceType: 'unidade' | 'jogo' | 'kit' | 'litro'; 
    unitsPerSet?: number 
  } | null> => {
    try {
      const ai = geminiService.getAI();
      const prompt = `Estime o preço de mercado brasileiro para a peça "${partName}" do veículo "${vehicleModel}".
        Considere marcas de boa qualidade. Retorne um JSON com: estimatedPrice (número), priceType ('unidade', 'jogo', 'kit', 'litro'), unitsPerSet (opcional).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        }
      });

      const payload = response.text || response.data || '';
      if (!payload) return null;
      const parsed = JSON.parse(payload);
      const estimatedPrice = parsePriceValue(parsed.estimatedPrice ?? parsed.price ?? parsed.valor);
      
      if (estimatedPrice === null) return null;

      return {
        estimatedPrice,
        priceType: (parsed.priceType || 'unidade') as any,
        unitsPerSet: parsed.unitsPerSet
      };
    } catch (error) {
      console.error("Gemini Price Estimate Error:", error);
      return null;
    }
  },

  // ==================== SIMULATE MAINTENANCE ====================
  simulateMaintenance: async (vehicleModel: string, mileage: number): Promise<{
    recommendations: {
      partName: string;
      action: string;
      reason: string;
      estimatedCost: number;
      urgency: 'baixa' | 'media' | 'alta';
    }[]
  }> => {
    try {
      const ai = geminiService.getAI();
      const prompt = `Gere um plano de manutenção preventiva para o veículo "${vehicleModel}" aos ${mileage} km.
        Retorne um JSON com o array "recommendations": [{ partName, action, reason, estimatedCost, urgency ('baixa'|'media'|'alta') }].`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      const payload = response.text || response.data || '';
      if (!payload) return { recommendations: [] };
      return JSON.parse(payload);
    } catch (error) {
      console.error("Gemini Maintenance Simulation Error:", error);
      return { recommendations: [] };
    }
  },

  // ==================== SIMULATE MAINTENANCE FROM MANUAL ====================
  simulateMaintenanceFromManual: async (
    vehicleModel: string,
    mileage: number,
    manualContext?: { maintenanceSchedule?: Array<{ mileage: number; items: string[] }> }
  ): Promise<{
    recommendations: {
      partName: string;
      action: string;
      reason: string;
      estimatedCost: number;
      urgency: 'baixa' | 'media' | 'alta';
      fromManual?: boolean;
    }[]
  }> => {
    try {
      // If manual has maintenance schedule, use it
      if (manualContext?.maintenanceSchedule && manualContext.maintenanceSchedule.length > 0) {
        const relevantSchedules = manualContext.maintenanceSchedule.filter(
          s => s.mileage <= mileage && s.mileage > (mileage - 10000)
        );

        if (relevantSchedules.length > 0) {
          const allItems = relevantSchedules.flatMap(s => s.items);
          
          const ai = geminiService.getAI();
          const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: `Para o veículo "${vehicleModel}" aos ${mileage} km, o manual recomenda: ${allItems.join(', ')}.
            
            Gere estimativas de custo e urgência para cada item. Retorne APENAS um JSON com este formato:
            {
              "recommendations": [
                 {"partName": "item", "action": "ação", "reason": "motivo do manual", "estimatedCost": número, "urgency": "urgência"}
              ]
            }
            
            Valores estimados em reais, mercado brasileiro. Sem texto adicional.`,
            config: {
              tools: [{ googleSearch: {} }]
            }
          });

          const payload = response.text || response.data || '';
          const parsed = parseAIJson<{ recommendations: Array<{ partName: string; action: string; reason: string; estimatedCost: number; urgency: 'baixa' | 'media' | 'alta' }> }>(payload);
          
          if (parsed?.recommendations) {
            return {
              recommendations: parsed.recommendations.map(r => ({
                ...r,
                fromManual: true
              }))
            };
          }
        }
      }

      // Fallback: use generic maintenance simulation
      return await geminiService.simulateMaintenance(vehicleModel, mileage);
    } catch (error) {
      console.error("Gemini Maintenance from Manual Error:", error);
      return { recommendations: [] };
    }
  },

  // ==================== OUTRAS FUNÇÕES (mantidas e melhoradas) ====================
  getVehicleManualInfo: async (vehicleModel: string): Promise<string> => {
    try {
      const ai = geminiService.getAI();
      const prompt = `Gere um resumo técnico detalhado do manual do proprietário para o veículo "${vehicleModel}". 
        Inclua: especificações de fluidos, pressões de pneus, torques e intervalos de manutenção. Use Markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      return response.text || "Manual não disponível.";
    } catch (error) {
      console.error("Gemini Manual Info Error:", error);
      return "Erro ao carregar manual técnico.";
    }
  },

  extractTechnicalInfoFromPDF: async (pdfBase64: string, vehicleModel: string): Promise<string> => {
    try {
      const ai = geminiService.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            text: `Analise este manual em PDF para o veículo "${vehicleModel}". 
            Extraia todas as informações técnicas relevantes, especialmente:
            1. Especificações de fluidos e capacidades.
            2. Tabela de manutenção periódica.
            3. Tabela de pressões de pneus.
            4. Torques de aperto e ajustes finos.
            5. Informações sobre modificações se presentes no documento.
            
            Formate como Markdown profissional e detalhado. Retorne em PORTUGUÊS (Brasil).`,
          },
        ],
      });
      return response.text || "Não foi possível extrair texto do PDF.";
    } catch (error) {
      console.error("Gemini PDF Extraction Error:", error);
      return "Erro ao processar o arquivo PDF.";
    }
  },

  chatWithManual: async (question: string, context: string, vehicleModel: string): Promise<string> => {
    try {
      const ai = geminiService.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Você é um mecânico especialista assistente. Responda à pergunta do usuário sobre o veículo "${vehicleModel}".
        Contexto extraído do manual técnico:
        ---
        ${context}
        ---
        Pergunta: ${question}
        
        Responda de forma clara, objetiva e em PORTUGUÊS (Brasil).`,
      });
      return response.text || "Desculpe, não consegui processar sua pergunta.";
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "Erro na comunicação com a IA.";
    }
  },

  fetchFipeValue: async (vehicleName: string, model: string, year: string): Promise<number> => {
    try {
      const ai = geminiService.getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Estime o valor atual de mercado (Tabela FIPE) para o veículo: ${vehicleName} ${model} ano ${year}. 
        Retorne APENAS um objeto JSON com leds "price" (número).`,
      });
      const payload = response.text || response.data || '';
      if (!payload) return 0;
      const resData = parseAIJson<{ price?: number }>(payload);
      return resData?.price || 0;
    } catch (error) {
      console.error("Fipe Update Error:", error);
      return 0;
    }
  }
};
