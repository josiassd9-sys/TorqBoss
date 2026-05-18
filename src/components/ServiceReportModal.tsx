import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Activity } from 'lucide-react';
import { Vehicle, ServiceEntry } from '../types';

interface ServiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: Vehicle | null;
  selectedService: ServiceEntry | null;
}

export const ServiceReportModal: React.FC<ServiceReportModalProps> = ({
  isOpen,
  onClose,
  selectedVehicle,
  selectedService,
}) => {
  if (!selectedService || !selectedVehicle) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-brand-primary text-white p-2 rounded-xl">
                  <FileText size={20} />
                </div>
                <h2 className="text-xl font-black text-brand-primary tracking-tight">Relatório Técnico de Manutenção</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors font-bold">
                FECHAR
              </button>
            </div>

            <div className="flex-1 p-8 bg-white" id="service-report-content">
              <div className="flex justify-between items-start border-b-4 border-brand-primary pb-6 mb-8">
                <div>
                  <h3 className="text-3xl font-black text-brand-primary uppercase tracking-tighter mb-1 leading-none">{selectedService.workshopName}</h3>
                  <p className="text-sm text-gray-500 font-bold mt-2">{selectedService.workshopAddress || 'Endereço não informado'}</p>
                  <p className="text-sm text-gray-500 font-bold">Fone: {selectedService.workshopPhone || 'Não informado'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cód. Registro</p>
                  <p className="text-sm font-mono font-bold bg-gray-100 p-1 px-3 rounded text-brand-primary">#{selectedService.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[9px] text-gray-300 mt-2 font-bold uppercase tracking-widest leading-none">Original Digital</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                <div>
                  <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 border-l-2 border-brand-accent pl-2">Dados do Veículo</h4>
                  <p className="text-xl font-black text-gray-800">{selectedVehicle.name}</p>
                  <p className="text-sm text-gray-500 font-bold">{selectedVehicle.model} — {selectedVehicle.year}</p>
                  <p className="text-xs font-mono font-bold mt-2 bg-gray-100 inline-block px-3 py-1 rounded text-gray-600">PLACA: {selectedVehicle.plate?.toUpperCase() || 'NÃO INF'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 border-l-2 border-brand-accent pl-2">Informações da OS</h4>
                  <p className="text-sm font-bold text-gray-600 mb-1">Execução: <span className="font-black text-brand-primary">{new Date(selectedService.date).toLocaleDateString('pt-BR')}</span></p>
                  <p className="text-sm font-bold text-gray-600 mb-1">Quilometragem: <span className="font-mono font-black">{selectedService.mileage.toLocaleString()} KM</span></p>
                  <p className="text-sm font-bold text-gray-600">Técnico: <span className="italic font-black opacity-70">{selectedService.mechanicName || 'Equipe Técnica'}</span></p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Descrição dos Serviços</h4>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed min-h-[80px]">
                  {selectedService.description}
                </div>
              </div>

              {selectedService.partsList && selectedService.partsList.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3">Peças e Insumos</h4>
                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase">Item</th>
                          <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase text-center">Qtd</th>
                          <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase text-right">Unitário</th>
                          <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedService.partsList || []).map(item => (
                          <tr key={item.id} className="border-t border-gray-50">
                            <td className="py-4 px-4">
                              <p className="text-sm font-bold text-gray-800">{item.name}</p>
                              {item.observation && (
                                <p className="text-[10px] text-brand-accent italic font-bold mt-1 max-w-[250px]">
                                  Nota: {item.observation}
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4 text-sm font-mono text-center">{item.quantity}</td>
                            <td className="py-4 px-4 text-sm font-mono text-right">R$ {item.unitPrice.toLocaleString()}</td>
                            <td className="py-4 px-4 text-sm font-mono font-black text-right text-brand-primary">R$ {(item.quantity * item.unitPrice).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {selectedService.notes && (
                    <div className="p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                      <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mb-1">Notas da Oficina</p>
                      <p className="text-xs text-yellow-800 italic leading-snug">{selectedService.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Mão de Obra</p>
                      <p className="text-sm font-mono font-black text-gray-700">R$ {selectedService.laborCost.toLocaleString()}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Peças</p>
                      <p className="text-sm font-mono font-black text-gray-700">R$ {(selectedService.cost - selectedService.laborCost).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-brand-primary text-white p-6 rounded-3xl flex flex-col justify-center items-center md:items-end shadow-xl shadow-brand-primary/20">
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-2">Total Geral do Serviço</p>
                  <p className="text-4xl font-mono font-black tracking-tighter">R$ {selectedService.cost.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 grayscale">
                <div className="flex items-center gap-3">
                  <Activity size={24} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tighter">Powered by AutoTech</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest">Gestão Inteligente de Veículos</p>
                  </div>
                </div>
                <p className="text-[9px] font-mono font-bold italic">
                  Assinado em: {new Date(selectedService.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-accent transition-all shadow-lg"
              >
                <Download size={20} /> Baixar PDF / Imprimir
              </button>
              <button
                onClick={() => {
                  const text = `RELATÓRIO DE MANUTENÇÃO\nOficina: ${selectedService.workshopName}\nVeículo: ${selectedVehicle.name}\nValor Total: R$ ${selectedService.cost.toLocaleString()}`;
                  navigator.clipboard.writeText(text);
                  alert('Resumo copiado!');
                }}
                className="bg-white border border-gray-200 text-gray-600 px-6 rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                Compartilhar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
