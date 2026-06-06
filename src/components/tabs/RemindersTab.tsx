
import React from 'react';
import { motion } from 'motion/react';
import { Activity, CheckCircle2, Gauge, Trash2 } from 'lucide-react';
import { Reminder } from '../../types';

interface RemindersTabProps {
  reminders: Reminder[];
  onAddReminder: () => void;
  onDeleteItem: (id: string) => void;
  onToggleReminder: (id: string) => void;
}

export const RemindersTab: React.FC<RemindersTabProps> = ({
  reminders,
  onAddReminder,
  onDeleteItem,
  onToggleReminder
}) => {
  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary flex items-center gap-2">
            <Activity size={24} className="text-brand-accent" /> Lembretes & Alertas
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sentinela de prazos e manutenções preventivas</p>
        </div>
        <button 
          onClick={onAddReminder}
          className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20"
        >
          + Novo Lembrete
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(!reminders || reminders.length === 0) ? (
          <div className="col-span-full text-center py-24 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
            <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Activity size={40} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum alerta ativo.</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <motion.div 
              key={reminder.id} 
              layout
              className={`p-6 rounded-3xl border transition-all flex items-start gap-4 relative overflow-hidden group ${reminder.isCompleted ? 'bg-gray-50/50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-brand-primary/30 shadow-sm'}`}
            >
              <button 
                onClick={() => onToggleReminder(reminder.id)}
                className={`mt-1 p-1.5 rounded-xl border-2 transition-all shrink-0 ${reminder.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-100 text-transparent hover:border-brand-primary hover:text-brand-primary/20'}`}
              >
                <CheckCircle2 size={16} />
              </button>
              
              <div className="flex-1">
                <h4 className={`text-base font-black tracking-tight mb-2 uppercase leading-none ${reminder.isCompleted ? 'line-through text-gray-400' : 'text-brand-primary'}`}>
                  {reminder.title}
                </h4>
                <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {reminder.targetMileage && (
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                      <Gauge size={12} className="text-brand-accent" /> {reminder.targetMileage.toLocaleString()} km
                    </span>
                  )}
                  {reminder.targetDate && (
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                      <Activity size={12} className="text-brand-accent" /> {new Date(reminder.targetDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  <span className="ml-auto bg-brand-primary/5 text-brand-primary px-2 py-1 rounded-lg text-[8px] border border-brand-primary/10">{reminder.type}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                 <button 
                    onClick={() => onDeleteItem(reminder.id)}
                    className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
              </div>
              
              {reminder.isCompleted && (
                <div className="absolute -right-4 -bottom-4 text-green-500/5 rotate-12">
                   <CheckCircle2 size={100} />
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
