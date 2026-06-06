import { useState } from 'react';
import { Vehicle, AppData } from '../types';
import { geminiService } from '../services/geminiService';

export function useVehicleManual(
  selectedVehicle: Vehicle | null,
  data: AppData,
  handleSave: (data: AppData) => void,
  setSelectedVehicle: React.Dispatch<React.SetStateAction<Vehicle | null>>
) {
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [isCalculatingSimulation, setIsCalculatingSimulation] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string | ArrayBuffer | null;
        if (!result || typeof result !== 'string') {
          reject(new Error('Não foi possível ler o arquivo PDF como texto.'));
          return;
        }
        const parts = result.split(',');
        if (parts.length < 2) {
          reject(new Error('Formato de PDF inesperado.'));
          return;
        }
        resolve(parts[1]);
      };
      reader.onerror = () => reject(reader.error || new Error('Erro ao ler o arquivo PDF.'));
      reader.readAsDataURL(file);
    });
  };

  const handleManualPDFUpload = async (file: File) => {
    if (!selectedVehicle) {
      alert('Selecione um veículo primeiro.');
      return;
    }

    if (!data.settings?.geminiApiKey) {
      alert('Configure a chave da API do Gemini nas configurações.');
      return;
    }

    setIsUploadingPDF(true);
    try {
      const base64Data = await readFileAsBase64(file);
      const vehicleModelStr = `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`;
      
      const manualData = await geminiService.extractVehicleManualFromPdf(
        base64Data,
        vehicleModelStr
      );

      const manual = {
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        ...manualData
      };

      if (!manual || !manual.fullText) {
        throw new Error('O manual extraído não retornou o texto completo.');
      }

      const updatedVehicles = data.vehicles.map(v => {
        if (v.id === selectedVehicle.id) {
          return {
            ...v,
            manual,
            manualTranscription: manual.fullText
          };
        }
        return v;
      });

      const newData = { ...data, vehicles: updatedVehicles };
      handleSave(newData);
      setSelectedVehicle(prev => prev ? { ...prev, manual, manualTranscription: manual.fullText } : prev);

      alert('✅ Manual do veículo carregado e processado com sucesso!');
    } catch (error: any) {
      console.error('Erro completo ao processar PDF:', error);
      alert(`❌ Erro ao processar o PDF:\n${error?.message || error}`);
    } finally {
      setIsUploadingPDF(false);
    }
  };

  const runSimulation = async (simulationMileage: number | '') => {
    if (!selectedVehicle || !simulationMileage) return;
    setIsCalculatingSimulation(true);
    try {
      let result;
      if (selectedVehicle.manual?.maintenanceSchedule) {
        result = await geminiService.simulateMaintenanceFromManual(
          `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`,
          Number(simulationMileage),
          { maintenanceSchedule: selectedVehicle.manual.maintenanceSchedule }
        );
      } else {
        result = await geminiService.simulateMaintenance(
          `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`,
          Number(simulationMileage)
        );
      }
      setSimulationResults(result.recommendations);
    } catch (error) {
      alert('Erro ao processar simulação. Tente novamente.');
    } finally {
      setIsCalculatingSimulation(false);
    }
  };

  const [isGeneratingManual, setIsGeneratingManual] = useState(false);
  const [isChattingWithManual, setIsChattingWithManual] = useState(false);
  const [manualChatResponse, setManualChatResponse] = useState('');
  const [manualChatQuery, setManualChatQuery] = useState('');

  const generateManualInfo = async () => {
    if (!selectedVehicle) return;
    setIsGeneratingManual(true);
    try {
      const info = await geminiService.getVehicleManualInfo(`${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`);
      const updatedVehicles = data.vehicles.map(v => {
        if (v.id === selectedVehicle.id) {
          return { ...v, manualTranscription: info };
        }
        return v;
      });
      handleSave({ ...data, vehicles: updatedVehicles });
      setSelectedVehicle(prev => prev ? { ...prev, manualTranscription: info } : prev);
      alert('Informações do manual geradas com IA!');
    } catch (error) {
      alert('Erro ao gerar informações do manual.');
    } finally {
      setIsGeneratingManual(false);
    }
  };

  const chatWithManual = async (query: string) => {
    if (!selectedVehicle || !query) return;
    setIsChattingWithManual(true);
    try {
      const context = selectedVehicle.manualTranscription || "";
      const model = `${selectedVehicle.name} ${selectedVehicle.model}`;
      const response = await geminiService.chatWithManual(query, context, model);
      setManualChatResponse(response);
    } catch (error) {
      setManualChatResponse('Erro ao conversar com o manual. Tente novamente.');
    } finally {
      setIsChattingWithManual(false);
    }
  };

  return {
    isUploadingPDF,
    isCalculatingSimulation,
    simulationResults,
    setSimulationResults,
    handleManualPDFUpload,
    runSimulation,
    isGeneratingManual,
    isChattingWithManual,
    manualChatResponse,
    manualChatQuery,
    setManualChatQuery,
    setManualChatResponse,
    generateManualInfo,
    chatWithManual
  };
}
