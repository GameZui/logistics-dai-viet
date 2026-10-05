import { describe, expect, it } from 'vitest';
import { separateWorker, WORKER_GAP } from '../utils/crowd';

describe('crew separation', () => {
  it('pushes two overlapping workers apart without overshooting the gap', () => {
    const before = Math.hypot(0 - 0.2, 0);
    const settled = separateWorker(0, 0, [{ id: 'b', x: 0.2, z: 0 }]);
    const after = Math.hypot(settled.x - 0.2, settled.z);
    expect(after).toBeGreaterThan(before);
    expect(after).toBeLessThanOrEqual(WORKER_GAP + 0.0001);
  });

  it('leaves workers untouched when they are already far enough apart', () => {
    expect(separateWorker(0, 0, [{ id: 'b', x: 4, z: 0 }])).toEqual({ x: 0, z: 0 });
  });

  it('handles exactly overlapping workers without throwing', () => {
    expect(separateWorker(1, 1, [{ id: 'b', x: 1, z: 1 }])).toEqual({ x: 1, z: 1 });
  });
});
