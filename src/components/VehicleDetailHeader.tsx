
import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Download, 
  Settings, 
  MessageSquare, 
  RefreshCw, 
  Search, 
  Upload, 
  Zap, 
  Stethoscope, 
  Sparkles, 
  Gauge, 
  Layers,
  Box, 
  ShieldCheck, 
  Calendar, 
  ExternalLink,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Droplets,
  Coins,
  BadgePercent,
  Calculator,
  DollarSign,
  Share2
} from 'lucide-react';
import Markdown from 'react-markdown';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Vehicle, AppData } from '../types';
import { BrandLogo } from './BrandLogo';
import { VehicleImage } from './VehicleImage';

interface VehicleDetailHeaderProps {
  data: AppData;
  selectedVehicle: Vehicle;
  onBack: () => void;
  onExport: () => void;
  onOpenSettings: () => void;
  onShareReport: () => void;
  onUpdateMileage: () => void;
  onSearchLogo: () => void;
  onLogoUpload: () => void;
  onRunHealthAnalysis: () => void;
  isAnalyzingHealth: boolean;
  maintenancePredictions: any[];
  isLoadingPredictions: boolean;
  fuelAnalytics: any;
  fuelInsight: string | null;
  onMarketAnalysis: () => void;
  isAnalyzingMarket: boolean;
  marketAnalysis: string | null;
  onTcoAnalysis: () => void;
  isAnalyzingTco: boolean;
  tcoAnalysis: string | null;
  onGeneratePassport: () => void;
  isGeneratingPassport: boolean;
  digitalPassport: string | null;
  onRefreshPredictions: () => void;
  onOpenDNA: () => void;
  onDiagnose: () => void;
  isDiagnosing: boolean;
  symptomQuery: string;
  setSymptomQuery: (val: string) => void;
  diagnosisResult: string | null;
  setDiagnosisResult: (val: string | null) => void;
  predictCurrentMileage: (v: Vehicle) => number;
  formatDistance: (val: number) => string;
  getDistanceUnit: () => string;
  formatCurrency: (val: number) => string;
  getVehicleHealth: () => number;
  getMaintenanceScore: () => number;
  isUpdatingFipe: boolean;
  onUpdateFipe: () => void;
  marketRef: string;
}

export const VehicleDetailHeader: React.FC<VehicleDetailHeaderProps> = ({
  data,
  selectedVehicle,
  onBack,
  onExport,
  onOpenSettings,
  onShareReport,
  onUpdateMileage,
  onSearchLogo,
  onLogoUpload,
  onRunHealthAnalysis,
  isAnalyzingHealth,
  maintenancePredictions,
  isLoadingPredictions,
  fuelAnalytics,
  fuelInsight,
  onMarketAnalysis,
  isAnalyzingMarket,
  marketAnalysis,
  onTcoAnalysis,
  isAnalyzingTco,
  tcoAnalysis,
  onGeneratePassport,
  isGeneratingPassport,
  digitalPassport,
  onRefreshPredictions,
  onOpenDNA,
  onDiagnose,
  isDiagnosing,
  symptomQuery,
  setSymptomQuery,
  diagnosisResult,
  setDiagnosisResult,
  predictCurrentMileage,
  formatDistance,
  getDistanceUnit,
  formatCurrency,
  getVehicleHealth,
  getMaintenanceScore,
  isUpdatingFipe,
  onUpdateFipe,
  marketRef
}) => {
  const [activeTechnicalSection, setActiveTechnicalSection] = React.useState<string | null>('agenda');

  const technicalSections = [
    { 
      id: 'agenda', 
      title: 'Agenda Preditiva IA', 
      icon: Calendar,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {maintenancePredictions.length > 0 ? maintenancePredictions.map((pred, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-white/5 p-6 rounded-xl group hover:border-brand-accent transition-all cursor-default text-left"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                  pred.priority === 'Alta' ? 'bg-red-600' : 
                  pred.priority === 'Média' ? 'bg-orange-600' : 'bg-brand-accent'
                } text-white`}>
                  {pred.priority}
                </span>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{pred.estimatedDate}</p>
              </div>
              <h4 className="text-sm font-black text-white uppercase mb-2 line-clamp-1 italic">{pred.item}</h4>
              <p className="text-xs text-brand-accent font-black uppercase tracking-tighter mb-4 italic">~ {pred.daysLeft} Dias</p>
              
              <a 
                href={`https://lista.mercadolivre.com.br/${pred.item.replace(/\s+/g, '-')}-${selectedVehicle?.name || ''}-${selectedVehicle?.model || ''}-${String(selectedVehicle?.year || '').split('/')[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-zinc-950 text-[10px] font-black uppercase rounded-lg transition-all hover:bg-zinc-100"
              >
                <ExternalLink size={14} /> Comprar OEM
              </a>
            </motion.div>
          )) : (
            !isLoadingPredictions && <p className="text-xs text-gray-500 italic col-span-3 text-center py-8">Nenhuma previsão disponível para este perfil.</p>
          )}
        </div>
      )
    },
    {
      id: 'telemetry',
      title: 'Eficiência e Telemetria',
      icon: BarChart3,
      content: fuelAnalytics && fuelAnalytics.data.length > 0 ? (
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-left">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="text-green-400" size={14} />
                <p className="text-[9px] text-gray-500 font-black uppercase">Consumo Médio</p>
              </div>
              <p className="text-xl font-black text-white">{fuelAnalytics.avgKmL} <span className="text-[10px] text-gray-500">{getDistanceUnit().toLowerCase()}/km</span></p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-left">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="text-blue-400" size={14} />
                <p className="text-[9px] text-gray-500 font-black uppercase">Custo por {getDistanceUnit()}</p>
              </div>
              <p className="text-xl font-black text-white">{formatCurrency(Number(fuelAnalytics.avgCostKm))}</p>
            </div>
            <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-xl group text-left">
              <p className="text-[8px] text-brand-primary font-black uppercase mb-1">Status de Combustão</p>
              <p className="text-[10px] text-gray-300 font-bold leading-tight italic">
                {fuelInsight || "Calculando eficiência energética..."}
              </p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fuelAnalytics.data}>
                <defs>
                  <linearGradient id="colorKmL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBFF00" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FBFF00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="date" stroke="#555" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#555" fontSize={9} tickLine={false} axisLine={false} unit=" km/L" />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '10px' }} />
                <Area type="monotone" dataKey="kmL" stroke="#FBFF00" strokeWidth={2} fillOpacity={1} fill="url(#colorKmL)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : <p className="text-[10px] text-zinc-500 italic pt-4">Dados de telemetria insuficientes.</p>
    },
    {
      id: 'market',
      title: 'Estratégia de Negociação IA',
      icon: Coins,
      content: (
        <div className="pt-4 text-left">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <p className="text-sm text-gray-400 font-bold max-w-md">Argumentação de venda baseada em dados reais e saúde do veículo.</p>
              <button
                onClick={onMarketAnalysis}
                disabled={isAnalyzingMarket}
                className="px-6 py-3 bg-brand-primary border border-brand-accent/30 text-white rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-zinc-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAnalyzingMarket ? <RefreshCw className="animate-spin" size={14} /> : <>Analisar Revenda <Coins size={14} /></>}
              </button>
            </div>
            {marketAnalysis && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black/20 p-5 rounded-lg border border-white/5">
                <div className="markdown-body text-xs text-gray-200 leading-relaxed"><Markdown>{marketAnalysis}</Markdown></div>
              </motion.div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'tco',
      title: 'Finanças & TCO',
      icon: Calculator,
      content: (
        <div className="pt-4 text-left">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500 font-bold italic">Custo por KM real consolidado.</p>
              <button onClick={onTcoAnalysis} disabled={isAnalyzingTco} className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20">
                {isAnalyzingTco ? 'Analisando...' : 'Gerar TCO'}
              </button>
            </div>
            {tcoAnalysis && (
              <div className="bg-black/20 p-4 rounded-lg border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="markdown-body text-xs text-gray-300"><Markdown>{tcoAnalysis}</Markdown></div>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'passport',
      title: 'Passaporte IA (Certificado)',
      icon: ShieldCheck,
      content: (
        <div className="pt-4 text-left">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500 font-bold italic">Selo de procedência digital FleetX.</p>
              <button onClick={onGeneratePassport} disabled={isGeneratingPassport} className="text-[9px] font-black uppercase bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20">
                {isGeneratingPassport ? 'Gerando...' : 'Ver Certificado'}
              </button>
            </div>
            {digitalPassport && (
              <div className="bg-black/20 p-4 rounded-lg border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="markdown-body text-xs text-gray-300"><Markdown>{digitalPassport}</Markdown></div>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'mechanic',
      title: 'Ouvir o Carro (IA)',
      icon: Stethoscope,
      content: (
        <div className="pt-4 text-left">
          <div className="bg-brand-accent p-6 rounded-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input 
                type="text"
                placeholder="Descreva o sintoma..."
                className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg px-5 py-3 text-white placeholder:text-zinc-200 focus:outline-none focus:border-white transition-all font-bold text-sm"
                value={symptomQuery}
                onChange={(e) => setSymptomQuery(e.target.value)}
              />
              <button
                onClick={onDiagnose}
                disabled={isDiagnosing || !symptomQuery}
                className="bg-white text-brand-accent px-6 py-3 rounded-lg font-black uppercase italic tracking-tighter disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg text-[10px]"
              >
                {isDiagnosing ? <RefreshCw className="animate-spin" size={14} /> : <>Diagnóstico IA <Sparkles size={14} /></>}
              </button>
            </div>
            {diagnosisResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-zinc-950 p-6 rounded-lg border border-white/10">
                <div className="markdown-body text-xs text-zinc-200 shadow-inner"><Markdown>{diagnosisResult}</Markdown></div>
              </motion.div>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-2 relative overflow-hidden w-full">
      {/* Breadcrumbs / Back and Actions Area */}
      <div className="flex flex-col gap-4 mb-6 px-2">
        {/* Linha 1: Navegação e Gestão (Export/Settings) */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-black text-brand-primary hover:text-brand-accent transition-colors uppercase tracking-widest"
            id="back-btn"
          >
            <ArrowLeft size={18} /> 
            <span className="truncate sm:block">Voltar para Garagem</span>
          </button>
          
          {/* Botão de Acesso Rápido: DNA Estrutural */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenDNA}
            className="hidden md:flex items-center gap-3 px-6 py-2.5 bg-brand-primary text-white rounded-2xl hover:bg-brand-accent transition-all group shadow-xl border-2 border-brand-primary"
          >
            <div className="bg-brand-accent p-1.5 rounded-xl">
              <Layers size={14} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-tighter leading-none mb-0.5">DNA Estrutural</p>
              <p className="text-[9px] text-zinc-400 font-bold leading-none">Estrutura & Estética</p>
            </div>
          </motion.button>

          <div className="flex items-center gap-3">
            <button 
              onClick={onExport}
              className="p-3 hover:text-white hover:bg-zinc-950 transition-all text-brand-primary bg-white rounded-2xl border-2 border-zinc-950 flex items-center justify-center shadow-lg"
              title="Exportar Dados (.json)"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={onOpenSettings}
              className="p-3 hover:text-white hover:bg-zinc-950 transition-all text-brand-primary bg-white rounded-2xl border-2 border-zinc-950 flex items-center justify-center shadow-lg"
              title="Configuração do Veículo"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Linha 2: Ações Profissionais e Compartilhamento (50/50) */}
        <div className="flex gap-3 w-full">
          <button 
            onClick={onShareReport}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-all rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md"
            title="Gerar Relatório Técnico"
          >
            <MessageSquare size={14} className="shrink-0" /> 
            <span>Relatório</span>
          </button>
          <button 
            onClick={() => {
               const text = encodeURIComponent(`Olá! Sou proprietário do ${selectedVehicle.name} (${selectedVehicle.plate}) e gostaria de compartilhar o histórico de manutenção do meu veículo com você para uma análise técnica.`);
               window.open(`https://wa.me/?text=${text}`, '_blank');
               alert('O WhatsApp será aberto. Lembre-se de anexar o arquivo de backup (.json) que você exportou para que o mecânico possa importar no sistema dele!');
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary text-white hover:bg-zinc-900 transition-all rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md"
          >
            <Share2 size={14} className="shrink-0" /> 
            <span>Enviar</span>
          </button>
        </div>
      </div>

      {/* Vehicle Detail Header */}
      <div 
        style={{ backgroundColor: 'var(--color-vehicle-header-bg)' }}
        className="text-white relative overflow-hidden mb-4 rounded-xl shadow-xl transition-all duration-300 flex flex-col items-center justify-center py-12"
      >
         <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-brand-accent text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.2em] shadow-lg shadow-brand-accent/20">Protocolo Ativo</span>
            <span className="text-zinc-500 text-[10px] font-black tracking-widest truncate max-w-[120px]">VIN: {selectedVehicle.id.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className="w-full relative group">
              {predictCurrentMileage(selectedVehicle) > selectedVehicle.mileage + 100 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-auto sm:min-w-[280px]"
                >
                  <div className="bg-brand-primary text-white p-3 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl animate-pulse">
                        <RefreshCw size={16} />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Sincronizar Odômetro?</p>
                        <p className="text-[9px] text-white/80 font-medium">IA estima que você rodou +{Math.round(predictCurrentMileage(selectedVehicle) - selectedVehicle.mileage)} {getDistanceUnit()}.</p>
                      </div>
                    </div>
                    <button 
                      onClick={onUpdateMileage}
                      className="bg-white text-brand-primary px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-brand-accent hover:text-white transition-all shadow-lg shrink-0"
                    >
                      Sincronizar
                    </button>
                  </div>
                </motion.div>
              )}
              
              <motion.div className="transition-transform duration-300 pointer-events-none flex items-center justify-center">
                <VehicleImage 
                  src={selectedVehicle.imageUrl} 
                  alt={selectedVehicle.name} 
                  className="w-auto h-[180px]" 
                />
              </motion.div>
            </div>

          <div className="flex flex-col items-center gap-2 mb-6 w-full">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-3 w-full px-4">
              <div className="relative group shrink-0">
                <BrandLogo 
                  vehicleName={selectedVehicle.name} 
                  brandLogoUrl={selectedVehicle.brandLogoUrl}
                  className="w-16 h-16 rounded-lg shadow-xl border-2 border-white/10"
                />
              </div>
              <div className="flex flex-col text-center md:text-left overflow-hidden w-full">
                <p className="text-[10px] font-black uppercase text-brand-accent tracking-[0.2em] mb-1 flex items-center justify-center md:justify-start gap-2">
                  <Zap size={12} className="fill-brand-accent" /> {selectedVehicle.drivingStyle === 'smooth' ? 'Eco-Precise' : selectedVehicle.drivingStyle === 'aggressive' ? 'Sport-Dynamic' : 'Balanced-Load'}
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter italic uppercase underline decoration-brand-accent decoration-4 underline-offset-[8px] truncate">{selectedVehicle.name}</h2>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-lg sm:text-xl text-zinc-400 font-black uppercase tracking-[0.1em] italic truncate max-w-full px-4">{selectedVehicle.model} — {selectedVehicle.year}</p>
              
              {/* Health Indicator Widget */}
              <div className="flex items-center gap-3 mt-1">
                <button 
                  onClick={onRunHealthAnalysis}
                  disabled={isAnalyzingHealth}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                    selectedVehicle.healthScore 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                      : 'bg-brand-accent/20 border-brand-accent/30 hover:scale-105'
                  }`}
                >
                  {isAnalyzingHealth ? (
                    <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ShieldCheck size={16} className={selectedVehicle.healthScore ? 'text-green-400' : 'text-brand-accent'} />
                  )}
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Status de Saúde</p>
                    <p className="text-xs font-black text-white">
                      {selectedVehicle.healthScore ? `${selectedVehicle.healthScore}%` : 'Analisar agora'}
                    </p>
                  </div>
                </button>

                {(selectedVehicle.version || selectedVehicle.engine) && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {selectedVehicle.version && (
                      <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-2 py-1 rounded-lg font-black uppercase tracking-wider">{selectedVehicle.version}</span>
                    )}
                    {selectedVehicle.engine && (
                      <span className="text-[10px] bg-brand-accent/20 text-brand-accent px-2 py-1 rounded-lg font-black uppercase tracking-wider">{selectedVehicle.engine}</span>
                    )}
                  </div>
                )}
              </div>

              {selectedVehicle.healthAnalysis && (
                <div className="max-w-md bg-green-500/10 border border-green-500/20 p-3 rounded-2xl mb-4 relative text-center">
                  <p className="text-[11px] text-green-200/80 leading-relaxed font-medium italic">
                    "{selectedVehicle.healthAnalysis}"
                  </p>
                  <div className="absolute -top-2 -left-2 bg-green-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-lg">IA Insight</div>
                </div>
              )}

              {/* Informative Stats Cards - Moved here for better visibility */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full mb-6 max-w-4xl mx-auto px-4">
                <div className="bg-white border border-zinc-100 p-4 rounded-xl text-left shadow-sm overflow-hidden">
                  <p className="text-zinc-400 text-[9px] uppercase font-black tracking-widest mb-1.5 truncate">Engenharia</p>
                  <p className="text-xl sm:text-2xl font-black italic tracking-tighter text-brand-primary truncate">{selectedVehicle.parts?.length || 0}</p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase truncate">Itens</p>
                </div>
                <div className="bg-white border border-zinc-100 p-4 rounded-xl relative group text-left shadow-sm overflow-hidden">
                  <p className="text-zinc-400 text-[9px] uppercase font-black tracking-widest mb-1.5 truncate">
                    Odômetro IA
                  </p>
                  <div className="flex items-baseline gap-0.5 truncate">
                    <p className="text-xl sm:text-2xl font-black italic tracking-tighter text-brand-primary truncate">{predictCurrentMileage(selectedVehicle).toLocaleString()}</p>
                    <span className="text-[10px] text-brand-accent font-black uppercase">{getDistanceUnit()}</span>
                  </div>
                </div>
                <div className="bg-white border border-zinc-100 p-4 rounded-xl text-left shadow-sm overflow-hidden">
                  <p className="text-zinc-400 text-[9px] uppercase font-black tracking-widest mb-1.5 truncate">Consumo Global</p>
                  <p className="text-xl sm:text-2xl font-black italic tracking-tighter text-brand-accent truncate">
                    {(() => {
                      const logs = [...(selectedVehicle.fuelLogs || [])].sort((a, b) => a.mileage - b.mileage);
                      if (logs.length < 2) return '--';
                      const totalKm = logs[logs.length - 1].mileage - logs[0].mileage;
                      const totalL = logs.slice(1).reduce((sum, l) => sum + l.liters, 0);
                      return totalL > 0 ? (totalKm / totalL).toFixed(1) : '--';
                    })()}
                  </p>
                  <p className="text-[9px] text-brand-accent font-bold uppercase truncate">Km / Litro</p>
                </div>
                <div className="bg-white border border-zinc-100 p-4 rounded-xl text-left shadow-sm overflow-hidden">
                  <p className="text-zinc-400 text-[9px] uppercase font-black tracking-widest mb-1.5 truncate">Saúde Estrutural</p>
                  <p className={`text-xl sm:text-2xl font-black italic tracking-tighter truncate ${getVehicleHealth() > 80 ? 'text-emerald-500' : getVehicleHealth() > 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {Math.round(getVehicleHealth())}%
                  </p>
                </div>
                <div className="bg-white border border-zinc-100 p-4 rounded-xl text-left shadow-sm overflow-hidden">
                  <p className="text-zinc-400 text-[9px] uppercase font-black tracking-widest mb-1.5 truncate">Valorização</p>
                  <div className="flex items-center gap-1.5 truncate">
                     <p className="text-xl sm:text-2xl font-black italic tracking-tighter text-brand-primary truncate">
                       {getMaintenanceScore()}%
                     </p>
                     <span className="bg-brand-accent text-white text-[7px] font-black px-1 py-0.5 rounded-full uppercase">GOLD</span>
                  </div>
                </div>
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  onClick={onUpdateFipe}
                  className="bg-white border border-zinc-100 p-4 rounded-xl cursor-pointer hover:border-brand-accent transition-all text-left shadow-sm group overflow-hidden"
                >
                  <p className="text-zinc-400 text-[9px] uppercase font-black tracking-widest mb-1.5 flex justify-between items-center truncate">
                    <span className="truncate">{marketRef}</span>
                    <RefreshCw size={10} className={isUpdatingFipe ? "animate-spin text-brand-accent shrink-0" : "text-zinc-300 group-hover:text-brand-accent shrink-0"} />
                  </p>
                  <div className="flex items-center gap-2 truncate">
                     <p className="text-base sm:text-xl font-black italic tracking-tighter text-emerald-600 truncate">
                       {formatCurrency(selectedVehicle.fipeValue || 0)}
                     </p>
                  </div>
                </motion.div>
              </div>

              {/* Health Progress Bar - Moved here to accompany structural health card */}
              <div className="w-full max-w-4xl mb-8 mx-auto px-4">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getVehicleHealth()}%` }}
                    className={`h-full rounded-full ${getVehicleHealth() > 80 ? 'bg-green-500' : getVehicleHealth() > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ boxShadow: '0 0 15px rgba(0,0,0,0.5)' }}
                  />
                </div>
              </div>

              {/* Tech Glossary Accordion */}
              <div className="w-full max-w-4xl space-y-2 mt-6">
                 {technicalSections.map((section) => (
                   <div 
                     key={section.id} 
                     className="bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden transition-all duration-300"
                   >
                     <button 
                       onClick={() => setActiveTechnicalSection(activeTechnicalSection === section.id ? null : section.id)}
                       className={`w-full flex items-center justify-between p-5 text-left transition-colors ${activeTechnicalSection === section.id ? 'bg-white/5' : 'hover:bg-white/5'}`}
                     >
                       <div className="flex items-center gap-4">
                         <div className={`p-2 rounded-lg ${activeTechnicalSection === section.id ? 'bg-brand-accent text-white' : 'bg-white/5 text-zinc-500'}`}>
                           <section.icon size={18} />
                         </div>
                         <h3 className={`text-sm font-black uppercase italic tracking-tighter ${activeTechnicalSection === section.id ? 'text-white' : 'text-zinc-500'}`}>
                           {section.title}
                         </h3>
                       </div>
                       <motion.div 
                         animate={{ rotate: activeTechnicalSection === section.id ? 180 : 0 }}
                         className="text-zinc-600"
                       >
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                       </motion.div>
                     </button>
                     
                     <motion.div 
                       initial={false}
                       animate={{ 
                         height: activeTechnicalSection === section.id ? 'auto' : 0,
                         opacity: activeTechnicalSection === section.id ? 1 : 0
                       }}
                       transition={{ duration: 0.3, ease: 'easeInOut' }}
                       className="overflow-hidden"
                     >
                        <div className="p-5 border-t border-white/5">
                          {section.content}
                        </div>
                     </motion.div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-accent/10 rounded-full -ml-32 -mt-32 blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full -mr-32 -mb-32 blur-[100px]"></div>
    </div>
  );
};
