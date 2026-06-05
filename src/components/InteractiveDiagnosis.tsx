import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Activity, 
  X, 
  Loader2, 
  Copy, 
  Check,
  Info
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Vehicle } from '../types';
import { geminiService } from '../services/geminiService';

interface Cause {
  name: string;
  description: string;
  severity: 'Baixo' | 'Médio' | 'Crítico' | string;
}

interface ParsedDiagnosis {
  markdown: string;
  causes: Cause[];
}

interface InteractiveDiagnosisProps {
  diagnosisResult: string | null;
  vehicle: Vehicle;
  symptomQuery: string;
}

export const InteractiveDiagnosis: React.FC<InteractiveDiagnosisProps> = ({
  diagnosisResult,
  vehicle,
  symptomQuery
}) => {
  const [parsedData, setParsedData] = useState<ParsedDiagnosis | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState<Cause | null>(null);
  const [verificationGuide, setVerificationGuide] = useState<string | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse the structured diagnosis JSON or treat as pure markdown
  useEffect(() => {
    if (!diagnosisResult) {
      setParsedData(null);
      return;
    }

    const trimmed = diagnosisResult.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed) as ParsedDiagnosis;
        if (parsed && typeof parsed === 'object' && parsed.markdown) {
          setParsedData(parsed);
          return;
        }
      } catch (e) {
        console.error("Erro ao analisar JSON de diagnóstico, usando fallback de texto puro:", e);
      }
    }

    // Fallback: If it's not a JSON, treat the whole string as markdown narrative 
    // and try to heuristically extract some common general issues to clickable list for extra resilience
    const heuristicCauses: Cause[] = [];
    const lines = trimmed.split('\n');
    let causeCount = 0;
    
    for (const line of lines) {
      // Find bullet points that look like potential causes
      if (causeCount < 4 && (line.startsWith('*') || line.startsWith('-') || /^\d+\./.test(line.trim()))) {
        const text = line.replace(/^[\s*\-\d\.]+/g, '').trim();
        if (text.length > 10 && text.length < 100 && !text.toLowerCase().includes('urgência') && !text.toLowerCase().includes('recomenda')) {
          heuristicCauses.push({
            name: text,
            description: "Causa potencial detectada a partir da análise inteligente.",
            severity: causeCount === 0 ? "Crítico" : causeCount === 1 ? "Médio" : "Baixo"
          });
          causeCount++;
        }
      }
    }

    setParsedData({
      markdown: diagnosisResult,
      causes: heuristicCauses.length > 0 ? heuristicCauses : [
        { name: "Verificação Geral de Linha de Alimentação", description: "Verifique relés, fiação e conexões físicas.", severity: "Médio" },
        { name: "Análise de Sensores Ativos", description: "Avalie códigos de falha armazenados na ECU.", severity: "Crítico" }
      ]
    });
  }, [diagnosisResult]);

  const handleOpenGuide = async (cause: Cause) => {
    setSelectedCause(cause);
    setIsModalOpen(true);
    setIsLoadingGuide(true);
    setVerificationGuide(null);
    setCopied(false);

    try {
      const guide = await geminiService.getVerificationGuide(
        vehicle,
        symptomQuery || "Sintoma não especificado anteriormente",
        cause.name
      );
      setVerificationGuide(guide);
    } catch (error) {
      console.error(error);
      setVerificationGuide("### ⚠️ Erro de Carregamento\nNão foi possível obter o manual de testes passo a passo. Por favor, tente novamente mais tarde.");
    } finally {
      setIsLoadingGuide(false);
    }
  };

  const handleCopy = async () => {
    if (!verificationGuide) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(verificationGuide);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      throw new Error("Clipboard API not found");
    } catch (e) {
      console.warn("Clipboard access denied or unavailable in sandbox, trying fallback:", e);
      try {
        const textArea = document.createElement("textarea");
        textArea.value = verificationGuide;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          console.error("execCommand copy returned false");
        }
      } catch (err) {
        console.error("Complete fallback copy failed:", err);
      }
    }
  };

  if (!diagnosisResult) return null;

  const markdownContent = parsedData?.markdown || diagnosisResult;
  const causesList = parsedData?.causes || [];

  return (
    <div className="space-y-6">
      {/* Narrative Section */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 text-zinc-800">
        <h4 className="text-xs font-black text-brand-primary uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity size={14} className="text-brand-accent animate-pulse" />
          Diagnóstico do Especialista IA
        </h4>
        <div className="markdown-body text-xs leading-relaxed max-w-none text-left">
          <Markdown>{markdownContent}</Markdown>
        </div>
      </div>

      {/* Clickable Causes Dashboard */}
      {causesList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-brand-accent rounded"></span>
            <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
              Análise de Falhas (Clique na causa para ver o manual passo a passo de teste)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {causesList.map((cause, idx) => {
              const isHigh = cause.severity?.toLowerCase() === 'crítico' || cause.severity?.toLowerCase() === 'critico' || cause.severity?.toLowerCase() === 'alto';
              const isMedium = cause.severity?.toLowerCase() === 'médio' || cause.severity?.toLowerCase() === 'medio';
              
              const severityColor = isHigh 
                ? 'bg-rose-50 border-rose-950/20 text-rose-700 hover:border-rose-600' 
                : isMedium 
                  ? 'bg-amber-50 border-amber-950/20 text-amber-800 hover:border-amber-500' 
                  : 'bg-blue-50 border-blue-950/10 text-blue-800 hover:border-blue-500';

              const badgeColor = isHigh 
                ? 'bg-rose-600 text-white' 
                : isMedium 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-blue-600 text-white';

              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleOpenGuide(cause)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group ${severityColor}`}
                  id={`cause-card-${idx}`}
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${badgeColor}`}>
                      {cause.severity}
                    </span>
                    <Wrench size={14} className="opacity-40 group-hover:opacity-100 group-hover:text-zinc-900 transition-opacity" />
                  </div>
                  
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-black uppercase tracking-tight text-zinc-950 group-hover:underline italic">
                      {cause.name}
                    </h5>
                    <p className="text-[10px] text-zinc-600 font-medium leading-relaxed group-hover:text-zinc-900 line-clamp-2">
                      {cause.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-950/5 flex items-center justify-between w-full">
                    <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 group-focus:underline">
                      Abrir Instruções Técnicas
                    </span>
                    <span className="text-[10px] font-black">→</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Verification Guide Overlay Dialog / Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCause && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl border-2 border-zinc-950 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
              id="verification-guide-modal"
            >
              {/* Modal Header */}
              <div className="bg-zinc-950 text-white px-6 py-5 flex items-center justify-between shrink-0 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-accent rounded-xl text-white">
                    <Wrench size={18} className="animate-spin-slow" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em]">Guia de Teste e Calibração IA</p>
                    <h3 className="text-xs sm:text-sm font-black uppercase italic tracking-tighter truncate max-w-[280px] sm:max-w-[420px]">
                      {selectedCause.name}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Informative Sub-banner highlighting the targeted vehicle */}
              <div className="bg-brand-primary p-3 px-6 text-zinc-200 text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-2 justify-between">
                <span className="flex items-center gap-1.5 truncate">
                  <Info size={12} className="text-brand-accent" />
                  Alvo: {vehicle.name} {vehicle.model} ({vehicle.year}) • {vehicle.mileage} KM
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                  selectedCause.severity === 'Crítico' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-zinc-950'
                }`}>
                  Severidade: {selectedCause.severity}
                </span>
              </div>

              {/* Modal Body / Guide Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-left custom-scrollbar">
                {isLoadingGuide ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <Loader2 size={36} className="text-brand-accent animate-spin" />
                    <div className="space-y-1 max-w-sm">
                      <p className="text-xs font-black text-zinc-950 uppercase tracking-widest">Compilando Dados Técnicos...</p>
                      <p className="text-[11px] text-zinc-500">
                        O Mecânico IA está traçando a localização das partes sob o capô do seu {vehicle.name} de ano {yearOf(vehicle.year)} e estruturando o melhor protocolo de teste. Isso economizará seu tempo e dinheiro!
                      </p>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-sm max-w-none space-y-6 text-zinc-800"
                  >
                    <div className="markdown-body text-xs md:text-sm leading-relaxed text-zinc-800">
                      <Markdown>{verificationGuide || ""}</Markdown>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-zinc-200 px-6 py-4 bg-zinc-50 shrink-0 flex justify-between items-center">
                <p className="text-[9px] text-zinc-400 font-extrabold italic hidden sm:block">
                  *Atenção: tome precauções de segurança ao manipular componentes quentes ou energizados.
                </p>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={handleCopy}
                    disabled={isLoadingGuide || !verificationGuide}
                    className="px-4 py-2 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-700 hover:text-zinc-900 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {copied ? <Check size={12} className="text-emerald-600 animate-bounce" /> : <Copy size={12} />}
                    {copied ? "Copiado!" : "Copiar Guia"}
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 bg-zinc-950 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-md"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple utility to normalize/clean year displaying
function yearOf(yearInput: any): string {
  const years = String(yearInput || '').split('/');
  return years[0] || 'Atual';
}
