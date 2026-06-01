import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Book, Sparkles } from 'lucide-react';
import { Part, ServicePart } from '../types';
import { geminiService } from '../services/geminiService';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  newService: any;
  setNewService: React.Dispatch<React.SetStateAction<any>>;
  newServicePart: any;
  setNewServicePart: React.Dispatch<React.SetStateAction<any>>;
  vehicleParts: Part[];
  onAddService: () => void;
  onOpenAddPartCatalog: (name: string) => void;
  vehicleNameModel: string;
}

export const AddServiceModal = ({ 
  isOpen, 
  onClose, 
  newService, 
  setNewService, 
  newServicePart, 
  setNewServicePart, 
  vehicleParts,
  onAddService,
  onOpenAddPartCatalog,
  vehicleNameModel
}: AddServiceModalProps) => {
  
  const handleAddPartToService = () => {
    if(!newServicePart.name || !newServicePart.unitPrice) return;
    const part: ServicePart = {
      id: crypto.randomUUID(),
      name: newServicePart.name,
      quantity: Number(newServicePart.quantity) || 1,
      unitPrice: Number(newServicePart.unitPrice) || 0,
      price: Number(newServicePart.unitPrice) || 0,
      observation: newServicePart.observation
    };
    setNewService((s: any) => ({...s, partsList: [...s.partsList, part]}));
    setNewServicePart({ name: '', quantity: '1', unitPrice: '', observation: '' });
  };

  const handleAISuggestPrice = async () => {
    if(!newServicePart.name) return;
    try {
      const res = await geminiService.researchPart(newServicePart.name, vehicleNameModel);
      if(res.part?.estimatedPrice) {
        setNewServicePart((prev: any) => ({...prev, unitPrice: String(res.part?.estimatedPrice)}));
      } else {
        alert("IA não encontrou preço médio. Digite manualmente.");
      }
    } catch(e) {
      alert("Erro na pesquisa de preço.");
    }
  };

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
          ></motion.div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }} 
            className="relative bg-white rounded p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6 italic uppercase tracking-tighter text-brand-primary">Novo Registro de Serviço</h2>
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Descrição do Serviço</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Revisão Geral" 
                    className="w-full bg-gray-50 border-0 rounded-xl p-4 font-bold focus:ring-2 focus:ring-brand-accent" 
                    value={newService.description} 
                    onChange={e => setNewService({...newService, description: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Km Atual</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono focus:ring-2 focus:ring-brand-accent" 
                      value={newService.mileage} 
                      onChange={e => setNewService({...newService, mileage: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Data</label>
                    <input 
                      type="date" 
                      className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent" 
                      value={newService.date} 
                      onChange={e => setNewService({...newService, date: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Oficina / Estabelecimento*</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Mecânica do João" 
                    className="w-full bg-gray-50 border-0 rounded-xl p-4 font-bold focus:ring-2 focus:ring-brand-accent" 
                    value={newService.workshopName} 
                    onChange={e => setNewService({...newService, workshopName: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Endereço da Oficina</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent" 
                    value={newService.workshopAddress} 
                    onChange={e => setNewService({...newService, workshopAddress: e.target.value})} 
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Peças e Insumos</h3>
                  {vehicleParts.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-[60%]">
                      {vehicleParts.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => setNewServicePart({ name: p.name, quantity: '1', unitPrice: p.estimatedPrice ? String(p.estimatedPrice) : '', observation: '' })}
                          className="text-[9px] bg-white border border-gray-200 px-2 py-1 rounded-full whitespace-nowrap hover:border-brand-primary transition-colors font-bold text-gray-500"
                        >
                          + {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {newService.partsList.map((p: ServicePart, idx: number) => (
                    <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-50">
                      <div className="flex flex-col">
                         <span className="text-sm font-bold text-gray-700">{p.name}</span>
                         <span className="text-[10px] text-gray-400 font-mono">Qtd: {p.quantity} • Unit: R$ {p.unitPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-black text-brand-primary">R$ {(p.quantity * p.unitPrice).toLocaleString()}</span>
                        <button onClick={() => setNewService((s: any) => ({...s, partsList: s.partsList.filter((_: any, i: number) => i !== idx)}))} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2">
                    <input 
                      type="text" 
                      placeholder="Nome da Peça / Item" 
                      className="col-span-3 bg-white border-gray-100 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-accent" 
                      value={newServicePart.name} 
                      onChange={e => setNewServicePart({...newServicePart, name: e.target.value})} 
                    />
                    <input 
                      type="number" 
                      placeholder="Qtd" 
                      className="bg-white border-gray-100 rounded-lg p-2 text-xs font-mono" 
                      value={newServicePart.quantity} 
                      onChange={e => setNewServicePart({...newServicePart, quantity: e.target.value})} 
                    />
                    <div className="flex gap-1">
                      <button 
                         onClick={handleAddPartToService}
                         className="bg-brand-primary text-white rounded-lg flex items-center justify-center hover:bg-brand-accent transition-colors flex-1"
                         title="Adicionar ao Serviço"
                      >
                        <Plus size={16} />
                      </button>
                      <button 
                         onClick={() => onOpenAddPartCatalog(newServicePart.name)}
                         className="bg-brand-accent text-white rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors flex-1"
                         title="Salvar no Catálogo Master"
                      >
                        <Book size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Preço Unitário (R$)" 
                      className="flex-1 bg-white border-gray-100 rounded-lg p-2 text-xs font-mono" 
                      value={newServicePart.unitPrice} 
                      onChange={e => setNewServicePart({...newServicePart, unitPrice: e.target.value})} 
                    />
                    {newServicePart.name && (
                      <button 
                        onClick={handleAISuggestPrice}
                        className="bg-blue-50 text-blue-500 text-[10px] font-bold px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <Sparkles size={10} /> Sugerir Preço
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Mão de Obra (R$)</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono text-brand-primary font-bold focus:ring-2 focus:ring-brand-accent" 
                    value={newService.laborCost} 
                    onChange={e => setNewService({...newService, laborCost: e.target.value})} 
                  />
                </div>
                <div className="bg-brand-primary/5 p-4 rounded-xl flex flex-col justify-center border border-brand-primary/10">
                  <label className="text-[9px] font-bold text-brand-primary uppercase tracking-widest">Total Estimado</label>
                  <p className="text-lg font-mono font-black text-brand-primary">
                    R$ {(
                      (newService.partsList.reduce((sum: number, p: ServicePart) => sum + (p.quantity * p.unitPrice), 0)) + 
                      (Number(newService.laborCost) || 0)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">Cancelar</button>
              <button 
                onClick={onAddService} 
                className="flex-2 py-4 bg-brand-primary text-white rounded font-bold shadow-lg hover:bg-brand-accent transition-all"
              >
                Registrar Serviço
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
