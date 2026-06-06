import { AppData } from '../types';

const STORAGE_KEY = 'automaster_ai_data';

export const storageService = {
  loadData: (): AppData => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return {
          vehicles: Array.isArray(data?.vehicles) ? data.vehicles : [],
          settings: data?.settings || {}
        } as AppData;
      } catch (e) {
        console.error('Failed to parse storage data', e);
      }
    }
    return { vehicles: [], settings: {} as any };
  },

  saveData: (data: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  exportData: () => {
    const data = storageService.loadData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automaster_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData: (file: File): Promise<AppData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          // Validação básica de backup (deve ter o array de veículos)
          if (!data || !Array.isArray(data.vehicles)) {
            throw new Error('Formato de backup inválido. Use um arquivo de backup completo.');
          }
          
          storageService.saveData(data);
          resolve(data);
        } catch (err) {
          reject(new Error('Invalid backup file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
  
  clearData: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
