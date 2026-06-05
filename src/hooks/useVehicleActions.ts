import { useState } from 'react';
import { Vehicle, AppData } from '../types';
import { storageService } from '../services/storageService';

export function useVehicleActions(
  data: AppData,
  setData: React.Dispatch<React.SetStateAction<AppData>>,
  handleSave: (newData: AppData) => void,
  selectedVehicle: Vehicle | null,
  setSelectedVehicle: React.Dispatch<React.SetStateAction<Vehicle | null>>
) {
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    name: '',
    model: '',
    year: '',
    plate: '',
    mileage: 0,
    imageUrl: '',
    brandLogoUrl: '',
    color: '',
    engine: '',
    version: '',
    fuelType: '',
    chassis: '',
    parts: [],
    services: [],
    fuelLogs: [],
    reminders: [],
    tireSets: [],
    diagnosticHistory: [],
    avgDailyKm: 30,
    usageProfile: 'mixed',
    drivingStyle: 'moderate',
    usageDays: [1, 2, 3, 4, 5],
    operatingRpm: 'mid',
    fipeValue: 0
  });

  const addVehicle = () => {
    if (!newVehicle.name || !newVehicle.model) {
      alert('Preencha Marca e Modelo');
      return;
    }
    const vehicle: Vehicle = {
      ...newVehicle as Vehicle,
      id: crypto.randomUUID(),
      parts: [],
      services: [],
      fuelLogs: [],
      reminders: [],
      tireSets: [],
      diagnosticHistory: [],
      createdAt: new Date().toISOString(),
      mileage: Number(newVehicle.mileage) || 0
    };
    const newData = { ...data, vehicles: [...data.vehicles, vehicle] };
    handleSave(newData);
    setIsAddingVehicle(false);
    setNewVehicle({
      name: '',
      model: '',
      year: '',
      plate: '',
      mileage: 0,
      imageUrl: '',
      brandLogoUrl: '',
      color: '',
      engine: '',
      version: '',
      fuelType: '',
      chassis: '',
      parts: [],
      services: [],
      fuelLogs: [],
      reminders: [],
      tireSets: [],
      diagnosticHistory: [],
      avgDailyKm: 30,
      usageProfile: 'mixed',
      drivingStyle: 'moderate',
      usageDays: [1, 2, 3, 4, 5],
      operatingRpm: 'mid',
      fipeValue: 0
    });
  };

  const updateVehicle = () => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => 
      v.id === selectedVehicle.id ? { ...v, ...newVehicle } : v
    );
    handleSave({ ...data, vehicles: updatedVehicles as Vehicle[] });
    setIsEditingVehicle(false);
    setSelectedVehicle(prev => prev ? { ...prev, ...newVehicle } : null);
  };

  const deleteVehicle = (id: string) => {
    const newData = { ...data, vehicles: data.vehicles.filter(v => v.id !== id) };
    handleSave(newData);
    if (selectedVehicle?.id === id) setSelectedVehicle(null);
  };

  const moveVehicleToTop = (id: string) => {
    const idx = data.vehicles.findIndex(v => v.id === id);
    if (idx <= 0) return;

    const newVehicles = [...data.vehicles];
    const [movedVehicle] = newVehicles.splice(idx, 1);
    newVehicles.unshift(movedVehicle);

    const newData = { ...data, vehicles: newVehicles };
    handleSave(newData);
  };

  const openEditModal = () => {
    if (!selectedVehicle) return;
    setNewVehicle({
      ...selectedVehicle,
      plate: selectedVehicle.plate || '',
      color: selectedVehicle.color || '',
      imageUrl: selectedVehicle.imageUrl || '',
      brandLogoUrl: selectedVehicle.brandLogoUrl || '',
      engine: selectedVehicle.engine || '',
      version: selectedVehicle.version || '',
      fuelType: selectedVehicle.fuelType || '',
      chassis: selectedVehicle.chassis || '',
      usageProfile: selectedVehicle.usageProfile || 'mixed',
      avgDailyKm: selectedVehicle.avgDailyKm || 30,
      drivingStyle: selectedVehicle.drivingStyle || 'moderate',
      usageDays: selectedVehicle.usageDays || [1, 2, 3, 4, 5],
      operatingRpm: selectedVehicle.operatingRpm || 'mid',
      fipeValue: selectedVehicle.fipeValue || 0
    });
    setIsEditingVehicle(true);
  };

  const updateSelectedVehicle = (updates: Partial<Vehicle>) => {
    if (!selectedVehicle) return;
    const updated = { ...selectedVehicle, ...updates };
    setSelectedVehicle(updated);

    const updatedData = {
      ...data,
      vehicles: data.vehicles.map(v => v.id === selectedVehicle.id ? updated : v)
    };

    handleSave(updatedData);
  };

  return {
    isAddingVehicle,
    setIsAddingVehicle,
    isEditingVehicle,
    setIsEditingVehicle,
    newVehicle,
    setNewVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    moveVehicleToTop,
    openEditModal,
    updateSelectedVehicle
  };
}
