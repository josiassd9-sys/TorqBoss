
import React from 'react';
import { motion } from 'motion/react';
import { Car, Activity, Box, Disc, Download, Plus, DollarSign, Gauge, Trash2, Pin } from 'lucide-react';
import { AppData, Vehicle } from '../types';
import { BrandLogo } from './BrandLogo';

interface VehicleImageProps {
  src?: string;
  alt: string;
  className: string;
}

const VehicleImage = ({ src, alt, className }: VehicleImageProps) => {
  const [error, setError] = React.useState(false);
  
  if (!src || error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-gray-400`}>
        <Car size={className.includes('w-16') ? 32 : 120} />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} object-cover`} 
      referrerPolicy="no-referrer" 
      onError={() => setError(true)}
    />
  );
};

interface DashboardHomeProps {
  data: AppData;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: () => void;
  onImportVehicle: () => void;
  onDeleteVehicle: (id: string, e: React.MouseEvent) => void;
  onMoveVehicleToTop: (id: string) => void;
  formatDistance: (val: number) => string;
  formatCurrency: (val: number) => string;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  data,
  onSelectVehicle,
  onAddVehicle,
  onImportVehicle,
  onDeleteVehicle,
  onMoveVehicleToTop,
  formatDistance,
  formatCurrency
}) => {
  const firstVehicle = data.vehicles?.[0];
  const hasUrgentReminder = firstVehicle?.reminders?.some(r => {
    const diff = new Date(r.targetDate).getTime() - new Date().getTime();
    return diff < 1000 * 60 * 60 * 24 * 7;
  });

  return (
    <div className="space-y-4">
      {/* Compact Dashboard Status Ribbon */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-2 pb-2 border-b border-gray-100"
      >
        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
          <Car size={14} className="text-brand-accent" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Frota</span>
          <span className="text-sm font-black text-brand-primary">{data.vehicles?.length || 0}</span>
        </div>

        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
          <Activity size={14} className="text-green-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Saúde</span>
          <span className={`text-sm font-black ${hasUrgentReminder ? 'text-amber-500' : 'text-green-600'}`}>
            {data.vehicles.length > 0 ? (hasUrgentReminder ? 'Atenção' : 'Excelente') : '--'}
          </span>
        </div>
        
        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
          <Box size={14} className="text-brand-accent" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Peças</span>
          <span className="text-sm font-black text-brand-primary">
            {data.vehicles.length > 0 ? (firstVehicle?.parts?.length || 0) : 0}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
          <Disc size={14} className="text-blue-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Pneus</span>
          <span className="text-sm font-black text-blue-600">
            {data.vehicles.length > 0 ? (firstVehicle?.tireSets?.[0]?.brand || 'OK') : '--'}
          </span>
        </div>
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
      >
        {(data.vehicles || []).map((vehicle) => (
          <motion.div
            key={vehicle.id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            onClick={() => onSelectVehicle(vehicle)}
            className="group relative glass-card p-4 cursor-pointer overflow-hidden"
          >
            <div className="flex flex-col items-center">
              <div className="text-center w-full mb-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <BrandLogo 
                    vehicleName={vehicle.name} 
                    brandLogoUrl={vehicle.brandLogoUrl}
                    className="w-10 h-10 rounded shadow-sm"
                  />
                  <h3 className="text-lg font-black text-brand-primary tracking-tight leading-none">{vehicle.name}</h3>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest line-clamp-1">{vehicle.model} • {vehicle.year}</p>
              </div>

              <div className="relative w-full mb-2 group-hover:scale-[1.02] transition-transform duration-500">
                <VehicleImage 
                  src={vehicle.imageUrl} 
                  alt={vehicle.name} 
                  className="aspect-video w-full rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] ring-2 ring-white/50 object-cover" 
                />
              </div>
              
              <div className="text-center w-full">
                <div className="relative flex items-center justify-center gap-4 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <Gauge size={14} className="text-brand-accent" />
                    <span className="text-xs font-mono font-bold text-gray-700">{formatDistance(vehicle.mileage)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Box size={14} className="text-brand-accent" />
                    <span className="text-xs font-mono font-bold text-gray-700">{(vehicle.parts?.length || 0)} itens</span>
                  </div>
                  {vehicle.fipeValue && (
                    <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded text-[10px] font-black text-green-600">
                      <DollarSign size={10} />
                      {formatCurrency(vehicle.fipeValue)}
                    </div>
                  )}
                  <div className="absolute right-0 flex items-center gap-1">
                    {data.vehicles.indexOf(vehicle) !== 0 && (
                      <motion.button
                        whileHover={{ scale: 1.2, color: 'var(--color-brand-accent)' }}
                        onClick={(e) => { e.stopPropagation(); onMoveVehicleToTop(vehicle.id); }}
                        className="p-1 text-gray-300 hover:text-brand-accent transition-colors"
                        title="Colocar como principal"
                      >
                        <Pin size={14} />
                      </motion.button>
                    )}
                    <motion.button 
                      whileHover={{ scale: 1.2, color: '#ef4444' }}
                      onClick={(e) => onDeleteVehicle(vehicle.id, e)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onImportVehicle}
          className="group border-2 border-dashed border-gray-200 rounded p-8 flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-blue-400 hover:text-blue-400 transition-all bg-white/30 backdrop-blur-sm min-h-[320px]"
        >
          <div className="bg-gray-50 p-6 rounded group-hover:bg-blue-50 transition-colors">
            <Download size={48} />
          </div>
          <div className="text-center">
            <span className="text-sm font-black uppercase tracking-widest block">Importar Veículo</span>
            <span className="text-[10px] font-bold opacity-60">Arquivo .json do Cliente</span>
          </div>
        </motion.button>

        <motion.button
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddVehicle}
          className="group border-2 border-dashed border-gray-200 rounded p-8 flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-brand-primary/30 hover:text-brand-primary transition-all bg-white/30 backdrop-blur-sm min-h-[320px]"
          id="add-vehicle-btn"
        >
          <div className="bg-gray-50 p-6 rounded group-hover:bg-brand-primary/10 transition-colors">
            <Plus size={48} />
          </div>
          <span className="font-black text-lg tracking-tight">Novo Veículo</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
