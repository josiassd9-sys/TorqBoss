import { Vehicle, Part } from '../types';

export const getVehicleHealth = (selectedVehicle: Vehicle | null): number => {
  if (!selectedVehicle) return 100;
  if ((selectedVehicle.parts?.length || 0) === 0) return 100;
  
  const criticalParts = (selectedVehicle.parts || []).filter(p => p.status === 'critical').length;
  const warningParts = (selectedVehicle.parts || []).filter(p => p.status === 'warning').length;
  
  // Penalidades: uma peça crítica remove 30% de saúde, aviso remove 10%
  const health = 100 - (criticalParts * 30 + warningParts * 10);
  return Math.max(Math.min(health, 100), 0);
};

export const getMaintenanceScore = (selectedVehicle: Vehicle | null): number => {
  if (!selectedVehicle) return 0;
  
  let score = 70; // Pontuação base
  
  // Penalidades por saúde baixo
  const health = getVehicleHealth(selectedVehicle);
  if (health < 80) score -= (80 - health) * 0.5;
  
  // Bônus por serviços documentados (pelo menos 3 meses de histórico)
  const servicesCount = selectedVehicle.services?.length || 0;
  score += Math.min(servicesCount * 5, 20); // Máximo 20 pontos de bônus por volume
  
  // Bônus por manuais e documentação técnica
  if (selectedVehicle.manualTranscription) score += 10;
  
  return Math.min(Math.round(score), 100);
};

export const getFuelAnalytics = (selectedVehicle: Vehicle | null) => {
  if (!selectedVehicle || !selectedVehicle.fuelLogs || selectedVehicle.fuelLogs.length < 2) {
    return { data: [], avgKmL: 0, avgCostKm: 0, totalLiters: 0, totalCost: 0, distanceTraveled: 0 };
  }
  
  const logs = [...selectedVehicle.fuelLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const data = [];
  let totalKm = 0;
  let totalLiters = 0;
  let totalCost = 0;

  for (let i = 1; i < logs.length; i++) {
    const dist = logs[i].mileage - logs[i-1].mileage;
    if (dist > 0 && logs[i].liters > 0) {
      const consumption = dist / logs[i].liters;
      data.push({
        date: new Date(logs[i].date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        kmL: Number(consumption.toFixed(2)),
        costL: Number((logs[i].cost / logs[i].liters).toFixed(2))
      });
      totalKm += dist;
      totalLiters += logs[i].liters;
      totalCost += logs[i].cost;
    }
  }

  const avgKmL = totalLiters > 0 ? Number((totalKm / totalLiters).toFixed(2)) : 0;
  const avgCostKm = totalKm > 0 ? Number((totalCost / totalKm).toFixed(2)) : 0;

  return { data, avgKmL, avgCostKm, totalLiters, totalCost, distanceTraveled: totalKm };
};
