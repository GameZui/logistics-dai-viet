import { create } from 'zustand';
import { useGameStore } from './useGameStore';
import { MIN_CONDITION, OwnedTruck, TRUCK_MODELS, TruckModel } from '../types/fleet';

const PLATE_AREAS = ['61C', '29H', '51C', '43C', '65C', '15C', '92C', '77C'];
const WEAR_PER_SECOND = 0.6; // độ hao mòn mỗi giây khi đang chạy
const KM_PER_SECOND = 0.7; // số km tích luỹ mỗi giây khi đang chạy

let serial = 0;

const spec = (model: TruckModel) => TRUCK_MODELS.find((item) => item.id === model) ?? TRUCK_MODELS[0];

// Biển số xe công ty: mã vùng + số, sinh tăng dần để không trùng.
function companyPlate(index: number) {
  const area = PLATE_AREAS[index % PLATE_AREAS.length];
  const digits = 100 + ((index * 137) % 899);
  const sub = 10 + ((index * 53) % 89);
  return `${area}-${digits}.${sub}`;
}

export interface FleetState {
  trucks: OwnedTruck[];
  buyTruck: (model: TruckModel) => boolean;
  sellTruck: (id: string) => boolean;
  assignDriver: (truckId: string, driverId?: string) => void;
  repairTruck: (id: string) => boolean;
  dispatchTruck: (id: string, seconds: number) => boolean;
  tickFleet: (delta: number) => void;
}

export const useFleetStore = create<FleetState>((set, get) => ({
  trucks: [],

  buyTruck: (model) => {
    const price = spec(model).price;
    const cash = useGameStore.getState().cash;
    if (cash < price) return false;
    serial += 1;
    const truck: OwnedTruck = {
      id: `own-${serial}`,
      plate: companyPlate(serial),
      model,
      condition: 100,
      odometerKm: 0,
      status: 'available',
      deliveryLeft: 0,
    };
    useGameStore.setState({ cash: cash - price });
    set((state) => ({ trucks: [...state.trucks, truck] }));
    return true;
  },

  sellTruck: (id) => {
    const truck = get().trucks.find((item) => item.id === id);
    if (!truck || truck.status === 'delivering') return false;
    useGameStore.setState({ cash: useGameStore.getState().cash + spec(truck.model).resale });
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
    const cost = spec(truck.model).repair;
    const cash = useGameStore.getState().cash;
    if (cash < cost) return false;
    useGameStore.setState({ cash: cash - cost });
    set((state) => ({
      trucks: state.trucks.map((item) =>
        item.id === id ? { ...item, condition: 100, status: 'available' } : item),
    }));
    return true;
  },

  dispatchTruck: (id, seconds) => {
    const truck = get().trucks.find((item) => item.id === id);
    if (!truck || truck.status !== 'available' || !truck.driverId || truck.condition <= MIN_CONDITION) return false;
    set((state) => ({
      trucks: state.trucks.map((item) =>
        item.id === id ? { ...item, status: 'delivering', deliveryLeft: seconds } : item),
    }));
    return true;
  },

  tickFleet: (delta) => {
    if (useGameStore.getState().gameSpeed === 0) return;
    const step = delta * useGameStore.getState().gameSpeed;
    set((state) => {
      if (!state.trucks.some((truck) => truck.status === 'delivering')) return state;
      const trucks = state.trucks.map((truck) => {
        if (truck.status !== 'delivering') return truck;
        const condition = Math.max(0, truck.condition - step * WEAR_PER_SECOND);
        const odometerKm = truck.odometerKm + step * KM_PER_SECOND;
        const deliveryLeft = truck.deliveryLeft - step;
        if (deliveryLeft > 0) return { ...truck, condition, odometerKm, deliveryLeft };
        // Về bãi: xe tụt dưới ngưỡng an toàn thì phải vào xưởng bảo dưỡng.
        const needsRepair = condition <= MIN_CONDITION;
        return { ...truck, condition, odometerKm, deliveryLeft: 0, status: needsRepair ? 'maintenance' as const : 'available' as const };
      });
      return { trucks };
    });
  },
}));
