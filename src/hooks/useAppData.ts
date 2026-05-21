import { useState, useEffect } from 'react';
import { AppData, Vehicle } from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { getCountryById } from '../config/countryConfig';
import { THEMES } from '../constants';
import { useFirebase } from '../contexts/FirebaseContext';

export function useAppData() {
  const { credits, isPro, consumeCredit } = useFirebase();
  const [data, setData] = useState<AppData>({ 
    vehicles: [],
    settings: {
      language: 'pt-BR',
      currency: 'BRL',
      distanceUnit: 'km',
      fuelUnit: 'L',
      region: 'Brasil',
      countryId: 'BR',
      theme: 'default',
      vehicleIdentifierLabel: 'Placa',
      vehicleIdentifierPlaceholder: 'AAA-0000',
      aiCredits: 0,
      isProMember: false
    }
  });

  // Sync Firebase credits to state for legacy compatibility if needed
  useEffect(() => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        aiCredits: credits,
        isProMember: isPro
      }
    }));
    
    // Update gemini service internal state
    geminiService.setGlobalSettings({
      ...data.settings,
      aiCredits: credits,
      isProMember: isPro
    });
  }, [credits, isPro]);

  const currentCountry = getCountryById(data.settings?.countryId || 'BR');

  const getCurrencySymbol = () => {
    const currency = data.settings?.currency || 'BRL';
    if (currency === 'USD') return '$';
    if (currency === 'EUR') return '€';
    return 'R$';
  };

  const getDistanceUnit = () => data.settings?.distanceUnit || 'KM';

  const formatDistance = (val: number) => {
    return `${val.toLocaleString(data.settings?.language || 'pt-BR')} ${getDistanceUnit()}`;
  };

  const marketRef = data.settings?.marketReferenceName || 'Valor de Mercado';

  useEffect(() => {
    const loadedData = storageService.loadData();
    
    const merged = {
      ...loadedData,
      settings: {
        language: 'pt-BR',
        currency: 'BRL',
        distanceUnit: 'km',
        fuelUnit: 'L',
        region: 'Brasil',
        marketReferenceName: 'Tabela FIPE',
        ...(loadedData.settings || {})
      }
    };
    setData(merged as any);
    if (merged.settings) {
      geminiService.setApiKey(merged.settings.geminiApiKey || '');
      geminiService.setGlobalSettings({
        ...merged.settings,
        aiCredits: credits,
        isProMember: isPro
      });
    }

    // Configura callback de consumo de créditos REAL via Firebase
    geminiService.onCreditConsumed((amount) => {
      consumeCredit();
    });
  }, []);

  useEffect(() => {
    const theme = THEMES[(data.settings?.theme as keyof typeof THEMES) || 'default'];
    if (!theme) return;

    const styleId = 'theme-overrides';
    let styleTag = document.getElementById(styleId);
    
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      :root {
        --color-brand-primary: ${theme.primary};
        --color-brand-accent: ${theme.accent};
        --color-brand-bg: ${theme.bg};
      }
    `;
  }, [data.settings?.theme]);

  const handleSave = (newData: AppData) => {
    setData(newData);
    storageService.saveData(newData);
    
    if (newData.settings) {
      const apiKey = newData.settings.geminiApiKey || '';
      geminiService.setApiKey(apiKey);
      geminiService.setGlobalSettings(newData.settings);
    }
  };

  return {
    data,
    setData,
    currentCountry,
    getCurrencySymbol,
    getDistanceUnit,
    formatDistance,
    marketRef,
    handleSave,
  };
}
