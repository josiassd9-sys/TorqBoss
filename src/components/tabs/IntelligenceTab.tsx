
import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, RefreshCw, TrendingUp, ShieldCheck } from 'lucide-react';
import Markdown from 'react-markdown';
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
  const totalFuelCost = fuelAnalytics?.totalCost || (vehicle.fuelLogs || []).reduce((acc, l) => acc + l.cost, 0);
  const totalServiceCost = (vehicle.services || []).reduce((acc, l) => acc + l.cost, 0);
  
  const costPerKm = fuelAnalytics?.avgCostKm || (totalFuelCost / Math.max(1, vehicle.mileage - (vehicle.fuelLogs?.[0]?.mileage || 0)));
  const traveledKm = fuelAnalytics?.distanceTraveled || Math.max(1, vehicle.mileage - (vehicle.fuelLogs?.[0]?.mileage || vehicle.mileage));
  
  const createdDate = new Date(createdAt || new Date());
  const monthsActive = Math.max(1, (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const avgMonthlyExpense = (totalFuelCost + totalServiceCost) / monthsActive;

  return (
    <div className="space-y-8 text-left">
      <div>
        <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary flex items-center gap-2 mb-2">
          <Cpu size={24} className="text-brand-accent" /> Intelligence Hub
        </h3>
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">IA aplicada em diagnóstico, finanças e previsibilidade</p>
      </div>

      {/* Diagnostic AI Section */}
      <div className="bg-brand-primary/5 p-6 sm:p-10 rounded-xl border-2 border-brand-primary/10 shadow-sm overflow-hidden relative">
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="bg-brand-primary p-3 rounded-lg shadow-xl">
            <Cpu size={20} className="text-brand-accent" />
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-brand-primary tracking-tighter uppercase italic">IA Especialista</h3>
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest leading-none mt-1">Diagnóstico por sintomas</p>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg border border-brand-primary/10 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent"></div>
              <div className="markdown-body text-xs leading-relaxed">
                <Markdown>{diagnosisResult}</Markdown>
              </div>
            </motion.div>
          )}
        </div>

        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/10 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none"></div>
      </div>

      {/* TCO & Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-zinc-950 shadow-md space-y-6 flex flex-col justify-between">
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-950">Eficiência Real</h4>
              <div className="bg-brand-primary text-white p-2 rounded-lg">
                <TrendingUp size={16} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                <p className="text-[9px] font-black uppercase text-zinc-500 mb-1">$/KM</p>
                <div className="flex items-baseline gap-0.5">
                   <span className="text-[10px] font-black text-brand-accent">R$</span>
                   <p className="text-xl font-black text-brand-primary tracking-tighter italic">
                     {costPerKm.toFixed(2)}
                   </p>
                </div>
              </div>
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                <p className="text-[9px] font-black uppercase text-zinc-500 mb-1">Mensal</p>
                <div className="flex items-baseline gap-0.5">
                   <span className="text-[10px] font-black text-brand-accent">R$</span>
                   <p className="text-xl font-black text-brand-primary tracking-tighter italic">
                     {Math.round(avgMonthlyExpense).toLocaleString()}
                   </p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 font-bold italic leading-tight">
              * Baseado em {traveledKm.toLocaleString()} KM de telemetria FleetX.
            </p>
          </div>

          <div className="pt-4 space-y-4">
             <button 
              onClick={runTCOAnalysis}
              disabled={isAnalyzingTco}
              className="w-full py-4 bg-brand-primary text-white border-2 border-zinc-950 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {isAnalyzingTco ? <RefreshCw className="animate-spin" size={14} /> : <TrendingUp size={14} />}
              Estudo TCO IA
            </button>
          </div>
        </div>

        <div className="bg-zinc-950 p-6 sm:p-8 rounded-xl shadow-xl text-white space-y-6 relative overflow-hidden flex flex-col justify-between border-2 border-white/10 group text-left">
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Score FleetX</h4>
              <ShieldCheck size={20} className="text-brand-accent group-hover:scale-110 transition-transform" />
            </div>

            <div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-black tracking-tighter text-brand-accent leading-none italic">{vehicle.healthScore || 85}</span>
                <span className="text-[10px] font-black uppercase mb-1 tracking-widest text-zinc-600">Pontos</span>
              </div>
              <p className="text-xs font-bold leading-relaxed text-zinc-400">
                Perfil <span className="font-black text-white bg-zinc-800 px-1.5 py-0.5 rounded italic">{vehicle.drivingStyle === 'smooth' ? 'Eco' : vehicle.drivingStyle === 'aggressive' ? 'Sport' : 'Bal.'}</span>: alto índice estrutural.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 relative z-10 space-y-3">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.1em]">
              <span className="text-zinc-500">Integridade</span>
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

          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </div>
  );
};
