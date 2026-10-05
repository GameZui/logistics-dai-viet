import { create } from 'zustand';
import { useGameStore } from './useGameStore';
import { ROUTES, MapRoute } from '../utils/vietnamMap';

// Đội xe đường dài của Đại Việt Logistics: mỗi xe đi vòng liên tục trên mạng
// quốc lộ, luôn hướng về kho địa phương, tới kho thì dỡ hàng rồi đi tiếp —
// không teleport và không sinh/xoá xe giữa chừng.
export interface MapTruck {
  id: string;
  plate: string;
  cargo: string;
  from: string;
  to: string;
  progress: number; // 0 -> 1 along the current leg
  distanceKm: number;
  speedKmh: number;
  status: 'in_transit' | 'loading';
  dwell: number; // seconds left while unloading at a warehouse
}

const CARGO = ['Gạo', 'Cà phê', 'Thủy sản', 'Linh kiện', 'Dệt may', 'Trái cây'];
const PLATE_PREFIX = ['51C', '29H', '43C', '65C', '15C', '92C'];
const FLEET_SIZE = 6;
const HOURS_PER_SECOND = 0.1;
const DWELL_SECONDS = 5;

// Kho địa phương của công ty — xe luôn chạy hướng về các điểm này.
const HUB_NODES = ['binh-duong', 'can-tho', 'hai-phong'];

const EDGES = new Map<string, MapRoute[]>();
for (const route of ROUTES) {
  for (const node of [route.from, route.to]) {
    const list = EDGES.get(node) ?? [];
    list.push(route);
    EDGES.set(node, list);
  }
}

const neighbours = (node: string) =>
  (EDGES.get(node) ?? []).map((route) => ({ route, next: route.from === node ? route.to : route.from }));

// Số chặng ngắn nhất tới kho gần nhất, để xe chảy về phía kho.
const HOPS_TO_HUB = new Map<string, number>();
{
  const queue = [...HUB_NODES];
  for (const hub of HUB_NODES) HOPS_TO_HUB.set(hub, 0);
  while (queue.length) {
    const node = queue.shift() as string;
    const hops = HOPS_TO_HUB.get(node) ?? 0;
    for (const { next } of neighbours(node)) {
      if (!HOPS_TO_HUB.has(next)) {
        HOPS_TO_HUB.set(next, hops + 1);
        queue.push(next);
      }
    }
  }
}

let serial = 0;
const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
const randomPlate = () => `${pick(PLATE_PREFIX)}-${100 + Math.floor(Math.random() * 899)}.${String(10 + Math.floor(Math.random() * 89))}`;

// Chọn chặng kế tiếp: ưu tiên hướng về kho, không quay đầu, không nhảy cóc.
function nextLeg(from: string, cameFrom?: string) {
  const all = neighbours(from);
  const forward = all.filter((option) => option.next !== cameFrom);
  const pool = forward.length ? forward : all;
  const towardHub = pool.filter((option) => (HOPS_TO_HUB.get(option.next) ?? 99) < (HOPS_TO_HUB.get(from) ?? 99));
  const chosen = towardHub.length && Math.random() > 0.3 ? pick(towardHub) : pick(pool);
  return { route: chosen.route, to: chosen.next };
}

function newTruck(from: string): MapTruck {
  const { route, to } = nextLeg(from);
  serial += 1;
  return {
    id: `mt-${serial}`,
    plate: randomPlate(),
    cargo: pick(CARGO),
    from,
    to,
    progress: 0,
    distanceKm: route.distanceKm,
    speedKmh: 45 + Math.round(Math.random() * 25),
    status: 'in_transit',
    dwell: 0,
  };
}

// Điểm xuất phát của đoàn xe ban đầu (các kho và lân cận).
const START_NODES = [
  ...HUB_NODES,
  ...neighbours('binh-duong').map((option) => option.next),
  ...neighbours('can-tho').map((option) => option.next),
  ...neighbours('hai-phong').map((option) => option.next),
];

interface LogisticsState {
  trucks: MapTruck[];
  spawnShipment: (from: string, to: string, cargo?: string) => void;
  tickMap: (delta: number) => void;
}

export const useLogisticsStore = create<LogisticsState>((set) => ({
  trucks: Array.from({ length: FLEET_SIZE }, (_, index) => {
    const truck = newTruck(START_NODES[index % START_NODES.length]);
    // Trải đều đoàn xe ban đầu dọc tuyến (chỉ áp dụng cho trạng thái khởi tạo).
    truck.progress = (index * 0.31) % 0.9;
    return truck;
  }),

  spawnShipment: (from, to, cargo) => {
    const route = ROUTES.find(
      (item) => (item.from === from && item.to === to) || (item.from === to && item.to === from),
    );
    serial += 1;
    const truck: MapTruck = {
      id: `mt-${serial}`,
      plate: randomPlate(),
      cargo: cargo ?? pick(CARGO),
      from,
      to,
      progress: 0,
      distanceKm: route?.distanceKm ?? 320,
      speedKmh: 52,
      status: 'in_transit',
      dwell: 0,
    };
    set((state) => ({ trucks: [...state.trucks, truck] }));
  },

  tickMap: (delta) => {
    if (useGameStore.getState().gameSpeed === 0) return;
    const step = delta * useGameStore.getState().gameSpeed;
    set((state) => ({
      trucks: state.trucks.map((truck) => {
        if (truck.status === 'loading') {
          const dwell = truck.dwell - step;
          if (dwell > 0) return { ...truck, dwell };
          // Rời kho trên chặng mới, bắt đầu đúng tại kho vừa dỡ (giữ nguyên id/biển số).
          const leg = nextLeg(truck.to, truck.from);
          return {
            ...truck,
            from: truck.to,
            to: leg.to,
            progress: 0,
            distanceKm: leg.route.distanceKm,
            speedKmh: 45 + Math.round(Math.random() * 25),
            cargo: pick(CARGO),
            status: 'in_transit' as const,
            dwell: 0,
          };
        }
        const progress = truck.progress + (step * HOURS_PER_SECOND * truck.speedKmh) / truck.distanceKm;
        if (progress < 1) return { ...truck, progress };
        // Tới kho: dỡ hàng tại chỗ trước khi nhận chặng mới.
        return { ...truck, progress: 1, status: 'loading' as const, dwell: DWELL_SECONDS };
      }),
    }));
  },
}));
