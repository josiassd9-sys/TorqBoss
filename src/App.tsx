import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Settings, Box, Disc, Book, Bell, Wrench, Gauge,
  Cpu, ShieldCheck, Activity
} from 'lucide-react';

// Refatoração - Tabs
import { TiresTab } from './components/tabs/TiresTab';
import { ServicesTab } from './components/tabs/ServicesTab';
import { FuelTab } from './components/tabs/FuelTab';
import { PartsTab } from './components/tabs/PartsTab';
import { RemindersTab } from './components/tabs/RemindersTab';
import { IntelligenceTab } from './components/tabs/IntelligenceTab';
import { ManualTab } from './components/tabs/ManualTab';
import { AuditTab } from './components/tabs/AuditTab';

// Componentes Extraídos
import { HeaderLogo } from './components/HeaderLogo';
import { SettingsModal } from './components/SettingsModal';
import { VehicleFormModal } from './components/VehicleFormModal';
import { AddServiceModal } from './components/AddServiceModal';
import { AddFuelModal } from './components/AddFuelModal';
import { AddReminderModal } from './components/AddReminderModal';
import { AddPartModal } from './components/AddPartModal';
import { MaintenanceSimulationModal } from './components/MaintenanceSimulationModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { BudgetModal } from './components/BudgetModal';
import { VehicleDetailHeader } from './components/VehicleDetailHeader';
import { DashboardHome } from './components/DashboardHome';
import { DictionaryModal } from './components/DictionaryModal';
import { ServiceReportModal } from './components/ServiceReportModal';
import { OnboardingModal } from './components/OnboardingModal';
import {
  CarFerrariTop,
  CarMuscleTop,
  CarSilhouette,
  SteeringWheelCustom
} from './components/CustomIcons';

// Hooks
import {
  useAppData,
  useVehiclePredictions,
  useVehicleManual,
  useVehicleActions,
  useVehicleItems,
  useRobotSearch,
  useVehicleDetails,
} from './hooks';

// Tipos e Serviços
import { Vehicle, ServiceEntry, AppData } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { fileToBase64, resizeImage } from './lib/utils';
import { getVehicleHealth, getMaintenanceScore, getFuelAnalytics as getFuelAnalyticsUtil } from './lib/vehicleUtils';
import { THEMES } from './constants';

export default function App() {
  const {
    data,
    setData,
    currentCountry,
    getCurrencySymbol,
    getDistanceUnit,
    formatDistance,
    marketRef,
    handleSave,
  } = useAppData();

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const {
    isAddingVehicle,
    setIsAddingVehicle,
    isEditingVehicle,
    setIsEditingVehicle,
    newVehicle,
    setNewVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    moveVehicleToTop,
    openEditModal,
    updateSelectedVehicle
  } = useVehicleActions(data, setData, handleSave, selectedVehicle, setSelectedVehicle);

  const {
    itemToDelete,
    setItemToDelete,
    handleDeleteItem,
    confirmDelete,
    isAddingPart,
    setIsAddingPart,
    newPartName,
    setNewPartName,
    aiSuggestions,
    setAiSuggestions,
    isResearching,
    addPart,
    deletePart,
    togglePartBudget,
    estimatePrice,
    isEstimatingPrice,
    updatePartPrice
  } = useVehicleItems(data, handleSave, selectedVehicle, updateSelectedVehicle);

  const {
    maintenancePredictions,
    isLoadingPredictions,
    fuelInsight,
    marketAnalysis,
    isAnalyzingMarket,
    tcoAnalysis,
    isAnalyzingTco,
    digitalPassport,
    isGeneratingPassport,
    diagnosisResult,
    isDiagnosing,
    isAnalyzingHealth,
    symptomQuery,
    setSymptomQuery,
    setMarketAnalysis,
    setDiagnosisResult,
    handleDiagnose,
    runHealthAnalysis,
    handleMarketAnalysis,
    handleTCOAnalysis,
    handleGeneratePassport,
    predictCurrentMileage,
  } = useVehiclePredictions(selectedVehicle, data, handleSave);

  const {
    addTireSet,
    deleteTireSet,
    updateTireSet,
    isAddingService,
    setIsAddingService,
    isAddingFuel,
    setIsAddingFuel,
    isAddingReminder,
    setIsAddingReminder,
    newService,
    setNewService,
    newFuel,
    setNewFuel,
    newReminder,
    setNewReminder,
    addService,
    addFuel,
    addReminder,
    toggleReminder
  } = useVehicleDetails(selectedVehicle, data, handleSave, setSelectedVehicle);

  const [simulationMileage, setSimulationMileage] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState('parts');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isDetectingRegion, setIsDetectingRegion] = useState(false);
  const [showInternalBrowser, setShowInternalBrowser] = useState(false);
  const [internalBrowserUrl, setInternalBrowserUrl] = useState('');
  const [searchPortals, setSearchPortals] = useState<any[]>([]);

  useEffect(() => {
    if (data.settings?.showInternalBrowser !== undefined) {
      setShowInternalBrowser(data.settings.showInternalBrowser);
    }
  }, [data.settings?.showInternalBrowser]);

  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [selectedServiceForReport, setSelectedServiceForReport] = useState<ServiceEntry | null>(null);

  const manualPDFInputRef = useRef<HTMLInputElement | null>(null);
  const importVehicleInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const vehicleImageInputRef = useRef<HTMLInputElement | null>(null);
  const brandLogoInputRef = useRef<HTMLInputElement | null>(null);
  const [newServicePart, setNewServicePart] = useState<any>({ name: '', quantity: 1, unitPrice: 0 });

  const {
    isUploadingPDF,
    isCalculatingSimulation,
    simulationResults,
    setSimulationResults,
    handleManualPDFUpload,
    runSimulation,
    isGeneratingManual,
    isChattingWithManual,
    manualChatResponse,
    manualChatQuery,
    setManualChatQuery,
    setManualChatResponse,
    generateManualInfo,
    chatWithManual
  } = useVehicleManual(selectedVehicle, data, handleSave, setSelectedVehicle);

  const onRemoveBackgroundWrapper = async () => {
    const imageUrl = isEditingVehicle ? selectedVehicle?.imageUrl : newVehicle.imageUrl;
    if (!imageUrl) return;
    const newUrl = await handleRemoveBackground(imageUrl);
    if (isEditingVehicle && selectedVehicle) {
      updateSelectedVehicle({ imageUrl: newUrl });
    } else {
      setNewVehicle(prev => ({ ...prev, imageUrl: newUrl }));
    }
  };

  const {
    isSearchingPlate,
    plateSearchStatus,
    robotLogs,
    isSearchingImage,
    isSearchingLogo,
    isRemovingBackground,
    isCapturingFromWeb,
    isProcessingAssisted,
    rawPastedData,
    setRawPastedData,
    robotLogsEndRef,
    searchImage,
    searchLogo,
    searchVehicleByPlate,
    handleAssistedProcess,
    handleCaptureFromClipboard: captureFromExternal,
    handleRemoveBackground
  } = useRobotSearch(
    currentCountry, data, newVehicle as Vehicle, setNewVehicle,
    selectedVehicle, updateSelectedVehicle, showInternalBrowser
  );

  const fuelAnalytics = useMemo(() => getFuelAnalyticsUtil(selectedVehicle), [selectedVehicle?.fuelLogs]);

  // Theme Application
  useEffect(() => {
    const theme = THEMES[(data.settings?.theme as keyof typeof THEMES) || 'default'];
    const styleId = 'theme-overrides';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `:root { --color-brand-primary: ${theme.primary}; --color-brand-accent: ${theme.accent}; --color-brand-bg: ${theme.bg}; }`;
  }, [data.settings?.theme]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData.vehicles) {
          handleSave(importedData);
          alert('Dados importados com sucesso!');
        }
      } catch (err) {
        alert('Erro ao importar arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
  };

  const handleVehicleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      const resized = await resizeImage(base64, 1200, 800);
      if (selectedVehicle) {
        updateSelectedVehicle({ imageUrl: resized });
      } else {
        setNewVehicle(prev => ({ ...prev, imageUrl: resized }));
      }
    } catch (error) {
      alert('Erro ao processar imagem.');
    }
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      const resized = await resizeImage(base64, 400, 400);
      if (selectedVehicle) {
        updateSelectedVehicle({ brandLogoUrl: resized });
      } else {
        setNewVehicle(prev => ({ ...prev, brandLogoUrl: resized }));
      }
    } catch (error) {
      alert('Erro ao processar logotipo.');
    }
  };

  const exportVehicle = (vehicle: Vehicle) => {
    const jsonStr = JSON.stringify(vehicle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vehicle.plate || 'veiculo'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportVehicle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedVehicle = JSON.parse(event.target?.result as string) as Vehicle;
        if (!importedVehicle.name || !importedVehicle.id) throw new Error('Formato inválido');
        const existingIdx = data.vehicles.findIndex(v => v.id === importedVehicle.id);
        let updatedVehicles;
        if (existingIdx >= 0) {
          if (confirm('Substituir veículo existente?')) {
            updatedVehicles = [...data.vehicles];
            updatedVehicles[existingIdx] = importedVehicle;
          } else return;
        } else {
          updatedVehicles = [...data.vehicles, importedVehicle];
        }
        handleSave({ ...data, vehicles: updatedVehicles });
        setSelectedVehicle(importedVehicle);
      } catch (err) { alert('Erro na importação.'); }
    };
    reader.readAsText(file);
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
          ...v, fipeValue: value, lastFipeUpdate: new Date().toISOString()
        } : v)
      }));
    } catch (error) {
      console.error('Erro ao atualizar FIPE:', error);
    } finally {
      setIsUpdatingFipe(false);
    }
  };

  useEffect(() => {
    if (data.vehicles.length > 0) {
      data.vehicles.forEach(v => {
        const isOld = !v.lastFipeUpdate || (new Date().getTime() - new Date(v.lastFipeUpdate).getTime() > 86400000);
        if (isOld) updateFipeValue(v.id);
      });
    }
  }, []);

  const shareTechnicalReport = () => {
    if (!selectedVehicle) return;
    const servicesText = (selectedVehicle.services || []).slice(-3).map(s => `• ${s.date}: ${s.description} (${s.mileage}km)`).join('\n');
    const predictionsText = (maintenancePredictions || []).map(p => `• ${p.item}: Previsto para ${p.estimatedDate}`).join('\n');
    const report = `*RELATÓRIO TÉCNICO - ${selectedVehicle.name} ${selectedVehicle.model}*\n🚗 Placa: ${selectedVehicle.plate || 'N/A'}\n📊 Saúde Atual: ${getVehicleHealth(selectedVehicle)}%\n📍 KM: ${selectedVehicle.mileage}\n\n*ÚLTIMOS SERVIÇOS:*\n${servicesText || 'Nenhum histórico recente.'}\n\n*PREVISÕES DE MANUTENÇÃO:*\n${predictionsText || 'Analise de saúde necessária.'}\n\n💬 *Análise IA:* ${maintenancePredictions.length > 0 ? 'Existem manutenções pendentes' : 'Veículo em bom estado'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(report)}`, '_blank');
  };

  const TABS = [
    { id: 'parts', label: 'Componentes', icon: Box },
    { id: 'services', label: 'Serviços', icon: Wrench },
    { id: 'tires', label: 'Pneus', icon: Disc },
    { id: 'fuel', label: 'Consumo', icon: Gauge },
    { id: 'intelligence', label: 'Inteligência', icon: Cpu },
    { id: 'manual', label: 'Manual', icon: Book },
    { id: 'reminders', label: 'Alertas', icon: Bell },
    { id: 'audit', label: 'Auditoria', icon: ShieldCheck },
  ];

  return (
    <>
      {isOnboarding && (
        <OnboardingModal
          data={data}
          isDetectingRegion={isDetectingRegion}
          onClose={() => {
            storageService.saveData(data);
            setIsOnboarding(false);
          }}
          getCurrencySymbol={getCurrencySymbol}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
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

          {/* Fleet View or Vehicle Detail View */}
          {!selectedVehicle ? (
            <DashboardHome
              data={data}
              onSelectVehicle={setSelectedVehicle}
              onAddVehicle={() => setIsAddingVehicle(true)}
              onImportVehicle={() => importVehicleInputRef.current?.click()}
              onDeleteVehicle={(id, e) => { e.stopPropagation(); deleteVehicle(id); }}
              onMoveVehicleToTop={moveVehicleToTop}
              formatDistance={formatDistance}
              formatCurrency={(v) => {
                const symbol = data.settings?.currency === 'USD' ? '$' : data.settings?.currency === 'EUR' ? '€' : 'R$';
                return `${symbol} ${v.toLocaleString()}`;
              }}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <VehicleDetailHeader
                selectedVehicle={selectedVehicle}
                onBack={() => setSelectedVehicle(null)}
                onExport={() => exportVehicle(selectedVehicle)}
                onOpenSettings={openEditModal}
                onShareReport={shareTechnicalReport}
                onUpdateMileage={() => updateSelectedVehicle({ mileage: predictCurrentMileage(selectedVehicle) })}
                onSearchLogo={() => searchLogo(selectedVehicle.name, true)}
                isSearchingLogo={isSearchingLogo}
                onLogoUpload={() => brandLogoInputRef.current?.click()}
                onRunHealthAnalysis={runHealthAnalysis}
                isAnalyzingHealth={isAnalyzingHealth}
                maintenancePredictions={maintenancePredictions}
                isLoadingPredictions={isLoadingPredictions}
                fuelAnalytics={fuelAnalytics}
                fuelInsight={fuelInsight}
                onMarketAnalysis={handleMarketAnalysis}
                isAnalyzingMarket={isAnalyzingMarket}
                marketAnalysis={marketAnalysis}
                setMarketAnalysis={setMarketAnalysis}
                onTcoAnalysis={handleTCOAnalysis}
                isAnalyzingTco={isAnalyzingTco}
                tcoAnalysis={tcoAnalysis}
                onGeneratePassport={handleGeneratePassport}
                isGeneratingPassport={isGeneratingPassport}
                digitalPassport={digitalPassport}
                onDiagnose={handleDiagnose}
                isDiagnosing={isDiagnosing}
                symptomQuery={symptomQuery}
                setSymptomQuery={setSymptomQuery}
                diagnosisResult={diagnosisResult}
                setDiagnosisResult={setDiagnosisResult}
                predictCurrentMileage={predictCurrentMileage}
                formatDistance={formatDistance}
                getDistanceUnit={getDistanceUnit}
                formatCurrency={(v) => {
                  const symbol = data.settings?.currency === 'USD' ? '$' : data.settings?.currency === 'EUR' ? '€' : 'R$';
                  return `${symbol} ${v.toLocaleString()}`;
                }}
                getVehicleHealth={() => getVehicleHealth(selectedVehicle)}
                getMaintenanceScore={() => getMaintenanceScore(selectedVehicle)}
                isUpdatingFipe={isUpdatingFipe}
                onUpdateFipe={() => updateFipeValue(selectedVehicle.id)}
                marketRef={marketRef}
                onAddPart={() => setIsAddingPart(true)}
                onOpenBudget={() => setIsBudgetOpen(true)}
                budgetCount={(selectedVehicle.parts || []).filter(p => p.isInBudget).length}
                onSimulate={() => {
                  setSimulationMileage(selectedVehicle.mileage + 10000);
                  setSimulationResults([]);
                  setIsSimulating(true);
                }}
              />

              {/* Tab Navigation */}
              <div className="flex overflow-x-auto gap-2 pb-1 -mx-1 scrollbar-hide">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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

              {/* Tab Content */}
              {activeTab === 'parts' && (
                <PartsTab
                  vehicle={selectedVehicle}
                  onAddPart={() => setIsAddingPart(true)}
                  onDeleteItem={deletePart}
                  onToggleBudget={togglePartBudget}
                  predictCurrentMileage={predictCurrentMileage}
                  formatCurrency={(v) => {
                    const symbol = data.settings?.currency === 'USD' ? '$' : data.settings?.currency === 'EUR' ? '€' : 'R$';
                    return `${symbol} ${v.toLocaleString()}`;
                  }}
                />
              )}
              {activeTab === 'tires' && (
                <TiresTab
                  tireSets={selectedVehicle.tireSets || []}
                  currentMileage={predictCurrentMileage(selectedVehicle)}
                  usageProfile={selectedVehicle.usageProfile || 'mixed'}
                  onAddTire={addTireSet}
                  onDeleteTire={deleteTireSet}
                  onUpdateTire={updateTireSet}
                />
              )}
              {activeTab === 'services' && (
                <ServicesTab
                  services={selectedVehicle.services || []}
                  onAddService={() => setIsAddingService(true)}
                  onDeleteItem={(id) => handleDeleteItem('service', id)}
                  formatCurrency={(v) => {
                    const symbol = data.settings?.currency === 'USD' ? '$' : data.settings?.currency === 'EUR' ? '€' : 'R$';
                    return `${symbol} ${v.toLocaleString()}`;
                  }}
                />
              )}
              {activeTab === 'fuel' && (
                <FuelTab
                  fuelLogs={selectedVehicle.fuelLogs || []}
                  onAddFuel={() => setIsAddingFuel(true)}
                  onDeleteItem={(id) => handleDeleteItem('fuel', id)}
                  formatCurrency={(v) => {
                    const symbol = data.settings?.currency === 'USD' ? '$' : data.settings?.currency === 'EUR' ? '€' : 'R$';
                    return `${symbol} ${v.toLocaleString()}`;
                  }}
                />
              )}
              {activeTab === 'reminders' && (
                <RemindersTab
                  reminders={selectedVehicle.reminders || []}
                  onAddReminder={() => setIsAddingReminder(true)}
                  onDeleteItem={(id) => handleDeleteItem('reminder', id)}
                  onToggleReminder={toggleReminder}
                />
              )}
              {activeTab === 'intelligence' && (
                <IntelligenceTab
                  vehicle={selectedVehicle}
                  symptomQuery={symptomQuery}
                  setSymptomQuery={setSymptomQuery}
                  runDiagnosis={handleDiagnose}
                  isDiagnosing={isDiagnosing}
                  diagnosisResult={diagnosisResult}
                  runTCOAnalysis={handleTCOAnalysis}
                  isAnalyzingTco={isAnalyzingTco}
                  tcoAnalysis={tcoAnalysis}
                  createdAt={selectedVehicle.createdAt}
                />
              )}
              {activeTab === 'manual' && (
                <ManualTab
                  vehicle={selectedVehicle}
                  isUploadingPDF={isUploadingPDF}
                  isGeneratingManual={isGeneratingManual}
                  onPDFUpload={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleManualPDFUpload(file);
                  }}
                  onGenerateManual={generateManualInfo}
                  manualChatQuery={manualChatQuery}
                  setManualChatQuery={setManualChatQuery}
                  onSendManualChat={() => chatWithManual(manualChatQuery)}
                  isChattingWithManual={isChattingWithManual}
                  manualChatResponse={manualChatResponse || null}
                  manualPDFInputRef={manualPDFInputRef}
                />
              )}
              {activeTab === 'audit' && (
                <AuditTab
                  vehicle={selectedVehicle}
                  digitalPassport={digitalPassport}
                  onGeneratePassport={handleGeneratePassport}
                  isGeneratingPassport={isGeneratingPassport}
                  healthScore={selectedVehicle.healthScore || 0}
                />
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* === MODAIS === */}

      <VehicleFormModal
        isOpen={isAddingVehicle || isEditingVehicle}
        onClose={() => {
          setIsAddingVehicle(false);
          setIsEditingVehicle(false);
        }}
        isEditing={isEditingVehicle}
        newVehicle={newVehicle}
        setNewVehicle={setNewVehicle}
        onConfirm={isEditingVehicle ? updateVehicle : addVehicle}
        showInternalBrowser={showInternalBrowser}
        setShowInternalBrowser={setShowInternalBrowser}
        internalBrowserUrl={internalBrowserUrl}
        setInternalBrowserUrl={setInternalBrowserUrl}
        searchPortals={searchPortals}
        isSearchingPlate={isSearchingPlate}
        searchVehicleByPlate={searchVehicleByPlate}
        rawPastedData={rawPastedData}
        setRawPastedData={setRawPastedData}
        handleAssistedProcess={handleAssistedProcess}
        isProcessingAssisted={isProcessingAssisted}
        handleRemoveBackground={onRemoveBackgroundWrapper}
        isRemovingBackground={isRemovingBackground}
        searchImage={searchImage}
        isSearchingImage={isSearchingImage}
        handleCaptureFromClipboard={captureFromExternal}
        robotLogs={robotLogs}
        robotLogsEndRef={robotLogsEndRef}
        plateSearchStatus={plateSearchStatus}
        currentCountry={currentCountry}
      />

      <AddServiceModal
        isOpen={isAddingService}
        onClose={() => setIsAddingService(false)}
        newService={newService}
        setNewService={setNewService}
        newServicePart={newServicePart}
        setNewServicePart={setNewServicePart}
        vehicleParts={selectedVehicle?.parts || []}
        onAddService={addService}
        onOpenAddPartCatalog={(name) => {
          setIsAddingPart(true);
          setNewPartName(name);
        }}
        vehicleNameModel={`${selectedVehicle?.name} ${selectedVehicle?.model}`}
      />

      <AddFuelModal
        isOpen={isAddingFuel}
        onClose={() => setIsAddingFuel(false)}
        newFuel={newFuel}
        setNewFuel={setNewFuel}
        onAddFuel={addFuel}
      />

      <AddReminderModal
        isOpen={isAddingReminder}
        onClose={() => setIsAddingReminder(false)}
        newReminder={newReminder}
        setNewReminder={setNewReminder}
        onAddReminder={addReminder}
      />

      <AddPartModal
        isOpen={isAddingPart}
        onClose={() => setIsAddingPart(false)}
        newPartName={newPartName}
        setNewPartName={setNewPartName}
        aiSuggestions={aiSuggestions}
        setAiSuggestions={setAiSuggestions}
        isResearching={isResearching}
        onAddPart={addPart}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
      />

      <MaintenanceSimulationModal
        isOpen={isSimulating}
        onClose={() => setIsSimulating(false)}
        selectedVehicle={selectedVehicle}
        simulationMileage={simulationMileage}
        setSimulationMileage={setSimulationMileage}
        simulationResults={simulationResults}
        isCalculatingSimulation={isCalculatingSimulation}
        onRunSimulation={() => runSimulation(simulationMileage)}
      />

      <BudgetModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        selectedVehicle={selectedVehicle}
        onUpdatePartPrice={updatePartPrice}
        onTogglePartBudget={togglePartBudget}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        data={data}
        onSave={handleSave}
        onExportData={() => storageService.exportData()}
        onImportData={() => fileInputRef.current?.click()}
      />

      <DictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        onSelectPart={(name) => {
          setNewPartName(name);
          setIsAddingPart(true);
          setIsDictionaryOpen(false);
        }}
      />

      <ServiceReportModal
        isOpen={!!selectedServiceForReport}
        onClose={() => setSelectedServiceForReport(null)}
        selectedVehicle={selectedVehicle}
        selectedService={selectedServiceForReport}
      />

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title={itemToDelete?.type === 'vehicle' ? 'Excluir Veículo' : 'Excluir Registro'}
        message={
          itemToDelete?.type === 'vehicle'
            ? 'Tem certeza absoluta? Todos os dados, históricos e registros deste veículo serão apagados permanentemente.'
            : 'Deseja remover este registro? Esta ação não pode ser desfeita.'
        }
      />

      {/* Hidden Inputs */}
      <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json,application/json" />
      <input type="file" ref={vehicleImageInputRef} onChange={handleVehicleImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={brandLogoInputRef} onChange={handleBrandLogoUpload} accept="image/*" className="hidden" />
      <input type="file" ref={importVehicleInputRef} onChange={handleImportVehicle} accept=".json,application/json" className="hidden" />
    </>
  );
}
