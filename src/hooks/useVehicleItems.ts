import { useState } from 'react';
import { Vehicle, AppData, Part, ServiceEntry, FuelLog, Reminder } from '../types';
import { geminiService } from '../services/geminiService';

export function useVehicleItems(
  data: AppData,
  handleSave: (newData: AppData) => void,
  selectedVehicle: Vehicle | null,
  updateSelectedVehicle: (updates: Partial<Vehicle>) => void
) {
  const [itemToDelete, setItemToDelete] = useState<{ type: string, id: string } | null>(null);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);

  const addService = (service: ServiceEntry) => {
    if (!selectedVehicle) return;
    updateSelectedVehicle({
      services: [service, ...(selectedVehicle.services || [])]
    });
  };

  const addFuel = (fuel: FuelLog) => {
    if (!selectedVehicle) return;
    updateSelectedVehicle({
      fuelLogs: [fuel, ...(selectedVehicle.fuelLogs || [])]
    });
  };

  const addReminder = (reminder: Reminder) => {
    if (!selectedVehicle) return;
    updateSelectedVehicle({
      reminders: [reminder, ...(selectedVehicle.reminders || [])]
    });
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

  const handleDeleteItem = (type: string, id: string) => {
    setItemToDelete({ type, id });
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'vehicle') {
      const newData = { ...data, vehicles: data.vehicles.filter(v => v.id !== itemToDelete.id) };
      handleSave(newData);
    } else {
      if (!selectedVehicle) return;
      const type = itemToDelete.type === 'service' ? 'services' : 
                   itemToDelete.type === 'fuel' ? 'fuelLogs' : 
                   itemToDelete.type === 'reminder' ? 'reminders' : 'parts';
      
      const updatedVehicles = data.vehicles.map(v => {
        if (v.id === selectedVehicle.id) {
          return { ...v, [type]: (v[type] as any[]).filter((item: any) => item.id !== itemToDelete.id) };
        }
        return v;
      });
      handleSave({ ...data, vehicles: updatedVehicles });
    }
    setItemToDelete(null);
  };

  const checkDuplicate = (name: string, code?: string) => {
    if (!selectedVehicle) return false;
    return selectedVehicle.parts.some(p => 
      p.name.toLowerCase() === name.toLowerCase() || 
      (code && p.code && p.code !== "" && p.code === code)
    );
  };

  const addPart = async (overrideName?: string) => {
    const searchName = overrideName || newPartName;
    if (!selectedVehicle || !searchName) return;
    
    setIsResearching(true);
    try {
      const response = await geminiService.researchPart(searchName, `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`);
      
      if (response.isAmbiguous && response.suggestions && response.suggestions.length > 0) {
        setAiSuggestions(response.suggestions);
        setIsResearching(false);
        return;
      }

      if (response.part) {
        if (checkDuplicate(response.part.name || searchName, response.part.code)) {
          alert('Esta peça já consta no seu banco de dados ou possui o mesmo código.');
          setIsResearching(false);
          return;
        }

        const part: Part = {
          id: crypto.randomUUID(),
          name: response.part.name || searchName,
          code: response.part.code || '',
          category: response.part.category || 'Geral',
          description: response.part.description || '',
          lifespan: response.part.lifespan || '',
          maintenanceInterval: response.part.maintenanceInterval || '',
          brand: response.part.brand || '',
          photoUrl: response.part.photoUrl || '',
          status: 'ok',
          technicalSpecs: response.part.technicalSpecs || {}
        };

        updateSelectedVehicle({
          parts: [...(selectedVehicle.parts || []), part]
        });
        setNewPartName('');
        setAiSuggestions([]);
        setIsAddingPart(false);
      }
    } catch (error) {
      alert('Erro ao pesquisar peça com IA. Tente novamente.');
    } finally {
      setIsResearching(false);
    }
  };

  const deletePart = (partId: string) => {
    if (!selectedVehicle) return;
    updateSelectedVehicle({
      parts: (selectedVehicle.parts || []).filter(p => p.id !== partId)
    });
  };

  const togglePartBudget = (partId: string) => {
    if (!selectedVehicle) return;
    updateSelectedVehicle({
      parts: (selectedVehicle.parts || []).map(p => p.id === partId ? { ...p, isInBudget: !p.isInBudget } : p)
    });
  };

  const estimatePrice = async (part: Part) => {
    if (!selectedVehicle) return;
    setIsEstimatingPrice(true);
    try {
      const result = await geminiService.estimatePartPrice(part.name, `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`);
      if (result) {
        updateSelectedVehicle({
          parts: (selectedVehicle.parts || []).map(p => p.id === part.id ? { 
            ...p, 
            estimatedPrice: result.estimatedPrice, 
            priceType: result.priceType,
            unitsPerSet: result.unitsPerSet,
            isInBudget: true 
          } : p)
        });
      } else {
        alert('Não foi possível estimar o preço automaticamente.');
      }
    } finally {
      setIsEstimatingPrice(false);
    }
  };

  const updatePartPrice = (partId: string, price: number) => {
    if (!selectedVehicle) return;
    updateSelectedVehicle({
      parts: (selectedVehicle.parts || []).map(p => p.id === partId ? { ...p, estimatedPrice: price } : p)
    });
  };

  return {
    itemToDelete,
    setItemToDelete,
    handleDeleteItem,
    confirmDelete,
    addService,
    addFuel,
    addReminder,
    toggleReminder,
    isAddingPart,
    setIsAddingPart,
    newPartName,
    setNewPartName,
    aiSuggestions,
    setAiSuggestions,
    isResearching,
    addPart,
    deletePart,
    togglePartBudget,
    estimatePrice,
    isEstimatingPrice,
    updatePartPrice
  };
}
