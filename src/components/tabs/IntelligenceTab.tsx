import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, RefreshCw, TrendingUp, ShieldCheck, ChevronDown } from 'lucide-react';
import Markdown from 'react-markdown';
import { InteractiveDiagnosis } from '../InteractiveDiagnosis';
import { Vehicle } from '../../types';

interface IntelligenceTabProps {
  vehicle: Vehicle;
  symptomQuery: string;
  setSymptomQuery: (val: string) => void;
  runDiagnosis: () => void;
  isDiagnosing: boolean;
  diagnosisResult: string | null;
  runTCOAnalysis: () => void;
  isAnalyzingTco: boolean;
  tcoAnalysis: string | null;
  createdAt: string;
  fuelAnalytics?: {
    data: any[];
    avgKmL: number;
    avgCostKm: number;
    totalLiters: number;
    totalCost: number;
    distanceTraveled: number;
  };
}

export const IntelligenceTab: React.FC<IntelligenceTabProps> = ({
  vehicle,
  symptomQuery,
  setSymptomQuery,
  runDiagnosis,
  isDiagnosing,
  diagnosisResult,
  runTCOAnalysis,
  isAnalyzingTco,
  tcoAnalysis,
  createdAt,
  fuelAnalytics
}) => {
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

  const totalFuelCost = fuelAnalytics?.totalCost || (vehicle.fuelLogs || []).reduce((acc, l) => acc + l.cost, 0);
  const totalServiceCost = (vehicle.services || []).reduce((acc, l) => acc + l.cost, 0);
  
  const costPerKm = fuelAnalytics?.avgCostKm || (totalFuelCost / Math.max(1, vehicle.mileage - (vehicle.fuelLogs?.[0]?.mileage || 0)));
  const traveledKm = fuelAnalytics?.distanceTraveled || Math.max(1, vehicle.mileage - (vehicle.fuelLogs?.[0]?.mileage || vehicle.mileage));
  
  const createdDate = new Date(createdAt || new Date());
  const monthsActive = Math.max(1, (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const avgMonthlyExpense = (totalFuelCost + totalServiceCost) / monthsActive;

  const sections = [
    {
      id: 'diagnosis',
      title: 'IA Especialista: Diagnóstico',
      icon: Cpu,
      content: (
        <div className="space-y-4">
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4">Descreva os sintomas para uma análise preditiva em tempo real.</p>
          <div className="relative group">
            <textarea
              value={symptomQuery}
              onChange={(e) => setSymptomQuery(e.target.value)}
              placeholder="Descreva o que seu carro está sentindo..."
              className="w-full bg-white border border-zinc-950 rounded-lg px-6 py-6 focus:ring-4 focus:ring-brand-primary/5 outline-none text-base font-bold min-h-[150px] shadow-sm transition-all placeholder:text-zinc-300"
            />
            <button
              onClick={runDiagnosis}
              disabled={isDiagnosing || !symptomQuery}
              className="absolute bottom-4 right-4 bg-brand-primary text-white px-6 py-4 rounded-lg font-black uppercase tracking-tighter text-[10px] hover:bg-zinc-900 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2 group"
            >
              {isDiagnosing ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
              Analisar
            </button>
          </div>

          {diagnosisResult && (
  <InteractiveDiagnosis
    diagnosisResult={diagnosisResult}
    vehicle={vehicle}
    symptomQuery={symptomQuery}
  />
)}
        </div>
      )
    },
    {
      id: 'efficiency',
      title: 'Eficiência Real & TCO',
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
              <p className="text-[9px] font-black uppercase text-zinc-500 mb-1">$/KM Rodado</p>
              <div className="flex items-baseline gap-0.5">
                 <span className="text-[10px] font-black text-brand-accent">R$</span>
                 <p className="text-xl font-black text-brand-primary tracking-tighter italic">
                   {costPerKm.toFixed(2)}
                 </p>
              </div>
            </div>
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
              <p className="text-[9px] font-black uppercase text-zinc-500 mb-1">Gasto Mensal</p>
              <div className="flex items-baseline gap-0.5">
                 <span className="text-[10px] font-black text-brand-accent">R$</span>
                 <p className="text-xl font-black text-brand-primary tracking-tighter italic">
                   {Math.round(avgMonthlyExpense).toLocaleString()}
                 </p>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 font-bold italic text-left">
            * Baseado em {traveledKm.toLocaleString()} KM de telemetria torqboss.
          </p>
          <button 
            onClick={runTCOAnalysis}
            disabled={isAnalyzingTco}
            className="w-full py-4 bg-brand-primary text-white border-2 border-zinc-950 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all flex items-center justify-center gap-2 shadow-md"
          >
            {isAnalyzingTco ? <RefreshCw className="animate-spin" size={14} /> : <TrendingUp size={14} />}
            Gerar Diagnóstico TCO Pro
          </button>
        </div>
      )
    },
    {
      id: 'score',
      title: 'Score de Integridade torqboss',
      icon: ShieldCheck,
      content: (
        <div className="bg-zinc-950 p-6 rounded-xl text-white space-y-6 relative overflow-hidden text-left border border-white/5">
          <div className="flex items-end gap-2 mb-2 relative z-10">
            <span className="text-5xl font-black tracking-tighter text-brand-accent leading-none italic">{vehicle.healthScore || 85}</span>
            <span className="text-[10px] font-black uppercase mb-1 tracking-widest text-zinc-600">Pontos</span>
          </div>
          <p className="text-xs font-bold leading-relaxed text-zinc-400 relative z-10">
            Perfil <span className="font-black text-white bg-zinc-800 px-1.5 py-0.5 rounded italic">{vehicle.drivingStyle === 'smooth' ? 'Eco' : vehicle.drivingStyle === 'aggressive' ? 'Sport' : 'Balanceado'}</span>: seu nível de cuidado impacta diretamente na valorização futura do ativo.
          </p>
          <div className="relative z-10 space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.1em]">
              <span className="text-zinc-500">Estado Estrutural</span>
              <span className="text-brand-accent italic">Excellent</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${vehicle.healthScore || 85}%` }}
                className="h-full bg-brand-accent rounded-full"
              />
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-white/5 rounded-full blur-[80px]"></div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="bg-brand-primary p-6 rounded-xl relative overflow-hidden shadow-xl mb-6">
        <div className="absolute -right-10 -top-10 opacity-10">
          <Cpu size={180} className="text-brand-accent" />
        </div>
        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2 mb-1 relative z-10">
          <Cpu size={24} className="text-brand-accent" /> Intelligence Hub
        </h3>
        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em] relative z-10">IA aplicada • Diagnóstico Automotivo • Perfil de Ativo</p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="bg-white border-2 border-zinc-950/5 rounded-xl shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className={`w-full flex items-center justify-between p-5 text-left transition-all ${activeSection === section.id ? 'bg-zinc-50 border-b-2 border-zinc-950/5' : 'hover:bg-zinc-50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${activeSection === section.id ? 'bg-brand-primary text-brand-accent' : 'bg-zinc-100 text-zinc-400'}`}>
                  <section.icon size={18} />
                </div>
                <h3 className={`text-[11px] font-black uppercase italic tracking-[0.2em] ${activeSection === section.id ? 'text-brand-primary' : 'text-zinc-500'}`}>
                  {section.title}
                </h3>
              </div>
              <motion.div animate={{ rotate: activeSection === section.id ? 180 : 0 }}>
                <ChevronDown size={18} className="text-zinc-400" />
              </motion.div>
            </button>
            <motion.div 
              initial={false}
              animate={{ height: activeSection === section.id ? 'auto' : 0, opacity: activeSection === section.id ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6">
                {section.content}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};
