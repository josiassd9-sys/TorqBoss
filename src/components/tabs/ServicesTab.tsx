
import React from 'react';
import { motion } from 'motion/react';
import { Wrench, Trash2, Box, Info } from 'lucide-react';
import { ServiceEntry } from '../../types';

interface ServicesTabProps {
  services: ServiceEntry[];
  onAddService: () => void;
  onDeleteItem: (id: string) => void;
  formatCurrency: (val: number) => string;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({
  services,
  onAddService,
  onDeleteItem,
  formatCurrency
}) => {
  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary flex items-center gap-2">
            <Wrench size={24} className="text-brand-accent fill-brand-accent" /> Histórico Maintenance
          </h3>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Registros oficiais de oficina e reparos torqboss</p>
        </div>
        <button 
          onClick={onAddService}
          className="w-full sm:w-auto bg-brand-primary text-white px-8 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-zinc-900 transition-all shadow-md border border-zinc-950"
        >
          + Registrar Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {(!services || services.length === 0) ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Wrench size={32} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Sem registros.</p>
          </div>
        ) : (
          [...services].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((service) => (
            <motion.div 
              key={service.id} 
              layout
              style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'rgba(128,128,128,0.15)' }}
              className="p-6 rounded-xl border hover:border-brand-primary/40 transition-all shadow-sm group relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 relative z-10">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black bg-zinc-950 text-white px-2 py-0.5 rounded uppercase tracking-widest italic">
                      {new Date(service.date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-[8px] font-black bg-brand-accent text-brand-primary px-2 py-0.5 rounded uppercase tracking-widest italic">
                      {service.mileage.toLocaleString()} km
                    </span>
                  </div>
                  <h4 style={{ color: 'var(--color-text-primary)' }} className="text-xl font-black uppercase tracking-tighter leading-none italic">{service.provider}</h4>
                  <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs font-bold italic">"{service.description}"</p>
                  
                  {service.items && service.items.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                       {service.items.map((item, idx) => (
                         <div 
                           key={idx} 
                           style={{ backgroundColor: 'var(--color-sub-card-bg)', borderColor: 'rgba(128,128,128,0.1)' }}
                           className="flex items-center gap-1.5 border px-3 py-1.5 rounded-lg"
                         >
                            <Box size={10} className="text-brand-accent" />
                            <span style={{ color: 'var(--color-text-primary)' }} className="text-[9px] font-black uppercase tracking-tight">{item}</span>
                         </div>
                       ))}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:pt-0 pt-4 border-t sm:border-0 border-zinc-50">
                   <div className="text-left sm:text-right">
                      <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mb-0.5">Total</p>
                      <p className="text-xl font-black text-brand-accent tracking-tighter">{formatCurrency(service.cost)}</p>
                   </div>
                   <button 
                    onClick={() => onDeleteItem(service.id)}
                    className="p-2 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
