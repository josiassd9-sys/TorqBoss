import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface MaintenanceRecommendation {
  partName: string;
  action: string;
  reason: string;
  estimatedCost: number;
  urgency: 'baixa' | 'media' | 'alta';
}

export interface MaintenancePdfParams {
  vehicleName: string;
  vehicleModel: string;
  vehicleYear: string;
  simulationMileage: number;
  recommendations: MaintenanceRecommendation[];
  totalEstimatedCost: number;
}

export async function generateMaintenancePdf({
  vehicleName,
  vehicleModel,
  vehicleYear,
  simulationMileage,
  recommendations,
  totalEstimatedCost,
}: MaintenancePdfParams): Promise<'web'> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const now = new Date();
  const dataFormatada = now.toLocaleDateString('pt-BR');
  const horaFormatada = now.toLocaleTimeString('pt-BR');

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PLANO DE MANUTENÇÃO PREVENTIVA', 105, 25, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Simulação por Quilometragem', 105, 35, { align: 'center' });

  // Vehicle Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informações do Veículo:', 20, 50);

  doc.setFont('helvetica', 'normal');
  doc.text(`Veículo: ${vehicleName} ${vehicleModel} ${vehicleYear}`, 20, 60);
  doc.text(`Quilometragem Simulada: ${simulationMileage.toLocaleString()} km`, 20, 70);
  doc.text(`Data da Simulação: ${dataFormatada} ${horaFormatada}`, 20, 80);

  // Recommendations Table
  const tableData = recommendations.map((rec, index) => [
    (index + 1).toString(),
    rec.partName,
    rec.action,
    rec.reason,
    `R$ ${rec.estimatedCost.toLocaleString()}`,
    rec.urgency.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: 90,
    head: [['#', 'Peça/Serviço', 'Ação', 'Motivo', 'Custo Estimado', 'Urgência']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 50 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 },
    },
  });

  // Total Cost
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `TOTAL ESTIMADO: R$ ${totalEstimatedCost.toLocaleString()}`,
    190,
    finalY,
    { align: 'right' }
  );

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    '* Valores estimados baseados no mercado brasileiro. Consulte um profissional para orçamento preciso.',
    20,
    280
  );

  // File name
  const timestamp = now.toISOString().slice(0, 16).replace(/[-:]/g, '');
  const fileName = `plano_manutencao_${vehicleName}_${simulationMileage}km_${timestamp}.pdf`;

  // 🌐 WEB ONLY (fallback seguro)
  doc.save(fileName);

  return 'web';
}