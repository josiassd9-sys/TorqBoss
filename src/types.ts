export interface Part {
  id: string;
  name: string;
  code?: string;
  category: string;
  description: string;
  lifespan?: string;
  status: 'ok' | 'warning' | 'critical';
  installDate?: string;
  installedAtDate?: string;
  installedAtMileage?: number;
  expectedLifeMileage?: number;
  maintenanceInterval?: string; // e.g., "100.000 km"
  technicalSpecs?: { [key: string]: string };
  estimatedPrice?: number;
  priceType?: 'unidade' | 'jogo' | 'kit' | 'litro';
  unitsPerSet?: number;
  isInBudget?: boolean;
  brand?: string;
  photoUrl?: string;
  fipeValue?: number;
  lastFipeUpdate?: string;
}

export interface ServicePart {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  observation?: string;
}

export interface ServiceEntry {
  id: string;
  date: string;
  createdAt: string; // Timestamp automático do registro
  description: string;
  mileage: number;
  cost: number; // Total do serviço
  laborCost: number;
  partsList: ServicePart[];
  workshopName: string; // Torna-se obrigatório para um histórico profissional
  workshopAddress?: string;
  workshopPhone?: string;
  photos?: string[];
  checkInPhotos?: string[]; // Fotos de entrada (odômetro, lataria)
  mechanicName?: string;
  notes?: string;
  provider?: string;
  items?: string[];
}

export interface FuelLog {
  id: string;
  date: string;
  createdAt: string;
  mileage: number;
  liters: number;
  cost: number;
  fullTank: boolean;
}

export interface Reminder {
  id: string;
  createdAt: string;
  title: string;
  description?: string;
  targetMileage?: number;
  targetDate?: string;
  isCompleted: boolean;
  type: 'oil' | 'filter' | 'tire' | 'brake' | 'other';
}

export interface TireSet {
  id: string;
  brand: string;
  model: string;
  size?: string;
  installationDate: string;
  installationMileage: number;
  expectedLifeMileage: number;
  notes?: string;
  position: 'all' | 'front' | 'rear' | 'front-left' | 'front-right' | 'rear-left' | 'rear-right' | 'spare';
  status: 'ok' | 'warning' | 'critical';
  aiInsights?: {
    characteristics: string[];
    benefits: string[];
    dangers: string[];
    estimatedDurability: string;
    score: number;
  };
}

export interface Vehicle {
  id: string;
  createdAt: string; // Data da criação do primeiro registro do veículo
  name: string; // e.g., "Fiat Strada"
  model: string; // e.g., "Adventure CD"
  year: string; // e.g., "2014/15"
  plate?: string;
  color?: string;
  engine?: string;
  version?: string;
  fuelType?: string;
  chassis?: string;
  healthScore?: number;
  healthAnalysis?: string;
  mileage: number;
  isMileageVerified?: boolean; // Se foi capturado via OCR
  imageUrl?: string;
  brandLogoUrl?: string;
  parts: Part[];
  services: ServiceEntry[];
  fuelLogs: FuelLog[];
  reminders: Reminder[];
  tireSets?: TireSet[];
  usageProfile?: 'urban' | 'highway' | 'mixed';
  avgDailyKm?: number;
  drivingStyle?: 'smooth' | 'moderate' | 'aggressive';
  usageDays?: number[]; // [0-6] representando dias da semana
  operatingRpm?: 'low' | 'mid' | 'high';
  manualTranscription?: string;
  maintenanceScore?: number; // Pontuação de 0-100 baseada no histórico
  fipeValue?: number;
  lastFipeUpdate?: string;
  manual?: VehicleManual;
  totalSpent?: number; // Custo total acumulado
  diagnosticHistory?: { date: string, symptom: string, diagnosis: string }[];
}

export interface MaintenanceScheduleEntry {
  mileage: number;
  items: string[];
  description: string;
}

export interface VehicleManual {
  uploadedAt: string;
  fileName: string;
  maintenanceSchedule: MaintenanceScheduleEntry[];
  technicalSections: {
    tirePressure?: string;
    oilSpecification?: string;
    batteryInfo?: string;
    filterInfo?: string;
    fluidsCapacities?: string;
    fuses?: string;
    dashboardSymbols?: string;
    [key: string]: string | undefined;
  };
  fullText: string;
  technicalNotes?: { [marker: string]: string };
  rawSections: {
    [sectionName: string]: string;
  };
}

export interface VehicleSearchLink {
  id: string;
  name: string;
  url: string;
  color: string;
}

export interface CountryConfig {
  id: string;
  name: string;
  flag: string;
  plateFormat: RegExp;
  platePlaceholder: string;
  searchPortalUrl: string;
  technicalTerms: {
    brand: string[];
    model: string[];
    year: string[];
    color: string[];
    engine: string[];
  };
}

export type Country = CountryConfig;

export interface AppData {
  vehicles: Vehicle[];
  settings?: {
    geminiApiKey?: string;
    plateApiKey?: string;
    apiBrasilDeviceToken?: string;
    plateApiHost?: string;
    appName?: string;
    appSubtitle?: string;
    agencyName?: string;
    vehicleIdentifierLabel?: string; // Default: 'Placa'
    vehicleIdentifierPlaceholder?: string; // Default: 'AAA-0000'
    theme?: 'default' | 'blue' | 'green' | 'dark' | 'orange' | 'slate' | 'indigo' | 'teal' | 'royal' | 'bordeaux' | 'noir' | 'silver' | 'espresso' | 'forest' | 'nordic' | 'berry' | 'graphite' | 'oceanic' | 'sage' | 'gold' | 'steel' | 'custom';
    customThemeColors?: {
      primary: string;
      accent: string;
      bg: string;
      cardBg: string;
      textPrimary: string;
      textSecondary: string;
      buttonBg: string;
      buttonText: string;
      vehicleHeaderBg?: string;
      subCardBg?: string;
    };
    headerConfig?: {
      iconScale: number;
      bannerHeight: number;
      bgColor?: string;
      bgImage?: string;
      bgOpacity: number;
      bgBlur: number;
      showIcon: boolean;
    };
    appIcon?: string;
    searchLinks?: VehicleSearchLink[];
    language: 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'it-IT' | 'de-DE' | 'ru-RU' | 'zh-CN' | 'ko-KR';
    currency: 'BRL' | 'USD' | 'EUR';
    distanceUnit: 'km' | 'mi';
    fuelUnit: 'L' | 'gal';
    region: string;
    countryId?: string;
    marketReferenceName?: string;
    showInternalBrowser?: boolean;
    aiCredits?: number;
    isProMember?: boolean;
    isDeveloperOverridePro?: boolean;
    transactionHistory?: { id: string; date: string; amount: number; description: string; type: 'credit' | 'debit' }[];
  };
}
