
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Settings, Database, Download, Upload, Activity, Palette,
  Smartphone, Globe, Link, Trash2, ChevronRight,
  Car, Search, Wrench, Box, Gauge, Fuel, Cog, Cylinder,
  Key, Timer, Trophy, Flag, Calculator, Cpu, Disc,
  Unplug, Flame, Wind, Map, HardHat, Shield, Zap,
  CarFront, BusFront, Truck, Bike
} from 'lucide-react';
import { AppData, VehicleSearchLink } from '../types';
import { THEMES, DEFAULT_SEARCH_LINKS } from '../constants';
import { COUNTRIES } from '../config/countryConfig';
import { CarFerrariTop, CarMuscleTop, CarSilhouette, SteeringWheelCustom } from './CustomIcons';

const ICON_OPTIONS: Record<string, any> = {
  Car, CarFront, BusFront, Truck, Bike, Settings, Search, Wrench,
  Activity, Shield, Zap, Box, Gauge, Fuel, Cog, Cylinder, Key,
  Timer, Trophy, Flag, Palette, Database, Calculator, Cpu, Disc,
  Unplug, Flame, Wind, Map, HardHat,
  CarFerrariTop, CarMuscleTop, CarSilhouette, SteeringWheelCustom,
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onSave: (data: AppData) => void;
  onExportData: () => void;
  onImportData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
  onExportData,
  onImportData,
}) => {
  const update = (settings: Partial<AppData['settings']>) => {
    onSave({ ...data, settings: { ...data.settings, ...settings } });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded p-8 w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-brand-primary p-2 rounded text-white">
                  <Settings size={24} />
                </div>
                <h2 className="text-2xl font-bold">Configurações</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              {/* App Name */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2 flex items-center gap-2">
                  <Smartphone size={14} /> Nome do Aplicativo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Meu Carro Top"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-bold"
                  value={data.settings?.appName || ''}
                  onChange={(e) => update({ appName: e.target.value })}
                />
              </div>

              {/* Data Management */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-3 flex items-center gap-2">
                  <Database size={14} /> Gestão de Dados (Backup)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onExportData}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:border-brand-primary/30 hover:text-brand-primary transition-all"
                  >
                    <Download size={16} /> Exportar Backup
                  </button>
                  <button
                    onClick={onImportData}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:border-brand-primary/30 hover:text-brand-primary transition-all"
                  >
                    <Upload size={16} /> Importar Backup
                  </button>
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2 flex items-center gap-2">
                  <Activity size={14} /> Ícone do App
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(ICON_OPTIONS).map(([name, Icon]) => (
                    <button
                      key={name}
                      onClick={() => update({ appIcon: name })}
                      className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${
                        (data.settings?.appIcon || 'Cpu') === name
                          ? 'border-brand-accent bg-brand-accent/5'
                          : 'border-transparent bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <Icon size={18} className={(data.settings?.appIcon || 'Cpu') === name ? 'text-brand-accent' : 'text-gray-400'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Picker */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2 flex items-center gap-2">
                  <Palette size={14} /> Tema Visual
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((themeKey) => (
                    <button
                      key={themeKey}
                      onClick={() => update({ theme: themeKey })}
                      className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${
                        (data.settings?.theme || 'default') === themeKey
                          ? 'border-brand-accent ring-2 ring-brand-accent/20'
                          : 'border-transparent hover:border-gray-200'
                      }`}
                      style={{ backgroundColor: THEMES[themeKey].bg }}
                      title={themeKey}
                    >
                      <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: THEMES[themeKey].accent }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Gemini API Key */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Chave de API Gemini</label>
                <input
                  type="password"
                  placeholder="Cole sua chave aqui..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                  value={data.settings?.geminiApiKey || ''}
                  onChange={(e) => update({ geminiApiKey: e.target.value })}
                />

                <div className="mt-4">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Token da API Brasil para Busca de Placa (opcional)</label>
                  <input
                    type="password"
                    placeholder="Cole sua chave da API Brasil..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                    value={data.settings?.plateApiKey || ''}
                    onChange={(e) => update({ plateApiKey: e.target.value })}
                  />
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Device Token da API Brasil (opcional)</label>
                  <input
                    type="password"
                    placeholder="Cole seu Device Token da API Brasil..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                    value={data.settings?.apiBrasilDeviceToken || ''}
                    onChange={(e) => update({ apiBrasilDeviceToken: e.target.value })}
                  />
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">URL do backend de placa (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: http://localhost:3000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                    value={data.settings?.plateApiHost || ''}
                    onChange={(e) => update({ plateApiHost: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-400 mt-2">
                    <strong>Recomendado:</strong> Configure um backend próprio que chame a API SINESP. Se configurar o backend local, o app tentará usá-lo primeiro, depois SINESP direto como fallback, e por fim o Gemini.
                  </p>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <p className="text-xs font-bold text-blue-900 mb-2">ℹ️ DICA: Configurar Backend Local SINESP</p>
                  <ul className="text-[10px] text-blue-800 leading-relaxed list-disc list-inside space-y-1">
                    <li>Receba POST em <code className="bg-white px-1 rounded text-blue-600">/consultar-placa</code> com JSON: <code className="bg-white px-1 rounded text-blue-600">{'{placa: "ABC1234"}'}</code></li>
                    <li>Chame a API SINESP no servidor (sem CORS)</li>
                    <li>Retorne: <code className="bg-white px-1 rounded text-blue-600">{'{marca: "Toyota", modelo: "Corolla", ano: "2020"}'}</code></li>
                  </ul>
                  <p className="text-[10px] text-blue-700 mt-2">Referência: <span className="font-mono">github.com/giovannijoao/consultaplaca-api</span></p>
                </div>

                <div className="mt-4 p-4 bg-brand-accent/5 rounded-2xl border border-brand-accent/10">
                  <p className="text-xs text-brand-primary leading-relaxed">
                    Para que as funcionalidades de IA funcionem de forma independente (como em um APK), você precisa de uma chave própria.
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-accent text-xs font-bold mt-2 inline-flex items-center gap-1 hover:underline underline-offset-2"
                  >
                    Criar minha Chave Grátis no Google AI Studio <ChevronRight size={12} />
                  </a>
                </div>
              </div>

              {/* Regionalization */}
              <div className="pt-4 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-4 flex items-center gap-2">
                  <Globe size={14} /> Regionalização & Unidades
                </label>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">Moeda</label>
                      <select
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-brand-accent outline-none"
                        value={data.settings?.currency || 'BRL'}
                        onChange={(e) => update({ currency: e.target.value as any })}
                      >
                        <option value="BRL">Real (R$)</option>
                        <option value="USD">Dólar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">Unidade Distância</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['km', 'mi'].map(unit => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => update({ distanceUnit: unit as any })}
                            className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                              (data.settings?.distanceUnit || 'km') === unit
                                ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                                : 'bg-white border-gray-100 text-gray-400 hover:border-brand-primary/30'
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Região do Robô Extrator (Pop-up)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {COUNTRIES.map(country => (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => update({ countryId: country.id })}
                          className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                            (data.settings?.countryId || 'BR') === country.id
                              ? 'bg-brand-accent border-brand-accent text-white shadow-md'
                              : 'bg-white border-gray-100 text-gray-400 hover:border-brand-accent/30'
                          }`}
                        >
                          <span className="text-xl">{country.flag}</span>
                          <span className="text-[10px] font-black uppercase">{country.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Idioma & Região (Contexto IA)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'pt-BR', label: 'BR', region: 'Brasil' },
                        { id: 'en-US', label: 'US', region: 'USA' },
                        { id: 'es-ES', label: 'ES', region: 'Europe' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => update({ language: opt.id as any, region: opt.region })}
                          className={`p-3 rounded-xl border flex flex-col items-center transition-all ${
                            (data.settings?.language || 'pt-BR') === opt.id
                              ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                              : 'bg-white border-gray-100 text-gray-400 hover:border-brand-primary/30'
                          }`}
                        >
                          <span className="text-[10px] font-black">{opt.label}</span>
                          <span className="text-[8px] font-bold opacity-60">{opt.region}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Search Links */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block flex items-center gap-2">
                    <Link size={14} /> Links de Consulta Personalizados
                  </label>
                  <button
                    onClick={() => {
                      const name = prompt('Nome do Site:');
                      const url = prompt('URL do Site (use {placa} para substituir pela placa):', 'https://');
                      if (name && url) {
                        const newLink: VehicleSearchLink = { id: crypto.randomUUID(), name, url, color: 'brand' };
                        update({ searchLinks: [...(data.settings?.searchLinks || DEFAULT_SEARCH_LINKS), newLink] });
                      }
                    }}
                    className="text-[10px] font-bold text-brand-primary hover:underline"
                  >
                    + ADICIONAR SITE
                  </button>
                </div>
                <div className="space-y-2">
                  {(data.settings?.searchLinks || DEFAULT_SEARCH_LINKS).map((link) => (
                    <div key={link.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between group">
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{link.name}</p>
                        <p className="text-[9px] text-gray-400 truncate max-w-[180px]">{link.url}</p>
                      </div>
                      <button
                        onClick={() => {
                          const newLinks = (data.settings?.searchLinks || DEFAULT_SEARCH_LINKS).filter(l => l.id !== link.id);
                          update({ searchLinks: newLinks });
                        }}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                        title="Remover"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Note */}
              <div className="pt-4 text-center">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-4">Privacidade</p>
                <p className="text-xs text-gray-500">
                  Sua chave é salva apenas localmente no seu dispositivo e nunca é enviada para nossos servidores.
                </p>
              </div>
            </div>

            <div className="pt-6 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-4 bg-brand-primary text-white font-bold rounded hover:bg-brand-accent transition-all shadow-lg"
              >
                Salvar e Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
