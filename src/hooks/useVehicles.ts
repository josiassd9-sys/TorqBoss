import { useState } from 'react';
import { Vehicle, AppData } from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_VEHICLE_STATE } from '../constants';

export function useVehicles(data: AppData, setData: React.Dispatch<React.SetStateAction<AppData>>, setSelectedVehicle: React.Dispatch<React.SetStateAction<Vehicle | null>>) {
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState(DEFAULT_VEHICLE_STATE);
  const [itemToDelete, setItemToDelete] = useState<{ type: string, id: string } | null>(null);

  const addVehicle = () => {
    const vehicleToAdd: Vehicle = {
      ...newVehicle,
      id: crypto.randomUUID(),
      mileage: Number(newVehicle.mileage) || 0,
      createdAt: new Date().toISOString(),
      parts: [],
      services: [],
      fuelLogs: [],
      reminders: [],
      tireSets: []
    };

    const newData = {
      ...data,
      vehicles: [...data.vehicles, vehicleToAdd]
    };

    setData(newData);
    storageService.saveData(newData);
    setIsAddingVehicle(false);
    setNewVehicle(DEFAULT_VEHICLE_STATE);
  };

  const updateVehicle = () => {
    const newData = {
      ...data,
      vehicles: data.vehicles.map(v => v.id === (newVehicle as any).id ? { ...v, ...newVehicle } : v)
    };
    setData(newData);
    storageService.saveData(newData);
    setIsEditingVehicle(false);
    setNewVehicle(DEFAULT_VEHICLE_STATE);
  };

  const deleteVehicle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete({ type: 'vehicle', id });
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'vehicle') {
      const newData = {
        ...data,
        vehicles: data.vehicles.filter(v => v.id !== itemToDelete.id)
      };
      setData(newData);
      storageService.saveData(newData);
      // If the deleted vehicle was selected, clear selection
      // Note: We'll handle this in the main App or by returning a function
    }
    
    setItemToDelete(null);
  };

  const moveVehicleToTop = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = data.vehicles.findIndex(v => v.id === id);
    if (idx <= 0) return;
    
    const newVehicles = [...data.vehicles];
    const [movedVehicle] = newVehicles.splice(idx, 1);
    newVehicles.unshift(movedVehicle);
    
    const newData = { ...data, vehicles: newVehicles };
    setData(newData);
    storageService.saveData(newData);
  };

  return {
    isAddingVehicle,
    setIsAddingVehicle,
    isEditingVehicle,
    setIsEditingVehicle,
    newVehicle,
    setNewVehicle,
    itemToDelete,
    setItemToDelete,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    confirmDelete,
    moveVehicleToTop
  };
}
