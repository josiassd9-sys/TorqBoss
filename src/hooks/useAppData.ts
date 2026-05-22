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
        createdAt: new Date().toISOString(),
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
          { id: 'p1', name: 'Óleo Selènia 5W30', status: 'ok', installedAtMileage: 0, expectedLifeMileage: 10000, category: 'Motor', estimatedPrice: 350, description: 'Sintético' },
          { id: 'p2', name: 'Filtro de Óleo OEM', status: 'ok', installedAtMileage: 0, expectedLifeMileage: 10000, category: 'Motor', estimatedPrice: 85, description: 'Original' },
          { id: 'p3', name: 'Pastilhas de Freio', status: 'ok', installedAtMileage: 0, expectedLifeMileage: 35000, category: 'Freios', estimatedPrice: 420, description: 'Semimetálica' },
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
        headerConfig: {
          iconScale: 100,
          bannerHeight: 180,
          bgOpacity: 1,
          bgBlur: 0,
          showIcon: true,
          bgColor: '#141414'
        },
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
    const themeKey = data.settings?.theme || 'default';
    const theme = THEMES[themeKey as keyof typeof THEMES];
    const customColors = data.settings?.customThemeColors;

    const colors = {
      primary: themeKey === 'custom' && customColors ? customColors.primary : (theme?.primary || '#141414'),
      accent: themeKey === 'custom' && customColors ? customColors.accent : (theme?.accent || '#E11D48'),
      bg: themeKey === 'custom' && customColors ? customColors.bg : (theme?.bg || '#F8F9FA'),
      cardBg: themeKey === 'custom' && customColors ? customColors.cardBg : '#FFFFFF',
      textPrimary: themeKey === 'custom' && customColors ? customColors.textPrimary : '#000000',
      textSecondary: themeKey === 'custom' && customColors ? customColors.textSecondary : '#6B7280',
      buttonBg: themeKey === 'custom' && customColors ? customColors.buttonBg : (theme?.accent || '#E11D48'),
      buttonText: themeKey === 'custom' && customColors ? customColors.buttonText : '#FFFFFF',
      vehicleHeaderBg: themeKey === 'custom' && customColors?.vehicleHeaderBg ? customColors.vehicleHeaderBg : (theme?.primary || '#141414'),
    };

    const header = data.settings?.headerConfig || {
      iconScale: 100,
      bannerHeight: 180,
      bgOpacity: 1,
      bgBlur: 0,
      showIcon: true,
      bgColor: colors.primary
    };

    const styleId = 'theme-overrides';
    let styleTag = document.getElementById(styleId);
    
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      :root {
        --color-brand-primary: ${colors.primary};
        --color-brand-accent: ${colors.accent};
        --color-brand-bg: ${colors.bg};
        --color-card-bg: ${colors.cardBg};
        --color-text-primary: ${colors.textPrimary};
        --color-text-secondary: ${colors.textSecondary};
        --color-button-bg: ${colors.buttonBg};
        --color-button-text: ${colors.buttonText};
        --color-vehicle-header-bg: ${colors.vehicleHeaderBg};
        
        --header-height: ${header.bannerHeight}px;
        --header-icon-scale: ${header.iconScale / 100};
        --header-bg-opacity: ${header.bgOpacity};
        --header-bg-blur: ${header.bgBlur}px;
        --header-bg-color: ${header.bgColor || colors.primary};
        --header-bg-image: ${header.bgImage ? `url("${header.bgImage}")` : 'none'};
      }
    `;
  }, [data.settings?.theme, data.settings?.customThemeColors, data.settings?.headerConfig]);

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
