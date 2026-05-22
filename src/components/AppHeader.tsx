import React from 'react';
import { motion } from 'motion/react';
import { Settings, Plus, Zap, User as UserIcon } from 'lucide-react';
import { HeaderLogo } from './';
import { AppData } from '../types';
import { useFirebase } from '../contexts/FirebaseContext';

interface AppHeaderProps {
  data: AppData;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsAddingVehicle: (isAdding: boolean) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  data,
  setIsSettingsOpen,
  setIsAddingVehicle
}) => {
  const { user, credits, isPro } = useFirebase();

  return (
    <header className="flex flex-col gap-4 mb-6">
      {/* Linha 1: Logotipo Retangular Elevado e Centralizado */}
      <div className="flex justify-center w-full">
        <motion.div 
          whileHover={{ scale: 1.01, y: -2 }}
          className="w-full h-32 sm:h-48 rounded-xl shadow-xl shadow-zinc-200/50 shrink-0 border-2 border-zinc-50 flex items-center justify-center overflow-hidden bg-transparent"
        >
          <img 
            src="/src/assets/images/fleetx_logo_strada.png" 
            alt="FleetX Logo" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Linha 2: Título do App e Foto de Acesso (Login) */}
      <div className="flex justify-between items-center w-full pt-1">
        <div className="text-left max-w-[70%]">
          <div className="flex items-center gap-1.5 mb-0.5">
             <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-primary leading-none uppercase italic truncate">
               {data.settings?.appName || 'FleetX'}
             </h1>
             {isPro && (
               <span className="bg-brand-accent text-white px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest leading-none shrink-0">PRO</span>
             )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-[9px] text-zinc-950 font-black uppercase tracking-[0.2em] leading-none truncate">Monitoramento Ativo</p>
          </div>
        </div>

        {/* Conta do Usuário no extremo direito */}
        {user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm shrink-0"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ""} className="w-9 h-9 rounded-xl border border-gray-100" />
            ) : (
              <div className="w-9 h-9 bg-brand-primary text-white rounded-xl flex items-center justify-center text-sm font-black">
                {user.displayName?.[0] || <UserIcon size={16} />}
              </div>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Linha 3: Botões de Ações */}
      <div className="flex items-center gap-2 w-full lg:justify-end overflow-x-auto no-scrollbar pb-1 lg:pb-0">
        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsSettingsOpen(true)}
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white border border-zinc-950 text-[10px] font-black uppercase tracking-tighter text-brand-primary hover:bg-zinc-50 transition-all shadow-sm shrink-0"
        >
          <Settings size={14} /> <span className="whitespace-nowrap">Ajustes</span>
        </motion.button>
        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddingVehicle(true)}
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-primary text-white text-[10px] font-black uppercase tracking-tighter shadow-md hover:bg-zinc-900 transition-all shrink-0"
        >
          <Plus size={14} /> <span className="whitespace-nowrap">Novo Veículo</span>
        </motion.button>
      </div>
    </header>
  );
};
