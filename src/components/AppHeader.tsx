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
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6">
      <div className="flex items-center gap-4">
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="bg-brand-accent p-3 rounded-2xl shadow-lg shadow-brand-accent/20 glow-accent shrink-0"
        >
          <HeaderLogo iconName={data.settings?.appIcon} className="text-white" />
        </motion.div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
             <h1 className="text-3xl font-black tracking-tight text-brand-primary leading-none uppercase italic">
               {data.settings?.appName || 'FleetX'}
             </h1>
             {isPro && (
               <span className="bg-brand-accent text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest leading-none">PRO</span>
             )}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-none">Sistema de Gestão Ativo</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
        {user && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm shrink-0"
          >
            <div className="text-right">
               <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest leading-tight">Créditos IA</p>
               <div className="flex items-center gap-1 justify-end">
                  <span className="text-sm font-mono font-black text-brand-primary leading-none italic">{credits}</span>
                  <Zap size={10} className="text-brand-accent fill-brand-accent" />
               </div>
            </div>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-xl border border-gray-100" />
            ) : (
              <div className="w-8 h-8 bg-brand-primary text-white rounded-xl flex items-center justify-center text-xs font-black">
                {user.displayName?.[0] || <UserIcon size={14} />}
              </div>
            )}
          </motion.div>
        )}

        <motion.button 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsSettingsOpen(true)}
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-xl shadow-gray-200/20 shrink-0"
        >
          <Settings size={16} /> <span>Configurações</span>
        </motion.button>
        <motion.button 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddingVehicle(true)}
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:bg-brand-accent transition-all shrink-0"
        >
          <Plus size={16} /> <span>Novo Veículo</span>
        </motion.button>
      </div>
    </header>
  );
};
