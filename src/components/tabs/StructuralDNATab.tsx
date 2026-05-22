
import React from 'react';
import { motion } from 'motion/react';
import { 
  Layers, 
  Sparkles, 
  Info, 
  Maximize2, 
  Construction, 
  Box,
  Puzzle,
  Zap,
  Search
} from 'lucide-react';
import { Vehicle } from '../../types';

interface StructuralDNATabProps {
  vehicle: Vehicle;
}

export const StructuralDNATab: React.FC<StructuralDNATabProps> = ({ vehicle }) => {
  return (
    <div className="space-y-4 px-1">
      {/* Hero Section - Engenharia de Precisão */}
      <div className="bg-brand-primary border border-brand-primary rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
          <Construction size={240} className="text-brand-accent" />
        </div>
        
        <div className="relative z-10 text-left">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-brand-accent p-3 rounded-lg">
                <Layers className="text-brand-primary" size={24} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter leading-none">DNA Estrutural</h3>
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mt-1">Módulo de Engenharia FleetX</p>
              </div>
            </div>
          </div>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-lg border border-white/10 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              <span className="text-[11px] text-white font-black uppercase tracking-widest">Serial VIN: {vehicle.plate || 'CONSULTA ATIVA'}</span>
            </div>
          </div>
        </div>

      {/* Buscador de DNA Técnico (Manual de Partes IA) */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-xl mb-8 group focus-within:border-brand-accent transition-all backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 relative w-full">
            <input 
              type="text" 
              placeholder="Pesquise peça técnica..."
              className="w-full bg-black/60 border border-white/10 rounded-lg px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-brand-accent transition-all pl-12 font-bold"
            />
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-accent transition-colors" />
          </div>
          <button className="w-full sm:w-auto bg-brand-accent text-white px-8 py-4 rounded-lg font-black text-[10px] uppercase italic tracking-tighter hover:bg-brand-primary active:scale-95 transition-all shadow-md">
            Catalogar via IA
          </button>
        </div>
        <p className="text-[9px] text-zinc-500 mt-3 font-black uppercase tracking-widest text-center italic">
          Busca Real: OEM, torque e composição.
        </p>
      </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Box, label: 'Materiais', text: 'Mapeamento de polímeros.', color: 'border-l-brand-accent' },
              { icon: Construction, label: 'Torque', text: 'Especificação técnica.', color: 'border-l-brand-accent' },
              { icon: Puzzle, label: 'Sequência', text: 'Logística reversa.', color: 'border-l-brand-accent' },
            ].map((p, i) => (
              <div key={i} className={`bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/5 ${p.color} border-l-4 text-left`}>
                <p className="text-[10px] text-brand-accent font-black uppercase mb-1 flex items-center gap-2">
                  <p.icon size={12} /> {p.label}
                </p>
                <p className="text-[11px] text-zinc-300 font-bold leading-tight">{p.text}</p>
              </div>
            ))}
          </div>

      {/* Linha de Montagem Industrial - NOVO */}
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <h4 className="text-[11px] font-black uppercase text-zinc-950 tracking-[0.4em] flex items-center gap-3">
            <div className="w-12 h-1 bg-brand-primary"></div>
            Fluxo de Linha de Montagem FleetX
          </h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: '01', name: 'Body-in-White', status: 'Estrutural', icon: Construction },
            { step: '02', name: 'Paint & Coat', status: 'Proteção', icon: Sparkles },
            { step: '03', name: 'Trim & Internals', status: 'Montagem', icon: Layers },
            { step: '04', name: 'Final Assembly', status: 'Ajuste Fino', icon: Zap },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-zinc-100 p-5 rounded-xl relative group overflow-hidden shadow-sm hover:border-brand-primary transition-all">
              <div className="absolute top-0 right-0 p-2 text-zinc-100 font-black text-2xl group-hover:text-brand-primary/5 transition-colors">{s.step}</div>
              <s.icon className="text-brand-primary mb-3 transition-transform" size={20} />
              <h5 className="text-[10px] font-black text-brand-primary uppercase mb-1 italic leading-none">{s.name}</h5>
              <span className="text-[8px] text-brand-accent font-black uppercase tracking-widest">{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de Detalhamento Técnico */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { 
            title: 'Polímeros Ativos', 
            desc: 'Especificação plásticos industriais.',
            icon: Box,
            color: 'text-brand-accent',
            engCode: 'ASTM D4000',
            items: [
              { name: 'Parachoque (PP+EPDM)', spec: 'Material Flexível' },
              { name: 'Painel (ABS)', spec: 'Alta Rigidez' },
            ]
          },
          { 
            title: 'Fixação Técnica', 
            desc: 'Torques e grampos OEM.',
            icon: Puzzle,
            color: 'text-brand-accent',
            engCode: 'DIN 933',
            items: [
              { name: 'Presilha Teto', spec: 'Carga: 15N' },
              { name: 'Maçaneta (T20)', spec: 'Aço Inox' },
            ]
          },
          { 
            title: 'Aerodinâmica', 
            desc: 'Componentes de fluxo.',
            icon: Maximize2,
            color: 'text-brand-accent',
            engCode: 'C.DRAG PROTOCOL',
            items: [
              { name: 'Spoiler Inferior', spec: 'Fluxo Ar' },
              { name: 'Vedação EPDM', spec: 'NVH Isolt' },
            ]
          }
        ].map((cat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4 }}
            className="bg-white border border-zinc-100 p-6 rounded-xl shadow-sm hover:border-brand-primary transition-all flex flex-col group text-left"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-brand-primary p-2 rounded-lg group-hover:bg-brand-accent transition-colors">
                  <cat.icon size={18} className="text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-brand-primary uppercase tracking-tighter">{cat.title}</h4>
                  <p className="text-[9px] text-brand-accent font-black uppercase tracking-widest">{cat.engCode}</p>
                </div>
              </div>
            </div>
            
            <p className="text-[11px] text-zinc-500 font-bold mb-6 leading-relaxed">{cat.desc}</p>
            
            <div className="space-y-3 mt-auto">
              {cat.items.map((item, j) => (
                <div key={j} className="flex flex-col p-3 bg-zinc-50 rounded-lg border border-zinc-100 group-hover:bg-white transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-brand-primary font-black uppercase italic tracking-tighter truncate max-w-[150px]">{item.name}</span>
                    <Info size={12} className="text-zinc-400" />
                  </div>
                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-1.5 py-0.5 bg-white border border-zinc-200 rounded self-start">{item.spec}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Engenharia Reversa & IA Action */}
      <div className="bg-brand-primary border border-brand-primary rounded-xl p-6 sm:p-8 text-left relative overflow-hidden group shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-125 transition-transform duration-700">
          <Zap size={140} className="text-brand-accent" />
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-brand-accent p-3 rounded-lg shadow-xl shadow-brand-accent/20">
                <Sparkles className="text-brand-primary" size={24} />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Engenharia Reversa IA</h4>
                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-1">Manual de Desmontagem Industrial</p>
              </div>
            </div>
            
            <p className="text-sm text-white font-medium leading-relaxed mb-6 opacity-90 max-w-xl">
              Processamos esquemas OEM para identificar pontos invisíveis de fixação. 
              Evite danos estruturais e quebra de componentes com o guia gerado em tempo real para o {vehicle.name}.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button className="px-6 py-4 bg-brand-accent text-brand-primary rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-3 shadow-md hover:bg-white active:scale-95 group">
                <Sparkles size={16} className="group-hover:rotate-[30deg] transition-transform" /> 
                Escanear componente via foto
              </button>
              <button className="px-6 py-4 bg-white/10 text-white border border-white/20 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-3 hover:bg-white/20 active:scale-95 shadow-sm">
                <Puzzle size={16} /> Mapa Estrutural 3D
              </button>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl p-5 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center min-w-[140px] shadow-xl">
             <div className="text-4xl font-black text-brand-accent italic mb-1">99.8%</div>
             <p className="text-[9px] text-white font-black uppercase tracking-widest leading-none">Precisão FleetX</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
          <div className="bg-brand-accent/20 p-1.5 rounded-md">
            <Info size={14} className="text-brand-accent" />
          </div>
          <p className="text-[9px] text-zinc-400 font-black uppercase italic tracking-[0.1em]">
            Conformidade Automotiva: Protocolos MDS/VDA/ISO.
          </p>
        </div>
      </div>
    </div>
  );
};
