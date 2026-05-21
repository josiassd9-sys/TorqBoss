// Este serviço é a ponte para a funcionalidade de leitura de odômetro via OCR.
// No Capacitor, ele deve usar plugins nativos como @capacitor-community/mlkit-text-recognition
// Para o ambiente web/preview, ele pode usar uma implementação baseada em tesseract.js ou apenas simular.

export const odometerScanner = {
  /**
   * Dispara o fluxo de captura e reconhecimento de texto do odômetro.
   */
  async scanOdometer(): Promise<{ mileage: number; confidence: number; imageBase64?: string }> {
    console.log('Iniciando escaneamento de odômetro...');
    
    // NOTA PARA PRODUÇÃO (CAPACITOR):
    // 1. Instalar: npm install @capacitor-community/mlkit-text-recognition
    // 2. Importar o plugin
    // 3. Chamar o método de leitura de imagem
    /*
    const result = await TextRecognition.detectText({
      path: imagePath,
      orientation: 'portrait'
    });
    // Tratar texto extraído para pegar apenas os números do odômetro
    */

    // Simulação de delay de processamento para Preview
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      mileage: 0, // Retornar 0 e deixar usuário preencher no fallback em Preview
      confidence: 0,
      imageBase64: ''
    };
  }
};
