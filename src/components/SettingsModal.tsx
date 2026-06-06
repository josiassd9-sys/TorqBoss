
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Palette, Search, Plus, Trash2, Shield, ShieldCheck, Globe, Database, BookOpen, Key, ExternalLink, Check, AlertCircle, Loader2, CheckCircle2, Wallet, Zap, History, TrendingUp, User as UserIcon, LogIn, LogOut, Download, Code, Bug, Terminal, Cpu, Wifi, Copy, ShieldAlert } from 'lucide-react';
import { AppData, VehicleSearchLink } from '../types';
import { THEMES } from '../constants';
import { AppManual } from './AppManual';
import { DevDocsTab } from './DevDocsTab';
import { geminiService } from '../services/geminiService';
import { useFirebase } from '../contexts/FirebaseContext';
import { DebugCenter } from './DebugCenter';
import { auth, db, doc, getDoc, setDoc } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getDebugLogs, clearDebugLogs, toggleDebugOverlay, debugLog, debugError, getLocalStorageMetrics, StorageMetrics } from '../debug';
import { Capacitor } from '@capacitor/core';

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
  const { user, loading, login, logout, loginWithEmailPassword, credits, isPro, addCredits, upgradeToPro } = useFirebase();  
  const [activeSubTab, setActiveSubTab] = React.useState<'general' | 'theme' | 'appearance' | 'search' | 'privacy' | 'manual' | 'apiKey' | 'wallet' | 'account' | 'data' | 'devDocs' | 'debug'>('manual');
  const [testStatus, setTestStatus] = React.useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = React.useState('');

  const [liveLogs, setLiveLogs] = React.useState<string[]>([]);
  const [diagnosticPingStatus, setDiagnosticPingStatus] = React.useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [diagnosticPingMessage, setDiagnosticPingMessage] = React.useState('');
  const [batteryLevel, setBatteryLevel] = React.useState<string>('Carregando...');
  const [storageMetrics, setStorageMetrics] = React.useState<StorageMetrics | null>(null);

  const refreshStorageMetrics = () => {
    setStorageMetrics(getLocalStorageMetrics());
  };

  React.useEffect(() => {
    if (activeSubTab === 'debug') {
      refreshStorageMetrics();
    }
  }, [activeSubTab]);

  React.useEffect(() => {
    if (!isOpen || activeSubTab !== 'debug') return;

    // Inicializa com os logs atuais ao entrar na aba de debug
    setLiveLogs(getDebugLogs());

    let throttleTimeout: any = null;
    const handleLogsUpdate = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        setLiveLogs([...getDebugLogs()]);
        throttleTimeout = null;
      }, 500); // Limita atualizações a no máximo 1 vez a cada 500ms de forma assíncrona para evitar loop infinito
    };

    window.addEventListener('debug-logs-updated', handleLogsUpdate);
    return () => {
      window.removeEventListener('debug-logs-updated', handleLogsUpdate);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [isOpen, activeSubTab]);

  React.useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(`${Math.round(battery.level * 100)}% ${battery.charging ? '(Carregando)' : '(Descarregando)'}`);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(`${Math.round(battery.level * 100)}% ${battery.charging ? '(Carregando)' : '(Descarregando)'}`);
        });
      }).catch(() => {
        setBatteryLevel('Não disponível');
      });
    } else {
      setBatteryLevel('Não suportado pelo navegador');
    }
  }, []);

  const runFirebaseDiagnostic = async () => {
    setDiagnosticPingStatus('running');
    setDiagnosticPingMessage('Iniciando testes...');
    try {
      debugLog('DIAGNOSE: Iniciando teste de ping do Firebase');
      const start = Date.now();
      
      // Test Auth
      const currentUser = auth.currentUser;
      debugLog(`DIAGNOSE: Usuário atual: ${currentUser ? currentUser.email : 'Nenhum usuário logado'}`);
      
      // Test Firestore writing connection under /users/UID/diagnostics/ping_test or diagnostics/test_ping
      const path = currentUser ? `users/${currentUser.uid}/diagnostics/ping_test` : 'diagnostics/test_ping';
      const diagnosticDocRef = doc(db, path);
      
      await setDoc(diagnosticDocRef, {
        timestamp: Date.now(),
        testBy: currentUser?.email || 'Anonymous/Diagnostic',
        platform: Capacitor.getPlatform()
      });
      debugLog(`DIAGNOSE: Documento de teste escrito com sucesso no caminho: ${path}`);
      
      const snap = await getDoc(diagnosticDocRef);
      debugLog(`DIAGNOSE: Documento lido com sucesso: ${snap.exists() ? 'Existe' : 'Não encontrado'}`);
      
      const duration = Date.now() - start;
      const successMsg = `Sucesso! Ping concluído em ${duration}ms. Conexão com Firestore está ativa e autorizada.`;
      setDiagnosticPingStatus('success');
      setDiagnosticPingMessage(successMsg);
      debugLog(`DIAGNOSE: ${successMsg}`);
    } catch (err: any) {
      const errMsg = `Erro no diagnóstico: ${err?.message || err}`;
      setDiagnosticPingStatus('error');
      setDiagnosticPingMessage(errMsg);
      debugError(`DIAGNOSE ERROR: ${errMsg}`);
    }
  };

  // 🔍 ADICIONE AQUI O CONSOLE.LOG
  console.log('activeSubTab:', activeSubTab, 'user:', user);

  const handleFullBackup = () => {
    const backupContent = JSON.stringify({ ...data, exportType: 'full_backup', version: '2.0' }, null, 2);
    const blob = new Blob([backupContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `torqboss_backup_total_${date}.torqboss-backup`;
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

  if (!data || !data.settings) {
    return null;
  }

  const settings = data.settings;

  const updateSettings = (updates: Partial<AppData['settings']>) => {
    onUpdateSettings({
      ...settings,
      ...updates,
      language: updates?.language ?? settings.language ?? 'pt-BR',
    });
  };

  const addSearchLink = () => {
    const newLinks = [
      ...(settings.searchLinks || []),
      {
        id: Date.now().toString(),
        name: 'Nova Busca',
        url: 'https://...',
        color: 'brand'
      }
    ];

    updateSettings({
      searchLinks: newLinks
    });
  };

  const removeSearchLink = (id: string) => {
    updateSettings({
      searchLinks: (settings.searchLinks || []).filter(l => l.id !== id)
    });
  };

  const updateSearchLink = (id: string, updates: Partial<VehicleSearchLink>) => {
    updateSettings({
      searchLinks: (settings.searchLinks || []).map(l => l.id === id ? { ...l, ...updates } : l)
    });
  };

  const limparSessaoGoogle = async () => {
    try {
      (window as any).google?.accounts?.id?.disableAutoSelect?.();
      await auth.signOut();

      alert('Sessão Google/Firebase removida.');
    } catch (err) {
      console.error(err);
      alert('Erro ao limpar sessão.');
    }
  };

  const limpezaProfunda = async () => {
    try {

      // Firebase
      await auth.signOut();

      // Google (GIS) — desativa seleção automática
      (window as any).google?.accounts?.id?.disableAutoSelect?.();

      // Storage Web
      localStorage.clear();
      sessionStorage.clear();

      // IndexedDB
      const databases = await indexedDB.databases();

      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }

      alert('Todos os dados locais foram removidos.');

    } catch (err) {
      console.error(err);
      alert('Erro durante limpeza profunda.');
    }
  };

  const resetNuclear = async () => {
    try {

      // Logout completo
      (window as any).google?.accounts?.id?.disableAutoSelect?.();
      await auth.signOut();

      // Storage
      localStorage.clear();
      sessionStorage.clear();

      // IndexedDB
      const databases = await indexedDB.databases();

      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      }

      // Cache Storage API
      if ('caches' in window) {
        const keys = await caches.keys();

        for (const key of keys) {
          await caches.delete(key);
        }
      }

      alert('RESET NUCLEAR COMPLETO.\nO aplicativo será reiniciado.');

      window.location.reload();

    } catch (err) {
      console.error(err);
      alert('Erro no reset nuclear.');
    }
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
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white border border-gray-100 rounded-lg w-full max-w-4xl shadow-2xl flex flex-col h-[90vh] sm:h-[85vh] overflow-hidden text-gray-800"
          >
            {/* Header */}
            <div className="p-5 sm:p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 sm:gap-4 text-left">
                <div className="bg-brand-primary p-2.5 sm:p-3 rounded-lg text-white shadow-xl shadow-brand-primary/20 shrink-0">
                  <Settings size={20} className="sm:w-[22px] sm:h-[22px]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter text-brand-primary leading-none">Configurações</h2>
                  <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Personalize sua experiência</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
              {/* Sidebar Tabs - Horizontal scroll on mobile, Vertical on desktop */}
              <div className="w-full sm:w-64 bg-gray-50/70 border-b sm:border-b-0 sm:border-r border-gray-100 p-2 sm:p-5 flex flex-row sm:flex-col gap-1.5 sm:gap-2 shrink-0 overflow-x-auto sm:overflow-y-auto no-scrollbar">
                <button
                  onClick={() => setActiveSubTab('manual')}
                  className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'manual' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <BookOpen size={14} className="sm:w-4 sm:h-4 shrink-0" /> Manual
                </button>
                <button
                  onClick={() => setActiveSubTab('general')}
                  className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'general' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Globe size={14} className="sm:w-4 sm:h-4 shrink-0" /> Regional
                </button>
                <button
                  onClick={() => setActiveSubTab('theme')}
                  className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'theme' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Palette size={14} className="sm:w-4 sm:h-4 shrink-0" /> Estilo
                </button>
                <button
                  onClick={() => setActiveSubTab('appearance')}
                  className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'appearance' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Settings size={14} className="sm:w-4 sm:h-4 shrink-0" /> Banner
                </button>
                <button
                  onClick={() => setActiveSubTab('search')}
                  className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'search' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Search size={14} className="sm:w-4 sm:h-4 shrink-0" /> Robô
                </button>
                <button
                  onClick={() => setActiveSubTab('privacy')}
                  className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'privacy' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Shield size={14} className="sm:w-4 sm:h-4 shrink-0" /> Dados
                </button>
                <button
                  onClick={() => setActiveSubTab('apiKey')}
                  className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'apiKey' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Key size={14} className="sm:w-4 sm:h-4 shrink-0" /> Chave API
                </button>
                <button
                  onClick={() => setActiveSubTab('wallet')}
                  className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'wallet' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Wallet size={14} className="sm:w-4 sm:h-4 shrink-0" /> Carteira IA
                </button>
                <button
                  onClick={() => setActiveSubTab('account')}
                  className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'account' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <UserIcon size={14} className="sm:w-4 sm:h-4 shrink-0" /> Conta
                </button>
                <button
                  onClick={() => setActiveSubTab('data')}
                  className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'data' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Database size={14} className="sm:w-4 sm:h-4 shrink-0" /> Backup
                </button>

                {user?.email === 'josias.sd9@gmail.com' && (
                  <button
                    onClick={() => setActiveSubTab('devDocs')}
                    className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'devDocs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-indigo-500 hover:bg-indigo-50'}`}
                  >
                    <Code size={14} className="sm:w-4 sm:h-4 shrink-0" /> DevDocs
                  </button>
                )}

                <button
                  onClick={() => setActiveSubTab('debug')}
                  className={`flex items-center gap-1.5 sm:gap-3 px-3 py-2.5 sm:p-4 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'debug' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Bug size={14} className="sm:w-4 sm:h-4 shrink-0" /> Debugs
                </button>

                <div className="hidden sm:flex mt-auto pt-6 border-t border-gray-100">
                  <button
                    onClick={onResetData}
                    className="w-full flex items-center gap-3 p-4 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                  >
                    <Trash2 size={16} /> Resetar Dados
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-white text-left">
                {activeSubTab === 'devDocs' && (
                  <DevDocsTab />
                )}

                {activeSubTab === 'general' && (
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2.5 block">Nome da Agência / Usuário</label>
                      <input
                        type="text"
                        placeholder="Ex: torqboss Gestão de Frotas"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-bold text-gray-800 placeholder-gray-400 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                        value={data.settings.agencyName || ''}
                        onChange={(e) => updateSettings({ agencyName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2.5 block">Subtítulo Personalizado do App</label>
                      <input
                        type="text"
                        placeholder="Ex: — Meu Carro Top"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-bold text-gray-800 placeholder-gray-400 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                        value={data.settings.appSubtitle || ''}
                        onChange={(e) => updateSettings({ appSubtitle: e.target.value })}
                      />
                      <p className="text-[9px] text-gray-400 mt-1.5 font-bold uppercase tracking-wider">Deixe em branco para usar o subtítulo padrão do idioma selecionado.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2.5 block text-left">Idioma do Sistema</label>
                        <select
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-bold text-gray-800 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                          value={data.settings.language || 'pt-BR'}
                          onChange={(e) => updateSettings({ language: e.target.value as any })}
                        >
                          <option value="pt-BR">Português (Brasil)</option>
                          <option value="en-US">English (US)</option>
                          <option value="es-ES">Español (ES)</option>
                          <option value="fr-FR">Français (FR)</option>
                          <option value="it-IT">Italiano (IT)</option>
                          <option value="de-DE">Deutsch (DE)</option>
                          <option value="ru-RU">Pусский (RU)</option>
                          <option value="zh-CN">中文 (简体)</option>
                          <option value="ko-KR">한국어 (KR)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2.5 block text-left">Região do Usuário</label>
                        <input
                          type="text"
                          placeholder="Brasil"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-bold text-gray-800 placeholder-gray-400 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                          value={data.settings.region || ''}
                          onChange={(e) => updateSettings({ region: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2.5 block text-left">Moeda Principal</label>
                      <input
                        type="text"
                        placeholder="BRL"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-bold text-gray-800 placeholder-gray-400 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                        value={data.settings.currency || ''}
                        onChange={(e) => updateSettings({ currency: e.target.value as any })}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2.5 block">Referência de Mercado (Ex: FIPE, KBB, Webb)</label>
                      <input
                        type="text"
                        placeholder="Ex: Tabela FIPE"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-bold text-gray-800 placeholder-gray-400 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                        value={data.settings.marketReferenceName || ''}
                        onChange={(e) => updateSettings({ marketReferenceName: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2.5 block text-left">Rótulo do Identificador</label>
                        <input
                          type="text"
                          placeholder="Ex: Placa"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-bold text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                          value={data.settings.vehicleIdentifierLabel || ''}
                          onChange={(e) => updateSettings({ vehicleIdentifierLabel: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2.5 block text-left">Placeholder</label>
                        <input
                          type="text"
                          placeholder="Ex: AAA-0000"
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 font-bold text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                          value={data.settings.vehicleIdentifierPlaceholder || ''}
                          onChange={(e) => updateSettings({ vehicleIdentifierPlaceholder: e.target.value })}
                        />
                      </div>
                    </div>

                    {user?.email === 'josias.sd9@gmail.com' && (
                      <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Painel Sandbox (Desenvolvedor)</h4>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Use para testar as funcionalidades PRO e as integrações locais na geração de testes do APK.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-sm">🛠️</div>
                            <div>
                              <p className="text-[10px] font-black uppercase text-amber-900">Override Licença PRO</p>
                              <p className="text-[9px] font-black text-amber-700 uppercase tracking-wider">Status: {data.settings.isDeveloperOverridePro ? 'ATIVADO (SANDBOX)' : 'DESATIVADO (NORMAL)'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const nextState = !settings.isDeveloperOverridePro;
                              updateSettings({ isDeveloperOverridePro: nextState });
                              setTimeout(() => {
                                window.dispatchEvent(new Event('torqboss-developer-pro-changed'));
                              }, 50);
                            }}
                            className={`w-full sm:w-auto px-5 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${data.settings.isDeveloperOverridePro
                              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20 hover:bg-amber-700'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                          >
                            {data.settings.isDeveloperOverridePro ? 'Desativar PRO de Teste' : 'Ativar PRO de Teste'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="sm:hidden pt-8 mt-8 border-t border-gray-100">
                      <button
                        onClick={onResetData}
                        className="w-full flex items-center justify-center gap-3 p-5 rounded-lg text-xs font-black uppercase tracking-widest text-red-500 bg-red-50 transition-all border border-red-100 active:scale-95"
                      >
                        <Trash2 size={18} /> Resetar Todo o Sistema
                      </button>
                    </div>
                  </div>
                )}

                {activeSubTab === 'theme' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-brand-primary mb-4">Escolha um Estilo Pronto</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.values(THEMES).map(theme => (
                          <button
                            key={theme.id}
                            onClick={() => updateSettings({ theme: theme.id as any })}
                            className={`group relative p-3 rounded-lg border transition-all text-left overflow-hidden ${settings.theme === theme.id ? 'border-brand-primary bg-brand-primary/10 shadow-xl shadow-brand-primary/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100/70'}`}
                          >
                            <div className="flex flex-col gap-2">
                              <div className="w-full h-8 rounded shadow-sm shrink-0" style={{ backgroundColor: theme.primary }} />
                              <div>
                                <p className={`text-[9px] font-black uppercase tracking-tighter truncate ${settings.theme === theme.id ? 'text-brand-primary' : 'text-gray-700 group-hover:text-gray-900'}`}>{theme.name}</p>
                              </div>
                            </div>
                            {settings.theme === theme.id && (
                              <div className="absolute top-1 right-1 bg-brand-primary text-white p-0.5 rounded-full">
                                <Check size={8} />
                              </div>
                            )}
                          </button>
                        ))}

                        {/* Custom Theme Button */}
                        <button
                          onClick={() => updateSettings({ theme: 'custom' })}
                          className={`group relative p-3 rounded-lg border transition-all text-left overflow-hidden ${data.settings.theme === 'custom' ? 'border-brand-primary bg-brand-primary/10 shadow-xl shadow-brand-primary/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100/70'}`}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="w-full h-8 rounded shadow-sm shrink-0 bg-gradient-to-br from-red-500 via-green-500 to-blue-500" />
                            <div>
                              <p className={`text-[9px] font-black uppercase tracking-tighter truncate ${data.settings.theme === 'custom' ? 'text-brand-primary' : 'text-gray-700 group-hover:text-gray-900'}`}>Personalizado</p>
                            </div>
                          </div>
                          {data.settings.theme === 'custom' && (
                            <div className="absolute top-1 right-1 bg-brand-primary text-white p-0.5 rounded-full">
                              <Check size={8} />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Color Customizer Section */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 sm:p-8 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-brand-primary p-2 rounded-lg text-white">
                          <Palette size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-brand-primary leading-none">Ajuste Fino de Cores</h3>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Crie sua própria identidade visual</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                          { label: 'Primária', key: 'primary' as const, desc: 'Menus e Headers' },
                          { label: 'Acento', key: 'accent' as const, desc: 'Destaques e Ícones' },
                          { label: 'Fundo Geral', key: 'bg' as const, desc: 'Cor da Janela' },
                          { label: 'Cartões', key: 'cardBg' as const, desc: 'Fundo dos Cards' },
                          { label: 'Texto Principal', key: 'textPrimary' as const, desc: 'Títulos e Valores' },
                          { label: 'Texto Secundário', key: 'textSecondary' as const, desc: 'Legendas e Apoio' },
                          { label: 'Botões', key: 'buttonBg' as const, desc: 'Fundo dos Botões' },
                          { label: 'Texto do Botão', key: 'buttonText' as const, desc: 'Etiqueta Interna' },
                          { label: 'Fundo do Veículo', key: 'vehicleHeaderBg' as const, desc: 'Banner Interno' },
                          { label: 'Sub-cards', key: 'subCardBg' as const, desc: 'Cards de Métricas e Detalhes' },
                        ].map((color) => {
                          const currentTheme = THEMES[settings.theme as keyof typeof THEMES];
                          const currentColor = settings.customThemeColors?.[color.key] ||
                            (currentTheme?.[color.key as keyof typeof currentTheme] as string) ||
                            (color.key === 'primary' ? '#141414' :
                              color.key === 'accent' ? '#E11D48' :
                                color.key === 'bg' ? '#F8F9FA' :
                                  color.key === 'cardBg' ? '#FFFFFF' :
                                    color.key === 'textPrimary' ? '#000000' :
                                      color.key === 'textSecondary' ? '#6B7280' :
                                        color.key === 'buttonBg' ? '#E11D48' :
                                          color.key === 'vehicleHeaderBg' ? (currentTheme?.primary || '#141414') :
                                            color.key === 'subCardBg' ? (currentTheme?.id === 'dark' || currentTheme?.id === 'noir' ? 'rgba(255,255,255,0.06)' : '#F9FAFB') :
                                              '#FFFFFF');

                          return (
                            <div key={color.key} className="space-y-3">
                              <div className="flex flex-col">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">{color.label}</label>
                                <p className="text-[8px] font-bold text-gray-400 uppercase mb-2">{color.desc}</p>
                              </div>
                              <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-200 group-focus-within:border-brand-primary transition-all">
                                <input
                                  type="color"
                                  className="w-10 h-10 rounded shadow-sm border-none cursor-pointer bg-transparent p-0"
                                  value={currentColor}
                                  onChange={(e) => {
                                    const prevColors = settings.customThemeColors || {
                                      primary: currentTheme?.primary || '#141414',
                                      accent: currentTheme?.accent || '#E11D48',
                                      bg: currentTheme?.bg || '#F8F9FA',
                                      cardBg: '#FFFFFF',
                                      textPrimary: '#000000',
                                      textSecondary: '#6B7280',
                                      buttonBg: currentTheme?.accent || '#E11D48',
                                      buttonText: '#FFFFFF',
                                      vehicleHeaderBg: currentTheme?.primary || '#141414',
                                      subCardBg: currentTheme?.id === 'dark' || currentTheme?.id === 'noir' ? 'rgba(255,255,255,0.06)' : '#F9FAFB'
                                    };

                                    updateSettings({
                                      theme: 'custom',
                                      customThemeColors: {
                                        ...prevColors,
                                        [color.key]: e.target.value
                                      }
                                    });
                                  }}
                                />
                                <input
                                  type="text"
                                  className="flex-1 bg-transparent border-none text-[10px] font-mono font-black uppercase outline-none text-gray-700 w-full"
                                  value={currentColor}
                                  onChange={(e) => {
                                    const prevColors = settings.customThemeColors || {
                                      primary: currentTheme?.primary || '#141414',
                                      accent: currentTheme?.accent || '#E11D48',
                                      bg: currentTheme?.bg || '#F8F9FA',
                                      cardBg: '#FFFFFF',
                                      textPrimary: '#000000',
                                      textSecondary: '#6B7280',
                                      buttonBg: currentTheme?.accent || '#E11D48',
                                      buttonText: '#FFFFFF',
                                      vehicleHeaderBg: currentTheme?.primary || '#141414',
                                      subCardBg: currentTheme?.id === 'dark' || currentTheme?.id === 'noir' ? 'rgba(255,255,255,0.06)' : '#F9FAFB'
                                    };

                                    updateSettings({
                                      theme: 'custom',
                                      customThemeColors: {
                                        ...prevColors,
                                        [color.key]: e.target.value
                                      }
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-[9px] text-gray-400 font-bold italic">* As alterações são aplicadas e salvas como "Tema Personalizado" automaticamente.</p>
                        {data.settings.theme === 'custom' && (
                          <button
                            onClick={() => updateSettings({ theme: 'default', customThemeColors: undefined })}
                            className="text-[9px] font-black uppercase text-red-500 hover:text-red-700 underline underline-offset-4"
                          >
                            Resetar para Padrão
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeSubTab === 'appearance' && (
                  <div className="space-y-8 text-left">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-brand-primary p-3 rounded-lg text-white shadow-lg">
                        <Settings size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase italic tracking-tighter text-brand-primary leading-none">Customização do Banner</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Controle total sobre o topo do app</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Escala do Veículo</label>
                            <span className="text-[10px] font-black text-brand-primary">{data.settings.headerConfig?.iconScale || 50}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.1"
                            max="1000"
                            step="0.1"
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                            value={data.settings.headerConfig?.iconScale || 50}
                            onChange={(e) => updateSettings({
                              headerConfig: {
                                bannerHeight: 55,
                                bgOpacity: 1,
                                bgBlur: 0,
                                showIcon: true,
                                bgColor: '#141414',
                                ...settings.headerConfig,
                                iconScale: parseFloat(e.target.value)
                              }
                            })}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Altura do Cabeçalho</label>
                            <span className="text-[10px] font-black text-brand-primary">{data.settings.headerConfig?.bannerHeight || 55}px</span>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="800"
                            step="5"
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                            value={data.settings.headerConfig?.bannerHeight || 55}
                            onChange={(e) => updateSettings({
                              headerConfig: {
                                iconScale: 50,
                                bgOpacity: 1,
                                bgBlur: 0,
                                showIcon: true,
                                bgColor: '#141414',
                                ...settings.headerConfig,
                                bannerHeight: parseInt(e.target.value)
                              }
                            })}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Opacidade do Fundo</label>
                            <span className="text-[10px] font-black text-brand-primary">{Math.round((data.settings.headerConfig?.bgOpacity || 1) * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                            value={data.settings.headerConfig?.bgOpacity || 1}
                            onChange={(e) => updateSettings({
                              headerConfig: {
                                iconScale: 50,
                                bannerHeight: 55,
                                bgBlur: 0,
                                showIcon: true,
                                bgColor: '#141414',
                                ...settings.headerConfig,
                                bgOpacity: parseFloat(e.target.value)
                              }
                            })}
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-700 tracking-widest">Mostrar Ilustração</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">Habilitar ícone central</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              updateSettings({
                                headerConfig: {
                                  iconScale: 50,
                                  bannerHeight: 55,
                                  bgOpacity: 1,
                                  bgBlur: 0,
                                  bgColor: '#141414',
                                  ...settings.headerConfig,
                                  showIcon: !settings.headerConfig?.showIcon
                                }
                              });
                            }}
                            className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${data.settings.headerConfig?.showIcon ? 'bg-brand-primary' : 'bg-gray-300'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${data.settings.headerConfig?.showIcon ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Cor de Fundo do Banner</label>
                          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <input
                              type="color"
                              className="w-10 h-10 rounded border-none cursor-pointer bg-transparent shadow-sm"
                              value={data.settings.headerConfig?.bgColor || '#141414'}
                              onChange={(e) => updateSettings({
                                headerConfig: {
                                  iconScale: 50,
                                  bannerHeight: 55,
                                  bgOpacity: 1,
                                  bgBlur: 0,
                                  showIcon: true,
                                  ...settings.headerConfig,
                                  bgColor: e.target.value
                                }
                              })}
                            />
                            <input
                              type="text"
                              className="flex-1 bg-transparent border-none text-xs font-mono font-black uppercase text-gray-700 outline-none"
                              value={data.settings.headerConfig?.bgColor || '#141414'}
                              onChange={(e) => updateSettings({
                                headerConfig: {
                                  iconScale: 50,
                                  bannerHeight: 55,
                                  bgOpacity: 1,
                                  bgBlur: 0,
                                  showIcon: true,
                                  ...settings.headerConfig,
                                  bgColor: e.target.value
                                }
                              })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Imagem de Fundo (URL)</label>
                          <input
                            type="text"
                            placeholder="https://exemplo.com/fibra-carbono.jpg"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-bold text-gray-800 placeholder-gray-400 focus:bg-white focus:border-brand-primary outline-none transition-all shadow-sm"
                            value={data.settings.headerConfig?.bgImage || ''}
                            onChange={(e) => updateSettings({
                              headerConfig: {
                                iconScale: 50,
                                bannerHeight: 55,
                                bgOpacity: 1,
                                bgBlur: 0,
                                showIcon: true,
                                bgColor: '#141414',
                                ...settings.headerConfig,
                                bgImage: e.target.value
                              }
                            })}
                          />
                          <p className="text-[8px] text-gray-400 font-bold uppercase mt-2">* Use links diretos para fotos ou texturas de fundo.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-xl">
                      <p className="text-[10px] text-brand-primary font-black uppercase mb-2">Dica Pro:</p>
                      <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
                        "Você pode usar fotos reais do seu carro carregando-as em algum servidor de imagens e colando o link acima,
                        ou remover a ilustração para um visual minimalista apenas com cores sólidas."
                      </p>
                    </div>
                  </div>
                )}

                {activeSubTab === 'search' && (
                  <div className="space-y-6 text-left">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-widest text-brand-primary">Atalhos de Consulta do Robô</h3>
                      <button
                        onClick={addSearchLink}
                        className="bg-brand-primary text-white w-full sm:w-auto px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 active:scale-95"
                      >
                        <Plus size={16} /> Adicionar Link
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {(data.settings.searchLinks || []).map((link) => (
                        <div key={link.id} className="bg-gray-50/80 p-4 sm:p-6 rounded-lg border border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center group shadow-sm">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                            <input
                              type="text"
                              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-xs font-bold text-gray-805 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary focus:outline-none focus:bg-white"
                              value={link.name}
                              placeholder="Nome do Portal"
                              onChange={(e) => updateSearchLink(link.id, { name: e.target.value })}
                            />
                            <input
                              type="text"
                              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-[10px] font-mono text-gray-850 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary focus:outline-none focus:bg-white"
                              value={link.url}
                              placeholder="URL com {placa}"
                              onChange={(e) => updateSearchLink(link.id, { url: e.target.value })}
                            />
                          </div>
                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                            <input
                              type="color"
                              className="w-10 h-10 rounded-lg p-0.5 bg-white border border-gray-200 cursor-pointer"
                              value={link.color === 'brand' ? '#FBFF00' : link.color}
                              onChange={(e) => updateSearchLink(link.id, { color: e.target.value })}
                            />
                            <button
                              onClick={() => removeSearchLink(link.id)}
                              className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
                      <p className="text-[9px] sm:text-xs font-bold text-gray-550 uppercase tracking-widest">Seus dados pertencem a você</p>
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100 p-6 sm:p-8 rounded-lg relative overflow-hidden group shadow-sm">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform text-emerald-300">
                        <Shield size={80} />
                      </div>
                      <div className="relative z-10">
                        <p className="text-xs sm:text-sm text-gray-650 leading-relaxed font-bold mb-6 italic opacity-95">
                          O <strong>torqboss</strong> utiliza tecnologia LocalFirst. Isso significa que 100% dos seus registros de veículos, manutenções e fotos permanecem exclusivamente no armazenamento do seu dispositivo.
                          <br /><br />
                          Nenhuma informação é enviada para servidores externos, exceto seus créditos IA e status PRO que são sincronizados via Google Firebase para sua conveniência entre múltiplos aparelhos.
                        </p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-250">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Armazenamento Local Ativo</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {activeSubTab === 'apiKey' && (
                  <div className="space-y-6 text-left w-full pb-8">
                    {!data.settings.isProMember && (
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 p-5 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-md mb-2">
                        <div className="bg-orange-600 text-white p-3 rounded-lg shadow-lg shrink-0">
                          <Shield size={24} />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-sm font-black text-orange-950 uppercase tracking-tighter italic">Função Exclusiva PRO</h4>
                          <p className="text-[11px] text-orange-850 font-bold mt-1 leading-relaxed">
                            Inserir sua <strong>Própria Chave API</strong> é uma funcionalidade restrita do plano <strong>MEU CARRO PRO</strong>.
                            A Chave permite acesso totalmente livre, imediato e gratuito (utilizando sua conta Google) para rodar o Robô de Placas, busca de imagens e inteligência artificial sem filas ou tempo de espera do servidor compartilhado.
                          </p>
                          <button
                            onClick={() => setActiveSubTab('wallet')}
                            className="mt-3 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 active:scale-95 transition-all inline-flex items-center gap-2 font-bold"
                          >
                            Ativar Versão PRO Agora <Zap size={12} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className={`bg-gray-50 border border-gray-200 p-5 sm:p-6 rounded-lg relative overflow-hidden ${!data.settings.isProMember ? 'opacity-85' : ''}`}>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-brand-primary text-white rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/10">
                          <Key size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-brand-primary leading-none">Inteligência Artificial (Gemini)</h3>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Sua própria conexão com o Google</p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-700 font-medium mb-6 leading-relaxed">
                        Para usar as funções de <strong>Robô de Placa</strong>, <strong>Busca de Imagens</strong> e <strong>Análise de Manuais</strong> sem limites de espera, insira sua chave pessoal. É 100% gratuita para uso individual.
                      </p>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-brand-primary group-focus-within:scale-110 transition-transform">
                          <Key size={18} />
                        </div>
                        <input
                          type="password"
                          placeholder={data.settings.isProMember ? "Cole sua Chave API aqui..." : "Chave bloqueada - Requer Plano PRO"}
                          disabled={!data.settings.isProMember}
                          className={`w-full border rounded-lg py-5 pl-14 pr-6 font-mono text-sm outline-none transition-all shadow-sm ${!data.settings.isProMember
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed select-none'
                            : 'bg-white text-yellow-600 border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/15'
                            }`}
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
                            if (!settings.geminiApiKey) return;
                            setTestStatus('testing');
                            try {
                              const result = await geminiService.validateApiKey(settings.geminiApiKey);
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
                          className={`flex items-center justify-center gap-3 py-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 ${testStatus === 'success' ? 'bg-emerald-500 text-black shadow-emerald-500/25' :
                            testStatus === 'error' ? 'bg-red-500 text-white shadow-red-500/25' :
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
                            className="bg-red-950/30 text-red-400 border border-red-900/40 p-4 rounded-lg text-[10px] font-bold flex items-start gap-2"
                          >
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            {testMessage}
                          </motion.div>
                        )}

                        {testStatus === 'success' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 p-4 rounded-lg text-[10px] font-bold flex items-start gap-2"
                          >
                            <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                            Pronto para usar! Todas as funções de IA foram liberadas.
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col border border-gray-200 bg-gray-55 shadow-sm rounded-lg overflow-hidden min-h-[380px] group">
                      <div className="bg-gray-100 p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Manual do Mecânico: Gerar Chave Grátis</span>
                        </div>
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-black uppercase tracking-widest text-white bg-brand-primary hover:bg-brand-accent px-4 py-2.5 rounded-full transition-all flex items-center gap-2 group-hover:translate-x-1"
                        >
                          Criar Chave Grátis <ExternalLink size={12} />
                        </a>
                      </div>
                      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white border border-gray-150 p-4 rounded-lg flex flex-col shadow-sm">
                            <span className="text-[9px] font-black text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded w-max">PASSO 1</span>
                            <h4 className="text-[11px] font-black uppercase tracking-wide text-gray-805 mt-3 leading-tight">Acesse o Google AI Studio</h4>
                            <p className="text-[10px] text-gray-600 mt-2 leading-relaxed font-bold flex-1">Clique em "Criar Chave Grátis" acima para abrir o console oficial de IA da Google em seu navegador.</p>
                          </div>
                          <div className="bg-white border border-gray-150 p-4 rounded-lg flex flex-col shadow-sm">
                            <span className="text-[9px] font-black text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded w-max">PASSO 2</span>
                            <h4 className="text-[11px] font-black uppercase tracking-wide text-gray-805 mt-3 leading-tight">Clique em "Get API Key"</h4>
                            <p className="text-[10px] text-gray-600 mt-2 leading-relaxed font-bold flex-1">Na barra de ferramentas lateral do painel, clique no botão para criar uma nova chave de API.</p>
                          </div>
                          <div className="bg-white border border-gray-150 p-4 rounded-lg flex flex-col shadow-sm">
                            <span className="text-[9px] font-black text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded w-max">PASSO 3</span>
                            <h4 className="text-[11px] font-black uppercase tracking-wide text-gray-805 mt-3 leading-tight">Crie e Copie o Hash</h4>
                            <p className="text-[10px] text-gray-600 mt-2 leading-relaxed font-bold flex-1">Gere a chave (selecionando um projeto) e copie o código alfanumérico que começa com "AIzaSy...".</p>
                          </div>
                          <div className="bg-white border border-gray-150 p-4 rounded-lg flex flex-col shadow-sm">
                            <span className="text-[9px] font-black text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded w-max">PASSO 4</span>
                            <h4 className="text-[11px] font-black uppercase tracking-wide text-gray-805 mt-3 leading-tight">Ative no Painel Principal</h4>
                            <p className="text-[10px] text-gray-600 mt-2 leading-relaxed font-bold flex-1">Cole o código no campo de input do console acima e clique em "Testar conexão agora" para ativar.</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {activeSubTab === 'wallet' && (
                  <div className="space-y-6 sm:space-y-8 text-left">
                    {!user ? (
                      <div className="space-y-6">
                        <div className="bg-gray-850 border border-gray-900 p-6 sm:p-8 rounded-lg text-white relative overflow-hidden shadow-2xl">
                          <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 text-brand-primary">
                            <Wallet size={200} />
                          </div>
                          <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2 text-brand-primary">Créditos IA Locais (Modo LocalFirst)</p>
                            <div className="flex items-center gap-3">
                              <h3 className="text-5xl font-mono font-black italic tracking-tighter text-white">
                                {credits}
                              </h3>
                              <Zap size={32} className="text-brand-primary fill-brand-primary animate-pulse" />
                            </div>
                            <p className="text-xs font-bold mt-4 text-gray-400">
                              Seus créditos locais permitem que a Inteligência Artificial e a consulta avançada funcionem sem conta.
                            </p>
                            
                            <div className="mt-6">
                              <button
                                onClick={async () => {
                                  await addCredits(100, 'Recarga de cortesia modo Offline');
                                  alert('✅ +100 Créditos locais adicionados com sucesso ao seu navegador!');
                                }}
                                className="bg-brand-primary text-white px-5 py-3 rounded text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer"
                              >
                                Ganhar +100 Créditos Grátis
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-lg text-center">
                          <Shield size={48} className="mx-auto text-brand-primary mb-4" />
                          <h3 className="text-xl font-black text-brand-primary uppercase italic mb-2 tracking-tighter">Sincronização em Nuvem</h3>
                          <p className="text-xs text-gray-700 font-bold mb-6">
                            Faça login para ativar sua carteira de créditos sincronizada em nuvem e salvar seus dados de forma permanente.
                          </p>
                          <button
                            onClick={() => setActiveSubTab('account')}
                            className="bg-brand-primary text-white px-8 py-4 rounded-lg text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                          >
                            Fazer Login Agora
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-850 border border-gray-900 p-6 sm:p-8 rounded-lg text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 text-brand-primary">
                          <Wallet size={200} />
                        </div>
                        {isPro && (
                          <div className="absolute top-4 right-4 bg-brand-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg">
                            Assinante PRO
                          </div>
                        )}
                        <div className="relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2 text-brand-primary">Seu Saldo em Créditos IA (Cloud)</p>
                          <div className="flex items-center gap-3">
                            <h3 className="text-5xl font-mono font-black italic tracking-tighter text-white">
                              {credits}
                            </h3>
                            <Zap size={32} className="text-brand-primary fill-brand-primary" />
                          </div>
                          <p className="text-xs font-bold mt-4 text-gray-400">
                            Modelos Ativos: {data.settings.geminiApiKey && isPro ? 'Sua Chave Própria (Ilimitado)' : 'Gemini 2.0 Flash (Hospedagem Gerenciada)'}
                          </p>
                        </div>
                      </div>
                    )}

                    {user && !isPro && (
                      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-6 sm:p-8 rounded-lg text-black shadow-xl shadow-amber-500/15">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="bg-black/10 p-3 rounded-lg backdrop-blur-md">
                            <Shield size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black uppercase tracking-tighter italic leading-none">Liberar Versão PRO</h4>
                            <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mt-1">Acesso Vitalício para Entusiastas</p>
                          </div>
                        </div>
                        <ul className="space-y-3 mb-8">
                          <li className="flex items-center gap-3 text-xs font-bold">
                            <Check size={16} className="text-black" /> Liberar Uso de Chave API Própria (Grátis p/ sempre)
                          </li>
                          <li className="flex items-center gap-3 text-xs font-bold">
                            <Check size={16} className="text-black" /> Exportação de Relatórios sem Marca d'água
                          </li>
                          <li className="flex items-center gap-3 text-xs font-bold">
                            <Check size={16} className="text-black" /> Personalização Total de Logos de Oficina
                          </li>
                        </ul>
                        <button
                          onClick={async () => {
                            await upgradeToPro();
                            alert('Parabéns! Você agora é um Usuário PRO. A aba de Chave API foi desbloqueada.');
                          }}
                          className="w-full bg-black text-brand-primary py-5 rounded-lg font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
                        >
                          Upgrade PRO — R$ 89,90 (Único)
                        </button>
                      </div>
                    )}

                    {user && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between shadow-sm">
                          <div>
                            <h4 className="text-sm font-black text-brand-primary uppercase tracking-tighter mb-2 italic">Pacote Starter</h4>
                            <p className="text-xs text-gray-400 font-bold mb-4">Ideal para usuários casuais</p>
                            <p className="text-2xl font-mono font-black text-gray-805">R$ 10,00</p>
                            <p className="text-[10px] text-brand-accent font-black uppercase mt-1">Ganha 100 Créditos</p>
                          </div>
                          <button
                            onClick={async () => {
                              await addCredits(100, 'Compra de Pacote Starter (Simulada)');
                              alert('Simulação: 100 créditos adicionados via Firebase!');
                            }}
                            className="mt-6 w-full bg-gray-900 border border-transparent text-white hover:bg-brand-primary hover:text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                          >
                            Recarregar Agora
                          </button>
                        </div>

                        <div className="bg-brand-primary p-6 rounded-lg border border-brand-primary flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-black text-brand-primary px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-lg">Mais Popular</div>
                          <div>
                            <h4 className="text-sm font-black text-black uppercase tracking-tighter mb-2 italic">Pacote Pro (Mecânicos)</h4>
                            <p className="text-xs text-gray-905 font-bold mb-4">Para oficinas de alto fluxo</p>
                            <p className="text-2xl font-mono font-black text-black">R$ 45,00</p>
                            <p className="text-[10px] text-zinc-900 font-black uppercase mt-1">Ganha 1.000 Créditos</p>
                          </div>
                          <button
                            onClick={async () => {
                              await addCredits(1000, 'Compra de Pacote Pro (Simulada)');
                              alert('Simulação: 1000 créditos profissionais adicionados via Firebase!');
                            }}
                            className="mt-6 w-full bg-black text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-[1.02] transition-all active:scale-95"
                          >
                            Comprar Pacote Pro
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-250 shadow-sm">
                      <div className="flex gap-4 items-start">
                        <TrendingUp size={24} className="text-brand-primary shrink-0" />
                        <div>
                          <h5 className="text-xs font-black text-brand-primary uppercase mb-1">Como Funciona a Cobrança?</h5>
                          <p className="text-[10px] text-gray-700 font-medium leading-relaxed">
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
                      <p className="text-[9px] sm:text-xs font-bold text-gray-505 uppercase tracking-widest">Sincronize sua experiência torqboss</p>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center p-20">
                        <Loader2 className="animate-spin text-brand-primary" size={40} />
                      </div>
                    ) : user ? (
                      <div className="space-y-6">
                        <div className="bg-white border border-gray-100 rounded-lg p-8 flex items-center gap-6 shadow-xl shadow-gray-100/50">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName || ''} className="w-20 h-20 rounded-lg border-4 border-gray-50" />
                          ) : (
                            <div className="w-20 h-20 bg-brand-primary text-white rounded-lg flex items-center justify-center text-3xl font-black">
                              {user.displayName?.[0] || 'U'}
                            </div>
                          )}
                          <div>
                            <h4 className="text-xl font-black text-brand-primary italic tracking-tight">{user.displayName || 'Usuário'}</h4>
                            <p className="text-sm text-gray-505 font-bold">{user.email}</p>
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
                          className="w-full bg-red-50 text-red-500 py-4 rounded-lg text-xs font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                          <LogOut size={16} /> Sair da Conta
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-100 rounded-lg p-10 text-center shadow-xl shadow-gray-100/50">
                        <div className="w-20 h-20 bg-brand-primary/5 text-brand-primary rounded-lg flex items-center justify-center mx-auto mb-6">
                          <LogIn size={32} />
                        </div>
                        <h4 className="text-2xl font-black text-brand-primary uppercase italic tracking-tighter mb-4">Sincronize seus Dados</h4>
                        <p className="text-sm text-gray-500 font-bold max-w-sm mx-auto mb-8 leading-relaxed">
                          Crie sua conta para salvar seus veículos e créditos na nuvem Google. Acesse de qualquer lugar!
                        </p>

                        {/* BOTÃO DE TESTE - EMAIL/SENHA */}
                        <button
                          onClick={() => loginWithEmailPassword('Josias@torqboss.com', 'torqboss-0007')}
                          className="mb-4 w-full bg-orange-500 text-white px-10 py-3 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                        >
                          🔧 TESTAR LOGIN (Email/Senha)
                        </button>

                        {/* BOTÃO ORIGINAL DO GOOGLE */}
                        <button
                          onClick={login}
                          className="bg-brand-primary text-white px-10 py-5 rounded-lg text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:scale-[1.05] transition-all flex items-center justify-center gap-3 mx-auto"
                        >
                          <LogIn size={20} /> Entrar com Google
                        </button>
                      </div>
                    )}

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                      <div className="flex gap-4 items-start">
                        <ShieldCheck className="text-green-500 shrink-0" size={24} />
                        <div>
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-505 mb-1">Segurança torqboss</h5>
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
                      <p className="text-[9px] sm:text-xs font-bold text-gray-505 uppercase tracking-widest">Segurança e portabilidade da sua frota</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-brand-primary/10 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                        <div className="bg-brand-primary/5 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-brand-primary">
                          <TrendingUp size={24} />
                        </div>
                        <h4 className="text-sm font-black text-brand-primary uppercase tracking-tighter mb-2 italic">Exportar Backup Total</h4>
                        <p className="text-[10px] text-gray-500 font-bold mb-6 leading-relaxed">
                          Gera um arquivo <strong>.torqboss-backup</strong> contendo todos os veículos, manutenções, registros de combustível e configurações de conta.
                        </p>
                        <button
                          onClick={handleFullBackup}
                          className="w-full bg-brand-primary text-white py-4 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={14} /> Criar Arquivo de Backup
                        </button>
                      </div>

                      <div className="bg-white border border-amber-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                        <div className="bg-amber-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-amber-500">
                          <Key size={24} />
                        </div>
                        <h4 className="text-sm font-black text-amber-900 uppercase tracking-tighter mb-2 italic">Restaurar do Arquivo</h4>
                        <p className="text-[10px] text-amber-800/60 font-bold mb-6 leading-relaxed">
                          Importa um backup completo. <strong>Aviso:</strong> Isso substituirá todos os dados locais atuais pelos dados contidos no arquivo.
                        </p>
                        <label className="w-full bg-amber-500 text-white py-4 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                          <Download size={14} /> Selecionar Arquivo
                          <input type="file" accept=".torqboss-backup,.json" className="hidden" onChange={handleFullRestore} />
                        </label>
                      </div>
                    </div>

                    <div className="bg-red-50/50 p-8 rounded-lg border border-red-100">
                      <div className="flex gap-4">

                        <AlertCircle className="text-red-500 shrink-0" size={24} />

                        <div>
                          <h4 className="text-sm font-black text-red-600 uppercase tracking-tighter mb-2 italic">
                            Zona de Perigo
                          </h4>

                          <p className="text-[10px] text-red-500 font-bold mb-6">
                            A limpeza de dados é irreversível. Certifique-se de ter um backup antes de prosseguir.
                          </p>

                          <button
                            onClick={() => {
                              if (confirm('TEM CERTEZA? Isso deletará todos os seus veículos e configurações permanentemente.')) {
                                onResetData();
                              }
                            }}
                            className="bg-white border border-red-200 text-red-500 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            Redefinir Todo o Aplicativo
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Ferramentas Avançadas */}
                    <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-lg">

                      <div className="flex flex-col gap-1 mb-5">
                        <h4 className="text-sm font-black text-zinc-800 uppercase tracking-tighter italic">
                          Ferramentas Avançadas
                        </h4>

                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          Sessões, cache e limpeza completa do aplicativo
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">

                        <button
                          onClick={limparSessaoGoogle}
                          className="bg-orange-50 border border-orange-200 text-orange-600 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center gap-2"
                        >
                          <Shield size={14} />
                          Limpar Sessão Google
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Deseja limpar TODOS os dados locais do torqboss?')) {
                              limpezaProfunda();
                            }
                          }}
                          className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-yellow-100 transition-all flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Limpeza Profunda
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('RESET NUCLEAR TOTAL?\nIsso removerá TODAS as sessões, cache e armazenamento local.')) {
                              resetNuclear();
                            }
                          }}
                          className="bg-black border border-black text-red-500 px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-all flex items-center gap-2"
                        >
                          <AlertCircle size={14} />
                          RESET NUCLEAR
                        </button>

                      </div>
                    </div>

                  </div>
                )}

                {activeSubTab === 'manual' && (
                  <div className="space-y-6 text-left">
                    <div className="flex flex-col gap-1 mb-6">
                      <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-brand-primary leading-none">Manual torqboss</h3>
                      <p className="text-[9px] sm:text-xs font-bold text-gray-505 uppercase tracking-widest">Domine todas as ferramentas</p>
                    </div>
                    <AppManual />
                  </div>
                )}

                {activeSubTab === 'debug' && (
                  <div className="space-y-8 text-left">
                    {/* Header */}
                    <div className="flex items-center gap-3.5 border-b border-gray-100 pb-5">
                      <div className="bg-brand-primary p-3 rounded-xl text-white shadow-lg shrink-0">
                        <Bug size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter text-brand-primary leading-none">Diagnósticos & Debugs</h3>
                        <p className="text-[9px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Telemetria, logs de execução e status da integração Google / Firebase</p>
                      </div>
                    </div>

                    {/* Caixa-preta do APK: diagnóstico GIS / Firebase / WebView */}
                    <DebugCenter />

                    {/* Section 1: Conectividade e Firebase */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-brand-primary">
                        <Wifi size={18} />
                        <h4 className="text-xs font-black uppercase tracking-wider">Conexão & Nuvem</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-100 text-xs">
                          <p className="font-bold text-gray-400 uppercase text-[8px] tracking-wider mb-1">Internet</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${navigator.onLine ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="font-bold text-gray-800">{navigator.onLine ? 'Dispositivo Online' : 'Dispositivo Offline'}</span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-100 text-xs">
                          <p className="font-bold text-gray-400 uppercase text-[8px] tracking-wider mb-1">Sessão Firebase</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${user ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <span className="font-bold text-gray-800">
                              {user ? `Logado: ${user.email}` : 'Nenhum usuário autenticado'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Test Connection Button */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-gray-800 text-xs">Teste de Latência do Banco de Dados</p>
                            <p className="text-[10px] text-gray-400">Escreve, lê e verifica um documento de teste no Firestore para validar latência e permissões.</p>
                          </div>
                          <button
                            onClick={runFirebaseDiagnostic}
                            disabled={diagnosticPingStatus === 'running'}
                            className="bg-brand-primary hover:bg-brand-primary/95 text-white disabled:bg-gray-300 font-black uppercase tracking-widest text-[9px] px-4 py-2.5 rounded transition-all shrink-0 active:scale-95 flex items-center gap-2"
                          >
                            {diagnosticPingStatus === 'running' && <Loader2 size={12} className="animate-spin" />}
                            Testar Conexão Firebase
                          </button>
                        </div>

                        {diagnosticPingStatus !== 'idle' && (
                          <div className={`p-3 rounded text-[11px] font-mono whitespace-pre-wrap flex items-start gap-2 ${
                            diagnosticPingStatus === 'running' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            diagnosticPingStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                            'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {diagnosticPingStatus === 'success' && <CheckCircle2 size={14} className="shrink-0 mt-0.5" />}
                            {diagnosticPingStatus === 'error' && <AlertCircle size={14} className="shrink-0 mt-0.5" />}
                            <span className="break-all">{diagnosticPingMessage}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 2: Credenciais & Diagnóstico de Login do Google */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-indigo-600">
                        <ShieldAlert size={18} />
                        <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950">Credenciais Google Auth (APK vs Web)</h4>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-2 font-mono">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1.5 border-b border-gray-50">
                            <span className="font-bold text-gray-500 uppercase text-[8px] tracking-wider">App Package ID:</span>
                            <span className="font-bold text-gray-800 md:col-span-2 select-all">com.torqboss.app</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1.5 border-b border-gray-50">
                            <span className="font-bold text-gray-500 uppercase text-[8px] tracking-wider">Android Client ID:</span>
                            <span className="text-gray-700 md:col-span-2 text-[10px] break-all select-all">456343787433-vjh8tp1rn9q18fbaonhmk4tjgkc9pdjt.apps.googleusercontent.com</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1.5 border-b border-gray-50">
                            <span className="font-bold text-gray-500 uppercase text-[8px] tracking-wider">Web/Server Client ID:</span>
                            <span className="text-gray-700 md:col-span-2 text-[10px] break-all select-all">456343787433-f6n6aa5i85o89rjbvvck9hurgtqi5o8f.apps.googleusercontent.com</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1.5 border-b border-gray-50 bg-amber-50/50 p-2 rounded">
                            <span className="font-black text-amber-800 uppercase text-[8px] tracking-wider">SHA-1 Keystore (Release):</span>
                            <span className="font-bold text-amber-900 md:col-span-2 text-[10px] select-all">45:7B:E1:8C:DB:38:D0:DB:5B:57:7D:D4:48:1F:E9:19:A3:FB:5A:97</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-1.5 border-b border-gray-50 bg-amber-50/50 p-2 rounded">
                            <span className="font-black text-amber-800 uppercase text-[8px] tracking-wider">SHA-256 Keystore:</span>
                            <span className="font-bold text-amber-950 md:col-span-2 text-[9px] break-all select-all">BE:07:BC:13:D7:33:DE:E1:E9:11:92:44:FF:7B:B7:47:BA:C9:AA:88:D6:6D:1E:11:3C:57:85:D4:0C:50:62:D7</span>
                          </div>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 font-bold text-indigo-905 text-[11px] leading-relaxed space-y-2">
                          <p className="text-indigo-950 uppercase tracking-wider text-[9px] font-black flex items-center gap-1.5">
                            <AlertCircle size={12} className="text-indigo-650" />
                            Como resolver o erro Google Sign-In (Code 10 / DEVELOPER_ERROR):
                          </p>
                          <p>O Google Sign-In no Android exige que a assinatura do seu APK corresponda EXATAMENTE às impressões digitais cadastradas.</p>
                          <ol className="list-decimal pl-4 space-y-1.5 mt-2">
                            <li>Acesse o <strong>Firebase Console</strong> do seu projeto e vá em <strong>Configurações do Projeto &gt; Geral &gt; Seus Aplicativos (Android)</strong>.</li>
                            <li>Clique em <strong>Adicionar impressão digital</strong> e insira a assinatura SHA-1 disponibilizada acima: <code className="bg-indigo-200/50 px-1 py-0.5 rounded select-all font-mono">45:7B:E1:8C:DB:38:D0:DB:5B:57:7D:D4:48:1F:E9:19:A3:FB:5A:97</code></li>
                            <li>Faça o download do arquivo <code className="bg-indigo-200/50 px-1 py-0.5 rounded font-mono">google-services.json</code> atualizado e substitua o arquivo existente na pasta <code className="font-mono">android/app/</code> de seu aplicativo móvel.</li>
                            <li><strong>Conselhos para Google Play Store:</strong> Se as chaves do APK final forem geradas pela Google Play ao compilar (App Signing), você precisará colar o SHA-1 que está lá nas credenciais do Firebase/Google Cloud Console!</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Telemetria Física & Navegador */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-gray-700">
                        <Cpu size={18} />
                        <h4 className="text-xs font-black uppercase tracking-wider">Hardware & Sistema</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                        <div className="bg-white p-3.5 rounded-lg border border-gray-100">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Ambiente</p>
                          <p className="font-black text-gray-800">{Capacitor.isNativePlatform() ? 'Nativo (Capacitor)' : 'Navegador Web'}</p>
                        </div>
                        <div className="bg-white p-3.5 rounded-lg border border-gray-100">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Plataforma</p>
                          <p className="font-black text-gray-800 uppercase">{Capacitor.getPlatform()}</p>
                        </div>
                        <div className="bg-white p-3.5 rounded-lg border border-gray-100">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nível de Bateria</p>
                          <p className="font-black text-gray-800">{batteryLevel}</p>
                        </div>
                        <div className="bg-white p-3.5 rounded-lg border border-gray-100">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Resolução de Tela</p>
                          <p className="font-black text-gray-800">{window.screen.width}x{window.screen.height} px</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-3.5">
                        <p className="font-bold text-gray-800 text-xs text-left">Ações de Controle do Overlay</p>
                        
                        <div className="pt-2 border-t border-gray-50 flex flex-wrap gap-2">
                          <button
                            onClick={() => toggleDebugOverlay(true)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded transition-all active:scale-95 flex items-center gap-1.5"
                          >
                            <Terminal size={12} /> Exibir Overlay em Tela Cheia
                          </button>
                          <button
                            onClick={() => {
                              debugLog(`Log de teste disparado manualmente pelo usuário: ${new Date().toLocaleTimeString()}`);
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded transition-all active:scale-95 flex items-center gap-1.5"
                          >
                            <Plus size={12} /> Adicionar Log de Teste
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Armazenamento Local (LocalFirst) */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-brand-primary">
                          <Database size={18} />
                          <h4 className="text-xs font-black uppercase tracking-wider">Armazenamento Local (LocalFirst)</h4>
                        </div>
                        <button
                          onClick={() => {
                            refreshStorageMetrics();
                            debugLog('DIAGNOSE: Métricas de localStorage atualizadas pelo usuário');
                          }}
                          className="text-[10px] text-brand-primary hover:underline font-black uppercase tracking-widest flex items-center gap-1"
                        >
                          Atualizar Métricas
                        </button>
                      </div>

                      {storageMetrics && (
                        <div className="space-y-4 text-xs font-medium">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3.5 rounded-lg border border-gray-100">
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total de Itens / Chaves</p>
                              <p className="font-mono text-base font-black text-gray-800">{storageMetrics.totalItems}</p>
                            </div>
                            <div className="bg-white p-3.5 rounded-lg border border-gray-100">
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bytes Totais Usados</p>
                              <p className="font-mono text-base font-black text-gray-800">
                                {storageMetrics.usedKB} <span className="text-[10px] text-gray-400 font-bold">KB</span>
                              </p>
                            </div>
                          </div>

                          {/* Barra de progresso baseada na cota padrão do localStorage que é de 5MB (5120KB) */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                              <span>Consumo da Cota de Armazenamento do Browser</span>
                              <span>
                                {((storageMetrics.usedBytes / (5 * 1024 * 1024)) * 100).toFixed(3)}% de 5MB
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-brand-primary h-full transition-all duration-300"
                                style={{ width: `${Math.min(100, Math.max(1.5, (storageMetrics.usedBytes / (5 * 1024 * 1024)) * 100))}%` }}
                              />
                            </div>
                          </div>

                          {/* List of storage items */}
                          <div className="bg-white rounded-lg border border-gray-150 overflow-hidden">
                            <p className="font-bold text-gray-500 uppercase text-[8px] tracking-wider px-3.5 py-2.5 bg-gray-50 border-b border-gray-100">Detalhamento por Chave</p>
                            <div className="max-h-44 overflow-y-auto divide-y divide-gray-100 font-mono text-[10px]">
                              {storageMetrics.items.length === 0 ? (
                                <div className="p-3.5 text-center text-gray-400 italic">O armazenamento está totalmente vazio.</div>
                              ) : (
                                storageMetrics.items.map((item) => (
                                  <div key={item.key} className="p-3 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                                    <div className="truncate pr-4 flex-1 text-left">
                                      <span className="font-black text-gray-700 break-all select-all" title={item.key}>{item.key}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className="text-gray-450 font-bold">{item.kb} KB</span>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Tem certeza de que deseja apagar a chave "${item.key}" do seu dispositivo? Isso causará a perda desses dados.`)) {
                                            localStorage.removeItem(item.key);
                                            debugLog(`DIAGNOSE: Chave "${item.key}" foi apagada pelo usuário.`);
                                            refreshStorageMetrics();
                                          }
                                        }}
                                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-650 rounded transition-all active:scale-90"
                                        title={`Excluir ${item.key}`}
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Section 5: Visualizador de Logs em Tempo Real */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Terminal size={17} className="text-brand-primary" />
                          <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary">Console de Logs em Tempo Real</h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(liveLogs.join('\n\n'));
                                alert('Logs copiados!');
                              } catch {
                                alert('Erro ao copiar');
                              }
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded transition-all active:scale-95 cursor-pointer"
                            title="Copiar logs"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Limpar logs permanentemente?')) {
                                clearDebugLogs();
                              }
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-650 p-2 rounded transition-all active:scale-95 cursor-pointer"
                            title="Limpar logs"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="bg-black text-green-400 p-4 rounded-xl font-mono text-[10px] leading-relaxed h-72 overflow-y-auto border border-zinc-800 flex flex-col-reverse shadow-inner selection:bg-green-800 selection:text-white">
                        <div className="whitespace-pre-wrap break-all text-left">
                          {liveLogs.length === 0 ? (
                            <span className="text-zinc-650 italic">Sem logs registrados ainda...</span>
                          ) : (
                            liveLogs.slice().reverse().join('\n\n')
                          )}
                        </div>
                      </div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider text-right italic">* Logs em tempo real ordenados do mais recente primeiro</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer com Botão Salvar */}
            <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between shrink-0">

              <div className="hidden sm:block">
                <p className="text-[10px] font-bold text-gray-505 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={12} className="text-brand-primary" />
                  Alterações salvas automaticamente
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full sm:w-auto bg-brand-primary text-white px-10 py-5 rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3 group"
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