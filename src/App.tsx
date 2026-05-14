import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { 
  Car, 
  Settings, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Cpu,
  ArrowLeft,
  Database,
  Book,
  X,
  DollarSign,
  ShoppingCart,
  Calculator,
  Play,
  Activity,
  Palette,
  Type as TypeIcon,
  Shield,
  Zap,
  Gauge,
  Box,
  Send,
  Sparkles,
  RefreshCw,
  FileText,
  Pipette,
  Camera,
  Globe,
  Link,
  Clipboard,
  ClipboardCheck,
  Wand2,
  Layout,
  ExternalLink,
  MapPin,
  Phone
} from 'lucide-react';

const ICON_OPTIONS = {
  Cpu: Cpu,
  Car: Car,
  Wrench: Wrench,
  Shield: Shield,
  Zap: Zap,
  Activity: Activity,
  Gauge: Gauge
};

const HeaderLogo = ({ iconName, className }: { iconName?: string, className?: string }) => {
  const IconComponent = ICON_OPTIONS[iconName as keyof typeof ICON_OPTIONS] || Cpu;
  return <IconComponent className={className} size={32} />;
};
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, Part, AppData, ServiceEntry, FuelLog, Reminder, ServicePart, VehicleSearchLink } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { webVehicleSearchService } from './services/webVehicleSearchService';
import { detetiveVehicularExtractor } from './services/detetiveVehicularExtractor';
import { generateMaintenancePdf } from './services/maintenance-pdf';
import { createVehicleManual } from './services/manual-extraction';
import { AUTO_DICTIONARY } from './constants';
import { getBrandLogo } from './brandLogos';

const THEMES = {
  default: { primary: '#141414', accent: '#E11D48', bg: '#F8F9FA' },
  blue: { primary: '#1e3a8a', accent: '#3b82f6', bg: '#f8fafc' },
  green: { primary: '#064e3b', accent: '#10b981', bg: '#f0fdf4' },
  dark: { primary: '#0f172a', accent: '#94a3b8', bg: '#020617' },
  orange: { primary: '#7c2d12', accent: '#f97316', bg: '#fff7ed' }
};

const BrandLogo = ({ vehicleName, brandLogoUrl, className }: { vehicleName: string; brandLogoUrl?: string; className: string }) => {
  const logo = brandLogoUrl || getBrandLogo(vehicleName);
  
  if (!logo) {
    return (
      <div className={`${className} bg-gray-50 flex items-center justify-center border border-gray-100`}>
        <Car size={16} className="text-gray-300" />
      </div>
    );
  }

  return (
    <div className={`${className} bg-white flex items-center justify-center p-1 border border-gray-100 shadow-sm overflow-hidden`}>
      <img 
        src={logo} 
        alt="Logo da Marca" 
        className="w-full h-full object-contain" 
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

const VehicleImage = ({ src, alt, className }: { src?: string; alt: string; className: string }) => {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-400`}>
        <Car size={className.includes('w-16') ? 32 : 120} />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} object-cover`} 
      referrerPolicy="no-referrer" 
      onError={() => setError(true)}
    />
  );
};

const DEFAULT_SEARCH_LINKS: VehicleSearchLink[] = [
  { id: '1', name: 'Placa i', url: 'https://www.placai.com/', color: 'red' },
  { id: '2', name: 'Detetive Veicular', url: 'https://detetiveveicular.com/', color: 'blue' },
  { id: '3', name: 'Lupa Veicular', url: 'https://www.lupaveicular.com/consulta-placa/{placa}', color: 'orange' },
  { id: '4', name: 'Busca Sim', url: 'https://buscasim.com.br/', color: 'purple' },
  { id: '5', name: 'Busca Placas', url: 'https://buscaplacas.com.br/', color: 'indigo' }
];

export default function App() {
  const [data, setData] = useState<AppData>({ vehicles: [] });
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [isSearchingPlate, setIsSearchingPlate] = useState(false);
  const [plateSearchStatus, setPlateSearchStatus] = useState('');
  const [rawPastedData, setRawPastedData] = useState('');
  const [isProcessingAssisted, setIsProcessingAssisted] = useState(false);
  const [showInternalBrowser, setShowInternalBrowser] = useState(false);
  const [internalBrowserUrl, setInternalBrowserUrl] = useState('');

  const searchPortals = [
    { name: 'Busca Sim', url: 'https://buscasim.com.br/', icon: '🌐' },
    { name: 'Placa i', url: 'https://www.placai.com/', icon: '🔍' },
    { name: 'Detetive Veicular', url: 'https://detetiveveicular.com/', icon: '🕵️' },
    { name: 'Lupa Veicular', url: 'https://www.lupaveicular.com/', icon: '🔎' }
  ];
  const [isWebSearchOpen, setIsWebSearchOpen] = useState(false);
  const [webSearchMode, setWebSearchMode] = useState<'auto' | 'manual'>('auto');
  const [isCapturingFromWeb, setIsCapturingFromWeb] = useState(false);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMileage, setSimulationMileage] = useState<number | ''>('');
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [isCalculatingSimulation, setIsCalculatingSimulation] = useState(false);
  const [activeTab, setActiveTab] = useState<'parts' | 'services' | 'fuel' | 'reminders' | 'manual'>('parts');
  
  // Manual States
  const [isGeneratingManual, setIsGeneratingManual] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [manualChatQuery, setManualChatQuery] = useState('');
  const [manualChatResponse, setManualChatResponse] = useState('');
  const [isChattingWithManual, setIsChattingWithManual] = useState(false);
  const manualPDFInputRef = useRef<HTMLInputElement>(null);

  // Sync selectedVehicle when data changes and clear manual states
  useEffect(() => {
    if (selectedVehicle) {
      const updated = data.vehicles.find(v => v.id === selectedVehicle.id);
      if (updated) setSelectedVehicle(updated);
    }
  }, [data.vehicles]);

  useEffect(() => {
    setManualChatResponse('');
    setManualChatQuery('');
    setActiveTab('parts');
  }, [selectedVehicle?.id]);
  
  // New States for Features
  const [isAddingService, setIsAddingService] = useState(false);
  const [selectedServiceForReport, setSelectedServiceForReport] = useState<ServiceEntry | null>(null);
  const [isAddingFuel, setIsAddingFuel] = useState(false);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  
  const [newService, setNewService] = useState({ 
    description: '', 
    mileage: '', 
    laborCost: '', 
    workshopName: '', 
    workshopAddress: '',
    workshopPhone: '',
    mechanicName: '',
    date: new Date().toISOString().split('T')[0],
    partsList: [] as ServicePart[]
  });
  const [newServicePart, setNewServicePart] = useState({ name: '', quantity: '1', unitPrice: '', observation: '' });
  const [newFuel, setNewFuel] = useState({ mileage: '', liters: '', cost: '', fullTank: true, date: new Date().toISOString().split('T')[0] });
  const [newReminder, setNewReminder] = useState({ title: '', targetMileage: '', targetDate: '', type: 'oil' as any });
  
  // New Vehicle State
  const [newVehicle, setNewVehicle] = useState({ name: '', model: '', year: '', plate: '', color: '', mileage: 0, imageUrl: '', brandLogoUrl: '' });
  
  // New Part State
  const [newPartName, setNewPartName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vehicleImageInputRef = useRef<HTMLInputElement>(null);
  const brandLogoInputRef = useRef<HTMLInputElement>(null);
  const pasteTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const resizeImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Comprime para JPEG com 70% de qualidade para reduzir drasticamente o tamanho
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleVehicleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        const compressed = await resizeImage(base64, 1200, 1200);
        setNewVehicle(prev => ({ ...prev, imageUrl: compressed }));
      } catch (err) {
        alert('Erro ao carregar imagem do veículo.');
      }
    }
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        // Logos de marca podem ser menores (Ex: 400x400)
        const compressed = await resizeImage(base64, 400, 400);
        setNewVehicle(prev => ({ ...prev, brandLogoUrl: compressed }));
      } catch (err) {
        alert('Erro ao carregar logo da marca.');
      }
    }
  };

  useEffect(() => {
    const loadedData = storageService.loadData();
    setData(loadedData);
    if (loadedData.settings?.geminiApiKey) {
      geminiService.setApiKey(loadedData.settings.geminiApiKey);
    }
  }, []);

  useEffect(() => {
    const theme = THEMES[data.settings?.theme || 'default'];
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
    
    if (newData.settings?.geminiApiKey) {
      geminiService.setApiKey(newData.settings.geminiApiKey);
    }

    if (selectedVehicle) {
      const updated = newData.vehicles.find(v => v.id === selectedVehicle.id);
      if (updated) setSelectedVehicle(updated);
    }
  };

  const runSimulation = async () => {
    if (!selectedVehicle || !simulationMileage) return;
    setIsCalculatingSimulation(true);
    try {
      let result;
      
      // Usar dados do manual se disponível
      if (selectedVehicle.manual?.maintenanceSchedule) {
        result = await geminiService.simulateMaintenanceFromManual(
          `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`,
          Number(simulationMileage),
          { maintenanceSchedule: selectedVehicle.manual.maintenanceSchedule }
        );
      } else {
        result = await geminiService.simulateMaintenance(
          `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`,
          Number(simulationMileage)
        );
      }
      
      setSimulationResults(result.recommendations);
    } catch (error) {
      alert('Erro ao processar simulação. Tente novamente.');
    } finally {
      setIsCalculatingSimulation(false);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string | ArrayBuffer | null;
        if (!result || typeof result !== 'string') {
          reject(new Error('Não foi possível ler o arquivo PDF como texto.'));
          return;
        }
        const parts = result.split(',');
        if (parts.length < 2) {
          reject(new Error('Formato de PDF inesperado.'));
          return;
        }
        resolve(parts[1]);
      };
      reader.onerror = () => reject(reader.error || new Error('Erro ao ler o arquivo PDF.'));
      reader.readAsDataURL(file);
    });
  };

  const handleManualPDFUpload = async (file: File) => {
    if (!selectedVehicle) {
      alert('Selecione um veículo primeiro.');
      return;
    }

    if (!data.settings?.geminiApiKey) {
      alert('Configure a chave da API do Gemini nas configurações.');
      return;
    }

    setIsUploadingPDF(true);
    try {
      const base64Data = await readFileAsBase64(file);
      console.log('📄 Iniciando extração do manual PDF:', file.name);

      const manual = await createVehicleManual(
        base64Data,
        file.name,
        `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`,
        data.settings?.geminiApiKey || ''
      );

      if (!manual || !manual.fullText) {
        throw new Error('O manual extraído não retornou o texto completo.');
      }

      const updatedVehicles = data.vehicles.map(v => {
        if (v.id === selectedVehicle.id) {
          return {
            ...v,
            manual,
            manualTranscription: manual.fullText
          };
        }
        return v;
      });

      const newData = { ...data, vehicles: updatedVehicles };
      handleSave(newData);
      setSelectedVehicle(prev => prev ? { ...prev, manual, manualTranscription: manual.fullText } : prev);

      alert('✅ Manual do veículo carregado e processado com sucesso!');
    } catch (error: any) {
      console.error('Erro completo ao processar PDF:', error);
      alert(`❌ Erro ao processar o PDF:\n${error?.message || error}`);
    } finally {
      setIsUploadingPDF(false);
    }
  };

  const addVehicle = () => {
    if (!newVehicle.name) return;
    const vehicle: Vehicle = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(), // Registro inicial do veículo
      name: newVehicle.name,
      model: newVehicle.model,
      year: newVehicle.year,
      plate: newVehicle.plate,
      mileage: Number(newVehicle.mileage),
      imageUrl: newVehicle.imageUrl,
      brandLogoUrl: newVehicle.brandLogoUrl,
      parts: [],
      services: [],
      fuelLogs: [],
      reminders: []
    };
    const newData = { ...data, vehicles: [...data.vehicles, vehicle] };
    handleSave(newData);
    setNewVehicle({ name: '', model: '', year: '', plate: '', color: '', mileage: 0, imageUrl: '', brandLogoUrl: '' });
    setIsAddingVehicle(false);
    setSelectedVehicle(vehicle);
  };

  const updateVehicle = () => {
    if (!selectedVehicle || !newVehicle.name) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          name: newVehicle.name,
          model: newVehicle.model,
          year: newVehicle.year,
          plate: newVehicle.plate,
          mileage: Number(newVehicle.mileage),
          imageUrl: newVehicle.imageUrl,
          brandLogoUrl: newVehicle.brandLogoUrl
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
    setIsEditingVehicle(false);
    setNewVehicle({ name: '', model: '', year: '', plate: '', color: '', mileage: 0, imageUrl: '', brandLogoUrl: '' });
  };

  const addService = () => {
    if (!selectedVehicle || !newService.description || !newService.workshopName) {
      alert('Descrição e Nome da Oficina são obrigatórios.');
      return;
    }
    
    const partsCost = newService.partsList.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const laborCost = Number(newService.laborCost) || 0;
    const totalCost = partsCost + laborCost;

    const service: ServiceEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newService,
      mileage: Number(newService.mileage),
      cost: totalCost,
      laborCost: laborCost,
    };
    
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { 
          ...v, 
          services: [...(v.services || []), service],
          mileage: Math.max(v.mileage, Number(newService.mileage))
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
    setIsAddingService(false);
    setNewService({ 
      description: '', 
      mileage: '', 
      laborCost: '', 
      workshopName: newService.workshopName, 
      workshopAddress: newService.workshopAddress,
      workshopPhone: newService.workshopPhone,
      mechanicName: newService.mechanicName,
      date: new Date().toISOString().split('T')[0],
      partsList: [] as ServicePart[]
    });
  };

  const addFuel = () => {
    if (!selectedVehicle || !newFuel.liters) return;
    const fuel: FuelLog = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newFuel,
      mileage: Number(newFuel.mileage),
      liters: Number(newFuel.liters),
      cost: Number(newFuel.cost)
    };
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { 
          ...v, 
          fuelLogs: [...(v.fuelLogs || []), fuel],
          mileage: Math.max(v.mileage, Number(newFuel.mileage))
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
    setIsAddingFuel(false);
    setNewFuel({ mileage: '', liters: '', cost: '', fullTank: true, date: new Date().toISOString().split('T')[0] });
  };

  const addReminder = () => {
    if (!selectedVehicle || !newReminder.title) return;
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newReminder,
      targetMileage: newReminder.targetMileage ? Number(newReminder.targetMileage) : undefined,
      isCompleted: false
    };
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { ...v, reminders: [...(v.reminders || []), reminder] };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
    setIsAddingReminder(false);
    setNewReminder({ title: '', targetMileage: '', targetDate: '', type: 'oil' });
  };

  const toggleReminder = (reminderId: string) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          reminders: (v.reminders || []).map(r => r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r)
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const deleteItem = (type: 'services' | 'fuelLogs' | 'reminders', itemId: string) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { ...v, [type]: (v[type] as any[]).filter((item: any) => item.id !== itemId) };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const openEditModal = () => {
    if (!selectedVehicle) return;
    setNewVehicle({
      name: selectedVehicle.name,
      model: selectedVehicle.model,
      year: selectedVehicle.year,
      plate: selectedVehicle.plate || '',
      color: selectedVehicle.color || '',
      mileage: selectedVehicle.mileage,
      imageUrl: selectedVehicle.imageUrl || '',
      brandLogoUrl: selectedVehicle.brandLogoUrl || ''
    });
    setIsEditingVehicle(true);
  };

  const searchImage = async () => {
    if (!newVehicle.name || !newVehicle.model) {
      alert('Preencha Marca e Modelo primeiro');
      return;
    }

    setIsSearchingImage(true);
    try {
      const fullDescription = `${newVehicle.name} ${newVehicle.model} ${newVehicle.year || ''}`.trim();
      const url = await geminiService.searchVehicleImage(fullDescription);
      if (url) {
        setNewVehicle(prev => ({ ...prev, imageUrl: url }));
        alert('✅ Foto oficial encontrada!');
      } else {
        alert('Não encontrou imagem oficial de alta qualidade. Você pode colar um link manualmente.');
      }
    } catch (err) {
      console.error('Erro ao buscar imagem oficial:', err);
      alert('Erro ao buscar imagem oficial.');
    } finally {
      setIsSearchingImage(false);
    }
  };

  const searchVehicleByPlate = async () => {
    const plate = newVehicle.plate?.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (!plate || plate.length !== 7) {
      alert('Digite uma placa completa com 7 caracteres (ex: ABC1D23)');
      return;
    }

    setIsSearchingPlate(true);
    setPlateSearchStatus('🚀 Iniciando Robô Extrator...');
    
    const statuses = [
      '🤖 Robô: Acessando base de dados Alpha...',
      '🖱️ Localizando registro da placa...',
      '⌨️ Consultando bases de dados secundárias...',
      '⏳ Aguardando retorno dos hubs públicos...',
      '🔍 Extraindo dados técnicos (JSON Extraction)...',
      '🕵️ Consolidando informações finais do veículo...'
    ];

    let step = 0;
    const statusInterval = setInterval(() => {
      if (step < statuses.length) {
        setPlateSearchStatus(statuses[step]);
        step++;
      }
    }, 2000);

    try {
      console.log(`🔍 Robô em ação para placa: ${plate}`);
      
      const result = await geminiService.searchVehicleByPlate(
        plate, 
        data.settings?.plateApiKey, 
        data.settings?.apiBrasilDeviceToken, 
        data.settings?.plateApiHost
      );
      
      clearInterval(statusInterval);
      
      if (result.success) {
        setPlateSearchStatus('✅ Veículo Identificado!');
        setNewVehicle(prev => ({
          ...prev,
          name: result.name || prev.name || '',
          model: result.model || prev.model || '',
          year: result.year || prev.year || '',
          color: result.color || prev.color || '',
          imageUrl: result.imageUrl || prev.imageUrl,
          plate: plate
        }));

        if (showInternalBrowser) {
          alert(`✨ O robô localizou: ${result.name} ${result.model}`);
        }
        
        setTimeout(() => setPlateSearchStatus(''), 3000);
      } else {
        setPlateSearchStatus('❌ Falha na extração.');
        const msg = result.message || "O robô não conseguiu ler os dados automaticamente.";
        alert(msg);
        setTimeout(() => setPlateSearchStatus(''), 3000);
      }
    } catch (err: any) {
      clearInterval(statusInterval);
      console.error('Erro no robô:', err);
      setPlateSearchStatus('⚠️ Erro no servidor.');
      
      const errorStr = JSON.stringify(err);
      if (errorStr.includes('429') || errorStr.includes('quota')) {
        alert('Cota de IA atingida. Aguarde 1 minuto ou use a captura manual (Plano B).');
      } else {
        alert('Ocorreu um erro ao acionar o robô de busca. Tente a busca manual.');
      }
      setTimeout(() => setPlateSearchStatus(''), 3000);
    } finally {
      setIsSearchingPlate(false);
    }
  };

  const searchVehicleByWeb = async () => {
    const plate = newVehicle.plate?.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!plate || plate.length !== 7) {
      alert('Digite uma placa completa no formato MERCOSUL (7 caracteres).');
      return;
    }

    setIsSearchingPlate(true);
    try {
      // Tenta busca automática via APIs públicas
      const result = await webVehicleSearchService.searchPublicApis(plate);
      
      if (result.success) {
        setNewVehicle(prev => ({
          ...prev,
          name: result.name || prev.name,
          model: result.model || prev.model,
          year: result.year || prev.year,
          plate
        }));
        alert(`✅ Dados encontrados via ${result.source}!\n${result.name} ${result.model} ${result.year}`);
      } else {
        // Se falhar, abre o modal para busca manual
        setWebSearchMode('manual');
        setIsWebSearchOpen(true);
      }
    } catch (err) {
      console.error('Erro na busca web:', err);
      setWebSearchMode('manual');
      setIsWebSearchOpen(true);
    } finally {
      setIsSearchingPlate(false);
    }
  };

  const captureFromDetetive = async () => {
    const plate = newVehicle.plate?.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!plate || plate.length !== 7) {
      alert('Digite uma placa completa no formato MERCOSUL (7 caracteres).');
      return;
    }

    setIsCapturingFromWeb(true);
    try {
      await detetiveVehicularExtractor.openAndCapture(plate, (data) => {
        setNewVehicle(prev => ({
          ...prev,
          name: data.name || prev.name,
          model: data.model || prev.model,
          year: data.year || prev.year,
          plate: data.plate || prev.plate,
          imageUrl: prev.imageUrl // mantém imagem se houver
        }));
        
        if (data.name || data.model) {
          alert(`✅ Dados capturados!\n${data.name} ${data.model} ${data.year}`);
        }
        setIsWebSearchOpen(false);
      });
    } catch (err) {
      console.error('Erro na captura automática:', err);
      alert('Erro ao capturar dados. Tente novamente ou preencha manualmente.');
    } finally {
      setIsCapturingFromWeb(false);
    }
  };

  const handleAssistedProcess = async (textOverride?: string) => {
    const dataToProcess = textOverride || rawPastedData;
    if (!dataToProcess.trim()) return;
    
    setIsProcessingAssisted(true);
    try {
      const result = await geminiService.parseRawVehicleData(dataToProcess);
      if (result && result.success !== false) {
        setNewVehicle(prev => ({
          ...prev,
          name: result.name || prev.name,
          model: result.model || prev.model,
          year: result.year || prev.year,
          color: result.color || prev.color,
          plate: result.plate ? result.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') : prev.plate
        }));
        setRawPastedData(''); 
        alert('✨ Dados extraídos com sucesso do texto informado!');
      } else {
        const errorMsg = result?.error || result?.message || 'Não foi possível identificar dados no texto informado.';
        alert(`${errorMsg}\n\nDica: Tente copiar o conteúdo completo da página de resultado (Ctrl+A, Ctrl+C).`);
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        alert("Limite de processamento IA atingido. Aguarde 1 minuto ou preencha manualmente.");
      } else {
        alert('Erro ao processar dados.');
      }
    } finally {
      setIsProcessingAssisted(false);
    }
  };


  const handleCaptureFromClipboard = async () => {
    try {
      // Tentar verificar permissão primeiro (opcional mas bom)
      try {
        const queryOpts = { name: 'clipboard-read' as PermissionName };
        const permissionStatus = await navigator.permissions.query(queryOpts);
        console.log('Clipboard permission state:', permissionStatus.state);
      } catch (e) {
        console.warn('Navigator permission query not supported or failed');
      }

      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        alert('Área de transferência vazia. Copie os dados do site primeiro (Ctrl+A, Ctrl+C).');
        return;
      }
      
      setRawPastedData(text);
      if (text.length > 20) {
        handleAssistedProcess(text);
      } else {
        alert('Conteúdo muito curto na área de transferência. Certifique-se de copiar os dados do veículo.');
      }
    } catch (err) {
      console.error('Erro ao ler clipboard:', err);
      
      // Fallback para quando a API está bloqueada por política ou permissão
      alert('Seu navegador bloqueou o acesso direto à área de transferência neste ambiente (IFrame). \n\nPor favor, clique no campo de texto "Ou cole o texto aqui..." e use Ctrl+V manualmente.');
      
      // Focar na área de texto para facilitar a vida do usuário
      setTimeout(() => {
        if (pasteTextAreaRef.current) {
          pasteTextAreaRef.current.focus();
          pasteTextAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const deleteVehicle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
      if (confirm('Você tem certeza absoluta? Posso deletar mesmo?')) {
        const newData = { ...data, vehicles: data.vehicles.filter(v => v.id !== id) };
        handleSave(newData);
        if (selectedVehicle?.id === id) setSelectedVehicle(null);
      }
    }
  };

  const checkDuplicate = (name: string, code?: string) => {
    if (!selectedVehicle) return false;
    return selectedVehicle.parts.some(p => 
      p.name.toLowerCase() === name.toLowerCase() || 
      (code && p.code && p.code !== "" && p.code === code)
    );
  };

  const addPart = async (overrideName?: string) => {
    const searchName = overrideName || newPartName;
    if (!selectedVehicle || !searchName) return;
    
    setIsResearching(true);
    try {
      const response = await geminiService.researchPart(searchName, `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`);
      
      if (response.isAmbiguous && response.suggestions && response.suggestions.length > 0) {
        setAiSuggestions(response.suggestions);
        setIsResearching(false);
        return;
      }

      if (response.part) {
        if (checkDuplicate(response.part.name || searchName, response.part.code)) {
          alert('Esta peça já consta no seu banco de dados ou possui o mesmo código.');
          setIsResearching(false);
          return;
        }

        const part: Part = {
          id: crypto.randomUUID(),
          name: response.part.name || searchName,
          code: response.part.code || '',
          category: response.part.category || 'Geral',
          description: response.part.description || '',
          lifespan: response.part.lifespan || '',
          maintenanceInterval: response.part.maintenanceInterval || '',
          brand: response.part.brand || '',
          photoUrl: response.part.photoUrl || '',
          status: 'ok',
          technicalSpecs: response.part.technicalSpecs || {}
        };

        const updatedVehicles = data.vehicles.map(v => {
          if (v.id === selectedVehicle.id) {
            return { ...v, parts: [...v.parts, part] };
          }
          return v;
        });

        handleSave({ ...data, vehicles: updatedVehicles });
        setNewPartName('');
        setAiSuggestions([]);
        setIsAddingPart(false);
      }
    } catch (error) {
      alert('Erro ao pesquisar peça com IA. Tente novamente.');
    } finally {
      setIsResearching(false);
    }
  };

  const deletePart = (partId: string) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { ...v, parts: v.parts.filter(p => p.id !== partId) };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const togglePartBudget = (partId: string) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          parts: v.parts.map(p => p.id === partId ? { ...p, isInBudget: !p.isInBudget } : p)
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const estimatePrice = async (part: Part) => {
    if (!selectedVehicle) return;
    setIsEstimatingPrice(true);
    try {
      const result = await geminiService.estimatePartPrice(part.name, `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`);
      if (result) {
        const updatedVehicles = data.vehicles.map(v => {
          if (v.id === selectedVehicle.id) {
            return {
              ...v,
              parts: v.parts.map(p => p.id === part.id ? { 
                ...p, 
                estimatedPrice: result.estimatedPrice, 
                priceType: result.priceType,
                unitsPerSet: result.unitsPerSet,
                isInBudget: true 
              } : p)
            };
          }
          return v;
        });
        handleSave({ ...data, vehicles: updatedVehicles });
      } else {
        alert('Não foi possível estimar o preço automaticamente. Você pode definir manualmente.' + ((window as any).lastGeminiPriceError ? '\n[LOG]: ' + (window as any).lastGeminiPriceError : ''));
      }
    } finally {
      setIsEstimatingPrice(false);
    }
  };

  const updatePartPrice = (partId: string, price: number) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          parts: v.parts.map(p => p.id === partId ? { ...p, estimatedPrice: price } : p)
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const exportVehicle = (vehicle: Vehicle) => {
    const jsonStr = JSON.stringify(vehicle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Padronização solicitada: PLACA.Marca.Modelo.Ano-Faixa.json
    const plate = vehicle.plate?.toUpperCase() || 'SEM_PLACA';
    const brand = vehicle.name.replace(/\s+/g, '.');
    const model = vehicle.model.replace(/\s+/g, '.');
    const year = vehicle.year.replace(/\//g, '-').replace(/\s+/g, '');
    
    link.download = `${plate}.${brand}.${model}.${year}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importVehicleInputRef = useRef<HTMLInputElement>(null);

  const handleImportVehicle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedVehicle = JSON.parse(event.target?.result as string) as Vehicle;
        
        // Validação básica para garantir que é um objeto de veículo e não um backup completo
        if (!importedVehicle.name || !importedVehicle.id || !Array.isArray(importedVehicle.parts)) {
          throw new Error('Este arquivo não parece ser um veículo válido ou é um backup completo do sistema.');
        }

        const existingIdx = data.vehicles.findIndex(v => v.id === importedVehicle.id);
        let updatedVehicles;

        if (existingIdx >= 0) {
          if (confirm('Este veículo já existe. Deseja substituir os dados locais pelo arquivo importado?')) {
            updatedVehicles = [...data.vehicles];
            updatedVehicles[existingIdx] = importedVehicle;
          } else {
            return;
          }
        } else {
          updatedVehicles = [...data.vehicles, importedVehicle];
        }

        handleSave({ ...data, vehicles: updatedVehicles });
        setSelectedVehicle(importedVehicle);
        alert('Veículo importado com sucesso!');
      } catch (err) {
        alert('Erro ao importar veículo: formato de arquivo inválido.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importedData = await storageService.importData(file);
        setData(importedData);
        setSelectedVehicle(null);
        alert('Banco de dados importado com sucesso!');
      } catch (err) {
        alert('Erro ao importar arquivo.');
      }
    }
  };

  const generateManualInfo = async () => {
    if (!selectedVehicle) return;
    setIsGeneratingManual(true);
    try {
      const info = await geminiService.getVehicleManualInfo(`${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`);
      const updatedVehicles = data.vehicles.map(v => {
        if (v.id === selectedVehicle.id) {
          const updated = { ...v, manualTranscription: info };
          setSelectedVehicle(updated);
          return updated;
        }
        return v;
      });
      handleSave({ ...data, vehicles: updatedVehicles });
    } catch (error) {
      console.error('Erro ao gerar manual:', error);
    } finally {
      setIsGeneratingManual(false);
    }
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (manualPDFInputRef.current) manualPDFInputRef.current.value = '';
      return;
    }

    if (!selectedVehicle) {
      alert('Selecione um veículo antes de enviar o PDF.');
      if (manualPDFInputRef.current) manualPDFInputRef.current.value = '';
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF válido.');
      if (manualPDFInputRef.current) manualPDFInputRef.current.value = '';
      return;
    }

    await handleManualPDFUpload(file);
    if (manualPDFInputRef.current) manualPDFInputRef.current.value = '';
  };

  const sendManualChat = async () => {
    if (!selectedVehicle || !manualChatQuery || !selectedVehicle.manualTranscription) return;
    setIsChattingWithManual(true);
    try {
      const response = await geminiService.chatWithManual(
        manualChatQuery,
        selectedVehicle.manualTranscription,
        `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`
      );
      setManualChatResponse(response);
      setManualChatQuery('');
    } catch (error) {
      alert('Erro ao conversar com o manual.');
    } finally {
      setIsChattingWithManual(false);
    }
  };

  const exportMechanicReport = () => {
    if (!selectedVehicle) return;
    const report = `
RELATÓRIO TÉCNICO: ${selectedVehicle.name.toUpperCase()}
Documento gerado em: ${new Date().toLocaleDateString()}

ESTADO ATUAL:
- Quilometragem: ${selectedVehicle.mileage} km
- Modelo: ${selectedVehicle.model} (${selectedVehicle.year})

ÚLTIMOS SERVIÇOS:
${selectedVehicle.services.slice(0, 5).map(s => `- ${s.date}: ${s.description} (${s.mileage}km)
  Oficina: ${s.workshopName}${s.workshopAddress ? ` - ${s.workshopAddress}` : ''}${s.workshopPhone ? ` (Fone: ${s.workshopPhone})` : ''}`).join('\n')}

PEÇAS INSTALADAS:
${selectedVehicle.parts.map(p => `- ${p.name}: ${p.brand || 'N/A'}`).join('\n')}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${selectedVehicle.name.toLowerCase()}.txt`;
    link.click();
  };

  const [isUpdatingFipe, setIsUpdatingFipe] = useState(false);

  const updateFipeValue = async (vId: string) => {
    const vehicle = data.vehicles.find(v => v.id === vId);
    if (!vehicle) return;
    
    setIsUpdatingFipe(true);
    try {
      const value = await geminiService.fetchFipeValue(vehicle.name, vehicle.model, vehicle.year);
      setData(prev => ({
        ...prev,
        vehicles: prev.vehicles.map(v => v.id === vId ? {
          ...v,
          fipeValue: value,
          lastFipeUpdate: new Date().toISOString()
        } : v)
      }));
    } catch (error) {
      console.error("Erro ao atualizar FIPE:", error);
    } finally {
      setIsUpdatingFipe(false);
    }
  };

  useEffect(() => {
    if (data.vehicles.length > 0) {
      data.vehicles.forEach(v => {
        // Atualiza se não tiver valor ou se o valor for antigo (mais de 24h)
        const isOld = !v.lastFipeUpdate || (new Date().getTime() - new Date(v.lastFipeUpdate).getTime() > 86400000);
        if (isOld) updateFipeValue(v.id);
      });
    }
  }, []);

  const getVehicleHealth = () => {
    if (!selectedVehicle) return 100;
    if ((selectedVehicle.parts?.length || 0) === 0) return 100;
    
    const criticalParts = (selectedVehicle.parts || []).filter(p => p.status === 'critical').length;
    const warningParts = (selectedVehicle.parts || []).filter(p => p.status === 'warning').length;
    
    // Penalidades mais severas: uma peça crítica remove 30% de saúde
    // Saúde = 100 - (críticos * 30) - (avisos * 10)
    const health = 100 - (criticalParts * 30 + warningParts * 10);
    return Math.max(Math.min(health, 100), 0);
  };

  const getMaintenanceScore = () => {
    if (!selectedVehicle) return 0;
    
    let score = 70; // Pontuação base
    
    // Penalidades por saúde baixo
    const health = getVehicleHealth();
    if (health < 80) score -= (80 - health) * 0.5;
    
    // Bônus por serviços documentados (pelo menos 3 meses de histórico)
    const servicesCount = selectedVehicle.services?.length || 0;
    score += Math.min(servicesCount * 5, 20); // Máximo 20 pontos de bônus por volume
    
    // Bônus por manuais e documentação técnica
    if (selectedVehicle.manualTranscription) score += 10;
    
    return Math.min(Math.round(score), 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-brand-bg tech-grid p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-2 gap-2">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="bg-brand-accent p-3 rounded shadow-lg shadow-brand-accent/20 glow-accent"
            >
              <HeaderLogo iconName={data.settings?.appIcon} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-brand-primary leading-tight">
                {data.settings?.appName || 'Meu Carro Top'}
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Sistema de Gestão Ativo</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full lg:w-auto lg:min-w-[400px]">
            <motion.button 
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSettingsOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white border border-gray-100 text-sm font-bold text-gray-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            >
              <Settings size={18} /> <span>Configurações</span>
            </motion.button>
            <motion.button 
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingVehicle(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-accent transition-all"
            >
              <Plus size={18} /> <span>Novo Veículo</span>
            </motion.button>
          </div>
        </header>

        {/* Compact Dashboard Status Ribbon */}
        {!selectedVehicle && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-2 pb-2 border-b border-gray-100"
          >
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
              <Car size={14} className="text-brand-accent" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Frota</span>
              <span className="text-sm font-black text-brand-primary">{data.vehicles?.length || 0}</span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
              <Activity size={14} className="text-green-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Saúde</span>
              <span className="text-sm font-black text-green-600">Excelente</span>
            </div>
            
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
              <Box size={14} className="text-brand-accent" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Peças</span>
              <span className="text-sm font-black text-brand-primary">
                {data.vehicles.reduce((acc, v) => acc + (v.parts?.length || 0), 0)}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
              <Shield size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Dados</span>
              <span className="text-sm font-black text-blue-600">Protegidos</span>
            </div>
          </motion.div>
        )}

        {!selectedVehicle ? (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
          >
            {data.vehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                onClick={() => setSelectedVehicle(vehicle)}
                className="group relative glass-card p-4 cursor-pointer overflow-hidden"
              >
                <div className="flex flex-col items-center">
                  <div className="text-center w-full mb-2">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <BrandLogo 
                        vehicleName={vehicle.name} 
                        brandLogoUrl={vehicle.brandLogoUrl}
                        className="w-10 h-10 rounded shadow-sm"
                      />
                      <h3 className="text-lg font-black text-brand-primary tracking-tight leading-none">{vehicle.name}</h3>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest line-clamp-1">{vehicle.model} • {vehicle.year}</p>
                  </div>

                  <div className="relative w-full mb-2 group-hover:scale-[1.02] transition-transform duration-500">
                    <VehicleImage 
                      src={vehicle.imageUrl} 
                      alt={vehicle.name} 
                      className="aspect-video w-full rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] ring-2 ring-white/50 object-cover" 
                    />
                  </div>
                  
                  <div className="text-center w-full">
                    <div className="relative flex items-center justify-center gap-4 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        <Gauge size={14} className="text-brand-accent" />
                        <span className="text-xs font-mono font-bold text-gray-700">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Box size={14} className="text-brand-accent" />
                        <span className="text-xs font-mono font-bold text-gray-700">{(vehicle.parts?.length || 0)} itens</span>
                      </div>
                      {vehicle.fipeValue && (
                        <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded text-[10px] font-black text-green-600">
                          <DollarSign size={10} />
                          R$ {vehicle.fipeValue.toLocaleString()}
                        </div>
                      )}
                      <motion.button 
                        whileHover={{ scale: 1.2, color: '#ef4444' }}
                        onClick={(e) => deleteVehicle(vehicle.id, e)}
                        className="absolute right-0 p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => importVehicleInputRef.current?.click()}
              className="group border-2 border-dashed border-gray-200 rounded p-8 flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-blue-400 hover:text-blue-400 transition-all bg-white/30 backdrop-blur-sm min-h-[320px]"
            >
              <div className="bg-gray-50 p-6 rounded group-hover:bg-blue-50 transition-colors">
                <Download size={48} />
              </div>
              <div className="text-center">
                <span className="text-sm font-black uppercase tracking-widest block">Importar Veículo</span>
                <span className="text-[10px] font-bold opacity-60">Arquivo .json do Cliente</span>
              </div>
            </motion.button>

            <motion.button
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingVehicle(true)}
              className="group border-2 border-dashed border-gray-200 rounded p-8 flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-brand-primary/30 hover:text-brand-primary transition-all bg-white/30 backdrop-blur-sm min-h-[320px]"
              id="add-vehicle-btn"
            >
              <div className="bg-gray-50 p-6 rounded group-hover:bg-brand-primary/10 transition-colors">
                <Plus size={48} />
              </div>
              <span className="font-black text-lg tracking-tight">Novo Veículo</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {/* Breadcrumbs / Back */}
            <button 
              onClick={() => setSelectedVehicle(null)}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-accent transition-colors mb-2"
              id="back-btn"
            >
              <ArrowLeft size={16} /> Voltar para Meus Veículos
            </button>

            {/* Vehicle Detail Header */}
            <div className="glass-dark text-white p-6 md:p-8 relative overflow-hidden mb-2">
               <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-brand-accent text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Active System</span>
                  <span className="text-gray-500 text-[10px] font-mono">VIN: {selectedVehicle.id.slice(0, 8).toUpperCase()}</span>
                </div>

                <div className="w-full max-w-[540px] mb-2 relative">
                  <VehicleImage 
                    src={selectedVehicle.imageUrl} 
                    alt={selectedVehicle.name} 
                    className="aspect-video w-full rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] ring-4 ring-white/20 object-cover" 
                  />
                </div>

                <div className="flex flex-col items-center gap-1 mb-2">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <BrandLogo 
                      vehicleName={selectedVehicle.name} 
                      brandLogoUrl={selectedVehicle.brandLogoUrl}
                      className="w-16 h-16 rounded-2xl shadow-xl border-2 border-white/20"
                    />
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase underline decoration-brand-accent/50 underline-offset-8 decoration-4">{selectedVehicle.name}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg text-gray-400 font-bold opacity-80">{selectedVehicle.model} — {selectedVehicle.year}</p>
                    <button 
                      onClick={() => exportVehicle(selectedVehicle)}
                      className="p-1.5 hover:text-brand-accent transition-colors text-gray-500 bg-white/5 rounded-lg"
                      title="Exportar Dados do Veículo (.json)"
                    >
                      <Download size={18} />
                    </button>
                    <button 
                      onClick={openEditModal}
                      className="p-1.5 hover:text-brand-accent transition-colors text-gray-500 bg-white/5 rounded-lg"
                      title="Configurar Veículo"
                    >
                      <Settings size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full border-t border-white/5 pt-2 max-w-4xl">
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Itens</p>
                    <p className="text-2xl font-mono font-black">{selectedVehicle.parts?.length || 0}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Odômetro</p>
                    <p className="text-2xl font-mono font-black">{selectedVehicle.mileage.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Média</p>
                    <p className="text-2xl font-mono font-black text-brand-accent">
                      {(() => {
                        const logs = [...(selectedVehicle.fuelLogs || [])].sort((a, b) => a.mileage - b.mileage);
                        if (logs.length < 2) return '--';
                        const totalKm = logs[logs.length - 1].mileage - logs[0].mileage;
                        const totalL = logs.slice(1).reduce((sum, l) => sum + l.liters, 0);
                        return totalL > 0 ? (totalKm / totalL).toFixed(1) : '--';
                      })()}
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Saúde IA</p>
                    <p className={`text-2xl font-mono font-black ${getVehicleHealth() > 80 ? 'text-green-400' : getVehicleHealth() > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {Math.round(getVehicleHealth())}%
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Score Valorização</p>
                    <div className="flex items-center gap-2">
                       <p className={`text-2xl font-mono font-black ${getMaintenanceScore() > 85 ? 'text-blue-400' : 'text-gray-400'}`}>
                         {getMaintenanceScore()}%
                       </p>
                       <span className="text-[8px] bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded uppercase font-bold">Premium</span>
                    </div>
                  </div>
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateFipeValue(selectedVehicle.id)}
                    className="bg-white/5 p-3 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1 flex justify-between items-center">
                      Momento FIPE
                      <RefreshCw size={8} className={isUpdatingFipe ? "animate-spin text-brand-accent" : "text-gray-600"} />
                    </p>
                    <div className="flex items-center gap-2">
                       <p className="text-2xl font-mono font-black text-green-400">
                         R$ {selectedVehicle.fipeValue?.toLocaleString() || '---'}
                       </p>
                    </div>
                  </motion.div>
                </div>

                {/* Health Progress Bar */}
                <div className="w-full max-w-4xl mt-3 mb-1">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${getVehicleHealth()}%` }}
                      className={`h-full rounded-full ${getVehicleHealth() > 80 ? 'bg-green-500' : getVehicleHealth() > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-2 w-full max-w-2xl overflow-x-auto pb-2 scrollbar-hide">
                  <button 
                    onClick={() => setIsAddingPart(true)}
                    className="flex-1 bg-brand-accent hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 whitespace-nowrap text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Catalogar Peça
                  </button>
                  <button 
                    onClick={() => setIsBudgetOpen(true)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold border border-white/10 transition-all whitespace-nowrap text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} /> Carrinho ({(selectedVehicle.parts || []).filter(p => p.isInBudget).length})
                  </button>
                  <button 
                    onClick={() => {
                      setSimulationMileage(selectedVehicle.mileage + 10000);
                      setSimulationResults([]);
                      setIsSimulating(true);
                    }}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold border border-white/10 transition-all whitespace-nowrap text-sm flex items-center justify-center gap-2"
                  >
                    <Activity size={18} /> Simular
                  </button>
                </div>
              </div>
              
              <div className="absolute top-0 left-0 w-64 h-64 bg-brand-accent/10 rounded-full -ml-32 -mt-32 blur-[100px]"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full -mr-32 -mb-32 blur-[100px]"></div>
            </div>

            {/* Tab Navigation */}
            <div className="flex overflow-x-auto gap-2 pb-1 -mx-1 scrollbar-hide">
              {[
                { id: 'parts', label: 'Peças & Componentes', icon: Box },
                { id: 'services', label: 'Histórico de Serviços', icon: Wrench },
                { id: 'fuel', label: 'Combustível & Consumo', icon: Gauge },
                { id: 'reminders', label: 'Lembretes & Alertas', icon: Activity },
                { id: 'manual', label: 'Manual do Veículo', icon: Book },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all font-bold text-xs ${
                    activeTab === tab.id 
                    ? 'bg-brand-primary text-white shadow-lg' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conditional Content based on Active Tab */}
            {activeTab === 'parts' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-brand-primary">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Search size={20} className="text-brand-accent" /> Inventário de Peças
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const fluids = selectedVehicle.manualTranscription?.toLowerCase().includes('fluido') || selectedVehicle.manualTranscription?.toLowerCase().includes('óleo');
                        if (fluids) {
                          alert('DICA IA: Verifique a aba "Manual" para especificações exatas de óleo e capacidades já extraídas.');
                        } else {
                          generateManualInfo();
                        }
                      }}
                      className="bg-brand-primary/5 text-brand-primary px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-brand-primary/10 transition-all flex items-center gap-2"
                    >
                      <Pipette size={14} /> Ref. Fluidos
                    </button>
                    <button 
                      onClick={() => setIsAddingPart(true)}
                      className="bg-brand-primary text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-brand-accent transition-all flex items-center gap-2"
                    >
                      <Plus size={14} /> Catalogar Peça
                    </button>
                  </div>
                </div>
              
              <div className="grid grid-cols-1 gap-2">
                {(selectedVehicle.parts?.length || 0) === 0 ? (
                   <div className="text-center py-20 bg-gray-50 rounded border border-dashed border-gray-200">
                      <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium tracking-tight">Nenhuma peça catalogada ainda.</p>
                   </div>
                ) : (
                  selectedVehicle.parts.map((part) => (
                    <motion.div
                      layout
                      key={part.id}
                      className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-brand-accent transition-all cursor-default flex flex-col md:flex-row justify-between gap-3 shadow-sm hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                          part.status === 'ok' ? 'bg-green-50' : 'bg-amber-50'
                        }`}>
                          {part.status === 'ok' ? <CheckCircle2 size={24} className="text-green-500" /> : <AlertCircle size={24} className="text-amber-500" />}
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-bold text-base text-gray-800">{part.name}</h4>
                            <span className="text-[9px] bg-brand-primary/5 text-brand-primary px-2 py-0.5 rounded-full font-mono font-bold uppercase">{part.code}</span>
                            {part.brand && <span className="text-[10px] text-brand-accent font-bold italic">@{part.brand}</span>}
                          </div>
                          <p className="text-xs text-gray-500 mb-1.5 line-clamp-1">{part.description}</p>
                          <div className="flex flex-wrap gap-2">
                             <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">Marca: {part.brand || 'Original'}</span>
                             <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">Vida: {part.lifespan}</span>
                             {part.technicalSpecs && Object.keys(part.technicalSpecs).length > 0 && (
                               <button 
                                 onClick={() => {
                                   const specs = Object.entries(part.technicalSpecs || {}).map(([k,v]) => `${k}: ${v}`).join('\n');
                                   alert(`ESPECIFICAÇÕES TÉCNICAS:\n${specs}`);
                                 }}
                                 className="text-[9px] font-bold text-brand-primary bg-brand-primary/5 px-1.5 py-0.5 rounded hover:bg-brand-primary/10 transition-colors flex items-center gap-1"
                               >
                                 <Plus size={8} /> TECHNICAL SPECS
                               </button>
                             )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-5 md:min-w-[260px]">
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => estimatePrice(part)}
                             disabled={isEstimatingPrice}
                             className={`p-2.5 rounded-xl transition-all shadow-sm ${part.isInBudget ? 'bg-brand-accent text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'}`}
                             title={part.isInBudget ? "No Orçamento" : "Estimar Preço via IA"}
                           >
                             {isEstimatingPrice ? <Settings className="animate-spin" size={18} /> : <DollarSign size={18} />}
                           </button>
                           <div className="text-right">
                              <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5 tracking-tight">Média IA</p>
                              <p className="text-sm font-mono font-bold text-brand-primary leading-none">
                                {part.estimatedPrice ? `R$ ${part.estimatedPrice.toLocaleString()}` : '--'}
                              </p>
                              {part.priceType && (
                                <div className="flex items-center gap-1 mt-1 justify-end">
                                  <span className="text-[8px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                    {part.priceType}
                                  </span>
                                  {part.unitsPerSet && (
                                    <span className="text-[8px] text-gray-400 font-bold">({part.unitsPerSet} un)</span>
                                  )}
                                </div>
                              )}
                           </div>
                        </div>
                        <div className="text-right border-l border-gray-50 pl-5">
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-tight">Intervalo</p>
                          <p className="text-xs font-mono font-bold text-gray-600">{part.maintenanceInterval || '---'}</p>
                        </div>
                        <button 
                          onClick={() => deletePart(part.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

            {/* Services History Tab */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-brand-primary">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Wrench size={22} className="text-brand-accent" /> Histórico Manut.
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={exportMechanicReport}
                      className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-bold text-xs hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-2"
                      title="Gerar relatório técnico para o mecânico"
                    >
                      <FileText size={14} /> Relatório
                    </button>
                    <button 
                      onClick={() => setIsAddingService(true)}
                      className="bg-brand-primary text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-brand-accent transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={14} /> Novo Serviço
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(!selectedVehicle.services || selectedVehicle.services.length === 0) ? (
                    <div className="text-center py-20 bg-gray-50 rounded border border-dashed border-gray-200">
                      <Book size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Nenhum serviço registrado ainda.</p>
                    </div>
                  ) : (
                    [...selectedVehicle.services].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((service) => (
                      <div key={service.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:border-brand-primary/20 transition-all duration-300">
                        <div className="p-5 flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-brand-primary/5 p-3 rounded-2xl text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                              <Wrench size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{new Date(service.date).toLocaleDateString('pt-BR')}</span>
                                <span className="text-[10px] text-gray-300 font-mono">ID: #{service.id.slice(0, 8)}</span>
                              </div>
                              <h4 className="text-xl font-black text-brand-primary mb-1 leading-none">{service.description}</h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                <div className="flex flex-col gap-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">
                                      {service.workshopName}
                                    </span>
                                  </div>
                                  {(service.workshopAddress || service.workshopPhone) && (
                                    <div className="flex flex-col gap-0.5 ml-4">
                                      {service.workshopAddress && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                          <MapPin size={10} className="text-gray-300" />
                                          <span className="line-clamp-1">{service.workshopAddress}</span>
                                        </div>
                                      )}
                                      {service.workshopPhone && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                          <Phone size={10} className="text-gray-300" />
                                          <span>{service.workshopPhone}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {service.mechanicName && (
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">Mec: {service.mechanicName}</span>
                                )}
                              </div>
                              {service.createdAt && (
                                <p className="text-[9px] text-gray-300 uppercase font-black tracking-widest mt-2 flex items-center gap-1">
                                  <RefreshCw size={8} className="animate-spin-slow" />
                                  Registrado Automaticamente: {new Date(service.createdAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-8 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => setSelectedServiceForReport(service)}
                                 className="p-2 rounded-xl bg-brand-primary text-white hover:bg-brand-accent transition-all shadow-md shadow-brand-primary/20 flex items-center gap-2 px-3"
                                 title="Ver Relatório Profissional"
                               >
                                 <FileText size={16} />
                                 <span className="text-xs font-bold">Relatório</span>
                               </button>
                               <button 
                                 onClick={() => {
                                   const url = prompt('Cole a URL da foto do serviço/nota fiscal:');
                                   if (url) alert('Foto vinculada com sucesso!');
                                 }}
                                 className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-brand-primary hover:text-white border border-gray-100 transition-all"
                                 title="Vincular Foto/Nota"
                               >
                                 <Camera size={16} />
                               </button>
                               <button 
                                 onClick={() => {
                                   const note = prompt('Adicione uma nota técnica ou observação:', service.notes || '');
                                   if (note !== null) {
                                     const updatedVehicles = data.vehicles.map(v => {
                                       if (v.id === selectedVehicle.id) {
                                         return {
                                           ...v,
                                           services: v.services.map(s => s.id === service.id ? { ...s, notes: note } : s)
                                         };
                                       }
                                       return v;
                                     });
                                     handleSave({ ...data, vehicles: updatedVehicles });
                                   }
                                 }}
                                 className={`p-2 rounded-xl border transition-all ${service.notes ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border-gray-100'}`}
                                 title={service.notes ? `Nota: ${service.notes}` : "Adicionar Observação de Check-in"}
                               >
                                 <Box size={16} />
                               </button>
                            </div>

                            <div className="text-right">
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Custo Total</p>
                              <p className="text-2xl font-mono font-black text-brand-primary leading-none">R$ {service.cost.toLocaleString()}</p>
                              {service.laborCost > 0 && (
                                <p className="text-[10px] text-gray-400 font-bold mt-1">Mão de obra: R$ {service.laborCost.toLocaleString()}</p>
                              )}
                              <div className="flex items-center gap-1.5 mt-2 justify-end text-brand-accent">
                                <Gauge size={12} />
                                <span className="text-[10px] font-mono font-bold">{service.mileage.toLocaleString()} km</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => deleteItem('services', service.id)}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>

                        {/* Invoice-like Item list breakdown */}
                        {service.partsList && service.partsList.length > 0 && (
                          <div className="bg-gray-50/50 px-5 py-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                             {service.partsList.map((p) => (
                                <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                                   <div>
                                      <p className="text-xs font-black text-gray-700 leading-tight">{p.name}</p>
                                      <p className="text-[10px] text-gray-400 font-bold">Qtd: {p.quantity}</p>
                                      {p.observation && (
                                        <p className="text-[9px] text-brand-accent italic font-bold mt-1 line-clamp-2" title={p.observation}>
                                           Obs: {p.observation}
                                        </p>
                                      )}
                                   </div>
                                   <div className="text-right">
                                      <p className="text-xs font-mono font-bold text-brand-primary">R$ {(p.quantity * p.unitPrice).toLocaleString()}</p>
                                      <p className="text-[9px] text-gray-300 font-mono italic">un: R$ {p.unitPrice.toLocaleString()}</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Fuel Consumption Tab */}
            {activeTab === 'fuel' && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {/* Stats Cards */}
                  <div className="bg-brand-primary text-white p-4 rounded shadow-lg overflow-hidden relative">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Média de Consumo</p>
                    <h4 className="text-2xl font-mono font-black italic">
                      {(() => {
                        const logs = [...(selectedVehicle.fuelLogs || [])].sort((a, b) => a.mileage - b.mileage);
                        if (logs.length < 2) return '--';
                        const totalKm = logs[logs.length - 1].mileage - logs[0].mileage;
                        const totalL = logs.slice(1).reduce((sum, l) => sum + l.liters, 0);
                        return totalL > 0 ? (totalKm / totalL).toFixed(1) : '--';
                      })()} km/L
                    </h4>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest leading-tight">Baseado nos últimos abastecimentos</p>
                    <Gauge className="absolute bottom-[-10px] right-[-10px] opacity-10" size={60} />
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded shadow-sm">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Gasto no Mês</p>
                    <h4 className="text-2xl font-mono font-black text-brand-primary">
                      R$ {selectedVehicle.fuelLogs?.reduce((acc, log) => {
                        const logDate = new Date(log.date);
                        const now = new Date();
                        if (logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()) {
                          return acc + log.cost;
                        }
                        return acc;
                      }, 0).toLocaleString()}
                    </h4>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Total gasto este mês</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Abastecimentos</p>
                      <h4 className="text-2xl font-mono font-black text-brand-primary">{selectedVehicle.fuelLogs?.length || 0}</h4>
                    </div>
                    <button 
                      onClick={() => setIsAddingFuel(true)}
                      className="bg-brand-primary text-white p-3 rounded shadow-lg hover:bg-brand-accent transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Database size={22} className="text-brand-accent" /> Histórico de Abastecimentos
                  </h3>
                  {(!selectedVehicle.fuelLogs || selectedVehicle.fuelLogs.length === 0) ? (
                    <div className="text-center py-20 bg-gray-50 rounded border border-dashed border-gray-200">
                      <Zap size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Nenhum abastecimento registrado.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left bg-white rounded border border-gray-100 overflow-hidden shadow-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Quilometragem</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Litros</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Custo</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tanque Cheio</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {[...selectedVehicle.fuelLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3 text-xs font-bold text-brand-primary">{new Date(log.date).toLocaleDateString('pt-BR')}</td>
                              <td className="px-4 py-3 text-xs font-mono">{log.mileage.toLocaleString()} km</td>
                              <td className="px-4 py-3 text-xs font-mono">{log.liters.toLocaleString()} L</td>
                              <td className="px-4 py-3 text-xs font-mono font-bold text-brand-accent">R$ {log.cost.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                {log.fullTank ? (
                                  <span className="bg-green-50 text-green-600 text-[7px] font-black uppercase px-2 py-0.5 rounded">Sim</span>
                                ) : (
                                  <span className="bg-gray-50 text-gray-400 text-[7px] font-black uppercase px-2 py-0.5 rounded">Não</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => deleteItem('fuelLogs', log.id)}
                                  className="text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reminders Tab */}
            {activeTab === 'reminders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Activity size={22} className="text-brand-accent" /> Lembretes & Alertas Proximos
                  </h3>
                  <button 
                    onClick={() => setIsAddingReminder(true)}
                    className="bg-brand-primary text-white px-4 py-2 rounded font-bold text-xs"
                  >
                    + Novo Lembrete
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(!selectedVehicle.reminders || selectedVehicle.reminders.length === 0) ? (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded border border-dashed border-gray-200">
                      <Activity size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Sem lembretes configurados.</p>
                    </div>
                  ) : (
                    selectedVehicle.reminders.map((reminder) => (
                      <div key={reminder.id} className={`p-4 rounded border transition-all flex items-start gap-3 ${reminder.isCompleted ? 'bg-gray-50/50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-brand-primary/30 shadow-sm'}`}>
                        <button 
                          onClick={() => toggleReminder(reminder.id)}
                          className={`mt-1 p-1 rounded-full border-2 transition-all ${reminder.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-transparent hover:border-brand-primary'}`}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                        <div className="flex-1">
                          <h4 className={`text-base font-black tracking-tight mb-1 ${reminder.isCompleted ? 'line-through text-gray-400' : 'text-brand-primary'}`}>
                            {reminder.title}
                          </h4>
                          <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {reminder.targetMileage && (
                              <span className="flex items-center gap-1">
                                <Gauge size={10} className="text-brand-accent" /> {reminder.targetMileage.toLocaleString()} km
                              </span>
                            )}
                            {reminder.targetDate && (
                              <span className="flex items-center gap-1">
                                <Activity size={10} className="text-brand-accent" /> {new Date(reminder.targetDate).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            <span className="ml-auto bg-gray-100 px-1.5 py-0.5 rounded text-[7px]">{reminder.type}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteItem('reminders', reminder.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-0.5"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Manual Tab */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-brand-primary">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Book size={22} className="text-brand-accent" /> Manual & Assistente IA
                  </h3>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={manualPDFInputRef}
                      onChange={handlePDFUpload}
                      accept=".pdf"
                      className="hidden"
                    />
                    <button 
                      onClick={() => manualPDFInputRef.current?.click()}
                      disabled={isUploadingPDF || isGeneratingManual}
                      className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded font-bold text-xs hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUploadingPDF ? (
                        <>
                          <Settings className="animate-spin" size={14} />
                          Extraindo...
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          Upload PDF
                        </>
                      )}
                    </button>
                    {!selectedVehicle.manualTranscription && (
                      <button 
                        onClick={generateManualInfo}
                        disabled={isGeneratingManual || isUploadingPDF}
                        className="bg-brand-primary text-white px-4 py-2 rounded font-bold text-xs hover:bg-brand-accent transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingManual ? (
                          <>
                            <Settings className="animate-spin" size={14} />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            Gerar com IA
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!selectedVehicle.manual && !selectedVehicle.manualTranscription ? (
                  <div className="text-center py-16 bg-gray-50 rounded border border-dashed border-gray-200">
                    <Book size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
                      Você ainda não possui as informações técnicas do manual para este veículo. 
                      Use a IA para pesquisar e transcrever os dados essenciais.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Manual content */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Structured Manual Data */}
                      {selectedVehicle.manual && (
                        <>
                          {/* Maintenance Schedule */}
                          {selectedVehicle.manual.maintenanceSchedule.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                              <h4 className="font-bold text-lg text-blue-900 mb-4 flex items-center gap-2">
                                <Wrench size={20} className="text-blue-600" />
                                Plano de Manutenção Programada
                              </h4>
                              <div className="space-y-3">
                                {selectedVehicle.manual.maintenanceSchedule.map((schedule, idx) => (
                                  <div key={idx} className="bg-white p-4 rounded-lg border border-blue-100">
                                    <div className="font-bold text-blue-900 mb-2">
                                      {schedule.mileage.toLocaleString()} km
                                    </div>
                                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                      {schedule.items.map((item, i) => (
                                        <li key={i} className="list-disc">
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                    {schedule.description && (
                                      <p className="text-xs text-gray-600 mt-2 italic">
                                        {schedule.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Technical Sections */}
                          {Object.keys(selectedVehicle.manual.technicalSections).some(k => selectedVehicle.manual?.technicalSections[k]) && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                              <h4 className="font-bold text-lg text-amber-900 mb-4 flex items-center gap-2">
                                <AlertCircle size={20} className="text-amber-600" />
                                Informações Técnicas
                              </h4>
                              <div className="space-y-3">
                                {Object.entries(selectedVehicle.manual.technicalSections).map(([key, value]) => {
                                  if (!value) return null;
                                  const labels: { [key: string]: string } = {
                                    tirePressure: '📍 Pressão de Pneus',
                                    oilSpecification: '🛢️ Especificação de Óleo',
                                    batteryInfo: '🔋 Bateria',
                                    filterInfo: '🌬️ Filtros',
                                    fluidsCapacities: '⚙️ Capacidades de Fluidos'
                                  };
                                  
                                  return (
                                    <div key={key} className="bg-white p-4 rounded-lg border border-amber-100">
                                      <p className="font-bold text-amber-900 mb-2">
                                        {labels[key] || key}
                                      </p>
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {value}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Full Text / Transcription */}
                      {selectedVehicle.manualTranscription && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-hidden prose prose-sm max-w-none">
                          <div className="markdown-body">
                            <Markdown>
                              {selectedVehicle.manualTranscription}
                            </Markdown>
                          </div>
                        </div>
                      )}

                      {selectedVehicle.manual && selectedVehicle.manual.fullText && !selectedVehicle.manualTranscription && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-hidden prose prose-sm max-w-none">
                          <div className="markdown-body">
                            <Markdown>
                              {selectedVehicle.manual.fullText}
                            </Markdown>
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={generateManualInfo}
                        disabled={isGeneratingManual}
                        className="text-xs text-gray-400 hover:text-brand-accent flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw size={12} className={isGeneratingManual ? "animate-spin" : ""} /> Deseja atualizar ou pesquisar novamente na internet?
                      </button>
                    </div>

                    {/* Chat with manual */}
                    <div className="bg-brand-primary rounded-2xl p-6 text-white shadow-xl flex flex-col h-[600px]">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-brand-accent p-2 rounded-lg">
                          <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-black italic tracking-tighter uppercase leading-none">Mecânico IA</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Baseado no seu manual</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                        {manualChatResponse ? (
                          <div className="bg-white/10 p-4 rounded-xl border border-white/5 text-sm leading-relaxed">
                            <p className="font-bold text-brand-accent mb-2">Resposta:</p>
                            <div className="markdown-body prose prose-invert prose-xs">
                              <Markdown>
                                {manualChatResponse}
                              </Markdown>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-10 opacity-50">
                            <p className="text-xs">Faça uma pergunta sobre o manual (ex: calibragem dos pneus, tipo de óleo, torques...)</p>
                          </div>
                        )}
                        {isChattingWithManual && (
                          <div className="flex justify-center py-4">
                            <div className="animate-pulse flex space-x-2">
                              <div className="h-1.5 w-1.5 bg-brand-accent rounded-full"></div>
                              <div className="h-1.5 w-1.5 bg-brand-accent rounded-full animation-delay-200"></div>
                              <div className="h-1.5 w-1.5 bg-brand-accent rounded-full animation-delay-400"></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Pergunte ao manual..."
                          className="w-full bg-white/10 border border-white/10 rounded-xl p-4 pr-12 text-sm focus:ring-2 focus:ring-brand-accent outline-none placeholder:text-white/30"
                          value={manualChatQuery}
                          onChange={(e) => setManualChatQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendManualChat()}
                        />
                        <button 
                          onClick={sendManualChat}
                          disabled={isChattingWithManual || !manualChatQuery}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-accent rounded-lg text-white disabled:opacity-50 transition-all"
                        >
                          {isChattingWithManual ? <Settings className="animate-spin" size={18} /> : <Send size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* MODAL: Add/Edit Vehicle */}
<AnimatePresence>
  {(isAddingVehicle || isEditingVehicle) && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          setIsAddingVehicle(false);
          setIsEditingVehicle(false);
        }}
        className="absolute inset-0 bg-brand-primary/40 backdrop-blur-md"
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative bg-white rounded-3xl p-6 sm:p-8 w-full ${showInternalBrowser ? 'max-w-5xl' : 'max-w-lg'} shadow-2xl overflow-y-auto max-h-[95vh] transition-all duration-500`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tighter uppercase italic">
            {isEditingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
          </h2>
          {showInternalBrowser && (
            <button 
              onClick={() => setShowInternalBrowser(false)}
              className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-gray-200 transition-all uppercase"
            >
              Fechar Navegador
            </button>
          )}
        </div>

        {showInternalBrowser ? (
          <div className="flex flex-col md:flex-row md:h-[600px] h-auto gap-6 overflow-y-auto md:overflow-hidden pb-6 md:pb-0">
            {/* Navegador à esquerda */}
            <div className="flex-[2] flex flex-col gap-3 h-[350px] md:h-full shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {searchPortals.map(portal => (
                  <button
                    key={portal.url}
                    onClick={() => setInternalBrowserUrl(portal.url.replace('{placa}', newVehicle.plate || ''))}
                    className={`px-3 py-2 text-[10px] font-bold rounded-xl whitespace-nowrap transition-all border ${internalBrowserUrl === portal.url.replace('{placa}', newVehicle.plate || '') ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'}`}
                  >
                    {portal.icon} {portal.name}
                  </button>
                ))}
              </div>
              <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden relative shadow-inner">
                <iframe 
                  src={internalBrowserUrl} 
                  className="w-full h-full border-none"
                  title="Navegador de Consulta"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <a href={internalBrowserUrl} target="_blank" rel="noreferrer" className="bg-black/60 text-white p-2 rounded-lg backdrop-blur-md hover:bg-black/80 transition-all">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Captura à direita */}
            <div className="flex-1 flex flex-col gap-4 md:overflow-y-auto md:pr-1 custom-scrollbar">
              <div className="bg-brand-primary p-5 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-brand-accent/10 rounded-full blur-3xl group-hover:bg-brand-accent/20 transition-all duration-700" />
                
                <h4 className="text-[11px] font-black uppercase tracking-[2px] mb-2 flex items-center gap-2 text-white">
                  <Wand2 size={14} className="text-brand-accent animate-pulse" /> Captura via IA (Turbo)
                </h4>
                <p className="text-[10px] text-white/70 mb-5 leading-relaxed">
                  O robô tentará ler e preencher os dados dessa placa automaticamente.
                </p>
                
                <button
                  onClick={searchVehicleByPlate}
                  disabled={isSearchingPlate}
                  className="w-full bg-brand-accent text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[1px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-accent/20 flex items-center justify-center gap-2 mb-4 relative z-10"
                >
                  {isSearchingPlate ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                  Acionar Robô de Busca ⚡
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <div className="h-[1px] flex-1 bg-white/10"></div>
                  <span className="text-[9px] font-bold text-white/30 uppercase">Plano B (Captura Manual)</span>
                  <div className="h-[1px] flex-1 bg-white/10"></div>
                </div>

                <p className="text-[9px] text-white/50 mb-3 leading-tight italic">
                  Se o robô falhar ou der erro de cota, dê <kbd className="bg-white/10 px-1 rounded mx-0.5">Ctrl+A/Selecionar Tudo</kbd> e <kbd className="bg-white/10 px-1 rounded mx-0.5">Ctrl+C/Copiar</kbd> no site e use o botão abaixo:
                </p>

                <button
                  onClick={handleCaptureFromClipboard}
                  disabled={isProcessingAssisted}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 mb-4"
                >
                  {isProcessingAssisted ? <RefreshCw className="animate-spin" size={12} /> : <ClipboardCheck size={12} />}
                  Sincronizar Clipboard (Plano B)
                </button>

                <textarea 
                  ref={pasteTextAreaRef}
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-[11px] font-mono text-white placeholder:text-white/20 focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all resize-none shadow-inner"
                  placeholder="Ou cole o texto aqui..."
                  value={rawPastedData}
                  onChange={(e) => setRawPastedData(e.target.value)}
                />
              </div>

              <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex-1 flex flex-col items-center justify-center text-center group hover:border-brand-primary/20 transition-colors">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                  <Activity size={24} className="text-brand-primary" />
                </div>
                <h5 className="text-xs font-bold text-gray-700 uppercase tracking-tight">Status do Processamento</h5>
                <p className="text-[10px] text-gray-400 mt-2 max-w-[180px] leading-relaxed italic">
                  Os dados extraídos serão preenchidos automaticamente na ficha do veículo assim que detectados.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>

        {/* Imagem do Veículo */}
        <div className="flex flex-col items-center mb-6">
          <div onClick={() => vehicleImageInputRef.current?.click()} className="relative group cursor-pointer">
            <VehicleImage 
              src={newVehicle.imageUrl} 
              alt="Veículo" 
              className="aspect-video w-full max-w-[340px] rounded-2xl shadow-xl object-cover" 
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
              <Upload size={28} />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* === BUSCA POR PLACA === */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Placa</label>
            <div className="flex gap-2 sm:gap-3 relative">
              <input
                type="text"
                placeholder="ABC1D23"
                maxLength={7}
                className={`w-32 sm:flex-1 bg-gray-50 border-0 rounded-2xl p-3 sm:p-4 font-mono uppercase tracking-[2px] sm:tracking-[3px] text-lg sm:text-xl font-bold focus:ring-2 focus:ring-brand-accent transition-all ${isSearchingPlate ? 'ring-2 ring-brand-accent shadow-[0_0_20px_rgba(225,29,72,0.4)] animate-pulse' : ''}`}
                value={newVehicle.plate || ''}
                onChange={(e) => setNewVehicle(prev => ({
                  ...prev,
                  plate: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                }))}
              />
              <button
                onClick={searchVehicleByPlate}
                disabled={isSearchingPlate || !newVehicle.plate || newVehicle.plate.length !== 7}
                className="flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-primary/20 text-sm sm:text-base overflow-hidden relative"
                title="Busca Inteligente via IA e Bases Públicas"
              >
                {isSearchingPlate && (
                  <motion.div 
                    className="absolute inset-0 bg-brand-accent/20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  />
                )}
                {isSearchingPlate ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                <span className="truncate z-10">Identificar</span>
              </button>
            </div>

            <AnimatePresence>
              {plateSearchStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 text-[11px] font-bold text-brand-accent uppercase tracking-tighter flex items-center gap-1.5 ml-1 bg-brand-accent/5 py-1.5 px-3 rounded-full border border-brand-accent/10"
                >
                  <Activity size={12} className="animate-pulse" />
                  {plateSearchStatus}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex flex-wrap items-center gap-2 mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter w-full mb-1">Links de Consulta:</span>
              {(data.settings?.searchLinks || DEFAULT_SEARCH_LINKS).map(link => (
                <a 
                  key={link.id}
                  href={link.url.includes('{placa}') ? link.url.replace('{placa}', newVehicle.plate || '') : link.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className={`text-[10px] bg-white hover:bg-opacity-10 text-gray-600 px-2.5 py-1.5 rounded-lg font-bold transition-all border border-gray-200 shadow-sm`}
                  style={{ color: link.color !== 'brand' ? link.color : 'inherit' }}
                >
                  {link.name}
                </a>
              ))}
              <button 
                onClick={captureFromDetetive}
                className="text-[10px] bg-brand-accent/10 text-brand-accent px-2.5 py-1.5 rounded-lg font-black hover:bg-brand-accent/20 transition-all border border-brand-accent/10 flex items-center gap-1 shadow-sm"
                title="Tenta capturar dados se o site Detetive estiver aberto"
              >
                <Globe size={12} /> Robot Extrator
              </button>
            </div>

            <div className={`mt-4 p-4 rounded-2xl border transition-all ${isSearchingPlate && plateSearchStatus.includes('Cota') ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-200' : 'bg-brand-primary/5 border-brand-primary/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 ${isSearchingPlate && plateSearchStatus.includes('Cota') ? 'text-orange-600' : 'text-brand-primary'}`}>
                  <Clipboard size={12} /> Busca Assistida (Plano B)
                </span>
                <button
                  onClick={() => {
                    const firstUrl = searchPortals[0].url.replace('{placa}', newVehicle.plate || '');
                    setInternalBrowserUrl(firstUrl);
                    setShowInternalBrowser(true);
                  }}
                  className="bg-brand-primary text-white px-2 py-1 rounded-lg text-[9px] font-black hover:brightness-110 transition-all flex items-center gap-1 shadow-sm uppercase tracking-tighter"
                >
                  <Layout size={10} /> Navegador Integrado
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                Se o robô der erro de limite (429), use o <strong>Navegador Integrado</strong> acima ou cole o texto do site aqui:
              </p>
              <textarea 
                className="w-full h-20 bg-white border border-gray-200 rounded-xl p-3 text-[11px] font-mono focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all resize-none shadow-inner"
                placeholder="Cole o texto do site aqui..."
                value={rawPastedData}
                onChange={(e) => setRawPastedData(e.target.value)}
              />
              {rawPastedData && (
                <motion.button 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleAssistedProcess()}
                  disabled={isProcessingAssisted}
                  className="w-full mt-2 py-2.5 bg-brand-primary text-white text-xs font-black rounded-xl hover:bg-brand-accent transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-primary/20"
                >
                  {isProcessingAssisted ? <RefreshCw className="animate-spin" size={14} /> : <Wand2 size={14} />}
                  PROCESSAR TEXTO COM IA
                </motion.button>
              )}
            </div>
          </div>

          {/* Marca e Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Marca</label>
              <input 
                type="text" 
                placeholder="Ex: Honda"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-bold"
                value={newVehicle.name}
                onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Modelo</label>
              <input 
                type="text" 
                placeholder="Ex: Fit LX 1.4"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-bold"
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Ano</label>
              <input 
                type="text" 
                placeholder="Ex: 2004"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-bold"
                value={newVehicle.year}
                onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
              />
            </div>
            <div className="col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Cor</label>
              <input 
                type="text" 
                placeholder="Ex: Prata"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent"
                value={newVehicle.color || ''}
                onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
              />
            </div>
            <div className="col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Quilometragem</label>
              <input 
                type="number" 
                placeholder="0"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-mono font-bold"
                value={newVehicle.mileage}
                onChange={(e) => setNewVehicle({...newVehicle, mileage: e.target.value === '' ? 0 : Number(e.target.value)})}
              />
            </div>
          </div>

          {/* Botão de Foto Oficial */}
          <button 
            onClick={searchImage}
            disabled={isSearchingImage || !newVehicle.name || !newVehicle.model}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isSearchingImage ? <Settings className="animate-spin" /> : <Camera size={20} />}
            Buscar Foto Oficial da Época
          </button>
        </div>

        <div className="flex gap-3 pt-8 border-t border-gray-100 mt-6">
          <button 
            onClick={() => {
              setIsAddingVehicle(false);
              setIsEditingVehicle(false);
            }}
            className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={isEditingVehicle ? updateVehicle : addVehicle}
            className="flex-1 py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-accent transition-all shadow-lg"
          >
            {isEditingVehicle ? 'Salvar Alterações' : 'Adicionar Veículo'}
          </button>
        </div>
      </>
    )}
  </motion.div>
</div>
  )}
</AnimatePresence>


      {/* MODAL: Add Service */}
      <AnimatePresence>
        {isAddingService && selectedVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingService(false)} className="absolute inset-0 bg-brand-primary/40 backdrop-blur-md"></motion.div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 italic uppercase tracking-tighter">Registrar Manutenção</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Descrição do Serviço</label>
                  <input type="text" placeholder="Ex: Troca de Óleo e Filtros" className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Km Atual</label>
                    <input type="number" className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono" value={newService.mileage} onChange={e => setNewService({...newService, mileage: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Data</label>
                    <input type="date" className="w-full bg-gray-50 border-0 rounded-xl p-4" value={newService.date} onChange={e => setNewService({...newService, date: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Oficina / Estabelecimento*</label>
                  <input type="text" placeholder="Ex: Oficina do Zé" className="w-full bg-gray-50 border-0 rounded-xl p-4" value={newService.workshopName} onChange={e => setNewService({...newService, workshopName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Endereço da Oficina</label>
                  <input type="text" placeholder="Rua, Número, Bairro, Cidade" className="w-full bg-gray-50 border-0 rounded-xl p-4 text-sm" value={newService.workshopAddress} onChange={e => setNewService({...newService, workshopAddress: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Telefone</label>
                    <input type="text" placeholder="(11) 99999-9999" className="w-full bg-gray-50 border-0 rounded-xl p-4 text-sm" value={newService.workshopPhone} onChange={e => setNewService({...newService, workshopPhone: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Mecânico</label>
                    <input type="text" placeholder="Nome do Técnico" className="w-full bg-gray-50 border-0 rounded-xl p-4 text-sm" value={newService.mechanicName} onChange={e => setNewService({...newService, mechanicName: e.target.value})} />
                  </div>
                </div>

                {/* Parts Breakdown UI */}
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-gray-400 uppercase">Detalhamento de Peças e Itens</label>
                    {selectedVehicle.parts && selectedVehicle.parts.length > 0 && (
                      <div className="flex gap-1 overflow-x-auto max-w-[200px] scrollbar-hide">
                        {selectedVehicle.parts.slice(0, 3).map(p => (
                          <button 
                            key={p.id}
                            onClick={() => {
                              setNewServicePart({ name: p.name, quantity: '1', unitPrice: p.estimatedPrice ? String(p.estimatedPrice) : '', observation: '' });
                            }}
                            className="text-[9px] bg-white border border-gray-200 px-2 py-1 rounded-full whitespace-nowrap hover:border-brand-primary transition-colors font-bold text-gray-500"
                          >
                            + {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    {newService.partsList.map((p, idx) => (
                      <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-50">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-gray-700">{p.name}</span>
                           <span className="text-[10px] text-gray-400 font-mono">Qtd: {p.quantity} • Unit: R$ {p.unitPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-black text-brand-primary">R$ {(p.quantity * p.unitPrice).toLocaleString()}</span>
                          <button onClick={() => setNewService(s => ({...s, partsList: s.partsList.filter((_, i) => i !== idx)}))} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2">
                      <input 
                        type="text" 
                        placeholder="Nome da Peça / Item" 
                        className="col-span-3 bg-white border-gray-100 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-accent" 
                        value={newServicePart.name} 
                        onChange={e => setNewServicePart({...newServicePart, name: e.target.value})} 
                      />
                      <input 
                        type="number" 
                        placeholder="Qtd" 
                        className="bg-white border-gray-100 rounded-lg p-2 text-xs font-mono" 
                        value={newServicePart.quantity} 
                        onChange={e => setNewServicePart({...newServicePart, quantity: e.target.value})} 
                      />
                      <div className="flex gap-1">
                        <button 
                           onClick={() => {
                              if(!newServicePart.name || !newServicePart.unitPrice) return;
                              const part: ServicePart = {
                                id: crypto.randomUUID(),
                                name: newServicePart.name,
                                quantity: Number(newServicePart.quantity) || 1,
                                unitPrice: Number(newServicePart.unitPrice) || 0,
                                observation: newServicePart.observation
                              };
                              setNewService(s => ({...s, partsList: [...s.partsList, part]}));
                              setNewServicePart({ name: '', quantity: '1', unitPrice: '', observation: '' });
                           }}
                           className="bg-brand-primary text-white rounded-lg flex items-center justify-center hover:bg-brand-accent transition-colors flex-1"
                           title="Adicionar ao Serviço"
                        >
                          <Plus size={16} />
                        </button>
                        <button 
                           onClick={async () => {
                              if(!newServicePart.name) return;
                              // Abre interface de pesquisa para salvar no catálogo
                              setIsAddingPart(true);
                              setNewPartName(newServicePart.name);
                              // Adiciona também ao serviço atual simultaneamente
                              const part: ServicePart = {
                                id: crypto.randomUUID(),
                                name: newServicePart.name,
                                quantity: Number(newServicePart.quantity) || 1,
                                unitPrice: Number(newServicePart.unitPrice) || 0,
                                observation: newServicePart.observation
                              };
                              setNewService(s => ({...s, partsList: [...s.partsList, part]}));
                           }}
                           className="bg-brand-accent text-white rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors flex-1"
                           title="Salvar no Catálogo Master"
                        >
                          <Book size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Preço Unitário (R$)" 
                        className="flex-1 bg-white border-gray-100 rounded-lg p-2 text-xs font-mono" 
                        value={newServicePart.unitPrice} 
                        onChange={e => setNewServicePart({...newServicePart, unitPrice: e.target.value})} 
                      />
                      {newServicePart.name && (
                        <button 
                          onClick={async () => {
                            if(!newServicePart.name) return;
                            try {
                              const res = await geminiService.researchPart(newServicePart.name, `${selectedVehicle?.name} ${selectedVehicle?.model}`);
                              if(res.part?.estimatedPrice) {
                                setNewServicePart(prev => ({...prev, unitPrice: String(res.part?.estimatedPrice)}));
                              } else {
                                alert("IA não encontrou preço médio. Digite manualmente.");
                              }
                            } catch(e) {
                              alert("Erro na pesquisa de preço.");
                            }
                          }}
                          className="bg-blue-50 text-blue-500 text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <Sparkles size={10} /> Sugerir Preço
                        </button>
                      )}
                    </div>
                    <textarea 
                      placeholder="Observações técnicas ou adaptações para este item..." 
                      className="w-full bg-white border-gray-100 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-accent min-h-[40px] resize-none" 
                      value={newServicePart.observation} 
                      onChange={e => setNewServicePart({...newServicePart, observation: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Mão de Obra (R$)</label>
                    <input type="number" className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono text-brand-primary font-bold" value={newService.laborCost} onChange={e => setNewService({...newService, laborCost: e.target.value})} />
                  </div>
                  <div className="bg-brand-primary/5 p-4 rounded-xl flex flex-col justify-center border border-brand-primary/10">
                    <label className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">Total Estimado</label>
                    <p className="text-lg font-mono font-black text-brand-primary">
                      R$ {(
                        (newService.partsList.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0)) + 
                        (Number(newService.laborCost) || 0)
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsAddingService(false)} className="flex-1 py-4 font-bold text-gray-400">Cancelar</button>
                <button onClick={addService} className="flex-2 py-4 bg-brand-primary text-white rounded font-bold shadow-lg">Registrar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Add Fuel */}
      <AnimatePresence>
        {isAddingFuel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingFuel(false)} className="absolute inset-0 bg-brand-primary/40 backdrop-blur-md"></motion.div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 italic uppercase tracking-tighter">Novo Abastecimento</h2>
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Km Atual</label>
                    <input type="number" className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono" value={newFuel.mileage} onChange={e => setNewFuel({...newFuel, mileage: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Data</label>
                    <input type="date" className="w-full bg-gray-50 border-0 rounded-xl p-4" value={newFuel.date} onChange={e => setNewFuel({...newFuel, date: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Litros</label>
                    <input type="number" className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono" placeholder="0.00" value={newFuel.liters} onChange={e => setNewFuel({...newFuel, liters: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Total Pago (R$)</label>
                    <input type="number" className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono text-brand-accent font-bold" value={newFuel.cost} onChange={e => setNewFuel({...newFuel, cost: e.target.value})} />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl">
                  <input type="checkbox" checked={newFuel.fullTank} onChange={e => setNewFuel({...newFuel, fullTank: e.target.checked})} className="w-5 h-5 accent-brand-primary" />
                  <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">Encheu o Tanque?</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsAddingFuel(false)} className="flex-1 py-4 font-bold text-gray-400">Cancelar</button>
                <button onClick={addFuel} className="flex-2 py-4 bg-brand-primary text-white rounded font-bold shadow-lg">Confirmar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Add Reminder */}
      <AnimatePresence>
        {isAddingReminder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingReminder(false)} className="absolute inset-0 bg-brand-primary/40 backdrop-blur-md"></motion.div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 italic uppercase tracking-tighter">Novo Lembrete</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Título do Lembrete</label>
                  <input type="text" placeholder="Ex: Substituição das Pastilhas" className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent" value={newReminder.title} onChange={e => setNewReminder({...newReminder, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Km Alvo (Opcional)</label>
                    <input type="number" className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono" value={newReminder.targetMileage} onChange={e => setNewReminder({...newReminder, targetMileage: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Data Alvo (Opcional)</label>
                    <input type="date" className="w-full bg-gray-50 border-0 rounded-xl p-4" value={newReminder.targetDate} onChange={e => setNewReminder({...newReminder, targetDate: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tipo de Manutenção</label>
                  <select className="w-full bg-gray-50 border-0 rounded-xl p-4" value={newReminder.type} onChange={e => setNewReminder({...newReminder, type: e.target.value as any})}>
                    <option value="oil">Troca de Óleo</option>
                    <option value="filter">Filtros</option>
                    <option value="tire">Pneus / Alinhamento</option>
                    <option value="brake">Freios</option>
                    <option value="other">Outros</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsAddingReminder(false)} className="flex-1 py-4 font-bold text-gray-400">Cancelar</button>
                <button onClick={addReminder} className="flex-2 py-4 bg-brand-primary text-white rounded font-bold shadow-lg">Criar Alerta</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Add Part with AI Research */}
      <AnimatePresence>
        {isAddingPart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isResearching && setIsAddingPart(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {isResearching && (
                <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="mb-6 text-brand-accent"
                  >
                    <Settings size={64} />
                  </motion.div>
                  <h3 className="text-2xl font-black mb-2">IA Pesquisando Peça...</h3>
                  <p className="text-gray-500 max-w-xs">Buscando códigos oficiais e especificações técnicas para seu veículo.</p>
                </div>
              )}

              <div className="flex items-center gap-3 mb-8">
                <div className="bg-brand-accent/10 p-2 rounded-lg text-brand-accent">
                  <Database size={24} />
                </div>
                <h2 className="text-2xl font-bold">Adicionar Peça</h2>
              </div>
              
              <div className="space-y-6 mb-8">
                {aiSuggestions.length > 0 ? (
                  <div>
                    <p className="text-sm font-bold text-brand-accent mb-4">Múltiplas opções encontradas. Qual você deseja catalogar?</p>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                       {aiSuggestions.map((suggestion) => (
                         <button
                           key={suggestion}
                           onClick={() => addPart(suggestion)}
                           className="text-left bg-gray-50 hover:bg-brand-accent hover:text-white p-4 rounded-xl border border-gray-100 transition-all font-bold text-sm"
                         >
                            {suggestion}
                         </button>
                       ))}
                    </div>
                    <button 
                      onClick={() => setAiSuggestions([])}
                      className="text-xs text-gray-400 mt-4 underline"
                    >
                      Voltar para busca manual
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Informe o nome da peça. A nossa Inteligência Artificial irá preencher os detalhes técnicos, vida útil e códigos oficiais de fábrica.
                    </p>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1 ml-1">
                        <label className="text-xs font-bold text-gray-400 uppercase">Nome ou Descrição</label>
                        <button 
                          onClick={() => setIsDictionaryOpen(true)}
                          className="text-[10px] font-bold text-brand-accent flex items-center gap-1 hover:underline underline-offset-2"
                          type="button"
                        >
                          <Book size={10} /> Sugestão de Peças
                        </button>
                      </div>
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="Ex: Correia Dentada"
                        className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-lg font-medium"
                        value={newPartName}
                        onChange={(e) => setNewPartName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addPart()}
                      />
                    </div>
                  </>
                )}
              </div>

              {aiSuggestions.length === 0 && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setIsAddingPart(false);
                      setAiSuggestions([]);
                    }}
                    className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
                    disabled={isResearching}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => addPart()}
                    disabled={!newPartName || isResearching}
                    className="flex-2 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-accent disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Search size={18} /> Pesquisar com IA
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL: Maintenance Simulation */}
      <AnimatePresence>
        {isSimulating && selectedVehicle && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSimulating(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded p-8 w-full max-w-2xl shadow-2xl h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-3">
                   <div className="bg-brand-accent p-2 rounded-xl text-white block">
                     <Activity size={24} />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black">Simulador de Manutenção</h2>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Plano Preventivo por Quilometragem</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsSimulating(false)}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-gray-50 p-6 rounded mb-8 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Simular Revisão para:</label>
                    <div className="relative">
                      <input 
                        type="number"
                        placeholder="Ex: 50000"
                        className="w-full bg-white border border-gray-200 rounded p-4 focus:ring-2 focus:ring-brand-accent transition-all text-xl font-mono font-bold"
                        value={simulationMileage}
                        onChange={(e) => setSimulationMileage(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KM</span>
                    </div>
                  </div>
                  <button 
                    onClick={runSimulation}
                    disabled={!simulationMileage || isCalculatingSimulation}
                    className="bg-brand-primary text-white px-8 py-4 rounded font-bold hover:bg-brand-accent transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 whitespace-nowrap min-w-[180px] justify-center"
                  >
                    {isCalculatingSimulation ? <Settings className="animate-spin" size={20} /> : <Play size={20} />}
                    Calcular Plano
                  </button>
                </div>
                <p className="mt-4 text-[10px] text-gray-500 font-medium">
                  * A simulação utiliza inteligência artificial baseada no catálogo técnico padrão do {selectedVehicle.name} {selectedVehicle.model}.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {isCalculatingSimulation ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-brand-accent mb-4"
                    >
                      <Database size={48} />
                    </motion.div>
                    <h4 className="font-bold text-lg mb-1">Consultando Banco de Dados Técnico...</h4>
                    <p className="text-gray-500 text-sm">Analisando histórico de revisões e vida útil de componentes.</p>
                  </div>
                ) : simulationResults.length > 0 ? (
                  <>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Recomendações da IA:</h4>
                    <div className="space-y-3">
                      {simulationResults.map((item, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx} 
                          className="bg-white border border-gray-100 p-4 rounded flex items-start gap-4 hover:border-brand-accent transition-colors"
                        >
                          <div className={`p-2 rounded-lg shrink-0 ${
                            item.urgency === 'alta' ? 'bg-red-50 text-red-500' : 
                            item.urgency === 'media' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500'
                          }`}>
                            <AlertCircle size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-bold tracking-tight">{item.partName}</h5>
                              <span className="text-sm font-mono font-black text-brand-primary">R$ {item.estimatedCost.toLocaleString()}</span>
                            </div>
                            <p className="text-xs font-bold text-brand-accent uppercase mb-1">{item.action}</p>
                            <p className="text-xs text-gray-500 leading-relaxed">{item.reason}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded">
                    <Activity size={48} className="text-gray-200 mb-4" />
                    <p className="text-gray-400 text-sm font-medium">Insira a quilometragem desejada para simular o plano de manutenção.</p>
                  </div>
                )}
              </div>

              {simulationResults.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center bg-brand-primary text-white p-6 rounded relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Estimado da Revisão</p>
                    <h3 className="text-3xl font-mono font-black">
                      R$ {simulationResults.reduce((sum, item) => sum + item.estimatedCost, 0).toLocaleString()}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                       <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Saúde Estimada Pós-Revisão:</span>
                       <span className="text-sm font-mono font-bold text-white">99%</span>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                        try {
                          await generateMaintenancePdf({
                            vehicleName: selectedVehicle.name,
                            vehicleModel: selectedVehicle.model,
                            vehicleYear: selectedVehicle.year,
                            simulationMileage: Number(simulationMileage),
                            recommendations: simulationResults,
                            totalEstimatedCost: simulationResults.reduce((sum, item) => sum + item.estimatedCost, 0),
                          });
                        } catch (error) {
                          alert('Erro ao gerar PDF. Tente novamente.');
                        }
                    }}
                    className="relative z-10 bg-brand-accent hover:bg-red-700 text-white px-6 py-3 rounded font-bold transition-all shadow-lg"
                  >
                    Exportar Plano
                  </button>
                  <Activity className="absolute right-[-10px] bottom-[-10px] opacity-10" size={120} />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL: Budget */}
      <AnimatePresence>
        {isBudgetOpen && selectedVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBudgetOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded p-8 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-accent p-2 rounded text-white">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Orçamento de Manutenção</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase">{selectedVehicle.name} {selectedVehicle.model}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBudgetOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6">
                {(selectedVehicle.parts || []).filter(p => p.isInBudget).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Calculator size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Nenhuma peça adicionada ao orçamento.</p>
                    <p className="text-xs">Clique no ícone de cifrão ($) em uma peça para estimar o preço e adicionar aqui.</p>
                  </div>
                ) : (
                  (selectedVehicle.parts || []).filter(p => p.isInBudget).map((part) => (
                    <div key={part.id} className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-100">
                      <div>
                        <p className="font-bold">{part.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{part.code}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <input 
                            type="number"
                            className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-mono font-bold text-right focus:ring-1 focus:ring-brand-accent focus:outline-none"
                            value={part.estimatedPrice || 0}
                            onChange={(e) => updatePartPrice(part.id, Number(e.target.value))}
                          />
                          <p className="text-[9px] text-gray-400 font-bold uppercase mr-1 mt-1">Preço (R$)</p>
                        </div>
                        <button 
                          onClick={() => togglePartBudget(part.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center bg-brand-primary text-white p-6 rounded shadow-xl">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Estimado</p>
                    <h3 className="text-3xl font-mono font-black tracking-tighter">
                      R$ {(selectedVehicle.parts || [])
                        .filter(p => p.isInBudget)
                        .reduce((sum, p) => sum + (p.estimatedPrice || 0), 0)
                        .toLocaleString()}
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                        alert('Recurso em desenvolvimento: Exportação de PDF/Relatório de Orçamento.');
                    }}
                    className="bg-brand-accent hover:bg-red-700 text-white px-6 py-3 rounded font-bold transition-all flex items-center gap-2"
                  >
                    <Download size={18} /> Salvar PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL: Settings */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded p-8 w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary p-2 rounded text-white">
                    <Settings size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">Configurações</h2>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2 flex items-center gap-2">
                    <TypeIcon size={14} /> Nome do Aplicativo
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Meu Carro Top"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-bold"
                    value={data.settings?.appName || ''}
                    onChange={(e) => {
                      const newData = { 
                        ...data, 
                        settings: { ...data.settings, appName: e.target.value } 
                      };
                      handleSave(newData);
                    }}
                  />
                </div>

                {/* Data Management Section */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-3 flex items-center gap-2">
                    <Database size={14} /> Gestão de Dados (Backup)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => storageService.exportData()}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:border-brand-primary/30 hover:text-brand-primary transition-all"
                    >
                      <Download size={16} /> Exportar Backup
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:border-brand-primary/30 hover:text-brand-primary transition-all"
                    >
                      <Upload size={16} /> Importar Backup
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2 flex items-center gap-2">
                    <Activity size={14} /> Ícone do App
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.entries(ICON_OPTIONS).map(([name, Icon]) => (
                      <button
                        key={name}
                        onClick={() => {
                          const newData = { 
                            ...data, 
                            settings: { ...data.settings, appIcon: name } 
                          };
                          handleSave(newData);
                        }}
                        className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${
                          (data.settings?.appIcon || 'Cpu') === name 
                            ? 'border-brand-accent bg-brand-accent/5' 
                            : 'border-transparent bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <Icon size={18} className={(data.settings?.appIcon || 'Cpu') === name ? 'text-brand-accent' : 'text-gray-400'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2 flex items-center gap-2">
                    <Palette size={14} /> Tema Visual
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((themeKey) => (
                      <button
                        key={themeKey}
                        onClick={() => {
                          const newData = { 
                            ...data, 
                            settings: { ...data.settings, theme: themeKey } 
                          };
                          handleSave(newData);
                        }}
                        className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${
                          (data.settings?.theme || 'default') === themeKey 
                            ? 'border-brand-accent ring-2 ring-brand-accent/20' 
                            : 'border-transparent hover:border-gray-200'
                        }`}
                        style={{ backgroundColor: THEMES[themeKey].bg }}
                        title={themeKey}
                      >
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: THEMES[themeKey].accent }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Chave de API Gemini</label>
                  <input 
                    type="password" 
                    placeholder="Cole sua chave aqui..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                    value={data.settings?.geminiApiKey || ''}
                    onChange={(e) => {
                      const newData = { 
                        ...data, 
                        settings: { ...data.settings, geminiApiKey: e.target.value } 
                      };
                      handleSave(newData);
                    }}
                  />
                  <div className="mt-4">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Token da API Brasil para Busca de Placa (opcional)</label>
                    <input
                      type="password"
                      placeholder="Cole sua chave da API Brasil..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                      value={data.settings?.plateApiKey || ''}
                      onChange={(e) => {
                        const newData = {
                          ...data,
                          settings: { ...data.settings, plateApiKey: e.target.value }
                        };
                        handleSave(newData);
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Device Token da API Brasil (opcional)</label>
                    <input
                      type="password"
                      placeholder="Cole seu Device Token da API Brasil..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                      value={data.settings?.apiBrasilDeviceToken || ''}
                      onChange={(e) => {
                        const newData = {
                          ...data,
                          settings: { ...data.settings, apiBrasilDeviceToken: e.target.value }
                        };
                        handleSave(newData);
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">URL do backend de placa (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: http://localhost:3000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                      value={data.settings?.plateApiHost || ''}
                      onChange={(e) => {
                        const newData = {
                          ...data,
                          settings: { ...data.settings, plateApiHost: e.target.value }
                        };
                        handleSave(newData);
                      }}
                    />
                    <p className="text-[10px] text-gray-400 mt-2">
                      <strong>Recomendado:</strong> Configure um backend próprio que chame a API SINESP (ex: consultaplaca-api). A chamada direta ao SINESP pode falhar por limitações de CORS. Se configurar o backend local, o app tentará usá-lo primeiro, depois SINESP direto como fallback, e por fim o Gemini.
                    </p>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <p className="text-xs font-bold text-blue-900 mb-2">ℹ️ DICA: Configurar Backend Local SINESP</p>
                    <p className="text-[10px] text-blue-800 leading-relaxed mb-2">
                      Para que a busca por placa funcione de forma confiável, crie um backend Node.js/Express que:
                    </p>
                    <ul className="text-[10px] text-blue-800 leading-relaxed list-disc list-inside space-y-1">
                      <li>Receba POST em <code className="bg-white px-1 rounded text-blue-600">/consultar-placa</code> com JSON: <code className="bg-white px-1 rounded text-blue-600">{'{placa: "ABC1234"}'}</code></li>
                      <li>Chame a API SINESP no servidor (sem CORS)</li>
                      <li>Retorne: <code className="bg-white px-1 rounded text-blue-600">{'{marca: "Toyota", modelo: "Corolla", ano: "2020"}'}</code></li>
                    </ul>
                    <p className="text-[10px] text-blue-700 mt-2">Referência: <span className="font-mono">github.com/giovannijoao/consultaplaca-api</span></p>
                  </div>

                  <div className="mt-4 p-4 bg-brand-accent/5 rounded-2xl border border-brand-accent/10">
                    <p className="text-xs text-brand-primary leading-relaxed">
                      Para que as funcionalidades de IA funcionem de forma independente (como em um APK), você precisa de uma chave própria.
                    </p>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brand-accent text-xs font-bold mt-2 inline-flex items-center gap-1 hover:underline underline-offset-2"
                    >
                      Criar minha Chave Grátis no Google AI Studio <ChevronRight size={12} />
                    </a>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block flex items-center gap-2">
                       <Link size={14} /> Links de Consulta Personalizados
                    </label>
                    <button 
                      onClick={() => {
                        const name = prompt('Nome do Site:');
                        const url = prompt('URL do Site (use {placa} para substituir pela placa):', 'https://');
                        if (name && url) {
                          const newLink: VehicleSearchLink = {
                            id: crypto.randomUUID(),
                            name,
                            url,
                            color: 'brand'
                          };
                          const updatedLinks = [...(data.settings?.searchLinks || DEFAULT_SEARCH_LINKS), newLink];
                          handleSave({
                            ...data,
                            settings: { ...data.settings, searchLinks: updatedLinks }
                          });
                        }
                      }}
                      className="text-[10px] font-bold text-brand-primary hover:underline"
                    >
                      + ADICIONAR SITE
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(data.settings?.searchLinks || DEFAULT_SEARCH_LINKS).map((link, idx) => (
                      <div key={link.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between group">
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{link.name}</p>
                          <p className="text-[9px] text-gray-400 truncate max-w-[180px]">{link.url}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const newLinks = (data.settings?.searchLinks || DEFAULT_SEARCH_LINKS).filter(l => l.id !== link.id);
                              handleSave({
                                ...data,
                                settings: { ...data.settings, searchLinks: newLinks }
                              });
                            }}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                            title="Remover"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-4">Privacidade</p>
                  <p className="text-xs text-gray-500">
                    Sua chave é salva apenas localmente no seu dispositivo e nunca é enviada para nossos servidores.
                  </p>
                </div>
              </div>
              
              <div className="pt-6 shrink-0">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-4 bg-brand-primary text-white font-bold rounded hover:bg-brand-accent transition-all shadow-lg"
                >
                  Salvar e Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL: Dictionary */}
      <AnimatePresence>
        {isDictionaryOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDictionaryOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded p-8 w-full max-w-4xl shadow-2xl h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-3">
                   <div className="bg-brand-accent p-2 rounded-xl text-white block">
                     <Book size={24} />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black">Dicionário Técnico</h2>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Catálogo de Componentes Comuns</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsDictionaryOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
                {AUTO_DICTIONARY.map((category) => (
                  <div key={category.name}>
                    <h3 className="text-sm font-black text-brand-accent uppercase tracking-tighter mb-4 flex items-center gap-2">
                       <span className="w-8 h-[2px] bg-brand-accent/20"></span>
                       {category.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {category.parts.map((part) => (
                           <button
                             key={part}
                             onClick={() => {
                               setNewPartName(part);
                               setIsDictionaryOpen(false);
                             }}
                             className="text-left bg-gray-50 hover:bg-brand-accent hover:text-white border border-gray-100 rounded-xl p-4 transition-all group"
                           >
                              <p className="text-sm font-bold tracking-tight">{part}</p>
                              <p className="text-[10px] opacity-60 font-mono mt-1 group-hover:opacity-100">Selecionar Peça</p>
                           </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center shrink-0">
                 <p className="text-gray-400 text-xs italic">
                  Este dicionário contém os componentes mais comuns. Você também pode digitar manualmente qualquer outra peça na tela anterior.
                 </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Professional Service Report Modal */}
      <AnimatePresence>
        {selectedServiceForReport && selectedVehicle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary text-white p-2 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <h2 className="text-xl font-black text-brand-primary tracking-tight">Relatório Técnico de Manutenção</h2>
                </div>
                <button onClick={() => setSelectedServiceForReport(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors font-bold">
                  FECHAR
                </button>
              </div>

              {/* Report Content (Printable Layout) */}
              <div className="flex-1 p-8 bg-white" id="service-report-content">
                {/* Workshop Header */}
                <div className="flex justify-between items-start border-b-4 border-brand-primary pb-6 mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-brand-primary uppercase tracking-tighter mb-1 leading-none">{selectedServiceForReport.workshopName}</h3>
                    <p className="text-sm text-gray-500 font-bold mt-2">{selectedServiceForReport.workshopAddress || 'Endereço não informado'}</p>
                    <p className="text-sm text-gray-500 font-bold">Fone: {selectedServiceForReport.workshopPhone || 'Não informado'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cód. Registro</p>
                    <p className="text-sm font-mono font-bold bg-gray-100 p-1 px-3 rounded text-brand-primary">#{selectedServiceForReport.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[9px] text-gray-300 mt-2 font-bold uppercase tracking-widest leading-none">Original Digital</p>
                  </div>
                </div>

                {/* Vehicle & Customer Info */}
                <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                  <div>
                    <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 border-l-2 border-brand-accent pl-2">Dados do Veículo</h4>
                    <p className="text-xl font-black text-gray-800">{selectedVehicle.name}</p>
                    <p className="text-sm text-gray-500 font-bold">{selectedVehicle.model} — {selectedVehicle.year}</p>
                    <p className="text-xs font-mono font-bold mt-2 bg-gray-100 inline-block px-3 py-1 rounded text-gray-600">PLACA: {selectedVehicle.plate?.toUpperCase() || 'NÃO INF'}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 border-l-2 border-brand-accent pl-2">Informações da OS</h4>
                    <p className="text-sm font-bold text-gray-600 mb-1">Execução: <span className="font-black text-brand-primary">{new Date(selectedServiceForReport.date).toLocaleDateString('pt-BR')}</span></p>
                    <p className="text-sm font-bold text-gray-600 mb-1">Quilometragem: <span className="font-mono font-black">{selectedServiceForReport.mileage.toLocaleString()} KM</span></p>
                    <p className="text-sm font-bold text-gray-600">Técnico: <span className="italic font-black opacity-70">{selectedServiceForReport.mechanicName || 'Equipe Técnica'}</span></p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Descrição dos Serviços</h4>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed min-h-[80px]">
                    {selectedServiceForReport.description}
                  </div>
                </div>

                {/* Parts Table */}
                {selectedServiceForReport.partsList && selectedServiceForReport.partsList.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3">Peças e Insumos</h4>
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase">Item</th>
                            <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase text-center">Qtd</th>
                            <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase text-right">Unitário</th>
                            <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedServiceForReport.partsList.map(item => (
                            <tr key={item.id} className="border-t border-gray-50">
                              <td className="py-4 px-4">
                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                {item.observation && (
                                  <p className="text-[10px] text-brand-accent italic font-bold mt-1 max-w-[250px]">
                                    Nota: {item.observation}
                                  </p>
                                )}
                              </td>
                              <td className="py-4 px-4 text-sm font-mono text-center">{item.quantity}</td>
                              <td className="py-4 px-4 text-sm font-mono text-right">R$ {item.unitPrice.toLocaleString()}</td>
                              <td className="py-4 px-4 text-sm font-mono font-black text-right text-brand-primary">R$ {(item.quantity * item.unitPrice).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Totals Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {selectedServiceForReport.notes && (
                      <div className="p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                        <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mb-1">Notas da Oficina</p>
                        <p className="text-xs text-yellow-800 italic leading-snug">{selectedServiceForReport.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <div className="flex-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Mão de Obra</p>
                          <p className="text-sm font-mono font-black text-gray-700">R$ {selectedServiceForReport.laborCost.toLocaleString()}</p>
                       </div>
                       <div className="flex-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Peças</p>
                          <p className="text-sm font-mono font-black text-gray-700">R$ {(selectedServiceForReport.cost - selectedServiceForReport.laborCost).toLocaleString()}</p>
                       </div>
                    </div>
                  </div>
                  <div className="bg-brand-primary text-white p-6 rounded-3xl flex flex-col justify-center items-center md:items-end shadow-xl shadow-brand-primary/20">
                    <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-2">Total Geral do Serviço</p>
                    <p className="text-4xl font-mono font-black tracking-tighter">R$ {selectedServiceForReport.cost.toLocaleString()}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 grayscale">
                  <div className="flex items-center gap-3">
                    <Activity size={24} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tighter">Powered by AutoTech</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest">Gestão Inteligente de Veículos</p>
                    </div>
                  </div>
                  <p className="text-[9px] font-mono font-bold italic">
                    Assinado em: {new Date(selectedServiceForReport.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-accent transition-all shadow-lg"
                >
                  <Download size={20} /> Baixar PDF / Imprimir
                </button>
                <button 
                  onClick={() => {
                    const text = `RELATÓRIO DE MANUTENÇÃO\nOficina: ${selectedServiceForReport.workshopName}\nVeículo: ${selectedVehicle.name}\nValor Total: R$ ${selectedServiceForReport.cost.toLocaleString()}`;
                    navigator.clipboard.writeText(text);
                    alert('Resumo copiado!');
                  }}
                  className="bg-white border border-gray-200 text-gray-600 px-6 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                >
                  Compartilhar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Web Vehicle Search */}
      <AnimatePresence>
        {isWebSearchOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (webSearchMode === 'manual') setIsWebSearchOpen(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-2xl font-black text-brand-primary tracking-tight">🔍 Consultar Placa em Sites Públicos</h2>
                <button
                  onClick={() => setIsWebSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {webSearchMode === 'manual' ? (
                <div className="flex-1 flex flex-col">
                  <div className="p-6 bg-blue-50 border-b border-blue-100 space-y-3">
                    <p className="text-sm text-blue-900 mb-3">
                      Escolha uma opção para buscar dados da placa <strong>{newVehicle.plate}</strong>:
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={captureFromDetetive}
                        disabled={isCapturingFromWeb}
                        className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isCapturingFromWeb ? (
                          <Settings className="animate-spin" size={18} />
                        ) : (
                          <Globe size={18} />
                        )}
                        {isCapturingFromWeb ? 'Capturando...' : '⚡ Captura Automática'}
                      </button>
                      <a 
                        href={webVehicleSearchService.getSearchPageUrl(newVehicle.plate)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        ↗ Abrir em nova aba
                      </a>
                    </div>
                  </div>

                  <iframe 
                    src={webVehicleSearchService.getSearchPageUrl(newVehicle.plate)}
                    className="flex-1 w-full border-0"
                    title="Detetive Veicular"
                  />

                  <div className="p-6 border-t border-gray-100 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Marca</label>
                      <input
                        type="text"
                        placeholder="Ex: Toyota"
                        className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent"
                        value={newVehicle.name}
                        onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Modelo</label>
                        <input
                          type="text"
                          placeholder="Ex: Corolla XEi"
                          className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent"
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Ano</label>
                        <input
                          type="text"
                          placeholder="Ex: 2020/2021"
                          className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent"
                          value={newVehicle.year}
                          onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setIsWebSearchOpen(false)}
                      className="w-full py-4 bg-brand-accent text-white font-bold rounded-xl hover:brightness-110 transition-all text-lg"
                    >
                      ✓ Fechar e continuar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Settings className="animate-spin mx-auto text-brand-accent" size={48} />
                    <p className="text-gray-600">Buscando dados públicos...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        className="hidden" 
        accept=".json,application/json"
      />
      
      {/* Hidden Global Inputs */}
      <input type="file" ref={vehicleImageInputRef} onChange={handleVehicleImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={brandLogoInputRef} onChange={handleBrandLogoUpload} accept="image/*" className="hidden" />
      <input type="file" ref={importVehicleInputRef} onChange={handleImportVehicle} accept=".json,application/json" className="hidden" />
      </motion.div>
    );
  }
