import { create } from 'zustand';
import { DockBay, Truck, Forklift, Carrier, HubLocation } from '../types/game';

export const HUBS: HubLocation[] = [
  {
    id: 'WH-01',
    code: 'WH-01',
    name: 'Riverside Hub',
    location: '12 Riverside Dr, Newark NJ',
    description: 'Standard Distribution Center with ambient storage.',
    meta: '78% full · 1/2 docked',
    totalBays: 2,
    multiplier: 1.0,
  },
  {
    id: 'WH-04',
    code: 'WH-04',
    name: 'Southfield Cross-Dock',
    location: '88 Logistics Parkway, Detroit MI',
    description: 'High velocity transshipment & sorting facility.',
    meta: '38% full · 2/6 docked',
    totalBays: 4,
    multiplier: 1.25,
  },
  {
    id: 'WH-03',
    code: 'WH-03',
    name: 'Eastport Cold Chain',
    location: '7 Harbor Way, Elizabeth NJ',
    description: 'Specialized deep freeze & perishable cargo storage.',
    meta: '71% full · 2/3 docked',
    totalBays: 3,
    multiplier: 1.5,
  },
];

interface GameState {
  cash: number;
  reputation: number; // 0 - 100%
  storageCount: number;
  storageMax: number;
  gameSpeed: number; // 0: pause, 1: 1x, 2: 2x
  selectedEntityId: string | null;
  selectedEntityType: 'truck' | 'dock' | 'forklift' | null;
  currentHub: string;
  docks: DockBay[];
  trucks: Truck[];
  forklifts: Forklift[];
  totalTrucksCompleted: number;
  lastSpawnTime: number;

  // Actions
  resetGame: () => void;
  selectEntity: (id: string | null, type: 'truck' | 'dock' | 'forklift' | null) => void;
  setGameSpeed: (speed: number) => void;
  setHub: (hubId: string) => void;
  spawnTruck: (custom?: Partial<Truck>) => void;
  unloadPallet: (truckId: string) => void;
  upgradeDock: (dockId: string) => boolean;
  buyForklift: () => boolean;
  prioritizeTruck: (truckId: string) => void;
  tickSimulation: (delta: number) => void;
}

const INITIAL_DOCKS: DockBay[] = [
  { id: 'bay-1', number: 1, status: 'available', hasLeveller: true, level: 1 },
  { id: 'bay-2', number: 2, status: 'available', hasLeveller: false, level: 1 },
  { id: 'bay-3', number: 3, status: 'locked', hasLeveller: false, level: 0 },
  { id: 'bay-4', number: 4, status: 'locked', hasLeveller: false, level: 0 },
];

const INITIAL_FORKLIFTS: Forklift[] = [
  { id: 'fl-1', name: 'FL-01', status: 'idle', speed: 4.5, capacity: 1, carryingPallet: false, x: -2, z: 2 },
  { id: 'fl-2', name: 'FL-02', status: 'idle', speed: 4.5, capacity: 1, carryingPallet: false, x: 2, z: 2 },
];

export const useGameStore = create<GameState>((set, get) => ({
  cash: 45000,
  reputation: 96.6,
  storageCount: 610,
  storageMax: 1800,
  gameSpeed: 1,
  selectedEntityId: null,
  selectedEntityType: null,
  currentHub: 'WH-01',
  docks: INITIAL_DOCKS,
  trucks: [
    {
      id: 'trk-init-1',
      plate: 'TRK-2051',
      carrier: 'WareTrack',
      status: 'unloading',
      dockId: 'bay-1',
      palletsTotal: 6,
      palletsUnloaded: 2,
      cargoType: 'Cardboard Box (M)',
      destination: 'Philadelphia, PA',
      eta: 13,
      valueReward: 1800,
      progress: 2.0,
    },
    {
      id: 'trk-init-2',
      plate: 'TRK-2481',
      carrier: 'Cargoviva',
      status: 'en_route',
      dockId: undefined,
      palletsTotal: 6,
      palletsUnloaded: 0,
      cargoType: 'Plastic Container',
      destination: 'Southfield Cross-Dock',
      eta: 45,
      valueReward: 2200,
      progress: 0,
    },
  ],
  forklifts: INITIAL_FORKLIFTS,
  totalTrucksCompleted: 12,
  lastSpawnTime: 0,

  resetGame: () => {
    set({
      cash: 45000,
      reputation: 96.6,
      storageCount: 610,
      storageMax: 1800,
      gameSpeed: 1,
      selectedEntityId: null,
      selectedEntityType: null,
      currentHub: 'WH-01',
      docks: INITIAL_DOCKS.map((d) => ({ ...d })),
      trucks: [],
      forklifts: INITIAL_FORKLIFTS.map((f) => ({ ...f })),
      totalTrucksCompleted: 0,
      lastSpawnTime: 0,
    });
  },

  selectEntity: (id, type) => {
    set({ selectedEntityId: id, selectedEntityType: type });
  },

  setGameSpeed: (speed) => {
    set({ gameSpeed: speed });
  },

  setHub: (hubId) => {
    set({ currentHub: hubId });
  },

  spawnTruck: (custom) => {
    const carriers: Carrier[] = ['WareTrack', 'Nordline', 'Cargoviva', 'Bluepeak'];
    const cargoTypes = [
      'Cardboard Box (M)',
      'Plastic Container',
      'Safety Helmet',
      'Frozen Peas 10 kg',
      'Nitrile Gloves',
    ];
    const carrier = custom?.carrier || carriers[Math.floor(Math.random() * carriers.length)];
    const plate = custom?.plate || `TRK-${Math.floor(2000 + Math.random() * 8000)}`;
    const cargoType = custom?.cargoType || cargoTypes[Math.floor(Math.random() * cargoTypes.length)];

    const newTruck: Truck = {
      id: custom?.id || `trk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      plate,
      carrier,
      status: 'en_route',
      dockId: undefined,
      palletsTotal: custom?.palletsTotal || 6,
      palletsUnloaded: 0,
      cargoType,
      destination: custom?.destination || 'Local Cross-Dock Distribution',
      eta: 60,
      valueReward: custom?.valueReward || 1500 + Math.floor(Math.random() * 1000),
      progress: 0,
      isVip: custom?.isVip || Math.random() > 0.8,
    };

    set((state) => ({ trucks: [...state.trucks, newTruck] }));
  },

  unloadPallet: (truckId) => {
    set((state) => {
      let earned = 0;
      const nextTrucks = state.trucks.map((t) => {
        if (t.id === truckId && t.palletsUnloaded < t.palletsTotal) {
          const nextCount = t.palletsUnloaded + 1;
          earned = 300;
          return {
            ...t,
            palletsUnloaded: nextCount,
            status: nextCount >= t.palletsTotal ? ('completed' as const) : ('unloading' as const),
          };
        }
        return t;
      });

      return {
        trucks: nextTrucks,
        cash: state.cash + earned,
        storageCount: Math.min(state.storageMax, state.storageCount + 1),
      };
    });
  },

  upgradeDock: (dockId) => {
    const state = get();
    const dock = state.docks.find((d) => d.id === dockId);
    if (!dock) return false;

    const cost = dock.status === 'locked' ? 15000 : 8000;
    if (state.cash < cost) return false;

    set({
      cash: state.cash - cost,
      docks: state.docks.map((d) =>
        d.id === dockId
          ? {
              ...d,
              status: d.status === 'locked' ? 'available' : d.status,
              level: d.level + 1,
              hasLeveller: true,
            }
          : d
      ),
    });
    return true;
  },

  buyForklift: () => {
    const state = get();
    const cost = 22000;
    if (state.cash < cost) return false;
    if (state.forklifts.length >= 6) return false;

    const idx = state.forklifts.length + 1;
    const newForklift: Forklift = {
      id: `fl-${idx}`,
      name: `FL-0${idx}`,
      status: 'idle',
      speed: 5.0,
      capacity: 1,
      carryingPallet: false,
      x: -4 + idx * 2,
      z: 2,
    };

    set({
      cash: state.cash - cost,
      forklifts: [...state.forklifts, newForklift],
    });
    return true;
  },

  prioritizeTruck: (truckId) => {
    set((state) => ({
      trucks: state.trucks.map((t) =>
        t.id === truckId ? { ...t, isVip: true, valueReward: t.valueReward + 500 } : t
      ),
    }));
  },

  tickSimulation: (delta) => {
    const { gameSpeed } = get();
    if (gameSpeed === 0) return;
    const effectiveDelta = Math.min(delta, 0.1) * gameSpeed;

    set((state) => {
      let nextTrucks = [...state.trucks];
      let nextDocks = [...state.docks];
      let nextCash = state.cash;
      let nextStorage = state.storageCount;
      let nextCompleted = state.totalTrucksCompleted;
      let nextReputation = state.reputation;

      // 1. Tự động spawn xe mới nếu ít hơn 3 xe
      const now = Date.now();
      if (nextTrucks.length < 3 && now - state.lastSpawnTime > 8000 / gameSpeed) {
        const carriers: Carrier[] = ['WareTrack', 'Nordline', 'Cargoviva', 'Bluepeak'];
        const plate = `TRK-${Math.floor(2000 + Math.random() * 8000)}`;
        nextTrucks.push({
          id: `trk-${now}`,
          plate,
          carrier: carriers[Math.floor(Math.random() * carriers.length)],
          status: 'en_route',
          palletsTotal: 6,
          palletsUnloaded: 0,
          cargoType: 'Cardboard Box (M)',
          destination: 'Cross-Dock Facility',
          eta: 40,
          valueReward: 1600,
          progress: 0,
          isVip: Math.random() > 0.75,
        });
        state.lastSpawnTime = now;
      }

      // 2. Gán xe en_route vào dock trống
      for (let truck of nextTrucks) {
        if (truck.status === 'en_route' && !truck.dockId) {
          const freeDock = nextDocks.find((d) => d.status === 'available');
          if (freeDock) {
            truck.dockId = freeDock.id;
            truck.status = 'docking';
            freeDock.status = 'unloading';
            freeDock.currentTruckId = truck.id;
          }
        }
      }

      // 3. Tiến trình dỡ hàng & xe nâng
      nextTrucks = nextTrucks
        .map((truck) => {
          if (truck.status === 'docking') {
            return { ...truck, status: 'unloading' as const };
          }

          if (truck.status === 'unloading') {
            const dock = nextDocks.find((d) => d.id === truck.dockId);
            const speedMultiplier = (dock?.hasLeveller ? 1.4 : 1.0) * (truck.isVip ? 1.3 : 1.0);
            const nextProgress = truck.progress + effectiveDelta * 0.45 * speedMultiplier;
            const newUnloaded = Math.min(truck.palletsTotal, Math.floor(nextProgress));
            const deltaUnloaded = newUnloaded - truck.palletsUnloaded;

            if (deltaUnloaded > 0) {
              nextCash += deltaUnloaded * 280;
              nextStorage = Math.min(state.storageMax, nextStorage + deltaUnloaded);
            }

            if (newUnloaded >= truck.palletsTotal) {
              // Xe dỡ xong
              nextCash += truck.valueReward;
              nextCompleted += 1;
              nextReputation = Math.min(100, nextReputation + 0.2);

              if (dock) {
                dock.status = 'available';
                dock.currentTruckId = undefined;
              }
              return {
                ...truck,
                progress: nextProgress,
                palletsUnloaded: truck.palletsTotal,
                status: 'completed' as const,
              };
            }

            return {
              ...truck,
              progress: nextProgress,
              palletsUnloaded: newUnloaded,
            };
          }

          return truck;
        })
        .filter((t) => t.status !== 'completed' || t.progress < t.palletsTotal + 2); // Xe completed sẽ rời bãi

      return {
        trucks: nextTrucks,
        docks: nextDocks,
        cash: nextCash,
        storageCount: nextStorage,
        totalTrucksCompleted: nextCompleted,
        reputation: nextReputation,
      };
    });
  },
}));
