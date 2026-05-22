import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Settings, Car, Gauge, Activity, Box, Trash2, ArrowLeft, 
  Search, Shield, MapPin, Calendar, Clock, DollarSign, Download, 
  MessageSquare, Globe, ArrowRight, AlertTriangle, CheckCircle2, ChevronRight,
  TrendingUp, TrendingDown, RefreshCw, Smartphone, List, Zap, Fuel, Info,
  ExternalLink, Layers, Save, FileText, Share2, Pin, Sliders, Menu, X, Disc,
  Camera, Image as ImageIcon, Sparkles, Filter, ChevronDown, LayoutDashboard,
  LucideIcon,
  Upload,
  CarFront,
  BusFront,
  Truck,
  Bike,
  Cylinder,
  Key,
  Timer,
  Trophy,
  Flag,
  Palette,
  Database,
  Calculator,
  Cpu,
  Unplug,
  Flame,
  Wind,
  Map,
  HardHat,
  Wrench,
  Cog,
  ShieldCheck,
  BarChart3,
  Droplets,
  Coins,
  BadgePercent,
  Stethoscope,
  Book,
  Bell,
  Link,
  ChevronDown as ChevronDownIcon,
  Send,
  Pipette,
  AlertCircle,
  CheckCircle,
  DollarSign as DollarSignIcon,
  ShoppingCart
} from 'lucide-react';
import Markdown from 'react-markdown';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

// Refatoração - Componentes Extraídos
import { 
  TiresTab, ServicesTab, FuelTab, PartsTab, RemindersTab, IntelligenceTab, ManualTab, AuditTab,
  VehicleImage, BrandLogo, HeaderLogo, SettingsModal, VehicleFormModal, AddServiceModal,
  AddFuelModal, AddReminderModal, AddPartModal, MaintenanceSimulationModal, DeleteConfirmationModal,
  BudgetModal, CarFerrariTop, CarMuscleTop, CarSilhouette, SteeringWheelCustom,
  AppHeader, VehicleList, OnboardingModal, VehicleDetailHeader, VehicleTabs,
  DictionaryModal, ServiceReportModal
} from './components';

// Hooks
import { 
  useAppData,
  useVehiclePredictions,
  useVehicleManual,
  useVehicleActions,
  useVehicleItems,
  useRobotSearch,
  useVehicleDetails,
  useFileHandlers
} from './hooks';

// Tipos e Serviços
import { Vehicle, Part, ServiceEntry, FuelLog, Reminder, TireSet, AppData, VehicleSearchLink } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { webVehicleSearchService } from './services/webVehicleSearchService';
import { formatCurrency, cn, fileToBase64, resizeImage } from './lib/utils';
import { getVehicleHealth, getMaintenanceScore, getFuelAnalytics as getFuelAnalyticsUtil } from './lib/vehicleUtils';
import { THEMES, DEFAULT_SEARCH_LINKS, AUTO_DICTIONARY } from './constants';
import { COUNTRIES } from './config/countryConfig';

const ICON_OPTIONS = {
  Car, CarFront, BusFront, Truck, Bike, Settings, Search, Wrench, Activity, Shield, Zap, Box, Gauge, Fuel, Cog, Cylinder, Key, Timer, Trophy, Flag, Palette, Database, Calculator, Cpu, Disc, Unplug, Flame, Wind, Map, HardHat,
  CarFerrariTop, CarMuscleTop, CarSilhouette, SteeringWheelCustom
};

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
    setTcoAnalysis,
    setDigitalPassport,
    handleManualRefresh,
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
  const [isWebSearchOpen, setIsWebSearchOpen] = useState(false);
  const [webSearchMode, setWebSearchMode] = useState<'parts' | 'vehicle' | 'manual'>('parts');
  const [selectedServiceForReport, setSelectedServiceForReport] = useState<ServiceEntry | null>(null);

  const pasteTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
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

  const {
    manualPDFInputRef,
    importVehicleInputRef,
    fileInputRef,
    vehicleImageInputRef,
    brandLogoInputRef,
    handleImport,
    handleImportVehicle,
    exportVehicle,
    handleVehicleImageUpload,
    handleBrandLogoUpload,
    handlePDFUpload,
    shareTechnicalReport
  } = useFileHandlers(
    data, handleSave, selectedVehicle, updateSelectedVehicle, 
    setNewVehicle, setSelectedVehicle, handleManualPDFUpload
  );

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
    foundPhotos,
    setFoundPhotos,
    searchQuery,
    setSearchQuery,
    isGalleryOpen,
    setIsGalleryOpen,
    cooldownRemaining,
    handleRemoveBackground
  } = useRobotSearch(
    currentCountry, data, newVehicle as Vehicle, setNewVehicle, 
    selectedVehicle, updateSelectedVehicle, showInternalBrowser
  );

  const fuelAnalytics = useMemo(() => getFuelAnalyticsUtil(selectedVehicle), [selectedVehicle?.fuelLogs]);
  const vehicleHealth = useMemo(() => getVehicleHealth(selectedVehicle), [selectedVehicle?.parts]);
  const maintenanceScore = useMemo(() => getMaintenanceScore(selectedVehicle), [selectedVehicle]);

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

  // Removido update automático no load para preservar cota da IA
  /*
  useEffect(() => {
    if (data.vehicles.length > 0) {
      data.vehicles.forEach(v => {
        // Atualiza se não tiver valor ou se o valor for antigo (mais de 24h)
        const isOld = !v.lastFipeUpdate || (new Date().getTime() - new Date(v.lastFipeUpdate).getTime() > 86400000);
        if (isOld) updateFipeValue(v.id);
      });
    }
  }, []);
  */

  return (
    <>
      <input type="file" ref={manualPDFInputRef} className="hidden" accept=".pdf" onChange={handlePDFUpload} />
      <input type="file" ref={importVehicleInputRef} className="hidden" accept=".json" onChange={handleImportVehicle} />
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
      <input type="file" ref={vehicleImageInputRef} className="hidden" accept="image/*" onChange={handleVehicleImageUpload} />
      <input type="file" ref={brandLogoInputRef} className="hidden" accept="image/*" onChange={handleBrandLogoUpload} />

      {/* Modal de Onboarding / Configuração Automática */}
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
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="min-h-screen bg-brand-bg tech-grid p-4 md:p-8"
      >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <AppHeader 
          data={data}
          setIsSettingsOpen={setIsSettingsOpen}
          setIsAddingVehicle={setIsAddingVehicle}
        />

        {!selectedVehicle ? (
          <VehicleList 
            data={data}
            setSelectedVehicle={setSelectedVehicle}
            moveVehicleToTop={moveVehicleToTop}
            deleteVehicle={deleteVehicle}
            setIsAddingVehicle={setIsAddingVehicle}
            importVehicleInputRef={importVehicleInputRef}
            formatDistance={formatDistance}
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
              onShareReport={() => shareTechnicalReport(maintenancePredictions, getVehicleHealth)}
              onUpdateMileage={() => updateSelectedVehicle({ mileage: predictCurrentMileage(selectedVehicle) })}
              onSearchLogo={() => searchLogo(selectedVehicle.name, true)}
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
              onTcoAnalysis={handleTCOAnalysis}
              isAnalyzingTco={isAnalyzingTco}
              tcoAnalysis={tcoAnalysis}
              onGeneratePassport={handleGeneratePassport}
              isGeneratingPassport={isGeneratingPassport}
              digitalPassport={digitalPassport}
              onRefreshPredictions={handleManualRefresh}
              onOpenDNA={() => setActiveTab('dna')}
              onDiagnose={handleDiagnose}
              isDiagnosing={isDiagnosing}
              symptomQuery={symptomQuery}
              setSymptomQuery={setSymptomQuery}
              diagnosisResult={diagnosisResult}
              setDiagnosisResult={setDiagnosisResult}
              predictCurrentMileage={predictCurrentMileage}
              formatDistance={formatDistance}
              getDistanceUnit={getDistanceUnit}
              formatCurrency={formatCurrency}
              getVehicleHealth={() => getVehicleHealth(selectedVehicle)}
              getMaintenanceScore={() => getMaintenanceScore(selectedVehicle)}
              isUpdatingFipe={isUpdatingFipe}
              onUpdateFipe={() => updateFipeValue(selectedVehicle.id)}
              marketRef={data.settings?.marketReferenceName || 'FIPE'}
            />

            <VehicleTabs 
              selectedVehicle={selectedVehicle}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setIsAddingPart={setIsAddingPart}
              setIsBudgetOpen={setIsBudgetOpen}
              setIsSimulating={setIsSimulating}
              setSimulationMileage={setSimulationMileage}
              setSimulationResults={setSimulationResults}
              deletePart={deletePart}
              togglePartBudget={togglePartBudget}
              predictCurrentMileage={predictCurrentMileage}
              formatCurrency={formatCurrency}
              addTireSet={addTireSet}
              deleteTireSet={deleteTireSet}
              updateTireSet={updateTireSet}
              setIsAddingService={setIsAddingService}
              handleDeleteItem={handleDeleteItem}
              setIsAddingFuel={setIsAddingFuel}
              setIsAddingReminder={setIsAddingReminder}
              toggleReminder={toggleReminder}
              symptomQuery={symptomQuery}
              setSymptomQuery={setSymptomQuery}
              handleDiagnose={handleDiagnose}
              isDiagnosing={isDiagnosing}
              diagnosisResult={diagnosisResult}
              handleTCOAnalysis={handleTCOAnalysis}
              isAnalyzingTco={isAnalyzingTco}
              tcoAnalysis={tcoAnalysis}
              fuelAnalytics={fuelAnalytics}
              isUploadingPDF={isUploadingPDF}
              isGeneratingManual={isGeneratingManual}
              handleManualPDFUpload={handleManualPDFUpload}
              generateManualInfo={generateManualInfo}
              manualChatQuery={manualChatQuery}
              setManualChatQuery={setManualChatQuery}
              chatWithManual={chatWithManual}
              isChattingWithManual={isChattingWithManual}
              manualChatResponse={manualChatResponse}
              manualPDFInputRef={manualPDFInputRef}
              digitalPassport={digitalPassport}
              handleGeneratePassport={handleGeneratePassport}
              isGeneratingPassport={isGeneratingPassport}
            />
          </motion.div>
        )}
      </div>
    </motion.div>

      {/* MODAL: Add/Edit Vehicle */}
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
        foundPhotos={foundPhotos}
        setFoundPhotos={setFoundPhotos}
        searchQuery={searchQuery}
        onSearch={(query: string) => searchImage(query)}
        isGalleryOpen={isGalleryOpen}
        setIsGalleryOpen={setIsGalleryOpen}
        cooldownRemaining={cooldownRemaining}
        handleCaptureFromClipboard={captureFromExternal}
        robotLogs={robotLogs}
        robotLogsEndRef={robotLogsEndRef}
        plateSearchStatus={plateSearchStatus}
        currentCountry={currentCountry}
        searchLinks={data.settings?.searchLinks || DEFAULT_SEARCH_LINKS}
        captureFromExternal={captureFromExternal}
        searchLogo={searchLogo}
        isSearchingLogo={isSearchingLogo}
        vehicleImageInputRef={vehicleImageInputRef}
        brandLogoInputRef={brandLogoInputRef}
        pasteTextAreaRef={pasteTextAreaRef}
      />




      {/* MODAL: Add Service */}
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

      {/* MODAL: Add Fuel */}
      <AddFuelModal 
        isOpen={isAddingFuel}
        onClose={() => setIsAddingFuel(false)}
        newFuel={newFuel}
        setNewFuel={setNewFuel}
        onAddFuel={addFuel}
      />

      {/* MODAL: Add Reminder */}
      <AddReminderModal 
        isOpen={isAddingReminder}
        onClose={() => setIsAddingReminder(false)}
        newReminder={newReminder}
        setNewReminder={setNewReminder}
        onAddReminder={addReminder}
      />

      {/* MODAL: Add Part with AI Research */}
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

      {/* MODAL: Maintenance Simulation */}
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
      {/* MODAL: Budget */}
      <BudgetModal 
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        selectedVehicle={selectedVehicle}
        onUpdatePartPrice={updatePartPrice}
        onTogglePartBudget={togglePartBudget}
      />
      {/* MODAL: Settings */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        data={data}
        onUpdateSettings={(settings) => handleSave({ ...data, settings })}
        onResetData={() => {
          if (confirm('Deseja realmente resetar todos os dados? Esta ação é irreversível.')) {
            storageService.clearData();
            window.location.reload();
          }
        }}
      />
      {/* MODAL: Dictionary */}
      <DictionaryModal 
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        onSelectPart={(name) => {
          setNewPartName(name);
          setIsAddingPart(true);
        }}
      />
      {/* Professional Service Report Modal */}
      <ServiceReportModal 
        selectedService={selectedServiceForReport}
        selectedVehicle={selectedVehicle}
        onClose={() => setSelectedServiceForReport(null)}
      />

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
                        onClick={captureFromExternal}
                        disabled={isCapturingFromWeb}
                        className="flex-1 px-6 py-3 bg-brand-accent text-white font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isCapturingFromWeb ? (
                          <RefreshCw className="animate-spin" size={18} />
                        ) : (
                          <Zap size={18} />
                        )}
                        {isCapturingFromWeb ? 'Aguardando...' : '🚀 Robô BuscaPlacas'}
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

    </>
  );
}
