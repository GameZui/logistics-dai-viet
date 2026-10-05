import { TruckStatus } from '../types/game';

// All vehicles use the same world coordinates as the dock facade (z = -4).
export const ARRIVAL_SECONDS = 14;
export const DOCK_SECONDS = 6;
export const DEPARTURE_SECONDS = 16;
export const PALLET_SECONDS = 8;

export function truckPose(status: TruckStatus, time: number, dockX: number, queueIndex = 0) {
  if (status === 'en_route') return { x: -42 - queueIndex * 12, z: 6, angle: Math.PI / 2 };
  if (status === 'unloading') return { x: dockX, z: 0.6, angle: 0 };
  if (status === 'docking' && time >= ARRIVAL_SECONDS) {
    const t = Math.min(1, (time - ARRIVAL_SECONDS) / DOCK_SECONDS);
    const eased = t * t * (3 - 2 * t);
    return { x: dockX, z: 14 - 13.4 * eased, angle: 0 };
  }
  if (status === 'docking') {
    const t = Math.min(1, time / ARRIVAL_SECONDS);
    if (t < 0.65) return { x: -42 - queueIndex * 12 + (dockX + 34 + queueIndex * 12) * t / 0.65, z: 6, angle: Math.PI / 2 };
    const a = (t - 0.65) / 0.35 * Math.PI / 2;
    return { x: dockX - 8 + 8 * Math.sin(a), z: 6 + 8 * (1 - Math.cos(a)), angle: Math.PI / 2 - a };
  }
  const t = Math.min(1, time / DEPARTURE_SECONDS);
  if (t < 0.35) return { x: dockX, z: 0.6 + 5.4 * t / 0.35, angle: 0 };
  if (t < 0.7) {
    const a = (t - 0.35) / 0.35 * Math.PI / 2;
    return { x: dockX + 8 - 8 * Math.cos(a), z: 6 + 8 * Math.sin(a), angle: a };
  }
  return { x: dockX + 8 + (48 - dockX - 8) * (t - 0.7) / 0.3, z: 14, angle: Math.PI / 2 };
}

export function forkliftPose(time: number, dockX: number) {
  const phase = Math.min(PALLET_SECONDS, Math.max(0, time));
  // Approach the rear from inside the warehouse, lift, reverse, and lower at staging.
  const travel = phase < 3 ? phase / 3 : phase < 4 ? 1 : phase < 7 ? 1 - (phase - 4) / 3 : 0;
  const eased = travel * travel * (3 - 2 * travel);
  return {
    x: dockX + 2.65 * (1 - eased), z: -10 + 4.2 * eased,
    angle: Math.atan2(-2.65, 4.2),
    lift: phase < 3 ? 0 : phase < 4 ? (phase - 3) * 0.45 : phase < 7 ? 0.45 : 0.45 - (phase - 7) * 0.9,
    carrying: phase >= 3 && phase < 8,
  };
}
