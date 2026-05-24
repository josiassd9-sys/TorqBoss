import React from 'react';
import { motion } from 'motion/react';
import { 
  Layers, 
  Sparkles, 
  Search, 
  Maximize2, 
  Construction, 
  Box,
  Puzzle,
  Zap
} from 'lucide-react';
import { Vehicle } from '../../types';

interface StructuralDNATabProps {
  vehicle: Vehicle;
}

export const StructuralDNATab: React.FC<StructuralDNATabProps> = ({ vehicle }) => {
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

  const sections = [
    {
      id: 'reverse',
      title: 'Engenharia Reversa IA',
      icon: Sparkles,
      content: (
        <div className="bg-brand-primary border border-white/10 rounded-xl p-6 sm:p-8 text-left relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:scale-125 transition-transform duration-700">
            <Zap size={140} className="text-brand-accent" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-white font-medium leading-relaxed mb-6 opacity-90 max-w-xl">
              Esquemas OEM para identificar pontos invisíveis de fixação. Evite danos estruturais ao desmontar o {vehicle.name}.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="px-6 py-4 bg-brand-accent text-brand-primary rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-3 shadow-md hover:bg-white active:scale-95 group">
                <Sparkles size={16} className="group-hover:rotate-[30deg] transition-transform" /> Escanear componente via foto
              </button>
              <button className="px-6 py-4 bg-white/10 text-white border border-white/20 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-3 hover:bg-white/20 active:scale-95">
                <Puzzle size={16} /> Mapa 3D
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'search',
      title: 'Buscador de DNA Técnico',
      icon: Search,
      content: (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 p-5 rounded-xl group focus-within:border-brand-accent transition-all backdrop-blur-sm">
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
                Catalogar IA
              </button>
            </div>
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
        </div>
      )
    },
    {
      id: 'assembly',
      title: 'Fluxo de Montagem FleetX',
      icon: Construction,
      content: (
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
      )
    },
    {
      id: 'detail',
      title: 'Detalhamento Técnico',
      icon: Maximize2,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Polímeros Ativos', engCode: 'ASTM D4000', items: [{ name: 'Parachoque (PP+EPDM)', spec: 'Flexível' }, { name: 'Painel (ABS)', spec: 'Rigidez' }] },
            { title: 'Fixação Técnica', engCode: 'DIN 933', items: [{ name: 'Presilha Teto', spec: '15N' }, { name: 'Maçaneta (T20)', spec: 'Aço Inox' }] },
            { title: 'Aerodinâmica', engCode: 'C.DRAG', items: [{ name: 'Spoiler', spec: 'Fluxo Ar' }, { name: 'Vedação', spec: 'Isolt' }] }
          ].map((cat, i) => (
            <div key={i} className="bg-white border border-zinc-100 p-5 rounded-xl shadow-sm text-left">
              <h4 className="text-xs font-black text-brand-primary uppercase tracking-tighter mb-1">{cat.title}</h4>
              <p className="text-[8px] text-brand-accent font-black uppercase tracking-widest mb-4">{cat.engCode}</p>
              <div className="space-y-2">
                {cat.items.map((item, j) => (
                  <div key={j} className="flex flex-col p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                    <span className="text-[9px] text-brand-primary font-black uppercase italic truncate">{item.name}</span>
                    <span className="text-[8px] text-zinc-600 font-bold uppercase">{item.spec}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 px-1">
      {/* Hero Header */}
      <div className="bg-brand-primary border border-brand-primary rounded-xl p-6 relative overflow-hidden shadow-xl mb-4">
        <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
          <Construction size={200} className="text-brand-accent" />
        </div>
        <div className="relative z-10 text-left">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-brand-accent p-3 rounded-lg">
              <Layers className="text-brand-primary" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">DNA Estrutural</h3>
              <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest mt-1">Sincronização OEM: {vehicle.plate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Menu */}
      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.id} className="bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden">
            <button 
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className={`w-full flex items-center justify-between p-5 text-left transition-colors ${activeSection === section.id ? 'bg-white/5' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${activeSection === section.id ? 'bg-brand-accent text-white' : 'bg-white/5 text-zinc-500'}`}>
                  <section.icon size={18} />
                </div>
                <h3 className={`text-[11px] font-black uppercase italic tracking-[0.2em] ${activeSection === section.id ? 'text-white' : 'text-zinc-500'}`}>
                  {section.title}
                </h3>
              </div>
              <motion.div animate={{ rotate: activeSection === section.id ? 180 : 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><path d="m6 9 6 6 6-6"/></svg>
              </motion.div>
            </button>
            <motion.div 
              initial={false}
              animate={{ height: activeSection === section.id ? 'auto' : 0, opacity: activeSection === section.id ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-5 border-t border-white/5 bg-black/10">
                {section.content}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};
