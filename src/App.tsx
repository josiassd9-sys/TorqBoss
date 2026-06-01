import React, { useState } from 'react';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { AppHeader } from './components/AppHeader';
import { DashboardHome } from './components/DashboardHome';
import { SettingsModal } from './components/SettingsModal';
import { AppData, Vehicle } from './types';

const initialData: AppData = {
  settings: {
    appName: 'TorqBoss',
    appSubtitle: 'Gestão de veículos e manutenção',
    vehicleIdentifierLabel: 'Placa',
    vehicleIdentifierPlaceholder: 'AAA-0000'
  },
  vehicles: []
};

const createVehicle = (name: string): Vehicle => ({
  id: `${Date.now()}`,
  name,
  make: undefined,
  model: undefined,
  year: undefined,
  mileage: 0,
  fuelLogs: [],
  services: [],
  parts: [],
});

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(initialData);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState('');

  const formatDistance = (value: number) => {
    return `${value.toLocaleString('pt-BR')} km`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    window.alert(`Selecionado: ${vehicle.name}`);
  };

  const handleDeleteVehicle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setData((prev) => ({
      ...prev,
      vehicles: prev.vehicles?.filter((vehicle) => vehicle.id !== id) ?? []
    }));
  };

  const handleAddVehicle = () => {
    setIsAddingVehicle(true);
  };

  const handleImportVehicle = () => {
    window.alert('Importar veículo ainda não está disponível nesta versão.');
  };

  const handleConfirmAddVehicle = () => {
    if (!newVehicleName.trim()) return;
    const vehicle = createVehicle(newVehicleName.trim());
    setData((prev) => ({
      ...prev,
      vehicles: [...(prev.vehicles || []), vehicle]
    }));
    setNewVehicleName('');
    setIsAddingVehicle(false);
  };

  const handleUpdateSettings = (settings: AppData['settings']) => {
    setData((prev) => ({ ...prev, settings }));
  };

  const handleResetData = () => {
    setData(initialData);
  };

  return (
    <FirebaseProvider>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <AppHeader
            data={data}
            setIsSettingsOpen={setIsSettingsOpen}
            setIsAddingVehicle={setIsAddingVehicle}
          />

          {isAddingVehicle && (
            <div className="mb-6 rounded-3xl border border-dashed border-brand-primary/30 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-brand-primary mb-3">Adicionar novo veículo</h2>
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <input
                  value={newVehicleName}
                  onChange={(event) => setNewVehicleName(event.target.value)}
                  placeholder="Nome do veículo"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-brand-primary/20 transition-all focus:border-brand-primary focus:ring"
                />
                <button
                  onClick={handleConfirmAddVehicle}
                  className="rounded-2xl bg-brand-primary px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-brand-primary/90"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}

          <DashboardHome
            data={data}
            onSelectVehicle={handleSelectVehicle}
            onAddVehicle={handleAddVehicle}
            onImportVehicle={handleImportVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            formatDistance={formatDistance}
            formatCurrency={formatCurrency}
          />

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            data={data}
            onUpdateSettings={handleUpdateSettings}
            onResetData={handleResetData}
          />
        </div>
      </div>
    </FirebaseProvider>
  );
};

export default App;
