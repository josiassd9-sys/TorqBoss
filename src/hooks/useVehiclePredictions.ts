import { useState, useEffect } from 'react';
import { Vehicle, AppData, ServiceEntry } from '../types';
import { geminiService } from '../services/geminiService';
import { getFuelAnalytics } from '../lib/vehicleUtils';

export function useVehiclePredictions(selectedVehicle: Vehicle | null, data: AppData, handleSave: (data: AppData) => void) {
  const [maintenancePredictions, setMaintenancePredictions] = useState<{ item: string; daysLeft: number; estimatedDate: string; priority: string }[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [fuelInsight, setFuelInsight] = useState<string | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<string | null>(null);
  const [isAnalyzingMarket, setIsAnalyzingMarket] = useState(false);
  const [tcoAnalysis, setTcoAnalysis] = useState<string | null>(null);
  const [isAnalyzingTco, setIsAnalyzingTco] = useState(false);
  const [digitalPassport, setDigitalPassport] = useState<string | null>(null);
  const [isGeneratingPassport, setIsGeneratingPassport] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isAnalyzingHealth, setIsAnalyzingHealth] = useState(false);
  const [symptomQuery, setSymptomQuery] = useState('');

  const fetchPredictions = async (vehicle: Vehicle) => {
    setIsLoadingPredictions(true);
    try {
      const result = await geminiService.predictMaintenance(vehicle);
      setMaintenancePredictions(result.items);
      
      const analytics = getFuelAnalytics(vehicle);
      if (analytics && analytics.data.length >= 1) {
        const insight = await geminiService.getFuelInsight(analytics.avgKmL.toString(), vehicle);
        setFuelInsight(insight);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  useEffect(() => {
    if (selectedVehicle) {
      // Automatic fetch disabled to save quota
      // fetchPredictions(selectedVehicle);
      setMaintenancePredictions([]);
      setDiagnosisResult(null);
      setSymptomQuery('');
      setFuelInsight(null);
      setMarketAnalysis(null);
      setTcoAnalysis(null);
      setDigitalPassport(null);
    }
  }, [selectedVehicle?.id]);

  const handleManualRefresh = () => {
    if (selectedVehicle) fetchPredictions(selectedVehicle);
  };

  const handleDiagnose = async () => {
    if (!symptomQuery || !selectedVehicle) return;
    setIsDiagnosing(true);
    try {
      const result = await geminiService.diagnoseSymptom(selectedVehicle, symptomQuery);
      setDiagnosisResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const runHealthAnalysis = async () => {
    if (!selectedVehicle) return;
    setIsAnalyzingHealth(true);
    try {
      const result = await geminiService.analyzeVehicleHealth(selectedVehicle);
      const updatedVehicles = data.vehicles.map(v => 
        v.id === selectedVehicle.id ? { ...v, healthScore: result.score, healthAnalysis: result.analysis } : v
      );
      handleSave({ ...data, vehicles: updatedVehicles });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzingHealth(false);
    }
  };

  const handleMarketAnalysis = async () => {
    if (!selectedVehicle) return;
    setIsAnalyzingMarket(true);
    try {
      const fipe = await geminiService.fetchFipeValue(selectedVehicle.name, selectedVehicle.model, selectedVehicle.year);
      const analysis = await geminiService.resaleValueAnalysis(selectedVehicle, fipe);
      setMarketAnalysis(analysis);
    } catch (error) {
       console.error(error);
    } finally {
      setIsAnalyzingMarket(false);
    }
  };

  const handleTCOAnalysis = async () => {
    if (!selectedVehicle) return;
    setIsAnalyzingTco(true);
    try {
      const fuel = getFuelAnalytics(selectedVehicle);
      const totalFuel = fuel.totalCost;
      const totalServices = selectedVehicle.services?.reduce((acc, s) => acc + s.cost, 0) || 0;
      const analysis = await geminiService.analyzeTCO(selectedVehicle, totalFuel, totalServices);
      setTcoAnalysis(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzingTco(false);
    }
  };

  const handleGeneratePassport = async () => {
    if (!selectedVehicle) return;
    setIsGeneratingPassport(true);
    try {
      const passport = await geminiService.generateDigitalPassport(selectedVehicle);
      setDigitalPassport(passport);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingPassport(false);
    }
  };

  const predictCurrentMileage = (vehicle: Vehicle) => {
    const lastRecord = [...(vehicle.fuelLogs || []), ...(vehicle.services || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const baseMileage = lastRecord ? lastRecord.mileage : vehicle.mileage;
    const baseDate = lastRecord ? new Date(lastRecord.date) : new Date(vehicle.createdAt || new Date());

    const dailyKm = vehicle.avgDailyKm || 0;
    const usageDays = vehicle.usageDays || [1, 2, 3, 4, 5];
    
    let realAvgKmPerUsageDay = 0;
    if (vehicle.fuelLogs && vehicle.fuelLogs.length >= 2) {
      const sortedLogs = [...vehicle.fuelLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstLog = sortedLogs[0];
      const lastLog = sortedLogs[sortedLogs.length - 1];
      
      let totalUsageDaysInRange = 0;
      let curr = new Date(firstLog.date);
      while(curr <= new Date(lastLog.date)) {
        if (usageDays.includes(curr.getDay())) totalUsageDaysInRange++;
        curr.setDate(curr.getDate() + 1);
      }

      const kmDiff = lastLog.mileage - firstLog.mileage;
      if (totalUsageDaysInRange > 0 && kmDiff > 0) {
        realAvgKmPerUsageDay = kmDiff / totalUsageDaysInRange;
      }
    }

    const effectiveKmPerDay = realAvgKmPerUsageDay || dailyKm;
    if (effectiveKmPerDay <= 0) return vehicle.mileage;

    let activeDaysSinceLastRecord = 0;
    let scanDate = new Date(baseDate);
    const now = new Date();
    
    while(scanDate < now) {
      scanDate.setDate(scanDate.getDate() + 1);
      if (usageDays.includes(scanDate.getDay())) activeDaysSinceLastRecord++;
    }
    
    const projectedIncrement = Math.round(effectiveKmPerDay * activeDaysSinceLastRecord);
    return Math.max(vehicle.mileage, baseMileage + projectedIncrement);
  };

  return {
    maintenancePredictions,
    isLoadingPredictions,
    fuelInsight,
    marketAnalysis,
    isAnalyzingMarket,
    tcoAnalysis,
    isAnalyzingTco,
    digitalPassport,
    isGeneratingPassport,
    diagnosisResult,
    isDiagnosing,
    isAnalyzingHealth,
    symptomQuery,
    setSymptomQuery,
    setMarketAnalysis,
    setDiagnosisResult,
    setTcoAnalysis,
    setDigitalPassport,
    handleManualRefresh,
    handleDiagnose,
    runHealthAnalysis,
    handleMarketAnalysis,
    handleTCOAnalysis,
    handleGeneratePassport,
    predictCurrentMileage,
    getFuelAnalytics
  };
}
