import { create } from 'zustand';
import { useGameStore } from './useGameStore';
import {
  DRIVER_WAGE, MAX_TRUCK_LEVEL, MIN_CONDITION, OwnedTruck, TruckModel,
  modelSpec, upgradeCost, wearPerKm,
} from '../types/fleet';

const PLATE_AREAS = ['61C', '29H', '51C', '43C', '65C', '15C', '92C', '77C'];
const KM_PER_SECOND = 0.7; // 1 giây mô phỏng ≈ 0.7 km

let serial = 0;

// Biển số xe công ty: mã vùng + số, sinh tăng dần để không trùng.
function companyPlate(index: number) {
  const area = PLATE_AREAS[index % PLATE_AREAS.length];
  return `${area}-${100 + ((index * 137) % 899)}.${10 + ((index * 53) % 89)}`;
}

export interface FleetState {
  trucks: OwnedTruck[];
  lastIncident: string;
  buyTruck: (model: TruckModel) => boolean;
  sellTruck: (id: string) => boolean;
  assignDriver: (truckId: string, driverId?: string) => void;
  repairTruck: (id: string) => boolean;
  upgradeTruck: (id: string) => boolean;
  dispatchTruck: (id: string, seconds: number) => boolean;
  tickFleet: (delta: number) => void;
}

export const useFleetStore = create<FleetState>((set, get) => ({
  trucks: [],
  lastIncident: '',

  buyTruck: (model) => {
    const price = modelSpec(model).price;
    const cash = useGameStore.getState().cash;
    if (cash < price) return false;
    serial += 1;
    set((state) => ({
      trucks: [...state.trucks, {
        id: `own-${serial}`,
        plate: companyPlate(serial),
        model,
        level: 1,
        condition: 100,
        odometerKm: 0,
        status: 'available',
        deliveryLeft: 0,
        tripKm: 0,
        tripFuel: 0,
      }],
    }));
    useGameStore.setState({ cash: cash - price });
    return true;
  },

  sellTruck: (id) => {
    const truck = get().trucks.find((item) => item.id === id);
    if (!truck || truck.status === 'delivering') return false;
    useGameStore.setState({ cash: useGameStore.getState().cash + modelSpec(truck.model).resale });
    set((state) => ({ trucks: state.trucks.filter((item) => item.id !== id) }));
    return true;
  },

  assignDriver: (truckId, driverId) => {
    set((state) => ({
      trucks: state.trucks.map((truck) => (truck.id === truckId ? { ...truck, driverId } : truck)),
    }));
  },

  repairTruck: (id) => {
    const truck = get().trucks.find((item) => item.id === id);
    if (!truck || truck.status === 'delivering') return false;
    const cost = modelSpec(truck.model).repair;
    const cash = useGameStore.getState().cash;
    if (cash < cost) return false;
    useGameStore.setState({ cash: cash - cost });
    set((state) => ({
      trucks: state.trucks.map((item) =>
        item.id === id ? { ...item, condition: 100, status: 'available' } : item),
    }));
    return true;
  },

  upgradeTruck: (id) => {
    const truck = get().trucks.find((item) => item.id === id);
    if (!truck || truck.status === 'delivering' || truck.level >= MAX_TRUCK_LEVEL) return false;
    const cost = upgradeCost(modelSpec(truck.model), truck.level);
    const cash = useGameStore.getState().cash;
    if (cash < cost) return false;
    useGameStore.setState({ cash: cash - cost });
    set((state) => ({
      trucks: state.trucks.map((item) => (item.id === id ? { ...item, level: item.level + 1 } : item)),
    }));
    return true;
  },

  dispatchTruck: (id, seconds) => {
    const truck = get().trucks.find((item) => item.id === id);
    if (!truck || truck.status !== 'available' || !truck.driverId || truck.condition <= MIN_CONDITION) return false;
    set((state) => ({
      trucks: state.trucks.map((item) =>
        item.id === id ? { ...item, status: 'delivering', deliveryLeft: seconds, tripKm: 0, tripFuel: 0 } : item),
    }));
    return true;
  },

  tickFleet: (delta) => {
    const speed = useGameStore.getState().gameSpeed;
    if (speed === 0) return;
    const step = delta * speed;
    const trucks = get().trucks;
    if (!trucks.some((truck) => truck.status === 'delivering')) return;

    let spent = 0;
    let incident = '';
    const next = trucks.map((truck) => {
      if (truck.status !== 'delivering') return truck;
      const spec = modelSpec(truck.model);
      const km = step * KM_PER_SECOND;
      const condition = Math.max(0, truck.condition - km * wearPerKm(truck.level));
      const odometerKm = truck.odometerKm + km;
      const tripKm = truck.tripKm + km;
      const tripFuel = truck.tripFuel + (km / 100) * spec.fuelPer100km;

      // Sự cố dọc đường: xe càng cũ, càng chưa nâng cấp thì càng dễ gặp.
      const risk = spec.accidentRisk * (1 + (100 - condition) / 120) * (1 - (truck.level - 1) * 0.3);
      if (Math.random() < risk * km) {
        incident = `Xe ${truck.plate} gặp sự cố trên đường, phải đưa vào xưởng.`;
        return {
          ...truck, condition: Math.max(0, condition - 30), odometerKm,
          tripKm: 0, tripFuel: 0, deliveryLeft: 0, status: 'maintenance' as const,
        };
      }

      const deliveryLeft = truck.deliveryLeft - step;
      if (deliveryLeft > 0) return { ...truck, condition, odometerKm, tripKm, tripFuel, deliveryLeft };

      // Về bãi: thanh toán chuyến = dầu + lương tài xế + bảo hiểm.
      spent += tripFuel + DRIVER_WAGE + spec.insurance;
      const needsRepair = condition <= MIN_CONDITION;
      return {
        ...truck, condition, odometerKm, tripKm: 0, tripFuel: 0, deliveryLeft: 0,
        status: needsRepair ? 'maintenance' as const : 'available' as const,
      };
    });

    set({ trucks: next, ...(incident ? { lastIncident: incident } : {}) });
    if (spent > 0) {
      useGameStore.setState((state) => ({
        cash: Math.max(0, state.cash - spent),
        fleetOperatingCost: state.fleetOperatingCost + spent,
      }));
    }
  },
}));
