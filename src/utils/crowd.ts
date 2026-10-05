// Lightweight crowd separation so the crew keeps a gap from one another
// instead of walking straight through each other.
export interface CrowdPoint {
  id: string;
  x: number;
  z: number;
}

export const WORKER_GAP = 1.05;

export function separateWorker(x: number, z: number, others: Iterable<CrowdPoint>, gap = WORKER_GAP) {
  let outX = x;
  let outZ = z;
  for (const other of others) {
    const dx = outX - other.x;
    const dz = outZ - other.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0.0001 && dist < gap) {
      const push = ((gap - dist) / dist) * 0.5;
      outX += dx * push;
      outZ += dz * push;
    }
  }
  return { x: outX, z: outZ };
}
