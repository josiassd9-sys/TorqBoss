import { GoogleGenAI } from "@google/genai";
import { Part } from "../types";

let currentApiKey = process.env.GEMINI_API_KEY || '';
let isUsingCustomKey = false;

let globalSettings = {
  language: 'pt-BR',
  currency: 'BRL',
  distanceUnit: 'km',
  fuelUnit: 'L',
  region: 'Brasil',
  marketReferenceName: 'Tabela FIPE'
};

const referenceMap: Record<string, string> = {
  'Tabela FIPE': 'Tabela FIPE (Fundação Instituto de Pesquisas Econômicas) - referência oficial de preços de veículos usados no Brasil',
  'Kelley Blue Book': 'Kelley Blue Book (KBB) - standard for vehicle valuation and automotive research',
  'Eurotax': 'Eurotax - standard automotive pricing reference in Europe',
  'NADA': 'NADA Guides - National Automobile Dealers Association pricing reference'
};

// Histórico de mensagens para manter contexto multi-turn
let conversationHistory: Array<{ role: 'user' | 'model', content: string }> = [];

// ==================== FUNÇÃO AUXILIAR ====================
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return 'Erro desconhecido';
};

const getGlobalContextPrompt = () => {
  const fullRef = referenceMap[globalSettings.marketReferenceName] || globalSettings.marketReferenceName;
  return `[CONTEXTO DE OPERAÇÃO:
    - Idioma: ${globalSettings.language}
    - Moeda Local: ${globalSettings.currency}
    - Unidades: ${globalSettings.distanceUnit}, ${globalSettings.fuelUnit}
    - Região: ${globalSettings.region}
    - Referência de Preços: ${fullRef}
    
    INSTRUÇÕES:
    1. Forneça respostas preferencialmente em ${globalSettings.language}.
    2. Use a moeda ${globalSettings.currency} para todos os valores monetários.
    3. Quando falar de preços de carros, baseie-se estritamente na ${globalSettings.marketReferenceName}.
    4. Mantenha um tom técnico, automotivo e preciso.]\n\n`;
};

const parseAIJson = <T>(text: string): T | null => {
  if (!text) return null;

  const normalize = (payload: string): string => {
    try {
      if (typeof payload !== 'string') return '';
      return payload
        .replace(/\r?\n/g, ' ')
        .replace(/\u2018|\u2019|\u201C|\u201D/g, '"')
        .replace(/(['"])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":')
        .replace(/,\s*([}\]])/g, '$1')
        .trim();
    } catch {
      return payload || '';
    }
  };

  const extractJsonPayload = (payload: string): string => {
    if (typeof payload !== 'string') return '';
    
    // Ignora o bloco de fontes de pesquisa para não quebrar o JSON
    const cleanPayload = payload.split('[SEARCH_SOURCES]:')[0].trim();
    
    // Tenta extrair de blocos Markdown primeiro
    const codeBlockMatch = cleanPayload.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch && codeBlockMatch[1]) return codeBlockMatch[1].trim();

    // Tenta encontrar o primeiro { ou [ e o último } ou ]
    const firstObject = cleanPayload.indexOf('{');
    const lastObject = cleanPayload.lastIndexOf('}');
    const firstArray = cleanPayload.indexOf('[');
    const lastArray = cleanPayload.lastIndexOf(']');

    let start = -1;
    let end = -1;

    if (firstObject !== -1 && (firstArray === -1 || firstObject < firstArray)) {
      start = firstObject;
      end = lastObject;
    } else if (firstArray !== -1) {
      start = firstArray;
      end = lastArray;
    }

    if (start !== -1 && end > start) {
      return cleanPayload.slice(start, end + 1).trim();
    }

    return cleanPayload.trim();
  };

  const payload = extractJsonPayload(text);

  try {
    return JSON.parse(payload) as T;
  } catch (e) {
    try {
      const normalized = normalize(payload);
      return JSON.parse(normalized) as T;
    } catch (e2) {
      console.warn("Falha ao parsear JSON da IA:", text);
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
    const systemKey = process.env.GEMINI_API_KEY || '';
    isUsingCustomKey = !!key && key !== systemKey;
    
    // Se for uma chave pessoal, remove qualquer bloqueio de cota anterior
    if (isUsingCustomKey) {
      (global as any).geminiCooldownUntil = 0;
    }
  },

  setGlobalSettings: (settings: any) => {
    globalSettings = { ...globalSettings, ...settings };
  },

  getCooldownRemaining: (): number => {
    if (typeof (global as any).geminiCooldownUntil === 'number' && (global as any).geminiCooldownUntil > Date.now()) {
      return Math.ceil(((global as any).geminiCooldownUntil - Date.now()) / 1000);
    }
    return 0;
  },

  detectRegionalDefaults: async (locale: string, timezone: string): Promise<any> => {
    try {
      const prompt = `Com base no locale "${locale}" e timezone "${timezone}", defina as configurações ideais de um aplicativo automotivo.
        Retorne um JSON com:
        - language: ('pt-BR', 'en-US' ou 'es-ES')
        - currency: ('BRL', 'USD' ou 'EUR')
        - distanceUnit: ('km' ou 'mi')
        - fuelUnit: ('L' ou 'gal')
        - region: Nome do país
        - marketReferenceName: O nome da principal tabela de preços de carros usados nessa região (ex: "Tabela FIPE" no Brasil, "Kelley Blue Book" nos EUA, "Eurotax" na Europa).
        
        Seja preciso.`;
        
      const payload = await geminiService.callAI(prompt, true);
      const parsed = parseAIJson<any>(payload);
      return parsed || {
        language: 'pt-BR',
        currency: 'BRL',
        distanceUnit: 'km',
        fuelUnit: 'L',
        region: 'Brasil',
        marketReferenceName: 'Tabela FIPE'
      };
    } catch (e) {
      return {
        language: 'pt-BR',
        currency: 'BRL',
        distanceUnit: 'km',
        fuelUnit: 'L',
        region: 'Brasil',
        marketReferenceName: 'Tabela FIPE'
      };
    }
  },

  getAI: () => {
    return new GoogleGenAI({ 
      apiKey: currentApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  },

  // ==================== EXECUÇÃO CENTRALIZADA COM RETRY ====================
  _executeWithRetry: async <T>(operation: (ai: any) => Promise<T>): Promise<T> => {
    let retries = 0;
    const maxRetries = 5;
    const baseDelay = 2000;
    
    // Controle global de cooldown - ignorado se for chave customizada
    if (!isUsingCustomKey && typeof (global as any).geminiCooldownUntil === 'number' && (global as any).geminiCooldownUntil > Date.now()) {
      const remainingSec = Math.ceil(((global as any).geminiCooldownUntil - Date.now()) / 1000);
      throw new Error(`AGUARDE: Limite de IA atingido por segurança. Tente em ${remainingSec} segundos.`);
    }

    const execute = async (): Promise<T> => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TIMEOUT_IA")), 15000)
      );

      try {
        const ai = geminiService.getAI();
        return await Promise.race([operation(ai), timeoutPromise]) as T;
      } catch (error: any) {
        const errorMsg = String(error?.message || '');
        let errorStr = errorMsg;
        try {
          if (error && typeof error === 'object') {
            errorStr += ' ' + JSON.stringify(error);
          }
        } catch {
          // Ignore serialization errors
        }
        const isQuotaError = errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("QUOTA_EXHAUSTED") || errorStr.includes("quota") || errorStr.includes("limit");
        const isTransientError = errorStr.includes("503") || errorStr.includes("500") || errorStr.includes("502") || errorStr.includes("504") || errorStr.includes("UNAVAILABLE");
        
        if (errorMsg === "TIMEOUT_IA") {
          throw new Error("LENTIDÃO: A IA está demorando muito para responder. Tente novamente ou use a busca manual.");
        }

        const maxRetriesForQuota = 3; // Aumentado para 3 tentativas
        const maxRetriesForTransient = 4;

        if (isQuotaError && retries < maxRetriesForQuota) {
          retries++;
          // Delays progressivos: 5s, 10s, 20s
          const delay = 5000 * Math.pow(2, retries - 1); 
          console.warn(`[GEMINI] Cota atingida. Tentativa ${retries}/${maxRetriesForQuota}. Reiniciando em ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return execute();
        }

        if (isTransientError && retries < maxRetriesForTransient) {
          retries++;
          const delay = baseDelay * Math.pow(2, retries);
          console.warn(`[GEMINI] Erro temporário no servidor. Retrying in ${delay}ms... (${retries}/${maxRetriesForTransient})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return execute();
        }
        
        if (isQuotaError) {
          // Ativa cooldown de 30 segundos
          if (!isUsingCustomKey) {
            (global as any).geminiCooldownUntil = Date.now() + 30000;
          }
          
          const msg = isUsingCustomKey 
            ? "LIMITE_SUA_CHAVE: Sua Chave API pessoal atingiu o limite de cota do Google. Aguarde alguns segundos e tente novamente."
            : "LIMITE_IA: O limite de uso gratuito compartilhado foi atingido. Aguarde 30 segundos ou adicione sua própria Chave API em Configurações > Chave API para uso ilimitado.";
          
          throw new Error(msg);
        }
        
        throw error;
      }
    };

    return execute();
  },

  // Centralizado para garantir contexto global em todas as chamadas
  callAI: async (prompt: string, jsonMode = false, useGoogleSearch = false, skipHistory = false): Promise<string> => {
    return geminiService._executeWithRetry(async (ai) => {
      const context = getGlobalContextPrompt();
      const fullPrompt = `${context}\n${prompt}`;

      if (skipHistory) {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          config: {
            responseMimeType: jsonMode ? "application/json" : undefined,
            tools: useGoogleSearch ? [{ googleSearch: {} }] : undefined
          }
        });
        
        let text = response.text || '';
        
        // Extrair grounding links se disponíveis para ajudar buscas técnicas
        if (useGoogleSearch) {
          const groundingMetadata = (response as any).candidates?.[0]?.groundingMetadata;
          const chunks = groundingMetadata?.groundingChunks;
          if (Array.isArray(chunks)) {
            const links = chunks
              .map((c: any) => c.web?.uri)
              .filter((uri: any) => typeof uri === 'string' && uri.startsWith('http'));
            
            if (links.length > 0) {
              text += `\n\n[SEARCH_SOURCES]: ${JSON.stringify(links)}`;
            }
          }
        }
        
        return text;
      }

      // Auto-detectar necessidade de busca se não for explícito
      const needsSearch = useGoogleSearch || /preço|valor|fipe|peça|quanto custa|cotação|onde comprar/i.test(prompt);

      // Adicionar nova mensagem ao histórico
      conversationHistory.push({ role: 'user', content: fullPrompt });

      // Limitar histórico para não estourar o contexto (manter últimas 10 trocas)
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: conversationHistory.map(h => ({
          role: h.role, 
          parts: [{ text: h.content }]
        })),
        config: {
          responseMimeType: jsonMode ? "application/json" : undefined,
          tools: needsSearch ? [{ googleSearch: {} }] : undefined
        }
      });
      
      let resultText = response.text || '';
      
      if (needsSearch) {
        const groundingMetadata = (response as any).candidates?.[0]?.groundingMetadata;
        const chunks = groundingMetadata?.groundingChunks;
        if (Array.isArray(chunks)) {
          const links = chunks
            .map((c: any) => c.web?.uri)
            .filter((uri: any) => typeof uri === 'string' && uri.startsWith('http'));
          
          if (links.length > 0) {
            resultText += `\n\n[SEARCH_SOURCES]: ${JSON.stringify(links)}`;
          }
        }
      }
      
      // Persistir resposta do modelo no histórico
      conversationHistory.push({ role: 'model', content: resultText });
      
      return resultText;
    });
  },

  clearHistory: () => {
    conversationHistory = [];
  },

  // ==================== GENERATE CONTENT helper ====================
  generateContent: async (prompt: string): Promise<string> => {
    return geminiService.callAI(prompt);
  },

  // ==================== RESEARCH PART ====================
  researchPart: async (partName: string, vehicleModel: string): Promise<{ 
    isAmbiguous: boolean; 
    suggestions?: string[]; 
    part?: Partial<Part> 
  }> => {
    try {
      const prompt = `Analise a seguinte peça automotiva: "${partName}" para o veículo "${vehicleModel}".
        Se o nome for genérico e existirem várias variações (ex: "vidro", "lâmpada", "parafuso", "pneu"), retorne isAmbiguous: true e uma lista de sugestões específicas.
        Se for uma peça específica, retorne isAmbiguous: false e os detalhes da peça.`;

      const payload = await geminiService.callAI(prompt, true);
      if (!payload) return { isAmbiguous: false };
      return parseAIJson<any>(payload) || { isAmbiguous: false };
    } catch (error) {
      console.error("Gemini Research Error:", error);
      throw error;
    }
  },

  // ==================== SEARCH VEHICLE LOGO ====================
  searchVehicleLogo: async (brandName: string): Promise<{ url: string | null; candidates: string[]; searchUrl: string }> => {
    const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(brandName + ' logotipo oficial png transparente')}&tbm=isch`;
    try {
      const prompt = `ALVO: Localizar links DIRETOS de logotipos OFICIAIS e com fundo TRANSPARENTE da marca: "${brandName}".
        
        INSTRUÇÕES DE RIGOR:
        1. PRIORIDADE: Links de domínios como wikimedia.org, seeklogo.com, logo.wine, worldvectorlogo.com.
        2. FORMATO: O link deve terminar em .png ou .webp.
        3. QUALIDADE: Deve ser o logo moderno e nítido.
        
        Retorne um JSON com:
        - "url": o melhor link único encontrado.
        - "candidates": uma lista com os 3 melhores links encontrados para teste de integridade.
        - "searchUrl": link de busca reserva.`;

      const raw = await geminiService.callAI(prompt, true, true, true);
      const parsed = parseAIJson<any>(raw);
      
      // Extrair links adicionais do bloco [SEARCH_SOURCES] se existir
      const searchSourcesMatch = raw.split('[SEARCH_SOURCES]:');
      let extraLinks: string[] = [];
      if (searchSourcesMatch.length > 1) {
        try {
          const sourcesStr = searchSourcesMatch[1].trim();
          const closingBracketIdx = sourcesStr.lastIndexOf(']');
          if (closingBracketIdx !== -1) {
            extraLinks = JSON.parse(sourcesStr.substring(0, closingBracketIdx + 1));
          }
        } catch (e) {}
      }

      const candidates = Array.isArray(parsed?.candidates) ? parsed.candidates : (parsed?.url ? [parsed.url] : []);
      
      // Mesclar candidatos do JSON com links das fontes de pesquisa
      const allCandidates = Array.from(new Set([...candidates, ...extraLinks]));

      return {
        url: parsed?.url || (allCandidates.length > 0 ? allCandidates[0] : null),
        candidates: allCandidates,
        searchUrl: parsed?.searchUrl || fallbackSearchUrl
      };
    } catch (error) {
      console.error("Gemini Logo Search Error:", error);
      return { url: null, candidates: [], searchUrl: fallbackSearchUrl };
    }
  },

  // ==================== SEARCH VEHICLE IMAGE ====================
  searchVehicleImage: async (vehicleModel: string): Promise<{ url: string | null; candidates: string[]; searchUrl: string }> => {
    const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(vehicleModel + ' foto oficial alta resolução')}&tbm=isch`;
    try {
      const prompt = `LOCALIZAÇÃO DE IMAGENS: "${vehicleModel}". 
      Procure por fotos oficiais, alta resolução, de múltiplos ângulos (frente, lateral, traseira, interior).
      Retorne APENAS JSON: 
      {
        "url": "link_da_melhor_foto_principal", 
        "candidates": ["lista_com_ate_12_links_diretos_de_fotos"], 
        "searchUrl": "${fallbackSearchUrl}"
      }. 
      Use apenas domínios estáveis (Wikipedia, NetCarShow, sites de imprensa, portais automotivos oficiais).`;

      const raw = await geminiService.callAI(prompt, true, true, true);
      const parsed = parseAIJson<any>(raw);
      
      // Extrair links adicionais do bloco [SEARCH_SOURCES] se existir
      const searchSourcesMatch = raw.split('[SEARCH_SOURCES]:');
      let extraLinks: string[] = [];
      if (searchSourcesMatch.length > 1) {
        try {
          const sourcesStr = searchSourcesMatch[1].trim();
          const closingBracketIdx = sourcesStr.lastIndexOf(']');
          if (closingBracketIdx !== -1) {
            extraLinks = JSON.parse(sourcesStr.substring(0, closingBracketIdx + 1));
          }
        } catch (e) {}
      }

      const candidates = Array.isArray(parsed?.candidates) ? parsed.candidates : (parsed?.url ? [parsed.url] : []);
      
      // Mesclar candidatos do JSON com links das fontes de pesquisa
      const allCandidates = Array.from(new Set([...candidates, ...extraLinks]));

      return {
        url: parsed?.url || (allCandidates.length > 0 ? allCandidates[0] : null),
        candidates: allCandidates,
        searchUrl: parsed?.searchUrl || fallbackSearchUrl
      };
    } catch (error) {
      console.error("Gemini Image Search Error:", error);
      return { url: null, candidates: [], searchUrl: fallbackSearchUrl };
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
      const textStr = String(text || '');
      if (!textStr.trim()) return { success: false, error: 'Texto vazio.' };

      // Limpeza básica para reduzir tokens inúteis. Mantemos um limite seguro.
      const cleanText = textStr.substring(0, 15000).replace(/\s+/g, ' ').trim();

      const prompt = `EXIBIR: Ficha Técnica Veicular Completa.
        TEXTO BRUTO: "${cleanText}"
        
        Sua tarefa é extrair todos os dados técnicos deste veículo e convertê-los em um JSON estruturado.
        
        INSTRUÇÕES CRÍTICAS:
        1. MARCA E MODELO: Identifique o fabricante (name) e a linha/modelo (model). Seja preciso.
        2. VERSÃO: Identifique a versão específica (ex: LXR, SE, Highline, Sport).
        3. ANO: Procure pelo ano de fabricação/modelo. Formate como "YYYY" ou "YYYY/YYYY".
        4. COR E COMBUSTÍVEL: Extraia a cor predominante e o tipo de combustível.
        5. MOTOR E CHASSI: Cilindrada/Válvulas/Potência e chassi (VIN) se disponível.
        6. KM E VALOR: Extraia a quilometragem atual e o valor de mercado (FIPE/KBB). Converta para NÚMERO (sem textos, moedas ou pontos de milhares).
        7. PLACA: Extraia a placa se estiver presente no texto.
        
        FORMATO DO JSON (ESTRITAMENTE OBRIGATÓRIO):
        {
          "name": "string",
          "model": "string",
          "version": "string",
          "year": "string",
          "color": "string",
          "fuelType": "string",
          "engine": "string",
          "chassis": "string",
          "plate": "string",
          "mileage": number,
          "fipeValue": number,
          "success": true
        }
        
        Se não encontrar MARCA e MODELO minimamente identificáveis em meio ao texto, defina "success": false.`;

      const payload = await geminiService.callAI(prompt, true, false, true);
      const parsed = parseAIJson<any>(payload);
      
      if (!parsed) return { success: false, error: 'Falha no parse do JSON da IA.' };

      // Sanitização básica dos dados retornados
      const sanitize = (val: any) => {
        if (typeof val === 'string') return val.trim();
        return val;
      };

      const plate = sanitize(parsed.plate)?.toUpperCase().replace(/[^A-Z0-9]/g, '') || null;

      const finalResult = {
        name: sanitize(parsed.name),
        model: sanitize(parsed.model),
        version: sanitize(parsed.version),
        year: sanitize(parsed.year),
        color: sanitize(parsed.color),
        fuelType: sanitize(parsed.fuelType),
        engine: sanitize(parsed.engine),
        chassis: sanitize(parsed.chassis),
        plate: plate,
        mileage: typeof parsed.mileage === 'number' ? parsed.mileage : null,
        fipeValue: typeof parsed.fipeValue === 'number' ? parsed.fipeValue : null,
        success: parsed.success === true && (!!parsed.name || !!parsed.model)
      };

      console.log(`[AI] Parse Raw Data Result: ${finalResult.success ? 'SUCCESS' : 'FAILED'} - ${finalResult.name} ${finalResult.model}`);
      return finalResult;
    } catch (error: any) {
      console.error('Erro ao processar dados brutos na IA:', error);
      return { success: false, error: String(error?.message || 'Falha ao processar dados.') };
    }
  },

  // ==================== SEARCH VEHICLE BY PLATE ====================
  searchVehicleByPlate: async (plate: string, externalApiKey?: string, externalApiDeviceToken?: string, externalApiHost?: string, countryId: string = 'BR'): Promise<{
    name?: string;
    model?: string;
    year?: string;
    color?: string;
    engine?: string;
    version?: string;
    fuelType?: string;
    chassis?: string;
    fipeValue?: number;
    imageUrl?: string;
    brandLogoUrl?: string;
    success: boolean;
    message?: string;
  }> => {
    const formattedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Validação mínima (maioria dos países tem entre 4 e 9 dígitos)
    if (!formattedPlate || formattedPlate.length < 4 || formattedPlate.length > 10) {
      return { success: false, message: 'Placa inválida para o país selecionado' };
    }

    // 1. Tenta API Externa se configurada
    if (externalApiKey && countryId === 'BR') {
      try {
        const apiResult = await geminiService.searchVehicleByPlateAPI(formattedPlate, externalApiKey, externalApiDeviceToken);
        const payload = apiResult?.veiculo || apiResult;
        if (payload?.placa || payload?.plate) {
          return {
            name: payload?.marca || payload?.brand || '',
            model: payload?.modelo || payload?.model || '',
            year: [payload?.ano || payload?.year, payload?.anoModelo || payload?.yearModel].filter(Boolean).join('/'),
            color: payload?.cor || payload?.color || '',
            engine: payload?.motor || payload?.engine || '',
            version: payload?.versao || payload?.version || '',
            fuelType: payload?.combustivel || payload?.fuel || '',
            chassis: payload?.chassi || payload?.chassis || '',
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

    // 3. Tenta Fontes Públicas via Gemini com Web Search (O Robô Digital)
    try {
      const prompt = `ALVO: Localizar a ficha técnica do veículo.
        PLACA: "${formattedPlate}"
        PAÍS: ${countryId}
        
        INSTRUÇÕES PARA O AGENTE:
        1. Pesquise em sites de consulta veicular específicos do país ${countryId}.
        2. Se for Brasil (BR), foque em "BuscaPlacas.com.br" e agregadores similares.
        3. Se for outro país, use portais como Carfax, VIN decoders ou sites oficiais locais.
        4. EXTRAÇÃO: Capture Marca, Modelo, Ano e Cor.
        5. ANTI-ERRO: Não invente. Se não localizar o veículo "${formattedPlate}", retorne {"success": false}.
        
        FORMATO DE RETORNO (JSON APENAS):
        {
          "name": "Marca",
          "model": "Modelo Completo",
          "year": "Ano/Modelo",
          "color": "Cor",
          "engine": "Motor",
          "fuelType": "Combustível",
          "success": true
        }`;

      const payload = await geminiService.callAI(prompt, true, true, true);
      const parsed = parseAIJson<any>(payload);
      
      if (parsed && parsed.success !== false && (parsed.name || parsed.model)) {
        return {
          name: parsed.name || '',
          model: parsed.model || '',
          year: parsed.year || '',
          color: parsed.color || '',
          engine: parsed.engine || '',
          version: parsed.version || '',
          fuelType: parsed.fuelType || '',
          chassis: parsed.chassis || '',
          success: true
        };
      }
      
      return { 
        success: false, 
        message: 'O robô buscou em várias fontes mas esta placa não retornou dados públicos. Verifique se os dados estão corretos ou preencha manualmente.' 
      };
      
    } catch (error: any) {
      console.error("Erro na busca avançada por placa:", error);
      return { 
        success: false, 
        message: "O robô encontrou uma barreira de rede nesta placa. Tente novamente mais tarde ou preencha o formulário." 
      };
    }
  },

  // ==================== ESTIMATE PART PRICE ====================
  estimatePartPrice: async (partName: string, vehicleModel: string): Promise<{ 
    estimatedPrice: number; 
    priceType: 'unidade' | 'jogo' | 'kit' | 'litro'; 
    unitsPerSet?: number 
  } | null> => {
    try {
      const prompt = `Estime o preço de mercado regional para a peça "${partName}" do veículo "${vehicleModel}".
        Considere marcas de boa qualidade. Retorne um JSON com: estimatedPrice (número), priceType ('unidade', 'jogo', 'kit', 'litro'), unitsPerSet (opcional).`;

      const payload = await geminiService.callAI(prompt, true, true, true);
      if (!payload) return null;
      const parsed = parseAIJson<any>(payload);
      if (!parsed) return null;
      
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
      const prompt = `Gere um plano de manutenção preventiva para o veículo "${vehicleModel}" aos ${mileage} de uso.
        Retorne um JSON com o array "recommendations": [{ partName, action, reason, estimatedCost, urgency ('baixa'|'media'|'alta') }].`;

      const payload = await geminiService.callAI(prompt, true);
      if (!payload) return { recommendations: [] };
      return parseAIJson<any>(payload) || { recommendations: [] };
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
          
          const prompt = `Para o veículo "${vehicleModel}" aos ${mileage} de uso, o manual recomenda: ${allItems.join(', ')}.
            
            Gere estimativas de custo e urgência para cada item. Retorne APENAS um JSON com este formato:
            {
              "recommendations": [
                 {"partName": "item", "action": "ação", "reason": "motivo do manual", "estimatedCost": número, "urgency": "urgência"}
              ]
            }`;

          const payload = await geminiService.callAI(prompt, true, true);
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
      const prompt = `Gere um guia técnico completo e estruturado baseado no manual do proprietário para o veículo "${vehicleModel}". 
        
        INSTRUÇÕES DE ORGANIZAÇÃO:
        1. SEÇÃO DE FLUIDOS: Liste tipos de óleo (viscosidade/especificação), capacidades e fluidos de arrefecimento/freio.
        2. CRONOGRAMA POR KM: Crie uma tabela ou lista clara de manutenções de zero até 200 mil km (ou o limite do fabricante).
        3. LEGENDA DE NOTAS (*): Identifique condições repetitivas (como uso severo, estradas de terra, reboque, trânsito pesado). Descreva-as uma única vez em uma seção de "Notas Importantes" e use marcadores (*, **, ***) nos itens da tabela que exigem atenção especial.
        
        OBJETIVO: O guia deve ser conciso e evitar a repetição da mesma frase de "condição especial" em cada linha.
        Use Markdown profissional.`;

      return await geminiService.callAI(prompt);
    } catch (error) {
      console.error("Gemini Manual Info Error:", error);
      return "Erro ao carregar manual técnico.";
    }
  },

  // ==================== PDF EXTRACTION ====================
  extractVehicleManualFromPdf: async (pdfBase64: string, vehicleModel: string): Promise<any> => {
    return geminiService._executeWithRetry(async (ai) => {
      const context = getGlobalContextPrompt();

      // Extrator de Cronograma
      const schedulePrompt = `Analise este manual do veículo "${vehicleModel}" e extraia a TABELA DE MANUTENÇÃO PROGRAMADA.

        INSTRUÇÃO DE OTIMIZAÇÃO DE REPETIÇÕES: 
        Identifique termos ou frases longas repetitivas como "Condição especial (*)", avisos sobre uso severo, estradas poeirentas, etc., que aparecem em vários itens.
        Extraia essas descrições longas e repetidas para um objeto central chamado 'technicalNotes' usando marcadores como "*", "**", etc.
        Nos itens individuais da lista 'items', mantenha apenas o nome da peça/ação e anexe o marcador correspondente (ex: "Troca de Óleo (*)"). Isso evita poluição visual.

        Retorne um JSON com o seguinte formato:
        {
          "maintenanceSchedule": [
            {"mileage": 10000, "items": ["Óleo do motor (*)", "Filtro de combustível (*)"], "description": "Revisão sugerida pelo manual"}
          ],
          "technicalNotes": {
            "*": "Texto completo da condição especial que se repetia no manual (ex: uso em estradas poeirentas ou severas)",
            "**": "Outra nota ou condição identificada"
          }
        }`;

      const scheduleResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
          { text: context + schedulePrompt }
        ],
        config: { responseMimeType: "application/json" }
      });

      const scheduleData = parseAIJson<any>(scheduleResponse.text || '');

      // Extrator de Seções Técnicas
    const techPrompt = `Analise este manual do veículo "${vehicleModel}" e extraia seções técnicas importantes como:
      Pneus, Óleo, Bateria, Capacidades, Filtros, FUSES/FUSÍVEIS e SÍMBOLOS DO PAINEL.
      Aplique a mesma lógica de 'technicalNotes' se houver avisos repetitivos nessas seções.
      Retorne um JSON com:
      {
        "technicalSections": {
          "tirePressure": "string",
          "oilSpecification": "string",
          "batteryInfo": "string",
          "fluidsCapacities": "string",
          "filters": "string",
          "fuses": "Identificação de fusíveis e relés (tabela ou lista)",
          "dashboardSymbols": "Significado das luzes de advertência do painel"
        },
        "technicalNotes": {
          "marker": "description"
        }
      }`;

      const techResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
          { text: context + techPrompt }
        ],
        config: { responseMimeType: "application/json" }
      });

      const technicalSectionsData = parseAIJson<any>(techResponse.text || '') || {};
      const technicalSections = technicalSectionsData.technicalSections || technicalSectionsData;

      // Mesclar notas técnicas de ambas as chamadas
      const technicalNotes = {
        ...(scheduleData?.technicalNotes || {}),
        ...(technicalSectionsData?.technicalNotes || {})
      };

      // Texto Completo (Resumo)
      const fullTextResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
          { text: context + `Gere um resumo completo em Markdown das especificações técnicas do veículo "${vehicleModel}" contidas neste manual.` }
        ]
      });

      const fullText = fullTextResponse.text || '';

      return {
        maintenanceSchedule: scheduleData?.maintenanceSchedule || [],
        technicalSections,
        technicalNotes,
        fullText
      };
    });
  },

  extractTechnicalInfoFromPDF: async (pdfBase64: string, vehicleModel: string): Promise<string> => {
    return geminiService._executeWithRetry(async (ai) => {
      const prompt = `Analise este manual em PDF para o veículo "${vehicleModel}". 
            Extraia todas as informações técnicas relevantes, especialmente:
            1. Especificações de fluidos e capacidades.
            2. Tabela de manutenção periódica.
            3. Tabela de pressões de pneus.
            4. Torques de aperto e ajustes finos.
            5. Informações sobre modificações se presentes no documento.
            
            Formate como Markdown profissional e detalhado.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            text: getGlobalContextPrompt() + prompt,
          },
        ],
      });
      return response.text || "Não foi possível extrair texto do PDF.";
    });
  },

  chatWithManual: async (question: string, context: string, vehicleModel: string): Promise<string> => {
    try {
      const prompt = `Você é um mecânico especialista assistente. Responda à pergunta do usuário sobre o veículo "${vehicleModel}".
        Contexto extraído do manual técnico:
        ---
        ${context}
        ---
        Pergunta: ${question}`;
      
      return await geminiService.callAI(prompt);
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "Erro na comunicação com a IA.";
    }
  },

  analyzeVehicleHealth: async (vehicle: any): Promise<{ score: number; analysis: string }> => {
    try {
      const services = vehicle.services || [];
      const parts = vehicle.parts || [];
      const usageLabels = { urban: 'Severo (Urbano/Carga)', highway: 'Leve (Estrada)', mixed: 'Misto' };
      const styleLabels = { smooth: 'Pé Leve (Preserva)', moderate: 'Normal', aggressive: 'Pé Pesado (Estresse)' };
      const rpmLabels = { low: 'Baixo (Econômico)', mid: 'Médio', high: 'Alto (Esportivo)' };
      
      const prompt = `Analise a saúde técnica deste veículo:
      Modelo: ${vehicle.name} ${vehicle.model} (${vehicle.year})
      Odômetro Atual: ${vehicle.mileage}
      Regime de Uso: ${usageLabels[vehicle.usageProfile as keyof typeof usageLabels] || 'Misto'}
      Estilo de Direção: ${styleLabels[vehicle.drivingStyle as keyof typeof styleLabels] || 'Normal'}
      RPM habitual: ${rpmLabels[vehicle.operatingRpm as keyof typeof rpmLabels] || 'Médio'}
      Histórico de Manutenções: ${JSON.stringify(services.map((s: any) => ({ data: s.date, desc: s.description, km: s.mileage })))}
      Peças Trocadas: ${JSON.stringify(parts.map((p: any) => p.name))}

      Com base nos planos de manutenção padrão para este modelo e quilometragem (considerando o regime de uso):
      1. Dê uma nota de saúde de 0 a 100.
      2. Forneça uma análise curta e profissional destacando o que é mais urgente ou o que está excelente.
      3. Se o regime for Severo, penalize a falta de manutenções preventivas preventivas (óleo/filtros).
      
      Retorne APENAS um JSON com os campos: "score" (number) e "analysis" (string).`;

      const payload = await geminiService.callAI(prompt, true);
      if (!payload) return { score: 70, analysis: "Análise indisponível." };
      return parseAIJson<any>(payload) || { score: 70, analysis: "Análise indisponível." };
    } catch (error) {
      console.error("Health Analysis Error:", error);
      return { score: 70, analysis: "Erro ao realizar análise profunda." };
    }
  },

  predictMaintenance: async (vehicle: any): Promise<{ items: { item: string; daysLeft: number; estimatedDate: string; priority: string }[] }> => {
    try {
      const services = vehicle.services || [];
      const usageLabels = { urban: 'Severo (Urbano)', highway: 'Leve (Estrada)', mixed: 'Misto' };
      const styleLabels = { smooth: 'Pé Leve (Preserva)', moderate: 'Normal', aggressive: 'Pé Pesado (Estresse)' };
      
      const prompt = `Como um analista preditivo de frotas, analise este veículo:
      Modelo: ${vehicle.name} ${vehicle.model}
      Odômetro Atual: ${vehicle.mileage}
      Uso Médio Diário: ${vehicle.avgDailyKm || 30}
      Regime de Uso: ${usageLabels[vehicle.usageProfile as keyof typeof usageLabels] || 'Misto'}
      Perfil de Direção: ${styleLabels[vehicle.drivingStyle as keyof typeof styleLabels] || 'Normal'} (RPM: ${vehicle.operatingRpm || 'Médio'})
      Últimas manutenções: ${JSON.stringify(services.slice(-5))}
      
      Considerando o desgaste natural para este modelo e o regime de uso + estilo de direção (ajuste intervalos de correias, freios e suspensão conforme agressividade):
      1. Preveja os próximos 3 itens de manutenção necessários.
      2. Estime quantos dias faltam para cada um (daysLeft), sendo conservador se o uso for Severo.
      3. Forneça uma data estimada (estimatedDate).
      4. Defina a prioridade (Baixa, Média, Alta).
      
      Retorne APENAS um JSON no formato: { "items": [{ "item": string, "daysLeft": number, "estimatedDate": string, "priority": string }] }`;

      const payload = await geminiService.callAI(prompt, true);
      return parseAIJson<any>(payload) || { items: [] };
    } catch (error) {
      console.error("Prediction Error:", error);
      return { items: [] };
    }
  },

  resaleValueAnalysis: async (vehicle: any, fipeValue: number): Promise<string> => {
    try {
      const services = vehicle.services || [];
      
      const prompt = `Você é um avaliador de carros de luxo e colecionáveis.
      VEÍCULO: ${vehicle.name} ${vehicle.model} (${vehicle.year})
      Odômetro: ${vehicle.mileage}
      PONTUAÇÃO DE SAÚDE IA: ${vehicle.healthScore || 'N/A'}/100
      VALOR DE MERCADO REF (FIPE): ${fipeValue}
      
      Histórico: ${services.length} manutenções registradas.
      
      Crie um "Pitch de Venda" (Argumento de Negociação) baseado no estado do carro.
      1. Se a saúde for alta (>80%), enfatize a valorização acima da referência de mercado.
      2. Se a saúde for baixa (<60%), aponte onde negociar desconto.
      3. Liste 3 pontos fortes do histórico para convencer um comprador exigente.
      
      Mantenha o tom profissional e persuasivo. Use Markdown.`;

      return await geminiService.callAI(prompt);
    } catch (error) {
      return "Erro ao analisar valor de mercado.";
    }
  },

  analyzeTCO: async (vehicle: any, totalFuelCost: number, totalServiceCost: number): Promise<string> => {
    try {
      const prompt = `Você é um consultor financeiro automotivo.
      VEÍCULO: ${vehicle.name} ${vehicle.model}
      Odômetro: ${vehicle.mileage}
      GASTO COMBUSTÍVEL: ${totalFuelCost}
      GASTO MANUTENÇÃO: ${totalServiceCost}
      TOTAL: ${totalFuelCost + totalServiceCost}
      
      Analise a viabilidade financeira deste veículo:
      1. Calcule o custo aproximado por unidade de distância rodada.
      2. Compare se o gasto de manutenção está condizente com a categoria do carro.
      3. Dê uma dica para reduzir o custo operacional.
      
      Seja direto, técnico e use Markdown.`;

      return await geminiService.callAI(prompt);
    } catch (error) {
      return "Erro ao processar TCO.";
    }
  },

  generateDigitalPassport: async (vehicle: any): Promise<string> => {
    try {
      const services = vehicle.services || [];
      const parts = vehicle.parts || [];
      
      const prompt = `Gere um "Certificado de Procedência IA" para este veículo:
      ${vehicle.name} | ${vehicle.year} | ${vehicle.mileage} de uso
      Histórico: ${services.length} serviços | ${parts.length} peças trocadas.
      
      Avalie a "Rastreabilidade" e "Cuidado do Dono":
      - Se o histórico for detalhado, classifique como "Procedência Premium".
      - Identifique lacunas críticas (ex: se não trocou fluidos conforme manual).
      - Conclua com um selo de confiança (A+, A, B ou C).
      
      Use Markdown e um tom formal de vistoria técnica.`;

      return await geminiService.callAI(prompt);
    } catch (error) {
      return "Erro ao gerar passaporte.";
    }
  },

  analyzeTireProfile: async (brand: string, model: string, currentUsageProfile: string): Promise<any> => {
    try {
      const prompt = `Analise o perfil técnico do pneu: "${brand} ${model}".
        Considere que o perfil de uso do veículo é: ${currentUsageProfile}.
        
        Sua tarefa é encontrar as características reais deste modelo de pneu e correlacionar com o uso.
        
        Retorne APENAS um JSON estruturado com:
        {
          "characteristics": ["array de strings com características técnicas"],
          "benefits": ["array de strings com pontos positivos"],
          "dangers": ["array de strings com riscos ou pontos negativos"],
          "estimatedDurability": "descrição da durabilidade esperada em km",
          "score": um número de 0 a 100 representando a qualidade/custo-benefício
        }`;

      const payload = await geminiService.callAI(prompt, true, true);
      return parseAIJson<any>(payload);
    } catch (error) {
      console.error("Tire Analysis Error:", error);
      return null;
    }
  },

  getFuelInsight: async (avgConsumption: string, vehicle: any): Promise<string> => {
    try {
      const prompt = `Analise a economia de combustível:
      Veículo: ${vehicle.name} ${vehicle.model} (${vehicle.year})
      Consumo Médio Atual: ${avgConsumption}
      Combustível Principal: ${vehicle.fuelType || 'Híbrido/Flex'}
      
      Compare com a média de mercado oficial para este modelo e diga em uma frase curta se está bom ou se indica necessidade de revisão. 
      Seja direto e use tom profissional.`;

      return await geminiService.callAI(prompt);
    } catch (error) {
       return "Análise de consumo temporariamente indisponível.";
    }
  },

  diagnoseSymptom: async (vehicle: any, symptom: string): Promise<string> => {
    try {
      const services = vehicle.services || [];
      const styleLabels = { smooth: 'Suave', moderate: 'Normal', aggressive: 'Agressivo' };
      const rpmLabels = { low: 'Baixo', mid: 'Médio', high: 'Alto' };
      
      const prompt = `Você é um mecânico especialista de alta performance.
      VEÍCULO: ${vehicle.name} ${vehicle.model} (${vehicle.year}) com ${vehicle.mileage} de uso.
      SINTOMA RELATADO: "${symptom}"
      
      CONTEXTO DO MOTORISTA:
      - Estilo de Direção: ${styleLabels[vehicle.drivingStyle as keyof typeof styleLabels] || 'Normal'}
      - Rotação de troca (RPM): ${rpmLabels[vehicle.operatingRpm as keyof typeof rpmLabels] || 'Médio'}
      - Regime de uso: ${vehicle.usageProfile || 'Misto'}
      
      Histórico Recente: ${JSON.stringify(services.slice(-3))}
      
      Com base nessas informações, forneça um diagnóstico preliminar estruturado.
      Retorne um objeto JSON estritamente estruturado com os seguintes campos:
      {
        "markdown": "Texto explicativo completo em formato Markdown e português para o diagnóstico. Deve incluir uma justificativa das causas, o nível de urgência geral, e orientações amigáveis.",
        "causes": [
          {
            "name": "Nome curto e direto da causa provável (ex: Motor de arranque danificado, Bateria descarregada, Fusível queimado)",
            "description": "Uma frase resumindo por que isso causaria o sintoma.",
            "severity": "Baixo" ou "Médio" ou "Crítico"
          }
        ]
      }
      
      Seja técnico mas acessível. Mantenha os nomes das causas bem diretos e realistas para o modelo do veículo. Use português do Brasil.`;

      const payload = await geminiService.callAI(prompt, true);
      return payload;
    } catch (error) {
      console.error("Diagnosis Error:", error);
      return JSON.stringify({
        markdown: "Erro ao conectar com o Mecânico IA. Tente descrever o sintoma novamente.",
        causes: []
      });
    }
  },

  getVerificationGuide: async (vehicle: any, symptom: string, causeName: string): Promise<string> => {
    try {
      const prompt = `Você é um mecânico especialista e instrutor técnico de alta performance.
      VEÍCULO: ${vehicle.name} ${vehicle.model} (${vehicle.year}) com ${vehicle.mileage} de uso.
      SINTOMA INICIAL: "${symptom}"
      CAUSA PROVÁVEL SELECIONADA: "${causeName}"

      Forneça um guia prático, detalhado e passo a passo de como verificar ou diagnosticar especificamente esta causa provável em português brasileiro.
      O guia deve incluir as seguintes seções bem estruturadas em Markdown:

      ### 1. 🔍 O que verificar (Passo a Passo)
      [Passos claros, sequenciais e fáceis de seguir para testar o componente ou circuito com segurança]

      ### 2. 🛠️ Equipamento Necessário
      [Qual ferramenta, multímetro, fios/cabos, adaptadores ou EPI utilizar e em qual escala/modo configurar se aplicável]

      ### 3. 📈 Como Analisar o Resultado
      [Como ler o teste e o que cada resultado significa: o que indica que a peça está perfeita vs. o que indica que está com defeito]

      ### 4. 📍 Onde fica localizado este componente
      [Explique exatamente onde fica essa peça ou componente sob o capô, na cabine ou no chassi deste veículo especificamente: ${vehicle.name} ${vehicle.model}]

      Seja técnico, detalhado, focado em economizar tempo e dinheiro com segurança, mas use uma linguagem acessível para motoristas entusiastas ou mecânicos. Use Markdown com negritos e marcadores. Use português do Brasil.`;

      return await geminiService.callAI(prompt);
    } catch (error) {
      console.error("Verification Guide Error:", error);
      return "Erro ao gerar o guia de verificação. Tente novamente.";
    }
  },

  fetchFipeValue: async (vehicleName: string, model: string, year: string): Promise<number> => {
    try {
      const prompt = `Consulte o valor médio de mercado oficial (${globalSettings.marketReferenceName}) para: ${vehicleName} ${model}, ano ${year}. 
        Se não encontrar o valor exato, use busca web no Google para encontrar preços de anúncios reais similares.
        Retorne APENAS um objeto JSON com o campo "price" (número).`;

      const payload = await geminiService.callAI(prompt, true, true);
      if (!payload) return 0;
      const resData = parseAIJson<{ price?: number }>(payload);
      
      const price = resData?.price || 0;
      
      // Fallback lógico se retornar 0 ou valor irreal
      if (price <= 0) {
        console.warn(`Preço retornado como zero para ${vehicleName}. Tentando fallback simples.`);
        const fallbackPrompt = `Baseado em modelos similares, qual o preço aproximado de um ${vehicleName} ${model} ${year}? Retorne apenas o número.`;
        const fallbackRaw = await geminiService.callAI(fallbackPrompt, false, false);
        return parsePriceValue(fallbackRaw) || 0;
      }
      
      return price;
    } catch (error) {
      console.error("Market Value Update Error:", error);
      return 0;
    }
  },

  validateApiKey: async (key: string): Promise<{ success: boolean; message: string }> => {
    if (!key || key.trim().length < 20) {
      return { success: false, message: 'Chave API muito curta ou inválida.' };
    }

    const previousKey = currentApiKey;
    const wasUsingCustom = isUsingCustomKey;
    try {
      currentApiKey = key;
      isUsingCustomKey = true; // Força para o teste
      const ai = geminiService.getAI();
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", 
        contents: [{ role: 'user', parts: [{ text: "Diga apenas 'OK' se você está funcionando." }] }]
      });
      
      const text = response.text || '';
      
      if (text.toUpperCase().includes('OK') || text.length > 0) {
        // RESET DE SEGURANÇA: Limpa qualquer bloqueio de cota anterior ao inserir chave válida
        (global as any).geminiCooldownUntil = 0;
        return { success: true, message: 'Conexão estabelecida com sucesso! Sua chave é válida e o limite de espera foi removido.' };
      }
      return { success: false, message: 'A IA respondeu, mas de forma inesperada. Verifique se é a chave correta.' };
    } catch (error: any) {
      console.error('API Key Validation Error:', error);
      currentApiKey = previousKey;
      isUsingCustomKey = wasUsingCustom;
      const msg = getErrorMessage(error);
      if (msg.includes('API_KEY_INVALID')) return { success: false, message: 'Chave API Inválida (Google negou o acesso).' };
      if (msg.includes('429')) return { success: false, message: 'Chave Válida, mas sem cota disponível no momento (Quota Excedida na sua chave).' };
      return { success: false, message: `Erro ao validar: ${msg}` };
    }
  }
};
