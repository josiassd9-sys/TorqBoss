import { useState, useEffect } from 'react';
import { AppData, Vehicle } from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { getCountryById } from '../config/countryConfig';
import { THEMES } from '../constants';
import { useFirebase } from '../contexts/FirebaseContext';
import i18n from '../i18n/config';

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

  // Observe language changes to update i18n
  useEffect(() => {
    if (data.settings?.language) {
      const lang = data.settings.language.split('-')[0]; // convert pt-BR to pt
      i18n.changeLanguage(lang);
    }
  }, [data.settings?.language]);

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
    
    let vehicles = loadedData.vehicles || [];
    if (vehicles.length === 0) {
      vehicles = [{
        id: 'simulated-strada-2024',
        name: 'Fiat',
        model: 'Strada Ultra Turbo',
        year: '2024',
        plate: 'FLX-2024',
        color: 'Cinza Silverstone',
        mileage: 4500,
        imageUrl: '/src/assets/images/fleetx_logo_strada.png',
        brandLogoUrl: '',
        healthScore: 98,
        fipeValue: 132000,
        parts: [
          { id: 'p1', name: 'Óleo Selènia 5W30', status: 'healthy', installMileage: 0, lifeExpectancy: 10000, category: 'Motor', price: 350 },
          { id: 'p2', name: 'Filtro de Óleo OEM', status: 'healthy', installMileage: 0, lifeExpectancy: 10000, category: 'Motor', price: 85 },
          { id: 'p3', name: 'Pastilhas de Freio', status: 'healthy', installMileage: 0, lifeExpectancy: 35000, category: 'Freios', price: 420 },
        ],
        services: [],
        fuelLogs: [],
        reminders: [],
        tireSets: []
      }];
    }

    const merged = {
      ...loadedData,
      vehicles,
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
