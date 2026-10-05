import { create } from 'zustand';
import { DockBay, Truck, Forklift, Carrier, HubLocation } from '../types/game';
import { ARRIVAL_SECONDS, DOCK_SECONDS, DEPARTURE_SECONDS, PALLET_SECONDS } from '../utils/motion';
import { useEmpireStore, totalStock, GOODS } from './useEmpireStore';
import { Goods } from '../types/empire';

export const HUBS: HubLocation[] = [
  {
    id: 'WH-01',
    code: 'WH-01',
    name: 'Kho Bình Dương',
    location: 'Khu công nghiệp Bình Dương',
    description: 'Kho khởi nghiệp và xưởng đóng gói nông sản.',
    meta: 'Trụ sở chính',
    totalBays: 2,
    multiplier: 1.0,
  },
  {
    id: 'WH-04',
    code: 'WH-04',
    name: 'Cảng Hải Phòng',
    location: 'Trung tâm logistics Hải Phòng',
    description: 'Chi nhánh xuất khẩu và linh kiện điện tử.',
    meta: 'Mạng lưới phía Bắc',
    totalBays: 4,
    multiplier: 1.25,
  },
  {
    id: 'WH-03',
    code: 'WH-03',
    name: 'Trung tâm Cần Thơ',
    location: 'Trung tâm nông sản Cần Thơ',
    description: 'Chi nhánh lúa gạo và phân phối miền Tây.',
    meta: 'Mạng lưới miền Tây',
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
  { id: 'fl-1', name: 'FL-01', status: 'idle', speed: 4.5, capacity: 1, carryingPallet: false, x: -9.35, z: -10 },
  { id: 'fl-2', name: 'FL-02', status: 'idle', speed: 4.5, capacity: 1, carryingPallet: false, x: -1.35, z: -10 },
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
  docks: INITIAL_DOCKS.map((dock, index) => index === 0
    ? { ...dock, status: 'unloading' as const, currentTruckId: 'trk-init-1' }
    : { ...dock }),
  trucks: [
    {
      id: 'trk-init-1',
      plate: '61C-205.51',
      carrier: 'WareTrack',
      status: 'unloading',
      dockId: 'bay-1',
      palletsTotal: 6,
      palletsUnloaded: 2,
      cargoType: 'Gạo',
      goods: 'rice',
      destination: 'Bình Dương',
      eta: 13,
      valueReward: 1800,
      progress: 2.0,
    },
    {
      id: 'trk-init-2',
      plate: '65C-248.81',
      carrier: 'Cargoviva',
      status: 'en_route',
      dockId: undefined,
      queueSlot: 0,
      palletsTotal: 6,
      palletsUnloaded: 0,
      cargoType: 'Cà phê',
      goods: 'coffee',
      destination: 'Cần Thơ',
      eta: 45,
      valueReward: 2200,
      progress: 0,
    },
  ],
  forklifts: INITIAL_FORKLIFTS,
  totalTrucksCompleted: 12,
  lastSpawnTime: 0,

  resetGame: () => {
    useEmpireStore.getState().resetEmpire();
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
    if (useEmpireStore.getState().unlockedHubs.includes(hubId)) set({ currentHub: hubId });
  },

  spawnTruck: (custom) => {
    if (get().trucks.length >= 8) return;
    const carriers: Carrier[] = ['WareTrack', 'Nordline', 'Cargoviva', 'Bluepeak'];
    const carrier = custom?.carrier || carriers[Math.floor(Math.random() * carriers.length)];
    const plate = custom?.plate || `61C-${Math.floor(100 + Math.random() * 800)}.${Math.floor(10 + Math.random() * 89)}`;

    const goods = custom?.goods ?? (get().currentHub === 'WH-04' ? 'electronics' : get().currentHub === 'WH-03' ? 'rice' : (['rice', 'coffee', 'electronics'] as Goods[])[Math.floor(Math.random() * 3)]);
    const outbound = custom?.direction === 'outbound';
    const dock = outbound ? get().docks.find(d => d.id === custom?.dockId && d.status === 'available') : undefined;
    if (outbound && !dock) return;
    const newTruck: Truck = {
      id: custom?.id || `trk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      plate,
      carrier,
      status: outbound ? 'completed' : 'en_route',
      dockId: dock?.id,
      direction: outbound ? 'outbound' : 'inbound',
      goods,
      motionTime: 0,
      queueSlot: Array.from({ length: 8 }, (_, slot) => slot).find(slot =>
        !get().trucks.some(truck => truck.status === 'en_route' && (truck.queueSlot ?? 0) === slot)) ?? 0,
      palletsTotal: custom?.palletsTotal || 6,
      palletsUnloaded: outbound ? custom?.palletsTotal ?? 6 : 0,
      cargoType: custom?.cargoType ?? GOODS[goods].label,
      destination: custom?.destination || 'Trạm phân phối nội vùng',
      eta: 60,
      valueReward: custom?.valueReward ?? 1500 + Math.floor(Math.random() * 1000),
      progress: 0,
      isVip: custom?.isVip ?? Math.random() > 0.8,
    };

    set((state) => ({ trucks: [...state.trucks, newTruck], ...(dock ? { docks: state.docks.map(d => d.id === dock.id ? { ...d, status: 'loading' as const, currentTruckId: newTruck.id } : d) } : {}) }));
  },

  unloadPallet: (truckId) => {
    set((state) => {
      let earned = 0;
      const nextTrucks = state.trucks.map((t) => {
        if (t.id === truckId && t.palletsUnloaded < t.palletsTotal) {
          const nextCount = t.palletsUnloaded + 1;
          earned = 300;
          useEmpireStore.getState().receiveCargo(t.goods ?? 'rice', 1);
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
      storageCount: totalStock(useEmpireStore.getState().inventory),
      };
    });
  },

  upgradeDock: (dockId) => {
    const state = get();
    const dock = state.docks.find((d) => d.id === dockId);
    if (!dock || dock.level >= 3) return false;

    const cost = dock.status === 'locked' ? 15000 : 8000 * dock.level;
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
      z: -10,
    };

    set({
      cash: state.cash - cost,
      forklifts: [...state.forklifts, newForklift],
    });
    return true;
  },

  prioritizeTruck: (truckId) => {
    const state = get();
    const truck = state.trucks.find(item => item.id === truckId);
    if (!truck || truck.isVip || truck.status === 'completed' || state.cash < 500) return;
    set({ cash: state.cash - 500, trucks: state.trucks.map(item => item.id === truckId ? { ...item, isVip: true } : item) });
  },

  tickSimulation: (delta) => {
    const { gameSpeed } = get();
    if (gameSpeed === 0) return;
    const effectiveDelta = Math.min(delta, 0.25) * gameSpeed;
    useEmpireStore.getState().tickEmpire(effectiveDelta);

    set((state) => {
      let nextTrucks = state.trucks.map((truck) => ({ ...truck }));
      let nextDocks = state.docks.map((dock) => ({ ...dock }));
      const nextForklifts = state.forklifts.map((forklift) => ({ ...forklift }));
      let lastSpawnTime = state.lastSpawnTime;
      let nextCash = state.cash;
      let nextStorage = state.storageCount;
      let nextCompleted = state.totalTrucksCompleted;
      let nextReputation = state.reputation;

      // 1. Tự động spawn xe mới nếu ít hơn 3 xe
      const now = Date.now();
      if (nextTrucks.length < 3 && now - state.lastSpawnTime > 8000 / gameSpeed) {
        const carriers: Carrier[] = ['WareTrack', 'Nordline', 'Cargoviva', 'Bluepeak'];
        const plate = `61C-${Math.floor(100 + Math.random() * 800)}.${Math.floor(10 + Math.random() * 89)}`;
        const goods = state.currentHub === 'WH-04' ? 'electronics' : state.currentHub === 'WH-03' ? 'rice' : (['rice', 'coffee', 'electronics'] as Goods[])[nextCompleted % 3];
        nextTrucks.push({
          id: `trk-${now}`,
          plate,
          carrier: carriers[Math.floor(Math.random() * carriers.length)],
          status: 'en_route',
          queueSlot: Array.from({ length: 8 }, (_, slot) => slot).find(slot =>
            !nextTrucks.some(truck => truck.status === 'en_route' && (truck.queueSlot ?? 0) === slot)) ?? 0,
          palletsTotal: 6,
          palletsUnloaded: 0,
          cargoType: GOODS[goods].label,
          goods,
          destination: 'Trạm trung chuyển',
          eta: 40,
          valueReward: 1600,
          progress: 0,
          isVip: Math.random() > 0.75,
        });
        lastSpawnTime = now;
      }

      // 2. Chỉ một xe được vào làn dốc bến tại một thời điểm; các xe còn lại xếp hàng chờ.
      const laneBusy = nextTrucks.some((item) => item.status === 'docking' || item.status === 'completed');
      if (!laneBusy) {
        const waiting = nextTrucks
          .filter((item) => item.status === 'en_route' && !item.dockId)
          .sort((a, b) => (a.queueSlot ?? 0) - (b.queueSlot ?? 0));
        const truck = waiting[0];
        const freeDock = nextDocks.find((d) => d.status === 'available');
        if (truck && freeDock) {
          truck.dockId = freeDock.id;
          truck.status = 'docking';
          truck.motionTime = 0;
          freeDock.status = 'loading';
          freeDock.currentTruckId = truck.id;
        }
      }

      // Only a finished forklift deposit transfers stock and awards pallet revenue.
      const drivers = useEmpireStore.getState().employees.filter(employee => employee.role === 'driver');
      for (const [index, forklift] of nextForklifts.entries()) {
        if (index >= drivers.length) { forklift.status = 'idle'; forklift.carryingPallet = false; continue; }
        let truck = nextTrucks.find((item) => item.id === forklift.targetTruckId && item.status === 'unloading');
        if (!truck) {
          truck = nextTrucks.find((item) => item.status === 'unloading' &&
            !nextForklifts.some((worker) => worker.id !== forklift.id && worker.targetTruckId === item.id));
          forklift.targetTruckId = truck?.id;
          forklift.targetDockId = truck?.dockId;
          forklift.taskTime = 0;
        }
        if (!truck || nextStorage >= state.storageMax) {
          forklift.status = 'idle';
          forklift.carryingPallet = false;
          continue;
        }
        const dock = nextDocks.find((item) => item.id === truck.dockId);
        const rate = (dock?.hasLeveller ? 1.25 : 1) * (1 + Math.max(0, (dock?.level ?? 1) - 1) * .15) * (truck.isVip ? 1.2 : 1) * (forklift.speed / 4.5) * (1 + (drivers[index].level - 1) * .15) * (.5 + drivers[index].energy / 200);
        forklift.taskTime = (forklift.taskTime ?? 0) + effectiveDelta * rate;
        forklift.status = forklift.taskTime < 3 ? 'moving_to_truck' : forklift.taskTime < 4 ? 'picking'
          : forklift.taskTime < 7 ? 'carrying' : 'depositing';
        forklift.carryingPallet = forklift.taskTime >= 3 && forklift.taskTime < PALLET_SECONDS;
        if (forklift.taskTime >= PALLET_SECONDS) {
          forklift.taskTime -= PALLET_SECONDS;
          truck.palletsUnloaded += 1;
          truck.progress = truck.palletsUnloaded;
          nextCash += 280;
          nextStorage += 1;
          useEmpireStore.getState().receiveCargo(truck.goods ?? 'rice', 1);
          if (dock) dock.storedPallets = (dock.storedPallets ?? 0) + 1;
          if (truck.palletsUnloaded >= truck.palletsTotal) {
            truck.status = 'completed';
            truck.motionTime = 0;
            nextCash += truck.valueReward;
            nextCompleted += 1;
            nextReputation = Math.min(100, nextReputation + 0.2);
            forklift.targetTruckId = undefined;
            forklift.targetDockId = undefined;
            forklift.status = 'idle';
            forklift.carryingPallet = false;
          }
        }
      }

      nextTrucks = nextTrucks
        .map((truck) => {
          if (truck.status === 'completed') {
            // Wait for the truck entering the lane to clear it before pulling out.
            if (nextTrucks.some(item => item.status === 'docking')) return truck;
            truck.motionTime = (truck.motionTime ?? 0) + effectiveDelta;
            if (truck.motionTime >= DEPARTURE_SECONDS) {
              const dock = nextDocks.find((item) => item.id === truck.dockId);
              if (dock) { dock.status = 'available'; dock.currentTruckId = undefined; }
              truck.status = 'departed';
            }
            return truck;
          }
          if (truck.status === 'docking') {
            truck.motionTime = (truck.motionTime ?? 0) + effectiveDelta;
            if (truck.motionTime >= ARRIVAL_SECONDS + DOCK_SECONDS) {
              truck.status = 'unloading';
              const dock = nextDocks.find((item) => item.id === truck.dockId);
              if (dock) dock.status = 'unloading';
            }
          }
          return truck;
        })
        .filter((truck) => truck.status !== 'departed');

      return {
        trucks: nextTrucks,
        forklifts: nextForklifts,
        docks: nextDocks.every((dock, index) =>
          dock.status === state.docks[index].status &&
          dock.storedPallets === state.docks[index].storedPallets &&
          dock.currentTruckId === state.docks[index].currentTruckId)
          ? state.docks : nextDocks,
        cash: nextCash,
        storageCount: totalStock(useEmpireStore.getState().inventory),
        totalTrucksCompleted: nextCompleted,
        reputation: nextReputation,
        lastSpawnTime,
      };
    });
  },
}));
