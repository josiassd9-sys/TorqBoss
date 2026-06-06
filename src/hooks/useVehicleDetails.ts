import { useState } from 'react';
import { Vehicle, AppData, ServiceEntry, FuelLog, Reminder, Part, TireSet, ServicePart } from '../types';
import { geminiService } from '../services/geminiService';

export function useVehicleDetails(
  selectedVehicle: Vehicle | null, 
  data: AppData, 
  handleSave: (data: AppData) => void,
  setSelectedVehicle: React.Dispatch<React.SetStateAction<Vehicle | null>>
) {
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [isAddingFuel, setIsAddingFuel] = useState(false);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);
  
  const [newService, setNewService] = useState({ 
    description: '', 
    mileage: '', 
    laborCost: '', 
    workshopName: '', 
    workshopAddress: '',
    workshopPhone: '',
    mechanicName: '',
    date: new Date().toISOString().split('T')[0],
    partsList: [] as ServicePart[]
  });
  const [newFuel, setNewFuel] = useState({ mileage: '', liters: '', cost: '', fullTank: true, date: new Date().toISOString().split('T')[0] });
  const [newReminder, setNewReminder] = useState({ title: '', targetMileage: '', targetDate: '', type: 'oil' as any });
  const [newPartName, setNewPartName] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const addService = () => {
    if (!selectedVehicle || !newService.description || !newService.workshopName) {
      alert('Descrição e Nome da Oficina são obrigatórios.');
      return;
    }
    
    const partsCost = newService.partsList.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const laborCost = Number(newService.laborCost) || 0;
    const totalCost = partsCost + laborCost;

    const service: ServiceEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newService,
      mileage: Number(newService.mileage),
      cost: totalCost,
      laborCost: laborCost,
    };
    
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { 
          ...v, 
          services: [...(v.services || []), service],
          mileage: Math.max(v.mileage, Number(newService.mileage))
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
    setIsAddingService(false);
    setNewService({ 
      description: '', 
      mileage: '', 
      laborCost: '', 
      workshopName: newService.workshopName, 
      workshopAddress: newService.workshopAddress,
      workshopPhone: newService.workshopPhone,
      mechanicName: newService.mechanicName,
      date: new Date().toISOString().split('T')[0],
      partsList: [] as ServicePart[]
    });
  };

  const addFuel = () => {
    if (!selectedVehicle || !newFuel.liters) return;
    const fuel: FuelLog = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newFuel,
      mileage: Number(newFuel.mileage),
      liters: Number(newFuel.liters),
      cost: Number(newFuel.cost)
    };
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { 
          ...v, 
          fuelLogs: [...(v.fuelLogs || []), fuel],
          mileage: Math.max(v.mileage, Number(newFuel.mileage))
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
    setIsAddingFuel(false);
    setNewFuel({ mileage: '', liters: '', cost: '', fullTank: true, date: new Date().toISOString().split('T')[0] });
  };

  const addReminder = () => {
    if (!selectedVehicle || !newReminder.title) return;
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newReminder,
      targetMileage: newReminder.targetMileage ? Number(newReminder.targetMileage) : undefined,
      isCompleted: false
    };
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { ...v, reminders: [...(v.reminders || []), reminder] };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
    setIsAddingReminder(false);
    setNewReminder({ title: '', targetMileage: '', targetDate: '', type: 'oil' });
  };

  const toggleReminder = (reminderId: string) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          reminders: (v.reminders || []).map(r => r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r)
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const deletePart = (partId: string) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { ...v, parts: v.parts.filter(p => p.id !== partId) };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const togglePartBudget = (partId: string) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          parts: v.parts.map(p => p.id === partId ? { ...p, isInBudget: !p.isInBudget } : p)
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const researchPart = async () => {
    if (!newPartName || !selectedVehicle) return;
    setIsResearching(true);
    try {
      const response = await geminiService.researchPart(newPartName, `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`);
      if (response && response.part) {
        const part: Part = {
          id: crypto.randomUUID(),
          name: response.part.name || newPartName,
          category: response.part.category || 'Geral',
          description: response.part.description || '',
          lifespan: response.part.lifespan || '',
          maintenanceInterval: response.part.maintenanceInterval || '',
          brand: response.part.brand || '',
          photoUrl: response.part.photoUrl || '',
          status: 'ok',
          technicalSpecs: response.part.technicalSpecs || {}
        };

        const updatedVehicles = data.vehicles.map(v => {
          if (v.id === selectedVehicle.id) {
            return { ...v, parts: [...v.parts, part] };
          }
          return v;
        });

        handleSave({ ...data, vehicles: updatedVehicles });
        setNewPartName('');
        setAiSuggestions([]);
        setIsAddingPart(false);
      }
    } catch (error) {
       alert('Erro ao pesquisar peça com IA.');
    } finally {
      setIsResearching(false);
    }
  };

  const estimatePrice = async (part: Part) => {
    if (!selectedVehicle) return;
    setIsEstimatingPrice(true);
    try {
      const result = await geminiService.estimatePartPrice(part.name, `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`);
      if (result) {
        const updatedVehicles = data.vehicles.map(v => {
          if (v.id === selectedVehicle.id) {
            return {
              ...v,
              parts: v.parts.map(p => p.id === part.id ? { 
                ...p, 
                estimatedPrice: result.estimatedPrice, 
                priceType: result.priceType,
                unitsPerSet: result.unitsPerSet,
                isInBudget: true 
              } : p)
            };
          }
          return v;
        });
        handleSave({ ...data, vehicles: updatedVehicles });
      }
    } finally {
      setIsEstimatingPrice(false);
    }
  };

  const addTireSet = (tireSet: Omit<TireSet, 'id' | 'status'>) => {
    if (!selectedVehicle) return;
    const newTireSet: TireSet = {
      ...tireSet,
      id: Math.random().toString(36).substr(2, 9),
      status: 'ok'
    };
    const updated = { ...selectedVehicle, tireSets: [...(selectedVehicle.tireSets || []), newTireSet] };
    setSelectedVehicle(updated);
    const updatedVehicles = data.vehicles.map(v => v.id === selectedVehicle.id ? updated : v);
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const deleteTireSet = (id: string) => {
    if (!selectedVehicle) return;
    const updated = { ...selectedVehicle, tireSets: (selectedVehicle.tireSets || []).filter(t => t.id !== id) };
    setSelectedVehicle(updated);
    const updatedVehicles = data.vehicles.map(v => v.id === selectedVehicle.id ? updated : v);
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const updateTireSet = (id: string, updates: Partial<TireSet>) => {
    if (!selectedVehicle) return;
    const updated = {
      ...selectedVehicle,
      tireSets: (selectedVehicle.tireSets || []).map(t => t.id === id ? { ...t, ...updates } : t)
    };
    setSelectedVehicle(updated);
    const updatedVehicles = data.vehicles.map(v => v.id === selectedVehicle.id ? updated : v);
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  return {
    isAddingPart, setIsAddingPart,
    isAddingService, setIsAddingService,
    isAddingFuel, setIsAddingFuel,
    isAddingReminder, setIsAddingReminder,
    isResearching, isEstimatingPrice,
    newService, setNewService,
    newFuel, setNewFuel,
    newReminder, setNewReminder,
    newPartName, setNewPartName,
    aiSuggestions, setAiSuggestions,
    addService, addFuel, addReminder, toggleReminder,
    deletePart, togglePartBudget, researchPart, estimatePrice,
    addTireSet, deleteTireSet, updateTireSet
  };
}
