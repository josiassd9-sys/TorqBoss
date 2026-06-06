/**
 * Web Vehicle Search Service
 * Busca dados de veículos em sites públicos como detetiveveicular.com
 */

interface WebSearchResult {
  name?: string;
  model?: string;
  year?: string;
  color?: string;
  chassisNumber?: string;
  success: boolean;
  message?: string;
  source?: string;
}

export const webVehicleSearchService = {
  /**
   * Busca dados no detetiveveicular.com via API interna
   */
  searchDetetiveVeicular: async (plate: string): Promise<WebSearchResult> => {
    const formattedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!formattedPlate || formattedPlate.length !== 7) {
      return { success: false, message: 'Placa inválida' };
    }

    try {
      // O site usa uma API interna que pode ser acessada
      const searchUrl = `https://detetiveveicular.com/api/search?plate=${formattedPlate}`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        return { success: false, message: `Detetive Veicular retornou status ${response.status}` };
      }

      const data = await response.json();
      console.log('[WebSearch] detetiveveicular response:', data);

      if (data.success === false || !data.data) {
        return { success: false, message: data.message || 'Veículo não encontrado' };
      }

      const vehicle = data.data || data;
      return {
        name: vehicle.brand || vehicle.marca || '',
        model: vehicle.model || vehicle.modelo || '',
        year: vehicle.year || vehicle.ano || '',
        color: vehicle.color || vehicle.cor || '',
        chassisNumber: vehicle.chassis || vehicle.numeroChasis || '',
        success: true,
        source: 'detetiveveicular'
      };
    } catch (error) {
      console.warn('[WebSearch] detetiveveicular error:', error);
      return { success: false, message: 'Erro ao consultar Detetive Veicular' };
    }
  },

  /**
   * Fallback: Tenta múltiplos endpoints públicos
   */
  searchPublicApis: async (plate: string): Promise<WebSearchResult> => {
    const formattedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    const apis = [
      {
        name: 'detetiveveicular',
        url: `https://detetiveveicular.com/api/search?plate=${formattedPlate}`,
        parseResponse: (data: any) => ({
          name: data.brand || data.marca || '',
          model: data.model || data.modelo || '',
          year: data.year || data.ano || '',
          color: data.color || data.cor || ''
        })
      },
      {
        name: 'infosimples',
        url: `https://api.infosimples.com.br/api/v1/search/vehicles?plate=${formattedPlate}`,
        parseResponse: (data: any) => {
          const vehicle = data.vehicle || data[0];
          return {
            name: vehicle?.make || '',
            model: vehicle?.model || '',
            year: vehicle?.year || '',
            color: vehicle?.color || ''
          };
        }
      }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = api.parseResponse(data);
          
          if (parsed.name || parsed.model) {
            return {
              ...parsed,
              success: true,
              source: api.name
            };
          }
        }
      } catch (error) {
        console.warn(`[WebSearch] ${api.name} error:`, error);
      }
    }

    return { success: false, message: 'Nenhuma fonte pública retornou dados' };
  },

  /**
   * URLs para abrir em browser/iframe para o usuário fazer busca manual rápida
   */
  getSearchLinks: (plate: string) => {
    const p = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return [
      { name: 'Placa i', url: `https://www.placai.com/placa/${p}` },
      { name: 'Detetive Veicular', url: `https://detetiveveicular.com/checkout/?plate=${p}` },
      { name: 'Lupa Veicular', url: `https://www.lupaveicular.com/consulta-placa/${p}` },
      { name: 'Busca Placas', url: `https://buscaplacas.com.br/placa/${p}` },
      { name: 'Olho no Carro', url: `https://www.olhonocarro.com.br/placa/${p}` }
    ];
  },

  getSearchPageUrl: (plate?: string): string => {
    const url = 'https://detetiveveicular.com/checkout/';
    if (plate) {
      return `${url}?plate=${encodeURIComponent(plate)}`;
    }
    return url;
  }
};
