export interface Theme {
  id: string;
  name: string;
  primary?: string;
  accent?: string;
  bg?: string;
}

export const AUTO_DICTIONARY = [
  { id: 'engine', name: 'Motor', parts: [{ name: 'Filtro de óleo', lifecycle: 10000 }, { name: 'Bomba de água', lifecycle: 120000 }] },
  { id: 'brakes', name: 'Freios', parts: [{ name: 'Pastilha', lifecycle: 30000 }, { name: 'Disco', lifecycle: 80000 }] }
];

export const THEMES: Theme[] = [
  { id: 'default', name: 'Default', primary: '#1f2937', accent: '#E11D48', bg: '#F8F9FA' },
  { id: 'brand', name: 'Brand', primary: '#0ea5a4', accent: '#06b6d4', bg: '#ffffff' }
];
