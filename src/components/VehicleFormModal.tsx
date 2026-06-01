
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Car, Globe, ExternalLink, Wand2, Zap, RefreshCw, Sparkles, Eraser, 
  Camera, Layout, ClipboardCheck, Activity, Search, Upload, Clipboard
} from 'lucide-react';
import { Vehicle, VehicleSearchLink } from '../types';
import { BrandLogo } from './BrandLogo';
import { RobotGalleryModal } from './RobotGalleryModal';

interface VehicleImageProps {
  src?: string;
  alt: string;
  className: string;
}

const VehicleImage = ({ src, alt, className }: VehicleImageProps) => {
  const [error, setError] = React.useState(false);
  
  if (!src || error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-400`}>
        <Car size={className.includes('w-16') ? 32 : 120} />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} object-cover`} 
      referrerPolicy="no-referrer" 
      onError={() => setError(true)}
    />
  );
};

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  newVehicle: Partial<Vehicle>;
  setNewVehicle: React.Dispatch<React.SetStateAction<Partial<Vehicle>>>;
  onConfirm: () => void;
  showInternalBrowser: boolean;
  setShowInternalBrowser: (val: boolean) => void;
  internalBrowserUrl: string;
  setInternalBrowserUrl: (val: string) => void;
  searchPortals: any[];
  isSearchingPlate: boolean;
  searchVehicleByPlate: () => void;
  rawPastedData: string;
  setRawPastedData: (val: string) => void;
  handleAssistedProcess: () => void;
  isProcessingAssisted: boolean;
  handleRemoveBackground: () => void;
  isRemovingBackground: boolean;
  searchImage: (customQuery?: string) => void;
  isSearchingImage: boolean;
  foundPhotos: string[];
  setFoundPhotos: (photos: string[]) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  isGalleryOpen: boolean;
  setIsGalleryOpen: (val: boolean) => void;
  cooldownRemaining: number;
  handleCaptureFromClipboard: () => void;
  robotLogs: string[];
  robotLogsEndRef: React.RefObject<HTMLDivElement | null>;
  plateSearchStatus: string;
  currentCountry: any;
  searchLinks: VehicleSearchLink[];
  captureFromExternal: () => void;
  searchLogo: (name?: string) => void;
  isSearchingLogo: boolean;
  vehicleImageInputRef: React.RefObject<HTMLInputElement | null>;
  brandLogoInputRef: React.RefObject<HTMLInputElement | null>;
  pasteTextAreaRef: React.RefObject<HTMLTextAreaElement | null>;
  identifierLabel?: string;
  identifierPlaceholder?: string;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  isEditing,
  newVehicle,
  setNewVehicle,
  onConfirm,
  showInternalBrowser,
  setShowInternalBrowser,
  internalBrowserUrl,
  setInternalBrowserUrl,
  searchPortals,
  isSearchingPlate,
  searchVehicleByPlate,
  rawPastedData,
  setRawPastedData,
  handleAssistedProcess,
  isProcessingAssisted,
  handleRemoveBackground,
  isRemovingBackground,
  searchImage,
  isSearchingImage,
  foundPhotos,
  setFoundPhotos,
  searchQuery,
  onSearch,
  isGalleryOpen,
  setIsGalleryOpen,
  cooldownRemaining,
  handleCaptureFromClipboard,
  robotLogs,
  robotLogsEndRef,
  plateSearchStatus,
  currentCountry,
  searchLinks,
  captureFromExternal,
  searchLogo,
  isSearchingLogo,
  vehicleImageInputRef,
  brandLogoInputRef,
  pasteTextAreaRef,
  identifierLabel = 'Placa',
  identifierPlaceholder = 'AAA-0000'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-primary/40 backdrop-blur-md"
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative bg-white rounded-3xl p-4 sm:p-8 w-full ${showInternalBrowser ? 'max-w-6xl' : 'max-w-lg'} shadow-2xl flex flex-col max-h-[92vh] transition-all duration-500 overflow-hidden text-left`}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-brand-primary p-2 rounded-xl text-white shadow-lg shadow-brand-primary/20">
                  <Car size={20} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-brand-primary">
                  {isEditing ? 'Editar Veículo' : 'Novo Veículo'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {showInternalBrowser && (
                  <button 
                    onClick={() => setShowInternalBrowser(false)}
                    className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-gray-200 transition-all uppercase tracking-widest border border-gray-200"
                  >
                    Modo Simples
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {showInternalBrowser ? (
                <div className="flex flex-col lg:flex-row h-full min-h-[500px] lg:h-[650px] gap-6">
                  {/* Navegador à esquerda */}
                  <div className="lg:flex-[1.5] xl:flex-[2] flex flex-col gap-4 h-[400px] lg:h-full">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
                      <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl border border-gray-200">
                        {searchPortals.map(portal => (
                          <button
                            key={portal.url}
                            onClick={() => setInternalBrowserUrl(portal.url.replace('{placa}', newVehicle.plate || ''))}
                            className={`px-4 py-2 text-[10px] font-black rounded-xl whitespace-nowrap transition-all uppercase tracking-tighter ${internalBrowserUrl === portal.url.replace('{placa}', newVehicle.plate || '') ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            {portal.icon} {portal.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-3xl border border-gray-200 overflow-hidden relative shadow-2xl group">
                      <iframe 
                        src={internalBrowserUrl} 
                        className="w-full h-full border-none"
                        title="Navegador de Consulta"
                      />
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={internalBrowserUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="bg-brand-primary text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                      {internalBrowserUrl === '' && (
                        <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center text-center p-8">
                           <Globe size={48} className="text-gray-200 mb-4 animate-pulse" />
                           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aguardando Seleção de Portal</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Captura à direita */}
                  <div className="lg:flex-1 flex flex-col gap-4 pb-6 lg:pb-0">
                    <div className="bg-brand-primary p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group border border-white/10 shrink-0">
                      <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-brand-accent/20 rounded-full blur-[80px] group-hover:bg-brand-accent/30 transition-all duration-1000" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-brand-accent/20 p-2 rounded-xl">
                            <Wand2 size={16} className="text-brand-accent" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-[2px] text-white">IA EXTRATORA</h4>
                            <p className="text-[10px] text-white/50 font-bold">Captura inteligente de dados</p>
                          </div>
                        </div>

                        <button
                          onClick={() => searchVehicleByPlate()}
                          disabled={isSearchingPlate}
                          className="w-full bg-brand-accent text-brand-primary py-5 rounded-[1.25rem] font-black text-xs uppercase tracking-[1px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_25px_rgba(251,255,0,0.3)] flex items-center justify-center gap-3 mb-6"
                        >
                          {isSearchingPlate ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                          {isSearchingPlate ? 'Buscando na Web...' : `Sincronizar ${identifierLabel}`}
                        </button>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="h-[1px] flex-1 bg-white/10"></div>
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[2px]">Plano B: Texto Manual</span>
                            <div className="h-[1px] flex-1 bg-white/10"></div>
                          </div>

                          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 group-focus-within:border-brand-accent/30 transition-all">
                            <textarea 
                              ref={pasteTextAreaRef}
                              className="w-full h-24 bg-transparent border-none p-0 text-[11px] font-mono text-white placeholder:text-white/20 focus:ring-0 focus:outline-none transition-all resize-none"
                              placeholder="Caso o robô falhe, copie todo o texto do site e cole aqui para a IA organizar..."
                              value={rawPastedData}
                              onChange={(e) => setRawPastedData(e.target.value)}
                            />
                            
                            {rawPastedData && (
                              <motion.button 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => handleAssistedProcess()}
                                disabled={isProcessingAssisted}
                                className="w-full mt-3 py-3 bg-white text-brand-primary text-[10px] font-black rounded-xl hover:bg-brand-accent transition-all flex items-center justify-center gap-2 shadow-xl"
                              >
                                {isProcessingAssisted ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                EXTRAIR DADOS COLADOS
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-[2rem] p-5 shrink-0 shadow-sm overflow-hidden border-b-4 border-b-brand-accent/10">
                       <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ficha Técnica Provisória</span>
                          {newVehicle.name && <span className="text-[8px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">Detectado</span>}
                       </div>

                       {newVehicle.imageUrl && (
                         <div className="mb-4 relative group">
                            <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                              <VehicleImage 
                                src={newVehicle.imageUrl} 
                                alt="Preview IA" 
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveBackground()}
                              disabled={isRemovingBackground}
                              className="absolute -right-2 -bottom-2 bg-brand-primary text-white p-2 rounded-xl shadow-lg hover:bg-brand-accent transition-all z-20 flex items-center gap-1.5"
                              title="Remover Fundo"
                            >
                              {isRemovingBackground ? <RefreshCw size={12} className="animate-spin" /> : <Eraser size={12} />}
                              <span className="text-[8px] font-black uppercase tracking-tighter">Limpar Fundo</span>
                            </button>
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                               <p className="text-[7px] text-white font-black uppercase tracking-widest flex items-center gap-1">
                                 <Camera size={8} /> Foto encontrada pelo Robô
                               </p>
                            </div>
                         </div>
                       )}

                       <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <p className="text-[8px] text-gray-400 font-black uppercase">Marca/Modelo</p>
                            <p className="text-[10px] font-bold text-gray-600 truncate">{newVehicle.name || '--'} {newVehicle.model || '--'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-400 font-black uppercase">Placa</p>
                            <p className="text-[10px] font-mono font-bold text-brand-primary">{newVehicle.plate || '--'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-400 font-black uppercase">Ano</p>
                            <p className="text-[10px] font-bold text-gray-600">{newVehicle.year || '--'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-400 font-black uppercase">Combustível</p>
                            <p className="text-[10px] font-bold text-gray-600 truncate">{newVehicle.fuelType || '--'}</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-[2rem] flex-none lg:flex-1 flex flex-col items-center justify-center text-center group hover:border-brand-primary/10 transition-all min-h-[120px]">
                      <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-4 group-hover:scale-110 transition-transform ${isSearchingPlate || isProcessingAssisted ? 'animate-bounce' : ''}`}>
                        {isSearchingPlate || isProcessingAssisted ? (
                          <Activity size={28} className="text-brand-accent" />
                        ) : (
                          <Layout size={28} className="text-gray-300" />
                        )}
                      </div>
                      <h5 className="text-xs font-black text-gray-700 uppercase tracking-tight">Console de Status</h5>
                      <p className="text-[10px] text-gray-400 mt-2 max-w-[200px] leading-relaxed font-bold mb-4">
                        {plateSearchStatus || "Aguardando ação para iniciar o processamento inteligente."}
                      </p>

                      {/* Robot Action: Find Image */}
                        {(newVehicle.name && newVehicle.model) && (
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => searchImage()}
                            disabled={isSearchingImage || cooldownRemaining > 0}
                            className={`w-full mb-3 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border flex items-center justify-center gap-2 transition-all group ${cooldownRemaining > 0 ? 'bg-orange-50 text-orange-400 border-orange-100 cursor-not-allowed' : 'bg-blue-50/10 text-blue-600 border-blue-500/20 hover:bg-blue-500 hover:text-white'}`}
                          >
                            {isSearchingImage ? <RefreshCw size={14} className="animate-spin" /> : (cooldownRemaining > 0 ? <RefreshCw size={14} /> : <Camera size={14} className="group-hover:rotate-12 transition-transform" />)}
                            {cooldownRemaining > 0 ? `AGUARDE: ${cooldownRemaining}s (LIMITE IA)` : (foundPhotos.length > 0 ? 'REABRIR GALERIA DO ROBÔ' : 'BUSCAR FOTO DO MODELO')}
                          </motion.button>
                        )}

                      {/* Robot Manual Capture Helper */}
                      {plateSearchStatus.includes('Assistido') && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full mb-4 px-2"
                        >
                          <button 
                            onClick={() => handleCaptureFromClipboard()}
                            disabled={isProcessingAssisted}
                            className="w-full py-4 bg-brand-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-accent/30 flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all"
                          >
                            {isProcessingAssisted ? (
                              <RefreshCw className="animate-spin" size={16} />
                            ) : (
                              <div className="flex items-center gap-2">
                                <ClipboardCheck size={16} />
                                <span>CLIQUE PARA CAPTURAR</span>
                              </div>
                            )}
                            <span className="text-[7px] opacity-70">Processar dados copiados da janela</span>
                          </button>
                        </motion.div>
                      )}

                      {/* Robot Logs Section */}
                      {robotLogs.length > 0 && (
                        <div className="w-full mt-2 bg-gray-900 rounded-xl p-3 border border-gray-800 shadow-inner overflow-hidden">
                           <div className="flex items-center gap-2 mb-2 border-b border-gray-800 pb-1">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                             <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Robot Activity Log</span>
                           </div>
                           <div className="flex flex-col gap-1.5 h-32 overflow-y-auto scrollbar-hide text-left">
                              <AnimatePresence>
                                {robotLogs.map((log, i) => (
                                  <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-mono"
                                  >
                                    <span className="text-brand-accent brightness-125 font-bold mr-2">root@mecanico:~$</span>
                                    <span className={`${typeof log === 'string' && log.includes('[SUCCESS]') ? 'text-green-400' : typeof log === 'string' && log.includes('[ERROR]') ? 'text-red-400' : 'text-blue-400'}`}>
                                      {typeof log === 'string' ? log : String(log)}
                                    </span>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                              <div ref={robotLogsEndRef} />
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
              <div className="space-y-6 pb-6">
                {/* Imagem do Veículo */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group">
                    <div onClick={() => vehicleImageInputRef.current?.click()} className="relative cursor-pointer overflow-hidden rounded-2xl shadow-2xl">
                      <VehicleImage 
                        src={newVehicle.imageUrl} 
                        alt="Veículo" 
                        className={`aspect-video w-full max-w-[340px] rounded-2xl object-cover transition-all duration-500 ${isRemovingBackground ? 'blur-sm scale-95' : ''}`} 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                        <Upload size={32} className="mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Alterar Foto</span>
                      </div>
                      
                      {isRemovingBackground && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] text-white font-black uppercase tracking-widest animate-pulse">Processando IA...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {newVehicle.imageUrl && !isRemovingBackground && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: plateSearchStatus.includes('Remover Fundo') ? [1, 1.1, 1] : 1 
                        }}
                        transition={{ 
                          scale: plateSearchStatus.includes('Remover Fundo') ? { repeat: Infinity, duration: 1.5 } : { duration: 0.2 } 
                        }}
                        onClick={() => handleRemoveBackground()}
                        className="absolute -right-3 -bottom-3 bg-white text-brand-primary p-3 rounded-2xl shadow-2xl border border-gray-100 hover:bg-brand-accent hover:text-white transition-all group/btn z-10"
                        title="Sincronizar com Robô Estúdio (Remover Fundo)"
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Eraser size={18} className="group-hover/btn:rotate-12 transition-transform" />
                            <Sparkles size={10} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest pr-1">Tratar com Robô</span>
                        </div>
                      </motion.button>
                    )}
                  </div>

                  <motion.button 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={foundPhotos.length > 0 ? () => setIsGalleryOpen(true) : () => searchImage()}
                    disabled={isSearchingImage || (foundPhotos.length === 0 && cooldownRemaining > 0)}
                    className={`mt-4 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border flex items-center justify-center gap-3 transition-all shadow-lg group w-full max-w-[340px] ${cooldownRemaining > 0 && foundPhotos.length === 0 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800'}`}
                  >
                    {isSearchingImage ? (
                      <RefreshCw className="animate-spin text-blue-400" size={14} />
                    ) : (
                      cooldownRemaining > 0 && foundPhotos.length === 0 ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} className="text-blue-400 group-hover:rotate-12 transition-transform" />
                    )}
                    {cooldownRemaining > 0 && foundPhotos.length === 0 ? `ESPERE ${cooldownRemaining}s (LIMITE IA)` : (foundPhotos.length > 0 ? 'REABRIR GALERIA DO ROBÔ' : (newVehicle.imageUrl ? 'TROCAR FOTO (IA)' : 'BUSCAR FOTO ORIGINAL (IA)'))}
                  </motion.button>
                </div>

                <div className="space-y-5">
                  {/* === BUSCA POR IDENTIFICADOR === */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">{identifierLabel}</label>
                    <div className="flex gap-2 sm:gap-3 relative">
                      <input
                        type="text"
                        placeholder={identifierPlaceholder}
                        maxLength={20}
                        className={`w-32 sm:flex-1 bg-gray-50 border-0 rounded-2xl p-3 sm:p-4 font-mono uppercase tracking-[2px] sm:tracking-[3px] text-lg sm:text-xl font-bold focus:ring-2 focus:ring-brand-accent transition-all ${isSearchingPlate ? 'ring-2 ring-brand-accent shadow-[0_0_20px_rgba(225,29,72,0.4)] animate-pulse' : ''}`}
                        value={newVehicle.plate || ''}
                        onChange={(e) => setNewVehicle(prev => ({
                          ...prev,
                          plate: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                        }))}
                      />
                      <button
                        onClick={() => searchVehicleByPlate()}
                        disabled={isSearchingPlate || !newVehicle.plate || newVehicle.plate.length < 4 || cooldownRemaining > 0}
                        className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg text-sm sm:text-base overflow-hidden relative ${cooldownRemaining > 0 ? 'bg-orange-500/10 text-orange-600 shadow-orange-500/10' : 'bg-brand-primary text-white hover:bg-brand-accent shadow-brand-primary/20'}`}
                        title={cooldownRemaining > 0 ? `Aguarde ${cooldownRemaining}s para usar a IA novamente` : "Busca Inteligente via IA e Bases Públicas"}
                      >
                        {isSearchingPlate && (
                          <motion.div 
                            className="absolute inset-0 bg-brand-accent/20"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                          />
                        )}
                        {isSearchingPlate ? <RefreshCw className="animate-spin" size={18} /> : (cooldownRemaining > 0 ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />)}
                        <span className="truncate z-10">{cooldownRemaining > 0 ? `${cooldownRemaining}s` : 'Identificar'}</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {(plateSearchStatus || robotLogs.length > 0) && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-2"
                        >
                          {plateSearchStatus && (
                            <div className="text-[11px] font-bold text-brand-accent uppercase tracking-tighter flex items-center gap-1.5 ml-1 bg-brand-accent/5 py-1.5 px-3 rounded-full border border-brand-accent/10">
                              <Activity size={12} className="animate-pulse" />
                              {plateSearchStatus}
                            </div>
                          )}
                          
                          {robotLogs.length > 0 && (
                            <div className="bg-gray-900 rounded-xl p-2 font-mono text-[8px] overflow-hidden border border-gray-800">
                               <div className="flex flex-col gap-1 max-h-24 overflow-y-auto scrollbar-hide text-left">
                                  {robotLogs.map((log, i) => (
                                    <div key={i} className="flex gap-2">
                                       <span className="text-gray-600">#</span>
                                       <span className={`${typeof log === 'string' && log.includes('[SUCCESS]') ? 'text-green-500' : 'text-blue-400'} truncate`}>
                                         {typeof log === 'string' ? log : String(log)}
                                       </span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter w-full mb-1">Links de Consulta:</span>
                      {searchLinks.map(link => (
                        <a 
                          key={link.id}
                          href={link.url ? (link.url.includes('{placa}') ? link.url.replace('{placa}', newVehicle.plate || '') : link.url) : '#'} 
                          target="_blank" 
                          rel="noreferrer"
                          className={`text-[10px] bg-white hover:bg-opacity-10 text-gray-600 px-2.5 py-1.5 rounded-lg font-bold transition-all border border-gray-200 shadow-sm`}
                          style={{ color: link.color !== 'brand' ? link.color : 'inherit' }}
                        >
                          {link.name}
                        </a>
                      ))}
                      <button 
                        onClick={() => captureFromExternal()}
                        className="text-[10px] bg-brand-accent/10 text-brand-accent px-2.5 py-1.5 rounded-lg font-black hover:bg-brand-accent/20 transition-all border border-brand-accent/10 flex items-center gap-1 shadow-sm"
                        title="Tenta capturar dados se o site de consulta estiver aberto"
                      >
                        <Search size={12} /> Robo BuscaPlacas
                      </button>
                    </div>

                    <div className={`mt-4 p-4 rounded-2xl border transition-all ${isSearchingPlate && (plateSearchStatus || '').includes('Cota') ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-200' : 'bg-brand-primary/5 border-brand-primary/10'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 ${isSearchingPlate && (plateSearchStatus || '').includes('Cota') ? 'text-orange-600' : 'text-brand-primary'}`}>
                          <Clipboard size={12} /> Busca Assistida (Plano B)
                        </span>
                        <button
                          onClick={() => {
                            const firstUrl = searchPortals[0].url.replace('{placa}', newVehicle.plate || '');
                            setInternalBrowserUrl(firstUrl);
                            setShowInternalBrowser(true);
                          }}
                          className="bg-brand-primary text-white px-2 py-1 rounded-lg text-[9px] font-black hover:brightness-110 transition-all flex items-center gap-1 shadow-sm uppercase tracking-tighter"
                        >
                          <Layout size={10} /> Navegador Integrado
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                        Se o robô der erro de limite (429), use o <strong>Navegador Integrado</strong> acima ou cole o texto do site aqui:
                      </p>
                      <textarea 
                        ref={pasteTextAreaRef}
                        className="w-full h-20 bg-white border border-gray-200 rounded-xl p-3 text-[11px] font-mono focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all resize-none shadow-inner"
                        placeholder="Cole o texto do site aqui..."
                        value={rawPastedData}
                        onChange={(e) => setRawPastedData(e.target.value)}
                      />
                      {rawPastedData && (
                        <motion.button 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleAssistedProcess()}
                          disabled={isProcessingAssisted}
                          className="w-full mt-2 py-2.5 bg-brand-primary text-white text-xs font-black rounded-xl hover:bg-brand-accent transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-primary/20"
                        >
                          {isProcessingAssisted ? <RefreshCw className="animate-spin" size={14} /> : <Wand2 size={14} />}
                          PROCESSAR TEXTO COM IA
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Marca e Modelo */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Marca</label>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => searchLogo(newVehicle.name)}
                             disabled={isSearchingLogo || !newVehicle.name}
                             className="text-[9px] font-black uppercase text-brand-primary flex items-center gap-1 hover:text-brand-accent transition-colors disabled:opacity-50"
                             title="Buscar logo automaticamente"
                           >
                             {isSearchingLogo ? <RefreshCw className="animate-spin" size={10} /> : <Search size={10} />} Identificar Logo
                           </button>
                           <button 
                             onClick={() => brandLogoInputRef.current?.click()}
                             className="text-[9px] font-black uppercase text-gray-500 flex items-center gap-1 hover:text-gray-700 transition-colors"
                             title="Upload manual de logo"
                           >
                             <Upload size={10} /> Manual
                           </button>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="shrink-0">
                          <BrandLogo 
                            vehicleName={newVehicle.name || ''} 
                            brandLogoUrl={newVehicle.brandLogoUrl}
                            className="w-[56px] h-[56px] rounded-2xl shadow-md border border-gray-100 bg-white"
                          />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Ex: Honda"
                          className="flex-1 bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-bold h-[56px]"
                          value={newVehicle.name || ''}
                          onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Modelo</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Fit LX 1.4"
                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-bold"
                        value={newVehicle.model || ''}
                        onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Versão / Variante</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Touring / LXL / EX"
                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent"
                        value={newVehicle.version || ''}
                        onChange={(e) => setNewVehicle({...newVehicle, version: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Motorização</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 1.5 i-VTEC / 2.0 Turbo"
                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent"
                        value={newVehicle.engine || ''}
                        onChange={(e) => setNewVehicle({...newVehicle, engine: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Combustível</label>
                      <select 
                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-bold appearance-none cursor-pointer"
                        value={newVehicle.fuelType || ''}
                        onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        <option value="Flex">Flex (Álcool/Gasolina)</option>
                        <option value="Gasolina">Gasolina</option>
                        <option value="Álcool">Álcool</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Híbrido">Híbrido</option>
                        <option value="Elétrico">Elétrico</option>
                        <option value="GNV">GNV</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Chassi (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Últimos dígitos ou completo"
                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-mono text-xs"
                        value={newVehicle.chassis || ''}
                        onChange={(e) => setNewVehicle({...newVehicle, chassis: e.target.value.toUpperCase()})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Ano</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 2004"
                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-bold"
                        value={newVehicle.year || ''}
                        onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Cor</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Prata"
                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent"
                        value={newVehicle.color || ''}
                        onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">KM</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-mono font-bold"
                        value={newVehicle.mileage || 0}
                        onChange={(e) => setNewVehicle({...newVehicle, mileage: e.target.value === '' ? 0 : Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="bg-brand-primary/5 p-6 rounded-3xl border border-brand-primary/10 space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                      <Activity size={12} /> Perfil Psicográfico do Motorista (Contexto IA)
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Dias de Uso Habitual</label>
                        <div className="flex flex-wrap gap-2">
                          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const current = newVehicle.usageDays || [];
                                const updated = current.includes(idx) 
                                  ? current.filter(d => d !== idx) 
                                  : [...current, idx];
                                setNewVehicle({ ...newVehicle, usageDays: updated });
                              }}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all border ${
                                (newVehicle.usageDays || []).includes(idx)
                                ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                                : 'bg-white border-gray-100 text-gray-400 hover:border-brand-primary/30'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Estilo de Aceleração</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'smooth', label: 'Suave', sub: 'Pé Leve' },
                              { id: 'moderate', label: 'Normal', sub: 'Padrão' },
                              { id: 'aggressive', label: 'Rápida', sub: 'Pé Pesado' }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setNewVehicle({ ...newVehicle, drivingStyle: opt.id as any })}
                                className={`p-3 rounded-2xl border flex flex-col items-center transition-all ${
                                  newVehicle.drivingStyle === opt.id 
                                    ? 'bg-brand-primary border-brand-primary text-white shadow-lg' 
                                    : 'bg-white border-gray-100 text-gray-500 hover:border-brand-primary/30'
                                }`}
                              >
                                <span className="text-[9px] font-black uppercase">{opt.label}</span>
                                <span className={`text-[7px] font-bold ${newVehicle.drivingStyle === opt.id ? 'text-white/70' : 'text-gray-400'}`}>
                                  {opt.sub}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Troca de Marchas (RPM)</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'low', label: 'Baixa', sub: '< 2.5k' },
                              { id: 'mid', label: 'Média', sub: '3k - 4k' },
                              { id: 'high', label: 'Alta', sub: '> 5k' }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setNewVehicle({ ...newVehicle, operatingRpm: opt.id as any })}
                                className={`p-3 rounded-2xl border flex flex-col items-center transition-all ${
                                  newVehicle.operatingRpm === opt.id 
                                    ? 'bg-brand-primary border-brand-primary text-white shadow-lg' 
                                    : 'bg-white border-gray-100 text-gray-500 hover:border-brand-primary/30'
                                }`}
                              >
                                <span className="text-[9px] font-black uppercase">{opt.label}</span>
                                <span className={`text-[7px] font-bold ${newVehicle.operatingRpm === opt.id ? 'text-white/70' : 'text-gray-400'}`}>
                                  {opt.sub}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Regime predominante</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'urban', label: 'Cidade', sub: 'Severo' },
                              { id: 'mixed', label: 'Misto', sub: 'Padrão' },
                              { id: 'highway', label: 'Pista', sub: 'Leve' }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setNewVehicle({ ...newVehicle, usageProfile: opt.id as any })}
                                className={`p-3 rounded-2xl border flex flex-col items-center transition-all ${
                                  newVehicle.usageProfile === opt.id 
                                    ? 'bg-brand-primary border-brand-primary text-white shadow-lg' 
                                    : 'bg-white border-gray-100 text-gray-500 hover:border-brand-primary/30'
                                }`}
                              >
                                <span className="text-[10px] font-black uppercase">{opt.label}</span>
                                <span className={`text-[8px] font-bold ${newVehicle.usageProfile === opt.id ? 'text-white/70' : 'text-gray-400'}`}>
                                  {opt.sub}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Distância p/ Dia de Uso</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={newVehicle.avgDailyKm || ''}
                              onChange={(e) => setNewVehicle({ ...newVehicle, avgDailyKm: Number(e.target.value) })}
                              placeholder="Ex: 35"
                              className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm font-bold"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 tracking-tighter">KM/DIA</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>

            <div className="flex gap-3 pt-4 sm:pt-6 border-t border-gray-100 shrink-0">
              <button 
                onClick={onClose}
                className="flex-1 py-4 sm:py-5 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl sm:rounded-3xl transition-all uppercase text-[10px] sm:text-xs tracking-widest"
              >
                Cancelar
              </button>
              <button 
                onClick={onConfirm}
                className="flex-[2] py-4 sm:py-5 bg-brand-primary text-white font-black uppercase text-[10px] sm:text-xs tracking-widest rounded-2xl sm:rounded-3xl hover:bg-brand-accent transition-all shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isEditing ? 'Salvar Alterações' : 'Confirmar e Adicionar'}
              </button>
            </div>
          </motion.div>
          
          {/* New Integrated Browser Gallery */}
          <RobotGalleryModal
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            photos={foundPhotos}
            onSelect={(photo) => setNewVehicle(prev => ({ ...prev, imageUrl: photo }))}
            selectedPhoto={newVehicle.imageUrl || null}
            vehicleName={`${newVehicle.name || ''} ${newVehicle.model || ''} ${newVehicle.version || ''}`}
            isSearching={isSearchingImage}
            robotLogs={robotLogs}
            searchQuery={searchQuery}
            onSearch={searchImage}
            cooldownRemaining={cooldownRemaining}
          />
        </div>
      )}
    </AnimatePresence>
  );
};
