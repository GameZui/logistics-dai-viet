export type Goods = 'rice' | 'coffee' | 'electronics' | 'fruit' | 'seafood' | 'garments';
export type Grade = 'raw' | 'sorted' | 'finished';
export type Role = 'warehouse' | 'driver' | 'sorter' | 'technician';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonInfo {
  id: Season;
  name: string;
  badge: string;
  themeColor: string;
  multiplier: number;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  role: Role;
  level: number;
  energy: number;
}

export interface CargoStock {
  raw: number;
  sorted: number;
  finished: number;
}

export interface Contract {
  id: string;
  client: string;
  destination: string;
  goods: Goods;
  grade: 'sorted' | 'finished';
  quantity: number;
  reward: number;
  duration: number;
  remaining: number;
  status: 'available' | 'active' | 'shipping' | 'completed' | 'failed';
  truckId?: string;
}

export interface Campaign {
  title: string;
  description: string;
  objective: string;
  reward: number;
  season?: Season;
}
