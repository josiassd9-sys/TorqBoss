import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Globe, Sparkles, Image as ImageIcon, Search, Camera, ExternalLink } from 'lucide-react';

interface RobotGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  selectedPhoto: string | null;
  onSelect: (photo: string) => void;
  vehicleName: string;
  isSearching: boolean;
  robotLogs: string[];
  searchQuery: string;
  onSearch: (query: string) => void;
  cooldownRemaining?: number;
}

export const RobotGalleryModal: React.FC<RobotGalleryModalProps> = ({
  isOpen,
  onClose,
  photos,
  selectedPhoto,
  onSelect,
  vehicleName,
  isSearching,
  robotLogs,
  searchQuery,
  onSearch,
  cooldownRemaining = 0
}) => {
  const [localQuery, setLocalQuery] = React.useState(searchQuery);

  React.useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-primary/95 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/20"
          >
            {/* Browser Navigation Bar */}
            <div className="bg-gray-100 p-3 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1.5 ml-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-inner"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-inner"></div>
                </div>
                <div className="flex-1 flex justify-center mx-4">
                   <div className="bg-white rounded-xl border border-gray-300 px-3 py-2 flex items-center gap-3 w-full max-w-2xl shadow-sm hover:border-brand-accent focus-within:ring-4 focus-within:ring-brand-accent/10 transition-all">
                     <div className="flex items-center gap-2 text-gray-400">
                       <Globe size={16} className={isSearching ? "animate-spin text-brand-accent" : "text-gray-300"} />
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                         {localQuery.startsWith('http') ? 'https://' : 'google.com/search?q='}
                       </span>
                     </div>
                     <input 
                      type="text" 
                      value={localQuery}
                      onChange={(e) => setLocalQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onSearch(localQuery)}
                      className="flex-1 text-sm font-bold text-gray-700 outline-none bg-transparent placeholder:text-gray-300"
                      placeholder="Pesquise o modelo ou cole o link da foto..."
                     />

                     {/* Paste Button */}
                     <button 
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) setLocalQuery(text);
                        } catch (e) {
                          alert('Permita acesso à área de transferência ou use Ctrl+V');
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-gray-50 rounded-lg transition-all"
                      title="Colar link da área de transferência"
                     >
                       <ImageIcon size={16} />
                     </button>

                     <button 
                      disabled={isSearching}
                      onClick={() => {
                        if (localQuery.startsWith('http')) {
                          onSelect(localQuery);
                          onClose();
                        } else {
                          onSearch(localQuery);
                        }
                      }}
                      className={`px-5 py-2 rounded-lg transition-all font-black text-[11px] uppercase tracking-wider border-2 shadow-sm active:scale-95 ${
                        localQuery.startsWith('http') 
                        ? 'bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600' 
                        : (isSearching ? 'bg-orange-50 border-orange-200 text-orange-600 animate-pulse' : 'bg-brand-primary border-brand-primary text-white hover:bg-brand-accent hover:border-brand-accent')
                      }`}
                     >
                       {localQuery.startsWith('http') ? 'APLICAR FOTO' : (isSearching ? 'BUSCANDO...' : 'PESQUISAR')}
                     </button>
                   </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-all text-gray-400 hover:text-red-500 mr-2"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 px-4 overflow-x-auto scrollbar-none pb-1">
                 <div className="flex items-center gap-1.5 bg-gray-200/50 px-2 py-1 rounded-md">
                   <Sparkles size={10} className="text-brand-accent" />
                   <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">IA torqboss:</span>
                 </div>
                 {['oficial', 'alta resolução', 'frente', 'traseira', 'interior'].map(tag => (
                   <button 
                    key={tag}
                    onClick={() => {
                      const newQuery = `${vehicleName} ${tag}`;
                      setLocalQuery(newQuery);
                      onSearch(newQuery);
                    }}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-bold text-gray-500 hover:border-brand-accent hover:text-brand-primary hover:shadow-sm transition-all whitespace-nowrap"
                   >
                     {tag}
                   </button>
                 ))}
                 <div className="ml-auto flex items-center gap-2">
                    <button 
                      onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(localQuery || vehicleName)}&tbm=isch`, '_blank')}
                      className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-300 text-gray-600 text-[10px] font-bold rounded-lg hover:border-brand-accent hover:text-brand-primary transition-all uppercase tracking-tighter shadow-sm"
                    >
                      <ExternalLink size={12} /> Navegador Externo
                    </button>
                 </div>
              </div>
            </div>

            {/* Header Content */}
            <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary text-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                  <Camera size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-brand-primary uppercase tracking-tighter leading-none">Navegador torqboss</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sincronizado com: {vehicleName}</p>
                </div>
              </div>

              {cooldownRemaining > 0 && (
                <div className="bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">
                    IA em espera: RECARREGANDO EM {cooldownRemaining}s
                  </span>
                </div>
              )}
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 min-h-[450px]">
              {photos.length === 0 && !isSearching ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200 mx-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 animate-bounce">
                    <Search size={32} />
                  </div>
                  <div className="max-w-md space-y-2">
                    <p className="font-black text-brand-primary uppercase tracking-tighter text-lg">Busca no Google</p>
                    <p className="text-xs font-bold text-gray-400 leading-relaxed px-10">
                      Digite o nome do veículo na barra superior para o robô identificar as imagens originais ou cole o link direto de uma foto.
                    </p>
                  </div>
                  <button 
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(vehicleName + ' foto oficial alta resolução')}&tbm=isch`, '_blank')}
                    className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-2"
                  >
                    <Globe size={16} /> Ir para o Google Imagens
                  </button>
                </div>
              ) : photos.length === 0 && isSearching ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="aspect-video bg-white rounded-2xl animate-pulse border border-gray-100 flex items-center justify-center">
                        <ImageIcon size={24} className="text-gray-200" />
                      </div>
                    ))}
                 </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        onSelect(photo);
                        onClose();
                      }}
                      className={`group relative aspect-video rounded-2xl overflow-hidden border-2 transition-all hover:shadow-xl ${
                        selectedPhoto === photo 
                        ? 'border-brand-accent shadow-lg shadow-brand-accent/20' 
                        : 'border-white hover:border-brand-accent/50 shadow-sm'
                      }`}
                    >
                      <img 
                        src={photo} 
                        alt={`Sugestão ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      
                      <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-brand-accent text-brand-primary p-2 rounded-full shadow-lg">
                          <CheckCircle2 size={24} />
                        </div>
                      </div>

                      {selectedPhoto === photo && (
                        <div className="absolute inset-0 bg-brand-accent/10 border-4 border-brand-accent rounded-2xl flex items-center justify-center">
                           <div className="bg-brand-accent text-brand-primary p-1.5 rounded-full">
                             <CheckCircle2 size={16} />
                           </div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Simple Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isSearching ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   {isSearching ? 'Robô trabalhando...' : 'Concluído'}
                 </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(vehicleName + ' oficial')}&tbm=isch`, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-brand-primary bg-gray-100 hover:bg-gray-200 rounded-xl transition-all uppercase tracking-tighter"
                >
                  <Globe size={14} /> Abrir Google
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
