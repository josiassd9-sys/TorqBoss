
import React from 'react';
import { motion } from 'motion/react';
import { 
  Box, Search, Package, ExternalLink, Calculator, Trash2, 
  Settings, CheckCircle2, AlertTriangle, Clock, ChevronDown 
} from 'lucide-react';
import { Part, Vehicle } from '../../types';

interface PartsTabProps {
  vehicle: Vehicle;
  onAddPart: () => void;
  onDeleteItem: (id: string) => void;
  onToggleBudget: (id: string) => void;
  predictCurrentMileage: (v: Vehicle) => number;
  formatCurrency: (val: number) => string;
}

export const PartsTab: React.FC<PartsTabProps> = ({
  vehicle,
  onAddPart,
  onDeleteItem,
  onToggleBudget,
  predictCurrentMileage,
  formatCurrency
}) => {
  const currentMileage = predictCurrentMileage(vehicle);
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="space-y-6 text-left">
      <div className="pb-2 border-b border-gray-100">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-between items-center text-left focus:outline-none group/accordion py-2"
        >
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary flex items-center gap-2 group-hover/accordion:text-brand-accent transition-colors">
              <Box size={24} className="text-brand-accent" /> Stock & Componentes
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Catálogo de peças e monitoramento de vida útil</p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-brand-primary transition-colors shrink-0"
          >
            <ChevronDown size={24} />
          </motion.div>
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="space-y-6 overflow-hidden"
      >
        <div className="flex justify-end pt-2">
          <button 
            onClick={onAddPart}
            className="bg-brand-primary text-white px-5 py-3 rounded-lg font-black uppercase text-[9px] tracking-widest hover:bg-zinc-900 transition-all shadow-md shadow-brand-primary/10 border border-zinc-950"
          >
            + Acervo de Peças
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(!vehicle.parts || vehicle.parts.length === 0) ? (
          <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Box size={32} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Inventário vazio.</p>
          </div>
        ) : (
          vehicle.parts.map((part) => {
            const currentKm = currentMileage;
            const installedKm = part.installedAtMileage || 0;
            const lifeKm = part.expectedLifeMileage || 50000;
            const usedKm = Math.max(0, currentKm - installedKm);
            const replacedDate = part.installedAtDate ? new Date(part.installedAtDate) : null;
            const healthPercent = Math.max(0, Math.min(100, 100 - (usedKm / lifeKm * 100)));
            
            return (
              <motion.div 
                key={part.id} 
                layout
                style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'rgba(128,128,128,0.15)' }}
                className="p-5 rounded-xl border transition-all hover:border-brand-primary/20 shadow-sm flex flex-col relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div 
                    style={{ backgroundColor: 'var(--color-sub-card-bg)' }}
                    className="shrink-0 p-2.5 rounded-lg group-hover:bg-brand-primary/10 transition-colors"
                  >
                    <Package size={18} className="text-brand-primary" />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => onToggleBudget(part.id)}
                      style={part.isInBudget ? { backgroundColor: 'var(--color-brand-accent)', color: 'var(--color-brand-primary)', borderColor: 'rgba(128,128,128,0.15)' } : { backgroundColor: 'var(--color-sub-card-bg)' }}
                      className={`p-2 rounded-lg transition-all border border-transparent ${part.isInBudget ? '' : 'text-gray-400 hover:text-brand-primary'}`}
                      title={part.isInBudget ? "No Orçamento" : "Adicionar ao Orçamento"}
                    >
                      <Calculator size={12} />
                    </button>
                    <button 
                      onClick={() => onDeleteItem(part.id)}
                      style={{ backgroundColor: 'var(--color-sub-card-bg)' }}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 style={{ color: 'var(--color-text-primary)' }} className="text-sm font-black uppercase tracking-tight line-clamp-1">{part.name}</h4>
                  <p style={{ color: 'var(--color-text-secondary)' }} className="text-[9px] font-mono font-bold tracking-widest uppercase">{part.code || 'S/ COD'}</p>
                </div>

                <div className="mt-auto space-y-4">
                  <div>
                    <div style={{ color: 'var(--color-text-secondary)' }} className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1 shadow-sm px-1">
                      <span className="flex items-center gap-1">
                        {healthPercent > 20 ? <CheckCircle2 size={8} className="text-green-500" /> : healthPercent > 0 ? <AlertTriangle size={8} className="text-amber-500" /> : <Clock size={8} className="text-red-500" />}
                        IA: {Math.round(healthPercent)}%
                      </span>
                      <span>{usedKm.toLocaleString()} / {lifeKm.toLocaleString()} KM</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--color-sub-card-bg)' }} className="w-full h-1 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${healthPercent}%` }}
                        className={`h-full rounded-full ${healthPercent > 50 ? 'bg-green-500' : healthPercent > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      style={{ backgroundColor: 'var(--color-sub-card-bg)', borderColor: 'rgba(128,128,128,0.1)' }}
                      className="p-2 rounded-lg border text-left"
                    >
                       <p style={{ color: 'var(--color-text-secondary)' }} className="text-[7px] font-black uppercase mb-0.5">Instalação</p>
                       <p style={{ color: 'var(--color-text-primary)' }} className="text-[9px] font-bold">{replacedDate ? replacedDate.toLocaleDateString('pt-BR') : '--'}</p>
                    </div>
                    <div 
                      style={{ backgroundColor: 'var(--color-sub-card-bg)', borderColor: 'rgba(128,128,128,0.1)' }}
                      className="p-2 rounded-lg border text-left"
                    >
                       <p style={{ color: 'var(--color-text-secondary)' }} className="text-[7px] font-black uppercase mb-0.5">KM Atual</p>
                       <p style={{ color: 'var(--color-text-primary)' }} className="text-[9px] font-bold">{installedKm.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a 
                      href={`https://lista.mercadolivre.com.br/${part.name.replace(/\s+/g, '-')}-${vehicle.name}-${vehicle.model}-${String(vehicle.year).split('/')[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-brand-primary text-[9px] font-black uppercase rounded-lg transition-all shadow-sm border border-yellow-500/20"
                    >
                      <ExternalLink size={10} /> Mercado Livre
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      </motion.div>
    </div>
  );
};
