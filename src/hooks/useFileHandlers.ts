import { useRef } from 'react';
import { Vehicle, AppData } from '../types';
import { fileToBase64, resizeImage } from '../lib/utils';

export function useFileHandlers(
  data: AppData,
  handleSave: (data: AppData) => void,
  selectedVehicle: Vehicle | null,
  updateSelectedVehicle: (updates: Partial<Vehicle>) => void,
  setNewVehicle: React.Dispatch<React.SetStateAction<Partial<Vehicle>>>,
  setSelectedVehicle: (vehicle: Vehicle | null) => void,
  handleManualPDFUpload: (file: File) => Promise<void>
) {
  const manualPDFInputRef = useRef<HTMLInputElement | null>(null);
  const importVehicleInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const vehicleImageInputRef = useRef<HTMLInputElement | null>(null);
  const brandLogoInputRef = useRef<HTMLInputElement | null>(null);

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleManualPDFUpload(file);
    if (manualPDFInputRef.current) manualPDFInputRef.current.value = '';
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData.vehicles) {
          handleSave(importedData);
          alert('Dados importados com sucesso!');
        }
      } catch (err) {
        alert('Erro ao importar arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportVehicle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedVehicle = JSON.parse(event.target?.result as string) as Vehicle;
        if (!importedVehicle.name || !importedVehicle.id) throw new Error('Formato inválido');
        const existingIdx = data.vehicles.findIndex(v => v.id === importedVehicle.id);
        let updatedVehicles;
        if (existingIdx >= 0) {
          if (confirm('Substituir veículo existente?')) {
            updatedVehicles = [...data.vehicles];
            updatedVehicles[existingIdx] = importedVehicle;
          } else return;
        } else {
          updatedVehicles = [...data.vehicles, importedVehicle];
        }
        handleSave({ ...data, vehicles: updatedVehicles });
        setSelectedVehicle(importedVehicle);
      } catch (err) {
        alert('Erro na importação.');
      }
    };
    reader.readAsText(file);
  };

  const exportVehicle = (vehicle: Vehicle) => {
    const jsonStr = JSON.stringify(vehicle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vehicle.plate || 'veiculo'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareTechnicalReport = (maintenancePredictions: any[], getVehicleHealth: (v: Vehicle | null) => number) => {
    if (!selectedVehicle) return;
    const servicesText = (selectedVehicle.services || []).slice(-3).map(s => `• ${s.date}: ${s.description} (${s.mileage}km)`).join('\n');
    const predictionsText = (maintenancePredictions || []).map(p => `• ${p.item}: Previsto para ${p.estimatedDate}`).join('\n');
    const report = `*RELATÓRIO TÉCNICO - ${selectedVehicle.name} ${selectedVehicle.model}*\n🚗 Placa: ${selectedVehicle.plate || 'N/A'}\n📊 Saúde Atual: ${getVehicleHealth(selectedVehicle)}%\n📍 KM: ${selectedVehicle.mileage}\n\n*ÚLTIMOS SERVIÇOS:*\n${servicesText || 'Nenhum histórico recente.'}\n\n*PREVISÕES DE MANUTENÇÃO:*\n${predictionsText || 'Analise de saúde necessária.'}\n\n💬 *Análise IA:* ${maintenancePredictions.length > 0 ? 'Existem manutenções pendentes' : 'Veículo em bom estado'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(report)}`, '_blank');
  };

  const handleVehicleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file, 1200, 800);
      if (selectedVehicle) {
        updateSelectedVehicle({ imageUrl: resized });
      } else {
        setNewVehicle(prev => ({ ...prev, imageUrl: resized }));
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao processar imagem.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file, 400, 400);
      if (selectedVehicle) {
        updateSelectedVehicle({ brandLogoUrl: resized });
      } else {
        setNewVehicle(prev => ({ ...prev, brandLogoUrl: resized }));
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao processar logotipo.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  return {
    manualPDFInputRef,
    importVehicleInputRef,
    fileInputRef,
    vehicleImageInputRef,
    brandLogoInputRef,
    handleImport,
    handleImportVehicle,
    exportVehicle,
    handleVehicleImageUpload,
    handleBrandLogoUpload,
    handlePDFUpload,
    shareTechnicalReport
  };
}
