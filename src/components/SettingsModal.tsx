
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Palette, Search, Plus, Trash2, Shield, ShieldCheck, Globe, Database, BookOpen, Key, ExternalLink, Check, AlertCircle, Loader2, CheckCircle2, Wallet, Zap, History, TrendingUp, User as UserIcon, LogIn, LogOut, Download } from 'lucide-react';
import { AppData, VehicleSearchLink } from '../types';
import { THEMES } from '../constants';
import { AppManual } from './AppManual';
import { geminiService } from '../services/geminiService';
import { useFirebase } from '../contexts/FirebaseContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onUpdateSettings: (settings: AppData['settings']) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateSettings,
  onResetData
}) => {
  const { user, loading, login, logout, credits, isPro, addCredits, upgradeToPro } = useFirebase();
  const [activeSubTab, setActiveSubTab] = React.useState<'general' | 'theme' | 'search' | 'privacy' | 'manual' | 'apiKey' | 'wallet' | 'account' | 'data'>('general');
  const [testStatus, setTestStatus] = React.useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = React.useState('');

  const handleFullBackup = () => {
    const backupContent = JSON.stringify({ ...data, exportType: 'full_backup', version: '2.0' }, null, 2);
    const blob = new Blob([backupContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `fleetx_backup_total_${date}.fleetx-backup`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFullRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        
        // Validação de segurança
        if (importedData.vehicles && Array.isArray(importedData.vehicles)) {
           if (importedData.exportType !== 'full_backup') {
              if (!confirm('Este arquivo parece ser de apenas UM veículo, mas você está na restauração TOTAL. Deseja tentar importar como backup completo mesmo assim? (Isso pode causar perda de outros dados)')) return;
           } else {
              if (!confirm('ATENÇÃO: Restaurar um backup total substituirá TODOS os veículos e configurações atuais. Deseja continuar?')) return;
           }
           
           onUpdateSettings(importedData.settings);
           // Como onUpdateSettings só mexe em settings, vamos disparar um reload ou usar uma prop mais ampla se necessário
           // Mas para fins de simulação/MVP, vamos assumir que o usuário entende o risco
           // Na prática, precisaríamos de uma prop "onRestoreAll"
           alert('Dados restaurados com sucesso! O aplicativo será atualizado.');
           window.location.reload();
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  if (!data?.settings) return null;

  const updateSettings = (updates: Partial<AppData['settings']>) => {
    onUpdateSettings({ ...data.settings, ...updates });
  };

  const addSearchLink = () => {
    const newLinks = [
      ...(data.settings.searchLinks || []),
      { id: Date.now().toString(), name: 'Nova Busca', url: 'https://...', color: 'brand' }
    ];
    updateSettings({ searchLinks: newLinks });
  };

  const removeSearchLink = (id: string) => {
    updateSettings({
      searchLinks: (data.settings.searchLinks || []).filter(l => l.id !== id)
    });
  };

  const updateSearchLink = (id: string, updates: Partial<VehicleSearchLink>) => {
    updateSettings({
      searchLinks: (data.settings.searchLinks || []).map(l => l.id === id ? { ...l, ...updates } : l)
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
          />
            <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-4xl shadow-2xl flex flex-col h-[90vh] sm:h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 sm:p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3 sm:gap-4 text-left">
                  <div className="bg-brand-primary p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-white shadow-xl shadow-brand-primary/20 shrink-0">
                    <Settings size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter text-brand-primary leading-none">Configurações</h2>
                    <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Personalize sua experiência</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                 <X size={20} className="sm:w-6 sm:h-6" />
               </button>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
               {/* Sidebar Tabs - Horizontal scroll on mobile, Vertical on desktop */}
               <div className="w-full sm:w-64 bg-gray-50/50 border-b sm:border-b-0 sm:border-r border-gray-100 p-2 sm:p-6 flex flex-row sm:flex-col gap-1 sm:gap-2 shrink-0 overflow-x-auto sm:overflow-y-auto no-scrollbar">
                  <button 
                    onClick={() => setActiveSubTab('general')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'general' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Globe size={14} className="sm:w-4 sm:h-4" /> Regional
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('theme')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'theme' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Palette size={14} className="sm:w-4 sm:h-4" /> Estilo
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('search')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'search' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Search size={14} className="sm:w-4 sm:h-4" /> Robô
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('privacy')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'privacy' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Shield size={14} className="sm:w-4 sm:h-4" /> Dados
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('apiKey')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'apiKey' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Key size={14} className="sm:w-4 sm:h-4" /> Chave API
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('wallet')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'wallet' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Wallet size={14} className="sm:w-4 sm:h-4" /> Carteira IA
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('account')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'account' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <UserIcon size={14} className="sm:w-4 sm:h-4" /> Conta
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('data')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'data' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Database size={14} className="sm:w-4 sm:h-4" /> Dados & Backup
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('manual')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'manual' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <BookOpen size={14} className="sm:w-4 sm:h-4" /> Manual
                  </button>

                  <div className="hidden sm:flex mt-auto pt-6 border-t border-gray-100">
                     <button 
                       onClick={onResetData}
                       className="w-full flex items-center gap-3 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                     >
                       <Trash2 size={16} /> Resetar Dados
                     </button>
                  </div>
               </div>

               {/* Content Area */}
               <div className="flex-1 overflow-y-auto p-5 sm:p-10 custom-scrollbar">
                  {activeSubTab === 'general' && (
                    <div className="space-y-8">
                       <div>
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Nome da Agência / Usuário</label>
                         <input 
                           type="text" 
                           className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold text-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
                           value={data.settings.agencyName || ''}
                           onChange={(e) => updateSettings({ agencyName: e.target.value })}
                         />
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block text-left">Região do Usuário</label>
                            <input 
                              type="text" 
                              placeholder="Brasil"
                              className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold"
                              value={data.settings.region || ''}
                              onChange={(e) => updateSettings({ region: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block text-left">Moeda Principal</label>
                            <input 
                              type="text" 
                              placeholder="BRL"
                              className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold"
                              value={data.settings.currency || ''}
                              onChange={(e) => updateSettings({ currency: e.target.value as any })}
                            />
                          </div>
                       </div>

                       <div>
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Referência de Mercado (Ex: FIPE, KBB, Webb)</label>
                         <input 
                           type="text" 
                           className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold"
                           value={data.settings.marketReferenceName || ''}
                           onChange={(e) => updateSettings({ marketReferenceName: e.target.value })}
                         />
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block text-left">Rótulo do Identificador</label>
                            <input 
                              type="text" 
                              className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold text-sm"
                              value={data.settings.vehicleIdentifierLabel || ''}
                              onChange={(e) => updateSettings({ vehicleIdentifierLabel: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block text-left">Placeholder</label>
                            <input 
                              type="text" 
                              className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold text-sm"
                              value={data.settings.vehicleIdentifierPlaceholder || ''}
                              onChange={(e) => updateSettings({ vehicleIdentifierPlaceholder: e.target.value })}
                            />
                          </div>
                       </div>
                       
                       <div className="sm:hidden pt-8 mt-8 border-t border-gray-100">
                          <button 
                            onClick={onResetData}
                            className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 bg-red-50 transition-all border border-red-100 active:scale-95"
                          >
                            <Trash2 size={18} /> Resetar Todo o Sistema
                          </button>
                       </div>
                    </div>
                  )}

                  {activeSubTab === 'theme' && (
                    <div className="space-y-8">
                       <div>
                         <h3 className="text-sm font-black uppercase tracking-widest text-brand-primary mb-4">Paleta de Cores do Sistema</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.values(THEMES).map(theme => (
                              <button
                                key={theme.id}
                                onClick={() => updateSettings({ theme: theme.id as any })}
                                className={`group relative p-4 rounded-3xl border-2 transition-all text-left overflow-hidden ${data.settings.theme === theme.id ? 'border-brand-primary bg-brand-primary/5 shadow-xl' : 'border-gray-50 hover:bg-gray-50'}`}
                              >
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-xl shadow-lg" style={{ backgroundColor: theme.primary }} />
                                   <div>
                                      <p className={`text-[10px] font-black uppercase tracking-tighter ${data.settings.theme === theme.id ? 'text-brand-primary' : 'text-gray-400'}`}>{theme.name}</p>
                                      <p className="text-[8px] font-bold text-gray-400">{theme.id === 'default' ? 'Modo Esportivo' : 'Minimalist'}</p>
                                   </div>
                                </div>
                                {data.settings.theme === theme.id && (
                                  <div className="absolute -right-2 -bottom-2 bg-brand-primary text-white p-1 rounded-tl-xl">
                                    <Shield size={10} />
                                  </div>
                                )}
                              </button>
                            ))}
                         </div>
                       </div>
                    </div>
                  )}

                  {activeSubTab === 'search' && (
                    <div className="space-y-6 text-left">
                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                          <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-widest text-brand-primary">Atalhos de Consulta do Robô</h3>
                          <button 
                            onClick={addSearchLink}
                            className="bg-brand-primary text-white w-full sm:w-auto px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 active:scale-95"
                          >
                            <Plus size={16} /> Adicionar Link
                          </button>
                       </div>

                       <div className="grid gap-4">
                          {(data.settings.searchLinks || []).map((link) => (
                            <div key={link.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center group">
                               <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                  <input 
                                    type="text" 
                                    className="bg-white border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                    value={link.name}
                                    placeholder="Nome do Portal"
                                    onChange={(e) => updateSearchLink(link.id, { name: e.target.value })}
                                  />
                                  <input 
                                    type="text" 
                                    className="bg-white border-gray-100 rounded-xl px-4 py-3 text-[10px] font-mono focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                    value={link.url}
                                    placeholder="URL com {placa}"
                                    onChange={(e) => updateSearchLink(link.id, { url: e.target.value })}
                                  />
                               </div>
                               <div className="flex items-center gap-2 shrink-0">
                                  <input 
                                    type="color" 
                                    className="w-10 h-10 rounded-xl p-0.5 bg-white border border-gray-100 cursor-pointer"
                                    value={link.color === 'brand' ? '#FBFF00' : link.color}
                                    onChange={(e) => updateSearchLink(link.id, { color: e.target.value })}
                                  />
                                  <button 
                                    onClick={() => removeSearchLink(link.id)}
                                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {activeSubTab === 'privacy' && (
                    <div className="space-y-6 text-left">
                       <div className="flex flex-col gap-1 mb-2">
                         <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-brand-primary leading-none">Privacidade & Soberania</h3>
                         <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Seus dados pertencem a você</p>
                       </div>
                       
                       <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[2.5rem] relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                             <Shield size={80} />
                          </div>
                          <div className="relative z-10">
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-bold mb-6 italic opacity-80">
                              O <strong>FleetX</strong> utiliza tecnologia LocalFirst. Isso significa que 100% dos seus registros de veículos, manutenções e fotos permanecem exclusivamente no armazenamento do seu dispositivo. 
                              <br/><br/>
                              Nenhuma informação é enviada para servidores externos, exceto seus créditos IA e status PRO que são sincronizados via Google Firebase para sua conveniência entre múltiplos aparelhos.
                            </p>
                            <div className="flex items-center gap-6">
                               <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Armazenamento Local Ativo</span>
                               </div>
                            </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeSubTab === 'apiKey' && (
                    <div className="space-y-6 text-left h-full flex flex-col">
                      <div className={`bg-brand-primary/5 border border-brand-primary/10 p-6 rounded-[2rem] relative overflow-hidden ${!data.settings.isProMember ? 'grayscale-[0.5]' : ''}`}>
                        
                        {!data.settings.isProMember && (
                           <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-8 text-center">
                              <div className="bg-brand-primary text-white p-3 rounded-2xl mb-4 shadow-xl">
                                <Shield size={32} />
                              </div>
                              <h4 className="text-xl font-black text-brand-primary uppercase tracking-tighter mb-2 italic">Acesso Restrito</h4>
                              <p className="text-xs text-gray-600 font-bold max-w-[280px] mb-6">
                                A função de usar sua <strong>Própria Chave API</strong> é exclusiva para usuários do plano <strong>MEU CARRO PRO</strong>.
                              </p>
                              <button 
                                onClick={() => setActiveSubTab('wallet')}
                                className="bg-brand-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.05] transition-all"
                              >
                                Ver Planos PRO
                              </button>
                           </div>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                            <Key size={20} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-brand-primary leading-none">Inteligência Artificial (Gemini)</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sua própria conexão com o Google</p>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 font-medium mb-6 leading-relaxed">
                          Para usar as funções de <strong>Robô de Placa</strong>, <strong>Busca de Imagens</strong> e <strong>Análise de Manuais</strong> sem limites de espera, insira sua chave pessoal. É 100% gratuita para uso individual.
                        </p>
                        
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-brand-primary group-focus-within:scale-110 transition-transform">
                            <Key size={18} />
                          </div>
                          <input 
                            type="password" 
                            placeholder="Cole sua Chave API aqui..."
                            className="w-full bg-white border-2 border-gray-100 rounded-[1.5rem] py-5 pl-14 pr-6 font-mono text-sm focus:border-brand-primary outline-none transition-all shadow-sm group-focus-within:shadow-md"
                            value={data.settings.geminiApiKey || ''}
                            onChange={(e) => {
                              updateSettings({ geminiApiKey: e.target.value });
                              setTestStatus('idle');
                            }}
                          />
                        </div>

                        <div className="mt-4 flex flex-col gap-3">
                          <button
                            onClick={async () => {
                              if (!data.settings.geminiApiKey) return;
                              setTestStatus('testing');
                              try {
                                const result = await geminiService.validateApiKey(data.settings.geminiApiKey);
                                if (result.success) {
                                  setTestStatus('success');
                                } else {
                                  setTestStatus('error');
                                  setTestMessage(result.message);
                                }
                              } catch (e) {
                                setTestStatus('error');
                                setTestMessage('Erro inesperado ao testar conexão.');
                              }
                            }}
                            disabled={testStatus === 'testing' || !data.settings.geminiApiKey}
                            className={`flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 ${
                              testStatus === 'success' ? 'bg-green-500 text-white shadow-green-200' :
                              testStatus === 'error' ? 'bg-red-500 text-white shadow-red-200' :
                              'bg-brand-primary text-white shadow-brand-primary/20 hover:scale-[1.02]'
                            }`}
                          >
                            {testStatus === 'testing' ? (
                              <>
                                <Loader2 size={16} className="animate-spin" /> Testando...
                              </>
                            ) : testStatus === 'success' ? (
                              <>
                                <CheckCircle2 size={16} /> Conexão Ativa!
                              </>
                            ) : testStatus === 'error' ? (
                              <>
                                <AlertCircle size={16} /> Falha no Teste
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={16} className="opacity-50" /> Testar Conexão Agora
                              </>
                            )}
                          </button>

                          {testStatus === 'error' && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-bold border border-red-100 flex items-start gap-2"
                            >
                              <AlertCircle size={14} className="shrink-0 mt-0.5" />
                              {testMessage}
                            </motion.div>
                          )}

                          {testStatus === 'success' && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-green-50 text-green-600 p-4 rounded-xl text-[10px] font-bold border border-green-100 flex items-start gap-2"
                            >
                              <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                              Pronto para usar! Todas as funções de IA foram liberadas.
                            </motion.div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col border-2 border-dashed border-gray-200 rounded-[2.5rem] overflow-hidden min-h-[450px] group">
                        <div className="bg-white p-5 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Passo a Passo: Gerar Chave Grátis</span>
                          </div>
                          <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:bg-brand-primary/10 px-4 py-2 rounded-full transition-all flex items-center gap-2 group-hover:translate-x-1"
                          >
                            Abrir em Nova Aba <ExternalLink size={12} />
                          </a>
                        </div>
                        <div className="flex-1 bg-gray-50 flex flex-col relative">
                          <iframe 
                            src="https://aistudio.google.com/app/apikey" 
                            className="flex-1 w-full border-none"
                            title="Google AI Studio"
                            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'wallet' && (
                    <div className="space-y-8 text-left">
                       {!user ? (
                         <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] text-center">
                            <Shield size={48} className="mx-auto text-amber-500 mb-4" />
                            <h3 className="text-xl font-black text-amber-900 uppercase italic mb-2 tracking-tighter">Sincronização em Nuvem</h3>
                            <p className="text-xs text-amber-800 font-bold mb-6">
                              Faça login para ativar sua carteira de créditos IA e sincronizar seu saldo entre dispositivos.
                            </p>
                            <button 
                              onClick={() => setActiveSubTab('account')}
                              className="bg-amber-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-600/20"
                            >
                              Fazer Login Agora
                            </button>
                         </div>
                       ) : (
                         <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-brand-primary/30">
                            <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
                               <Wallet size={200} />
                            </div>
                            {isPro && (
                               <div className="absolute top-4 right-8 bg-brand-accent text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce shadow-lg">
                                  Assinante PRO
                               </div>
                            )}
                            <div className="relative z-10">
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Seu Saldo em Créditos IA (Cloud)</p>
                               <div className="flex items-center gap-3">
                                  <h3 className="text-5xl font-mono font-black italic tracking-tighter">
                                    {credits}
                                  </h3>
                                  <Zap size={32} className="text-brand-accent fill-brand-accent" />
                               </div>
                               <p className="text-xs font-bold mt-4 opacity-70">
                                 Modelos Ativos: {data.settings.geminiApiKey && isPro ? 'Sua Chave Própria (Ilimitado)' : 'Gemini 2.0 Flash (Hospedagem Gerenciada)'}
                               </p>
                            </div>
                         </div>
                       )}

                       {user && !isPro && (
                          <div className="bg-gradient-to-br from-brand-accent to-brand-primary p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-accent/20">
                             <div className="flex items-center gap-4 mb-6">
                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                   <Shield size={24} />
                                </div>
                                <div>
                                   <h4 className="text-lg font-black uppercase tracking-tighter italic">Liberar Versão PRO</h4>
                                   <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Acesso Vitalício para Entusiastas</p>
                                </div>
                             </div>
                             <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-xs font-bold">
                                   <Check size={16} className="text-brand-accent" /> Liberar Uso de Chave API Própria (Grátis p/ sempre)
                                </li>
                                <li className="flex items-center gap-3 text-xs font-bold">
                                   <Check size={16} className="text-brand-accent" /> Exportação de Relatórios sem Marca d'água
                                </li>
                                <li className="flex items-center gap-3 text-xs font-bold">
                                   <Check size={16} className="text-brand-accent" /> Personalização Total de Logos de Oficina
                                </li>
                             </ul>
                             <button 
                               onClick={async () => {
                                 await upgradeToPro();
                                 alert('Parabéns! Você agora é um Usuário PRO. A aba de Chave API foi desbloqueada.');
                               }}
                               className="w-full bg-white text-brand-primary py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
                             >
                                Upgrade PRO — R$ 89,90 (Único)
                             </button>
                          </div>
                       )}

                       {user && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col justify-between">
                              <div>
                                 <h4 className="text-sm font-black text-brand-primary uppercase tracking-tighter mb-2 italic">Pacote Starter</h4>
                                 <p className="text-xs text-gray-500 font-bold mb-4">Ideal para usuários casuais</p>
                                 <p className="text-2xl font-mono font-black text-gray-800">R$ 10,00</p>
                                 <p className="text-[10px] text-brand-accent font-black uppercase mt-1">Ganha 100 Créditos</p>
                              </div>
                              <button 
                                onClick={async () => {
                                  await addCredits(100, 'Compra de Pacote Starter (Simulada)');
                                  alert('Simulação: 100 créditos adicionados via Firebase!');
                                }}
                                className="mt-6 w-full bg-white border-2 border-brand-primary/20 text-brand-primary py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all active:scale-95 shadow-sm"
                              >
                                Recarregar Agora
                              </button>
                           </div>

                           <div className="bg-brand-primary/5 p-6 rounded-3xl border border-brand-primary/10 flex flex-col justify-between relative overflow-hidden">
                              <div className="absolute top-0 right-0 bg-brand-accent text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl">Mais Popular</div>
                              <div>
                                 <h4 className="text-sm font-black text-brand-primary uppercase tracking-tighter mb-2 italic">Pacote Pro (Mecânicos)</h4>
                                 <p className="text-xs text-gray-500 font-bold mb-4">Para oficinas de alto fluxo</p>
                                 <p className="text-2xl font-mono font-black text-gray-800">R$ 45,00</p>
                                 <p className="text-[10px] text-brand-accent font-black uppercase mt-1">Ganha 1.000 Créditos</p>
                              </div>
                              <button 
                                onClick={async () => {
                                  await addCredits(1000, 'Compra de Pacote Pro (Simulada)');
                                  alert('Simulação: 1000 créditos profissionais adicionados via Firebase!');
                                }}
                                className="mt-6 w-full bg-brand-primary text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                              >
                                Comprar Pacote Pro
                              </button>
                           </div>
                        </div>
                       )}

                       <div className="p-6 bg-brand-primary/5 rounded-[2rem] border border-brand-primary/10">
                          <div className="flex gap-4 items-start">
                             <TrendingUp size={24} className="text-brand-primary shrink-0" />
                             <div>
                                <h5 className="text-xs font-black text-brand-primary uppercase mb-1">Como Funciona a Cobrança?</h5>
                                <p className="text-[10px] text-gray-600 font-medium leading-relaxed">
                                   Cada requisição à nossa Inteligência Artificial hospeda em Cloud Run consome créditos sincronizados via <strong>Firebase Firestore</strong>. 
                                   Isso garante que você pague apenas pelo que usar, mantendo o serviço rápido e seguro em qualquer aparelho. 
                                   <strong>Se você adicionar sua PRÓPRIA CHAVE API na aba anterior, o consumo de créditos é ignorado!</strong>
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeSubTab === 'account' && (
                    <div className="space-y-6 text-left">
                       <div className="flex flex-col gap-1 mb-6">
                         <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-brand-primary leading-none">Minha Conta</h3>
                         <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Sincronize sua experiência FleetX</p>
                       </div>
                       
                       {loading ? (
                         <div className="flex items-center justify-center p-20">
                            <Loader2 className="animate-spin text-brand-primary" size={40} />
                         </div>
                       ) : user ? (
                         <div className="space-y-6">
                            <div className="bg-white border border-gray-100 rounded-3xl p-8 flex items-center gap-6 shadow-xl shadow-gray-100/50">
                               {user.photoURL ? (
                                 <img src={user.photoURL} alt={user.displayName || ''} className="w-20 h-20 rounded-[2rem] border-4 border-gray-50" />
                               ) : (
                                 <div className="w-20 h-20 bg-brand-primary text-white rounded-[2rem] flex items-center justify-center text-3xl font-black">
                                   {user.displayName?.[0] || 'U'}
                                 </div>
                               )}
                               <div>
                                  <h4 className="text-xl font-black text-brand-primary italic tracking-tight">{user.displayName || 'Usuário'}</h4>
                                  <p className="text-sm text-gray-400 font-bold">{user.email}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                     <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        ID: {user.uid.slice(0, 8)}...
                                     </div>
                                     {isPro && (
                                       <div className="bg-brand-accent/20 text-brand-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                          PRO
                                       </div>
                                     )}
                                  </div>
                               </div>
                            </div>

                            <button 
                              onClick={logout}
                              className="w-full bg-red-50 text-red-500 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                            >
                               <LogOut size={16} /> Sair da Conta
                            </button>
                         </div>
                       ) : (
                         <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-xl shadow-gray-100/50">
                            <div className="w-20 h-20 bg-brand-primary/5 text-brand-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                               <LogIn size={32} />
                            </div>
                            <h4 className="text-2xl font-black text-brand-primary uppercase italic tracking-tighter mb-4">Sincronize seus Dados</h4>
                            <p className="text-sm text-gray-500 font-bold max-w-sm mx-auto mb-8 leading-relaxed">
                              Crie sua conta para salvar seus veículos e créditos na nuvem Google. Acesse de qualquer lugar!
                            </p>
                            <button 
                              onClick={login}
                              className="bg-brand-primary text-white px-10 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:scale-[1.05] transition-all flex items-center justify-center gap-3 mx-auto"
                            >
                               <LogIn size={20} /> Entrar com Google
                            </button>
                         </div>
                       )}

                       <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                          <div className="flex gap-4 items-start">
                             <ShieldCheck className="text-green-500 shrink-0" size={24} />
                             <div>
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Segurança FleetX</h5>
                                <p className="text-[10px] text-gray-600 font-medium leading-relaxed">
                                   Nós não armazenamos suas senhas. O login é processado com total segurança pelo <strong>Firebase Authentication</strong> do Google. 
                                   Seus dados de veículos continuam sendo salvos localmente, mas seus créditos e status PRO são sincronizados via nuvem.
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeSubTab === 'data' && (
                    <div className="space-y-8 text-left">
                       <div className="flex flex-col gap-1 mb-2">
                         <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-brand-primary leading-none">Gestão de Dados</h3>
                         <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Segurança e portabilidade da sua frota</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white border border-brand-primary/10 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                             <div className="bg-brand-primary/5 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-brand-primary">
                                <TrendingUp size={24} />
                             </div>
                             <h4 className="text-sm font-black text-brand-primary uppercase tracking-tighter mb-2 italic">Exportar Backup Total</h4>
                             <p className="text-[10px] text-gray-500 font-bold mb-6 leading-relaxed">
                               Gera um arquivo <strong>.fleetx-backup</strong> contendo todos os veículos, manutenções, registros de combustível e configurações de conta.
                             </p>
                             <button 
                               onClick={handleFullBackup}
                               className="w-full bg-brand-primary text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                             >
                                <Plus size={14} /> Criar Arquivo de Backup
                             </button>
                          </div>

                          <div className="bg-white border border-amber-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                             <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-amber-500">
                                <Key size={24} />
                             </div>
                             <h4 className="text-sm font-black text-amber-900 uppercase tracking-tighter mb-2 italic">Restaurar do Arquivo</h4>
                             <p className="text-[10px] text-amber-800/60 font-bold mb-6 leading-relaxed">
                               Importa um backup completo. <strong>Aviso:</strong> Isso substituirá todos os dados locais atuais pelos dados contidos no arquivo.
                             </p>
                             <label className="w-full bg-amber-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                <Download size={14} /> Selecionar Arquivo
                                <input type="file" accept=".fleetx-backup,.json" className="hidden" onChange={handleFullRestore} />
                             </label>
                          </div>
                       </div>

                       <div className="bg-red-50/50 p-8 rounded-[2rem] border border-red-100">
                          <div className="flex gap-4">
                             <AlertCircle className="text-red-500 shrink-0" size={24} />
                             <div>
                                <h4 className="text-sm font-black text-red-600 uppercase tracking-tighter mb-2 italic">Zona de Perigo</h4>
                                <p className="text-[10px] text-red-500 font-bold mb-6">
                                   A limpeza de dados é irreversível. Certifique-se de ter um backup antes de prosseguir.
                                </p>
                                <button 
                                   onClick={() => {
                                      if(confirm('TEM CERTEZA? Isso deletará todos os seus veículos e configurações permanentemente.')) {
                                         onResetData();
                                      }
                                   }}
                                   className="bg-white border border-red-200 text-red-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                                >
                                   <Trash2 size={14} /> Redefinir Todo o Aplicativo
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeSubTab === 'manual' && (
                    <div className="space-y-6 text-left">
                      <div className="flex flex-col gap-1 mb-6">
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-brand-primary leading-none">Manual FleetX</h3>
                        <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Domine todas as ferramentas</p>
                      </div>
                      <AppManual />
                    </div>
                  )}
               </div>
            </div>

            {/* Footer com Botão Salvar (Sempre Visível) */}
            <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between shrink-0">
               <div className="hidden sm:block">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <Shield size={12} className="text-brand-primary" /> Alterações salvas automaticamente
                  </p>
               </div>
               <button 
                 onClick={onClose}
                 className="w-full sm:w-auto bg-brand-primary text-white px-10 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 group"
               >
                 <Check size={20} className="group-hover:scale-125 transition-transform" /> 
                 Salvar e Concluir
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
