/**
 * Busca Placas Data Extractor
 * Facilita a abertura do portal Busca Placas para consulta manual e captura assistida
 */

interface VehicleData {
  plate?: string;
  name?: string;
  model?: string;
  year?: string;
  color?: string;
  chassisNumber?: string;
}

export const buscaPlacasService = {
  /**
   * Abre o portal de busca configurado e retorna o handle da janela
   */
  openPopup: (plate: string, customUrl?: string): Window | null => {
    // Usa URL personalizada ou o padrão
    const url = customUrl || `https://buscaplacas.com.br/`;
    return window.open(url, 'vehicle_search_popup', 'width=1024,height=768');
  },

  /**
   * Captura dados via monitoramento (mantido por compatibilidade de estrutura)
   */
  startMonitoring: (timeoutMs = 60000): Promise<VehicleData> => {
    return new Promise((resolve, reject) => {
      // Como não podemos injetar em buscaplacas.com.br (cross-origin), 
      // este método agora apenas aguarda um tempo ou falha graciosamente
      setTimeout(() => {
        reject(new Error('Extração automática não disponível. Use a captura manual (Ctrl+A, Ctrl+C).'));
      }, 2000);
    });
  }
};
