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
  storedPallets?: number;
}

export interface PalletItem {
  id: string;
  type: string;
  color: string;
  value: number;
}

import { Goods } from './empire';

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
  motionTime?: number;
  queueSlot?: number;
  direction?: 'inbound' | 'outbound';
  goods?: Goods;
  truckType?: 'tarpaulin' | 'container' | 'reefer';
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
  taskTime?: number;
  targetTruckId?: string;
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
