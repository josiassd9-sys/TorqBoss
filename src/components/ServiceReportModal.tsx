import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Activity, X } from 'lucide-react';
import { Vehicle, ServiceEntry } from '../types';

interface ServiceReportModalProps {
  selectedService: ServiceEntry | null;
  selectedVehicle: Vehicle | null;
  onClose: () => void;
}

export const ServiceReportModal: React.FC<ServiceReportModalProps> = ({
  selectedService,
  selectedVehicle,
  onClose,
}) => {
  if (!selectedService || !selectedVehicle) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="bg-brand-primary text-white p-2 rounded-xl">
                <FileText size={20} />
              </div>
              <h2 className="text-xl font-black text-brand-primary tracking-tight">Relatório Técnico</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors font-bold">
              <X size={20} />
            </button>
          </div>

          {/* Report Content */}
          <div className="flex-1 p-8 bg-white" id="service-report-content">
            <div className="flex justify-between items-start border-b-4 border-brand-primary pb-6 mb-8">
              <div>
                <h3 className="text-3xl font-black text-brand-primary uppercase tracking-tighter mb-1 leading-none">{selectedService.workshopName}</h3>
                <p className="text-sm text-gray-500 font-bold mt-2">{selectedService.workshopAddress || ''}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cód. Registro</p>
                <p className="text-sm font-mono font-bold bg-gray-100 p-1 px-3 rounded text-brand-primary">#{selectedService.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
              <div>
                <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 border-l-2 border-brand-accent pl-2">Dados do Veículo</h4>
                <p className="text-xl font-black text-gray-800">{selectedVehicle.name}</p>
                <p className="text-sm text-gray-500 font-bold">{selectedVehicle.model} — {selectedVehicle.year}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 border-l-2 border-brand-accent pl-2">Dados da OS</h4>
                <p className="text-sm font-bold text-gray-600 mb-1">Data: <span className="font-black text-brand-primary">{new Date(selectedService.date).toLocaleDateString('pt-BR')}</span></p>
                <p className="text-sm font-bold text-gray-600">KM: <span className="font-mono font-black">{selectedService.mileage.toLocaleString()} KM</span></p>
              </div>
            </div>

            <div className="mb-8">
                <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Descrição</h4>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-sm leading-relaxed">
                    {selectedService.description}
                </div>
            </div>

            {selectedService.partsList && selectedService.partsList.length > 0 && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-[10px] font-black uppercase text-gray-400">Item</th>
                                <th className="p-3 text-[10px] font-black uppercase text-gray-400 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedService.partsList.map(item => (
                                <tr key={item.id} className="border-t border-gray-50">
                                    <td className="p-4 text-sm font-bold">{item.name}</td>
                                    <td className="p-4 text-sm font-mono font-black text-right">R$ {(item.quantity * item.unitPrice).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="bg-brand-primary text-white p-6 rounded-3xl flex justify-between items-center shadow-xl">
              <p className="text-sm font-bold uppercase tracking-widest opacity-80">Total Geral</p>
              <p className="text-3xl font-mono font-black">R$ {selectedService.cost.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
            <button 
              onClick={() => window.print()}
              className="flex-1 bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-accent transition-all"
            >
              <Download size={20} /> Imprimir / PDF
            </button>
            <button 
                onClick={() => {
                   const text = `RELATÓRIO: ${selectedVehicle.name}\nOficina: ${selectedService.workshopName}\nValor: R$ ${selectedService.cost.toLocaleString()}`;
                   navigator.clipboard.writeText(text);
                   alert('Resumo copiado!');
                }}
                className="px-6 border border-gray-200 rounded-2xl font-bold hover:bg-gray-100"
            >
                Copiado
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
