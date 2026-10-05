export type TruckModel = 'tarpaulin' | 'container' | 'reefer';

export interface TruckModelSpec {
  id: TruckModel;
  label: string;
  art: string;
  price: number;
  resale: number;
  repair: number;
  pallets: number;
  cargo: string;
  fuelPer100km: number; // tiền dầu mỗi 100km
  insurance: number; // bảo hiểm thu mỗi chuyến
  accidentRisk: number; // xác suất sự cố mỗi km
}

// Đội xe của công ty: mua xe, gán tài xế, nâng cấp, chạy hao mòn rồi phải sửa.
export const TRUCK_MODELS: TruckModelSpec[] = [
  { id: 'tarpaulin', label: 'Xe mui bạt', art: 'truck-vietnam', price: 38000, resale: 22000, repair: 6000, pallets: 8, cargo: 'Nông sản', fuelPer100km: 440, insurance: 500, accidentRisk: 0.00028 },
  { id: 'container', label: 'Xe container', art: 'truck-container', price: 56000, resale: 33000, repair: 9000, pallets: 12, cargo: 'Hàng khô', fuelPer100km: 640, insurance: 800, accidentRisk: 0.00022 },
  { id: 'reefer', label: 'Xe đông lạnh', art: 'truck-reefer', price: 72000, resale: 43000, repair: 12000, pallets: 10, cargo: 'Hàng lạnh', fuelPer100km: 760, insurance: 1100, accidentRisk: 0.00026 },
];

export const MIN_CONDITION = 15;
export const MAX_TRUCK_LEVEL = 3;
export const DRIVER_WAGE = 260; // lương tài xế mỗi chuyến
export const UPGRADE_RATIO = 0.35; // giá nâng cấp so với giá xe

export const modelSpec = (model: TruckModel) => TRUCK_MODELS.find((item) => item.id === model) ?? TRUCK_MODELS[0];

// Xe càng nâng cấp càng ít hao mòn (độ hao mòn mỗi km theo cấp).
const WEAR_PER_KM = [0.85, 0.6, 0.4];
export const wearPerKm = (level: number) => WEAR_PER_KM[Math.max(0, Math.min(WEAR_PER_KM.length - 1, level - 1))];
export const upgradeCost = (spec: TruckModelSpec, level: number) => Math.round(spec.price * UPGRADE_RATIO * level);

export interface OwnedTruck {
  id: string;
  plate: string;
  model: TruckModel;
  driverId?: string;
  level: number; // 1..3
  condition: number; // 0..100 — sức khoẻ xe
  odometerKm: number;
  status: 'available' | 'delivering' | 'maintenance';
  deliveryLeft: number; // giây còn lại của chuyến đang chạy
  tripKm: number; // km tích luỹ của chuyến đang chạy
  tripFuel: number; // tiền dầu tích luỹ của chuyến đang chạy
}
