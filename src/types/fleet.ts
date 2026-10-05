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
}

// Đội xe của công ty: mua xe, gán tài xế, chạy hao mòn rồi phải sửa.
export const TRUCK_MODELS: TruckModelSpec[] = [
  { id: 'tarpaulin', label: 'Xe mui bạt', art: 'truck-vietnam', price: 38000, resale: 22000, repair: 6000, pallets: 8, cargo: 'Nông sản' },
  { id: 'container', label: 'Xe container', art: 'truck-container', price: 56000, resale: 33000, repair: 9000, pallets: 12, cargo: 'Hàng khô' },
  { id: 'reefer', label: 'Xe đông lạnh', art: 'truck-reefer', price: 72000, resale: 43000, repair: 12000, pallets: 10, cargo: 'Hàng lạnh' },
];

export interface OwnedTruck {
  id: string;
  plate: string;
  model: TruckModel;
  driverId?: string;
  condition: number; // 0..100 — sức khoẻ xe
  odometerKm: number;
  status: 'available' | 'delivering' | 'maintenance';
  deliveryLeft: number; // giây còn lại của chuyến đang chạy
}

export const MIN_CONDITION = 15;
