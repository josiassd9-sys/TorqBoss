// The file was empty
export type ID = string;

export interface Part {
	id: ID;
	name: string;
	price: number;
  isInBudget?: boolean;
  estimatedPrice?: number;
  code?: string;
}

export interface ServicePart extends Part {
  quantity: number;
  unitPrice: number;
  observation?: string;
}

export interface ServiceEntry {
  id: ID;
  date: string;
  description?: string;
  parts?: ServicePart[];
  workshopName?: string;
  workshopAddress?: string;
  mileage: number;
  partsList: ServicePart[];
  cost: number;
}

export interface FuelLog {
  id: ID;
  date: string;
  liters: number;
  price?: number;
  cost: number;
  mileage: number;
  fullTank?: boolean;
}

export interface VehicleSearchLink {
  id: ID;
  label?: string;
  url?: string;
  color?: string;
  name?: string;
}

export interface Vehicle {
  id: ID;
  make?: string;
  model?: string;
  year?: number | string;
  name: string;
  plate?: string;
  imageUrl?: string;
  brandLogoUrl?: string;
  mileage: number;
  fuelLogs: FuelLog[];
  services: ServiceEntry[];
  parts: Part[];
  fipeValue?: number;
  version?: string;
  engine?: string;
  healthScore?: number;
  drivingStyle?: 'smooth' | 'aggressive' | 'balanced' | string;
  manual?: {
    technicalNotes?: Record<string, string>;
    technicalSections?: Record<string, any>;
    maintenanceSchedule?: any[];
  };
  manualTranscription?: string;
  healthAnalysis?: string;
  chassis?: string;
  usageProfile?: 'urban' | 'highway' | 'mixed' | string;
  avgDailyKm?: number;
  tireSets?: any[];
  reminders?: any[];
  createdAt?: string;
  fuelType?: string;
  color?: string;
  usageDays?: number[];
  operatingRpm?: number | string;
}

export interface AppData {
  vehicles?: Vehicle[];
  updatedAt?: string;
  settings?: {
    appName?: string;
    appSubtitle?: string;
    headerConfig?: {
      bannerHeight?: number;
      bgColor?: string;
      bgImage?: string;
      bgOpacity?: number;
      bgBlur?: number;
      showIcon?: boolean;
      iconScale?: number;
    };
    region?: string;
    currency?: string;
    marketReferenceName?: string;
    distanceUnit?: string;
    agencyName?: string;
    language?: string;
    vehicleIdentifierLabel?: string;
    vehicleIdentifierPlaceholder?: string;
    isDeveloperOverridePro?: boolean;
    theme?: string;
    searchLinks?: VehicleSearchLink[];
    customThemeColors?: Record<string, string>;
    isProMember?: boolean;
    geminiApiKey?: string;
  };
}

export type UserID = string;

