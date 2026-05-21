
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
import { Vehicle } from '../types';
import { BrandLogo } from './BrandLogo';
import { VehicleImage } from './VehicleImage';

interface VehicleDetailHeaderProps {
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
  return (
    <div className="space-y-2">
      {/* Breadcrumbs / Back and Actions Area */}
      <div className="flex flex-col gap-4 mb-6 px-2">
        {/* Linha 1: Navegação e Gestão (Export/Settings) */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-accent transition-colors"
            id="back-btn"
          >
            <ArrowLeft size={16} /> 
            <span className="truncate sm:block">Voltar</span>
            <span className="hidden sm:inline opacity-60">para Veículos</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onExport}
              className="p-2 hover:text-brand-accent hover:bg-white/10 transition-all text-gray-500 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center"
              title="Exportar Dados (.json)"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={onOpenSettings}
              className="p-2 hover:text-brand-accent hover:bg-white/10 transition-all text-gray-500 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center"
              title="Configuração do Veículo"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Linha 2: Ações Profissionais e Compartilhamento (50/50) */}
        <div className="flex gap-2 w-full">
          <button 
            onClick={onShareReport}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/20 shadow-sm overflow-hidden"
            title="Gerar Relatório Técnico"
          >
            <MessageSquare size={14} className="shrink-0" /> 
            <span className="truncate">Relatório Técnico</span>
          </button>
          <button 
            onClick={() => {
               const text = encodeURIComponent(`Olá! Sou proprietário do ${selectedVehicle.name} (${selectedVehicle.plate}) e gostaria de compartilhar o histórico de manutenção do meu veículo com você para uma análise técnica.`);
               window.open(`https://wa.me/?text=${text}`, '_blank');
               // Instrução para anexar o arquivo .json
               alert('O WhatsApp será aberto. Lembre-se de anexar o arquivo de backup (.json) que você exportou para que o mecânico possa importar no sistema dele!');
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-primary/20 shadow-sm overflow-hidden"
          >
            <Share2 size={14} className="shrink-0" /> 
            <span className="truncate">Enviar Mecânico</span>
          </button>
        </div>
      </div>

      {/* Vehicle Detail Header */}
      <div className="glass-dark text-white p-6 md:p-8 relative overflow-hidden mb-2 rounded-3xl">
         <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-brand-accent text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Active System</span>
            <span className="text-gray-500 text-[10px] font-mono">VIN: {selectedVehicle.id.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className="w-full max-w-[540px] mb-2 relative overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] ring-4 ring-white/20">
            {predictCurrentMileage(selectedVehicle) > selectedVehicle.mileage + 100 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-auto sm:min-w-[280px]"
              >
                <div className="bg-brand-primary text-white p-3 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md flex items-center justify-between gap-4 overflow-hidden relative">
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
            
            <VehicleImage 
              src={selectedVehicle.imageUrl} 
              alt={selectedVehicle.name} 
              className="aspect-video" 
            />
          </div>

          <div className="flex flex-col items-center gap-1 mb-2">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="relative group">
                <BrandLogo 
                  vehicleName={selectedVehicle.name} 
                  brandLogoUrl={selectedVehicle.brandLogoUrl}
                  className="w-16 h-16 rounded-2xl shadow-xl border-2 border-white/20"
                />
                <div className="absolute -right-2 -bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={onSearchLogo}
                    className="bg-brand-primary text-white p-1.5 rounded-lg shadow-lg hover:bg-brand-accent transition-all"
                    title="Pesquisar Logo Original"
                  >
                    <Search size={10} />
                  </button>
                  <button 
                    onClick={onLogoUpload}
                    className="bg-white text-brand-primary p-1.5 rounded-lg shadow-lg hover:bg-gray-100 transition-all border border-gray-200"
                    title="Upload de Logo Manual"
                  >
                    <Upload size={10} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col text-left">
                <p className="text-[10px] font-black uppercase text-brand-primary/60 tracking-widest mb-1 flex items-center gap-1.5">
                  <Zap size={10} className="text-brand-accent" /> Perfil: {selectedVehicle.drivingStyle === 'smooth' ? 'Motorista Pé Leve' : selectedVehicle.drivingStyle === 'aggressive' ? 'Perfil Esportivo' : 'Motorista Equilibrado'}
                </p>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase underline decoration-brand-accent/50 underline-offset-8 decoration-4">{selectedVehicle.name}</h2>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-lg text-gray-400 font-bold opacity-80">{selectedVehicle.model} — {selectedVehicle.year}</p>
              
              {/* Health Indicator Widget */}
              <div className="flex items-center gap-4 mt-2 mb-1">
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

              {/* Predictive Agenda */}
              <div className="w-full max-w-4xl mb-6">
                <div className="flex items-center justify-between mb-4 px-2">
                   <div className="flex items-center gap-2">
                    <Calendar className="text-brand-accent" size={20} />
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter text-left">Agenda Preditiva IA</h3>
                   </div>
                   <div className="flex items-center gap-3">
                     {isLoadingPredictions ? (
                       <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                     ) : (
                       <button 
                         onClick={onRefreshPredictions}
                         className="text-[10px] font-black uppercase text-brand-accent hover:text-white transition-colors bg-brand-accent/10 px-3 py-1 rounded-lg border border-brand-accent/20 flex items-center gap-2"
                       >
                         <RefreshCw size={12} /> Atualizar IA
                       </button>
                     )}
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {maintenancePredictions.length > 0 ? maintenancePredictions.map((pred, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 border border-white/10 p-4 rounded-2xl group hover:border-brand-accent/50 transition-all cursor-default text-left"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                          pred.priority === 'Alta' ? 'bg-red-500 text-white' : 
                          pred.priority === 'Média' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {pred.priority}
                        </span>
                        <p className="text-[10px] text-gray-500 font-bold">{pred.estimatedDate}</p>
                      </div>
                      <h4 className="text-sm font-black text-white uppercase mb-1 line-clamp-1">{pred.item}</h4>
                      <p className="text-xs text-brand-accent font-bold mb-3">~ {pred.daysLeft} dias restantes</p>
                      
                      <a 
                        href={`https://lista.mercadolivre.com.br/${pred.item.replace(/\s+/g, '-')}-${selectedVehicle?.name || ''}-${selectedVehicle?.model || ''}-${String(selectedVehicle?.year || '').split('/')[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-brand-primary text-[10px] font-black uppercase rounded-xl transition-colors"
                      >
                        <ExternalLink size={12} /> Comprar Peças
                      </a>
                    </motion.div>
                  )) : (
                    !isLoadingPredictions && <p className="text-xs text-gray-500 italic col-span-3 text-center">Nenhuma previsão disponível para este perfil.</p>
                  )}
                </div>
              </div>

              {/* Fuel Analytics Dashboard */}
              {fuelAnalytics && fuelAnalytics.data.length > 0 && (
                <div className="w-full max-w-4xl mb-6">
                   <div className="flex items-center gap-2 mb-4 px-2">
                    <BarChart3 className="text-brand-accent" size={20} />
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter text-left">Eficiência e Telemetria</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="text-green-400" size={14} />
                          <p className="text-[10px] text-gray-500 font-black uppercase">Consumo Médio</p>
                        </div>
                        <p className="text-2xl font-black text-white">{fuelAnalytics.avgKmL} <span className="text-xs text-gray-500">{getDistanceUnit().toLowerCase()}/km</span></p>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="text-blue-400" size={14} />
                          <p className="text-[10px] text-gray-500 font-black uppercase">Custo por {getDistanceUnit()}</p>
                        </div>
                        <p className="text-2xl font-black text-white">{formatCurrency(Number(fuelAnalytics.avgCostKm))}</p>
                      </div>
                      <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-2xl relative overflow-hidden group text-left">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                          <Droplets size={48} className="text-brand-primary" />
                        </div>
                        <p className="text-[9px] text-brand-primary font-black uppercase mb-1">Status de Combustão</p>
                        <p className="text-[11px] text-gray-300 font-bold leading-tight italic">
                          {fuelInsight || "Calculando eficiência energética..."}
                        </p>
                      </div>
                   </div>

                   <div className="bg-white/5 border border-white/10 p-6 rounded-3xl h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={fuelAnalytics.data}>
                          <defs>
                            <linearGradient id="colorKmL" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FBFF00" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#FBFF00" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#555" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fontWeight: 'bold' }}
                          />
                          <YAxis 
                            stroke="#555" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            unit=" km/L"
                            domain={['dataMin - 1', 'dataMax + 1']}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#111', 
                              border: '1px solid #ffffff10', 
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: '#fff'
                            }}
                            itemStyle={{ color: '#FBFF00' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="kmL" 
                            name="Eficiência (km/L)"
                            stroke="#FBFF00" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorKmL)" 
                            animationDuration={2000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              )}

              {/* Market Strategy Section */}
              <div className="w-full max-w-4xl mt-6 mb-12">
                <div className="bg-gradient-to-br from-brand-primary/20 to-brand-accent/5 border border-brand-primary/30 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12">
                     <Coins size={200} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3 text-left">
                        <div className="bg-brand-primary p-2 rounded-xl">
                          <BadgePercent className="text-brand-accent" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Estratégia de Negociação IA</h3>
                          <p className="text-sm text-gray-400 font-bold">Argumentação de venda baseada em dados reais e saúde do veículo.</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={onMarketAnalysis}
                        disabled={isAnalyzingMarket}
                        className="px-6 py-3 bg-brand-primary border border-brand-accent/30 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isAnalyzingMarket ? (
                          <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>Analisar Revenda <Coins size={14} /></>
                        )}
                      </button>
                    </div>

                    {marketAnalysis ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-black/20 p-6 rounded-2xl border border-white/5 text-left"
                      >
                        <div className="markdown-body text-sm text-gray-200 leading-relaxed font-medium mb-4">
                          <Markdown>{marketAnalysis}</Markdown>
                        </div>
                        <button 
                          onClick={() => {}} // This should be handled by a local reset if needed
                          className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors"
                        >
                          Ocultar Análise
                        </button>
                      </motion.div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                          <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Dica de Especialista</p>
                          <p className="text-xs text-gray-300 font-bold italic">"O histórico de manutenção completo pode valorizar seu carro em até 15% acima da FIPE."</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                          <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Potencial de Venda</p>
                          <p className="text-xs text-gray-300 font-bold italic">Analise a saúde técnica para descobrir se você deve pedir premium ou aceitar propostas.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Finance & TCO Section */}
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-12">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group text-left">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-xl">
                          <Calculator className="text-blue-400" size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Finanças & TCO</h3>
                      </div>
                      <button 
                        onClick={onTcoAnalysis}
                        disabled={isAnalyzingTco}
                        className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                      >
                        {isAnalyzingTco ? 'Analisando...' : 'Análise Financeira'}
                      </button>
                   </div>

                   {tcoAnalysis ? (
                     <div className="bg-black/20 p-4 rounded-xl border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                       <div className="markdown-body text-xs text-gray-300 leading-relaxed font-medium">
                         <Markdown>{tcoAnalysis}</Markdown>
                       </div>
                     </div>
                   ) : (
                     <p className="text-xs text-gray-500 font-bold italic">
                       Descubra o custo por KM real do seu veículo consolidando gastos de combustível e oficina.
                     </p>
                   )}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group text-left">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-2 rounded-xl">
                          <ShieldCheck className="text-green-400" size={20} />
                        </div>
                        <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Passaporte IA</h3>
                      </div>
                      <button 
                        onClick={onGeneratePassport}
                        disabled={isGeneratingPassport}
                        className="text-[10px] font-black uppercase bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-all"
                      >
                        {isGeneratingPassport ? 'Gerando...' : 'Ver Certificado'}
                      </button>
                   </div>

                   {digitalPassport ? (
                     <div className="bg-black/20 p-4 rounded-xl border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                       <div className="markdown-body text-xs text-gray-300 leading-relaxed font-medium">
                         <Markdown>{digitalPassport}</Markdown>
                       </div>
                     </div>
                   ) : (
                     <p className="text-xs text-gray-500 font-bold italic">
                       Gere um selo de procedência digital baseado na integridade do seu histórico de manutenção.
                     </p>
                   )}
                </div>
              </div>

              {/* AI Mechanic Section */}
              <div className="w-full max-w-4xl mt-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={120} className="text-brand-accent rotate-12" />
                  </div>
                  
                  <div className="relative z-10 text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-brand-accent p-2 rounded-xl shadow-[0_0_20px_rgba(255,200,0,0.4)] animate-pulse">
                        <Stethoscope className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Mecânico IA de Alta Performance</h3>
                        <p className="text-sm text-gray-400 font-bold">Descreva um problema ou comportamento estranho do veículo.</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                      <input 
                        type="text"
                        placeholder="Ex: Pedal de freio está trepidando ao pisar forte..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-brand-accent transition-all"
                        value={symptomQuery}
                        onChange={(e) => setSymptomQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onDiagnose()}
                      />
                      <button
                        onClick={onDiagnose}
                        disabled={isDiagnosing || !symptomQuery}
                        className="bg-brand-accent text-brand-primary p-4 rounded-2xl font-black uppercase italic tracking-tighter disabled:opacity-50 hover:scale-105 transition-transform flex items-center justify-center gap-2"
                      >
                        {isDiagnosing ? (
                          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>Diagnosticar <Sparkles size={16} /></>
                        )}
                      </button>
                    </div>

                    {diagnosisResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-brand-primary/20 border border-brand-primary/30 p-6 rounded-2xl"
                      >
                        <div className="markdown-body text-sm text-gray-200 leading-relaxed font-medium">
                          <Markdown>{diagnosisResult}</Markdown>
                        </div>
                        <button 
                          onClick={() => setDiagnosisResult(null)}
                          className="mt-4 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors"
                        >
                          Limpar Diagnóstico
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full border-t border-white/5 pt-2 max-w-4xl mx-auto">
          <div className="bg-white/5 p-3 rounded-2xl text-left">
            <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Itens</p>
            <p className="text-2xl font-mono font-black">{selectedVehicle.parts?.length || 0}</p>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl relative group text-left">
            <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1 flex items-center justify-between">
              Odômetro
              {predictCurrentMileage(selectedVehicle) > selectedVehicle.mileage && (
                <span className="text-[8px] bg-brand-accent p-0.5 px-1.5 rounded-full text-white animate-pulse">ESTIMATIVA IA</span>
              )}
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-mono font-black">{predictCurrentMileage(selectedVehicle).toLocaleString()}</p>
              {predictCurrentMileage(selectedVehicle) > selectedVehicle.mileage && (
                <span className="text-[10px] text-gray-500 font-bold">km</span>
              )}
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl text-left">
            <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Média</p>
            <p className="text-2xl font-mono font-black text-brand-accent">
              {(() => {
                const logs = [...(selectedVehicle.fuelLogs || [])].sort((a, b) => a.mileage - b.mileage);
                if (logs.length < 2) return '--';
                const totalKm = logs[logs.length - 1].mileage - logs[0].mileage;
                const totalL = logs.slice(1).reduce((sum, l) => sum + l.liters, 0);
                return totalL > 0 ? (totalKm / totalL).toFixed(1) : '--';
              })()}
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl text-left">
            <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Saúde IA</p>
            <p className={`text-2xl font-mono font-black ${getVehicleHealth() > 80 ? 'text-green-400' : getVehicleHealth() > 50 ? 'text-amber-400' : 'text-red-400'}`}>
              {Math.round(getVehicleHealth())}%
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl text-left">
            <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Score Valorização</p>
            <div className="flex items-center gap-2">
               <p className={`text-2xl font-mono font-black ${getMaintenanceScore() > 85 ? 'text-blue-400' : 'text-gray-400'}`}>
                 {getMaintenanceScore()}%
               </p>
               <span className="text-[8px] bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded uppercase font-bold">Premium</span>
            </div>
          </div>
          <motion.div 
            whileTap={{ scale: 0.95 }}
            onClick={onUpdateFipe}
            className="bg-white/5 p-3 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors text-left"
          >
            <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1 flex justify-between items-center">
              {marketRef}
              <RefreshCw size={8} className={isUpdatingFipe ? "animate-spin text-brand-accent" : "text-gray-600"} />
            </p>
            <div className="flex items-center gap-2">
               <p className="text-2xl font-mono font-black text-green-400">
                 {formatCurrency(selectedVehicle.fipeValue || 0)}
               </p>
            </div>
          </motion.div>
        </div>

        {/* Health Progress Bar */}
        <div className="w-full max-w-4xl mt-3 mb-1 mx-auto">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${getVehicleHealth()}%` }}
              className={`h-full rounded-full ${getVehicleHealth() > 80 ? 'bg-green-500' : getVehicleHealth() > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
            />
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-accent/10 rounded-full -ml-32 -mt-32 blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full -mr-32 -mb-32 blur-[100px]"></div>
    </div>
  );
};
