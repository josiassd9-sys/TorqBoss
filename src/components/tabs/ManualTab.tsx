
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, Upload, Sparkles, RefreshCw, Wrench, AlertCircle, 
  Send, Settings, Info, ChevronDown, ChevronUp, FileText,
  Calendar
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Vehicle } from '../../types';

interface ManualTabProps {
  vehicle: Vehicle;
  isUploadingPDF: boolean;
  isGeneratingManual: boolean;
  onPDFUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateManual: () => void;
  manualChatQuery: string;
  setManualChatQuery: (val: string) => void;
  onSendManualChat: () => void;
  isChattingWithManual: boolean;
  manualChatResponse: string | null;
  manualPDFInputRef: React.RefObject<HTMLInputElement | null>;
}

const AccordionItem = ({ 
  id, 
  title, 
  icon: Icon, 
  isOpen, 
  onToggle, 
  children,
  badge
}: { 
  id: string; 
  title: string; 
  icon: any; 
  isOpen: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
  badge?: string;
}) => {
  return (
    <div className={`border border-gray-100 rounded-lg overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-lg ring-1 ring-brand-primary/5 bg-white' : 'bg-gray-50/50 hover:bg-gray-50'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-lg transition-colors ${isOpen ? 'bg-brand-primary text-white' : 'bg-white text-gray-400 group-hover:text-brand-primary border border-gray-100'}`}>
            <Icon size={20} />
          </div>
          <div>
            <h4 className="font-black text-xs sm:text-sm text-brand-primary uppercase tracking-tight flex items-center gap-2">
              {title}
              {badge && (
                <span className="bg-brand-primary/10 text-brand-primary text-[8px] px-2 py-0.5 rounded-full font-black uppercase">
                  {badge}
                </span>
              )}
            </h4>
          </div>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-brand-primary" /> : <ChevronDown size={18} className="text-gray-300" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-6 sm:px-8 sm:pb-8 border-t border-gray-50 pt-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ManualTab: React.FC<ManualTabProps> = ({
  vehicle,
  isUploadingPDF,
  isGeneratingManual,
  onPDFUpload,
  onGenerateManual,
  manualChatQuery,
  setManualChatQuery,
  onSendManualChat,
  isChattingWithManual,
  manualChatResponse,
  manualPDFInputRef
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary flex items-center gap-2">
            <Book size={24} className="text-brand-accent" /> Manual & Assistente IA
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Base de conhecimento técnica e consulta em linguagem natural</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <input 
              type="file" 
              ref={manualPDFInputRef}
              onChange={onPDFUpload}
              accept=".pdf"
              className="hidden"
            />
            <button 
              onClick={() => manualPDFInputRef.current?.click()}
              disabled={isUploadingPDF || isGeneratingManual}
              className="bg-white border border-gray-200 text-gray-500 px-5 py-3 rounded-lg font-black text-[9px] uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {isUploadingPDF ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  Extraindo...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload PDF
                </>
              )}
            </button>
            {!vehicle.manualTranscription && (
              <button 
                onClick={onGenerateManual}
                disabled={isGeneratingManual || isUploadingPDF}
                className="bg-brand-primary text-white px-5 py-3 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-brand-accent transition-all flex items-center gap-2 disabled:opacity-50 shadow-xl shadow-brand-primary/20"
              >
                {isGeneratingManual ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
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

      {!vehicle.manual && !vehicle.manualTranscription ? (
        <div className="text-center py-24 bg-gray-50 rounded-lg border border-dashed border-gray-200">
           <div className="bg-white w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Book size={40} className="text-gray-200" />
            </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-relaxed">
            Você ainda não possui as informações técnicas do manual para este veículo. 
            Use a IA para pesquisar ou faça upload do PDF.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {/* Structured Manual Data in Accordion */}
            
            {/* 1. Resumo/Transcrição Completa */}
            {vehicle.manualTranscription && (
              <AccordionItem
                id="transcription"
                title="Manual Estruturado (Resumo)"
                icon={Sparkles}
                isOpen={activeSection === 'transcription'}
                onToggle={() => handleToggle('transcription')}
                badge="IA"
              >
                <div className="markdown-body prose prose-sm max-w-none prose-brand relative">
                  <Markdown>{vehicle.manualTranscription}</Markdown>
                </div>
              </AccordionItem>
            )}

            {vehicle.manual && (
              <>
                {/* 2. Notas Técnicas (Legendas) */}
                {vehicle.manual.technicalNotes && Object.keys(vehicle.manual.technicalNotes).length > 0 && (
                  <AccordionItem
                    id="notes"
                    title="Notas Técnicas & Condições"
                    icon={Info}
                    isOpen={activeSection === 'notes'}
                    onToggle={() => handleToggle('notes')}
                  >
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(vehicle.manual.technicalNotes).map(([marker, text]) => (
                        <div key={marker} className="flex gap-3 items-start bg-gray-50/50 p-4 rounded-lg border border-gray-100 italic">
                          <span className="font-black text-brand-primary text-sm min-w-[1.5rem] bg-white w-6 h-6 flex items-center justify-center rounded-lg shadow-sm border border-gray-100">{marker}</span>
                          <p className="text-xs text-gray-500 font-medium leading-relaxed">{text}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionItem>
                )}

                {/* 3. Especificações Técnicas */}
                {Object.keys(vehicle.manual.technicalSections || {}).some(k => (vehicle.manual?.technicalSections as any)[k]) && (
                  <AccordionItem
                    id="technical"
                    title="Especificações de Fábrica"
                    icon={FileText}
                    isOpen={activeSection === 'technical'}
                    onToggle={() => handleToggle('technical')}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(vehicle.manual.technicalSections || {}).map(([key, value]) => {
                        if (!value) return null;
                        const labels: { [key: string]: string } = {
                          tirePressure: 'Pressão de Pneus',
                          oilSpecification: 'Óleo & Lubrificação',
                          batteryInfo: 'Sist. Elétrico / Bateria',
                          filterInfo: 'Filtros & Ar',
                          fluidsCapacities: 'Fluidos & Capacidades',
                          fuses: 'Fusíveis e Relés',
                          dashboardSymbols: 'Símbolos do Painel'
                        };
                        
                        return (
                          <div key={key} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm transition-all hover:border-brand-primary/30">
                            <p className="text-[10px] font-black uppercase text-brand-primary tracking-widest mb-2">
                              {labels[key] || key}
                            </p>
                            <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">
                              {value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionItem>
                )}

                {/* 4. Cronograma de Manutenção Programada */}
                {(vehicle.manual.maintenanceSchedule || []).length > 0 && (
                  <AccordionItem
                    id="schedule"
                    title="Plano de Revisão Automático"
                    icon={Calendar}
                    isOpen={activeSection === 'schedule'}
                    onToggle={() => handleToggle('schedule')}
                    badge="KM"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(vehicle.manual.maintenanceSchedule || []).map((schedule: any, idx: number) => (
                        <div key={idx} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm transition-all hover:scale-[1.02] group">
                          <div className="font-black text-brand-primary text-lg mb-2 italic flex items-center gap-2">
                             {schedule.mileage.toLocaleString()} <span className="text-[10px] uppercase font-bold tracking-widest text-gray-300">km</span>
                          </div>
                          <ul className="text-xs text-gray-600 space-y-2 font-medium border-t border-gray-50 pt-3 mt-3">
                            {schedule.items?.map((item: any, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="h-1 w-1 bg-brand-accent rounded-full mt-1.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </AccordionItem>
                )}
              </>
            )}
            <div className="mt-6 flex justify-center">
              <button 
                onClick={onGenerateManual}
                disabled={isGeneratingManual}
                className="px-6 py-3 border border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-all"
              >
                <RefreshCw size={12} className={isGeneratingManual ? "animate-spin" : ""} /> 
                Sincronizar Manual Novamente via Web
              </button>
            </div>
          </div>
          <div className="bg-brand-primary rounded-lg p-8 text-white shadow-2xl flex flex-col h-[680px] lg:h-auto border border-white/5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-accent/10 rounded-lg blur-[60px] group-hover:bg-brand-accent/20 transition-all duration-1000" />
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="bg-brand-accent p-3 rounded-lg shadow-xl shadow-brand-accent/20">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black italic tracking-tighter uppercase leading-none">Mecânico Assistente</h4>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[2px] mt-1">IA Consultiva</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 custom-scrollbar relative z-10">
              {manualChatResponse ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 p-6 rounded-lg border border-white/5 text-sm leading-relaxed"
                >
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                     <span className="text-[9px] font-black uppercase text-brand-accent tracking-widest">IA Sincronizada</span>
                  </div>
                  <div className="markdown-body prose prose-invert prose-xs">
                    <Markdown>{manualChatResponse}</Markdown>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-lg border border-dashed border-white/20 flex items-center justify-center">
                    <Send size={24} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">Faça uma pergunta sobre o manual.<br/>Serei seu especialista de cabeceira.</p>
                </div>
              )}
              {isChattingWithManual && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center py-4"
                >
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-brand-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-brand-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-brand-accent rounded-full animate-bounce"></div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="relative group relative z-10 shrink-0">
              <input 
                type="text" 
                placeholder="Pergunte ao manual..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-5 pr-14 text-sm focus:ring-4 focus:ring-brand-accent/20 outline-none placeholder:text-white/20 transition-all font-medium"
                value={manualChatQuery}
                onChange={(e) => setManualChatQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSendManualChat()}
              />
              <button 
                onClick={onSendManualChat}
                disabled={isChattingWithManual || !manualChatQuery}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-brand-accent text-brand-primary rounded-lg disabled:opacity-50 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-brand-accent/20"
              >
                {isChattingWithManual ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

