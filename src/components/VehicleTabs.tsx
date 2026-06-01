
import React from 'react';
import { motion } from 'motion/react';
import { 
  Box, 
  Wrench, 
  Disc, 
  Gauge, 
  Cpu, 
  Book, 
  Bell, 
  ShieldCheck,
  Plus,
  ShoppingCart,
  Activity,
  Layers
} from 'lucide-react';
import { Vehicle } from '../types';
import { 
  PartsTab, 
  ServicesTab, 
  TiresTab, 
  FuelTab, 
  IntelligenceTab, 
  ManualTab, 
  RemindersTab, 
  AuditTab,
  StructuralDNATab
} from './tabs';

interface VehicleTabsProps {
  selectedVehicle: Vehicle;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsAddingPart: (val: boolean) => void;
  setIsBudgetOpen: (val: boolean) => void;
  setIsSimulating: (val: boolean) => void;
  setSimulationMileage: (val: number) => void;
  setSimulationResults: (val: any[]) => void;
  deletePart: (id: string) => void;
  togglePartBudget: (id: string) => void;
  predictCurrentMileage: (v: Vehicle) => number;
  formatCurrency: (val: number) => string;
  addTireSet: (tire: any) => void;
  deleteTireSet: (id: string) => void;
  updateTireSet: (id: string, tire: any) => void;
  setIsAddingService: (val: boolean) => void;
  handleDeleteItem: (type: string, id: string) => void;
  setIsAddingFuel: (val: boolean) => void;
  setIsAddingReminder: (val: boolean) => void;
  toggleReminder: (id: string) => void;
  symptomQuery: string;
  setSymptomQuery: (val: string) => void;
  handleDiagnose: () => void;
  isDiagnosing: boolean;
  diagnosisResult: string | null;
  handleTCOAnalysis: () => void;
  isAnalyzingTco: boolean;
  tcoAnalysis: string | null;
  fuelAnalytics: any;
  isUploadingPDF: boolean;
  isGeneratingManual: boolean;
  handleManualPDFUpload: (file: File) => void;
  generateManualInfo: () => void;
  manualChatQuery: string;
  setManualChatQuery: (val: string) => void;
  chatWithManual: (query: string) => void;
  isChattingWithManual: boolean;
  manualChatResponse: string | null;
  manualPDFInputRef: React.RefObject<HTMLInputElement | null>;
  digitalPassport: string | null;
  handleGeneratePassport: () => void;
  isGeneratingPassport: boolean;
}

export const VehicleTabs: React.FC<VehicleTabsProps> = ({
  selectedVehicle,
  activeTab,
  setActiveTab,
  setIsAddingPart,
  setIsBudgetOpen,
  setIsSimulating,
  setSimulationMileage,
  setSimulationResults,
  deletePart,
  togglePartBudget,
  predictCurrentMileage,
  formatCurrency,
  addTireSet,
  deleteTireSet,
  updateTireSet,
  setIsAddingService,
  handleDeleteItem,
  setIsAddingFuel,
  setIsAddingReminder,
  toggleReminder,
  symptomQuery,
  setSymptomQuery,
  handleDiagnose,
  isDiagnosing,
  diagnosisResult,
  handleTCOAnalysis,
  isAnalyzingTco,
  tcoAnalysis,
  fuelAnalytics,
  isUploadingPDF,
  isGeneratingManual,
  handleManualPDFUpload,
  generateManualInfo,
  manualChatQuery,
  setManualChatQuery,
  chatWithManual,
  isChattingWithManual,
  manualChatResponse,
  manualPDFInputRef,
  digitalPassport,
  handleGeneratePassport,
  isGeneratingPassport
}) => {
  const tabs = [
    { id: 'parts', label: 'Componentes', icon: Box },
    { id: 'services', label: 'Serviços', icon: Wrench },
    { id: 'tires', label: 'Pneus', icon: Disc },
    { id: 'fuel', label: 'Consumo', icon: Gauge },
    { id: 'intelligence', label: 'Inteligência', icon: Cpu },
    { id: 'manual', label: 'Manual', icon: Book },
    { id: 'reminders', label: 'Alertas', icon: Bell },
    { id: 'dna', label: 'DNA Estrutural', icon: Layers },
    { id: 'audit', label: 'Auditoria', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mt-2 w-full max-w-2xl overflow-x-auto pb-2 no-scrollbar px-1">
        <button 
          onClick={() => setIsAddingPart(true)}
          className="flex-1 bg-brand-primary hover:bg-zinc-900 text-white px-2 py-4 rounded-xl font-black uppercase text-[10px] tracking-tighter transition-all shadow-md shrink-0 border border-zinc-950 relative flex items-center justify-center group min-h-[52px]"
        >
          <span className="text-center px-1">Catalogar OEM</span>
          <Plus size={12} className="absolute bottom-1.5 left-1.5 text-white/30" />
        </button>
        <button 
          onClick={() => setIsBudgetOpen(true)}
          className="flex-1 bg-button-bg text-button-text px-2 py-4 rounded-xl font-black uppercase text-[10px] tracking-tighter border border-zinc-950 transition-all shadow-md shrink-0 relative flex items-center justify-center group min-h-[52px]"
        >
          <span className="text-center px-1">Orçamento ({(selectedVehicle.parts || []).filter(p => p.isInBudget).length})</span>
          <ShoppingCart size={12} className="absolute bottom-1.5 left-1.5 opacity-30" />
        </button>
        <button 
          onClick={() => {
            setSimulationMileage(selectedVehicle.mileage + 10000);
            setSimulationResults([]);
            setIsSimulating(true);
          }}
          className="flex-1 bg-card-bg hover:bg-zinc-50 text-text-primary px-2 py-4 rounded-xl font-black uppercase text-[10px] tracking-tighter border border-zinc-950 transition-all shadow-sm shrink-0 relative flex items-center justify-center group min-h-[52px]"
        >
          <span className="text-center px-1">Simulador</span>
          <Activity size={12} className="absolute bottom-1.5 left-1.5 text-zinc-400 group-hover:text-brand-accent transition-colors" />
        </button>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 -mx-1 no-scrollbar px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all font-black text-[9px] uppercase tracking-widest ${
              activeTab === tab.id 
              ? 'bg-button-bg text-button-text shadow-md z-10' 
              : 'bg-card-bg text-text-secondary hover:bg-zinc-50 border border-zinc-100 shadow-sm'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'parts' && (
          <PartsTab 
            vehicle={selectedVehicle}
            onAddPart={() => setIsAddingPart(true)}
            onDeleteItem={deletePart}
            onToggleBudget={togglePartBudget}
            predictCurrentMileage={predictCurrentMileage}
            formatCurrency={formatCurrency}
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
            onDeleteItem={(id: string) => handleDeleteItem('service', id)}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelTab 
            fuelLogs={selectedVehicle.fuelLogs || []}
            onAddFuel={() => setIsAddingFuel(true)}
            onDeleteItem={(id: string) => handleDeleteItem('fuel', id)}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersTab 
            reminders={selectedVehicle.reminders || []}
            onAddReminder={() => setIsAddingReminder(true)}
            onDeleteItem={(id: string) => handleDeleteItem('reminder', id)}
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
            createdAt={selectedVehicle.createdAt || new Date().toISOString()}
            fuelAnalytics={fuelAnalytics}
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

        {activeTab === 'dna' && (
          <StructuralDNATab 
            vehicle={selectedVehicle}
          />
        )}
      </div>
    </div>
  );
};
