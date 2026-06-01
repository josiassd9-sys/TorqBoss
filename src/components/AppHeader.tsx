import React from 'react';
import { motion } from 'motion/react';
import { Settings, Plus, Zap, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HeaderLogo } from './';
import { AppData } from '../types';
import { useFirebase } from '../contexts/FirebaseContext';
import torqbossLogo from '../assets/images/torqboss_logo_strada.png';

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
  const { t } = useTranslation();
  const headerConfig = data.settings?.headerConfig ?? {};

  return (
    <header className="flex flex-col gap-4 mb-6">
      {/* Linha 1: Título do App e Foto de Acesso (Login) */}
      <div className="flex justify-between items-center w-full pt-1">
        <div className="text-left max-w-[70%]">
          <div className="flex items-center gap-1.5 mb-0.5">
             <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-primary leading-none uppercase italic truncate flex items-baseline gap-1.5">
               <span>{data.settings?.appName || 'torqboss'}</span>
               <span className="text-[10px] sm:text-xs font-bold text-zinc-400/80 not-italic tracking-normal normal-case shrink-0">
                 {data.settings?.appSubtitle ? data.settings.appSubtitle : t('app_subtitle')}
               </span>
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

      {/* Linha 2: Logotipo Retangular Elevado e Centralizado (Banner) */}
      <div className="flex justify-center w-full">
        <motion.div 
          whileHover={{ scale: 1.005 }}
          style={{ 
            height: `${headerConfig.bannerHeight || 55}px`,
            backgroundColor: headerConfig.bgColor || '#141414',
            backgroundImage: headerConfig.bgImage ? `url(${headerConfig.bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: headerConfig.bgOpacity ?? 1,
            backdropFilter: `blur(${headerConfig.bgBlur || 0}px)`,
          }}
          className="w-full rounded-xl shadow-xl shadow-zinc-200/50 shrink-0 border-2 border-zinc-50 flex items-center justify-center overflow-hidden transition-all duration-300"
        >
          {(headerConfig.showIcon ?? true) && (
            <motion.img 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: (headerConfig.iconScale || 50) / 100 
              }}
              src={torqbossLogo} 
              alt="torqboss Logo" 
              style={{ 
                height: '100px', // Base height for consistent scaling independent of container height
                width: 'auto',
                transformOrigin: 'center center'
              }}
              className="object-contain transition-all duration-300 pointer-events-none"
            />
          )}
        </motion.div>
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
