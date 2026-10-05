export type DockStatus = 'available' | 'loading' | 'unloading' | 'locked';
export type TruckStatus = 'en_route' | 'docking' | 'unloading' | 'completed' | 'departed';
export type Carrier = 'WareTrack' | 'Nordline' | 'Cargoviva' | 'Bluepeak';

export interface DockBay {
  id: string;
  number: number;
  status: DockStatus;
  currentTruckId?: string;
  hasLeveller: boolean;
  level: number;
}

export interface PalletItem {
  id: string;
  type: string;
  color: string;
  value: number;
}

export interface Truck {
  id: string;
  plate: string;
  carrier: Carrier;
  status: TruckStatus;
  dockId?: string;
  palletsTotal: number;
  palletsUnloaded: number;
  cargoType: string;
  destination: string;
  eta: number; // in seconds
  valueReward: number;
  progress: number;
  isVip?: boolean;
}

export interface Forklift {
  id: string;
  name: string;
  status: 'idle' | 'moving_to_truck' | 'picking' | 'carrying' | 'depositing';
  speed: number;
  capacity: number;
  targetDockId?: string;
  carryingPallet: boolean;
  x: number;
  z: number;
}

export interface HubLocation {
  id: string;
  code: string;
  name: string;
  location: string;
  description: string;
  meta: string;
  totalBays: number;
  multiplier: number;
}
