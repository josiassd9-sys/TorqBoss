import { useState, useRef, useEffect } from 'react';
import { Vehicle, Country, AppData } from '../types';
import { buscaPlacasService } from '../services/buscaPlacasService';
import { webVehicleSearchService } from '../services/webVehicleSearchService';
import { geminiService } from '../services/geminiService';
import { removeBackground } from "@imgly/background-removal";
import { formatCurrency } from '../lib/utils';

export function useRobotSearch(
  currentCountry: Country,
  data: AppData,
  newVehicle: Partial<Vehicle>,
  setNewVehicle: React.Dispatch<React.SetStateAction<any>>,
  selectedVehicle: Vehicle | null,
  updateSelectedVehicle: (updates: Partial<Vehicle>) => void,
  showInternalBrowser: boolean
) {
  const [isSearchingPlate, setIsSearchingPlate] = useState(false);
  const [plateSearchStatus, setPlateSearchStatus] = useState('');
  const [robotLogs, setRobotLogs] = useState<string[]>([]);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [isSearchingLogo, setIsSearchingLogo] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [isCapturingFromWeb, setIsCapturingFromWeb] = useState(false);
  const [isProcessingAssisted, setIsProcessingAssisted] = useState(false);
  const [rawPastedData, setRawPastedData] = useState('');
  const [foundPhotos, setFoundPhotos] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const robotPopupRef = useRef<Window | null>(null);
  const robotLogsEndRef = useRef<HTMLDivElement>(null);
  const isRequestingCooldownRef = useRef(false);
  const lastCooldownRequestAtRef = useRef(0);

  // Poll for cooldown status
  useEffect(() => {
    const checkCooldown = async () => {
      const now = Date.now();
      if (isRequestingCooldownRef.current) return;
      if (now - lastCooldownRequestAtRef.current < 2000) return;

      isRequestingCooldownRef.current = true;
      lastCooldownRequestAtRef.current = now;
      try {
        const remaining = await geminiService.getCooldownRemaining();
        if (typeof remaining === 'number') {
          setCooldownRemaining(remaining);
        }
      } catch (e) {
      } finally {
        isRequestingCooldownRef.current = false;
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (robotLogsEndRef.current) {
      robotLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [robotLogs]);

  const searchImage = async (customQuery?: string | any) => {
    const queryStr = (typeof customQuery === 'string' && customQuery.trim().length > 0) ? customQuery : null;
    const fullDescription = queryStr || `${newVehicle.name} ${newVehicle.model} ${newVehicle.version || ''} ${newVehicle.year || ''}`.trim();
    setSearchQuery(fullDescription);
    const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(fullDescription + ' foto oficial alta resolução')}&tbm=isch`;

    if (cooldownRemaining > 0) {
      if (confirm(`A IA está em repouso (${cooldownRemaining}s). Abrir busca manual agora?`)) {
        window.open(fallbackSearchUrl, '_blank');
      }
      return;
    }

    if (!newVehicle.name || !newVehicle.model) {
      alert('Preencha Marca e Modelo primeiro');
      return;
    }

    // ABRIR GALERIA IMEDIATAMENTE (Navegador Integrado)
    setIsSearchingImage(true);
    setFoundPhotos([]);
    setIsGalleryOpen(true);
    
    setRobotLogs(prev => [...prev, `[ROBOT] Buscando fotos de: ${fullDescription}...`]);
    
    try {
      const { url, candidates } = await geminiService.searchVehicleImage(fullDescription);
      
      const allLinks = Array.from(new Set([url, ...(candidates || [])].filter(Boolean) as string[]));
      
      if (allLinks.length > 0) {
        setFoundPhotos(allLinks);
        setPlateSearchStatus('📸 Galeria atualizada!');
      } else {
        setRobotLogs(prev => [...prev, '[WARN] Sem fotos diretas.']);
        setPlateSearchStatus('🔎 Tente busca manual.');
      }
    } catch (err: any) {
      console.error('Erro ao buscar imagem:', err);
      const errorMessage = typeof err?.message === 'string' ? err.message : String(err || '');
      const isLimit = errorMessage.includes('LIMITE_IA') || errorMessage.includes('429') || errorMessage.includes('limit');
      
      setRobotLogs(prev => [
        ...prev, 
        isLimit 
          ? '[AJUDA] Limite Grátis atingido! Adicione sua própria Chave API em Configurações > Chave API para eliminar esperas.' 
          : `[ERROR] Falha técnica: ${errorMessage.substring(0, 80)}...`
      ]);
      setPlateSearchStatus(isLimit ? '⏳ Use sua Chave API' : '⚠️ Erro na Busca');
    } finally {
      setIsSearchingImage(false);
    }
  };

  const searchLogo = async (brandName: string, isFromDetail = false) => {
    if (cooldownRemaining > 0) {
      alert(`Limite de IA atingido. Aguarde ${cooldownRemaining}s.`);
      return;
    }
    if (!brandName) {
      alert('Preencha a marca primeiro');
      return;
    }

    setIsSearchingLogo(true);
    setRobotLogs(prev => [...prev, `[ROBOT] Buscando logotipo oficial para ${brandName}...`, '[SCAN] Vasculhando bases de marcas e patentes...']);
    
    try {
      const { url, candidates, searchUrl } = await geminiService.searchVehicleLogo(brandName);
      
      const testImage = (src: string): Promise<boolean> => {
        return new Promise((resolve) => {
          if (!src || typeof src !== 'string' || !src.startsWith('http')) return resolve(false);
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
          setTimeout(() => resolve(false), 4000); // 4s para logos (geralmente menores/rápidos)
        });
      };

      const linksToTestSet = new Set<string>();
      if (url) linksToTestSet.add(url);
      if (Array.isArray(candidates)) {
        candidates.forEach(c => { if (c) linksToTestSet.add(c); });
      }
      
      const linksToTest = Array.from(linksToTestSet);
      setRobotLogs(prev => [...prev, `[ROBOT] Validando ${linksToTest.length} fontes de logotipo em paralelo...`]);

      // Testar em paralelo e pegar o primeiro válido
      let validUrl = null;
      const testPromises = linksToTest.map(async (link) => {
        const isValid = await testImage(link);
        if (isValid && !validUrl) {
          validUrl = link;
          return link;
        }
        return null;
      });

      await Promise.all(testPromises);

      if (validUrl) {
        if (isFromDetail) {
          updateSelectedVehicle({ brandLogoUrl: validUrl });
        } else {
          setNewVehicle((prev: any) => ({ ...prev, brandLogoUrl: validUrl }));
        }
        setRobotLogs(prev => [
          ...prev, 
          '[SUCCESS] Logotipo Validado e Localizado!', 
          '[ACTION] O logo foi aplicado ao veículo automaticamente.'
        ]);
      } else {
        setRobotLogs(prev => [
          ...prev, 
          '[WARN] Nenhum logotipo direto passou no teste de integridade.',
          '[ACTION] Abrindo galeria de logos para seleção manual...'
        ]);
        window.open(searchUrl, '_blank');
      }
    } catch (err) {
      console.error('Erro ao buscar logotipo:', err);
      setRobotLogs(prev => [...prev, '[ERROR] Falha na busca do logotipo pelo robô.']);
    } finally {
      setIsSearchingLogo(false);
    }
  };

  const searchVehicleByPlate = async () => {
    if (cooldownRemaining > 0) {
      setPlateSearchStatus(`⏳ Aguarde ${cooldownRemaining}s (Limite IA)`);
      return;
    }
    const plate = newVehicle.plate?.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!plate || plate.length !== 7) {
      alert('Digite uma placa completa com 7 caracteres (ex: ABC1D23)');
      return;
    }

    setIsSearchingPlate(true);
    setPlateSearchStatus('🚀 INICIANDO ROBÔ DE CAPTURA...');
    setRobotLogs(['[INFO] Sistema de reconhecimento iniciado', `[INFO] Alvo: Placa ${plate}`]);
    
    try {
      const popup = buscaPlacasService.openPopup(plate, currentCountry.searchPortalUrl);
      if (popup) {
        robotPopupRef.current = popup;
        setRobotLogs(prev => [...prev, `[ROBOT] Portal ${currentCountry.name} aberto. Digite a placa lá!`, `[INFO] Robô aguardando você pesquisar no portal ${currentCountry.flag}...`]);
      }
    } catch (e) {
      console.warn('Pop-up bloqueado:', e);
      setRobotLogs(prev => [...prev, '[WARN] Janela bloqueada pelo navegador. Ativando modo stealth...']);
    }

    const statuses = [
      '📡 Sincronizando com Hub Veicular...',
      `🤖 Monitorando janela ${currentCountry.name}...`,
      '🔎 Aguardando preenchimento humano...',
      '⚖️ Capturando dados via OCR/Buffer...',
      '✨ Consolidando informações técnicas...'
    ];

    let step = 0;
    const statusInterval = setInterval(() => {
      if (step < statuses.length) {
        setPlateSearchStatus(statuses[step]);
        setRobotLogs(prev => [...prev, `[STATUS] ${statuses[step]}`]);
        step++;
      }
    }, 1800);

    try {
      const result = await geminiService.searchVehicleByPlate(
        plate, 
        data.settings?.plateApiKey, 
        data.settings?.apiBrasilDeviceToken, 
        data.settings?.plateApiHost,
        currentCountry.id
      );
      
      clearInterval(statusInterval);
      if (result.success) {
        setPlateSearchStatus('✅ Veículo Identificado!');
        setRobotLogs(prev => [
          ...prev, 
          `[SUCCESS] MARCA: ${result.name}`, 
          `[SUCCESS] MODELO: ${result.model}`,
          `[SUCCESS] ANO: ${result.year}`,
          '[INFO] Extração concluída com sucesso.'
        ]);

        if (robotPopupRef.current && !robotPopupRef.current.closed) {
          robotPopupRef.current.close();
          robotPopupRef.current = null;
        }

        setNewVehicle((prev: any) => ({
          ...prev,
          name: result.name || prev.name,
          model: result.model || prev.model,
          year: result.year || prev.year,
          color: result.color || prev.color,
          engine: result.engine || prev.engine,
          version: result.version || prev.version,
          fuelType: result.fuelType || prev.fuelType,
          chassis: result.chassis || prev.chassis,
          imageUrl: result.imageUrl || prev.imageUrl,
          plate: plate
        }));
        
        setTimeout(() => setPlateSearchStatus(''), 3000);
      } else {
        setPlateSearchStatus('🕵️ MODO ASSISTIDO: COPIE OS DADOS');
        setRobotLogs(prev => [
          ...prev, 
          '[WARN] Robô não conseguiu extração automática.',
          '[ACTION] NO SITE: Digite a placa, pesquise, depois CTRL+A e CTRL+C.',
          '[ACTION] AQUI: Clique em "CAPTURAR DADOS".'
        ]);
      }
    } catch (err: any) {
      clearInterval(statusInterval);
      const errorMessage = String(err?.message || '');
      const isLimit = errorMessage.includes('LIMITE_IA') || errorMessage.includes('429');
      
      setRobotLogs(prev => [
        ...prev, 
        isLimit 
          ? '[AJUDA] Limite Grátis atingido! Evite esperas adicionando sua própria Chave API em Configurações > Chave API.' 
          : `[ERROR] Falha na busca avançada: ${errorMessage.substring(0, 60)}...`
      ]);
      setPlateSearchStatus(isLimit ? '⏳ Use sua Chave API' : '⚠️ Erro no servidor');
      setTimeout(() => setPlateSearchStatus(''), 5000);
    } finally {
      setIsSearchingPlate(false);
    }
  };

  const handleAssistedProcess = async (textOverride?: string | any) => {
    if (cooldownRemaining > 0) {
      setPlateSearchStatus(`⏳ IA em espera (${cooldownRemaining}s)`);
      return;
    }
    // Evita passar o objeto de evento do React para a IA
    const inputStr = (typeof textOverride === 'string') ? textOverride : null;
    const dataToProcess = inputStr || rawPastedData || '';
    const textStr = String(dataToProcess);
    if (!textStr.trim() || textStr === '[object Object]') {
      if (textStr === '[object Object]') console.warn('AIAssisted: Ignorado objeto recebido como string');
      return;
    }
    
    setIsProcessingAssisted(true);
    setPlateSearchStatus('🧠 IA: Analisando texto e extraindo dados...');
    setRobotLogs(prev => [...prev, '[INFO] Enviando dados para o Cérebro IA...', '[PROCESS] Decodificando ficha técnica...']);
    
    try {
      const result = await geminiService.parseRawVehicleData(dataToProcess);
      if (result && result.success !== false) {
        setPlateSearchStatus('🎉 Dados extraídos com sucesso!');
        setRobotLogs(prev => [...prev, `[SUCCESS] ${result.name} ${result.model}`]);

        setNewVehicle((prev: any) => ({
          ...prev,
          name: result.name || prev.name,
          model: result.model || prev.model,
          year: result.year || prev.year,
          color: result.color || prev.color,
          engine: result.engine || prev.engine,
          version: result.version || prev.version,
          fuelType: result.fuelType || prev.fuelType,
          chassis: result.chassis || prev.chassis,
          mileage: typeof result.mileage === 'number' ? result.mileage : prev.mileage,
          fipeValue: typeof result.fipeValue === 'number' ? result.fipeValue : prev.fipeValue,
          plate: result.plate ? result.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') : prev.plate
        }));
        setRawPastedData(''); 
        
        if (robotPopupRef.current && !robotPopupRef.current.closed) {
          robotPopupRef.current.close();
          robotPopupRef.current = null;
        }
        setTimeout(() => setPlateSearchStatus('✓ Cadastro preenchido!'), 2000);
      } else {
        const errorMsg = result?.error || 'Não foi possível identificar dados.';
        setPlateSearchStatus(`⚠️ ${errorMsg}`);
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error('Assisted Process Error:', error);
      const errorMessage = String(error?.message || '');
      const isLimit = errorMessage.includes('LIMITE_IA') || errorMessage.includes('429');
      
      const errorMsg = isLimit 
        ? 'Limite de IA atingido. Adicione sua própria Chave API para uso ilimitado.' 
        : (error.message || 'Erro ao processar dados com IA.');
        
      setPlateSearchStatus(`❌ ${isLimit ? 'Limite de IA' : 'Falha'}`);
      setRobotLogs(prev => [...prev, `[ERROR] ${errorMsg}`]);
      alert(errorMsg);
    } finally {
      setIsProcessingAssisted(false);
    }
  };

  const handleCaptureFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        alert('Área de transferência vazia.');
        return;
      }
      setRawPastedData(text);
      if (text.length > 20) {
        handleAssistedProcess(text);
      }
    } catch (err) {
      alert('Erro ao ler área de transferência. Use Ctrl+V no campo de texto.');
    }
  };

  const handleRemoveBackgroundLocal = async (imageUrl: string) => {
    setIsRemovingBackground(true);
    setPlateSearchStatus('🤖 ROBÔ ESTÚDIO: Analisando bordas...');
    try {
      const blob = await removeBackground(imageUrl, {
        progress: (key, current, total) => {
          setPlateSearchStatus(`📸 TRATAMENTO IA: ${Math.round((current / total) * 100)}%...`);
        }
      });
      const reader = new FileReader();
      return new Promise<string>((resolve) => {
        reader.onloadend = () => {
          setPlateSearchStatus('✨ SUCESSO: Fundo removido!');
          setTimeout(() => setPlateSearchStatus(''), 5000);
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      setPlateSearchStatus('⚠️ Falha no tratamento da imagem.');
      setTimeout(() => setPlateSearchStatus(''), 4000);
      return imageUrl;
    } finally {
      setIsRemovingBackground(false);
    }
  };

  return {
    isSearchingPlate,
    plateSearchStatus,
    setPlateSearchStatus,
    robotLogs,
    setRobotLogs,
    isSearchingImage,
    isSearchingLogo,
    isRemovingBackground,
    isCapturingFromWeb,
    isProcessingAssisted,
    rawPastedData,
    setRawPastedData,
    foundPhotos,
    setFoundPhotos,
    searchQuery,
    setSearchQuery,
    isGalleryOpen,
    setIsGalleryOpen,
    cooldownRemaining,
    robotLogsEndRef,
    searchImage,
    searchLogo,
    searchVehicleByPlate,
    handleAssistedProcess,
    handleCaptureFromClipboard,
    handleRemoveBackground: handleRemoveBackgroundLocal
  };
}
